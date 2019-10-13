<template>
  <div id="scoreboard"></div>
</template>

<script>
export default {
  name: "Scoreboard",
  props: "",
  methods: {},
  mounted() {
    this.socket.on("show_scoreboard", () => {
      this.set_show_drawing(true);
      if (this.localPlayer == this.painter) {
        this.set_show_toolbox(true);
      }
    });
  }
};
</script>