<template>
  <section class="container">
    <!-- <router-view></router-view> -->
      <video-list :listenScroll='true' :params='params' :old='old' />
  </section>
</template>

<script>
import videoList from '../components/videoList.vue';
import totp from '../static/tools/totp.js';
import docCookies from '../static/tools/cookies.js';
export default {
  layout: 'headNavigation',
  components: {
    videoList
  },
  data() {
    if (process.client) {      
      return {
        params: {
          // authcode: docCookies.getItem('userid')
          //   ? totp.getCode(docCookies.getItem('safekey'))
          //   : '',
          timestamp: Math.floor(new Date().getTime() / 1000),
          towho: docCookies.getItem('userid') || '-',
          userid: docCookies.getItem('userid') || '-',
          cid: docCookies.getItem('cid'),
          hashfollow: docCookies.getItem('hashfollow') || '',
          version: '',
          action: 'listofmain'
        },
        old: {
          userid: docCookies.getItem('userid') || '-',
          towho: docCookies.getItem('userid') || '-',
          type: ''
        }
      };
    } else {
      return {
        params: {},
        old: {}
      };
    }
  },
  mounted() {
    console.log(document.URL);
  }
};
</script>

<style>
</style>

