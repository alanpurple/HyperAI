<template>
  <md-content class="md-elevation-3">
    <div class="form">
      <md-field>
        <label>E-mail</label>
        <md-input v-model="login.email" autofocus></md-input>
      </md-field>

      <md-field md-has-password>
        <label>Password</label>
        <md-input v-model="login.password" type="password"></md-input>
      </md-field>
    </div>
    <div class="actions md-layout md-alignment-center-space-between">
      <router-link to="/signin">Reset password</router-link>
      <md-button class="md-raised md-primary">Log in</md-button>
    </div>
  </md-content>
</template>
<script lang="ts">
  import { Component, Vue } from "vue-property-decorator";
  @Component({
    components: {},
  })
  export default class Signin extends Vue {
    loading = false;
    login = {
      email: "",
      password: "",
    };
  }
</script>
<style scoped lang="scss">
  .md-elevation-3 {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 720px;
    width: 80%;
    padding: 30px;
    box-sizing: border-box;
  }
</style>
