var express = require('express');
var app = require('../../app');
var router = express.Router();
var config = require('../../lib/config');
var proModel = require('../models/proModel');
var pageQuery = require('../middlewares/pageQuery');
var log4js = require('../middlewares/log4js');
var logger = log4js.logger()
var debuglog = log4js.debuglog();
/*
主页路由 GET /
 */
router.get('/', function(req, res, next) {
    var page = req.query.page ? parseInt(req.query.page) : 1;
    pageQuery(page, function(err, data) {
        if (err) {
            next(err);
            return;
        }
        debuglog.debug(data);
        res.render('index', {
            title: '数文科技三维展示平台',
            page: page,
            pages: data.pages,
            content: data.content,
            count: data.count,
            isFirstpage: (page - 1) == 0,
            isLastage: page * 9 >= data.count
        });

    });
});

/*
上传页面路由 GET /upload/:project
 */
router.get('/upload/:project', function(req, res, next) {
    var project = req.params.project;
    if (project) req.session.project = project;
    var page = req.query.page ? parseInt(req.query.page) : 1; //查询页
    proModel.findById({
        _id: req.session.project
    }).then(function(docs) {
        if (docs) {
            var pageSys = {
                isFirstpage: (page - 1) == 0, //首页
                isLastage: page * 16 >= docs.proCulturals.length, //尾页
                page: page, //查询的页面
                limit: 16,  //每页条数
                count: docs.proCulturals.length   //数据条数
            };
            pageSys.pages = Math.ceil(docs.proCulturals.length / pageSys.limit); //总页数
            pageSys.page = Math.min(pageSys.pages, pageSys.page) || 1;
            var data = [];
            var length = (pageSys.page) * pageSys.limit > pageSys.count ? pageSys.count : (pageSys.page) * pageSys.limit;
            for (var i = 0 + (pageSys.page - 1) * pageSys.limit; i < length; i++) {
                var doc = {};
                doc.fileName = docs.proCulturals[i].fileName;
                doc._id = docs.proCulturals[i]._id;
                doc.isPublish = docs.proCulturals[i].isPublish;
                data.push(doc);
            }
            res.render('upload', {
                data: data,
                pageSys: pageSys
            });
        } else {
            res.render('upload')
        }
    }).catch(function(err) {
        logger.error(err);
        next(err)
    })
})
//修改路由
router.get('/editor/:cultural', function(req, res, next) {
    var _id = req.params.cultural;
    proModel.findById({
        _id: req.session.project || "59c8dd7f37d5982674fcd672"
    }, {
        proCulturals: {
            '$elemMatch': {
                _id: _id
            }
        }
    }, function(err, doc) {
        if (err) {
            logger.error(err);
            next();
        }
        debuglog.debug(doc);
        var publish={};
        publish._id=_id;
        publish.path=doc.proCulturals[0].filePath;
        publish.name=doc.proCulturals[0].fileName;
        res.render('editor', {publish:publish})
    })
})

//删除项目路由
router.post('/deleteProject', function(req, res, next){
    var id = req.body.id;
    proModel.remove({
        _id: req.session.project
    }, function(err, mes) {
        if (err) {
            logger.error(err);
            next(err);
        }
        logger.error(mes);
        res.end();
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
