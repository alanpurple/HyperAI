<template>
  <md-list class="">
    <md-list-item>
      <span class="md-list-item-text">Data view/upload</span>
    </md-list-item>
    <md-list-item>
      <span class="md-list-item-text">Data description</span>
    </md-list-item>
    <md-list-item>
      <span class="md-list-item-text">EDA(Exploratory Data Analysis)</span>
    </md-list-item>
    <md-list-item>
      <span class="md-list-item-text">Model suggestion</span>
    </md-list-item>
    <md-list-item>
      <span class="md-list-item-text">Train manager</span>
    </md-list-item>
    <md-list-item>
      <span class="md-list-item-text">Administration</span>
    </md-list-item>
    <md-list-item>
      <span class="md-list-item-text">About the software</span>
    </md-list-item>
  </md-list>
</template>
<script lang="ts">
  import { Component, Vue } from "vue-property-decorator";
  @Component({
    components: {},
  })
  export default class className extends Vue {}
</script>
<style scoped lang="scss">
  .md-list {
    position: fixed;
    top: 88px;
    width: 300px;
    height: 100%;
  }
</style>
