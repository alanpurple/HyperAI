import { Module } from "vuex";
interface layoutType {
  layout: {
    navBar: boolean;
  };
}
const module: Module<layoutType, { [key: string]: any }> = {
  namespaced: true,
  state: {
    layout: {
      navBar: true,
    },
  },
  mutations: {
    ["LAYOUT_CHANGE"](state: layoutType, payload: { [key: string]: any }) {
      state.layout = { ...state.layout, ...payload };
    },
  },
  actions: {
    setRootData({ commit }, data: string) {
      commit("setData", data);
    },
  },
};

export default module;
