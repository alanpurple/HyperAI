import Vue from "vue";
declare module "vue/types/vue" {
  // 프로토타입 메소드 선언하는곳
  interface Vue {
    $ApiUrl: { [key: string]: any };
    $router: { [key: string]: any };
    $route: { [key: string]: any };
    $axios: { [key: string]: any };
    $EventBus: { [key: string]: any };
    $cookies: { [key: string]: any };
    $session: { [key: string]: any };
    $noticeMessage: Function;
  }
  // 전역메소드 선언하는곳
  interface VueConstructor {
    noticeMessage: Function;
  }
}
