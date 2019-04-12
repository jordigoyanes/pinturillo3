<template>
  <div>
    <div class="field">
      <div class="chatbox">
        <ul>
          <li v-for="(chatmsg, index) in chat_messages" :key="index">
            <div v-if="chatmsg.type == 'evt'">
              <span :class="chatmsg.evt_type"></span>
              <p class="evt">{{ chatmsg.message }}</p>
            </div>
            <div v-else>
              <p>
                <strong>{{ chatmsg.username }}</strong
                >: {{ chatmsg.message }}
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="field">
      <div class="control">
        <input
          class="input is-danger"
          type="text"
          v-model="guess"
          v-on:keyup.enter="send_message"
          :placeholder="i18n.t('enter_guess')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "Chatbox",
  data: function() {
    return {
      guess: "",
      chat_messages: [{ username: "jordi", message: "i don't know" }]
    };
  },
  methods: {
    log: function() {
      console.log(this.guess);
    },
    send_message: function() {
      if (this.guess != "") {
        this.socket.emit("new_message", {
          username: this.localPlayer,
          message: this.guess
        });
        this.guess = "";
      }
    }
  },
  mounted() {
    this.socket.on("new_message", data => {
      this.chat_messages = [...this.chat_messages, data];
    });
    this.socket.on("chat_evt", data => {
      console.log("este es evt_type: " + data.evt_type);
      switch (data.evt_type) {
        case "player_joined":
          data.message = data.username + this.i18n.t("chat_evt.player_joined");
          break;
        case "player_left":
          data.message = data.username + this.i18n.t("chat_evt.player_left");
          break;
        case "guessed_word":
          data.message = data.username + this.i18n.t("chat_evt.guessed_word");
          break;
        case "reported":
          data.message = this.i18n.t("chat_evt.reported");
          break;
        case "going_to_draw":
          data.message = data.username + this.i18n.t("chat_evt.going_to_draw");
          break;
      }
      data.type = "evt";
      this.chat_messages = [...this.chat_messages, data];
    });
  },
  computed: {
    ...mapState({
      socket: "socket",
      localPlayer: "localPlayer",
      room_id: "room_id",
      i18n: "i18n"
    })
  }
};
</script>
<style lang="scss">
.chatbox {
  min-height: 200px;
  max-height: 200px;
  overflow: auto;
}
.evt {
  font-weight: bold;
  color: orange;
}
</style>
