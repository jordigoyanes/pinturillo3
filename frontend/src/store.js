import Vue from "vue";
import Vuex from "vuex";
import io from "socket.io-client";
import i18n from "@/plugins/i18n";

Vue.use(Vuex);
// "pinturillo3.herokuapp.com"
// "localhost:3000"
export default new Vuex.Store({
  state: {
    socket: io("pinturillo3.herokuapp.com"),
    localPlayer: null,
    isLoggedIn: false,
    isDrawing: false,
    room_id: null,
    players: null,
    i18n: i18n
  },
  mutations: {
    set_localplayer(state, payload) {
      state.localPlayer = payload;
    },
    set_score(state, payload) {
      let players = state.players;
      for (let i = 0; i < players.length; i++) {
        if (players[i].username === payload.username) {
          players[i].score += payload.score;
        }
      }
    },
    set_room_id(state, payload) {
      state.room_id = payload;
    },
    set_playerlist(state, payload) {
      state.players = payload;
    },
    set_logged(state, payload) {
      state.isLoggedIn = payload;
    }
  },
  actions: {
    async create_room({ state }, payload) {
      console.log(state + payload);
    }
  }
});
