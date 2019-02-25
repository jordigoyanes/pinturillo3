import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Game from "./views/Game.vue";
import RoomSelect from "./views/RoomSelect.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/game",
      name: "game",
      component: Game
    },
    {
      path: "/select-room",
      name: "room-select",
      component: RoomSelect
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "./views/About.vue")
    }
  ]
});
