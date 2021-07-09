<template>
  <div class="test-wrapper">
    <el-input placeholder="receiver" v-model="receiver"></el-input>
    <el-input-number v-model="amount"></el-input-number>
    <el-button @click="toTransfer('Vpay')">Transfer</el-button>
    <el-button @click="toSendTransaction('matic')">sendTransaction</el-button>
  </div>
</template>
<script>
export default {
  layout: "headNavigation",
  mounted() {
    window.vevueWeb3 = this;
  },
  data() {
    return {
      receiver: "",
      amount: ""
    };
  },
  methods: {
    toTransfer(token) {
      this.$transferErc20Token(this.receiver, this.amount, token).then(res => {
        console.log("transfer finall is");
        console.log(res);
      });
    },
    toSendTransaction(token) {
      this.$sendTransaction({ to: this.receiver, amount: this.amount }).then(res => {
        console.log("transfer finall is");
        console.log(res);
      });
    }
  }
};
</script>
<style lang="stylus">
.test-wrapper{
  width: 600px;
  margin: 0 auto;
}
</style>
