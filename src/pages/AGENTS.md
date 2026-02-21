# 前端约定目录

```
+ pages
  + index // 映射 `/`
    + assets // 静态文件
    + components // 页面使用组件
    + constants // 常量声明
    + layouts // 布局
    + store // 页面局部状态
    + hooks // 页面较复杂的钩子
    + types // 需要导入导出语句的类型
    + utils // 工具函数
    - interface.d.ts // 全局共享/无需引入的类型
    - styles.css // 样式文件，可选
    - index.vue // 页面入口
  + about 
    + index 映射 `/about`
    + 1
      + index 映射 `/about/1`
      + 2 映射 `/about/1/2`
```