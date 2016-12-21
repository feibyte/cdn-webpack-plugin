const _ = require('lodash');
const ExternalModule = require('webpack/lib/ExternalModule');
const CDNAssests = require('./lib/cdn-assets');

function CDNWebpackPlugin (options) {
  console.log(options);
};

var notModuleRegExp = /^\.$|^\.[\\\/]|^\.\.$|^\.\.[\/\\]|^\/|^[A-Z]:[\\\/]/i;
const isModule = function isModule(path) {
	return !notModuleRegExp.test(path);
};

CDNWebpackPlugin.prototype.apply = function (compiler) {

  const aviabaleCDNList = []; // chunk 使用到的 CDN 资源

  const userExternals = compiler.options.externals || {};

  const cacheModuleVersion = {}; // 缓存模块路径的版本

  // 解析当前模块的版本号
  const resolveVersion = (context, moduleName) => {
    return new Promise((resolve, reject) => {

      // TODO 解析优化

      compiler.resolvers.normal.resolve(context, moduleName + '/package.json', (err, result) => {
        if (err) {
          return reject(err);
        }
        var version = cacheModuleVersion[result];
        if (typeof version === 'undefined') {
          const moudlePackageJSON = require(result);
          version = moudlePackageJSON.version;
          cacheModuleVersion[result] = version;
        }
        resolve(version);
      });
    });
  };

  // 是否存在匹配版本
  const existsMatchVersion = (CDNInfo, specifyVersion) => {
    if (typeof CDNInfo === 'object') {
      const versions = CDNInfo.versions;
      if (Array.isArray(versions)) {
        return versions.indexOf(specifyVersion) !== -1;
      } else if (typeof versions === 'object'){
        return !!versions[specifyVersion];
      }
    }
    return false;
  };

  const hasVersionConflict = (moudleName, version) => {
    const foundCDN = _.find(aviabaleCDNList, { moudleName: moudleName });
    if (foundCDN && foundCDN.version !== version) {
      return true;
    }
    return false;
  }

  compiler.options.externals = (context, request, callback) => {
    if (isModule(request) && request.indexOf('/') === -1) {
      const moudleName = request;
      resolveVersion(context, moudleName).then(version => {
        const CDNInfo = CDNAssests[moudleName];
        console.log(moudleName, version);
        if (existsMatchVersion(CDNInfo, version)) { // 对应版本存在CDN可用资源
          if (!hasVersionConflict(moudleName, version)) { // 与现有无冲突
            aviabaleCDNList.push({
              version: version,
              moudleName: moudleName,
              path: CDNInfo.path,
            });
            callback(undefined, new ExternalModule(CDNInfo.external, 'var'));
            return ;
          }
        }
        callback();
      }, () => {
        callback();
      });
    } else {
      callback();
    }
  };

  compiler.plugin('compilation', (compilation) => {

    compilation.plugin("html-webpack-plugin-before-html-processing", function(htmlPluginData, callback) {
      var bodyRegExp = /(<\/body>)/i;
      var externalScripts = _.uniq(aviabaleCDNList.map((item) => {
        const scirptPath = item.path.replace('${version}', item.version);
        return `<script src="${scirptPath}"></script>\n`;
      }));
      htmlPluginData.html = htmlPluginData.html.replace(bodyRegExp, (match) => {
        return externalScripts.join('') + match;
      });
      callback(null, htmlPluginData);
    });
  });

}

module.exports = CDNWebpackPlugin;
