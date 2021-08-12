<template>
  <div class="open-data">
    <md-table>
      <md-table-row>
        <md-table-head md-numeric>name</md-table-head>
        <md-table-head>type</md-table-head>
        <md-table-head>size</md-table-head>
      </md-table-row>
    </md-table>
  </div>
</template>
<script lang="ts">
  import { Component, Vue } from "vue-property-decorator";
  @Component({
    components: {},
  })
  export default class OpenData extends Vue {}
</script>
<style scoped lang="scss">
  .md-table::v-deep {
    .md-table-head-container {
      text-align: left;
    }
  }
</style>
