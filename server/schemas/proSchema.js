var mongoose = require('mongoose');

var proSchema = new mongoose.Schema({
    proName: String, //项目名称
    proNameEn:String,//项目名称拼音
    proDescription: { type: String, default: '' }, //项目介绍
    proDate: Date, //项目创建日期
    culturalUploadPath: String, //文物上传
    proUploadPath: String, //项目上传文件夹
    proDestPath: String, //项目打包生成文件夹
    culturalCount: { type: Number, default: 0 }, //模型数量
    publishedCount: { type: Number, default: 0 },
    proCulturals: [{
        culturalName: String, //文物名
        isPublish: { type: Boolean, default: false }, //是否已发布
        pageTitle: { type: String, default: '三维文物展示' }, //页面title
        pageName: { type: String, default: 'index' }, //页面文件名
        fileName: String, //文物文件名
        fileExt: String, //模型文件后缀 {obj,js}
        filePath: String, //文件路径
        culturalInfo: {
            minFov: { type: Number, default: 0.1 }, //最小缩放参数
            maxFov: { type: Number, default: 0.1 }, //最大缩放参数
            zoomSpeed: { type: Number, default: 0.1 }, //缩放速度参数
            moveSpeed: { type: Number, default: 0.1 }, //移动速度参数
            rotateSpeed: { type: Number, default: 0.1 }, //旋转速度参数
            position: { //模型位置
                x: { type: Number, default: 0.1 },
                y: { type: Number, default: 0.1 },
                z: { type: Number, default: 0.1 }
            },
            rotation: { //模型角度
                x: { type: Number, default: 0.1 },
                y: { type: Number, default: 0.1 },
                z: { type: Number, default: 0.1 }
            }
        },
        culturalMaterial: {
            ambientColor: { type: String, default: '#ffffff' }, //环境光眼色
            diffuseColor: { type: String, default: '#ffffff' }, //固有颜色
            specularColor: { type: String, default: '#ffffff' }, //反射颜色
            opacity: { type: Number, default: 0.1 }, //透明度
            specularity: { type: Number, default: 0.1 }, //fanshelv
            reflection: { type: Number, default: 0.1 } //zheshelv
        },
        culturalLight: [{
            lightType: String, //灯光类型{环境光，平行光,点光源}
            intensity: { type: Number, default: 0.1 }, //灯光强度
            color: { type: String, default: '#ffffff' }, //灯管颜色
            position: { //灯光位置
                x: { type: Number, default: 0.1 },
                y: { type: Number, default: 0.1 },
                z: { type: Number, default: 0.1 }
            }
        }]


    }]
})

module.exports = proSchema;
