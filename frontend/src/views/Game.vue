<template>
  <div>
    <section class="section has-background-dark">
      <div class="level">
        <div class="level-item level-left">
          <button @click="leave()" class="button is-dark ">
            {{ $t("leave_room") }}
          </button>
        </div>
        <h1 id="game-title" class="is-size-3 level-item has-text-centered">
          Pinturillo 3
        </h1>
        <div class="level-item level-right">
          <div class="tags has-addons">
            <span class="tag is-dark">Room ID</span>
            <span class="tag is-warning">{{ this.room_id }}</span>
          </div>
        </div>
      </div>
    </section>
    <div class="hero is-mobile is-dark is-fullheight">
      <div id="game-columns" class="grid">
        <Scores />
        <div id="drawing-column" class="span-col-5 span-row-85">
          <div id="word-top" class="whitebox has-background-danger">
            <div id="clock">
              <div id="sec">17</div>
            </div>
            <div id="word">
              <div class="letter_box">N</div>
              <div class="letter_box">U</div>
              <div class="letter_box"></div>
              <div class="letter_box"></div>
              <div class="letter_box">S</div>
            </div>
          </div>
          <Toolbox />
          <DrawingArea />
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
import { mapState, mapMutations } from "vuex";

export default {
  name: "game",
  data: function() {
    return {
      isWaitingNextTurn: true
    };
  },
  components: {
    DrawingArea,
    Chatbox,
    Scores,
    Toolbox
  },
  methods: {
    leave() {
      this.socket.disconnect();
      this.set_logged(false);
      this.set_playerlist(null);
      this.set_localplayer(null);
      this.set_room_id(null);
      this.$router.push({ name: "home" });
    },
    ...mapMutations({
      set_room_id: "set_room_id",
      set_playerlist: "set_playerlist",
      set_logged: "set_logged",
      set_score: "set_score",
      set_localplayer: "set_localplayer"
    })
  },
  computed: {
    ...mapState({
      socket: "socket",
      room_id: "room_id",
      localPlayer: "localPlayer",
      players: "players"
    })
  },
  mounted() {
    this.socket.on("left_room", newData => {
      this.set_playerlist(newData.players);
      console.log("this is the new data: " + JSON.stringify(newData.players));
    });
    this.socket.on("wait_next_turn", newData => {
      this.set_playerlist(newData.players);
      console.log("this is the new data: " + JSON.stringify(newData.players));
    });
    this.socket.on("score_change", newData => {
      this.set_playerlist(newData.players);
      console.log("this is the new data: " + JSON.stringify(newData.players));
    });
    this.socket.on("countdown_sec", data => {
      console.log("Second: " + data.secs);
    });
  }
};
</script>

<style lang="scss">
#word {
  display: flex;
  align-items: flex-end;
  margin: 0 auto;
}
#word-top {
  display: flex;
  align-items: center;
  padding: 1em;
  border-radius: 6px 6px 0px 0px;
}
#clock {
  position: absolute;
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
  min-width: 80%;
  padding: 0 2em;
}
#drawing-column {
  border-radius: 0px 0px 6px 6px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-gap: 10px;
}
.span-col-2 {
  grid-column: span 2 / auto;
}
.span-col-5 {
  grid-column: span 5 / auto;
}
.span-col-3 {
  grid-column: span 3 / auto;
}
.span-row-85 {
  grid-row: span 75 / auto;
  min-height: 80vh;
  max-height: 80vh;
  overflow: hidden;
}
</style>
