//合并基础的webpack配置
//配置样式 文件的处理规则，styleLoaders
//配置webpack的输出
//配置webpack插件
//gzip模式下的webpack插件配置
//webpack-bundle分析
var path = require('path')
var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
//copy-webpack-plugin用于将static中的静态文件例如图片，字体等复制到产品文件夹dist
var CopyWebpackPlugin = require('copy-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
//optimize-css-assets-webpack-plugin用于优化和最小化css资源
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

var env = config.build.env  //得到发布模式中的env环境

var webpackConfig = merge(baseWebpackConfig, {
  module: {
  	//样式文件的处理规则，对css/sass/scss等不同内容使用相应的styleLoaders
  	//由utils配置出各种类型的预处理语言所需要使用的loader，例如sass需要使用sass-loader
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap, //true
      extract: true
    })
  },
  //是否使用source-map
  devtool: config.build.productionSourceMap ? '#source-map' : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'), //文件存放的路径
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),
    //丑化压缩js代码
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      sourceMap: true
    }),
    //将css提取到单独的文件  npm run build的时候使用到。
    // extract css into its own file
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css')  //将css提取出来放道指定的css文件中。
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    //将产品文件的引用注入到index.html
    new HtmlWebpackPlugin({
      filename: config.build.index,  //对应的是index.html文件
      template: 'index.html',
      inject: true,
      minify: {
      	//删除index.htm中的注释
        removeComments: true,
        //删除index.html的空格
        collapseWhitespace: true,
        //删除各种html标签属性值的双引号
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      //注入依赖的时候按照依赖先后顺序进行注入，比如，需要先注入vendor.js,在注入app.js
      chunksSortMode: 'dependency'
    }),
    
    //从vendor中提取出minfest。
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module, count) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor']
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})

if (config.build.productionGzip) {
  var CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig

//webpack.prod.conf主要是混入base.conf然后增加一些缩小前端资源请求的文件大小。
