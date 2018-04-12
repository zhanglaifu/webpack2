require('./check-versions')()  //检查nodeJS和npm的版本

//获取基本配置
var config = require('../config') 
//如果node的环境变量中没有设置当前的是开发环境还是生产环境(NODE_ENV) 则使用config中的dev环境配置作为当前的环境开发环境
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}
//opn是一个可以用来调用默认软件打开网址，图片文件等内容的插件
//这里用它来调用默认浏览器打开dev-server监听的端口例如：localhost:8080
var opn = require('opn')
var path = require('path')
var express = require('express')
var webpack = require('webpack')
//使用该插件可以将前端开发中涉及到的请求代理到提供服务的后台服务器上，方便与服务器对接。
var proxyMiddleware = require('http-proxy-middleware')
//开发环境下的webpack配置
var webpackConfig = require('./webpack.dev.conf')
var axios = require("axios")

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
//用来判断是否要自动打开浏览器的布尔变量，当配置文件中没有设置自动打开浏览器的时候其值为false
var autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
//http代理表 ，指定规则，将某些api请求代理到相应的服务器
var proxyTable = config.dev.proxyTable
//创建express服务器
var app = express()

//利用express服务器进行一个代理请求。
var apiRoutes = express.Router()
apiRoutes.get("/getDiscList",function(req,res){
	var url = "https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg"
	axios.get(url,{
		headers:{
			referer:"https://c.y.qq.com/",
			host:'c.y.qq.com'
		},
		params:req.query
	}).then( (response) => {
		res.json(response.data)
	}).catch( (e) => {
		console.log(e)
	})
})

apiRoutes.get('/lyric', function (req, res) {
  var url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'

  axios.get(url, {
    headers: {
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    },
    params: req.query
  }).then((response) => {
    var ret = response.data
    if (typeof ret === 'string') {
      var reg = /^\w+\(({[^()]+})\)$/
      var matches = ret.match(reg)
      if (matches) {
        ret = JSON.parse(matches[1])
      }
    }
    res.json(ret)
  }).catch((e) => {
    console.log(e)
  })
})

apiRoutes.get('/songList',function(req,res) {
	var url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
	axios.get(url,{
		headers:{
			referer: 'https://c.y.qq.com/',
			host:'c.y.qq.com'
		},
		params:req.query
	}).then( (response) => {
		var ret = response.data
		if(typeof ret === "string"){
			var reg = /^\w+\(({.+})\)$/
			var matches = ret.match(reg)
			if(matches){
				ret = JSON.parse(matches[1])
			}
		}
		res.json(ret)
	}).catch( (e) => {
		console.log(e)
	})
})
app.use('/api',apiRoutes)
//webpack根据配置开始编译打包源码并返回compiler对象
var compiler = webpack(webpackConfig)

//webpack-dev-middleware将webpack编译打包后得到的产品文件存放在内存中而没有写进磁盘
//将这个中间件挂到express上使用之后即可提供这些编译后的产品文件服务
var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,  //设置访问路径为webpack配置中的output所对应的文件
  quiet: true  //设置为true让其不要在控制台输出日志。
})

//webpack-hot-middleware用于实现热重载功能的中间件。
var hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => {}
})
// force page reload when html-webpack-plugin template changes
//webpack编译打包完成后并将jscss等文件inject到html文件之后，通过热重载中间件强制页面刷新。
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// proxy api requests
//根据proxyTable中的代理请求配置来设置express服务器的http代理规则。
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
//重定向不存在的url 用于支持spa（单页应用） 例如使用vue-router并开启了history模式。
app.use(require('connect-history-api-fallback')())

//挂载webpack-dev-middleware中间件，提供webpack编译打包后的产品文件服务
// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

//访问链接
var uri = 'http://localhost:' + port

//创建promise在应用服务启动之后resolve
//便于外部文件require了这个dev-server之后的代码编写
var _resolve
var readyPromise = new Promise(resolve => {
  _resolve = resolve
})

console.log('> Starting dev server...')
//webpack-dev-middleware等待webpack完成所有编译打包之后输出提示语到控制台辨明服务正式启动
//服务正式启动才自动打开浏览器进入页面
devMiddleware.waitUntilValid(() => {
  console.log('> Listening at ' + uri + '\n')
  // when env is testing, don't need open it
  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    opn(uri)
  }
  _resolve()
})

//启动express服务器并监听相应的端口
var server = app.listen(port)

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}

//dev-server不执行逻辑只是做的就是启动关闭服务器，本身就是一个搭建的一个小型服务器
