<template>
  <div id="chatbox" class="whitebox span-col-3 span-row-85">
    <ul id="messages">
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
    <input
      id="guess"
      class="input is-danger"
      type="text"
      v-model="guess"
      v-on:keyup.enter="send_message"
      :placeholder="i18n.t('enter_guess')"
    />
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "Chatbox",
  data: function() {
    return {
      guess: "",
      chat_messages: []
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
    },
    scrollToEnd: function() {
      var messages = document.getElementById("messages");
      messages.scrollTop = messages.scrollHeight;
    }
  },
  mounted() {
    this.scrollToEnd();
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
  updated() {
    this.scrollToEnd();
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
input#guess {
  margin-top: 0.75rem;
}
#chatbox {
  padding: 1em;
  display: flex;
  flex: 1;
  flex-direction: column;
  //flex-wrap: wrap;
}
#messages {
  overflow: auto;
  flex: 1;
}
.evt {
  font-weight: bold;
  color: orange;
}
</style>
