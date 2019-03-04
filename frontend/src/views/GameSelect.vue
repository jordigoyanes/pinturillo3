<template>
  <section class="hero is-dark is-fullheight">
    <div class="hero-body">
      <div class="container is-mobile">
        <h1 class="title is-size-1 has-text-centered">Pinturillo3</h1>
        <div class="columns">
          <div class="column">
            <div class="box has-background-success game-select" @click="goPublic()">
              <h1 class=" is-size-1 has-text-centered">Play public</h1>
            </div>
          </div>
          <div class="column">
            <div class="box has-background-warning game-select" @click="goPrivate()">
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
import Footer from "@/components/Footer";
export default {
  components: {
    Footer
  },
  data: function(){
    return {
      showErr: false,
      room_name: '',
      room_password:  ''
    }
  },
  methods:{
    goPublic(){
      this.$router.push({name: "game"})
    },
    goPrivate(){
      this.$router.push({name: "private"})
    }
  },
  created(){
    console.log("hi")
  }
};
</script>

<style lang="scss">
.game-select:hover{
  cursor:pointer;
}
.game-select h1{
  font-weight: bold;
}
</style>

