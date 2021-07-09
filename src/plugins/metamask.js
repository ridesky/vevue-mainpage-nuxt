import Vue from "vue";
import Web3 from "web3";
import BigNumber from "bignumber.js";
import { integerToDecimal, decimalToInteger } from "../static/tools/convertors";
import { ADDRESS_TO_REDEEM_VPAY } from "../assets/js/config/urlConfig";
const CHAIN_ID_MATIC = 137;
const CHAIN_ID_MUMBAI = 80001;
const tokenHash = {
  [CHAIN_ID_MATIC]: {
    Vpay: "0x60Cc8B28098721BAEB33979d43268a999918e9D1"
  },
  [CHAIN_ID_MUMBAI]: {
    Vpay: "0x04138CD5ba39a8911838d0f7A71eB46C18a76846"
  }
};
const connectWithMetamask = async () => {
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    // this.loginWithSign();
  } catch (error) {
    return error;
  }
};
const methods = {
  install(Vue) {
    Vue.prototype.$transferErc20Token = async function(to, amount, token, decimals = 18) {
      if (!window.ethereum) {
        throw new Error("NOT_INSTALLED : Metamask Wallet");
      }
      const vevueWeb3 = new Web3(window.ethereum);
      const chainId = await vevueWeb3.eth.getChainId();
      const tokenContract = new vevueWeb3.eth.Contract(
        require("../assets/js/abi/vpay.json"),
        tokenHash[chainId][token]
      );
      const amountInt = decimalToInteger(amount, decimals);
      const accounts = await window.ethereum.request({
        method: "eth_accounts"
      });
      const from = accounts[0];
      // to 要小写  如果传入的是"0X....." 而不是"0x....." 会报错
      const result = await tokenContract.methods.transfer(to.toLocaleLowerCase(), amountInt).send({ from });
      return result;
    };
    Vue.prototype.$sendTransaction = async function({ to, amount, decimals = 18 }) {
      const vevueWeb3 = new Web3(window.ethereum);
      to = to || ADDRESS_TO_REDEEM_VPAY;
      const accounts = await window.ethereum.request({
        method: "eth_accounts"
      });
      const amountInt = decimalToInteger(amount, decimals);
      const from = accounts[0];

      // get the nonce
      var nonceCnt = await vevueWeb3.eth.getTransactionCount(from);
      console.log(`num transactions so far: ${nonceCnt}`);

      const transactionObject = {
        from,
        to: to.toLocaleLowerCase(),
        value: amountInt,
        nonce: nonceCnt
      };
      const result = await vevueWeb3.eth.sendTransaction(transactionObject);
      return result;
    };
  }
};

const reward = async () => {
  const vevueWeb3 = new Web3(window.ethereum);
  const vpayContract = new vevueWeb3.eth.Contract(require("../assets/js/abi/vpay.json"), vpayHash);
  console.log(vpayContract.methods);
  const accounts = await window.ethereum.request({
    method: "eth_accounts"
  });
  const from = accounts[0];
  const to = "0x67e9C50A226d6f81D7bfDBa3F2aA1B84FC77fa13"; // 测试账户2
  console.log("from is");
  console.log(from);
  const result = await vpayContract.methods.transfer(to, new BigNumber(1e18).toString()).send({ from });
  console.log("result is");
  console.log(result);
};

Vue.use(methods);
