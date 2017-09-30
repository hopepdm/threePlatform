#ThreePlatform
文件操作逻辑

上传压缩文件（大包）->.temp->解压到dist/proname(项目汉字拼音)->文物编辑界面的路径dist/proname/model/objfile/obj(设置了dist为静态文件目录),在页面需要加上proname/model/->
发布 /html文件生成到dist/proname/下,与model同级



### 启动：

`gulp`命令  ：启动node服务（自刷新），less编译，浏览器自刷新 （自刷新有问题，还是手动吧）

`nodemon app`:只启动node服务器（自刷新）

```javascript
// 配置文件

module.exports = {
    db: {
        url: 'mongodb://localhost/',//mongodb 地址
        port: '27017',//端口
        database: 'threePlatform'//数据库名称
    },
    app: {
        port: 3000//  node服务器端口号,自刷新服务也设置了代理（8080）,所以两个端口都可以访问
    }
};

```