<template>
    <div>
    </div>
</template>
<script>
export default {
  asyncData(context) {
    console.log(context.params);
    // if (context.params.type) {
    //   context.redirect('/user/' + context.params.towho);
    // }
    context.redirect('/user/' + context.params.user);
  }
};
</script>