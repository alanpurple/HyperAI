<template>
  <md-toolbar class="md-medium">
    <md-button class="md-icon-button">
      <md-icon>menu</md-icon>
    </md-button>
    <div class="md-toolbar-section-end">
      <md-button @click="goToPath('signup')">Sign up</md-button>
      <md-button @click="goToPath('signin')">Sign in</md-button>
    </div>
  </md-toolbar>
</template>
<script lang="ts">
  import { Component, Vue } from "vue-property-decorator";
  @Component({
    components: {},
  })
  export default class Header extends Vue {
    goToPath(path: string): void {
      this.$router.push(path);
    }
  }
</script>
