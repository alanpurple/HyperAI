import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "../views/Home.vue";
Vue.use(VueRouter);
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location: string) {
  return (originalPush.call(this, location) as unknown as Promise<any>).catch(
    (error: Error) => {}
  );
};

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Home",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Home.vue"),
  },
  {
    path: "/about",
    name: "About",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
  {
    path: "/login",
    name: "Signin",
    component: () =>
      import(/* webpackChunkName: "singin" */ "../views/Signin.vue"),
  },
  {
    path: "/signup",
    name: "Signup",
    component: () =>
      import(/* webpackChunkName: "singup" */ "../views/Signup.vue"),
  },
  {
    path: "/model-suggestion",
    name: "model-suggestion",
    component: () =>
      import(
        /* webpackChunkName: "model-suggestion" */ "../views/ModelSuggestion.vue"
      ),
  },
  {
    path: "/data-manager",
    name: "data-manager",
    component: () =>
      import(/* webpackChunkName: "data-manager" */ "../views/DataManager.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
