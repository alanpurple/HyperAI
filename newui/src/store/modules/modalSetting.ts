import { Module } from "vuex";
interface ModalType {
  mask: boolean;
  messageModal: {
    isOpenModal: boolean;
    message: string;
  };
}

const module: Module<ModalType, { [key: string]: any }> = {
  namespaced: true,
  state: {
    mask: false,
    messageModal: {
      isOpenModal: false,
      message: "",
    },
  },
  mutations: {
    ["MASK_TOGGLE"](state: ModalType, payload: { [key: string]: any }) {
      state.mask = payload.mask;
    },
    ["IS_OPEN_MODAL"](state: ModalType, payload: { [key: string]: any }) {
      state.messageModal.message = payload.message;
      state.messageModal.isOpenModal = !state.messageModal.isOpenModal;
      state.mask = !state.mask;
    },
  },
  actions: {
    setRootData({ commit }, data: string) {
      commit("setData", data);
    },
  },
  getters: {
    // data: (state) => state.data,
  },
};

export default module;
