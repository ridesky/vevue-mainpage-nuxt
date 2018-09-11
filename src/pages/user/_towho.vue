<template>
    <div class="user-page-wrapper">
        <no-ssr>
            <div class="top-user-container">
                <div class="user-meta-info">
                    <div class="user-image-container" v-show="userInfo.avatar">
                        <img :src="userInfo.avatar" alt="" :onerror='logo'>
                    </div>
                    <div class="user-text-info">
                        <p class="nick-meta">
                            <span class="nickname">{{userInfo.nickname}}</span>
                            <i v-show="userInfo.authorsign" class="iconfont icon-authorsign"></i>
                            <span v-show="userInfo.authorsign">{{userInfo.authorsign}}</span>
                        </p>
                        <p class="uid" v-show="userInfo.uid">UID {{userInfo.uid}}</p>
                        <p class="signature">{{userInfo.signature}}</p>
                        <div v-if="userid === towho" class="vevue_score" v-show="userInfo.transactionList">
                            <img @click="showTransactionList = true" src="../../assets/images/logo_coin_100.png" alt="score">
                            <div @click="showTransactionList = true" class="token_left">{{userInfo.amount}}</div>
                            <el-button type="danger" style="background:#EE2A69;color:#fff" class="plain deposit" size='mini' @click="showQRCode">Deposit</el-button>
                            <el-dialog width='25%' title="Score" :visible.sync='showTransactionList' class="transaction_dialog">
                                <div v-for="item in userInfo.transactionList" :key='item.id' class="transactionList">
                                    <div class="item_show">
                                        <div class="item_type">
                                            {{transactionConfig[item.type]? transactionConfig[item.type]['enWord'] : item.type}}
                                        </div>
                                        <div v-if="transactionConfig[item.type]" class="item_amount" :style="'color:'+transactionConfig[item.type]['color']">
                                            {{transactionConfig[item.type]?transactionConfig[item.type]['symbol'] : '' }}{{item.amount}}
                                        </div>
                                        <div v-else>
                                            {{item.amount}}
                                        </div>
                                        <div class="item_date">
                                            {{jsFormat.smartTime(new Date(item.date *1000))}}
                                        </div>
                                    </div>
                                    <div class="item_id">
                                        ID: {{item.id}}
                                    </div>
                                </div>
                            </el-dialog>
                            <el-dialog :visible.sync='showAddrQRCode' width='30%' class="qrcode_dialog">
                                <div id="qrcode"></div>
                                <h3 class="addr_text">{{userInfo.addr_vevue}}</h3>
                                <div @click="clipText('.addr_btn')" class="addr_btn" :aria-label='userInfo.addr_vevue'>Copy Address</div>
                                <div class="deposit_info">*VEVUE address only accepts VEVUE deposit. Any other assets deposited to VEVUE address will be irretrievable</div>
                            </el-dialog>
                        </div>
                        <div v-else>
                            <p> {{userInfo.followers}} Followers {{userInfo.following}} Following</p>
                            <div class="followed toFollow" v-show="!userInfo.hasfollowed" @click="toFollow(true,0)">Follow</div>
                            <div class="followed toUnfollow" v-show="userInfo.hasfollowed" @click="toFollow(false,0)">UnFollow</div>
                        </div>
                    </div>
                    <div class="subscribe">

                    </div>
                </div>
            </div>
        </no-ssr>
        <no-ssr>
            <div class="tab-container">
                <el-menu :default-active="activeIndex" class="el-menu-demo tab-select" mode="horizontal">
                    <router-link :to="'/user/' +towho +'/works'" active-class="bottom-color">
                        <el-menu-item :index="'/user/' +towho +'/works'">{{userInfo.vevue}}<br/> WORKS </el-menu-item>
                    </router-link>
                    <router-link :to="'/user/' +towho+'/respond'" active-class="bottom-color">
                        <el-menu-item :index="'/user/' +towho+'/respond'">{{userInfo.respond}} <br/> RESPOND</el-menu-item>
                    </router-link>
                    <router-link :to="'/user/' +towho+'/likes'" active-class="bottom-color">
                        <el-menu-item :index="'/user/' +towho+'/likes'">{{userInfo.likes}} <br/> LIKES</el-menu-item>
                    </router-link>
                    <router-link :to="'/user/' +towho +'/followers'" active-class="bottom-color">
                        <el-menu-item :index="'/user/' +towho+'/followers'">{{userInfo.followers}} <br/> FOLLOWERS</el-menu-item>
                    </router-link>
                    <router-link :to="'/user/' +towho +'/following'" active-class="bottom-color">
                        <el-menu-item :index="'/user/' +towho+'/following'">{{userInfo.following}} <br/> FOLLOWING</el-menu-item>
                    </router-link>
                </el-menu>
            </div>
        </no-ssr>
        <no-ssr>
            <div>
                <keep-alive>
                    <video-list :listenScroll='true' :params="params['works']" v-if="type === 'works' || type === ''"></video-list>
                </keep-alive>
                <keep-alive>
                    <video-list :listenScroll='true' :params="params['respond']" v-if="type === 'respond'"></video-list>
                </keep-alive>
                <keep-alive>
                    <video-list :listenScroll='true' :params="params['likes']" v-if="type === 'likes'"></video-list>
                </keep-alive>
                <keep-alive>
                    <follow-content :listenScroll='true' :params="params['followers']" v-if="type ==='followers'"></follow-content>
                </keep-alive>
                <keep-alive>
                    <follow-content :listenScroll='true' :params="params['following']" v-if="type ==='following'"></follow-content>
                </keep-alive>
            </div>
        </no-ssr>
        <!-- <nuxt-child></nuxt-child> -->
    </div>
</template>
<script>
import axios from 'axios';
import videoList from '../../components/videoList.vue';
import followContent from '../../components/followerContent.vue';
import apiUrl from '../../assets/js/config/urlConfig.js';
import jsFormat from '../../static/tools/jsFormat.js';
import docCookies from '../../static/tools/cookies.js';
import totp from '../../static/tools/totp.js';
import transactionConfig from '../../assets/js/config/transactionConfig.js';
import ClipboardJS from 'clipboard';
if (process.browser) {
  require('../../static/tools/qrcode.min.js');
}
let globalUserInfoCache = {};
export default {
  layout: 'headNavigation',
  components: {
    videoList,
    followContent
  },
  data() {
    const that = this;
    let result = {
      params: '',
      type: '',
      jsFormat,
      transactionConfig,
      showTransactionList: false, // 交易列表 dialog 开关
      showAddrQRCode: false, // 地址二维码 dialog 开关
      maxRequestTimes: 5,
      hashUrl: '',
      paramsSelect: '',
      towho: this.$route.params.towho,
      type: this.$route.params.type,
      activeIndex:
        '/user/' +
        this.$router.history.current.params.towho +
        '/' +
        this.$router.history.current.params.type,
      userInfo: globalUserInfoCache,
      logo:
        'this.src="' +
        require('../../assets/images/vevue_logo_50x50.png') +
        '"',
      cookiesEnd: 604800, // cookies时间
      userid: '',
      old: {
        towho: ''
      }
    };
    if (process.client) {
      Object.assign(result, {
        params: {
          works: {
            action: 'listoftype',
            userid: docCookies.getItem('userid') || '-',
            towho: that.$router.history.current.params.towho,
            type: 'vevue',
            cid: docCookies.getItem('cid') || ''
          },
          respond: {
            action: 'listoftype',
            userid: docCookies.getItem('userid') || '-',
            towho: that.$router.history.current.params.towho,
            type: 'respond',
            cid: docCookies.getItem('cid') || ''
          },
          topics: {
            action: 'listoftype',
            userid: docCookies.getItem('userid') || '-',
            towho: that.$router.history.current.params.towho,
            type: 'topics',
            cid: docCookies.getItem('cid') || ''
          },
          likes: {
            action: 'listoftype',
            userid: docCookies.getItem('userid') || '-',
            towho: that.$router.history.current.params.towho,
            type: 'likes',
            cid: docCookies.getItem('cid') || ''
          },
          following: {
            action: 'listoffollow',
            userid: docCookies.getItem('userid') || '-',
            towho: that.$router.history.current.params.towho,
            type: 'following',
            cid: docCookies.getItem('cid') || ''
          },
          followers: {
            action: 'listoffans',
            userid: docCookies.getItem('userid') || '-',
            towho: that.$router.history.current.params.towho,
            type: 'followers',
            cid: docCookies.getItem('cid') || ''
          }
        },
        type: this.$router.history.current.params.type
      });
    }
    return result;
  },
  mounted() {
    if (process.client) {
      this.userid = docCookies.getItem('userid') || '';
      this.hashUrl = encodeURIComponent('/' + window.location.hash);
      document.documentElement.scrollTop = 0;
      this.getUserInfo(0);
    }
  },
  methods: {
    clipText(el) {
      console.log('clip');
      const clip = new ClipboardJS(el, {
        text: function(trigger) {
          return trigger.getAttribute('aria-label');
        }
      });
      clip.on('success', e => {
        this.$message({
          message: 'Link Copied',
          duration: 1200,
          type: 'success'
        });
        console.log('success');
        console.log(e);
        clip.destroy();
      });
    },
    showQRCode() {
      this.showAddrQRCode = true;
      // this.qrcode.clear();
      this.$nextTick(() => {
        if (!this.qrcode) {
          this.qrcode = new QRCode(document.getElementById('qrcode'), {
            text: this.userInfo.addr_vevue
          });
        }
      });
    },
    getUserInfo(times) {
      const that = this;
      if (times >= that.maxRequestTimes) {
        return;
      }
      axios
        .post(apiUrl.vevueAPI + 'visitor', {
          userid: docCookies.getItem('userid') || '-',
          towho: that.towho,
          date: new Date().getTime(),
          authcode: docCookies.getItem('userid')
            ? totp.getCode(docCookies.getItem('safekey'))
            : '',
          cid: docCookies.getItem('cid') || '',
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(async res => {
          if (res.data.errcode === 0) {
            let result = JSON.parse(JSON.stringify(res.data.result));
            result.nickname = result.nickname;
            result.signature = result.signature;
            result.avatar = apiUrl.avatarURL + res.data.result.avatar + '.jpg';
            result.cover = apiUrl.avatarURL + res.data.result.cover + '.jpg';
            if (that.towho === docCookies.getItem('userid')) {
              docCookies.setItem(
                'avatar',
                res.data.result.avatar,
                this.cookiesEnd,
                '/',
                null
              );
              let balance = await axios.post(apiUrl.vevueAPI + 'balance', {
                userid: docCookies.getItem('userid'),
                simple: 0,
                version: 0.1,
                authcode: docCookies.getItem('userid')
                  ? totp.getCode(docCookies.getItem('safekey'))
                  : '',
                cid: docCookies.getItem('cid') || '',
                timestamp: Math.floor(new Date().getTime() / 1000)
              });
              if (balance.data.errcode === 0) {
                result.addr_vevue = balance.data.addr_vevue;
                result.amount = balance.data.amount;
                result.transactionList = balance.data.result;
              }
            }
            that.userInfo = JSON.parse(JSON.stringify(result));
            globalUserInfoCache = that.userInfo;
          } else if (res.data.errcode === 110) {
            setTimeout(() => {
              that.getUserInfo(++times);
            }, 500);
          }
        });
    },
    toFollow(bool, times) {
      const that = this;
      times = times || 0;
      if (times >= that.maxRequestTimes) {
        this.userInfo.hasfollowed = !this.userInfo.hasfollowed;
        return;
      }
      if (!this.userid.trim()) {
        window.location.href = '/login?continue=' + this.hashUrl;
        return;
      }
      this.userInfo.hasfollowed = !this.userInfo.hasfollowed;
      axios
        .post(apiUrl.vevueAPI + 'follow', {
          userid: docCookies.getItem('userid'),
          towho: that.towho,
          sign: bool,
          cid: docCookies.getItem('cid'),
          authcode: totp.getCode(docCookies.getItem('safekey')),
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          if (res.data.errcode === 260) {
            this.userInfo.hasfollowed = true;
          } else if (res.data.errcode === 261) {
            this.userInfo.hasfollowed = false;
          } else if (res.data.errcode === 110) {
            setTimeout(() => {
              that.toFollow(bool, ++times);
            }, 500);
          } else {
            this.userInfo.hasfollowed = !this.userInfo.hasfollowed;
          }
        });
    }
  },
  beforeRouteUpdate(to, from, next) {
    console.log('route update');
    if (!to.params.type) {
      console.log('跳转');
      console.log(to.params.towho);
      //   next(vm => {
      //     vm.$router.push('/user/' + to.params.towho + '/works');
      //   });
      location.href = '/user/' + to.params.towho + '/works';
    } else {
      this.type = to.params.type;
      next();
    }
  },
  beforeRouteEnter(to, from, next) {
    console.log('router enter');
    if (!to.params.type) {
      next(vm => {
        vm.$router.push('/user/' + to.params.towho + '/works');
      });
    } else {
      next();
    }
  }
};
</script>
<style lang='stylus'>
body {
    padding: 0px !important;
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

.user-page-wrapper {
    background: #fafafa;
    min-height: 100vh;
}

.el-tabs__item {
    height: 50px !important;
    line-height: 25px !important;
}

.top-user-container, .tab-container {
    margin: 20px auto 30px;
}

.tab-container {
    background-color: #fff;

    .tab-select {
        margin-left: auto;
        margin-right: auto;

        li {
            float: left;
            height: 45px;
            line-height: 20px;
            margin: 0;
            border-bottom: 2px solid transparent;
            color: #909399;
            text-align: center;
        }

        .bottom-color li {
            border-bottom: #409EFF solid 2px;
            border-bottom-color: #409eff !important;
        }
    }
}

.top-user-container {
    &, .tab-container {
        margin: 0px auto 30px;
    }

    padding-top: 20px;
}

.user-meta-info {
    display: flex;
    align-items: center;

    .user-text-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        font-size: 14px;
        padding-left: 20px;
        justify-content: space-around;

        &>div, &>p {
            margin: 2.5px 0;
        }

        .user-meta {
            margin-top: 0px;
            text-align: left;
            font-size: 13px;
        }

        .icon-authorsign {
            color: #1697CE;
            margin-right:3px;
        }

        .uid {
            font-size: 12px;
        }

        .nickname {
            font-size: 20px;
            font-weight: bold;
            margin-right:4px;
        }

        .signature {
            font-weight: normal;
            font-size: 13px;
        }
    }

    .user-image-container {
        width: 80px;
        height: 80px;

        img {
            display: block;
            border-radius: 50%;
            width: 100%;
            height: 100%;
        }
    }
}

.vevue_score {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;

    .token_left {
        margin: 0 5px;
    }

    .deposit {
        padding: 3px 5px !important;
    }

    &>img {
        width: 20px;
        height: 20px;
    }

    .el-dialog__body {
        display: flex !important;
        flex-direction: column;
        align-items: center;
        justify-content: center !important;
    }

    #qrcode {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .addr_text {
        margin-top: 20px;
    }

    .addr_btn {
        color: #409EFF;
        cursor: pointer;
    }

    .deposit_info {
        margin-top: 20px;
        color: #E4A611;
        font-size: 12px;
    }
}

.followed {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #fff;
    border-radius: 3px;
    width: 80px;
    height: 25px;

    &.toUnfollow {
        background-color: #ccc;
    }

    &.toFollow {
        background-color: #409eff;
        color: #fff;
    }
}

.el-dialog__body {
    padding: 0px !important;
}

.transactionList {
    width: 100%;
    padding: 10px 20px;
    border-bottom: solid 1px #ccc;
}

.item_show {
    display: flex;
    padding-bottom: 20px;

    &>div {
        // flex: 1;
        text-align: left;
    }

    .item_type {
        flex: 1;
        font-size: 14px;
        font-weight: bold;
    }

    .item_date {
        flex: 1;
        font-size: 12px;
        text-align: right;
    }
}

.transaction_dialog::-webkit-scrollbar {
    width: 0px;
}

.transaction_dialog {
    .el-dialog {
        min-width: 520px;
    }
}

.item_id {
    text-align: left;
    font-size: 12px;
}
</style>
