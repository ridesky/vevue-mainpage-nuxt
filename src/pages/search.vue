<template>
    <div class="search-vue">
        <div class="videoWrapper videoMain">
            <div class="videoList-wrapper">
                <div v-show="!showSwitch.hideLoading" class="load" :class="{center:videos.length === 0}">
                    <img src="../assets/images/loading_bar.gif" alt="">
                </div>
                <ul class="videoLists scrollload-content">
                    <li class="videolist" v-for='(video,index) in videos' :key='index'>
                        <div class="videoItem">
                            <div class="videoCoverBox" :class="{orange:0<video.price&&video.price<=70,purple:video.price>70}">
                                <div class="videoAvatarBox">
                                    <router-link :to=" '/user/' + video.yuan.bywho" tanrget='_blank'>
                                        <img :src="video.avatar" alt="avatar" class="videoAvatar" :onerror='defaultAvatarLogo'>
                                    </router-link>
                                </div>
                                <div class="maoboli">
                                    <router-link :to=" '/video/' + video.videoid">
                                        <img :src="video.coverURL" alt="" class="maskImage" :onerror='defaultCoverLogo'>
                                    </router-link>
                                </div>
                                <div class="video_time" v-if="video.video_time">{{jsFormat.sec_to_time(video.video_time)}}</div>
                                <router-link :to=" '/video/' + video.videoid" :title="video.yuan.note || video.yuan.title">
                                    <img :src="video.coverURL" alt="" class="videoPoster posterImage" :onerror='defaultCoverLogo'>
                                    <!-- <img src="../../pages/home/assets/images/vevue_preimage.png" alt=""> -->
                                </router-link>
                                <router-link :to=" '/video/' + video.videoid" class="videoList title note" v-if="video.yuan.title" :title="video.yuan.title">{{video.yuan.title}}</router-link>
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
                                    <p v-if="video.copyright_status !='NO'">Copyright Status: {{video.copyright_status}} <br/>BlockNumber: {{video.copyright_blocknumber}} Copyright ID {{video.copyright_id}}</p>
                                    <p></p>
                                    <div class="metaViewAndData">
                                        <p class="view">{{video.view}} Views</p>
                                        <p class="date"> {{video.date}}</p>
                                    </div>
                                    <a target="_blank" :href=" 'https://maps.google.com/maps?q=' + video.location" v-show='video.yuan.location_name' :title="video.yuan.location_name" class="locationName">
                                        <i class="iconfont icon-location"></i>{{video.yuan.location_name}}</a>
                                </div>
                                <!-- <div class="video-meta-menu iconfont icon-menu_col" :class="{'stay':showMetaMenuIndex === index}" v-on:click.self="toShowMetaMenuIndex(index,$event)">
                                        <ul class="meta-sel">
                                            <li class="sel" @click="clipAddress('.clipBtn'+index)" :class="'clipBtn'+index" :aria-label='location.origin+"/video/"+video.videoid'>
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
                                    </div> -->
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
                <div class="nomore" v-show="showSwitch.showNomore">
                    <i class="iconfont icon-nomore"></i>
                    <p>No result</p>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import axios from 'axios';
import apiUrl from '../assets/js/config/urlConfig.js';
import docCookies from '../static/tools/cookies.js';
import totp from '../static/tools/totp.js';
import jsFormat from '../static/tools/jsFormat.js';
let globalVideos = null;
export default {
  layout: 'headNavigation',
  data() {
    const that = this;
    return {
      apiUrl,
      jsFormat,
      location: process.client ? window.location : {},
      defaultAvatarLogo:
        'this.src="' + require('../assets/images/vevue_logo_50x50.png') + '"',
      defaultCoverLogo:
        'this.src="' + require('../assets/images/default_cover.png') + '"',
      videos: globalVideos || [],
      search: {
        keyword: '',
        history: process.client
          ? docCookies.getItem('searchHistory')
            ? docCookies.getItem('searchHistory').split(',')
            : [] || []
          : []
      },
      showSwitch: {
        hideLoading: true,
        showNomore: false
      }
    };
  },
  mounted() {
    if (this.$route.query.keyword) {
      this.searchVideo(this.$route.query.keyword, false);
    } else {
      this.showSwitch.showNomore = true;
    }
  },
  beforeRouteUpdate(to, from, next) {
    if (to.query.keyword) {
      this.searchVideo(to.query.keyword, false);
    } else {
      this.showSwitch.showNomore = true;
    }
    next();
  },
  beforeRouteLeave(to, from, next) {
    globalVideos = this.videos;
    next();
  },
  methods: {
    searchVideo(keyword, onlykey) {
      this.search.keyword = keyword;
      this.videos = []; // 清空之前的视频列表
      this.showSwitch.showNomore = false; // 如果之前的搜索没有结果 并且显示了 no result 图标,关闭之
      this.showSwitch.hideLoading = false;
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        axios
          .post(apiUrl.vevueAPI + 'scan', {
            userid: docCookies.getItem('userid')||'-',
            authcode:docCookies.getItem('userid')? totp.getCode(docCookies.getItem('safekey')):'',
            cid: docCookies.getItem('cid'),
            timestamp: Math.floor(new Date().getTime() / 1000),
            keyword: keyword,
            onlykey: onlykey
          })
          .then(res => {
            if (res.data.errcode === 0) {
              this.showSwitch.hideLoading = true;
              const data = res.data;
              this.search.keylist = data.keylist || [];
              let videos = res.data.videolist || [];
              if (videos.length === 0) {
                this.showSwitch.showNomore = true;
              } else {
                this.showSwitch.showNomore = false;
              }
              videos.map(item => {
                if (
                  ['respond', 'vevue', 'vr', 'topics'].some(value => {
                    return value === item.videotype;
                  })
                ) {
                  Object.assign(item, {
                    playerURL: apiUrl.playerURL + '?videoid=' + item.videoid,
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
                  this.videos = videos;
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
              //   this.videos = data.videolist;
            }
          })
          .catch(() => {
            this.showSwitch.hideLoading = true;
          });
      }, onlykey ? 500 : 0);
    }
  }
};
</script>
<style lang="stylus">
.search-vue {
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
            .view:after {
                content: '•';
                margin: 0 4px;
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
        position: absolute;
        right: 0px;
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
}
</style>
