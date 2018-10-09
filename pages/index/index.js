const promisify = require('../../utils/promisify');
const request = promisify(wx.request);
const baseUrl = 'https://www.easy-mock.com/mock/5afd9b011591717d69695481/gif/';

Page({
  data: {
    imgUrls: [],
    original: [{
      "id": "CFA1473E7F00000100FCB912DE1A1E79",
      "icon": "https://www.61up.cn/bqms/static/api/face/image/CFA1473E7F00000100FCB912DE1A1E79/icon_4bf03c977f00000101d125d05948f68e.png",
      "img_num": 8,
      "down_num": 152284,
      "description": "微信超仿真语音恶搞表情。分享请注明来源！——by 表情王国Air&小菜\r\n请下载后再使用！请下载后再使用！请下载后再使用！重要的事情说三遍！",
      "name": "微信假语音",
      "gif_flag": "0",
      "banner_img": null,
      "author_id": "52A006D37F0000010056ACCBF9BC804A"
    }, {
      "id": "654843BB7F000001015CE670E57F2B62",
      "icon": "https://www.61up.cn/bqms/static/api/face/image/654843BB7F000001015CE670E57F2B62/icon_654843cb7f000001015ce6707421ec64.jpeg",
      "img_num": 15,
      "down_num": 31608,
      "description": "来一波恶搞版的萌萌熊~——by 翔通动漫 小菜\r\n表情包内容：早上好 晚安 so what  下课 我母鸡哦 你开心就好等15P表情",
      "name": "恶搞萌萌熊",
      "gif_flag": "0",
      "banner_img": null,
      "author_id": "52A006D37F0000010056ACCBF9BC804A"
    }, {
      "id": "352DE36B7F000001012579DC8AF69EC9",
      "icon": "https://www.61up.cn/bqms/static/api/face/image/352DE36B7F000001012579DC8AF69EC9/icon_352de3727f000001012579dca72eae09.jpeg",
      "img_num": 26,
      "down_num": 85299,
      "description": "手机QQ恶搞文字表情，微信不行，只能用手机QQ，分享请注明处处谢谢！（假笑）",
      "name": "你点开",
      "gif_flag": "0",
      "banner_img": null,
      "author_id": "52A006D37F0000010056ACCBF9BC804A"
    }],
    lastest: [],
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 1000
  },
  onLoad() {
    request({
      url: baseUrl + 'carousel'
    }).then(res => {
      if (res.data.status === '200') {
        this.setData({
          imgUrls: res.data.data
        })
      }
    })

    request({
      url: baseUrl + 'new',
    }).then(res => {
      if (res.data.status === '200') {
        this.setData({
          lastest: res.data.data
        })
      }
    })
  },
  navigateTo(e) {
    const dataset = e.currentTarget.dataset;
    const page = dataset.page;
    const id = dataset.id;
    console.log(page + ', ' + id)
    wx.navigateTo({
      url: `../${page}/${page}?id=${id}`
    });
  }
})