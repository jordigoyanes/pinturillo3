<template>
  <div>
    <section id="top-bar" class="section has-background-dark">
      <a :href="leave_link">
        <button class="leave button is-dark">{{ $t("leave_room") }}</button>
      </a>

      <h1 id="game-title" class="is-size-3 level-item has-text-centered">Pinturillo 3</h1>

      <div class="tags has-addons">
        <span class="tag is-dark">Room ID</span>
        <span class="tag is-warning">{{ this.room_id }}</span>
      </div>
    </section>
    <div class="hero is-mobile is-dark is-fullheight">
      <div id="game-columns">
        <Scores />
        <div id="drawing-column" class="span-col-5 span-row-85">
          <div id="word-top" class="whitebox has-background-danger">
            <div id="clock">
              <div id="sec">{{ turn_clock }}</div>
            </div>
            <div id="word">
              <div v-for="(letter, index) in word" :key="index" class="letter_box">{{letter}}</div>
            </div>
            <div id="round">{{ current_round }}/3</div>
          </div>
          <div v-if="show_options" id="word-selector">
            <div
              v-for="(option, index) in options"
              :key="index"
              class="word_option"
              @click="choose_word({option_index: index})"
            >{{ option }}</div>
          </div>

          <div id="drawing-area" v-if="show_drawing" class="has-background-warning">
            <Toolbox v-if="show_toolbox" />
            <DrawingArea />
          </div>
          <div id="gray-bg" v-else>
            <div v-if="show_scoreboard" id="scoreboard">
              <div v-if="is_final_scoreboard" id="winner_name">
                <h1>{{players[0].username}} {{ $t("chat_evt.player_won") }}</h1>
              </div>
              <div v-for="(player, index) in players" :key="index" class="player">
                <div class="current_score">
                  <div class="classification">{{index + 1}}</div>
                  <div class="name">{{player.username}}</div>
                  <div class="scoreboard_score">{{player.score}}</div>
                </div>
                <div v-if="player.points_gained && player.points_gained !=0" class="points_gained">
                  <p>{{player.points_gained}}</p>
                </div>
              </div>
            </div>
            <div v-else>
              <div id="ready_wait" v-if="ready_wait">
                <h3 id="chosen_word" v-if="localPlayer == painter">{{word}}</h3>
                <h2>{{ready_sec}}</h2>
              </div>
              <div id="going_to_draw">
                <img src="@/assets/pencil.svg" alt />
                <h1>{{painter}} {{ $t("chat_evt.going_to_draw") }}</h1>
              </div>
            </div>
          </div>
        </div>
        <Chatbox />
      </div>
    </div>
  </div>
</template>
<script>
import DrawingArea from "@/components/DrawingArea";
import Chatbox from "@/components/Chatbox.vue";
import Scores from "@/components/Scores";
import Toolbox from "@/components/Toolbox";
import Scoreboard from "@/components/Scoreboard";

import { mapState, mapMutations } from "vuex";

export default {
  name: "game",
  data: function () {
    return {
      isWaitingNextTurn: true,
      turn_clock: 99,
      ready_sec: 3,
      options: [],
      ready_wait: false,
      is_final_scoreboard: false,
    };
  },
  components: {
    DrawingArea,
    Chatbox,
    Scores,
    Toolbox,
    Scoreboard,
  },
  methods: {
    choose_word(data) {
      this.set_show_options(false);
      this.socket.emit("choose_word", data);
      console.log("This is data: ");
      console.log(data);
      this.set_word(this.options[data.option_index].toUpperCase());
    },
    ...mapMutations({
      set_word: "set_word",
      set_room_id: "set_room_id",
      set_playerlist: "set_playerlist",
      set_logged: "set_logged",
      set_score: "set_score",
      set_localplayer: "set_localplayer",
      set_current_round: "set_current_round",
      set_show_drawing: "set_show_drawing",
      set_show_toolbox: "set_show_toolbox",
      set_show_options: "set_show_options",
      set_show_scoreboard: "set_show_scoreboard",
    }),
  },
  computed: {
    ...mapState({
      word: "current_word",
      current_round: "current_round",
      socket: "socket",
      room_id: "room_id",
      localPlayer: "localPlayer",
      players: "players",
      painter: "painter",
      show_drawing: "show_drawing",
      show_toolbox: "show_toolbox",
      show_options: "show_options",
      show_scoreboard: "show_scoreboard",
    }),
    leave_link: () => {
      let leave_link =
        process.env.NODE_ENV === "production"
          ? "https://pinturillo3.herokuapp.com"
          : "http://localhost:8080";
      return leave_link;
    },
  },
  mounted() {
    this.socket.on("reveal_letter", (data) => {
      if (this.localPlayer != this.painter) {
        let new_word = "";
        for (let i = 0; i < this.word.length; i++) {
          if (i == data.pos) {
            new_word += data.letter;
          } else {
            new_word += this.word[i];
          }
        }
        this.set_word(new_word);
      }
    });
    this.socket.on("show_scoreboard", (data) => {
      this.set_show_drawing(false);
      this.set_show_options(false);
      this.set_show_scoreboard(true);
      this.is_final_scoreboard = data.is_final;
    });
    this.socket.on("start_drawing", () => {
      this.set_show_drawing(true);
      if (this.localPlayer == this.painter) {
        this.set_show_toolbox(true);
      }
    });
    this.socket.on("reveal_word_length", (data) => {
      console.log(data);
      if (this.localPlayer != this.painter) {
        let word = "";
        for (let i = 0; i < data.word_length; i++) {
          word += " ";
        }
        this.set_word(word);
      }
      console.log("reveal word length: " + JSON.stringify(data));
    });
    this.socket.on("reveal_word", (data) => {
      this.set_word(data.word.toUpperCase());
      console.log("reveal full word: " + JSON.stringify(data));
    });
    console.log("THIS IS MY SOCKET ID: " + this.socket.id);
    this.socket.on("disconnect", () => {
      console.log("disconnect was triggered on the client");
    });
    this.socket.on("show_options", (data) => {
      console.log("estas son mis opciones: " + data);
      this.options = data;
      this.set_show_options(true);
    });
    this.socket.on("update_round", (data) => {
      this.set_current_round(data.round);
    });
    this.socket.on("left_room", (newData) => {
      this.set_playerlist(newData.players);
      console.log("this is the new data: " + JSON.stringify(newData.players));
    });
    this.socket.on("score_change", (newData) => {
      this.set_playerlist(newData.players);
      console.log("this is the new data: " + JSON.stringify(newData.players));
    });
    this.socket.on("turn_countdown_sec", (data) => {
      if (this.ready_wait) this.ready_wait = false;
      if (!this.show_drawing) this.set_show_drawing(true);
      if (this.localPlayer != this.painter) {
        if (this.show_toolbox) this.set_show_toolbox(false);
      }
      this.turn_clock = data.sec;
      console.log("Second: " + data.sec);
    });
    this.socket.on("get_ready_sec", (data) => {
      if (this.show_options) this.set_show_options(false);
      this.ready_wait = true;
      this.ready_sec = data.sec;
      this.ready_wait = true;
      console.log("Second: " + data.sec);
    });
  },
};
</script>

<style lang="scss">
.leave a {
  color: whitesmoke;
}
#winner_name {
  padding: 2em 0 1em 0;
  font-size: 2.5em;
  width: 100%;
  text-align: center;
}
#scoreboard {
  color: gray;
  display: flex;
  flex-direction: column;
  z-index: 500;
  align-items: center;
  width: 100%;
  .player {
    height: 3em;
    width: 50%;
    display: flex;
    flex-direction: row;
    margin-bottom: 0.5em;
    justify-content: space-between;
    .current_score {
      min-width: 20em;
      padding: 0.5em 1em;
      align-items: center;
      border-radius: 15px;
      background-color: #363636;
      color: whitesmoke;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      .classification,
      .name,
      .scoreboard_score {
        font-size: 0.9em;
        font-weight: bold;
      }
    }
    .points_gained {
      margin-left: 1em;
      padding: 1rem;
      font-size: 1em;
      font-weight: bold;
      background-image: url("../assets/star.svg");
      background-repeat: no-repeat;
      color: black;
      display: flex;
      align-items: center;
      text-align: center;
    }
  }
}

#ready_wait {
  display: flex;
  align-items: center;
  flex-direction: column;
  h2 {
    font-size: 4em;
    font-weight: bold;
    text-align: center;
    color: black;
  }
  h3#chosen_word {
    font-size: 2.1em;
    font-weight: bold;
    text-align: center;
    color: black;
  }
}
#going_to_draw {
  h2 {
    text-align: center;
    font-size: 3em;
    font-weight: bold;
  }
  h1 {
    font-size: 1.5em;
    font-weight: bold;
  }
}
#top-bar {
  display: flex;
  justify-content: space-around;
}
#word-selector {
  align-items: center;
  display: flex;
  justify-content: space-around;
  font-size: 1.5em;
  color: #363636;
  font-weight: bold;
  text-transform: uppercase;
  background-color: #ffdd57;
}
.word_option {
  flex: 1;
  text-align: center;
  padding: 0.5em;
}
.word_option:hover {
  background-color: #e2c347;
}
.word_option:hover {
  cursor: pointer;
}
#drawing-area {
  flex: 1;
  position: relative;
}
#gray-bg {
  background-color: #ffffff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg stroke='%23CCC' stroke-width='0' %3E%3Crect fill='%23F5F5F5' x='-60' y='-60' width='110' height='240'/%3E%3C/g%3E%3C/svg%3E");
  flex: 1;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  color: black;
  flex-direction: column;
  padding-top: 2em;
}
#round {
  font-family: "Kalam", cursive;
  font-size: 1.5em;
  font-weight: bold;
}
#word {
  display: flex;
  align-items: flex-end;
}
#word-top {
  display: flex;
  align-items: center;
  padding: 0.5em 1em;
  border-radius: 6px 6px 0px 0px;
  justify-content: space-between;
}
#clock {
  width: 3rem;
  height: 3rem;
  font-family: "Kalam", cursive;
  background-color: white;
  border: 4px solid black;
  border-radius: 50%;
  text-align: center;
  font-weight: bold;
  font-size: 2em;
}
h1#game-title:nth-child(0) {
  color: red;
}

#sec {
  margin: 0 auto;
}

.letter_box {
  border-bottom: 4px solid #b5203e;
  padding: 3px;
  margin-right: 2px;
  font-weight: bold;
  color: white;
  display: inline-block;
  width: 1em;
}

.whitebox {
  background-color: white;
  border-radius: 6px;
  -webkit-box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1),
    0 0 0 1px rgba(10, 10, 10, 0.1);
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  color: #363636;
}

#game-title {
  font-weight: bold;
  color: white;
}

#game-columns {
  margin: 1em auto;
  min-width: 100%;
  padding: 0 2em;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  height: 700px;
}
#drawing-column {
  border-radius: 0px 0px 6px 6px;
  display: flex;
  flex-direction: column;
  width: 800px;
  height: 700px;
}
</style>
