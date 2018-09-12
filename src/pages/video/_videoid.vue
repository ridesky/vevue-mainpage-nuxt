<template>
  <no-ssr>
    <div class="playerWrapper videoid-vue" v-cloak>
      <div class="videoDetail">
        <div class="videofixed">
          <div class="videoBox" :class="{camouflageScreen:camouflageScreen}">
            <div v-if="showPaytoPlay" @click="showPaytoPlay =false" class="paytoplay">
              <i class="iconfont icon-tri_right"></i>
            </div>
            <div v-else>
              <div class="shadow" v-if="tobuydialog"></div>
              <div class="tobuydialog" v-if="tobuydialog">
                <div class="note">Pay to unlock this video</div>
                <div class='pay-img'>
                  <img src="../../assets/images/logo_coin_100.png" alt="Tokens">
                  <span>{{video.price}}</span>
                </div>
                <div class="select">
                  <div class="cancelPay" @click="showPaytoPlay =true">
                    <span>Cancel</span>
                  </div>
                  <div class="toPay" @click="toPay">
                    <span>Pay</span>
                  </div>
                </div>
              </div>
              <div class="noexit" v-if="videoNoExit">
                <i class="iconfont icon-warn"></i> Video Not Found</div>
            </div>
            <div ref='videoDPISelected' class="video-dpi-selected" v-clickoutside='closeShowDPISelect'>
              <div class="video-dpi-set" v-show='!showVRPlayer'>
                <p v-if="playlist.length>0" @click='showDPIUl= !showDPIUl'>{{playlist[videoDPISet].scale}}</p>
                <ul class="video-dpi-ul" v-show="showDPIUl">
                  <li v-for='(item,index) in playlist' :key="item.scale" @click='reloadPlayer(index,item.url)'>{{item.scale}}</li>
                </ul>
              </div>
            </div>
            <div v-show='showVRPlayer'>
              <div id="vrview">
                <div @click='toPlayVrview' ref='vrPlaybutton' class='playbutton iconfont icon-tri_right'></div>
              </div>
            </div>
            <video v-if="!showVRPlayer" id='my-video' class="video video-js vjs-default-skin vjs-big-play-centered" crossorigin="anonymous" webkit-playsinline playsinline>
              <!-- :poster="apiUrl.videoURL + videoUrl +'.jpg'" -->
              <track kind='captions' v-for='item in subtitle' :src='item.vtt' :srclang='item.language' :label='item.label' :key='item.vtt' />
              <!-- <track kind='captions' src='https://dotsub.com/media/5d5f008c-b5d5-466f-bb83-2b3cfa997992/c/chi_hans/vtt' srclang='zh' label='中文' default />
            <track kind='captions' src='https://dotsub.com/media/5d5f008c-b5d5-466f-bb83-2b3cfa997992/c/eng/vtt' srclang='en' label='English'/>
            <track kind='captions' src='https://dotsub.com/media/5d5f008c-b5d5-466f-bb83-2b3cfa997992/c/spa/vtt' srclang='es' label='Spanish' /> -->
            </video>
          </div>
          <div class="danmakuEmit" v-show="!vrMode && video.videoid">
            <div class="controlsButton">
              <i v-show="showDanmaku" class="iconfont icon-opendanmu" @click="toggleDanmaku" title='Hide Danmaku'></i>
              <i v-show="!showDanmaku" class="iconfont icon-closedanmu" @click="toggleDanmaku" title='Show Danmaku'></i>
              <i class="iconfont icon-control" @click='showSetting = !showSetting' title="Danmaku Setting" v-clickoutside='closeShowSetting'>
                <transition name="fade">
                  <div class="settingBox" v-if="showSetting" @blur='showSetting = !showSetting'>
                    <h2>Color</h2>
                    <div class="colorSelector">
                      <p v-for="(color,index) in colors" :key="color.color" @click="colorSelected = colors[index]" :class="{selectBorder:colorSelected.color === color.color}" :style="'background-color:'+ color.color">
                      </p>
                    </div>
                  </div>
                </transition>
              </i>
            </div>
            <div class="inputBox">
              <input v-if="userid" type="text" placeholder="Fire danmaku!!" v-model="danmakuText" @keyup.13="sendDanmaku">
              <input v-else disabled type="text" placeholder="Login to fire danmaku" v-model="danmakuText">
            </div>
            <div v-if="userid">
              <div @click="sendDanmaku" class="sendButton" v-show="countdown.fireDanmaku <=0">Fire</div>
              <div class="sendButton disabled" v-show="countdown.fireDanmaku > 0">{{countdown.fireDanmaku}}</div>
            </div>
            <a v-else :href="'/login?continue='+hashUrl" class="sendButton">Login</a>
          </div>
          <div class="videoMeta op1 left-meta" v-show="video.videoid">
            <div class="flex1">
              <h3 class="title">{{video.title}}</h3>
              <p class="note">{{video.note}}</p>
              <div class="inforender">
                <div class="view">{{video.view}} views {{video.likes}} likes</div>
              </div>
            </div>
            <div class="menu-container">
              <div class="like-tag" v-show="video.isLike" @click="toggleLike(false)">Like
                <i class="iconfont icon-like-heart"></i>
              </div>
              <div class="like-tag" v-show="!video.isLike" @click="toggleLike(true)">Like
                <i class="iconfont icon-like"></i>
              </div>
            </div>
          </div>
        </div>
        <!-- <div class="noVideo" v-else></div> -->
        <div class="videoMeta op1 right-comment">
          <div class="owner" v-show="video.videoid">
            <div class="flexLeft">
              <div class="avatar">
                <router-link :to='"/user/" + video.bywho'>
                  <img :src="video.avatar" alt="" v-show="video.avatar"></router-link>
              </div>
              <div class="ownerInfo">
                <span>{{video.nickname}}</span>
                <span>{{video.time}}</span>
              </div>
            </div>
            <div v-show='userid !== video.bywho'>
              <div class="followed toFollow" v-show="!video.hasfollowed" @click="toFollow(true)">Follow</div>
              <div class="followed toUnfollow" v-show="video.hasfollowed" @click="toFollow(false)">UnFollow</div>
            </div>
          </div>
          <div class="comments" v-show="video.videoid">
            <div class="toWrite">
              <el-tag class="count" size="mini" type="warning">{{video.comment}} Comments</el-tag>
              <div class="showLoading" v-if="commentPack.showLoading">
                <img src="../../assets/images/loading_bar.gif" alt="">
              </div>
              <div v-else>
                <div class="writeBox" v-if="userid">
                  <div class="thumbnail">
                    <img :src="avatar" alt="" class="img">
                  </div>
                  <div class="inputBox">
                    <input type="text" class="textarea" @keyup.enter='toComment' placeholder="Write Comment" rows="1" v-model="commentPack.commentText" autocomplete="off" maxlength="50">
                  </div>
                  <div class="arr" @click="toComment" :class="{opacity2:commentPack.commentText.length===0}">Comment</div>
                </div>
                <div class="writeBox" v-else>
                  <div class="thumbnail">
                    <img :src="avatar" class="img">
                  </div>
                  <div class="inputBox">
                    Please
                    <a class="loginlink" :href="'/login?continue='+hashUrl"> login</a> to post a comment
                  </div>
                </div>
              </div>
            </div>
            <div class="contents">
              <div v-for="(reply,index) in replies" :key="index" class="replyWrap">
                <div class="avatarBox">
                  <router-link :to=" '/user/' + reply.bywho">
                    <img :src="reply.avatar" :onerror='logo'>
                  </router-link>
                </div>
                <div class="con">
                  <div class="user">{{reply.nickname}}</div>
                  <div class="text">{{reply.text}}</div>
                  <div class="info">
                    <span>{{reply.date}}</span>
                    <span class="showReply" @click="showReply(index,reply)" v-show="userid !== reply.bywho">Reply</span>
                  </div>
                  <ul class="replyToMsgLists">
                    <li v-for="(replyToMsg,rtIndex) in reply.replyToMsgs" :key="rtIndex">
                      <div class="avatarBox">
                        <router-link :to=" '/user/' + replyToMsg.bywho">
                          <img :src="replyToMsg.avatar">
                        </router-link>
                      </div>
                      <div class="con">
                        <div class="user">{{replyToMsg.nickname}}</div>
                        <div class="text">{{replyToMsg.text}}</div>
                        <div class="info">
                          <span>{{replyToMsg.date}}</span>
                          <span class="showReply" @click="showReply(index,replyToMsg)" v-show="userid !== replyToMsg.bywho">Reply</span>
                        </div>
                      </div>
                    </li>
                  </ul>
                  <div class="commentBoxRender" v-show="replyPack.showReplyIndex === index">
                    <div class="showLoading" v-if="replyPack.showLoading">
                      <img src="../../assets/images/loading_bar.gif">
                    </div>
                    <div class="writeBox" v-else :class="'showReply'+index">
                      <div class="thumbnail">
                        <img :src="avatar" alt="" class="img">
                      </div>
                      <div class="inputBox">
                        <input type="text" class="textarea" :placeholder="'@' + replyPack.replySelected.nickname" rows="1" v-model="replyPack.replyText" autocomplete="off" maxlength="50">
                      </div>
                      <div class="arr" @click="toReply(0)" :class="{opacity2:replyPack.replyText.length === 0}">Reply</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </no-ssr>
</template>
<script>
import axios from 'axios';
import apiUrl from '../../assets/js/config/urlConfig.js';
import jsFormat from '../../static/tools/jsFormat.js';
import docCookies from '../../static/tools/cookies.js';
import SparkMD5 from 'spark-md5';
import totp from '../../static/tools/totp.js';
// if (process.client) {
//   require('videojs-vr');
// }
// import '../../static/tools/video.min.7.2.0.js';
// import '../../static/tools/danmaku.1.3.5';
if (process.client) {
  // danmakujs();
  // require('../../static/tools/video.min.7.2.0.js');
}
let globalCache = null;
export default {
  layout: 'headNavigation',
  data() {
    return {
      avatar: '', // 用户头像地址
      userid: '',
      apiUrl,
      rightComment: '',
      hashUrl: '',
      showSetting: false,
      vrMode: false,
      tobuydialog: false,
      showPaytoPlay: false,
      videoNoExit: false, // 视频不存在
      maxRequestTimes: 5,
      showVRPlayer: false,
      showDPIUl: false, // 显示分辨率选择
      videoUrl: '', // 视频地址
      videoUrl_real: '', // 收费视频地址
      subtitle: [], // 字幕
      replyPack: {
        showReplyIndex: -1,
        showLoading: false,
        replySelected: {
          nickname: ''
        },
        replyText: ''
      },
      commentPack: {
        showLoading: false,
        commentText: ''
      },
      danmakuText: '', // 弹幕内容
      danmakuColor: '#ffffff', // 弹幕颜色
      camouflageScreen: false, // 伪全屏开关
      video: {
        // 视频信息
        url: 'xxx',
        price: 0
      },
      videoDPI: ['1080', '2K', 'origin'],
      playlist: [],
      videoDPISet: '1080',
      showDanmaku: true,
      author: {},
      lists: [],
      replies: [], // 评论列表,
      colorSelected: '',
      countdown: {
        fireDanmaku: 0
      },
      logo:
        'this.src="' +
        require('../../assets/images/vevue_logo_50x50.png') +
        '"',
      colors: [
        {
          color: '#ffffff',
          title: 'white'
        },
        {
          color: '#000000',
          title: 'black'
        },
        {
          color: '#0000ff',
          title: 'blue'
        },
        {
          color: '#00ff00',
          title: 'green'
        },
        {
          color: '#ff0000',
          title: 'red'
        },
        {
          color: '#ff66ff',
          title: 'pink'
        },
        {
          color: '#660099',
          title: 'purple'
        },
        {
          color: '#ffff00',
          title: 'yellow'
        },
        {
          color: '#3B4B9D',
          title: '3B4B9D'
        },
        {
          color: '#0C91CE',
          title: '0C91CE'
        },
        {
          color: '#098277',
          title: '098277'
        },
        {
          color: '#ffcc99',
          title: 'ffcc99'
        }
      ]
    };
  },
  async asyncData(context) {
    let result = await axios.post(apiUrl.vevueAPI + 'getvideoseo', {
      videoid: context.params.videoid
    });
    result = result.data;
    if (result.errcode === 0) {
      return {
        videoSeoID: context.params.videoid,
        videoSeoTitle: result.title,
        videoSeoNote: result.note
      };
    } else {
      return {
        videoSeoID: context.params.videoid,
        videoSeoTitle: 'Vevue',
        videoSeoNote: 'Vevue'
      };
    }
  },
  head() {
    // Set Meta Tags for this Page
    return {
      title: this.videoSeoTitle,
      script: [],
      meta: [
        {
          property: 'twitter:title',
          content: this.videoSeoTitle
        },
        {
          property: 'twitter:description',
          content: this.videoSeoNote
        },
        {
          property: 'og:type',
          content: 'website'
        },
        {
          property: 'og:title',
          content: this.videoSeoTitle
        },
        {
          property: 'og:site_name',
          content: 'Vevue Og site name'
        },
        {
          property: 'og:image',
          content:
            this.apiUrl.videoURL + this.videoSeoID.split('::main')[0] + '.jpg'
        },
        {
          property: 'og:width',
          content: '512'
        },
        {
          property: 'og:height',
          content: '512'
        },
        {
          property: 'og:description',
          content: this.videoSeoNote
        },
        {
          property: 'description',
          content: this.videoSeoNote
        }
        // {
        //   property: 'twitter:image',
        //   content: this.url + this.$route.params.id + '.jpg'
        // }
      ]
    };
  },
  mounted() {
    if (process.client) {
      globalCache = true;
      document.documentElement.scrollTop = 0;
      Object.assign(this, {
        colorSelected: this.colors[0],
        userid: docCookies.getItem('userid') || '',
        nickname: docCookies.getItem('nickname') || 'User',
        hashUrl: encodeURIComponent(window.location.href),
        videoUrl: this.$route.params.videoid.split('::')[0],
        avatar: docCookies.getItem('avatar') // 初始化avatar
          ? apiUrl.avatarURL + docCookies.getItem('avatar') + '.jpg'
          : 'https://file.vevue.com/avatar/vevue_logo_1000.jpg'
      });
      this.loadVideo();
    }
  },
  updated() {
    this.rightComment = document.querySelector('.right-comment');
  },
  methods: {
    isMobile() {
      var sUserAgent = navigator.userAgent.toLowerCase();
      let bIsIpad = /ipad/i.test(sUserAgent);
      let bIsIphone = /iphone os/i.test(sUserAgent);
      let bIsMidp = /midp/i.test(sUserAgent);
      let bIsUc7 = /rv:1.2.3.4/i.test(sUserAgent);
      let bIsUc = /ucweb/i.test(sUserAgent);
      let bIsCE = /windows ce/i.test(sUserAgent);
      let bIsWM = /windows mobile/i.test(sUserAgent);
      let bIsAndroid = /android/i.test(sUserAgent);
      if (
        bIsIpad ||
        bIsIphone ||
        bIsMidp ||
        bIsUc7 ||
        bIsUc ||
        bIsCE ||
        bIsWM ||
        bIsAndroid
      ) {
        return true;
      } else {
        return false;
        return false;
      }
    },
    GetQueryString(name) {
      var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
      var r = window.location.search.substr(1).match(reg);
      if (r != null) {
        return decodeURI(r[2]);
      }
    },
    toPay() {
      const that = this;
      if (!this.userid.trim()) {
        window.location.href = '/login?continue=' + this.hashUrl;
        return;
      }
      axios
        .post(apiUrl.vevueAPI + 'paytovideo', {
          userid: docCookies.getItem('userid'),
          videoid: that.$route.params.videoid,
          cid: docCookies.getItem('cid'),
          authcode: totp.getCode(docCookies.getItem('safekey')),
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          if (res.data.errcode === 0) {
            window.location.reload();
          } else {
            that.$message.error('Payment failed');
          }
        });
    },
    closeShowDPISelect() {
      if (this.showDPIUl) this.showDPIUl = false;
    },
    closeShowSetting() {
      if (this.showSetting) this.showSetting = false;
    },
    toFollow(bool) {
      const that = this;
      if (!that.userid.trim()) {
        window.location.href = '/login?continue=' + that.hashUrl;
        return;
      }
      that.video.hasfollowed = !that.video.hasfollowed;
      axios
        .post(apiUrl.vevueAPI + 'follow', {
          userid: docCookies.getItem('userid'),
          towho: that.video.bywho,
          sign: bool,
          cid: docCookies.getItem('cid'),
          authcode: totp.getCode(docCookies.getItem('safekey')),
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          if (res.data.errcode === 260) {
            that.video.hasfollowed = true;
          } else if (res.data.errcode === 261) {
            that.video.hasfollowed = false;
          } else {
            that.video.hasfollowed = !that.video.hasfollowed;
          }
        });
    },
    toggleLike(bool) {
      const that = this;
      if (!that.userid.trim()) {
        window.location.href = '/login?continue=' + that.hashUrl;
        return;
      }
      that.video.isLike = !that.video.isLike;
      axios.post(apiUrl.vevueAPI + 'likes', {
        videoid: that.video.videoid,
        userid: docCookies.getItem('userid'),
        sign: bool,
        cid: docCookies.getItem('cid'),
        authcode: totp.getCode(docCookies.getItem('safekey')),
        timestamp: Math.floor(new Date().getTime() / 1000)
      });
    },
    toReply(times) {
      const that = this;
      times = times || 0;
      if (times >= that.maxRequestTimes) {
        that.replyPack.showLoading = false;
        return;
      }
      if (!that.replyPack.replyText.trim()) {
        return;
      }
      that.replyPack.showLoading = true;
      axios
        .post(apiUrl.vevueAPI + 'msg_reply', {
          userid: docCookies.getItem('userid'),
          text: that.replyPack.replyText,
          videoid: that.video.videoid,
          msguid: that.replyPack.replySelected.msguid,
          cid: docCookies.getItem('cid'),
          authcode: totp.getCode(docCookies.getItem('safekey')),
          replyguid: that.replyPack.replySelected.replyguid || '',
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          if (res.data.errcode === 0) {
            that.replyPack.showLoading = false;
            let newReply = {
              avatar: that.avatar,
              bywho: docCookies.getItem('userid'),
              date: jsFormat.smartTime(new Date().getTime()),
              nickname: that.nickname,
              msguid: that.replyPack.replySelected.msguid,
              msgtype: 'reply',
              replyguid: res.data.result.replyguid,
              text: that.replyPack.replyText
            };
            that.replyPack.replyText = '';
            that.replies[that.replyPack.showReplyIndex].replyToMsgs.push(
              newReply
            );
            that.replyPack.showReplyIndex = -1;
          } else if (res.data.errcode === 110) {
            setTimeout(() => {
              that.toReply(++times);
            }, 500);
          } else {
            that.replyPack.showLoading = false;
          }
        })
        .catch(err => {
          that.replyPack.showLoading = false;
          console.error(err);
        });
    },
    showReply(index, reply) {
      if (!this.userid.trim()) {
        window.location.href = '/login?continue=' + this.hashUrl;
        return;
      }
      this.replyPack.replyText = '';
      this.replyPack.showReplyIndex = index;
      this.replyPack.replySelected = reply;
      this.$nextTick(function() {
        this.showEle = document.querySelector('.showReply' + index);
        if (
          this.showEle.getBoundingClientRect().top >
          document.querySelector('.right-comment').getBoundingClientRect()
            .bottom -
            document.querySelector('.right-comment').getBoundingClientRect().top
        ) {
          this.rightComment.scrollTop = this.showEle.offsetTop - 100;
        }
        this.showEle.querySelector('.textarea').focus();
      });
    },
    toComment(times) {
      const that = this;
      times = times || 0;
      if (times >= that.maxRequestTimes) {
        that.commentPack.showLoading = false;
        return;
      }
      if (!that.commentPack.commentText.trim()) {
        return;
      }
      that.commentPack.showLoading = true;
      axios
        .post(apiUrl.vevueAPI + 'msg_video', {
          userid: docCookies.getItem('userid'),
          text: that.commentPack.commentText,
          tovideo: that.video.videoid,
          unitlock: SparkMD5.hash(
            that.commentPack.commentText +
              docCookies.getItem('userid') +
              that.video.videoid
          ),
          cid: docCookies.getItem('cid'),
          authcode: totp.getCode(docCookies.getItem('safekey')),
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          that.commentPack.showLoading = false;
          if (res.data.errcode === 0) {
            let newComment = {
              avatar: that.avatar,
              bywho: docCookies.getItem('userid'),
              date: jsFormat.smartTime(new Date().getTime()),
              msgtype: 'msg',
              msguid: res.data.result.msguid,
              nickname: that.nickname,
              replyToMsgs: [],
              text: that.commentPack.commentText
            };
            that.replies.push(newComment);
            that.commentPack.commentText = '';
          } else if (res.data.errcode === 110) {
            setTimeout(() => {
              that.toComment(++times);
            }, 500);
          }
        })
        .catch(err => {
          that.commentPack.showLoading = false;
          console.error(err);
        });
    },
    sendDanmaku() {
      const that = this;
      if (!that.danmakuText.trim()) {
        return;
      }
      that.countdown.fireDanmaku = 5;
      let countFireDanmaku = setInterval(() => {
        if (that.countdown.fireDanmaku <= 0) clearInterval(countFireDanmaku);
        that.countdown.fireDanmaku -= 1;
      }, 1000);
      let comment = {
        text: that.danmakuText,
        html: false,
        mode: 'rtl',
        time: that.player.currentTime(),
        style: {
          fontSize: '20px',
          color: that.colorSelected.color,
          border: '1px solid #fff',
          textShadow:
            that.colorSelected.color === '#000000'
              ? '-1px -1px #fff, -1px 1px #fff, 1px -1px #fff, 1px 1px #fff'
              : '-1px -1px #000, -1px 1px #000, 1px -1px #000, 1px 1px #000'
        }
      };
      that.danmaku.emit(comment);
      axios
        .post(apiUrl.vevueAPI + 'biubiudanmaku', {
          userid: docCookies.getItem('userid') || '',
          tovideo: that.video.videoid,
          danmu: that.danmakuText,
          textcolor: that.colorSelected.color,
          offset: that.player.currentTime().toString(),
          cid: docCookies.getItem('cid'),
          authcode: totp.getCode(docCookies.getItem('safekey')),
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          if (res.data.errcode === 0) {
            that.danmakuText = '';
          }
        });
    },
    reloadPlayer(index, url) {
      const that = this;
      if (url === that.player.currentSource().src) {
        return;
      }
      that.showDPIUl = false;
      that.videoDPISet = index;
      const tempTime = that.player.currentTime();
      that.player.src({
        src: url,
        type: url.indexOf('m3u8') > 0 ? 'application/x-mpegURL' : 'video/mp4'
      });
      that.player.on('loadeddata', function() {
        that.player.currentTime(tempTime);
        that.player.play();
      });
    },
    toPlayVrview() {
      this.vrView.play();
      this.$refs.vrPlaybutton.style.display = 'none';
    },
    loadPlayer(vrMode) {
      const that = this;
      that.player = videojs(
        'my-video',
        {
          sources: [
            {
              src: that.playlist[that.videoDPISet].url,
              // src: that.playlist[0].url,
              // src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
              // 旧格式
              // apiUrl.videoURL +
              // (that.videoUrl_real || that.videoUrl) +
              // '.mp4',
              type:
                that.playlist[that.videoDPISet].url.indexOf('m3u8') > 0
                  ? 'application/x-mpegURL'
                  : 'video/mp4'
              // withCredentials: true
            }
          ],
          poster:apiUrl.videoURL + that.video.videoid +'.jpg',
          controls: true,
          autoplay: true,
          textTrackSettings: false
        },
        function() {
          window.player = this;
          window.onresize = function() {
            that.danmaku.resize();
          };
          (function() {
            var newbtn = that.$refs.videoDPISelected;
            var controlBar = document.getElementsByClassName(
              'vjs-control-bar'
            )[0];
            var insertBeforeNode = document.getElementsByClassName(
              'vjs-fullscreen-control'
            )[0];
            controlBar.insertBefore(newbtn, insertBeforeNode);
          })();
          document.addEventListener('webkitfullscreenchange', function() {
            that.danmaku.resize();
          });
          document.addEventListener('mozfullscreenchange', function() {
            that.danmaku.resize();
          });
          that.loadDanmaku();
        }
      );
      that.player.on('loadeddata', function() {
        if (!that.isPc()) {
          let fullScreenButton = document.querySelector(
            '.vjs-fullscreen-control'
          );
          let newFullScreenButton = fullScreenButton.cloneNode(true);
          fullScreenButton.parentNode.replaceChild(
            newFullScreenButton,
            fullScreenButton
          );
          if (newFullScreenButton.addEventListener) {
            newFullScreenButton.addEventListener('touchstart', function(e) {
              that.camouflageScreen = !that.camouflageScreen;
            });
          }
        }
      });
    },
    loadDanmaku() {
      const that = this;
      axios
        .post(apiUrl.vevueAPI + 'getdanmakus', {
          videoid: that.video.videoid
        })
        .then(res => {
          if (res.data.errcode === 0) {
            this.danmaku = new Danmaku();
            let danmaku = this.danmaku;
            let result = res.data.result;
            const length = result.length;
            const danmakuPack = [];
            for (let i = 0; i < length; i++) {
              const danmaku = result[i];
              danmakuPack.push({
                text: danmaku.text,
                html: false,
                mode: 'rtl',
                time: danmaku.offset,
                style: {
                  fontSize: '20px',
                  color: danmaku.color,
                  border:
                    docCookies.getItem('userid') === danmaku.bywho
                      ? '1px solid #fff'
                      : 'none',
                  textShadow:
                    danmaku.color === '#000000'
                      ? '-1px -1px #fff, -1px 1px #fff, 1px -1px #fff, 1px 1px #fff'
                      : '-1px -1px #000, -1px 1px #000, 1px -1px #000, 1px 1px #000'
                }
              });
            }
            danmaku.init({
              video: document.getElementById('my-video_html5_api'),
              // engine: 'canvas',
              comments: danmakuPack
            });
          }
        });
    },
    isPc() {
      let sUserAgent = navigator.userAgent.toLowerCase();
      let bIsIpad = /ipad/i.test(sUserAgent);
      let bIsIphone = /iphone os/i.test(sUserAgent);
      let bIsMidp = /midp/i.test(sUserAgent);
      let bIsUc7 = /rv:1.2.3.4/i.test(sUserAgent);
      let bIsUc = /ucweb/i.test(sUserAgent);
      let bIsCE = /windows ce/i.test(sUserAgent);
      let bIsWM = /windows mobile/i.test(sUserAgent);
      let bIsAndroid = /android/i.test(sUserAgent);
      if (
        bIsIpad ||
        bIsIphone ||
        bIsMidp ||
        bIsUc7 ||
        bIsUc ||
        bIsCE ||
        bIsWM ||
        bIsAndroid
      ) {
        return false;
      } else {
        return true;
      }
    },
    toggleDanmaku() {
      if (!this.showDanmaku) {
        this.danmaku.show();
      } else {
        this.danmaku.hide();
      }
      this.showDanmaku = !this.showDanmaku;
    },
    getVideoAddr() {
      let result = jsFormat.getQueryString('videoid');
      this.videoUrl =
        result != null && result.toString().length > 1 ? result : null;
    },
    loadVideo() {
      const that = this;
      axios
        .post(apiUrl.vevueAPI + 'getvideoinfo', {
          videoid: this.$route.params.videoid,
          userid: docCookies.getItem('userid') || '-',
          cid: docCookies.getItem('cid') || '-',
          authcode: docCookies.getItem('safekey')
            ? totp.getCode(docCookies.getItem('safekey'))
            : '',
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          if (res.data.errcode === 0) {
            if (!res.data.result) {
              // 返回为 null 视频被禁
              that.videoNoExit = true;
              return;
            }
            that.videoUrl_real = res.data.result.videoid_real.split('::')[0];
            that.playlist = res.data.result.playlist;
            that.videoDPISet = 0;
            that.subtitle = res.data.result.subtitle || [];
            that.playlist.map((item, index) => {
              if (item.scale === '1080P') {
                that.videoDPISet = index;
              }
            });
            if (res.data.result.mode_vr === '1') {
              that.vrMode = true; // 设置vr开关
              if (window.navigator.userAgent.indexOf('Chrome') >= 0) {
                // php的true false 转给前端为 '1' 和 '0'
                let vrWidth = null;
                let vrHeight = null;
                if (window.innerWidth < 1920) {
                  vrWidth = 640;
                  vrHeight = 360;
                } else {
                  vrWidth = 1280;
                  vrHeight = 720;
                }
                that.showVRPlayer = true;
                that.vrView = new VRView.Player('#vrview', {
                  video:
                    apiUrl.videoURL +
                    (that.videoUrl_real || that.videoUrl) +
                    '.mp4',
                  width: vrWidth,
                  height: vrHeight
                });
              } else {
                that.$nextTick(that.loadPlayer);
              }
            } else {
              that.$nextTick(that.loadPlayer);
            }
            const data = res.data.result;
            // let yuan = JSON.parse(data.yuan);
            let yuan = data.yuan;
            Object.assign(yuan, {
              time: jsFormat.formatTime(new Date(yuan.timestamp * 1000)),
              title: yuan.title,
              note: yuan.note,
              nickname: yuan.nickname,
              comment: data.comment,
              likes: data.likes,
              view: data.view,
              isLike: data.isLike,
              hasfollowed: data.hasfollowed,
              avatar: apiUrl.avatarURL
                ? apiUrl.avatarURL + data.avatar + '.jpg'
                : '../../assets/images/icon2.png'
            });
            this.video = yuan;
            // !!!
            // document.title = this.video.title;
            this.loadComments();
          } else if (res.data.errcode === 281) {
            that.tobuydialog = true;
            that.video.price = res.data.price;
          } else if (res.data.errcode === 110) {
            if (!docCookies.getItem('userid')) {
              that.tobuydialog = true;
              that.video.price = res.data.price;
            }
          } else {
            that.videoNoExit = true;
          }
        });
    },
    loadComments() {
      axios
        .post(apiUrl.vevueAPI + 'getcomments', {
          videoid: this.$route.params.videoid
        })
        .then(res => {
          let data = res.data.result;
          let replies = data;
          const newReplies = [];
          // let replyLength = replies.length;
          for (let i = 0; i < replies.length; i++) {
            // let obj = {};
            if (replies[i].msgtype === 'msg') {
              replies[i].nickname = replies[i].nickname
                ? replies[i].nickname
                : 'unknown author';
              replies[i].avatar = replies[i].avatar
                ? apiUrl.avatarURL + replies[i].avatar + '.jpg'
                : require('../../assets/images/icon.png');
              replies[i].text = replies[i].text;
              replies[i].replyToMsgs = [];
              replies[i].date = jsFormat.formatTime(
                new Date(replies[i].timestamp * 1000)
              );
              // this.replies.push(obj);
              newReplies.push(replies[i]);
              replies.splice(i, 1);
              i--;
            }
          }
          let replyLength = replies.length;
          for (let i = 0; i < replyLength; i++) {
            if (replies[i].msgtype === 'reply') {
              for (let j = 0; j < newReplies.length; j++) {
                if (replies[i].msguid === newReplies[j].msguid) {
                  replies[i].nickname = replies[i].nickname
                    ? replies[i].nickname
                    : 'unknown author';
                  replies[i].avatar = replies[i].avatar
                    ? apiUrl.avatarURL + replies[i].avatar + '.jpg'
                    : '../../assets/images/icon.png';
                  replies[i].text = replies[i].text;
                  replies[i].date = jsFormat.formatTime(
                    new Date(replies[i].timestamp * 1000)
                  );
                  newReplies[j].replyToMsgs.push(replies[i]);
                  j = newReplies.length; // 退出循环
                }
              }
            }
          }
          this.replies = newReplies;
        });
    }
  },
  beforeRouteLeave(to, from, next) {
    try {
      if (this.player) {
        this.player.dispose(); // 销毁video组件
      }
      this.$destroy(); // 销毁vue组件 目的是为了不缓存页面数据
    } catch (error) {
      document.title = 'Vevue';
      next();
    }
    document.title = 'Vevue';
    next();
  }
};
</script>
<style lang="stylus">
.videoid-vue {
  text-align: center;

  .showLoading {
    margin: 0 auto;
    width: 40px;
    height: 40px;

    img {
      display: block;
      width: 100%;
      height: 100%;
    }
  }

  .playbutton {
    cursor: pointer;
  }

  .video-js {
    .vjs-time-control {
      display: block !important;
      padding-left: 0px !important;
      padding-right: 0px !important;
    }

    .vjs-time-divider {
      // display: none;
      padding: 0px !important;
    }

    .vjs-remaining-time-display {
      display: none !important;
    }

    .vjs-duration {
      // display: none;
    }
  }

  .writeBox {
    display: flex;
    align-items: center;

    .arr {
      background: #409EFF;
      color: #fff;
      padding: 5px 8px;
      font-size: 15px;
      border-radius: 3px;
      margin-left: 8px;
      cursor: pointer;
    }
  }

  .thumbnail {
    margin-right: 10px;

    img {
      display: block;
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
  }

  .inputBox.tologin {
    display: block !important;
  }

  .inputBox {
    flex: 1;
    display: flex;
    padding: 5px 0px;
    font-family: initial;
    border-bottom: solid 1px #ccc;

    .loginlink {
      color: #fff;
      font-size: 12px;
      background-color: #409eff;
      padding: 4px 9px;
      margin: 0 5px;
      border-radius: 3px;
    }

    .textarea {
      font-family: inherit;
      width: 100%;
      resize: none;
      border: none;
      background: transparent;
      outline: none;
    }
  }

  .left-meta {
    padding: 5px 0px !important;
    width: 640px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .danmakuEmit {
    position: relative;
    // overflow:hidden;
    height: 40px;
    padding: 0 20px;
    width: 640px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #fff;
    height: 40px;
    background: rgba(43, 51, 63, 1);

    .settingBox {
      border-top-right-radius: 3px;
      border: solid 1px #2b333f;
      width: 202px;
      height: 85px;
      position: absolute;
      top: 0px;
      left: 0px;
      transform: translateY(-100%);
      background-color: rgba(43, 51, 63, 1);
      outline: none;

      h2 {
        font-size: 14px;
        text-align: left;
        margin-left: 5px;
        margin-top: 5px;
      }

      .colorSelector {
        display: flex;
        flex-wrap: wrap;

        &>p {
          width: 20px;
          margin: 5px;
          height: 20px;
          border-radius: 50%;
          opacity: 0.8;
        }

        .selectBorder {
          border: solid 2px orange;
        }

        &>p:hover {
          opacity: 1;
        }
      }
    }

    .icon-opendanmu, .icon-closedanmu {
      cursor: pointer;
      font-size: 26px;
    }

    .icon-control {
      cursor: pointer;
      font-size: 26px;
      margin: 0 3px;
    }

    .inputBox {
      flex: 1;
      margin: 0 20px;
      border-bottom: none;

      input {
        cursor: text;
        height: 25px;
        border-radius: 3px;
        padding: 5px;
        border: none;
        width: 100%;
        outline: none;
      }
    }

    .fade-enter-active, .fade-leave-active {
      transition: all 0.5s;
    }

    .fade-enter, .fade-leave-to { /* .fade-leave-active below version 2.1.8 */
      opacity: 0;
      transform: translateX(-100%) translateY(-100%);
    }

    .sendButton {
      color: #fff;
      cursor: pointer;
      height: 25px;
      padding: 3px 10px;
      background-color: #409EFF;
      display: flex;
      align-items: center;
      border-radius: 3px;
      min-width: 50px;
      justify-content: center;
    }
  }

  .videoDetail {
    display: flex;
    overflow: hidden;
    justify-content: center;
    padding-top: 10px;

    .videofixed {
      overflow: hidden;
    }

    .videoBox {
      position: relative;
      overflow: hidden;
      height: 360px;
      width: 640px;

      .shadow {
        position: absolute;
        top: 0px;
        left: 0px;
        bottom: 0px;
        right: 0px;
        z-index: 1;
        background: #333;
        opacity: 0.8;
      }

      .paytoplay {
        align-items: center;
        justify-content: center;
        display: flex;
        position: absolute;
        cursor: pointer;
        height: 50px;
        border-radius: 6px;
        border: solid 1.5px #fff;
        width: 100px;
        z-index: 2;
        font-size: 35px;
        background-color: rgba(115, 133, 159, 0.5);
        color: #fff;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);
      }

      .tobuydialog {
        position: absolute;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        border: solid #333 1px;
        background: #fff;
        color: #333;
        z-index: 2;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);
        width: 250px;
        height: 170px;
        padding: 10px;
        border-radius: 5px;
        font-size: 14px;

        .note {
          font-size: 16px;
        }

        .pay-img {
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 17px;

          img {
            width: 20px;
            height: 20px;
            margin: 0 8px;
          }
        }

        .select {
          display: flex;
        }

        .cancelPay {
          cursor: pointer;
          width: 100px;
          padding: 5px 0;
          margin: 0 auto;
          background: #ccc;
          color: #fff;
          border-radius: 3px;
          align-items: center;
        }

        .toPay {
          cursor: pointer;
          width: 100px;
          padding: 5px 0;
          margin: 0 auto;
          background: orange;
          color: #fff;
          border-radius: 3px;
          align-items: center;
        }
      }

      .noexit {
        position: absolute;
        top: 50%;
        z-index: 2;
        left: 50%;
        font-size: 2rem;
        color: #fff;
        transform: translateX(-50%) translateY(-50%);
      }

      .video {
        left: 0px;
        width: 100%;
        height: 100%;
        background-color: #333;
      }
    }

    .videoMeta {
      padding: 0px 8px;

      &.op1 {
        opacity: 1;
      }

      .title {
        text-align: left;
        font-size: 18px;
        color: #333;
      }

      .note {
        text-align: left;
      }

      .inforender {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        padding-bottom: 5px;
        border-bottom: solid 1px #eee;

        .view {
          display: flex;
          align-items: center;
        }
      }

      .menu-container {
        display: flex;
        font-size: 20px;
        color: #ccc;
        justify-content: flex-end;
        margin-right: 20px;

        .like-tag {
          background-color: #fff;
          cursor: pointer;
          color: #f56c6c;
          padding: 0 10px;
          height: 32px;
          line-height: 30px;
          font-size: 12px;
          border: 1px solid hsla(0, 87%, 69%, 0.2);
          border-radius: 4px;
        }

        .iconfont {
          // background-color: #fff;
          cursor: pointer;
          margin-left: 5px;
        }

        .icon-like-heart {
          color: #ED4546;
        }
      }

      .owner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 10px 0;
        padding-top: 10px;
        padding-bottom: 15px;
        border-bottom: solid 1px #eee;

        .flexLeft {
          display: flex;
        }

        .avatar {
          img {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            margin-right: 10px;
          }
        }

        .ownerInfo {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          align-items: flex-start;
        }

        .followed {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #fff;
          border-radius: 3px;
          width: 100px;
          height: 35px;

          &.toUnfollow {
            background-color: #ccc;
          }

          &.toFollow {
            background-color: #409eff;
            color: #fff;
          }
        }
      }

      .comments {
        .contents {
          .replyWrap {
            display: flex;
            margin: 20px 0px;

            .showReply {
              margin-left: 5px;
              cursor: pointer;
            }

            .avatarBox {
              width: 40px;
              height: 40px;

              img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
              }
            }

            .con {
              flex: 1;
              border-bottom: solid 1px #ccc;

              .replyToMsgLists {
                padding-top: 10px;

                .con {
                  border-bottom: none;
                }

                li {
                  .avatarBox {
                    width: 30px;
                    height: 30px;
                  }

                  display: flex;
                }
              }

              &>div {
                margin-bottom: 5px;
              }

              .user {
                color: #6d757a;
                font-weight: bold;
              }

              .text {
                font-size: 16px;
                word-break: break-word;
                margin: 12px 0px;
              }

              .info {
                color: #99a2aa;
              }

              text-align: left;
              margin-left: 25px;
            }
          }
        }

        .toWrite {
          text-align: center;
          font-size: 16px;

          .count {
            margin: 10px 0px;
          }
        }
      }
    }
  }

  .video-dpi-selected {
    position: relative;
    user-select: none;
    flex-grow: 1;
    justify-content: flex-end;
    display: flex;
    // height: 100%;
    align-items: center;
    margin-right: 5px;

    .video-dpi-set {
      position: relative;
      cursor: pointer;
      height: 100%;

      &>p {
        line-height: 3;
      }
    }

    .video-dpi-ul {
      position: absolute;
      width: 100px;
      background: #1E242C;
      bottom: 29px;
      left: -34px;

      li {
        &:hover {
          background: #343434;
        }

        padding: 10px 0px;
      }
    }
  }

  .right-comment {
    width: 345px;
    height: 504px;
    overflow-y: auto;
    padding: 0 8px;
    position: relative;
  }

  .videoBox.camouflageScreen {
    position: absolute;
    height: 100vh;
    width: 100%;
    top: 0px;
    z-index: 999;
    left: 0px;
  }

  #vrview {
    position: relative;

    .playbutton {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      background: rgba(0, 0, 0, 0.5);
      width: 100%;
      height: 100%;
      font-size: 100px;
      color: #fff;
    }
  }

  @media screen and (min-width: 1440px) {
    .videoDetail .videoBox, .danmakuEmit, .left-meta, #vrview iframe {
      width: 850px;
    }

    .videoDetail .videoBox, #vrview iframe {
      height: 480px;
    }

    .right-comment {
      height: 624px;
    }
  }

  @media screen and (min-width: 1920px) {
    .videoDetail .videoBox, .danmakuEmit, .left-meta, #vrview iframe {
      width: 1280px;
    }

    .videoDetail .videoBox, #vrview iframe {
      height: 720px;
    }

    .right-comment {
      height: 864px;
    }
  }

  .vjs-control-bar {
    align-items: center;

    button {
      outline: none;
    }
  }

  .vjs-control-bar {
    .vjs-progress-control.vjs-control {
      .vjs-progress-holder {
        margin: 0px 5px;
      }

      position: absolute;
      top: 0px;
      left: 0px;
      height: 20px;
      width: 100%;
      transform: translateY(-100%);
      align-items: flex-end;
    }
  }

  .vjs-big-play-button {
    // display: none !important;
  }

  .vjs-text-track-display div {
    background: none !important;
    color: white;
    text-shadow: -1px -1px #000, -1px 1px #000, 1px -1px #000, 1px 1px #000;
  }

  .opacity2 {
    opacity: 0.2;
  }
}
</style>

