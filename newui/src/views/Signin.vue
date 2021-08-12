<template>
  <main>
    <md-content class="md-elevation-3">
      <h1>SING IN</h1>
      <form action="/account/login" method="post">
        <div class="form">
          <md-field>
            <label>E-mail</label>
            <md-input
              v-model="email"
              name="username"
              @keyup.enter="accountCheck()"
              autofocus
            ></md-input>
          </md-field>
          <md-field md-has-password v-if="isExistAccount">
            <label>Password</label>
            <md-input
              v-model="password"
              type="password"
              name="password"
            ></md-input>
          </md-field>
        </div>
        <div class="actions md-layout md-alignment-center-space-between">
          <md-button
            class="md-raised md-primary"
            v-if="isExistAccount == false"
            @click.native="accountCheck()"
            >Check Availability</md-button
          >
          <md-button
            type="submit"
            v-if="isExistAccount"
            class="md-raised md-primary"
            >Login</md-button
          >
        </div>
      </form>
    </md-content>
  </main>
</template>
<script lang="ts">
  import { Component, Vue } from "vue-property-decorator";
  @Component({
    components: {},
  })
  export default class Signin extends Vue {
    regExp =
      /^([\w\.\_\-])*[a-zA-Z0-9]+([\w\.\_\-])*([a-zA-Z0-9])+([\w\.\_\-])+@([a-zA-Z0-9]+\.)+[a-zA-Z0-9]{2,8}$/;
    loading = false;
    isExistAccount = false;
    email = "alan@infinov.com";
    password = "testadmin";
    accountCheck(): void {
      if (this.regExp.test(this.email) == false) {
        this.$noticeMessage("올바른 이메일 주소를 입력해주세요.");
      } else {
        this.$axios
          .get(this.$ApiUrl.checkUser + this.email)
          .then((result: { [key: string]: any }) => {
            console.log(result);
            console.info("Valid account");
            this.isExistAccount = true;
          })
          .catch((err: any) => {
            console.log(err.response);
            if (err.response.status == 404) {
              console.info("no account");
            }
          });
      }
    }
  }
</script>
<style scoped lang="scss">
  main {
    margin-top: 80px;
    margin-left: 300px;
    width: calc(100% - 300px);
    .md-elevation-3 {
      max-width: 570px;
      width: 80%;
      margin: 0 auto;
      padding: 30px;
      box-sizing: border-box;
    }
  }
</style>
