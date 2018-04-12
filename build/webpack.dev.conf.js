//1.将webpakck的热重载客户端代码添加到每个entry对应的应用
//2.合并基础的webpack配置
//3.配置样式文件的处理规则styleloaders
//4.配置source Maps
//5.配置webpack插件
var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
//webpack-merge是一个可以合并数组和对象的插件。
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')  //base.conf是基本的配置就是入口出口以及路由匹配的规则。
//html-webpack-plugin用于将webpack编译打包后的产品文件注入到html模板中
//即自动在index.html里面加上link和script标签引用webpack打包后的文件。
var HtmlWebpackPlugin = require('html-webpack-plugin')
//用于更友好地输出webpack的警告。错误等信息。
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

//每一个入口页面加上dev-client，用于跟dev-server的热重载插件通信，实现热更新
// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
})

module.exports = merge(baseWebpackConfig, {
	//利用merge插件将对象混入到webpack.base.conf.js中去
  module: {
  	//样式文件的处理规则，对css、sass、scss等不同内容使用形影的styleLoaders
  	//由utils配置出各种类型的预处理语言所需要使用的loader例如sass需要使用sass-loader
  	
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: '#cheap-module-eval-source-map',
  
  //webpack插件
  plugins: [
    new webpack.DefinePlugin({
      'process.env': config.dev.env
    }),
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    //开启webpack热更新功能
    new webpack.HotModuleReplacementPlugin(),
    
    //webpack编译过程中出错的时候跳过报错阶段不会阻塞编译，在编译结束后报错
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    
    //自动将依赖注入html模板，并输出最终的html文件到目标文件夹。
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    new FriendlyErrorsPlugin()
  ]
})

//webpack.dev.conf.js主要是用来配置开发的环境通过html-plugin将依赖注入到html中最后输出到目标文件夹
//通过merge将开发时用的rule，plugin混入到base.config.js中去
//为entry接口提供热更新与服务器通信
