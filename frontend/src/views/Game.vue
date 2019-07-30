<template>
  <div>
    <section id="top-bar" class="section has-background-dark">
          <button @click="leave()" class="button is-dark ">
            {{ $t("leave_room") }}
          </button>
        
        <h1 id="game-title" class="is-size-3 level-item has-text-centered">
          Pintanary
        </h1>
        
          <div class="tags has-addons">
            <span class="tag is-dark">Room ID</span>
            <span class="tag is-warning">{{ this.room_id }}</span>
          </div>

    </section>
    <div class="hero is-mobile is-dark is-fullheight">
      <div id="game-columns" class="grid">
        <Scores />
        <div id="drawing-column" class="span-col-5 span-row-85">
          <div id="word-top" class="whitebox has-background-danger">
            <div id="clock">
              <div id="sec">{{turn_clock}}</div>
            </div>
            <div id="word">
              <div class="letter_box">N</div>
              <div class="letter_box">U</div>
              <div class="letter_box"></div>
              <div class="letter_box"></div>
              <div class="letter_box">S</div>
            </div>
            <div id="round">{{current_round}}/3</div>
          </div>
          <div id="drawing-area" v-if="false" class="has-background-warning">
            <div id="word-selector">
              <div v-for="(option, index) in options" :key=index class="word_option" >
                {{option}}
              </div>
            </div>
            <Toolbox />
            <DrawingArea />
          </div>
          <div id="gray-bg" v-else>
              <div id="going_to_draw">

              </div>
              <div id="scoreboard">
                
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
import { mapState, mapMutations } from "vuex";

export default {
  name: "game",
  data: function() {
    return {
      isWaitingNextTurn: true,
      turn_clock: 60,
      ready_sec: 3,
      options: [],
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
      set_localplayer: "set_localplayer",
      set_current_round: "set_current_round"
    })
  },
  computed: {
    ...mapState({
      current_round: "current_round",
      socket: "socket",
      room_id: "room_id",
      localPlayer: "localPlayer",
      players: "players"
    })
  },
  mounted() {
    this.socket.on('disconnect', function () {
      this.$router.push({ path: "/" });
      console.log('Client disconnected from inactivity');
    });

    console.log("THIS IS MY SOCKET ID: "+this.socket.id)
     this.socket.on("show_options", data => {
      console.log("estas son mis opciones: "+data)
      this.options = data;
    });
    this.socket.on("update_round", data => {
      this.set_current_round(data.round);
    });
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
    this.socket.on("turn_countdown_sec", data => {
      this.turn_clock = data.sec;
      console.log("Second: " + data.sec);
    });
  }
};
</script>

<style lang="scss">
#top-bar{
  display:flex;
  justify-content: space-around;
}
#word-selector{
  align-items: center;
  display: flex;
  justify-content: space-around;
  font-size: 1.5em;
  color: #363636;
  font-weight: bold;
  text-transform: uppercase;
  
}
.word_option{
  flex: 1;
  text-align: center;
  padding:0.5em;
}
.word_option:hover{
  cursor:pointer;
}
#drawing-area{
  flex:1;
}
#gray-bg{
  background-color: #ffffff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg stroke='%23CCC' stroke-width='0' %3E%3Crect fill='%23F5F5F5' x='-60' y='-60' width='110' height='240'/%3E%3C/g%3E%3C/svg%3E");
  flex:1;
}
#round{
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
  min-width: 80%;
  padding: 0 2em;
}
#drawing-column {
  border-radius: 0px 0px 6px 6px;
  display: flex;
  flex-direction: column;
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
