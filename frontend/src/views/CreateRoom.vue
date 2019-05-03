<template>
  <section class="hero is-dark is-fullheight">
    <div class="hero-body">
      <div class="container is-mobile">
        <div v-if="!isLoading" class="columns is-centered">
          <div class="column is-half">
            <h1 class="title is-size-2 has-text-centered">
              {{ $t("create_room") }}
            </h1>
            <div v-show="showErr" class="notification is-danger">
              <button @click="showErr = false" class="delete"></button>
              Invalid room name or password
            </div>
            <div class="box">
              <div class="field">
                <label class="label">Room Name:</label>
                <div class="control">
                  <input
                    v-model="create_room_name"
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
                    v-model="create_room_password"
                    class="input"
                    type="text"
                    placeholder="password"
                  />
                </div>
              </div>
              <button
                :disabled="disabled"
                @click="setLocalPlayer()"
                class="button is-fullwidth is-success is-outlined"
              >
                <p>{{ $t("create_room") }}</p>
              </button>
            </div>
          </div>
          <div class="column is-half">
            <h1 class="title is-size-2 has-text-centered">
              {{ $t("join_room") }}
            </h1>
            <div v-show="showErr" class="notification is-danger">
              <button @click="showErr = false" class="delete"></button>
              Invalid room name or password
            </div>
            <div class="box">
              <div class="field">
                <label class="label">Room Name:</label>
                <div class="control">
                  <input
                    v-model="join_room_name"
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
                    v-model="join_room_password"
                    class="input"
                    type="text"
                    placeholder="password"
                  />
                </div>
              </div>
              <button
                :disabled="disabled"
                @click="setLocalPlayer()"
                class="button is-fullwidth is-success is-outlined"
              >
                <p>{{ $t("join_room") }}</p>
              </button>
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
import i18n from "@/plugins/i18n";
import Footer from "@/components/Footer";
export default {
  components: {
    Footer
  },
  data: function() {
    return {
      showErr: false,
      create_room_name: "",
      create_room_password: "",
      join_room_name: "",
      join_room_password: "",
      isLoading: false,
      i18n: i18n,
      disabled: false
    };
  },
  created() {
    console.log("hi");
  }
};
</script>
