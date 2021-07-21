/**
 * 根据基金代码获取半年内单位净值
 * 并将数据做成图标最后导出成图片返回图片路径
 */

const _ = require('lodash')

const echarts = require('echarts')
const nodeEcharts = require('node-echarts-canvas')

const axios = require('axios')

module.exports = {
  generateImage(code) {
    const now = new Date().getTime()
    const hy = new Date(now - 15768000000)

    return axios
      .get(
        `https://api.doctorxiong.club/v1/fund/detail?code=${code}&startDate=${hy.getFullYear()}-${
          hy.getMonth() + 1
        }-${hy.getDate()}`
      )
      .then((res) => {
        if (res.data.code !== 200) {
          console.error('基金接口错误')
          return
        }

        const date = []
        const data = []

        _.forEach(res.data.data.netWorthData, (item) => {
          date.push(item[0])
          data.push(item[1])
        })

        const option = {
          backgroundColor: '#FFFFFF',
          tooltip: {
            trigger: 'axis',
            position: function (pt) {
              return [pt[0], '10%']
            }
          },
          title: {
            left: 'center',
            text: res.data.data.name
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: date
          },
          yAxis: {
            type: 'value',
            boundaryGap: [0, '100%']
          },
          series: [
            {
              name: '数据',
              type: 'line',
              symbol: 'none',
              sampling: 'lttb',
              itemStyle: {
                color: 'rgb(255, 70, 131)'
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: 'rgb(255, 158, 68)'
                  },
                  {
                    offset: 1,
                    color: 'rgb(255, 70, 131)'
                  }
                ])
              },
              data: data
            }
          ]
        }

        const imagePath = `./${res.data.data.code}.jpg`

        var config = {
          width: 800, // Image width, type is number.
          height: 500, // Image height, type is number.
          option: option, // Echarts configuration, type is Object.
          //If the path  is not set, return the Buffer of image.
          path: imagePath // Path is filepath of the image which will be created.
        }

        nodeEcharts(config)

        return imagePath
      })
  }
}
