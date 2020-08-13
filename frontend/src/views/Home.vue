<template>
  <section class="hero is-dark is-fullheight">
    <div class="hero-body">
      <div class="container is-mobile">
        <div class="columns is-centered">
          <div class="column is-half">
            <h1 class="title is-size-1 has-text-centered">Pinturillo 3</h1>
            <h1 class="subtitle is-size-3 has-text-centered">{{ $t("desc") }}</h1>
            <div v-show="showErr" class="notification is-danger">
              <button @click="showErr = false" class="delete"></button>
              {{ $t("not_empty") }}
            </div>
            <div class="box">
              <div class="field">
                <label class="label">{{ $t("nickname") }}</label>
                <div class="control">
                  <input
                    @keyup.enter="verify_user()"
                    v-model="localPlayer"
                    class="input"
                    type="text"
                    placeholder="player"
                    maxlength="15"
                  />
                </div>
              </div>
              
              <div class="field">
                <div class="control">
                  <label class="radio">
                    <input type="radio" name="language" value="Español" v-model="i18n.locale" checked>
                    Español
                    </label>
                  <label class="radio">
                    <input type="radio" name="language" value="English" v-model="i18n.locale">
                    English
                  </label>
                </div>
                
              </div>
              <button
                @click="verify_user()"
                class="button is-large is-fullwidth is-success is-outlined"
              >
                <p>{{ $t("play") }}</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </section>
</template>

<script>
import i18n from "@/plugins/i18n";
import { mapMutations } from "vuex";
import Footer from "@/components/Footer";
export default {
  name: "home",
  components: {
    Footer
  },
  data: function() {
    return {
      localPlayer: "player",
      showErr: false,
      lang: "Español",
      i18n: i18n
    };
  },
  methods: {
    verify_user() {
      if (this.localPlayer === "") {
        this.showErr = true;
      } else {
        this.set_localplayer(this.localPlayer);
        this.$router.push({ path: "select-room" });
      }
    },
    ...mapMutations({
      set_localplayer: "set_localplayer"
    })
  },
  mounted(){
    //this.i18n.locale = 'es';
 
  }
};
</script>