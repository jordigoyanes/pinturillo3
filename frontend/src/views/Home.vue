<template>
  <section class="hero is-dark is-fullheight">
    <div class="hero-body">
      <div class="container is-mobile">
        <div class="columns is-centered">
          <div class="column is-half">
            <h1 class="title is-size-1 has-text-centered">Pinturillo3</h1>
            <div v-show="showErr" class="notification is-danger">
            <button @click="showErr=false" class="delete"></button>
            Username cannot be empty!
            </div>
            <div class="box">
              <div class="field">
                <label class="label">Nick:</label>
                <div class="control">
                  <input v-model="localPlayer" class="input" type="text" placeholder="player" />
                </div>
              </div>
              <div class="field">
                <div class="select is-info">
                  <select>
                    <option>Español</option>
                  </select>
                </div>
              </div>
              <button @click="setLocalPlayer()" class="button is-fullwidth is-success is-outlined">
                <p>Play!</p>
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
import {mapActions, mapMutations} from 'vuex';
import Footer from "@/components/Footer";
export default {
  name: "home",
  components: {
    Footer
  },
  data: function(){
    return{
      localPlayer: '',
      showErr: false,
    }
  },
  methods:{
    setLocalPlayer(){
      if(this.localPlayer === ''){
        this.showErr = true;
      }else{
        this.$store.commit('set_localplayer', {localPlayer: this.localPlayer})
      }
    },
    ...mapMutations({
      set_localplayer: 'set_localplayer'
    })
  },
  computed:{
  }
};
</script>
