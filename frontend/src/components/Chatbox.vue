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
            <strong>{{ chatmsg.username }}</strong>
            : {{ chatmsg.message }}
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
import { mapState, mapMutations } from "vuex";

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
    remove_points_gained(players) {
      let p = players;
      for (let i = 0; i < p.length; i++) {
        p[i].points_gained = 0;
      }
      return p;
    },
    scrollToEnd: function() {
      var messages = document.getElementById("messages");
      messages.scrollTop = messages.scrollHeight;
    },
    ...mapMutations({
      set_painter: "set_painter",
      set_show_drawing: "set_show_drawing",
      set_show_toolbox: "set_show_toolbox",
      set_show_options: "set_show_options",
      set_show_scoreboard: "set_show_scoreboard",
      set_word: "set_word",
      set_playerlist: "set_playerlist",
      remove_points_gained: "remove_points_gained"
    })
  },
  mounted() {
    this.scrollToEnd();
    this.socket.on("new_message", data => {
      this.chat_messages = [...this.chat_messages, data];
    });
    this.socket.on("chat_evt", data => {
      console.log("este es evt_type: " + data.evt_type);
      let message;
      switch (data.evt_type) {
        case "player_joined":
          message = data.username + this.i18n.t("chat_evt.player_joined");
          break;
        case "player_left":
          message = data.username + this.i18n.t("chat_evt.player_left");
          break;
        case "guessed_word":
          message = data.username + this.i18n.t("chat_evt.guessed_word");
          break;
        case "reported":
          message = this.i18n.t("chat_evt.reported");
          break;
        case "player_won":
          message = data.username + this.i18n.t("chat_evt.player_won");
          break;
        case "going_to_draw":
          message = data.username + this.i18n.t("chat_evt.going_to_draw");
          this.set_show_drawing(false);
          this.set_show_toolbox(false);
          this.set_show_options(false);
          this.set_show_scoreboard(false);
          this.remove_points_gained();
          //this.set_playerlist(this.remove_points_gained(this.players));
          this.set_word("?");
          this.set_painter(data.username);
          break;
      }
      this.chat_messages = [
        ...this.chat_messages,
        { message: message, username: data.username, type: "evt" }
      ];
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
      i18n: "i18n",
      players: "players"
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
