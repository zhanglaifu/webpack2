var utils = require('./utils')
var config = require('../config')
var isProduction = process.env.NODE_ENV === 'production'

module.exports = {
	//处理.vue中的样式
  loaders: utils.cssLoaders({
    sourceMap: isProduction   //是否打开source-map
      ? config.build.productionSourceMap
      : config.dev.cssSourceMap,
      //是否提取样式到单独的文件。
    extract: isProduction
  })
}
