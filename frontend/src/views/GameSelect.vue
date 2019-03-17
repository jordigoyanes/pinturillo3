<template>
  <section class="hero is-dark is-fullheight">
    <div class="hero-body">
      <div class="container is-mobile">
        <h1 class="title is-size-1 has-text-centered">Pinturillo3</h1>
        <div class="columns">
          <div class="column">
            <div
              class="box has-background-success game-select"
              @click="goPublic()"
            >
              <h1 class=" is-size-1 has-text-centered">Play public</h1>
            </div>
          </div>
          <div class="column">
            <div
              class="box has-background-warning game-select"
              @click="goPrivate()"
            >
              <h1 class=" is-size-1 has-text-centered">Private Room</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </section>
</template>
<script>
import { mapState, mapActions, mapMutations } from "vuex";
import Footer from "@/components/Footer";
export default {
  components: {
    Footer
  },
  data: function() {
    return {
      showErr: false,
      room_name: "",
      room_password: ""
    };
  },
  methods: {
    goPublic() {
      this.socket.emit("join_public_room", {
        player: this.localPlayer
      });
    },
    goPrivate() {
      this.$router.push({ name: "private" });
    },
    ...mapActions({
      join_public_room: 'join_public_room'
    }),
    ...mapMutations({
      set_room_id: 'set_room_id',
      set_playerlist: 'set_playerlist',
      set_logged: 'set_logged',
      set_localplayer: 'set_localplayer',
    }),
  },
  mounted() {
    this.socket.on("joined_room", (room) => {
      console.log("this is original: "+room.original_joiner_name)
      console.log("localplayer: "+this.localPlayer)

      if(room.original_joiner_name === this.localPlayer){
        this.set_logged(true);
        this.set_room_id(room.id)
        this.set_localplayer(room.new_joiner_name)
        this.$router.push({ path: "/room/" +  this.room_id});
      }
      this.set_playerlist(room.players)
    });
  },
  computed: {
    ...mapState({
      socket: "socket",
      localPlayer: "localPlayer",
      room_id: "room_id"
    })
  }
};
</script>

<style lang="scss">
.game-select:hover {
  cursor: pointer;
}
.game-select h1 {
  font-weight: bold;
}
</style>
