<template>

  <div class="show-wrapper">
    <slot></slot>
  </div>

</template>


<script>

  export default {
    name: 'show',
  };

</script>


<style lang="scss" scoped>

  .show-wrapper {
    padding: 8px;
    border: 1px solid #eeeeee;
  }

</style>
