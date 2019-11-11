import Vue from "vue";
import Router from "vue-router";
import store from "./store";

import Home from "./views/Home.vue";
import Game from "./views/Game.vue";
import GameSelect from "./views/GameSelect.vue";
import PrivateRoom from "./views/PrivateRoom.vue";

Vue.use(Router);

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/room/:id",
      name: "game",
      component: Game
    },
    {
      path: "/select-room",
      name: "room-select",
      component: GameSelect
    },
    {
      path: "/private",
      name: "private",
      component: PrivateRoom
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (
    to.name != "home" &&
    !store.state.localPlayer &&
    !store.state.isLoggedIn
  ) {
    next({
      path: "/"
    });
  } else {
    next();
  }
});

export default router;
