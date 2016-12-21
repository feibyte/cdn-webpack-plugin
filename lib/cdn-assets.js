/**
 * 😞 CDN 各个资源没有统一的规则：
 * 1. 模块的依赖有可能已经打包在一起；如 react-router，将 依赖的小文件一起打包。
 * 2. 依赖不明确；如 bootstap 依赖 jquery 是在 dependencies 中指定的，而 react-router 其实只需要外部的 react，在 peerDependencies 中声明的。
 * 所以，必须自己建立一个依赖规则
 */

module.exports = {
  'lodash': {
    external: '_',
    versions: [],
    path: '',
  },
  'react': {
    versions: ['15.4.1', '15.3.2', '15.0.1', '15.0.0', '0.14.7', '0.14.6'],
    external: 'React',
    path: '//cdn.bootcss.com/react/${version}/react-with-addons.js'
  },
  'redux': {
    external: 'Redux',
    versions: ['3.5.2'],
    path: '//cdn.bootcss.com/redux/${version}/redux.js'
  },
  'react-dom': {
    external: 'ReactDOM',
    versions: ['15.4.1', '15.3.2', '15.0.1', '15.0.0', '0.14.7', '0.14.6'],
    path: '//cdn.bootcss.com/react/${version}/react-dom.js'
  },
  'react-redux': {
    external: 'ReactRedux',
    versions: ['4.4.5'],
    path: '//cdn.bootcss.com/react-redux/${version}/react-redux.js'

  },
  'react-router': {
    external: 'ReactRouter',
    versions: {
      '3.0.0': {
        dependencies: {
        }
      },
      '2.8.1': {
        dependencies: {
          "react": "^0.14.0 || ^15.0.0"
        }
      },
      '2.5.2': {
        dependencies: {}
      },
      '2.4.1': {
        dependencies: {}
      }
    },
    path: '//cdn.bootcss.com/react-router/${version}/ReactRouter.js'
  },
  'react-router-redux': {
    external: 'ReactRouterRedux',
    versions: ['15.4.1', '15.3.2', '15.0.1', '15.0.0', '0.14.7', '0.14.6'],
    path: '//cdn.bootcss.com/react-router-redux/${version}/ReactRouterRedux.js'
  },
  'react-addons-css-transition-group': {
    external: 'React.addons.CSSTransitionGroup',
    versions: ['15.4.1', '15.3.2', '15.0.1', '15.0.0', '0.14.7', '0.14.6'],
    path: '//cdn.bootcss.com/react/${version}/react-with-addons.js',
  },
  'react-addons-shallow-compare': {
    external: 'React.addons.shallowCompare',
    versions: ['15.4.1', '15.3.2', '15.0.1', '15.0.0', '0.14.7', '0.14.6'],
    path: '//cdn.bootcss.com/react/${version}/react-with-addons.js',
  },
  'react-addons-transition-group': {
    external: 'React.addons.TransitionGroup',
    versions: ['15.4.1', '15.3.2', '15.0.1', '15.0.0', '0.14.7', '0.14.6'],
    path: '//cdn.bootcss.com/react/${version}/react-with-addons.js',
  },
};
