<template>
  <md-toolbar class="md-medium">
    <md-button class="md-icon-button" @click.native="menuToggle()">
      <md-icon>menu</md-icon>
    </md-button>
    <div class="md-toolbar-section-end">
      <ul v-if="userInfo != null && toggleCard" class="toggle-card">
        <li>Welcome,{{ userInfo.name }}</li>
        <li>
          <router-link to="/user-info">Setting</router-link>
        </li>
        <li>
          <a href="/account/logout">logout</a>
        </li>
      </ul>
      <md-button @click="goToPath('signup')" v-if="userInfo == null"
        >Sign up</md-button
      >
      <md-button @click="goToPath('login')" v-if="userInfo == null"
        >Sign in</md-button
      >
      <md-button
        v-if="userInfo != null"
        class="md-icon-button md-dense md-primary"
        @click.native="toggle()"
      >
        <md-icon>person</md-icon>
      </md-button>
      <md-button @click="logout()" v-if="userInfo != null"
        ><a href="/account/logout" v-if="userInfo != null">logout</a></md-button
      >
    </div>
  </md-toolbar>
</template>
<script lang="ts">
  import { Component, Vue } from "vue-property-decorator";
  import { mapState, mapMutations } from "vuex";
  @Component({
    components: {},
    computed: {
      ...mapState("userStore", ["userInfo"]),
      ...mapState("layoutSetting", ["layout"]),
    },
    methods: {
      ...mapMutations("layoutSetting", ["LAYOUT_CHANGE"]),
    },
  })
  export default class Header extends Vue {
    LAYOUT_CHANGE!: (paylaod: { [key: string]: any }) => void;
    layout!: { [key: string]: any };
    toggleCard = false;
    goToPath(path: string): void {
      this.$router.push(path);
    }
    menuToggle(): void {
      this.LAYOUT_CHANGE({ navBar: !this.layout.navBar });
    }
    toggle(): void {
      this.toggleCard = !this.toggleCard;
    }
  }
</script>
<style lang="scss" scoped>
  .md-medium {
    .md-toolbar-section-end {
      position: relative;
      .toggle-card {
        position: absolute;
        top: 30px;
        right: 100px;
        background: #c0baba;
        padding: 15px;
        border-radius: 5px;
        li {
          list-style: none;
        }
      }
    }
  }
</style>
