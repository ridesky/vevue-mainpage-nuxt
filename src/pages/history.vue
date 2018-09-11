<template>
    <no-ssr>
        <div class="history-vue">
            <div class="please-login" v-if="params.userid === '-'">You have not logged in yet. Please
                <a href="/login/">login</a>
            </div>
            <videoList v-else :listenScroll='true' :params='params' :showRemoveHistory='true'></videoList>
        </div>
    </no-ssr>
</template>
<script>
import docCookies from '../static/tools/cookies';
import videoList from '../components/videoList.vue';
export default {
  name: 'mainVideo',
  layout: 'headNavigation',
  components: {
    videoList
  },
  data() {
    let result = {
      params: {}
    };
    if (process.client) {
      Object.assign(result, {
        params: {
          towho: docCookies.getItem('userid') || '-',
          userid: docCookies.getItem('userid') || '-',
          cid: docCookies.getItem('cid'),
          action: 'listoftype',
          type: 'history'
        }
      });
    }
    return result;
  }
};
</script>
<style lang="stylus">
.please-login {
    text-align: center;
    color: #333;
    font-size: 20px;
    margin-top: 20px;

    a {
        color: #409eff;
    }
}
</style>
