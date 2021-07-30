<template>
  <div id="app">
    <Header></Header>
    <Navigation></Navigation>
    <router-view></router-view>
  </div>
</template>
<script lang="ts">
  import { Component, Vue } from "vue-property-decorator";
  import Header from "@/components/layout/Header.vue";
  import Navigation from "@/components/layout/Navigation.vue";
  @Component({
    components: {
      Header,
      Navigation,
    },
  })
  export default class App extends Vue {}
</script>
<style scoped lang="scss"></style>
