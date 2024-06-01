import _ from 'lodash'
import fs from 'fs-extra'
import yaml from 'yaml'
import { EOL } from 'node:os'

// 文章文件夹
const dir = 'D:/blog/imba97/hexo/source/_posts'
const files = fs.readdirSync(dir)

// 排序字段
const sortList = [
  'id',
  'title',
  'date',
  'tags',
  'categories'
]

const frontMatters = {}

files.forEach(fileName => {
  const filePath = `${dir}/${fileName}`
  const content = fs.readFileSync(filePath, 'utf-8')
  const [, frontMatter, frontMatterContent] = /^(---([\s\S]*?)---)/.exec(content)
  frontMatters[fileName] = {
    frontMatter,
    frontMatterContent,
    content
  }
})

_.forEach(frontMatters, ({ frontMatter, frontMatterContent, content }, fileName) => {
  const json = yaml.parse(frontMatterContent)

  const sortJson = {}
  sortList.forEach(key => {
    if (_.has(json, key)) {
      sortJson[key] = key === 'id' ? _.parseInt(json[key]) : json[key]
    }
  })

  const yamlString = yaml.stringify(sortJson)

  const newContent = content.replace(frontMatter, `---${EOL}${yamlString}---`)
  
  fs.writeFileSync(`${dir}/${fileName}`, newContent)
})
