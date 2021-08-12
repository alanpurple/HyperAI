<template>
  <main>
    <md-tabs>
      <md-tab md-label="OpenData" @click="toggle('OpenData')"></md-tab>
      <md-tab md-label="MyData" @click="toggle('MyData')"></md-tab>
    </md-tabs>
    <keep-alive>
      <component :is="type"></component>
    </keep-alive>
  </main>
</template>
<script lang="ts">
  import { Component, Vue } from "vue-property-decorator";
  import MyData from "@/components/data-manager/MyData.vue";
  import OpenData from "@/components/data-manager/OpenData.vue";
  @Component({
    components: {
      MyData,
      OpenData,
    },
  })
  export default class DataManager extends Vue {
    type = "OpenData";
    toggle(type: string): void {
      this.type = type;
    }
  }
</script>
<style scoped lang="scss">
  main {
    margin-left: 300px;
  }
</style>
