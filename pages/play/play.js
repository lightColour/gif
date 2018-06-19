// pages/play/play.js
import utils from '../../utils/util.js';

const app = getApp()

//流量监控
function checkNet(that) {
  var _this = that;
  var videoContext = wx.createVideoContext('main-video')
  wx.getNetworkType({
    success: function (res) {
      var networkType = res.networkType
      if (networkType === 'wifi') {
        // videoContext.play();
        _this.setData({
          isAutoPlay: true,
          isHidden: true
        })
      } else {
        videoContext.pause();
        _this.setData({
          isHidden: false,
          isAutoPlay: false,
        })
      }
    }
  })
}
//获取爱奇艺视频播放地址
function getVideo(key, that, one) {
  // 吧this作為參數穿景區
  let _this = that
  wx.request({
    url: "https://openapi.iqiyi.com/api/iqiyi/authorize?client_id=" + one.PolicyList[_this.data.strategyindex].AppKey + "&client_secret=" + one.PolicyList[_this.data.strategyindex].AppSecret,
    method: 'get',
    success: function (e) {

      var token = e.data.data.access_token;

      wx.request({
        url: "https://openapi.iqiyi.com/api/file/urllist?access_token=" + token + "&file_id=" + key,
        method: 'get',
        success: function (res) {
          if (res.data.code == 'Q00001') {
            var temp = _this.data.strategyindex;
            _this.setData({
              strategyindex: temp + 1
            })
            if (_this.data.strategyindex >= 3) {
              wx.showToast({
                title: '当前视频无法播放',
                icon: 'none',
                duration: 2000
              })
              _this.setData({
                isNoResource: true
              })
              setTimeout(function () {
                PlayNextSong(_this)
              }.bind(_this), 3000)
            } else {
              _this.getstrategyplay(_this.data.ThisSongId, one);

            }

          } else {
            if (res.data.data === 'undefined') {
              wx.showToast({
                title: '当前视频无法播放',
                icon: 'none',
                duration: 2000
              })
              _this.setData({
                isNoResource: true
              })
            } else {
              var videoUrl = res.data.data.m3u8['2']
              if (videoUrl == undefined || videoUrl == null || videoUrl == "") {
                videoUrl = res.data.data.m3u8['1']
                if (videoUrl == undefined || videoUrl == null || videoUrl == "") {
                  videoUrl = res.data.data.mp4['1'];
                  if (videoUrl == undefined || videoUrl == null || videoUrl == "") {
                    videoUrl = res.data.data.mp4['2'];
                    if (videoUrl == undefined || videoUrl == null || videoUrl == "") {
                      var temp = _this.data.strategyindex;
                      _this.setData({
                        strategyindex: temp + 1
                      })
                      if (_this.data.strategyindex >= 3) {
                        wx.showToast({
                          title: '当前视频无法播放',
                          icon: 'none',
                          duration: 2000
                        })
                        _this.setData({
                          isNoResource: true
                        })
                        setTimeout(function () {
                          PlayNextSong(_this)
                        }.bind(_this), 3000)
                      } else {
                        _this.getstrategyplay(_this.data.ThisSongId, one);

                      }
                    } else {
                      _this.setData({
                        VideoUrl: videoUrl
                      })
                    }
                  } else {
                    _this.setData({
                      VideoUrl: videoUrl
                    })
                  }
                } else {
                  _this.setData({
                    VideoUrl: videoUrl
                  })
                }
              } else {
                _this.setData({
                  VideoUrl: videoUrl
                })
              }

            }

          }

        }
      })
    }
  })
}
//无播放资源自动播放下一首
function PlayNextSong(that) {
  that.setData({
    strategyindex: 0
  });
  var _this = that
  var songList = _this.data.MediaList;
  var key = songList[0].IQYKey;
  var nextId = songList[0].ID;
  var nextPosterUrl = songList[0].Img;
  for (var song_i = 0; song_i < songList.length; song_i++) {
    if (songList[song_i].ID == parseInt(_this.data.ThisSongId)) {
      key = song_i == songList.length - 1 ? songList[0].IQYKey : songList[song_i + 1].IQYKey;
      nextPosterUrl = song_i == songList.length - 1 ? songList[0].Img : songList[song_i + 1].Img;
      nextId = song_i == songList.length - 1 ? songList[0].ID : songList[song_i + 1].ID;
      song = song_i == songList.length - 1 ? songList[0] : songList[song_i + 1];
      break;
    }
  }
  _this.setData({
    ThisSongId: nextId,
    PosterImg: nextPosterUrl,
    isNoResource: false
  })
  _this.getstrategyplay(_this.data.ThisSongId, song);
}
Page({
  data: {
    MediaList: '',
    TopicList: '',
    TopicDetail: '',
    ThisSongId: '',//当前播放单曲ID
    ThisTopicId: '',//当前专辑ID
    PosterImg: '',//单曲视频封面图
    key: '',//单曲播放单曲IQYKey
    VideoUrl: '',//单曲视频地址
    isHidden: true,
    maxHeight: '132rpx',//专辑详情初始最大高度
    spreadDown: true,//点击是否展开
    rotateDeg: 0,//展开按钮旋转角度
    isAutoPlay: false,//是否自动播放
    isSpreadBtnShow: false,//是否显示展开按钮
    isEllipsisShow: false,//是否显示省略号
    isNoResource: false,//当前视频无资源
    strategyindex: 0,
    playInfoHeight: '500px',
    countText: '',
    systemInfo: '',
    showAd: true,
    showConact: false,
    contactMsg: 1
  },
  //
  onHide: function () {
    this.videoContext = wx.createVideoContext('main-video');
    this.videoContext.pause()
    this.videoContext.exitFullScreen()
  },
  //分享功能
  onShareAppMessage: function (res) {
    return {
      title: '我和孩子正在看《' + this.data.TopicDetail.Name + '》，超赞！',
      path: '/pages/play/play?SongId=' + this.data.ThisSongId + '&TopicId=' + this.data.ThisTopicId,
    }
  },
  //页面加载
  onLoad: function (options) {    
    var _this = this
    setTimeout(_this.refreshAd, 30000)
    wx.getNetworkType({
      success: function (res) {
        var networkType = res.networkType
        if (networkType === 'none') {
          wx.showToast({
            title: '未找到视频信息，请检查网络设置',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
    var windowHeight = wx.getSystemInfoSync().windowHeight
    var windowWidth = wx.getSystemInfoSync().windowWidth
    var systemInfo = wx.getSystemInfoSync().system
    if (systemInfo.match('iOS')) {
      this.setData({
        isiOS: true
      })
    }
    var scale = 421.875 * windowWidth / 750
    var playInfoHeight = windowHeight - scale
    this.setData({
      playInfoHeight: playInfoHeight + "px",
      strategyindex: 0,
      systemInfo: systemInfo
    })
    console.log(systemInfo)
    var that = this;
    //获取搜索页面参数
    var SongId = options.SongId;
    var TopicId = options.TopicId;

    wx.reportAnalytics('topic_play', {
      id: TopicId
    });
    this.setData({
      ThisTopicId: TopicId
    })
    if (SongId != -1) {
      // 沒有songid
      //获取用户浏览记录
      this.setData({
        ThisSongId: SongId
      })
    }
    this.init(TopicId, SongId);
    //流量监控
    checkNet(this);

    setTimeout(function () {
      _this.loadContactStatus()
    }, 100)
  },
  // 检测全局配置载入完毕
  loadContactStatus() {
    let _this = this
    if (app.globalData.loadComplete) {      
      var contactMsg = 0
      if (app.globalData.showContact) {
        contactMsg = 1
      }
      this.setData({
        showContact: app.globalData.showContact,
        contactMsg: contactMsg
      })
    } else {
      setTimeout(function () {
        _this.loadContactStatus()
      }, 100)
    }
  },
  // 播放页下载点击
  reportContact: function () {
    wx.reportAnalytics('download');
  },
  // 广告切换
  refreshAd () {
    this.setData({
      showAd: !this.data.showAd
    })
    this.setData({
      showAd: !this.data.showAd
    })
    setTimeout(this.refreshAd, 30000)
  },
  init: function (TopicId, SongId) {
    var song;
    var that = this;
    wx.request({
      url: utils.host + '/Index/Play/' + TopicId,
      methossd: 'post',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        let data = JSON.parse(utils.decrypt(res.data.Data));
        let countText = '';
        if (data.TopicDetail.IsComplete === 1) {
          countText = '共' + data.TopicDetail.VideoCount + '集'
        } else {
          countText = '更新到' + data.TopicDetail.VideoCount + '集'
        }
        let key = '';
        let PosterUrl = ''
        let PlaySongId = ''
        if (parseInt(SongId) == -1) {
          // 沒有songid

          PlaySongId = wx.getStorageSync(TopicId)
          if (PlaySongId) {
            setTimeout(function () {
              that.setData({
                ThisSongId: PlaySongId
              })
            }.bind(that), 10);
            for (var song_i = 0; song_i < data.MediaList.length; song_i++) {
              song = data.MediaList[song_i];
              if (parseInt(song.ID) == parseInt(PlaySongId)) {
                key = song.IQYKey;
                PosterUrl = song.Img;
                notFund = -1;
                break;
              }
            }
          } else {

            PlaySongId = data.MediaList[0].ID
            that.setData({
              ThisSongId: data.MediaList[0].ID
            })
            song = data.MediaList[0];

          }
        } else {
          PlaySongId = SongId
          setTimeout(function () {
            that.setData({
              ThisSongId: SongId
            })
          }.bind(that), 10)
        }
        if (parseInt(PlaySongId) == -1) {
          // 沒有 傳songid
          key = data.MediaList[0].IQYKey;
          PosterUrl = data.MediaList[0].Img
          that.setData({
            ThisSongId: data.MediaList[0].ID,
          })
        } else {
          var notFund = 1;
          for (var song_i = 0; song_i < data.MediaList.length; song_i++) {
            song = data.MediaList[song_i];
            if (parseInt(song.ID) == parseInt(PlaySongId)) {
              key = song.IQYKey;
              PosterUrl = song.Img;
              notFund = -1;
              break;
            }
          }
        }
        if (notFund == 1) {
          key = data.MediaList[0].IQYKey;
          PosterUrl = data.MediaList[0].Img
          that.setData({
            ThisSongId: data.MediaList[0].ID,
          });
          song = data.MediaList[0];
        }
        // getVideo(key, this)

        //自定义分析
        wx.reportAnalytics('song_play', {
          songid: PlaySongId,
        });
        that.setData({
          MediaList: data.MediaList,
          TopicList: data.Topiclist,
          TopicDetail: data.TopicDetail,
          PosterImg: PosterUrl,
          ThisSongId: PlaySongId,
          countText: countText
        })
        that.getstrategyplay(that.data.ThisSongId, song);

        //专辑详情超过三行显示省略号和展开按钮
        var descNum = data.TopicDetail.Desc.length;
        if ((descNum * 28) >= (702 * 3)) {
          that.setData({
            isEllipsisShow: true,
            isSpreadBtnShow: true
          })
        }
      }.bind(that),
      fail: function (error) {
        console.log(error);
      }
      // success:function(res){
      //   var data = JSON.parse(utils.decrypt(res.data.Data));
      //   console.log(data.MediaList[0]);

      // // if()
      // }
    })
  },
  //暂停事件
  pauseEvent: function (e) {
    console.log(11111)
  },
  stillPlay: function () {
    var videoContext = wx.createVideoContext('main-video')
    videoContext.play();
    this.setData({
      isHidden: true
    })
  },
  getstrategyplay: function (ID, onemedia) {
    var data;
    var url = utils.host + '/Index/CdnUrl';

    if (onemedia.PolicyList[this.data.strategyindex].AppKey == '') {
      data = {
        videoID: ID,
        policyID: onemedia.PolicyList[this.data.strategyindex].PolicyID,
        definitionKey: onemedia.PolicyList[this.data.strategyindex].DefinitionKey
      }
      utils.request(url, this.handleplay, data);
    } else {
      var file_id = onemedia.Url;
      var index = file_id.lastIndexOf('/') + 1;
      file_id = file_id.substr(index);
      getVideo(file_id, this, onemedia);

    }

  },
  handleplay: function (data) {
    if (data == undefined || data == null || data == "") {
    } else {
      this.setData({
        VideoUrl: data
      });
    }

  },
  //点击展开简介
  spreadDes: function () {
    if (this.data.spreadDown) {
      this.setData({
        maxHeight: '500rpx',
        isEllipsisShow: false,
        spreadDown: false,
        rotateDeg: 180
      })
    } else {
      this.setData({
        maxHeight: '132rpx',
        isEllipsisShow: true,
        spreadDown: true,
        rotateDeg: 0
      })
    }
  },
  //切换单曲
  changeSong: function (e) {    
    wx.getNetworkType({
      success: function (res) {
        var networkType = res.networkType
        if (networkType === 'none') {
          wx.showToast({
            title: '未找到视频信息，请检查网络设置',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
    this.setData({
      strategyindex: 0
    });
    let songId = e.currentTarget.dataset.songid
    let key = e.currentTarget.dataset.key
    let PosterUrl = e.currentTarget.dataset.posterurl;
    var song = e.currentTarget.dataset.song;

    //自定义分析
    wx.reportAnalytics('song_play', {
      songid: songId,
    });
    this.setData({
      ThisSongId: songId,
      PosterImg: PosterUrl
    })
    this.getstrategyplay(this.data.ThisSongId, song);

    //当前资源无法播放，则播放下一首
    if (this.data.isNoResource) {
      setTimeout(function () {
        PlayNextSong(this)
      }.bind(this), 3000)
    }
    //监控流量
    checkNet(this);

    //保存播放记录
    wx.setStorage({
      key: this.data.ThisTopicId,
      data: this.data.ThisSongId,
    })
  },
  //播放完成切换下一集
  changeNextSong: function () {
    this.setData({
      strategyindex: 0,
      VideoUrl: ''
    });
    var songList = this.data.MediaList;
    var key = songList[0].IQYKey;
    var nextId = songList[0].ID;
    var song;
    var nextPosterUrl = songList[0].Img;
    for (var song_i = 0; song_i < songList.length; song_i++) {
      if (songList[song_i].ID == parseInt(this.data.ThisSongId)) {
        key = song_i == songList.length - 1 ? songList[0].IQYKey : songList[song_i + 1].IQYKey;
        nextPosterUrl = song_i == songList.length - 1 ? songList[0].Img : songList[song_i + 1].Img;
        nextId = song_i == songList.length - 1 ? songList[0].ID : songList[song_i + 1].ID;
        song = song_i == songList.length - 1 ? songList[0] : songList[song_i + 1];

        break;
      }
    }
    this.setData({
      ThisSongId: nextId,
      PosterImg: nextPosterUrl
    })
    //自定义分析
    wx.reportAnalytics('song_play', {
      songid: nextId,
    });
    this.getstrategyplay(this.data.ThisSongId, song);
    checkNet(this);
    //当前资源无法播放，则播放下一首
    if (this.data.isNoResource) {
      setTimeout(function () {
        PlayNextSong(this)
      }.bind(this), 3000)
    }
    //保存播放记录
    wx.setStorage({
      key: this.data.ThisTopicId,
      data: this.data.ThisSongId,
    })
  },
  //切换专辑
  toPlay: function (e) {
    var SongId = e.currentTarget.dataset.songid;
    var TopicId = e.currentTarget.dataset.topicid;
    wx.redirectTo({
      url: '../play/play?SongId=' + SongId + '&TopicId=' + TopicId
    })
  }
})