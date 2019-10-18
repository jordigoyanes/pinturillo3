import Vue from "vue";
import Vuex from "vuex";
import io from "socket.io-client";
import i18n from "@/plugins/i18n";
import _ from "lodash";

Vue.use(Vuex);

const socketlink =
  process.env.NODE_ENV === "production" ?
  "https://pinturillo3.herokuapp.com" :
  "localhost:3000";

export default new Vuex.Store({
  state: {
    socket: io(socketlink),
    localPlayer: null,
    isLoggedIn: false,
    isDrawing: false,
    room_id: null,
    players: null,
    current_round: 1,
    current_word: "?",
    i18n: i18n,
    brush_color: "black",
    brush_width: 4,
    painter: null,
    show_drawing: false,
    show_toolbox: false,
    show_options: false,
    show_scoreboard: false,
    guessed: null,
  },
  mutations: {
    remove_points_gained(state) {
      for (let i = 0; i < state.players.length; i++) {
        state.players[i].points_gained = 0;
      }
      console.log("this is state.players after removing points gained: " + JSON.stringify(state.players));
    },
    set_guessed(state, payload) {
      state.guessed = payload;
    },
    set_show_scoreboard(state, payload) {
      state.show_scoreboard = payload;
    },
    set_show_drawing(state, payload) {
      state.show_drawing = payload;
    },
    set_show_toolbox(state, payload) {
      state.show_toolbox = payload;
    },
    set_show_options(state, payload) {
      state.show_options = payload;
    },
    set_painter(state, payload) {
      state.painter = payload;
    },
    set_word(state, payload) {
      state.current_word = payload;
    },
    set_current_round(state, payload) {
      state.current_round = payload;
    },
    set_brush_color(state, payload) {
      state.brush_color = payload;
    },
    set_brush_width(state, payload) {
      state.brush_width = payload;
    },
    set_localplayer(state, payload) {
      state.localPlayer = payload;
    },
    set_score(state, payload) {
      let players = state.players;
      for (let i = 0; i < players.length; i++) {
        if (players[i].username === payload.username) {
          players[i].score = payload.score;
        }
      }
    },
    set_room_id(state, payload) {
      state.room_id = payload;
    },
    set_playerlist(state, payload) {
      state.players = _.orderBy(payload, "score")
        .reverse();
    },
    set_logged(state, payload) {
      state.isLoggedIn = payload;
    }
  },
  actions: {
    async create_room({
      state
    }, payload) {
      console.log(state + payload);
    }
  }
});
