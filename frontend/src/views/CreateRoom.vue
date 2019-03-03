<template>
  <section class="hero is-dark is-fullheight">
    <div class="hero-body">
      <div class="container is-mobile">
        <div class="columns is-centered">
          <div class="column is-half">
            <h1 class="title is-size-1 has-text-centered">Pinturillo3</h1>
            <div v-show="showErr" class="notification is-danger">
              <button @click="showErr = false" class="delete"></button>
              Password cannot be empty
            </div>
            <div class="box">
              <div class="field">
                <label class="label">Room Name:</label>
                <div class="control">
                  <input
                    v-model="room_name"
                    class="input"
                    type="text"
                    placeholder="room name"
                  />
                </div>
              </div>
              <div class="field">
                <label class="label">Room Password:</label>
                <div class="control">
                  <input
                    v-model="room_password"
                    class="input"
                    type="text"
                    placeholder="password"
                  />
                </div>
              </div>
              <button
                @click="setLocalPlayer()"
                class="button is-fullwidth is-success is-outlined"
              >
                <p>OK</p>
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
  created(){
    console.log("hi")
  }
};
</script>
