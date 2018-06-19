//index.js
//获取应用实例
import util from '../../utils/util.js';
const app = getApp()

Page({
  data: {
    ColumnListApi: '/Index/GetColumnList',
    recommandApi: '/Index/GetRecommendPage',
    ColumnDetailApi: '/Index/GetColumnDetail/',
    navItems: {},
    navActive: 0,
    RecommendList: [],
    SubjectList: [],
    EliteList: [],
    MediaRecommend: [],
    pageIndex: [0, 0, 0, 0],
    pageSize: 10,
    DetailList: [[], [], [], []],
    currentcolumnId: [],
    isbottom: [false, false, false, false],
    topheight: 95,
    isshow: true,
    topHeight: 85,
    isswitch: true,
    i: 0,
    scrollTop: 0,
    contentHeight: '',
    requestflag: true,
    showLaunch: false,
    showContact: false,
    contactMsg: 1
  },
  //分享功能
  onShareAppMessage: function (res) {
    return {
      title: '万千家长信赖的哄娃神器，快来试试！',
      path: '/pages/index/index',
    }
  },
  //打开app
  launchAppError: function (e) {
    console.log(e)
  },
  toSearch: function (e) {
    // 跳转到搜索页面
    wx.navigateTo({
      url: '../search/search'
    })
  },
  navChange: function (e) {
    // 改变当前nav
    this.setData({
      navActive: e.target.dataset.index
    });
    let eventDetail = {
      navActive: e.target.dataset.index
    };
  },
  morenavChange: function (e) {
    // 跳转nav
    if (e.target.dataset.name == '儿歌精选') {
      this.setData({
        navActive: 2
      });
    } else if (e.target.dataset.name == "动画精选") {
      this.setData({
        navActive: 1
      })
    } else if (e.target.dataset.name == '英文精选') {
      this.setData({
        navActive: 3
      })
    };
  },
  swiperChange: function (e) {
    // swiper改变current
    this.setData({
      navActive: e.detail.current,
    });
    // 自定义分析
    wx.reportAnalytics('tab', {
      index: e.detail.current + 1,
    });
  },
  onShow: function () {
    if (app.globalData.scene === 1036) {
      this.setData({
        showLaunch: true
      })
    }
    var value = wx.getStorageSync('kefutime')
    var date = util.kefutime(new Date())
    if (value === date) {
      this.setData({
        contactMsg: 0
      })
    }
  },
  onLoad: function () {
    var _this = this
    // 自定义分析
    wx.reportAnalytics('tab', {
      index: 1,
    });

    //获取屏幕高度
    var screenHeight = wx.getSystemInfoSync().screenHeight;
    var contentHeight = screenHeight - 93;
    this.setData({
      contentHeight: contentHeight + "px"
    })

    // 初始化加载
    this.request(util.host + this.data.ColumnListApi, this.handleColumnList);
    this.request(util.host + this.data.recommandApi, this.handleRecommand);
    setTimeout(function () {
      _this.loadContactStatus()
    }, 100)
  },
  loadContactStatus () {
    let _this = this
    if (app.globalData.loadComplete) {
      var value = wx.getStorageSync('kefutime')
      var date = util.kefutime(new Date())
      if (app.globalData.showContact) {
        if (value !== date) {
          this.setData({
            contactMsg: 1
          })
          return
        }
      }
      this.setData({
        contactMsg: 0
      })
    } else {
      setTimeout(function () {
        _this.loadContactStatus()
      }, 100)
    }
  },
  // 首页客服点击
  reportContact: function () {
    wx.reportAnalytics('contact');
    var date = util.kefutime(new Date())
    wx.setStorageSync('kefutime', date)
  },
  init: function () {
    // 栏目内容初始化
    this.request(util.host + this.data.ColumnDetailApi + this.data.currentcolumnId[1] + '/' + 0 + '/' + this.data.pageSize, this.handleColumnDetail, 1);
    this.request(util.host + this.data.ColumnDetailApi + this.data.currentcolumnId[2] + '/' + 0 + '/' + this.data.pageSize, this.handleColumnDetail, 2);
    this.request(util.host + this.data.ColumnDetailApi + this.data.currentcolumnId[3] + '/' + 0 + '/' + this.data.pageSize, this.handleColumnDetail, 3);
  },
  handleColumnDetail: function (data, navindex) {
    // 显示各栏目数据
    if (navindex) {
      var list = 'DetailList[' + navindex + ']';
      var temp1 = this.data.DetailList[navindex].concat(data);
      var bottom = 'isbottom[' + navindex + ']';
      var index = 'pageIndex[' + navindex + ']';
      var temp2 = this.data.pageIndex[navindex] + 1;
    } else {
      var list = 'DetailList[' + this.data.navActive + ']';
      var temp1 = this.data.DetailList[this.data.navActive].concat(data);
      var bottom = 'isbottom[' + this.data.navActive + ']';
      var index = 'pageIndex[' + this.data.navActive + ']';
      var temp2 = this.data.pageIndex[this.data.navActive] + 1;
    }
    this.setData({
      [list]: temp1
    });
    if (data.length < this.data.pageSize) {
      this.setData({
        [bottom]: true
      });
    } else {
    }
    this.setData({
      [index]: temp2
    });
  },
  handleColumnList: function (data) {
    console.log(data)
    // 显示栏目数据
    var temp = this.data.currentcolumnId;
    data.forEach(function (item) {
      temp.push(item.ID);
    });
    this.setData({
      currentcolumnId: temp
    });
    this.init();
    this.setData({
      navItems: data
    });
  },
  handleRecommand: function (data) {
    // 显示首页各种推荐数据
    this.setData({
      RecommendList: data.RecommendList,
      SubjectList: data.SubjectList,
      EliteList: data.EliteList,
      MediaRecommend: data.MediaRecommend,
    });
    this.handlebottom();
  },

  tonew: function (e) {
    // 动画，儿歌，英文上拉加载
    var comn = this.data.navActive;
    var api = util.host + this.data.ColumnDetailApi + e.target.dataset.id + '/' + this.data.pageIndex[this.data.navActive] + '/' + this.data.pageSize;
    if (this.data.requestflag == true) {
      this.request(api, this.handleColumnDetail, comn);
    } else {

    }
  },
  tonewfocus: function (e) {
    // 首页下方推荐上拉加载
    this.handlebottom();
  },
  handlebottom: function () {
    // 显示首页下方推荐列表
    var bottom = 'isbottom[' + this.data.navActive + ']';
    if ((this.data.pageIndex[this.data.navActive] + 1) * this.data.pageSize < this.data.MediaRecommend.List.length) {
      var temp = this.data.MediaRecommend.List.slice(0, this.data.pageSize * (this.data.pageIndex[this.data.navActive] + 1));

    } else {
      this.setData({
        [bottom]: true
      });
      var temp = this.data.MediaRecommend.List.slice(0);
    }
    this.setData({
      MediaRecommenddata: temp
    });
    var temp = this.data.pageIndex[this.data.navActive] + 1;
    var index = 'pageIndex[' + this.data.navActive + ']';
    this.setData({
      [index]: temp
    });
  },
  play: function (e) {
    //自定义事件分析
    var eventName = e.currentTarget.dataset.report
    var eventId = e.currentTarget.dataset.id
    if (eventName === 'reclist') {
      wx.reportAnalytics(eventName, {
        topic_id: eventId,
        rec_index: e.currentTarget.dataset.recindex,
        rec_list: e.currentTarget.dataset.reclist,
      });
    } else if (eventName === "bblist") {
      wx.reportAnalytics(eventName, {
        topic_id: eventId,
        bb_index: e.currentTarget.dataset.index,
      });
    } else {
      wx.reportAnalytics(eventName, {
        topic_id: eventId,
      });
    }
    //跳转其他小程序
    if (e.currentTarget.dataset.type === 2) {
      var appId = e.currentTarget.dataset.appid;
      var path = e.currentTarget.dataset.path;
      wx.navigateToMiniProgram({
        appId: appId,
        path: path,
        success(res) {
          console.log(res)
        },
        fail(err) {
          console.log(err)
        }
      })
    } else {
      // 跳转到播放页面
      if (e.currentTarget.dataset.songid) {
        wx.navigateTo({
          url: '../play/play?SongId=' + e.currentTarget.dataset.songid + '&TopicId=' + e.currentTarget.dataset.id
        });
      } else {
        wx.navigateTo({
          url: '../play/play?SongId=-1' + '&TopicId=' + e.currentTarget.dataset.id
        });
      }
    }
  },
  request(url, resolve, data) {
    var that = this;
    this.setData({
      requestflag: false
    });
    wx.request({
      url: url,
      data: data,
      header: {
        'content-type': 'application/json'
      },
      method: 'POST',
      dataType: 'json',
      success: function (res) {
        resolve(JSON.parse(util.decrypt(res.data.Data)), data);
        that.setData({
          requestflag: true
        });

      },
      fail: function (error) {
        console.log(error);
        that.setData({
          requestflag: true
        });
      }
    })



  }
})
