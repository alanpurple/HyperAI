<template>
  <div class="modal">
    <md-toolbar class="md-primary">
      <md-icon class="close-btn md-size-2x" @click.native="IS_OPEN_MODAL"
        >close</md-icon
      >
    </md-toolbar>
    <md-content class="md-title">
      {{ messageModal.message }}
    </md-content>
  </div>
</template>
<script lang="ts">
  import { Component, Vue } from "vue-property-decorator";
  import { mapState, mapMutations } from "vuex";
  @Component({
    computed: {
      ...mapState("modalSetting", ["messageModal"]),
    },
    methods: {
      ...mapMutations("modalSetting", ["IS_OPEN_MODAL"]),
    },
  })
  export default class MessageModal extends Vue {}
</script>
<style scoped lang="scss">
  .modal {
    background: white;
    max-width: 720px;
    width: 80%;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    overflow: hidden;
    z-index: 11;
    box-sizing: border-box;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .md-icon {
      margin: unset;
    }
    .md-title {
      text-align: center;
      padding: 20px;
    }
  }
</style>
