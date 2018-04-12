//1.配置webpack编译入口
//2.配置webpack输出路径和命名规则
//3.配置模块resolve规则
//4.配置不同类型模块的处理规则。
var path = require('path')
var utils = require('./utils')
var config = require('../config')
var vueLoaderConfig = require('./vue-loader.conf')

//获得绝对路径
function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  entry: {
    app: './src/main.js'
  },
  output: {
  	//webpack输出的目标文件夹名称
    path: config.build.assetsRoot,  //默认是dist
    //webpack输出bundle文件命名格式
    filename: '[name].js',
    //webpack编译输出的发布路径
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath   //发布路径  根据config来配置
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    
    //别名，方便引用模块
    alias: {
      '@': resolve('src'),
      'common': resolve('src/common'),
      'components':resolve("src/components"),
      'router':resolve('src/router'),
      'base':resolve('src/base'),
      'api':resolve('src/api'),
      'store':resolve('src/store')
    }
  },
  //不同类型模块的处理规则。
  module: {
    rules: [
//    {
//      test: /\.(js|vue)$/,
//      loader: 'eslint-loader',
//      enforce: 'pre',
//      include: [resolve('src'), resolve('test')],
//      options: {
//        formatter: require('eslint-friendly-formatter')
//      }
//    },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
        	//小于10k的图片转为base64编码的dataURL字符串写到代码中
          limit: 10000,
          //其他的图片转移到静态资源 文件夹
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  }
}
