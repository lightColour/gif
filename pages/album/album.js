const promisify = require('../../utils/promisify');
const request = promisify(wx.request);
const baseUrl = 'https://www.easy-mock.com/mock/5afd9b011591717d69695481/gif/';

Page({
  data: {
    imgs: [],
    show: false
  },
  onLoad() {
    request({
      url: baseUrl + 'album',
    }).then(res => {
      if (res.data.status === '200') {
        this.setData({
          imgs: res.data.data.img_url
        })
      }
    })
  },
  preview() {
    this.setData({ show: true });
  },
  onClose() {
    this.setData({ show: false });
  }
})