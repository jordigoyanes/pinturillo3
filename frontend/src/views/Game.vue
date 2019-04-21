<template>
  <div>
    <section class="section has-background-info">
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
            <span class="tag is-success">{{ this.room_id }}</span>
          </div>
        </div>
      </div>
    </section>
    <div class="hero is-mobile is-dark is-fullheight">
      <div id="game-columns" class="grid">
        <div class="whitebox span-col-2">
          <Scores />
        </div>
        <div class="span-col-5">
          <div id="word-top" class="whitebox has-background-danger">test</div>
          
          <DrawingArea />
        </div>
        <div class="whitebox span-col-3">
          <Chatbox />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import DrawingArea from "@/components/DrawingArea";
import Chatbox from "@/components/Chatbox.vue";
import Scores from "@/components/Scores";
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
    Scores
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
  }
};
</script>

<style lang="scss">
h1#game-title:nth-child(0){
  color:red;

}

.whitebox {
  background-color: white;
  border-radius: 6px;
  -webkit-box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1),
    0 0 0 1px rgba(10, 10, 10, 0.1);
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  color:#363636;
  
}
#word-top{
  padding: 1em;
  border-radius: 6px 6px 0px 0px;
}

#game-title {
  font-weight: bold;
  color: white;
}

#game-columns{
  margin: 1em auto;
}
.grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    grid-gap: 10px;
}
.span-col-2{
  grid-column: span 2 / auto;
}
.span-col-5{
  grid-column: span 5 / auto;
}
.span-col-3{
  grid-column: span 3 / auto;
}

</style>
