# cdn-webpack-plugin
> 自动匹配可用 CDN 资源的 webpack 插件
状态： 跑起来

## 目的

在每个前端项目中，对可复用的第三方资源，最好的方式是引用CDN，这样有两个好处：
1. 大家都使用相同的 CDN 资源，可以极大的提高缓存命中率
2. `webpack` 构建速度提升

为了这样做，我们需要做两步：
1. 在 webpack 配置 externals；形如
```
externals: {
  react: 'React',
  'react-dom': 'ReactDOM',
  'react-addons-css-transition-group': 'React.addons.CSSTransitionGroup',
  'react-addons-shallow-compare': 'React.addons.shallowCompare',
  'react-addons-transition-group': 'React.addons.TransitionGroup',
},
```
`react-addons` 的资源如果不指明，很可能出现某个第三方的组件库引入 react-addons，导致 react 依旧被打包在一起。

2. 在模板中添加可用的第三方链接
```
<script src="//cdn.bootcss.com/react/15.0.1/react-with-addons.js"></script>
<script src="//cdn.bootcss.com/react/15.0.1/react-dom.js"></script>
```
开发模式的时候最好使用未压缩的可以看到一些警告信息，发布时使用压缩脚本。

如果我们都用 webpack 为什么不用一个插件解决这些呢？

## 问题

cdn 资源没规则，从 package.json 中完全看不出；

1. 模块的依赖有可能已经打包在一起；如 react-router，将 依赖的小文件一起打包。
2. 依赖不明确；如 bootstap 依赖 jquery 是在 dependencies 中指定的，而 react-router 其实只需要外部的 react，在 peerDependencies 中声明的。
3. 现有的资源路径规则也不确定，如 [bootcdn.cn](http://www.bootcdn.cn/) 上 min.js 存在 -min.js 和 .min.js。

## 理想情况

1. 如果 CDN 支持资源 combo 请求，可以根据资源共同出现频率选择合适的资源组合
如：react 全家桶 用到 redux 系列， redux react-redux react-thunk
