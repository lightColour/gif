// pages/search/search.js
import utils from '../../utils/util.js';
//共用方法
function clearRepeat(arr) {
  var res = [];
  var json = {};
  for (var i = 0; i < arr.length; i++) {
    if (!json[arr[i]]) {
      res.push(arr[i]);
      json[arr[i]] = 1;
    }
  }
  return res;
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    DefaultWord: '',
    BackDefaultWord:'',
    KW: '',
    value:'',
    historySearchItems: [],
    hotSearchItems: [],
    isAllShow: true,//是否展示初始搜索页面
    isHistoryShow: true,//是否展示历史搜索
    isNoResult: false,//是否展示无结果背景
    isTopicShow:false,//是否展示专辑列表
    isMediaShow:false,//是否展示专辑列表
    isLoadingShow:false,
    isClearBtnShow:false,//是否展示清空按钮
    isNoNetwork:false,//是否提示用户无网络
    isNoMore: false,
    topicList: [],
    songList: []
  },
  //分享功能
  onShareAppMessage: function (res) {
    return {
      title: '宝宝巴士儿歌',
      path: '/pages/search/search',
    }
  },
  searchInput: function (e) {
    var kw = e.detail.value.replace(/^\s+|\s+$/g, "");
    this.setData({
      KW: kw,
      isClearBtnShow:true
    })
  },
  // 搜索
  toSearch: function (e) {
    var kw = e.currentTarget.dataset.txt;
    if(kw!=-1){
      this.setData({
        KW:kw
      })
    }
    var newItems = this.data.KW == '' ? this.data.historySearchItems : ([this.data.KW]).concat(this.data.historySearchItems);
    //数组去重
    newItems = clearRepeat(newItems)
    //将历史搜索存入本地并实时读取
    wx.setStorage({
      key: "historySearchItems",
      data: newItems
    })
    wx.getStorage({
      key: 'historySearchItems',
      success: function (res) {
        this.setData({
          historySearchItems: res.data
        })
      }.bind(this),
      fail: function (res) {
        this.setData({
          isHistoryShow: false
        })
      }.bind(this)
    })
    //检查网络状况，若无网络则提示用户
    wx.getNetworkType({
      success: function (res) {
        var networkType = res.networkType
        if (networkType === 'none') {
          this.setData({
            isNoNetwork: true
          })
          setTimeout(function(){
            this.setData({
              isNoNetwork: false
            })
          }.bind(this),1000)
        } else if (this.data.KW == '') {//搜索空内容时搜索默认专辑
            this.setData({
              KW: this.data.BackDefaultWord
            })
          } else {
            this.setData({
              isClearBtnShow:true,
              DefaultWord: this.data.KW,
              value: this.data.KW,
              isLoadingShow: true,
              isAllShow: true,
              isHistoryShow: true,
              isNoResult: false,
              isTopicShow: true,
              isMediaShow: true,
              isNoNetwork: false,
              isNoMore:false
            })
            wx.request({
              url: utils.host + '/Index/Search',
              method: 'post',
              data: {
                name: this.data.KW
              },
              dataType: 'json',
              header: {
                'content-type': 'application/json'
              },
              success: function (res) {
                var data = res.data.Data;
                var decData = JSON.parse(utils.decrypt(data))
                // 搜索结果多于四个，在底部提示没有更多内容
                var num = decData.mediaList.length + decData.topicList.length
                if(num>=5){
                  this.setData({
                    isNoMore:true
                  })
                }
                if (decData.mediaList.length == 0) {
                  this.setData({
                    isMediaShow: false
                  })
                } else if (decData.topicList.length == 0) {
                  this.setData({
                    isTopicShow: false
                  })
                }
                if (decData.mediaList.length != 0 || decData.topicList.length != 0) {
                  this.setData({
                    isNoResult: false,
                    isAllShow: false,
                  })
                } else {
                  this.setData({
                    isNoResult: true,
                    isHistoryShow: false
                  })
                }
                this.setData({
                  isLoadingShow: false,
                  topicList: decData.topicList,
                  songList: decData.mediaList
                })
              }.bind(this),
              fail: function (e) {
                console.log(e)
                this.setData({
                  isLoadingShow: false
                })
              }
            })
          }
      }.bind(this)
    })
  },
  //清空输入
  clearInput:function(){
    this.setData({
      isClearBtnShow:false,
      DefaultWord:this.data.BackDefaultWord,
      KW:'',
      value:''
    })
    if(!this.data.isNoResult){
     this.setData({
       isAllShow:true,
       isTopicShow: false,
       isMediaShow: false,
       isNoMore:false
     })
    }
  },
  //清空历史搜索
  clearHistory: function () {
    wx.removeStorage({
      key: 'historySearchItems'
    })
    this.setData({
      historySearchItems: [],
      isHistoryShow: false,
      isTopicShow:false,
      isMediaShow:false
    })
  },
  //跳转至播放页
  toPlay: function (e) {
    var SongId = e.currentTarget.dataset.songid;
    var TopicId = e.currentTarget.dataset.topicid;
    wx.navigateTo({
      url: '../play/play?SongId=' + SongId+'&TopicId='+TopicId
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getStorage({
      key: 'historySearchItems',
      success: function (res) {
        this.setData({
          historySearchItems: res.data
        })
      }.bind(this),
      fail: function (res) {
        this.setData({
          isHistoryShow: false
        })
      }.bind(this)
    })
    wx.request({
      url: utils.host + '/Index/GetSearchWordInfo',
      method: 'get',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var data = res.data.Data;
        var decData = JSON.parse(utils.decrypt(data))
        this.setData({
          hotSearchItems: decData.hotList,
          KW:decData.DefaultWord,
          DefaultWord: decData.DefaultWord,
          BackDefaultWord: decData.DefaultWord,
        })
      }.bind(this)
    })
  }
})