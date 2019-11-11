<template>
  <section class="hero is-dark is-fullheight">
    <div class="hero-body">
      <div class="container is-mobile">
        <div v-if="!isLoading" class="columns is-centered">
          <div class="column is-half">
            <h1 class="title is-size-2 has-text-centered">{{ $t("join_or_create_room") }}</h1>
            <div v-show="showErr" class="notification is-danger">
              <button @click="showErr = false" class="delete"></button>
              {{errMessage}}
            </div>
            <div class="box">
              <div class="field">
                <label class="label">Room Name:</label>
                <div class="control">
                  <input v-model="room_name" class="input" type="text" placeholder="room name" />
                </div>
              </div>
              <div class="field">
                <label class="label">Room Password:</label>
                <div class="control">
                  <input v-model="room_password" class="input" type="text" placeholder="password" />
                </div>
              </div>
              <div id="buttons">
                <button :disabled="disabled" @click="create_room()" class="button dark is-warning">
                  <p>{{ $t("create_room") }}</p>
                </button>
                <button :disabled="disabled" @click="join_room()" class="button dark is-success">
                  <p>{{ $t("join_room") }}</p>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="section">
          <progress class="progress is-success" max="100">45%</progress>
        </div>
      </div>
    </div>
    <Footer />
  </section>
</template>
<script>
import { mapState, mapMutations } from "vuex";
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
      i18n: i18n,
      disabled: false,
      errMessage: ""
    };
  },
  mounted() {
    if (!this.socket.connected) {
      this.socket.connect();
    }
    this.socket.on("error_private_room", data => {
      this.showErr = true;
      switch (data.type) {
        case "not_found":
          this.errMessage = this.i18n.t("not_found");
          break;
        case "already_exists":
          this.errMessage = this.i18n.t("already_exists");
          break;
        default:
          this.errMessage = this.i18n.t("err_joining_or_creating");
          break;
      }
    });
    this.socket.on("joined_room", room => {
      this.set_playerlist(room.players);
    });
    this.socket.on("user_join", room => {
      console.log("this is original: " + room.original_joiner_name);
      console.log("this is new joiner name: " + room.new_joiner_name);
      this.set_painter(room.painter);
      this.set_localplayer(room.new_joiner_name);
      this.set_logged(true);
      this.set_room_id(room.id);
      this.set_playerlist(room.players);
      if (this.localPlayer == room.new_joiner_name) {
        let word = "";
        for (let i = 0; i < room.word; i++) {
          word = word + " ";
        }
        this.set_word(word);
      }
      this.$router.push({ path: "/room/" + this.room_id });
    });
  },
  methods: {
    join_room() {
      if (this.room_password == "" || this.room_name == "") {
        this.showErr = true;
        this.errMessage = this.i18n.t("fill_inputs");
      } else {
        this.isLoading = true;
        this.socket.emit("join_private_room", {
          player: this.localPlayer,
          room_id: this.room_name,
          password: this.room_password,
          locale: this.i18n.locale
        });
        this.isLoading = false;
      }
    },
    create_room() {
      if (this.room_password == "" || this.room_name == "") {
        this.showErr = true;
        this.errMessage = this.i18n.t("fill_inputs");
      } else {
        this.isLoading = true;
        this.socket.emit("create_private_room", {
          player: this.localPlayer,
          room_id: this.room_name,
          password: this.room_password,
          locale: this.i18n.locale
        });
        this.isLoading = false;
      }
    },
    ...mapMutations({
      set_room_id: "set_room_id",
      set_playerlist: "set_playerlist",
      set_logged: "set_logged",
      set_painter: "set_painter",
      set_localplayer: "set_localplayer",
      set_word: "set_word",
      set_show_drawing: "set_show_drawing",
      set_show_toolbox: "set_show_toolbox"
    })
  },
  computed: {
    ...mapState({
      socket: "socket",
      localPlayer: "localPlayer",
      room_id: "room_id",
      painter: "painter"
    })
  }
};
</script>
<style lang="scss">
#buttons {
  display: flex;
  justify-content: space-between;
}
</style>