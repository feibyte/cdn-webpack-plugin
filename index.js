const _ = require('lodash');
const ExternalModule = require('webpack/lib/ExternalModule');
const CDNAssests = require('./cdn-assets');
const semver = require('semver');

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

  const findCaretMatchVersion = (moduleName, specifyVersion) => {
    const CDNInfo = CDNAssests[moduleName];
    if (typeof CDNInfo === 'object') {
      const versions = CDNInfo.versions;
      if (Array.isArray(versions)) {
        return _.find(versions, (cdnVersion) => {
          return semver.satisfies(cdnVersion, specifyVersion);
        });
      }
    }
    return undefined;
  }

  // 若有依赖，先添加依赖
  const addModuleToList = (moduleName, cdnVersion) => {
    if (!_.find(aviabaleCDNList, { moduleName: moduleName })) {
      if (CDNAssests[moduleName] && CDNAssests[moduleName].subVersionDependencies) {
        _.mapKeys(CDNAssests[moduleName].subVersionDependencies[cdnVersion], (dependencyVersion, dependencyModuleName) => {
          const aviableVersion = findCaretMatchVersion(dependencyModuleName, dependencyVersion);
          if (typeof aviableVersion === 'undefined') {
            throw new Error('cound not found ', dependencyModuleName, dependencyVersion);
          }
          addModuleToList(dependencyModuleName, aviableVersion);
        });
      }
      aviabaleCDNList.push({
        moduleName: moduleName,
        version: cdnVersion
      });
    }
  }

  compiler.options.externals = (context, request, callback) => {
    if (isModule(request) && request.indexOf('/') === -1) {
      const moduleName = request;
      console.log(context, moduleName);
      resolveVersion(context, moduleName).then(version => {
        const cdnVersion = findCaretMatchVersion(moduleName, '^' + version);
        if (cdnVersion) { // 对应版本存在CDN可用资源
          addModuleToList(moduleName, cdnVersion);
          const CDNInfo = CDNAssests[moduleName];
          callback(null, CDNInfo.external, 'var');
          return ;
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
        const scirptPath = (CDNAssests[item.moduleName].path).replace('${version}', item.version);
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
