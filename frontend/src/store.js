import Vue from "vue";
import Vuex from "vuex";
import io from "socket.io-client";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    socket: io("https://pinturillo3.herokuapp.com"),
    localPlayer: null,
    isLoggedIn: false,
    room_id: null,
    players: null
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
