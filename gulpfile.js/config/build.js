var config = require('./');
var newConf = {};
//人肉deep copy 
//:P 懒得写lib
newConf.srcDirectory  = config.srcDirectory;
newConf.destDirectory = config.destDirectory;
newConf.confDirectory = config.confDirectory;
newConf.vendorDirectory = config.vendorDirectory;
newConf.moduleDirectory = config.moduleDirectory;
newConf.frameworkDirectory = config.frameworkDirectory;

module.exports = newConf;