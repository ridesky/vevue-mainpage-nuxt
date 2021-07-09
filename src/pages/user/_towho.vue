<template>
  <div class="user-page-wrapper">
    <no-ssr>
      <div class="top-user-container">
        <div class="user-meta-info">
          <div class="user-image-container" v-show="userInfo.avatar">
            <img :src="userInfo.avatar" alt="" :onerror="logo" />
          </div>
          <div class="user-text-info">
            <p class="nick-meta">
              <span class="nickname">{{ userInfo.nickname }}</span>
              <i v-show="userInfo.authorsign" class="iconfont icon-authorsign"></i>
              <span v-show="userInfo.authorsign">{{ userInfo.authorsign }}</span>
            </p>
            <p class="uid" v-show="userInfo.uid">UID {{ userInfo.uid }}</p>
            <p class="signature">{{ userInfo.signature }}</p>

            <div v-if="userid === towho" class="vevue_score" v-show="userInfo.transactionList">
              <img src="../../assets/images/logo_coin_100.png" alt="score" />
              <div class="token_left">
                {{ userInfo.amount }}
              </div>
              <el-dialog width="25%" title="Score" :visible.sync="showTransactionList" class="transaction_dialog">
                <div v-for="item in userInfo.transactionList" :key="item.id" class="transactionList">
                  <div class="item_show">
                    <div class="item_type">
                      {{ transactionConfig[item.type] ? transactionConfig[item.type]["enWord"] : item.type }}
                    </div>
                    <div
                      v-if="transactionConfig[item.type]"
                      class="item_amount"
                      :style="'color:' + transactionConfig[item.type]['color']"
                    >
                      {{ transactionConfig[item.type] ? transactionConfig[item.type]["symbol"] : "" }}{{ item.amount }}
                    </div>
                    <div v-else>
                      {{ item.amount }}
                    </div>
                    <div class="item_date">
                      {{ jsFormat.smartTime(new Date(item.date * 1000)) }}
                    </div>
                  </div>
                  <div class="item_id">ID: {{ item.id }}</div>
                </div>
              </el-dialog>
              <el-button type="danger" class="plain deposit" size="mini" @click="showDeposit">Deposit</el-button>
              <el-dialog :visible.sync="showDepositDialog" title="Deposit" width="30%" class="transfer_dialog">
                <div class="transfer-content">
                  <!-- <el-input class="addr_text" disabled v-model="userInfo.metamask"></el-input> -->
                  <h3 class="addr_text">Swap Matic to Vpay (1:100)</h3>
                  <el-slider class="addr_input" :min="1" v-model="transferAmount" :marks="transferMark"></el-slider>
                  <!-- <el-input class="addr_input" type="number" v-model="transferAmount"> </el-input> -->
                  <el-button
                    class="transfer-button deposit-button"
                    type="danger"
                    :loading="isTransferring"
                    @click="toDeposit"
                    >Send {{transferAmount}} Matic
                  </el-button>
                  <div class="deposit_info">
                    <!-- Transfer your token. -->
                  </div>
                </div>
              </el-dialog>
            </div>
            <div v-else class="interact">
              <!-- <p> {{userInfo.followers}} Followers {{userInfo.following}} Following</p> -->
              <div class="followed toFollow" v-show="!userInfo.hasfollowed" @click="toFollow(true, 0)">
                Follow
              </div>
              <div class="followed toUnfollow" v-show="userInfo.hasfollowed" @click="toFollow(false, 0)">
                UnFollow
              </div>
              <el-button
                class="plain deposit reward"
                size="mini"
                type="warning"
                @click="showReward"
                :disabled="!userInfo.metamask"
                >Reward</el-button
              >
              <el-dialog
                :visible.sync="showRewardDialog"
                :title="'Reward for ' + userInfo.nickname || ''"
                width="30%"
                class="transfer_dialog"
              >
                <div class="transfer-content">
                  <el-input class="addr_text" disabled v-model="userInfo.metamask"></el-input>
                  <el-slider class="addr_input" :min="1"  v-model="transferAmount" :marks="transferMark"></el-slider>
                  <!-- <el-input class="addr_input" type="number" v-model="transferAmount"> </el-input> -->
                  <el-button
                    class="transfer-button reward-button"
                    type="warning"
                    :loading="isTransferring"
                    @click="toReward('Vpay')"
                    >Reward {{transferAmount}} Vpay
                  </el-button>
                  <div class="deposit_info">
                    <!-- Transfer your token. -->
                  </div>
                </div>
              </el-dialog>
            </div>
          </div>
          <div class="subscribe"></div>
        </div>
      </div>
    </no-ssr>
    <no-ssr>
      <div class="tab-container">
        <el-menu :default-active="activeIndex" class="el-menu-demo tab-select" mode="horizontal">
          <router-link :to="'/user/' + towho + '/works'" active-class="bottom-color">
            <el-menu-item :index="'/user/' + towho + '/works'"
              >{{ userInfo.vevue }}<br />
              WORKS
            </el-menu-item>
          </router-link>
          <router-link :to="'/user/' + towho + '/respond'" active-class="bottom-color">
            <el-menu-item :index="'/user/' + towho + '/respond'"
              >{{ userInfo.respond }} <br />
              RESPOND</el-menu-item
            >
          </router-link>
          <router-link :to="'/user/' + towho + '/likes'" active-class="bottom-color">
            <el-menu-item :index="'/user/' + towho + '/likes'"
              >{{ userInfo.likes }} <br />
              LIKES</el-menu-item
            >
          </router-link>
          <router-link :to="'/user/' + towho + '/followers'" active-class="bottom-color">
            <el-menu-item :index="'/user/' + towho + '/followers'"
              >{{ userInfo.followers }} <br />
              FOLLOWERS</el-menu-item
            >
          </router-link>
          <router-link :to="'/user/' + towho + '/following'" active-class="bottom-color">
            <el-menu-item :index="'/user/' + towho + '/following'"
              >{{ userInfo.following }} <br />
              FOLLOWING</el-menu-item
            >
          </router-link>
        </el-menu>
      </div>
    </no-ssr>
    <no-ssr>
      <div>
        <keep-alive>
          <video-list
            :listenScroll="true"
            :params="params['works']"
            v-if="type === 'works' || type === ''"
          ></video-list>
        </keep-alive>
        <keep-alive>
          <video-list :listenScroll="true" :params="params['respond']" v-if="type === 'respond'"></video-list>
        </keep-alive>
        <keep-alive>
          <video-list :listenScroll="true" :params="params['likes']" v-if="type === 'likes'"></video-list>
        </keep-alive>
        <keep-alive>
          <follow-content
            :listenScroll="true"
            :params="params['followers']"
            v-if="type === 'followers'"
          ></follow-content>
        </keep-alive>
        <keep-alive>
          <follow-content
            :listenScroll="true"
            :params="params['following']"
            v-if="type === 'following'"
          ></follow-content>
        </keep-alive>
      </div>
    </no-ssr>
    <!-- <nuxt-child></nuxt-child> -->
  </div>
</template>
<script>
import axios from "axios";
import videoList from "../../components/videoList.vue";
import followContent from "../../components/followerContent.vue";
import apiUrl from "../../assets/js/config/urlConfig.js";
import jsFormat from "../../static/tools/jsFormat.js";
import docCookies from "../../static/tools/cookies.js";
import totp from "../../static/tools/totp.js";
import transactionConfig from "../../assets/js/config/transactionConfig.js";
import ClipboardJS from "clipboard";
import { decimalToInteger } from "../../static/tools/convertors.js";
if (process.browser) {
  // require("../../static/tools/qrcode.min.js");
}
let globalUserInfoCache = {};
export default {
  layout: "headNavigation",
  components: {
    videoList,
    followContent
  },
  data() {
    const that = this;
    let result = {
      params: "",
      type: "",
      jsFormat,
      transactionConfig,
      showTransactionList: false, // 交易列表 dialog 开关
      showDepositDialog: false, // 地址二维码 dialog 开关
      showRewardDialog: false,
      maxRequestTimes: 5,
      hashUrl: "",
      paramsSelect: "",
      towho: this.$route.params.towho,
      type: this.$route.params.type,
      activeIndex:
        "/user/" + this.$router.history.current.params.towho + "/" + this.$router.history.current.params.type,
      userInfo: globalUserInfoCache,
      transferAmount: 1, // amount to transfer or reward
      transferMark: {
        1: "1",
        25: "25",
        50: "50",
        75: "75",
        100: "100"
      },
      isTransferring: false,
      logo: 'this.src="' + require("../../assets/images/vevue_logo_50x50.png") + '"',
      cookiesEnd: 604800, // cookies时间
      userid: "",
      old: {
        towho: ""
      }
    };
    if (process.client) {
      Object.assign(result, {
        params: {
          works: {
            action: "listoftype",
            userid: docCookies.getItem("userid") || "-",
            towho: that.$router.history.current.params.towho,
            type: "vevue",
            cid: docCookies.getItem("cid") || ""
          },
          respond: {
            action: "listoftype",
            userid: docCookies.getItem("userid") || "-",
            towho: that.$router.history.current.params.towho,
            type: "respond",
            cid: docCookies.getItem("cid") || ""
          },
          topics: {
            action: "listoftype",
            userid: docCookies.getItem("userid") || "-",
            towho: that.$router.history.current.params.towho,
            type: "topics",
            cid: docCookies.getItem("cid") || ""
          },
          likes: {
            action: "listoftype",
            userid: docCookies.getItem("userid") || "-",
            towho: that.$router.history.current.params.towho,
            type: "likes",
            cid: docCookies.getItem("cid") || ""
          },
          following: {
            action: "listoffollow",
            userid: docCookies.getItem("userid") || "-",
            towho: that.$router.history.current.params.towho,
            type: "following",
            cid: docCookies.getItem("cid") || ""
          },
          followers: {
            action: "listoffans",
            userid: docCookies.getItem("userid") || "-",
            towho: that.$router.history.current.params.towho,
            type: "followers",
            cid: docCookies.getItem("cid") || ""
          }
        },
        type: this.$router.history.current.params.type
      });
    }
    return result;
  },
  mounted() {
    if (process.client) {
      this.userid = docCookies.getItem("userid") || "";
      this.hashUrl = encodeURIComponent("/" + window.location.hash);
      document.documentElement.scrollTop = 0;
      this.getUserInfo(0);
    }
  },
  methods: {
    clipText(el) {
      console.log("clip");
      const clip = new ClipboardJS(el, {
        text: function(trigger) {
          return trigger.getAttribute("aria-label");
        }
      });
      clip.on("success", e => {
        this.$message({
          message: "Link Copied",
          duration: 1200,
          type: "success"
        });
        console.log("success");
        console.log(e);
        clip.destroy();
      });
    },
    showDeposit() {
      this.showDepositDialog = true;
    },
    async toDeposit() {
      // if (this.transferAmount < 1) {
      //   this.$message.error("The paid Matic is at least 1");
      //   return;
      // }
      try {
        this.isTransferring = true;
        const txInfo = await this.$sendTransaction({ amount: this.transferAmount });
        if (txInfo.transactionHash) {
          const transferInfo = await axios.post(apiUrl.checkTransfer, {
            txid: txInfo.transactionHash,
            addr_transfer_to: apiUrl.ADDRESS_TO_REDEEM_VPAY,
            amount: decimalToInteger(this.transferAmount, 18)
          });
          console.log("transferInfo is");
          console.log(transferInfo);
          if (transferInfo.data.errcode === 0 && transferInfo.data.data.result === true) {
            this.$alert(
              `<p>Transaction hash: <strong style="overflow-wrap:break-word">${txInfo.transactionHash}</strong></p>`,
              "Deposit Success",
              {
                confirmButtonText: "Close",
                dangerouslyUseHTMLString: true,
                type: "success"
              }
            );
          } else {
            this.$alert(
              `<p>Please check transaction hash: <strong style="overflow-wrap:break-word">${txInfo.transactionHash}</strong></p>`,
              "Deposit Failed",
              {
                confirmButtonText: "Close",
                dangerouslyUseHTMLString: true,
                type: "error"
              }
            );
          }
          this.isTransferring = false;
        }
      } catch (error) {
        console.log("error!");
        console.error(error);
        this.$alert(`Transfer Failed: ${error.message || error.toString()}`, "", {
          confirmButtonText: "Close",
          dangerouslyUseHTMLString: true,
          type: "error"
        });
        this.isTransferring = false;
      }
    },
    showReward() {
      this.showRewardDialog = true;
    },
    async toReward(token) {
      try {
        this.isTransferring = true;
        const txInfo = await this.$transferErc20Token(this.userInfo.metamask, this.transferAmount, token);
        console.log(txInfo);
        if (txInfo.transactionHash) {
          const transferInfo = await axios.post(apiUrl.checkTransfer, {
            txid: txInfo.transactionHash,
            addr_transfer_to: this.userInfo.metamask,
            amount: decimalToInteger(this.transferAmount, 18)
          });
          console.log("transferInfo is");
          console.log(transferInfo);
          if (transferInfo.data.errcode === 0 && transferInfo.data.data.result === true) {
            this.$alert(
              `<p>Transaction hash: <strong style="overflow-wrap:break-word">${txInfo.transactionHash}</strong></p>`,
              "Reward Success",
              {
                confirmButtonText: "Close",
                dangerouslyUseHTMLString: true,
                type: "success"
              }
            );
          } else {
            this.$alert(
              `<p>Please check transaction hash: <strong style="overflow-wrap:break-word">${txInfo.transactionHash}</strong></p>`,
              "Reward Failed",
              {
                confirmButtonText: "Close",
                dangerouslyUseHTMLString: true,
                type: "error"
              }
            );
          }
          this.isTransferring = false;
        }
      } catch (error) {
        this.$alert(`Transfer Failed: ${error.message || error.toString()}`, "", {
          confirmButtonText: "Close",
          dangerouslyUseHTMLString: true,
          type: "error"
        });
        this.isTransferring = false;
      }
    },
    async checkTransfer(txid, addr_transfer_to, amount) {
      return await axios.post(apiUrl.checkTransfer, { txid, addr_transfer_to, addr_transfer_to });
    },
    getUserInfo(times) {
      const that = this;
      if (times >= that.maxRequestTimes) {
        return;
      }
      axios
        .post(apiUrl.vevueAPI + "visitor", {
          userid: docCookies.getItem("userid") || "-",
          towho: that.towho,
          date: new Date().getTime(),
          authcode: docCookies.getItem("userid") ? totp.getCode(docCookies.getItem("safekey")) : "",
          cid: docCookies.getItem("cid") || "",
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(async res => {
          if (res.data.errcode === 0) {
            let result = JSON.parse(JSON.stringify(res.data.result));
            result.nickname = result.nickname;
            result.signature = result.signature;
            result.avatar = apiUrl.avatarURL + res.data.result.avatar + ".jpg";
            result.cover = apiUrl.avatarURL + res.data.result.cover + ".jpg";
            if (that.towho === docCookies.getItem("userid")) {
              docCookies.setItem("avatar", res.data.result.avatar, this.cookiesEnd, "/", null);
              let balance = await axios.post(apiUrl.vevueAPI + "balance", {
                userid: docCookies.getItem("userid"),
                simple: 0,
                version: 0.1,
                authcode: docCookies.getItem("userid") ? totp.getCode(docCookies.getItem("safekey")) : "",
                cid: docCookies.getItem("cid") || "",
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
        window.location.href = "/login?continue=" + this.hashUrl;
        return;
      }
      this.userInfo.hasfollowed = !this.userInfo.hasfollowed;
      axios
        .post(apiUrl.vevueAPI + "follow", {
          userid: docCookies.getItem("userid"),
          towho: that.towho,
          sign: bool,
          cid: docCookies.getItem("cid"),
          authcode: totp.getCode(docCookies.getItem("safekey")),
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
    console.log("route update");
    if (!to.params.type) {
      console.log("跳转");
      console.log(to.params.towho);
      //   next(vm => {
      //     vm.$router.push('/user/' + to.params.towho + '/works');
      //   });
      location.href = "/user/" + to.params.towho + "/works";
    } else {
      this.type = to.params.type;
      next();
    }
  },
  beforeRouteEnter(to, from, next) {
    console.log("router enter");
    if (!to.params.type) {
      next(vm => {
        vm.$router.push("/user/" + to.params.towho + "/works");
      });
    } else {
      next();
    }
  }
};
</script>
<style lang="stylus">
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
        .interact{
          display: flex;
          .plain{
            // &.reward{
            //   border-color:#eacd76
            //   background:#eacd76
            //   color:#fff;
            // }
            display:flex;
            align-items:center;
            font-size:14px;
            height: 25px;
            margin-left: 5px;
          }
          .el-dialog__body {
        display: flex !important;
        flex-direction: column;
        align-items: center;
        justify-content: center !important;
    }
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

}
#qrcode {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .transfer-content{
      text-align:center;
      padding: 10px;
      width: 80%;
      .transfer-button{
        margin-top: 10px;
        width:100%;
        .deposit-button{

        }
        .reward-button{}
      }
    }
    .addr_text {
        margin: 0px auto 20px;
    }
    .addr_input{
      width: 90%;
      margin: 0 auto 10px;
      word-break: normal;
      .el-slider__stop{
        border: solid 0.5px #409EFF;
      }
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
