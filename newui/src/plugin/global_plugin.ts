const store = require("@/store").default;
export default {
  install(Vue: { [key: string]: any }) {
    Vue.prototype.$noticeMessage = (message: string): void => {
      store.commit({
        type: "modalSetting/IS_OPEN_MODAL",
        message: message,
      });
    };
    // hh.mm.ss to ss
    Vue.prototype.$hms_to_s = (hms: string): number => {
      const a = hms.split(":"); // split it at the colons
      const seconds = +a[0] * 60 * 60 + +a[1] * 60 + +a[2];
      return seconds;
    };
    // hh mm ss
    Vue.prototype.$getTimeStringSeconds = (seconds: number): string => {
      let hour, min, sec;
      hour = Math.floor(seconds / 3600);
      min = Math.floor((seconds % 3600) / 60);
      sec = seconds % 60;
      if (hour.toString().length == 1) hour = "0" + hour;
      if (min.toString().length == 1) min = "0" + min;
      if (sec.toString().length == 1) sec = "0" + sec;
      return hour + ":" + min + ":" + sec;
    };
    // Number comma
    Vue.prototype.$numberWithCommas = (x: number): string => {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    // 데이트 포맷
    Vue.prototype.$dateFormat = <T>(a: T): string => {
      let date;
      if (typeof a === "object") {
        date = new Date(a as any);
      } else {
        date = new Date();
      }
      const year: number = date.getFullYear();
      let month = String(date.getMonth() + 1);
      let day = String(date.getDate());
      if (month.length == 1) {
        month = "0" + month;
      }
      if (day.length == 1) {
        day = "0" + day;
      }
      console.log(year + "-" + month + "-" + day);
      return year + "-" + month + "-" + day;
    };
  },
};
