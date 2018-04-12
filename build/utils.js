//utils提供工具函数，包含生成处理各种样式语言的loader，获取资源文件存放路径的工具函数。
//1.计算资源文件存放路径
//2.生成cssLoader用于加载.vue文件中样式
//3.生成styleLoader用于加载不在.vue文件中的单独存在的样式文件。
var path = require('path')
var config = require('../config')
//extract-text-webpack-plugin可以提取bundle中的特定文本，将提取后的文本单独存放到另外的文件。
//这里用来提取css样式
var ExtractTextPlugin = require('extract-text-webpack-plugin')

//资源文件的存放路径
exports.assetsPath = function (_path) {
	//都存放在static目录中。
  var assetsSubDirectory = process.env.NODE_ENV === 'production'  
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory
  return path.posix.join(assetsSubDirectory, _path)
}

//生成css.sass.scss等各种用来编写样式的语言所对应 的loader配置
exports.cssLoaders = function (options) {
  options = options || {}

  var cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: process.env.NODE_ENV === 'production',
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  //生成各种loader配置，并且配置了extract-text-plugin
  function generateLoaders (loader, loaderOptions) {
  	//默认是css-loader
    var loaders = [cssLoader]
    //如果非css，则增加一个处理预编译语言的loader并设好相关配置属性。
    //例如generateLoaders('less')这里就会push一个less-loader
    //less-loader先将less编译成css，然后再有css-loader去处理css
    //其他sass，scss等语言是一样的过程。
    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
    	//配置extract-text-plugin提取样式
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader',
        publicPath:'../../'
      })
    } else {
    	//无需提取样式则简单使用vue-style-loader配合各种样式loader去处里<style>里面的样式
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
  	//得到各种不同处理样式的语言所对应的loader
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

//生成处理单独的.css,.sass,.scss等样式文件的规则
// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  var output = []
  var loaders = exports.cssLoaders(options)
  for (var extension in loaders) {
    var loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }
  return output
}
