import gibberish from 'gibberish-aes.js';

//接口域名
// let host = 'http://test.api-nursery-xcx.baby-bus.com';
let host = 'https://api-nursery-xcx.babybus.com';

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const kefutime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join('/');
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const decrypt = data => {
  var key = 'BabyBusRecommendBabyBusRecommend';
  gibberish.GibberishAES.size(256);
  return gibberish.GibberishAES.aesDecrypt(data, key);
}
const request=(url,resolve,data)=>{
  wx.request({
    url:url,
    data:data,
    header: {
      'content-type': 'application/json'
    },
    method: 'POST',
    dataType:'json',
    success: function (res) {
      resolve(JSON.parse(decrypt(res.data.Data)),data);

    },
    fail: function (error) {
      console.log(error);
    }
  })

}

module.exports = {
  host: host,
  formatTime: formatTime,
  decrypt: decrypt,
  request:request,
  kefutime: kefutime
}
