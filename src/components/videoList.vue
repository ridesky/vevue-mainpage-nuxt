<template>
  <div class="videoWrapper videoMain">
    <div class="videoList-wrapper">
      <set-info v-if="showSetInfo"></set-info>
      <ul class="videoLists scrollload-content">
        <li class="videolist" v-for='(video,index) in videos' :key='index'>
          <div class="videoItem">
            <div class="videoCoverBox" :class="{orange:0<video.price&&video.price<=70,purple:video.price>70}">
              <div class="videoAvatarBox">
                <router-link :to=" '/user/' + video.yuan.bywho">
                  <img :src="video.avatar" alt="avatar" class="videoAvatar" :onerror='defaultAvatarLogo'>
                </router-link>
              </div>
              <div class="maoboli">
                <router-link :to="video.shorturl?'/video/'+video.shorturl.split('video/')[1]: '/video/' + video.videoid">
                  <img :src="video.coverURL" alt="" class="maskImage" :onerror='defaultCoverLogo'>
                </router-link>
              </div>
              <div class="video_time" v-if="video.video_time">{{jsFormat.sec_to_time(video.video_time)}}</div>
              <router-link :to="video.shorturl?'/video/'+video.shorturl.split('video/')[1]: '/video/' + video.videoid" :title="video.yuan.note || video.yuan.title">
                <img :src="video.coverURL" alt="" class="videoPoster posterImage" :onerror='defaultCoverLogo'>
                <!-- <img src="../../pages/home/assets/images/vevue_preimage.png" alt=""> -->
              </router-link>
              <router-link :to="video.shorturl?'/video/'+video.shorturl.split('video/')[1]: '/video/' + video.videoid" class="videoList title note" v-if="video.yuan.title" :title="video.yuan.note">{{video.yuan.title}}</router-link>
              <!-- <router-link :to=" '/player/' + video.videoid" class="title videolist" v-else :title="video.yuan.title">{{video.yuan.title}}</router-link> -->
            </div>
            <div class="likesmen" v-if="video.tipslikes.length>0">
              <div class="tri top"></div>
              <i class="iconfont icon-like-heart"></i>
              <router-link :to="'/user/' + like.userid" class="likesman" v-for="(like,index) in video.tipslikes" :key='index'>{{like.nickname}}
                <span v-show="index !== video.tipslikes.length-1">,</span>
              </router-link>
            </div>
            <div class="flex videoMeta-wrapper">
              <div class="videoMeta">
                <p class="nickname">@{{video.yuan.nickname}} </p>
                <p v-if="video.copyright_blocknumber>0">Copyright Status: {{video.copyright_status}} <br/>BlockNumber: {{video.copyright_blocknumber}} Copyright ID {{video.copyright_id}}</p>
                <!-- <p class="description">{{video.yuan.note}}</p> -->
                <div class="metaViewAndData">
                  <p class="view">{{video.view}} Views,</p>
                  <p class="view"> {{video.comment}} Comments, </p>
                  <p class="view"> {{video.likes}} Likes </p>
                </div>
                <a target="_blank" :href=" 'https://maps.google.com/maps?q=' + video.location" v-show='video.yuan.location_name' :title="video.yuan.location_name" class="locationName">
                  <i class="iconfont icon-location"></i>{{video.yuan.location_name}}</a>
              </div>
              <div class="video-meta-menu iconfont icon-menu_col" :class="{'stay':showMetaMenuIndex === index}" v-on:click.self="toShowMetaMenuIndex(index,$event)">
                <ul class="meta-sel">
                  <li class="sel" @click="clipAddress('.clipBtn'+index)" :class="'clipBtn'+index" :aria-label='video.shorturl?video.shorturl:location.origin+"/video/"+video.videoid'>
                    Copy Link
                  </li>
                  <li class="sel" v-if="showRemoveHistory" @click="toRemoveHistory(video.videoid,index,0)">
                    <span>Remove from History</span>
                  </li>
                  <li class="sel" v-if="showWatchLater" @click="toWatchLater(video.videoid,true,0)">
                    <span>Watch Later</span>
                  </li>
                  <li class="sel" v-if="!showWatchLater" @click="toWatchLater(video.videoid,false,0,index)">
                    <span>Remove from Watch Later</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="videoSummary">
            <h3 class="videoTitle">{{video.title}}</h3>
            <div class="metainfo">
              <span>{{video.viewers}}</span>
              <!-- <span>{{video.date}}</span> -->
            </div>
          </div>
        </li>
      </ul>
      <div class="nomore" v-if="showNoMore">
        <i class="iconfont icon-nomore"></i>
        <p>No More</p>
      </div>
      <div v-show="scrollLock && !hideLoading" class="load" :class="{center:videos.length === 0}">
        <img src="../assets/images/loading_bar.gif" alt="">
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
import totp from '../static/tools/totp.js';
import setInfo from './setInfo.vue';
import apiUrl from '../assets/js/config/urlConfig.js';
import jsFormat from '../static/tools/jsFormat.js';
import docCookies from '../static/tools/cookies.js';
import ClipboardJS from 'clipboard';
axios.defaults.headers.post['Content-Type'] = 'application/json';
export default {
  name: 'player',
  components: {
    setInfo
  },
  props: {
    /**
     * @param 调用组件所需参数
     * listenScroll  监听触底事件
     * params 获取video所需要的参数 必填
     */
    listenScroll: {
      // 是否监听触底事件,进行加载新视频
      type: Boolean,
      required: false,
      default: false
    },
    showWatchLater: {
      // 显示稍后观看按钮
      type: Boolean,
      require: false,
      default: true
    },
    showRemoveHistory: {
      // 显示移除历史纪录
      type: Boolean,
      require: false,
      defaul: false
    },
    params: {
      // 获取video所需要的参数 必填
      type: Object,
      required: true
    },
    old: {
      type: Object,
      default: function() {
        return {
          towho: '',
          type: ''
        };
      }
    }
  },
  data() {
    return {
      apiUrl,
      jsFormat,
      location: process.client ? window.location : '',
      hideLoading: false,
      scrollLock: true, // 滚动监听是否加锁
      showSetInfo: false, // 显示设置头像界面
      showVideoEle: false, // 显示视频列表
      showNoMore: false,
      showMetaMenuIndex: -1,
      maskImage: {},
      cookiesEnd: 604800, // cookies时间
      maxRequestTimes: 5, // 尝试请求次数
      posterImage: {},
      page: 0,
      defaultAvatarLogo:
        'this.src="' + require('../assets/images/vevue_logo_50x50.png') + '"',
      defaultCoverLogo:
        'this.src="' + require('../assets/images/default_cover.png') + '"',
      videos: []
    };
  },
  watch: {
    // params: {
    //   handler(newvalue) {
    //     console.log(this.old.towho);
    //     console.log(newvalue.towho);
    //     // console.log()
    //     if (
    //       (this.old.towho !== newvalue.towho) ||
    //       (newvalue.type && (this.old.type !== newvalue.type))
    //     ) {
    //       this.old.towho = newvalue.towho;
    //       this.old.type = newvalue.type;
    //       this.videos = [];
    //       this.loadVideo(0);
    //     }
    //   },
    //   deep: true
    // }
  },
  mounted() {
    window.vue = this;
    this.loadVideo(0); // 首次加载视频
    // this.lazyLoadPic();
    if (this.listenScroll) {
      this.addListenScroll();
    }
    document.body.addEventListener(
      'click',
      () => {
        this.showMetaMenuIndex = -1;
      },
      false
    );
  },
  methods: {
    clipAddress(el) {
      const that = this;
      const clip = new ClipboardJS(el, {
        text: function(trigger) {
          return trigger.getAttribute('aria-label');
        }
      });
      clip.on('success', function(e) {
        that.$message({
          message: 'Link Copied',
          duration: 1200,
          type: 'success'
        });
        console.log('success');
        console.log(e);
        clip.destroy();
      });
      clip.on('error', function(e) {
        console.log('error');
        console.log(e);
      });
    },
    lazyLoadPic() {
      const that = this;
      window.onscroll = this.throttle(
        function() {
          const maskImageCache = document.querySelectorAll('.maskImage');
          const posterImageCache = document.querySelectorAll('.posterImage');
          that.maskImage = Array.prototype.slice.call(
            maskImageCache,
            maskImageCache.length - 40
          );
          that.posterImage = Array.prototype.slice.call(
            posterImageCache,
            posterImageCache.length - 40
          );
          // let wtop =document.documentElement.scrollTop || document.body.scrollTop; // 滚动高度
          if (that.maskImage.length > 0) {
            const wheight = document.documentElement.clientHeight; // 可视区域高度
            let loadedIndex = []; // 存放待删除的索引
            for (let i = 0; i < that.maskImage.length; i++) {
              if (
                that.maskImage[i].getBoundingClientRect().top >= 0 &&
                that.maskImage[i].getBoundingClientRect().top <= wheight
              ) {
                that.maskImage[i].setAttribute(
                  'src',
                  that.maskImage[i].getAttribute('data-src')
                );
                that.posterImage[i].setAttribute(
                  'src',
                  that.posterImage[i].getAttribute('data-src')
                );
                loadedIndex.unshift(i);
              }
            }
            for (let j = 0; j < loadedIndex.length; j++) {
              that.maskImage = Array.prototype.slice.call(
                that.maskImage,
                loadedIndex[j],
                1
              );
              that.posterImage = Array.prototype.splice.call(
                that.posterImage,
                loadedIndex[j],
                1
              );
              // maskImage.splice(loadedIndex[j], 1);
              // posterImage.splice(loadedIndex[j], 1);
            }
          }
        },
        500,
        500
      );
    },
    toShowMetaMenuIndex(index, e) {
      console.log(e);
      e.stopPropagation();
      this.showMetaMenuIndex = this.showMetaMenuIndex === index ? -1 : index;
      console.log(index);
    },
    throttle(fn, delay, mustRun) {
      /**
       * [@param](/user/param)  {Function}
       * [@param](/user/param)  {[Function]}  延时调用函数
       * [@param](/user/param)  {[Number]}  延迟多长时间
       * [@return](/user/return) {[Number]}  至少多长时间触发一次
       */
      let timer = null;
      let previous = null;

      return function() {
        let now = +new Date();
        let context = this;
        let args = arguments;
        if (!previous) previous = now;
        let remaining = now - previous;
        if (mustRun && remaining >= mustRun) {
          fn.apply(context, args);
          previous = now;
        } else {
          clearTimeout(timer);
          timer = setTimeout(function() {
            fn.apply(context, args);
          }, delay);
        }
      };
    },
    addListenScroll() {
      const that = this;
      const distance = 300;
      window.addEventListener('scroll', function() {
        if (!that.scrollLock) {
          if (
            (document.documentElement.scrollTop || document.body.scrollTop) +
              document.documentElement.clientHeight +
              distance >=
            document.documentElement.scrollHeight
          ) {
            that.loadVideo(0);
          }
        }
      });
    },
    loadVideo(times) {
      // load videos you like
      if (times >= this.maxRequestTimes) {
        this.scrollLock = false; // 触底加载数据解锁
        return;
      }
      const that = this;
      that.scrollLock = true;
      const params = that.params;
      params.offset = that.page;
      params.authcode = docCookies.getItem('userid')
        ? totp.getCode(docCookies.getItem('safekey'))
        : '';
      params.timestamp = Math.floor(new Date().getTime() / 1000);
      axios
        .post(apiUrl.vevueAPI + params.action, params)
        .then(res => {
          if (res.data.errcode === 0) {
            that.showVideoEle = true;
            let result = res.data.result;
            if (result.length === 0) {
              that.showNoMore = true;
              that.scrollLock = true; // 彻底加锁
              that.hideLoading = true;
              return;
            }
            that.showNoMore = false;
            const arr = [];
            result.map(item => {
              if (
                ['respond', 'vevue', 'vr', 'topics'].some(value => {
                  return value === item.videotype;
                })
              ) {
                Object.assign(item, {
                  // playerURL: apiUrl.playerURL + '?videoid=' + item.videoid,
                  date: jsFormat.smartTime(new Date(item.timestamp * 1000)),
                  coverURL:
                    apiUrl.videoURL + item.videoid.split('::')[0] + '.jpg',
                  avatar: apiUrl.avatarURL + item.avatar + '.jpg'
                });
                // item.yuan = JSON.parse(item.yuan);
                Object.assign(item.yuan, {
                  nickname: item.yuan.nickname,
                  location_name: item.yuan.location_name,
                  title: item.yuan.title,
                  note: item.yuan.note
                });
                arr.push(item);
              } else if (item.videotype === 'hash') {
                docCookies.setItem(
                  'hashfollow',
                  item.hashfollow,
                  that.cookiesEnd,
                  '/',
                  null
                );
              }
            });
            this.page += 1;
            this.videos = this.videos.concat(arr);
            // this.$nextTick(this.lazyLoadPic);
            that.scrollLock = false; // 触底加载数据解锁
          } else if (res.data.errcode === 202) {
            // 没有更多视频了
            that.scrollLock = true; // 彻底加锁
            that.hideLoading = true;
          } else if (res.data.errcode === 223) {
            // 没有设置头像
            location.href = '/setting';
            that.showSetInfo = true;
            that.scrollLock = true;
            that.hideLoading = true;
          } else if (res.data.errcode === 110) {
            setTimeout(() => {
              that.loadVideo(++times);
            }, 500);
          } else {
            that.scrollLock = false; // 触底加载数据解锁
          }
        })
        .catch(() => {
          that.scrollLock = false; // 触底加载数据解锁
        });
    },
    toRemoveHistory(videoid, index, times) {
      const that = this;
      if (times > that.maxRequestTimes) {
        return;
      }
      this.videos.splice(index, 1);
      axios
        .post(apiUrl.vevueAPI + 'historyrem', {
          videoid,
          userid: this.params.userid,
          authcode: totp.getCode(docCookies.getItem('safekey')),
          cid: docCookies.getItem('cid'),
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          console.log(res);
          if (res.data.errcode === 0 && res.data.result.dorem === true) {
          } else if (res.data.errcode === 110) {
            setTimeout(() => {
              that.toRemoveHistory(videoid, index, ++times);
            }, 500);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    toWatchLater(videoid, sign, times, index) {
      const that = this;
      if (times >= that.maxRequestTimes) {
        return;
      }
      if (!sign) {
        this.videos.splice(index, 1);
      }
      axios
        .post(apiUrl.vevueAPI + 'delay', {
          videoid,
          sign,
          userid: this.params.userid,
          authcode: totp.getCode(docCookies.getItem('safekey')),
          cid: docCookies.getItem('cid'),
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          console.log(res);
        });
    }
  }
};
</script>
<style lang="stylus">
body {
  padding-right: 0px !important; // 解决dialog弹窗 body出现paddingright 5px bug
}

.el-message__icon.el-icon-success {
  display: none !important;
}

.el-message {
  min-width: 160px !important;
  justify-content: center;
}

.load {
  width: 100px;
  height: 100px;
  margin: auto;

  img {
    width: 100%;
    height: 100%;
  }
}

.load.center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
}

.videoMain {
  // min-height: 100vh;
  // padding-bottom: 0px !important;
  // padding-left: 0px !important;
  // padding-right: 0px !important;
  // position: relative;
  background-color: #fafafa;
  color: #333;
  text-align: center;
}

.videoWrapper {
  overflow-y: hidden;
  padding-bottom: 30px;
  min-height: 100vh;

  .metaViewAndData {
    .view {
      margin-right: 3px;
    }

    display: flex;
    margin-top: 5px;
    margin-bottom: 5px;
  }

  .videoCoverBox {
    position: relative;
  }

  .videoAvatarBox {
    position: absolute;
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    right: 4px;
    bottom: 3px;
    border-radius: 50%;

    .ilikes {
      margin: 0 5px;
    }

    .videoAvatar {
      display: block;
      width: 28px;
      height: 28px;
      border: solid 1.5px #fff;
      border-radius: 50%;

      &.ilikeit {
        width: 24px;
        height: 24px;
      }
    }

    .icon-like-heart {
      color: red;
      font-size: 1.2rem;
    }

    .icon-right {
      // margin-top: -2px;
      font-size: 1.2rem;
      color: #fff;
    }
  }

  .videoList.title {
    position: absolute;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 205px;
    text-shadow: #888 1px 1px;
  }

  .nickname {
    margin-top: 10px;
  }

  .title {
    &.videolist {
      position: absolute;
    }

    bottom: 0px;
    left: 12px;
    color: #fff;
    display: block;
    padding: 10px 0;
    font-size: 14px;
    max-height: 40px;
    overflow: hidden;
  }

  .videoMeta {
    font-size: 12px;
    color: #111;
    opacity: 0.6;

    .nickname {
      margin-top: 10px;
    }

    .locationName {
      color: #111;
      display: block;

      .icon-location {
        font-size: 14px;
      }

      font-size: 10px;
      max-height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .videoPoster {
    width: 100%;
    display: block;
    height: 190px;
    opacity: 0.7;
    filter: blur(8px);
  }

  @supports (-ms-ime-align: auto) {
    .videoPoster {
      filter: blur(0px);
    }
  }

  @media screen and (max-width: 1024px) {
    margin-left: 0px !important;
  }

  &.ml0 {
    margin-left: 0px;
  }
}

.videoLists {
  margin: 0 auto;
  width: 660px;
  text-align: left;
  padding-top: 20px;

  .videoItem {
    position: relative;
    flex: 1;

    .videoCoverBox {
      border-radius: 15px;
      overflow: hidden;
      height: 190px;
      width: 320px;
      background-color: #e7e7eb;
    }
  }

  .videolist {
    position: relative;
    width: 340px;
    display: inline-block;
    vertical-align: top;
    padding: 0px 10px;
    margin-bottom: 10px;
  }

  .videoDuration {
    position: absolute;
    right: 0px;
    bottom: 0px;
    width: 40px;
    height: 22px;
    line-height: 22px;
    margin-right: 2px;
    margin-bottom: 2px;
    border: solid 1px #333;
    background-color: #fff;
  }

  .videoTitle {
    font-size: 18px;
    text-align: left;
  }

  .metainfo {
    display: flex;
    justify-content: flex-start;
  }
}

.videoLists, .top-user-container, .tab-select, .followLists {
  @media screen and (min-width: 780px) {
    width: 680px;
  }

  @media screen and (min-width: 1080px) {
    width: 1020px;
  }

  @media screen and (min-width: 1440px) {
    width: 1360px;
  }

  @media screen and (min-width: 1920px) {
    width: 1700px;
  }
}

.maoboli {
  position: absolute;
  overflow: hidden;
  z-index: 1;
  // background-position: center bottom;
  top: 0px;
  margin: 0px;
  width: 100%;
  height: 150px;
  overflow: hidden;

  img {
    position: relative;
    width: 100%;
    height: 190px;
  }
}

.video_time {
  position: absolute;
  left: 5px;
  bottom: 43px;
  z-index: 5;
  padding: 2px;
  border-radius: 2px;
  color: #fff;
  border: solid 1px #fff;
  background: #332E28;
}

.likesmen {
  position: relative;
  background: #fff;
  padding: 5px 8px;
  margin-top: 1rem;
  margin-bottom: 0.2rem;

  .icon-like-heart {
    color: red;
  }

  .tri.top {
    width: 0px;
    height: 0px;
    position: absolute;
    left: 5px;
    top: 0px;
    transform: translateY(-100%);
    border-left: solid 6px rgba(0, 0, 0, 0);
    border-top: solid 6px rgba(0, 0, 0, 0);
    border-right: solid 6px rgba(0, 0, 0, 0);
    border-bottom: solid 6px #fff;
  }

  .likesman {
    padding: 0 3px;
    color: #0094c8;
  }
}

.nomore {
  padding-top: 40px;

  .iconfont {
    font-size: 40px;
  }

  p {
    font-size: 20px;
  }
}

.video-meta-menu {
  display: none;

  &.stay {
    display: block;

    .meta-sel {
      display: block !important;
    }
  }

  cursor: pointer;
  position: relative;
  margin-top: 10px;
  font-size: 20px;
  color: #666;

  .meta-sel {
    position: absolute;
    display: none;
    z-index: 2;
    right: 0px;
    width: 180px;
    max-height: 210px;
    font-size: 12px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
    background: #fff;
    padding: 8px 0px;

    .sel {
      background-color: #fff;
      text-align: left;
      padding: 10px;

      &:hover {
        background: #eeeeee;
      }
    }
  }
}

.videoCoverBox {
  &.orange {
    border: solid orange 2px;

    .video_time {
      bottom: 39px;
    }
  }

  &.purple {
    border: solid #A58CA7 2px;

    .video_time {
      bottom: 39px;
    }
  }
}

.videolist:hover {
  .video-meta-menu {
    display: block;
  }
}

.videoMeta-wrapper {
  .videoMeta {
    flex: 1;
  }

  .del {
    .icon-del {
      cursor: pointer;
    }
  }
}
</style>
