<template>
  <main>
    <md-content class="md-elevation-3">
      <h1>SING UP</h1>
      <form action="/account/signup" method="post">
        <div class="form">
          <md-field>
            <label>E-mail</label>
            <md-input
              type="email"
              name="username"
              v-model="email"
              autofocus
            ></md-input>
          </md-field>
          <div v-if="isExistAccount">
            <md-field>
              <label>Name</label>
              <md-input v-model="name" name="name"></md-input>
            </md-field>
            <strong
              v-if="errorMessage1 != null && isExistAccount"
              class="error-message"
            >
              {{ errorMessage1 }}
            </strong>
            <md-field md-has-password>
              <label>Password</label>
              <md-input
                v-model="password"
                type="password"
                name="password"
              ></md-input>
            </md-field>
            <strong
              v-if="errorMessage2 != null && isExistAccount"
              class="error-message"
            >
              {{ errorMessage2 }}
            </strong>
          </div>
        </div>
        <div class="actions md-layout md-alignment-center-space-between">
          <md-button
            class="md-raised md-primary"
            v-if="isExistAccount == false"
            @click.native="accountCheck()"
          >
            Check Availability
          </md-button>
          <md-button
            v-if="isExistAccount"
            class="md-raised md-primary"
            :disabled="errorMessage1 != null || errorMessage2 != null"
            type="submit"
            >Create Account</md-button
          >
        </div>
      </form>
    </md-content>
  </main>
</template>
<script lang="ts">
  import { Component, Vue, Watch } from "vue-property-decorator";
  @Component({
    components: {},
  })
  export default class Signin extends Vue {
    regExp =
      /^([\w\.\_\-])*[a-zA-Z0-9]+([\w\.\_\-])*([a-zA-Z0-9])+([\w\.\_\-])+@([a-zA-Z0-9]+\.)+[a-zA-Z0-9]{2,8}$/;
    loading = false;
    isExistAccount = false;
    email = "test@naver.com";
    name = "";
    password = "";
    errorMessage1: null | string = null;
    errorMessage2: null | string = null;
    @Watch("name", {
      immediate: true,
    })
    onNameChanged(val: string) {
      if (val.trim().length == 0) {
        this.errorMessage1 = "이름을 입력해주세요.";
      } else {
        this.errorMessage1 = null;
      }
    }
    @Watch("password", {
      immediate: true,
    })
    onPasswordChanged(val: string) {
      if (val.trim().length < 8) {
        this.errorMessage2 = "비밀번호는 반드시 8글자 이상 입력 해야 합니다.";
      } else {
        this.errorMessage2 = null;
      }
    }
    accountCheck(): void {
      if (this.regExp.test(this.email) == false) {
        this.$noticeMessage("올바른 이메일 주소를 입력해주세요.");
      } else {
        this.$axios
          .get(this.$ApiUrl.checkUser + encodeURI(this.email))
          .then((result: { [key: string]: any }) => {
            console.log(result);
          })
          .catch((err: any) => {
            console.log(err.response);
            if (err.response.status == 404) {
              console.info("available email address");
              this.isExistAccount = true;
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
    .error-message {
      color: #ff1744;
      font-size: 17px;
      text-align: left;
    }
    .md-button {
      margin: 0;
      margin-top: 10px;
    }
    .md-elevation-3 {
      max-width: 570px;
      width: 80%;
      margin: 0 auto;
      padding: 30px;
      box-sizing: border-box;
    }
  }
</style>
