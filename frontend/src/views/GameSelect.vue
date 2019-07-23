<template>
  <section class="hero is-dark is-fullheight">
    <div class="hero-body">
      <div class="container is-mobile">
        <h1 class="title is-size-1 has-text-centered">Pintanary</h1>
        <div v-if="!isLoading" class="columns">
          <div class="column">
            <div
              class="box has-background-success game-select"
              @click="goPublic()"
            >
              <h1 class=" is-size-1 has-text-centered">
                {{ $t("play_public") }}
              </h1>
            </div>
            <div class="section">
              <h3 class="title is-4">{{ $t("public_desc") }}</h3>
            </div>
          </div>
          <div class="column">
            <div
              class="box has-background-warning game-select"
              @click="goPrivate()"
            >
              <h1 class=" is-size-1 has-text-centered">
                {{ $t("play_private") }}
              </h1>
            </div>
            <div class="section">
              <h3 class="title is-4">{{ $t("private_desc") }}</h3>
            </div>
          </div>
        </div>
        <div v-else>
          <progress class="progress is-success" max="100">45%</progress>
        </div>
      </div>
    </div>
    <Footer />
  </section>
</template>
<script>
import { mapState, mapActions, mapMutations } from "vuex";
import i18n from "@/plugins/i18n";
import Footer from "@/components/Footer";
export default {
  components: {
    Footer
  },
  data: function() {
    return {
      showErr: false,
      room_name: "",
      room_password: "",
      isLoading: false,
      i18n: i18n
    };
  },
  methods: {
    goPublic() {
      this.isLoading = true;
      this.socket.emit("join_public_room", {
        player: this.localPlayer,
        locale: this.i18n.locale
      });
    },
    goPrivate() {
      this.$router.push({ name: "private" });
    },
    ...mapActions({
      join_public_room: "join_public_room"
    }),
    ...mapMutations({
      set_room_id: "set_room_id",
      set_playerlist: "set_playerlist",
      set_logged: "set_logged",
      set_localplayer: "set_localplayer"
    })
  },
  mounted() {
    if (!this.socket.connected) {
      this.socket.connect();
    }
    this.socket.on("joined_room", room => {
      this.set_playerlist(room.players);
    });
    this.socket.on("user_join", room => {
      console.log("this is original: " + room.original_joiner_name);
      console.log("this is new joiner name: " + room.new_joiner_name);

      this.set_localplayer(room.new_joiner_name);
      this.set_logged(true);
      this.set_room_id(room.id);
      this.set_playerlist(room.players);

      this.$router.push({ path: "/room/" + this.room_id });
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
