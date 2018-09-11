<template>
    <div>
      <img src="../assets/images/loading_bar.gif" alt="">
    </div>
</template>

<script>
export default {
  asyncData(context) {
    context.redirect('/main');
  }
};
</script>