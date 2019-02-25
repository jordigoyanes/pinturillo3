<template>
  <div>
    <section class="section has-background-warning">

        <div class="level">
          <div class="level-left">
            <button class="button is-danger">Leave Room</button>
          </div>
          <h1 class="title is-size-3 level-item has-text-centered">
            Pinturillo 3
          </h1>
        </div>

    </section>
      <div class="hero is-mobile is-dark is-fullheight">
        <div id="game-columns">
          <div class="columns">
            <div class="column is-one-fifth">
              <div class="box">
                usuarios y puntuacion
                <Scores />
              </div>
            </div>
            <div class="column is-half">
              <div id="canvas-wrapper">
                <DrawingArea />
              </div>
              
            </div>
            <div class="column">
              <div class="box">
                <p class="is-primary">chat</p>
                <Chatbox />
              </div>
            </div>
          </div>
        </div>
      </div>

  </div>
</template>
<script>
import DrawingArea from "@/components/DrawingArea";
import Chatbox from "@/components/Chatbox.vue";
import Scores from "@/components/Scores";
import Footer from "@/components/Footer";

export default {
  name: "game",
  components: {
    DrawingArea,
    Chatbox,
    Scores,
    Footer
  }
};
</script>

<style lang="scss">
#canvas-wrapper{
    flex: 1;
    display: flex;
    background-color: white;
    border-radius: 6px;
    -webkit-box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
    color: #ff3860;
    padding: 0;
    min-height: 800px;

}
#game-columns {
  padding: 0.8rem 1.5rem;
  flex:1;
}

</style>
