//loading动画
//删除目标文件夹
//执行 webpack构建
//输出信息
//webpack编译之后会输出到配置里面指定的目标文件夹；删除目标文件夹之后再创建是为了去除旧的内容，一面产生不可预测的影响。
require('./check-versions')()

process.env.NODE_ENV = 'production'

//ora，一个可以再终端显示spinner的插件
var ora = require('ora')
//rm 用于删除文件或文件夹的插件
var rm = require('rimraf')
var path = require('path')
//chalk，用于在控制台输出带颜色字体的插件
var chalk = require('chalk')
var webpack = require('webpack')
var config = require('../config')
var webpackConfig = require('./webpack.prod.conf')

var spinner = ora('building for production...')
spinner.start() //开启loading动画

//利用rm将整个dist文件夹以及里面的内容删除，一面遗留旧的没用的文件
//删除完成后才开始webpack构建打包。
rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  if (err) throw err
  webpack(webpackConfig, function (err, stats) {
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ))
  })
})

//build.js主要是用来编译打包的 会首先调用rimraf插件移除掉已经存在的dist文件避免出现错误
//删除完成后才开始webpack构建打包