<template>
  <div id="toolbox" class="has-background-warning">
    <div id="clean-canvas" @click="socket.emit('clear_canvas')">
      <img src="../assets/clean-canvas.svg" alt="" />
    </div>
    <div id="palette">
      <div class="color white" @click="set_brush_color('white')" />
      <div class="color black" @click="set_brush_color('black')" />
      <div class="color red" @click="set_brush_color('#ff0000')" />
      <div class="color dark-red" @click="set_brush_color('#bf0000')" />
      <div class="color orange" @click="set_brush_color('#ff9900')" />
      <div class="color dark-orange" @click="set_brush_color('#996633')" />
      <div class="color yellow" @click="set_brush_color('#ffff00')" />
      <div class="color dark-yellow" @click="set_brush_color('#aaaa00')" />
      <div class="color green" @click="set_brush_color('#339933')" />
      <div class="color dark-green" @click="set_brush_color('#277827')" />
      <div class="color blue" @click="set_brush_color('#0099ff')" />
      <div class="color dark-blue" @click="set_brush_color('#0064a6')" />
      <div class="color blue-3" @click="set_brush_color('#0040c6')" />
      <div class="color blue-4" @click="set_brush_color('#002f5e')" />
      <div class="color salmon" @click="set_brush_color('#f88271')" />
      <div class="color pink" @click="set_brush_color('#ff69b3')" />
      <div class="color purple" @click="set_brush_color('#993399')" />
      <div class="gray" @click="set_brush_color('gray')" />
    </div>
    <div class="size" @click="set_brush_width(4)">
      <div id="size1"></div>
    </div>
    <div class="size" @click="set_brush_width(8)">
      <div id="size2"></div>
    </div>
    <div class="size" @click="set_brush_width(16)">
      <div id="size3"></div>
    </div>
    <div id="cancel-turn">
      <a class="delete is-large"></a>
    </div>
  </div>
</template>
<script>
import { mapState, mapMutations } from "vuex";
export default {
  name: "toolbox",
  methods: {
    ...mapMutations({
      set_brush_color: "set_brush_color",
      set_brush_width: "set_brush_width"
    })
  },
  computed: {
    ...mapState({
      socket: "socket"
    })
  }
};
</script>

<style lang="scss">
#cancel-turn {
  margin-left: 1em;
}
#size1,
#size2,
#size3 {
  background-color: black;
  border-radius: 100%;
  margin: 0 auto;
}
#size1 {
  width: 8px;
  height: 8px;
}
#size2 {
  width: 16px;
  height: 16px;
}
#size3 {
  width: 24px;
  height: 24px;
}

.size {
  display: flex;
  margin-left: 0.5em;
  background-color: white;
  border-radius: 5px;
  padding: 5px;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  width: auto;
}
.salmon {
  background-color: #f88271;
}
.blue-3 {
  background-color: #0040c6;
}
.blue-4 {
  background-color: #002f5e;
}
.dark-blue {
  background-color: #0064a6;
}
.dark-green {
  background-color: #277827;
}
.dark-yellow {
  background-color: #aaaa00;
}
.gray {
  background-color: gray;
}
.purple {
  background-color: #993399;
}
.pink {
  background-color: #ff69b3;
}
.red {
  background-color: #ff0000;
}
.blue {
  background-color: #0099ff;
}
.dark-red {
  background-color: #bf0000;
}
.orange {
  background-color: #ff9900;
}
.dark-orange {
  background-color: #996633;
}
.yellow {
  background-color: #ffff00;
}
.white {
  background-color: white;
}
.black {
  background-color: black;
}
.green {
  background-color: #339933;
}

#toolbox {
  display: flex;
  width: 40rem;
  border-radius: 0px 0px 10px 0px;
  padding: 5px;
  position: absolute;
  border-bottom: 2px solid black;
  border-right: 2px solid black;
}
#clean-canvas {
  background-color: white;
  padding: 5px;
  border-radius: 5px;
  display: flex;
}

#palette {
  margin-left: 0.5em;
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-gap: 0px;
}
.color {
  display: flex;
  width: 25px;
  //border: solid 1px black;
}
.color:hover,
#clean-canvas:hover,
.size:hover {
  cursor: pointer;
}
.size:hover,
#clean-canvas:hover {
  background-color: #dbdbdb;
}
</style>
