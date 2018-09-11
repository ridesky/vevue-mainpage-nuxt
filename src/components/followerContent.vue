<template>
    <div class="followerContent">
        <div v-show="scrollLock && !hideLoading" class="load" :class="{center:followerLists.length === 0}">
            <img src="../assets/images/loading_bar.gif" alt="">
        </div>
        <ul class="followLists">
            <li v-for="(followerList,index) in followerLists" :key="index" class="followerList">
                <!-- :to=" '/user/' + video.yuan.bywho" -->
                <router-link :to="'/user/' + followerList.userid">
                    <img :src="followerList.avatar" alt="" :onerror='defaultAvatarLogo'>
                </router-link>
                <p class="follower-nickname">{{followerList.nickname}}</p>
                <p class="follower-signature">{{followerList.signature}}</p>
            </li>
        </ul>
    </div>
</template>
<script>
import axios from 'axios';
import totp from '../static/tools/totp.js';
import apiUrl from '../assets/js/config/urlConfig.js';
import docCookies from '../static/tools/cookies.js';
export default {
  name: 'followerContent',
  props: {
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
      defaultAvatarLogo:
        'this.src="' + require('../assets/images/vevue_logo_50x50.png') + '"',
      hideLoading: false,
      maxRequestTimes: 5,
      scrollLock: false, // 滚动监听是否加锁
      followerLists: []
    };
  },
  mounted() {
    if (process.client) {
      this.loadFollowers(0);
    }
  },
  methods: {
    loadFollowers(times) {
      // 读取关注/关注中的用户
      const that = this;
      if (times >= that.maxRequestTimes) {
        that.scrollLock = false; // 触底解锁
        return;
      }
      this.scrollLock = true; // 触底锁定
      let params = that.params;
      params.authcode = docCookies.getItem('userid')
        ? totp.getCode(docCookies.getItem('safekey'))
        : '';
      params.timestamp = Math.floor(new Date().getTime() / 1000);
      axios.post(apiUrl.vevueAPI + params.action, params).then(res => {
        if (res.data.errcode === 0) {
          let result = res.data.result;
          result.map(item => {
            item.avatar = apiUrl.avatarURL + item.avatar + '.jpg';
            item.nickname = item.nickname;
            item.signature = item.signature;
          });
          that.followerLists = result;
          that.scrollLock = false; // 触底解锁
        } else if (res.data.errcode === 110) {
          setTimeout(() => {
            that.loadFollowers(++times);
          }, 500);
        } else {
          that.scrollLock = false; // 触底解锁
        }
      });
    }
  },
  watch: {
    params: {
      handler(newvalue) {
        if (
          this.old.towho !== newvalue.towho ||
          (newvalue.type && this.old.type !== newvalue.type)
        ) {
          this.old.towho = newvalue.towho;
          this.old.type = newvalue.type;
          this.videos = [];
          this.loadFollowers(0);
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="stylus">
.followerContent {
    .load {
        text-align: center;
    }

    .followLists {
        margin-left: auto;
        margin-right: auto;
        text-align: left;
    }

    .followerList {
        display: inline-block;
        width: 170px;
        text-align: center;
        vertical-align: top;
        margin-bottom: 15px;

        img {
            width: 100px;
            height: 100px;
            border-radius: 50%;
        }

        .follower-nickname {
            margin: 5px 0px;
            font-size: 14px;
            font-weight: bold;
        }

        .follower-signature {
            font-size: 12px;
            color: #333;
            height: 50px;
            padding: 0 5px;
            overflow: hidden;
        }
    }

    .load {
        img {
            width: 100px;
        }
    }
}
</style>
