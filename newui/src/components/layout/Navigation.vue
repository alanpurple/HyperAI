<template>
  <md-list class="">
    <md-list-item>
      <span
        @click="goToPath('data-manager')"
        class="md-list-item-text"
        :class="[userInfo == null ? 'not-exist' : '']"
        >Data view/upload</span
      >
    </md-list-item>
    <md-list-item>
      <span
        @click="goToPath('/description')"
        class="md-list-item-text"
        :class="[userInfo == null ? 'not-exist' : '']"
        >Data description</span
      >
    </md-list-item>
    <md-list-item>
      <span
        @click="goToPath('/eda-manager')"
        class="md-list-item-text"
        :class="[userInfo == null ? 'not-exist' : '']"
        >EDA(Exploratory Data Analysis)</span
      >
    </md-list-item>
    <md-list-item>
      <span
        @click="goToPath('/model-suggestion')"
        class="md-list-item-text"
        :class="[userInfo == null ? 'not-exist' : '']"
        >Model suggestion</span
      >
    </md-list-item>
    <md-list-item>
      <span
        @click="goToPath('/train-manager')"
        class="md-list-item-text"
        :class="[userInfo == null ? 'not-exist' : '']"
        >Train manager</span
      >
    </md-list-item>
    <md-list-item>
      <span
        @click="goToPath('/admin')"
        class="md-list-item-text"
        :class="[userInfo == null ? 'not-exist' : '']"
        >Administration</span
      >
    </md-list-item>
    <md-list-item>
      <span @click="goToPath('/info')" class="md-list-item-text"
        >About the software</span
      >
    </md-list-item>
  </md-list>
</template>
<script lang="ts">
  import { Component, Vue } from "vue-property-decorator";
  import { mapState } from "vuex";

  @Component({
    components: {},
    computed: {
      ...mapState("userStore", ["userInfo"]),
    },
  })
  export default class className extends Vue {
    userInfo!: { [key: string]: any };
    goToPath(path: string): void {
      this.$router.push(path);

      // if (this.userInfo == null) {
      //   if (path == "/info") {
      //     this.$router.push(path);
      //   }
      // } else {
      // }
    }
  }
</script>
<style scoped lang="scss">
  .md-list {
    position: fixed;
    top: 88px;
    width: 300px;
    height: 100%;
    .not-exist {
      color: #ccc;
    }
  }
</style>
