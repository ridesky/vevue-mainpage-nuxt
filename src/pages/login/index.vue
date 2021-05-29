<template>
  <div class="loginContent">
    <div class="login-wrapper">
      <div class="login-content">
        <div class="register">
          <img
            src="../../assets/images/logo-01.png"
            alt="Vevue"
            class="login-logo"
          />
          <div class="login-button connecting" v-if="isConnecting">
            Connecting...
          </div>
          <div class="login-button" v-else @click="connectWithMetamask">
            Login with Metamask
          </div>
        </div>
      </div>
      <a href="https://app.vevue.com/" class="appLinkButton">Download APP</a>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import Web3 from "web3";
import apiUrl from "../../assets/js/config/urlConfig.js";
import { reward } from "../../assets/js/metamask";
export default {
  data() {
    let result = {
      isConnecting: false,
      signMessageTemp: "Signature for login @",
      vevueWeb3: "",
      apiUrl
    };
    return result;
  },
  mounted() {
    window.reward = reward;
    window.vue = this;
    if (!window.ethereum) {
      return;
    }
    window.vevueWeb3 = this.vevueWeb3 = new Web3(window.ethereum);
  },
  methods: {
    async connectWithMetamask() {
      try {
        this.isConnecting = true;
        await window.ethereum.request({ method: "eth_requestAccounts" });
        this.loginWithSign();
      } catch (error) {
        this.isConnecting = false;
        this.$message({
          showClose: true,
          message: error.message || "connect failed",
          iconClass: "",
          type: "error"
        });
      }
    },
    loginSuccessDefault() {
      window.location.href = "/";
    },
    async loginWithSign() {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts"
        });
        const addr = accounts[0] || null;
        const currentTime = Math.floor(new Date().getTime() / 1000);
        const message = `${this.signMessageTemp}${currentTime}`;
        const signature = await vevueWeb3.eth.personal.sign(message, addr);
        console.log(`sign is ${signature}`);
        axios
          .post(apiUrl.signUrl, {
            message,
            signature,
            addr
          })
          .then(res => {
            if (res.data.data.result == true) {
              this.$message({
                message: `Login success with ${addr}`,
                iconClass: "",
                type: "success"
              });
            }
            return;
            if (res.data.errcode === 0) {
              let data = res.data.result;
              docCookies.setItem(
                "userid",
                data.userid,
                this.cookiesEnd,
                "/",
                null
              );
              docCookies.setItem("cid", data.cid, this.cookiesEnd, "/", null);
              docCookies.setItem(
                "safekey",
                data.safekey,
                this.cookiesEnd,
                "/",
                null
              );
              docCookies.setItem(
                "avatar",
                data.avatar,
                this.cookiesEnd,
                "/",
                null
              );
              docCookies.setItem(
                "nickname",
                data.nickname,
                this.cookiesEnd,
                "/",
                null
              );
              docCookies.setItem(
                "gender",
                data.gender,
                this.cookiesEnd,
                "/",
                null
              );
              if (this.GetQueryString("continue")) {
                location.href = decodeURIComponent(
                  this.GetQueryString("continue")
                );
                return;
              }
              this.loginSuccessDefault(); // 执行成功回调
              // location.reload();
            } else {
              this.isConnecting = false;
              this.$message({
                showClose: true,
                message: error.message || "sign failed",
                iconClass: "",
                type: "error"
              });
            }
          })
          .catch(err => {
            this.$message({
              showClose: true,
              message: error.message || "login failed",
              iconClass: "",
              type: "error"
            });
          })
          .finally(() => {
            this.isConnecting = false;
          });
      } catch (error) {
        this.isConnecting = false;
        this.$message({
          showClose: true,
          message: error.message || "login failed",
          iconClass: "",
          type: "error"
        });
      }
    },
    GetQueryString(name) {
      let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
      let r = window.location.search.substr(1).match(reg);
      if (r != null) {
        return decodeURI(r[2]);
      }
    }
  }
};
</script>
<style lang="stylus">
.el-message__icon {
    display: none !important;
}

.el-message--error {
    min-width: 0px !important;
    width: 312px;
}

.el-message__closeBtn {
    color: #f56c6c;
    border: solid 1px #f56c6c;
    border-radius: 50%;
    padding: 1px;
}


input::placeholder.red {
    color: red;
}

.appLinkButton {
    font-family: 'Open Sans';
    background-color: #2BA4DF;
    margin-top: 20px;
    border-radius: 5px;
    color: #fff;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 36px;
}

.displaynone {
    display: none !important;
}


.login-button {
  &.connecting{
    opacity:0.6
  }
    cursor: pointer;
    font-size: 14px;
    border-radius: 5px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    margin: 30px auto;
    background: orange;
}


.register {
    position: relative;
    margin: auto;
    font-size: 14px;

    img {
        width: 80%;
        display: block;
        margin: 40px auto;
    }
}

.login-wrapper {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
}

.login-content {
    border: solid 1px #999;
    width: 310px;
    font-family: 'Open Sans';
    overflow: auto;
    margin: auto;
    padding: 25px 20px 0px;
    border-radius: 3px;
    background: #fff;
}

@media screen and (min-width: 545px) {
    .login-content, .el-message--error {
        width: 420px;
    }
}
</style>
