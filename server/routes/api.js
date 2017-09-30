var express = require('express');
var router = express.Router();
var Promise=require('bluebird');
var pug=require('pug');
var proModel = require('../models/proModel');
var mongoose = require('mongoose');
var moment = require('moment')
var multiparty = require('multiparty');
var fs = require('fs');
var path = require('path');
var debuglog = require('../middlewares/log4js').debuglog(); //开发调试用
var logger = require('../middlewares/log4js').logger(); //运行日志
var ziphandler = require('../middlewares/ziphandler');
var decompress = require('decompress');
/*
新建项目API POST /project
 */
router.post('/project', function(req, res, next) {
    if (!req.body.proName || !req.body.proDescription) {
        return res.send({
            message: "请确认信息！"
        })
    }
    var proData = {
        //这里的req.body后面的字段名，对应着前端的input name属性
        proName: req.body.proName,
        proDescription: req.body.proDescription,
        proDate: Date.now(),
    }
    var project = new proModel(
        proData
    )
    project.save(function(err) {
        if (err) {
            logger.error(err)
            next(err)
            return;
        }
        res.redirect('back')
    })
})

/*
上传文件API POST /upload
 */
var culturalList = [];
router.post('/upload', function(req, res, next) {
    var form = new multiparty.Form({
        uploadDir: './.temp/'
    });
    form.parse(req, function(err, fields, files) {
        if (err) {
            logger.error(err)
            next(err)
            return;
        }
        var file = files.model[0]; //取得文件
        var realPath = form.uploadDir + file.originalFilename //文件真实名字
        fs.renameSync(file.path, realPath); //同步重命名文件
        /*
这里通过filter筛选有问题，因为他解压时会遍历所有的文件和文件夹，在这里不适用。把筛选和处理放在最后的回调里比较好
         */
        ziphandler.decompress({
            input: realPath,
            output: './dist',

        }, function(filelist) {
            var culturalCount = filelist.length
            proModel.update({
                    _id: mongoose.Types.ObjectId(req.session.project)
                }, {
                    $addToSet: {
                        'proCulturals': {
                            '$each': filelist
                        }
                    },
                    '$inc': {
                        'culturalCount': culturalCount
                    }
                }, function(err) {
                    if (err)
                        next(err)
                })
                // culturalList = [];//每次都要清空，否则会导致数据累加
            logger.debug('back')
            res.send('success')
                // debuglog.debug(culturalList)
        })

    })

})



//发布数据处理
router.post('/publish',function (req,res,next) {
    var _id=req.session.project;
    var sid=req.body.id;
    Promise.promisifyAll(proModel);   //调用bluebird中的promise对象（当然是用es6的promise也可以）
    var mod=proModel.findById(
        {_id:_id},
        {proCulturals:
            {'$elemMatch':{_id:sid}}
        },function (err,doc) {

            if(err){
                logger.error(err);
            }
            // debuglog.debug(doc);
            var next=doc.proCulturals[0].isPublish;
            var data={};
            data.path=doc.proCulturals[0].filePath;
            data.title=doc.proCulturals[0].pageTitle;
            var pagename=doc.proCulturals[0].pageName;
            var fn=pug.compileFile('./views/template.pug',{pretty:true});
            var html=fn({data:data});
            fs.writeFileSync(path.join('./dist', pagename+'.html'),html,{encoding:'utf8'},function (err) {
                if(err){logger.error(err);}
            });
             Promise.resolve(next);
        }).then(function (next) {
           return proModel.update({
                _id: _id,
                'proCulturals._id': sid
            }, {
                '$set': {
                    'proCulturals.$.isPublish': true
                }
            });
         Promise.resolve(next);
        }).then(function (next) {
            debuglog.debug(next);
            if(next=='true'){
               return  Promise.reject();
            }
            return proModel.update({
                _id: _id
            }, {
                '$inc': {
                    'publishedCount': +1
                }
            });
        }).catch(function(e) {
            console.error(e.stack);
        });
})

//删除文物路由
router.post('/delete', function(req, res, next) {
    var id = req.body.id;
    proModel.update({
        _id: req.session.project
    }, {
        '$pull': {
            'proCulturals': {
                _id: id
            }
        },
        '$inc': {
            'culturalCount': -1
        }
    }, function(err, mes) {
        if (err) {
            logger.error(err);
            next(err);
        }
        logger.error(mes);
        res.end('delete');
    })

})

//删除项目路由
router.post('/deleteProject', function(req, res, next){
    var id = req.body.id;
    proModel.remove({
        "proName": id
    }, function(err, mes) {
        if (err) {
            logger.error(err);
            next(err);
        }
        logger.error(mes);
        res.send('正确删除项目');
    })

})

//编辑文物页面操作路由
router.post('/culturalUp', function(req, res, next) {
    var editId = req.body.id;
    var title = req.body.pageTitle;
    var name = req.body.pageName;
    proModel.update({
        _id: req.session.project,
        'proCulturals._id': editId
    }, {
        '$set': {
            'proCulturals.$.pageName': name,
            'proCulturals.$.pageTitle': title
        }
    }, function(err, mes) {
        if (err) {
            logger.error(err);
            next();
        }
        logger.error(mes);
    });
})

module.exports = router;
