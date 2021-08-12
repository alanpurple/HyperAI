import { Module } from "vuex";
interface stateType {
  userInfo: null | { [key: string]: any };
}
const module: Module<stateType, { [key: string]: any }> = {
  namespaced: true,
  state: {
    userInfo: null,
  },
  mutations: {
    // 유저정보 셋팅
    ["USER_INFO"](state: stateType, payload: { [key: string]: any }) {
      console.log(payload);
      state.userInfo = payload;
    },
  },
};

export default module;
