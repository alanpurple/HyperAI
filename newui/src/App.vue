<template>
  <div id="app">
    <div class="mask" v-if="mask"></div>
    <MessageModal v-if="messageModal.isOpenModal"></MessageModal>
    <Header></Header>
    <Navigation v-show="layout.navBar"></Navigation>
    <router-view></router-view>
  </div>
</template>
<script lang="ts">
  import { Component, Vue } from "vue-property-decorator";
  import Header from "@/components/layout/Header.vue";
  import Navigation from "@/components/layout/Navigation.vue";
  import MessageModal from "@/components/common/MessageModal.vue";
  import { mapMutations, mapState } from "vuex";
  @Component({
    components: {
      MessageModal,
      Header,
      Navigation,
    },
    computed: {
      ...mapState("modalSetting", ["messageModal", "mask"]),
      ...mapState("layoutSetting", ["layout"]),
    },
    methods: {
      ...mapMutations("userStore", ["USER_INFO"]),
    },
  })
  export default class App extends Vue {
    USER_INFO!: (paylaod: { [key: string]: any }) => void;
    getUserInfo(): void {
      this.$axios
        .get(this.$ApiUrl.userinfo)
        .then((result: { [key: string]: any }) => {
          console.log(result);
          this.USER_INFO(result.data);
        });
    }
    created() {
      this.getUserInfo();
    }
  }
</script>
<style scoped lang="scss">
  .mask {
    position: fixed;
    z-index: 10;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
