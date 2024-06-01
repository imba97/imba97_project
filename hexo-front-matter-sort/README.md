# hexo-front-matter-sort

Hexo Front-matter 排序工具

# 场景

我有一部分文章是之前 WordPress 同步过来的

跟使用 `hexo new post` 指令自动创建的 `Front-matter` 顺序有点不一样

并且有些 `id` 是数字，有些又是字符串

作为一个强迫症，必须对齐！

# 用法

首先 `Front-matter` 就是文章头部的一段配置信息，例如：

```
---
title: Hello World
date: 2013/7/13 20:46:25
---
```

你只需要修改一下文章目录

```js
const dir = 'D:/blog/imba97/hexo/source/_posts'
```

再修改一下你希望的顺序

```js
const sortList = [
  'id',
  'title',
  'date',
  'tags',
  'categories'
]
```

也许你还要改改 `id` 相关的逻辑

跑一下即可

```bash
node ./index.mjs
```
