import Vue from "vue";
import Vuex from "vuex";
import userStore from "./modules/userStore";
import modalSetting from "./modules/modalSetting";
import layoutSetting from "./modules/layoutSetting";
Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    userStore,
    modalSetting,
    layoutSetting,
  },
});
