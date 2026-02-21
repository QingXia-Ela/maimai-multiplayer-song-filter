# 爬取页面生成 API 类型流程

## 爬取地址：

**不得跳转页面其他任意位置！下文给出的链接就是 api 列表页面，如果因为任何问题需要用户辅助操作可以直接提出（如智能体编写爬虫代码，用户执行并将结构化数据交给智能体）**

遇到 SPA 页面时，你可以暂停输出，让用户将渲染后页面保存为 html，并让用户将其添加至上下文。

- maimai(lxns api 源)：`https://maimai.lxns.net/docs/api/maimai`
  
  类型文件目录：`./maimai.lxns.d.ts`

  游戏资源

  基础 URL：https://assets2.lxns.net/maimai

  路径：
  - 头像：/icon/{icon_id}.png
  - 姓名框：/plate/{plate_id}.png
  - 背景：/frame/{frame_id}.png
  - 曲绘：/jacket/{song_id}.png
  - 音频：/music/{song_id}.mp3


## 生成规范

为一个 API 命名时遵循步骤：
- 根据 API 路径与文档说明翻译成英文

  比如 `/api/v0/maimai/player/{code}` 可以翻译为 `GetPlayerInfo`

- 添加 API 类型时使用 `namespace`，并为其添加 `Request` `Response` 用来表示请求响应
- 需要为每个 API namespace 增加 JSDoc，包括 API 路径，来自网页的简短说明
- 通用类型放在 `Types` 大类下