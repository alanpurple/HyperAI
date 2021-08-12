import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";
import ApiUrl from "@/assets/apiurl";
import GlobalPlugin from "@/plugin/global_plugin";
import VueMaterial from "vue-material";
import "vue-material/dist/vue-material.min.css";
import "vue-material/dist/theme/default.css";
Vue.use(VueMaterial);
Vue.use(GlobalPlugin);
Vue.prototype.$axios = axios;
Vue.prototype.$EventBus = new Vue();
Vue.prototype.$ApiUrl = ApiUrl;
Vue.config.productionTip = false;
axios.defaults.baseURL = process.env.VUE_APP_API_URL;
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
