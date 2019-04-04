<template>
  <div>
    <section class="section has-background-danger">
      <div class="level">
        <div class="level-item level-left">
          <button @click="leave()" class="button is-warning">Leave Room</button>
        </div>
        <h1 id="game-title" class="is-size-3 level-item has-text-centered">
          Pinturillo 3
        </h1>
        <div class="level-item level-right">
          <div class="tags has-addons">
            <span class="tag is-dark">room id</span>
            <span class="tag is-warning">{{ this.room_id }}</span>
          </div>
        </div>
      </div>
    </section>
    <div class="hero is-mobile is-dark is-fullheight">
      <div id="game-columns">
        <div class="columns">
          <div class="column is-one-fifth">
            <div class="box">
              usuarios y puntuacion
              <Scores />
            </div>
          </div>
          <div class="column is-half">
            <div id="canvas-wrapper">
              <DrawingArea />
            </div>
          </div>
          <div class="column">
            <div class="box">
              <p class="is-primary">chat</p>
              <Chatbox />
            </div>
          </div>
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
    // other players listen
    this.socket.on("left_room", newData => {
      this.set_playerlist(newData.players);
      console.log("this is the new data: " + JSON.stringify(newData.players));
    });
  }
};
</script>

<style lang="scss">
#canvas-wrapper {
  flex: 1;
  display: flex;
  background-color: white;
  border-radius: 6px;
  -webkit-box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1),
    0 0 0 1px rgba(10, 10, 10, 0.1);
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  color: #ff3860;
  padding: 0;
  min-height: 800px;
}
#game-title {
  font-weight: bold;
  color: white;
}
#game-columns {
  padding: 0.8rem 1.5rem;
  flex: 1;
}
</style>
