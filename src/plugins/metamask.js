import Vue from "vue";
import Web3 from "web3";
import BigNumber from "bignumber.js";
import { integerToDecimal, decimalToInteger } from "../static/tools/convertors";
const vpayHash = "0x04138CD5ba39a8911838d0f7A71eB46C18a76846";
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
    Vue.prototype.$transferToken = async function(to, amount, decimals = 18) {
      const vevueWeb3 = new Web3(window.ethereum);
      const vpayContract = new vevueWeb3.eth.Contract(
        require("../assets/js/abi/vpay.json"),
        vpayHash
      );
      console.log('amount is');
      console.log(amount)
      const amountInt = decimalToInteger(amount, decimals);
      console.log('amountInt is');
      console.log(amountInt)
      const accounts = await window.ethereum.request({
        method: "eth_accounts"
      });
      const from = accounts[0];
      // amount = new BigNumber(amount.toString());
      const result = await vpayContract.methods
        .transfer(to, amountInt)
        .send({ from });
      return result;
    };
  }
};

const reward = async () => {
  const vevueWeb3 = new Web3(window.ethereum);
  const vpayContract = new vevueWeb3.eth.Contract(
    require("../assets/js/abi/vpay.json"),
    vpayHash
  );
  console.log(vpayContract.methods);
  const accounts = await window.ethereum.request({
    method: "eth_accounts"
  });
  const from = accounts[0];
  const to = "0x67e9C50A226d6f81D7bfDBa3F2aA1B84FC77fa13"; // 测试账户2
  console.log("from is");
  console.log(from);
  const result = await vpayContract.methods
    .transfer(to, new BigNumber(1e18).toString())
    .send({ from });
  console.log("result is");
  console.log(result);
};

Vue.use(methods);
