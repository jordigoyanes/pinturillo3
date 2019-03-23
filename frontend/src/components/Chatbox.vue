<template>
  <div>
    <div class="field">
      <div class="chatbox">
        <ul>
          <li v-for="(chatmsg, index) in chat_messages" :key="index">
            <p>
              <strong>{{ chatmsg.username }}</strong
              >: {{ chatmsg.message }}
            </p>
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
          placeholder="Enter guess..."
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
          room_id: this.room_id,
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
.chatbox {
  min-height: 200px;
  max-height: 200px;
  overflow: auto;
}
</style>
