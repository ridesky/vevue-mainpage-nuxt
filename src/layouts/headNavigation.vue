<template>
    <div>
        <div class="head-navigation-layout">
            <el-container>
                <el-header>
                    <div class="topHeader">
                        <div class="topHeader-inner">
                            <div class="logoBox">
                                <a href="/">
                                    <img src="../assets/images/logo-01.png" alt="vevue" class="header-logo">
                                </a>
                            </div>
                            <ul class="topMenu">
                                <li>
                                    <router-link to='/main' active-class='router-link-exact-active main'>
                                        <i class="iconfont icon-earth"></i>
                                        <span class="menuTitle">Main</span>
                                    </router-link>
                                </li>
                                <li>
                                    <router-link to='/focus' active-class='router-link-exact-active focus'>
                                        <i class="iconfont icon-focus"></i>
                                        <span class="menuTitle">Focus</span>
                                    </router-link>
                                </li>
                                <li>
                                    <router-link to='/likes' active-class='router-link-exact-active like'>
                                        <i class="iconfont icon-like"></i>
                                        <i class="iconfont icon-like-heart"></i>
                                        <span class="menuTitle">Likes</span>
                                    </router-link>
                                </li>
                                <li>
                                    <router-link to='/unlock' active-class='router-link-exact-active unlock'>
                                        <i class="iconfont icon-unlock"></i>
                                        <span class="menuTitle">Unlock</span>
                                    </router-link>
                                </li>
                                <li>
                                    <router-link to='/history' active-class='router-link-exact-active history'>
                                        <i class="iconfont icon-history"></i>
                                        <span class="menuTitle">History</span>
                                    </router-link>
                                </li>
                                <li>
                                    <router-link to='/playlist' active-class='router-link-exact-active delay'>
                                        <i class="iconfont icon-watch_later"></i>
                                        <i class="iconfont icon-like-heart"></i>
                                        <span class="menuTitle">Watch Later</span>
                                    </router-link>
                                </li>
                            </ul>
                            <no-ssr>
                                <div class="top-searchbar" v-clickoutside="function(){showSwitch.searchPannel = false}">
                                    <!-- @input="setSearchStatus" -->
                                    <el-input @input="setSearchStatus" @focus="toShowSearchPannel" size='mini' @keyup.enter.native='toSearchVideo(search.keyword,false)' v-model="search.keyword" placeholder="Search" prefix-icon="el-icon-search">
                                        <i slot="suffix" class="el-input__icon el-icon-error" v-show="search.keyword.length >0" @click="search.keyword='';search.status=0"></i>
                                    </el-input>
                                    <div class="search-pannel-pc" v-show="showSwitch.searchPannel">
                                        <div class='tri'></div>
                                        <div class="hot-detail" v-show="search.status === 0 ">
                                            <div class="trending">
                                                <h3>Trending</h3>
                                                <div @click="toSearchVideo(item,false)" class="hotkeytag" size="small" type="info" v-for="(item,index) in hotkey" :key="index">{{item}}</div>
                                            </div>
                                            <div class="history" v-if="search.history.length>0">
                                                <h3>History</h3>
                                                <div v-for="(item,index) in search.history" :key="index" class="history-item">
                                                    <i class="el-icon-time" @click="toSearchVideo(item,false)"></i>
                                                    <p class="item-text" @click="toSearchVideo(item,false)">{{item}}</p>
                                                    <i class="el-icon-close" @click="removeSearchHistory(index)"></i>
                                                </div>
                                                <div class="cleanhistory" v-if='search.history.length>=5' @click="removeSearchHistory()">
                                                    <i class="el-icon-delete"></i>
                                                    <p>Clean search history</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="search-keylist" v-show="search.status === 1">
                                            <div v-for="(item,index) in search.keylist" :key="index" class="keylist-item" @click="toSearchVideo(item,false)">
                                                <i class="el-icon-search"></i>
                                                <p>{{item}}</p>
                                            </div>
                                            <div class="keylist-item searchall" @click="toSearchVideo(search.keyword,false)">View 「{{search.keyword}}」 results</div>
                                        </div>
                                    </div>
                                </div>
                            </no-ssr>
                            <div class="topRight-button">
                                <div class="toUpload" v-if="userInfo">
                                    <a href="/upload" target="_blank">
                                        <i class="iconfont icon-upload"></i>
                                        <span>Upload</span>
                                    </a>
                                </div>
                                <div class="personal">
                                    <div v-clickoutside='closePersonPannel' v-if="userInfo" @click="showPersonPannel = !showPersonPannel">
                                        <img v-if="userInfo.avatarid" class="topUserAvatar" :src="userInfo.avatar" :onerror='defaultAvatarLogo' alt="">
                                        <!-- <i v-else alt="" class="topUserAvatar iconfont icon-personal"></i> -->
                                        <img v-else class="topUserAvatar" src="../assets/images/vevue_logo_50x50.png" alt="">
                                        <div class="person-pannel" v-show="showPersonPannel">
                                            <div class="tri"></div>
                                            <router-link class="list" :to="'/user/' + userInfo.userid +'/works'">
                                                <i class="iconfont icon-personal"></i>
                                                <span>My page</span>
                                            </router-link>
                                            <!-- <a :href="'/user/' + userInfo.userid +'/works'" class="list">
                                                <i class="iconfont icon-personal"></i>
                                                <span>My page</span>
                                            </a> -->
                                            <router-link class="list" :to="'/likes/'">
                                                <i class="iconfont icon-like"></i>
                                                <span>Likes</span>
                                            </router-link>
                                            <div class="list list-border" :to="'/pin/'" @click="showSwitch.messageDialog = true">
                                                <i class="el-icon-message"></i>
                                                <span>Message</span>
                                            </div>
                                            <router-link class="list list-border" :to="'/pin/'">
                                                <i class="iconfont icon-pin"></i>
                                                <span>Pin</span>
                                            </router-link>
                                            <router-link class="list list-border" :to="'/task/'">
                                                <i class="el-icon-bell"></i>
                                                <span>Task</span>
                                            </router-link>
                                            <router-link class="list list-border" :to="'/setting/'">
                                                <i class="iconfont icon-setting"></i>
                                                <span>Setting</span>
                                            </router-link>
                                            <a class="list" @click="toLogout">
                                                <div class="personal">
                                                    <i class="iconfont icon-logout" v-if="userInfo" title="Log out" style="cursor:pointer"></i>
                                                    <span @click="toLogout">Sign out</span>
                                                    <div class="userSetting">
                                                    </div>
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                    <a href="/login" v-else>
                                        <i class="iconfont icon-personal"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-header>
            </el-container>
        </div>
        <el-dialog class='messageDialog' title="Message" width="25%" height='80%' top="5vh" :visible.sync="showSwitch.messageDialog">
            <message/>
        </el-dialog>
        <nuxt keep-alive />
    </div>

</template>
<script>
import Vue from 'vue';
import axios from 'axios';
import apiUrl from '../assets/js/config/urlConfig.js';
import docCookies from '../static/tools/cookies.js';
import totp from '../static/tools/totp.js';
import message from '../components/message.vue';
Vue.directive('clickoutside', {
  bind: function(el, binding, vnode) {
    function documentHandler(e) {
      /* console.log(el);
      console.log(e.target); */
      if (el.contains(e.target)) return false;
      if (binding.expression) {
        binding.value(e);
      }
    }
    document.addEventListener('click', documentHandler);
  }
});
export default {
  components: {
    message
  },
  head() {
    return {
      script: [
        {
          src: '//vjs.zencdn.net/7.0/video.min.js'
        },
        {
          src: '//cdn.jsdelivr.net/npm/danmaku@1.3.5/dist/danmaku.js'
        },
        {
          src: '//storage.googleapis.com/vrview/2.0/build/vrview.min.js'
        },
        {
          src:
            '//maps.googleapis.com/maps/api/js?key=AIzaSyD6Zh2AjPRc9CN7qMLKUxAHxBw_M57RbwU&libraries=places'
        },
        {
          src:
            '//developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js'
        }
      ]
    };
  },
  data() {
    return {
      userInfo: '',
      defaultAvatarLogo:
        'this.src="' + require('../assets/images/vevue_logo_50x50.png') + '"',
      defaultCoverLogo:
        'this.src="' + require('../assets/images/default_cover.png') + '"',
      showPersonPannel: false, // 显示右上角个人面板
      apiUrl,
      collapseMenu: true, // 是否隐藏菜单栏
      radio: '1',
      route: '',
      hotkey: [],
      search: {
        keyword: '',
        status: 0,
        keylist: [],
        history: process.client
          ? docCookies.getItem('searchHistory')
            ? docCookies.getItem('searchHistory').split(',')
            : [] || []
          : []
      },
      showSwitch: {
        searchPannel: false,
        messageDialog: false
      }
    };
  },
  mounted() {
    window.vue = this;
    this.route = vue.$route;
    this.getUserInfo();
    this.getHotkey();
  },
  methods: {
    removeSearchHistory(index) {
      if (index >= 0) {
        this.search.history.splice(index, 1);
        docCookies.setItem(
          'searchHistory',
          this.search.history,
          this.cookiesEnd,
          '/',
          null
        );
      } else {
        this.search.history = [];
        docCookies.setItem(
          'searchHistory',
          this.search.history,
          this.cookiesEnd,
          '/',
          null
        );
      }
    },
    toShowSearchPannel() {
      if (this.hotkey.length > 0 || this.search.history.length > 0) {
        this.showSwitch.searchPannel = true;
      }
      //   document.body.classList.add('overflowhidden');
    },
    setSearchStatus() {
      if (this.search.keyword.trim().length <= 0) {
        this.toShowSearchPannel();
        this.search.status = 0;
      } else {
        this.showSwitch.searchPannel = true;
        this.search.status = 1;
        this.searchVideo(this.search.keyword, true);
      }
    },
    getHotkey() {
      axios
        .post(apiUrl.vevueAPI + 'hotkeylist', {
          userid: docCookies.getItem('userid') || '-',
          towho: docCookies.getItem('userid') || '-',
          authcode: docCookies.getItem('userid')
            ? totp.getCode(docCookies.getItem('safekey'))
            : '',
          cid: docCookies.getItem('cid'),
          type: 'hotkeylist',
          offset: 0,
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          if (res.data.errcode === 0) {
            // this.$store.commit('sethotkey', res.data.hotkey || []);
            this.hotkey = res.data.hotkey || [];
          }
        });
    },
    searchVideo(keyword, onlykey) {
      this.search.keyword = keyword;
      //   this.videos = []; // 清空之前的视频列表
      //   this.showSwitch.showNomore = false; // 如果之前的搜索没有结果 并且显示了 no result 图标,关闭之
      //   this.showSwitch.hideLoading = false;
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        axios
          .post(apiUrl.vevueAPI + 'scan', {
            userid: docCookies.getItem('userid') || '-',
            authcode: docCookies.getItem('userid')
              ? totp.getCode(docCookies.getItem('safekey'))
              : '',
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
    },
    toSearchVideo(keyword) {
      /**
       *@description 搜索功能 待制作
       */
      this.showSwitch.searchPannel = false;
      this.search.keyword = keyword;
      const hasword = this.search.history.some(item => {
        return item === keyword;
      });
      if (!hasword) {
        this.search.history.push(keyword);
        docCookies.setItem(
          'searchHistory',
          this.search.history,
          this.cookiesEnd,
          '/',
          null
        );
      }

      this.$router.push('/search?keyword=' + keyword);
    },
    closePersonPannel() {
      this.showPersonPannel = false;
    },
    hiddenMenu() {
      if (window.innerWidth <= 1280) {
        this.collapseMenu = true;
      }
    },
    addListenerResize() {},
    toLogout() {
      ['userid', 'avatar', 'cid', 'gender', 'nickname', 'safekey'].map(item => {
        docCookies.removeItem(item, '/');
      });
      window.location.reload();
    },
    getUserInfo() {
      if (docCookies.getItem('userid')) {
        this.userInfo = {};
        this.userInfo.userid = docCookies.getItem('userid');
        this.userInfo.avatarid = docCookies.getItem('avatar');
        this.userInfo.avatar =
          apiUrl.avatarURL + docCookies.getItem('avatar') + '.jpg';
      }
    },
    toggleCollapse() {
      this.collapseMenu = !this.collapseMenu;
    }
  }
};
</script>
<style lang="stylus">
body {
    background: #fafafa;
}

.head-navigation-layout {
    height: 70px;

    .toUpload {
        font-size: 14px;
        margin: 0px 20px 0px 15px;

        a {
            color: #333;
        }

        .icon-upload {
            margin-right: 5px;
        }
    }

    .personal {
        cursor: pointer;

        .person-pannel {
            .tri {
                position: absolute;
                top: 0px;
                right: 5px;
                transform: translateY(-100%);
                border-top: solid 10px transparent;
                border-left: solid 10px transparent;
                border-right: solid 10px transparent;
                border-bottom: solid 10px #fff;
            }

            position: absolute;
            padding: 5px 0px;
            font-size: 14px;
            top: 70px;
            right: 0px;
            width: 125px;
            text-align: left;
            background-color: #fff;
            box-shadow: 0 8px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 2px 2px -2px rgba(0, 0, 0, 0.4);

            .list {
                cursor: pointer;
                display: block;

                &.list-border {
                    border-top: solid 1px #E8E8E8;
                }

                &:hover {
                    background-color: #ccc;
                }

                padding: 10px 10px;

                .iconfont {
                    margin-right: 5px;
                }

                [class^='el-icon'] {
                    margin-right: 5px;
                }

                .el-icon-bell {
                    opacity: 0.7;
                }
            }
        }

        a {
            color: #333 !important;
        }
    }

    .topHeader {
        .topUserAvatar {
            width: 30px;
            height: 30px;
            display: block;
            border-radius: 50%;

            &.icon-personal {
                width: 30px;
                height: 30px;
                color: #fff;
                background: #ccc;
                border-radius: 50%;
            }
        }

        .topMenu {
            display: flex;
            align-items: center;
            height: 100%;
            flex: 1;
            font-size: 16px;

            @media screen and (max-width: 1280px) {
                .menuTitle {
                    display: none;
                }

                justify-content: space-around;
            }

            li {
                height: 100%;
                display: flex;
                align-items: center;
            }

            .icon-like-heart {
                display: none;
            }

            a {
                display: flex;
                height: 100%;
                color: #333;
                align-items: center;
                padding: 0 20px;

                &.router-link-exact-active {
                    color: #409eff !important;

                    i {
                        color: #409eff !important;
                    }

                    background: #f4f4f5;
                    border-color: #d3d4d6;
                }
            }

            .router-link-exact-active {
                &.like {
                    .icon-like {
                        display: none;
                    }

                    .icon-like-heart {
                        display: inline;
                    }
                }

                &.premium {
                    color: #f89934;

                    .icon-sun {
                        color: #FDD5AC;
                    }
                }
            }
        }
    }

    .menuTitle {
        display: inline-block;
        margin-left: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .logoBox .icon-menu {
        font-size: 18px;
        color: #a0a0a0;
        margin-right: 15px;
    }

    .logoBox {
        width: 230px;
        display: flex;
        align-items: center;
    }

    .header-logo {
        width: 155px;
        height: 40px;
        display: block;
    }

    .topHeader {
        display: flex;
        height: 70px;
        flex: 1;
        align-items: center;
        background-color: #fff;
        justify-content: space-between;
        padding: 0 20px;
    }

    .top-searchbar {
        position: relative;
        right: 15px;

        .search-pannel-pc {
            .tri {
                position: absolute;
                top: 0px;
                left: 8px;
                transform: translateY(-100%);
                border-top: solid 10px transparent;
                border-left: solid 10px transparent;
                border-right: solid 10px transparent;
                border-bottom: solid 10px #fff;
            }

            position: absolute;
            width: 100%;
            top: 40px;
            background: #fff;
            box-shadow: 0 8px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 2px 2px -2px rgba(0, 0, 0, 0.4);

            .hot-detail {
                .trending {
                    text-align: left;

                    h3 {
                        text-align: left;
                        font-weight: bold;
                        padding: 5px;
                    }
                }

                .hotkeytag {
                    margin: 5px;
                    cursor: pointer;
                    display: inline-block;
                    font-size: 12px;
                    border-radius: 4px;
                    padding: 0 5px;
                    background-color: hsla(220, 4%, 58%, 0.1);
                    border: none;
                    color: #333;
                    line-height: 30px;
                    line-height: 28px;
                }

                .history {
                    h3 {
                        font-weight: bold;
                        text-align: left;
                        padding: 5px;
                    }

                    .history-item {
                        padding: 10px;
                        cursor: pointer;
                        text-align: left;
                        display: flex;
                        align-items: center;
                        border-bottom: solid 1px #ccc;
                        font-size: 12px;

                        .item-text {
                            flex: 1;
                            text-overflow: ellipsis;
                            overflow: hidden;
                        }

                        i {
                            margin-right: 5px;
                        }
                    }

                    .cleanhistory {
                        display: flex;
                        align-items: center;
                        padding: 10px;
                        font-size: 12px;

                        i {
                            margin-right: 5px;
                        }
                    }
                }
            }

            .search-keylist {
                .keylist-item {
                    &.searchall {
                        word-break: break-all;
                        justify-content: center;
                        color: #409eff;
                    }

                    cursor: pointer;
                    display: flex;
                    padding: 10px;
                    align-items: center;
                    font-size: 12px;

                    i {
                        margin-right: 5px;
                    }

                    &>p {
                        word-break: break-all;
                    }

                    border-bottom: solid 1px #ccc;
                }
            }
        }
    }

    .topRight-button {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 20px;
    }

    .topHeader-inner {
        position: relative;
        height: 100%;
        display: flex;
        justify-content: space-between;
        flex: 1;
        align-items: center;
    }

    .el-header, .el-footer {
        position: fixed;
        width: 100%;
        z-index: 998;
        height: 70px !important;
        background-color: #fff;
        color: #333;
        text-align: center;
        display: flex;
        align-items: center;

        .iconfont {
            color: #888888;
        }
    }
}

.messageDialog {
    .el-dialog {
        max-height: 80% !important;
        overflow-y: auto;
    }
}
</style>

