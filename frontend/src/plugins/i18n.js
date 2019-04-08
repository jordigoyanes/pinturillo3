import Vue from "vue";
import VueI18n from "vue-i18n";

Vue.use(VueI18n);

const messages = {
  English: {
    nickname: "Nickname:",
    play: "Play!",
    leave_room: "Leave Room",
    enter_guess: "enter_guess",
    play_public: "Public Room",
    play_private: "Private Room",
    chat_evt: {
      guessed_word: " has guessed the word!",
      going_to_draw: " is going to draw!",
      reported: "The painter has been reported.",
      player_left: " has left.",
      player_joined: " has joined."
    }
  },
  Español: {
    nickname: "Nombre:",
    play: "Jugar!",
    leave_room: "Salir de la sala",
    enter_guess: "Introduce palabra...",
    play_public: "Sala pública",
    play_private: "Sala privada",
    chat_evt: {
      guessed_word: " ha acertado la palabra!",
      going_to_draw: " va a dibujar.",
      reported: "El dibujante ha sido reportado.",
      player_left: " ha salido.",
      player_joined: " ha entrado."
    }
  }
};

const i18n = new VueI18n({
  locale: "Español", // set locale
  fallbackLocale: "English", // set fallback locale
  messages // set locale messages
});

export default i18n;