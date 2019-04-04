<template>
  <canvas
    id="canvas"
    ref="canvas"
    @mousedown="onMouseDown($event)"
    @mouseup="onMouseUp($event)"
    @mousemove="onMouseMove($event)"
  ></canvas>
</template>
<script>
import { mapState } from "vuex";
export default {
  name: "drawingArea",
  data: function() {
    return {
      canvas: null,
      context: null,
      rect: null,
      drawing: false,
      current: {
        color: "black",
        lineWidth: 2,
        x: 0,
        y: 0
      }
    };
  },
  computed: {
    ...mapState({
      socket: "socket"
    })
  },
  methods: {
    switch_color(color) {
      switch (color) {
        case "red":
          console.log("hi");
          break;
      }
    },
    onMouseDown(e) {
      /*
        this.xCoord = e.pageX - this.canvas.offsetLeft;
        this.yCoord = e.pageY - this.canvas.offsetTop;
      */
      console.log("x:" + e.offsetX);
      console.log("y:" + e.offsetY);
      this.drawing = true;
      this.current.x = e.offsetX;
      this.current.y = e.offsetY;
    },
    onMouseUp(e) {
      //new coords
      let mouseupX = e.offsetX;
      let mouseupY = e.offsetY;
      if (!this.drawing) {
        return;
      }
      this.drawLine(
        this.current.x,
        this.current.y,
        mouseupX,
        mouseupY,
        this.current.color,
        true
      );
      this.drawing = false;
    },
    onMouseMove(e) {
      if (!this.drawing) {
        return;
      }
      let mousemoveX = e.offsetX;
      let mousemoveY = e.offsetY;
      this.drawLine(
        this.current.x,
        this.current.y,
        mousemoveX,
        mousemoveY,
        this.current.color,
        true
      );
      this.current.x = mousemoveX;
      this.current.y = mousemoveY;
    },
    drawLine(x0, y0, x1, y1, color, emit) {
      console.log("x0:" + x0 + ",y0:" + y0 + ",x1:" + x1 + ",y1:" + y1);
      this.context.beginPath();
      this.context.moveTo(x0, y0);
      this.context.lineTo(x1, y1);

      this.context.strokeStyle = color;
      this.context.lineWidth = 2;
      this.context.stroke();
      this.context.closePath();

      if (!emit) {
        return;
      }

      this.socket.emit("drawing", {
        x0: x0,
        y0: y0,
        x1: x1,
        y1: y1,
        color: color
      });
    },
    onDrawingEvent(data) {
      this.drawLine(data.x0, data.y0, data.x1, data.y1, data.color);
    },
    onResize() {
      this.canvas.width = this.canvas.parentElement.clientWidth;
      this.canvas.height = this.canvas.parentElement.clientHeight;
    }
  },
  mounted() {
    this.canvas = this.$refs.canvas;
    this.context = this.$refs.canvas.getContext("2d");
    this.context.fillStyle = "#333";
    this.context.strokeStyle = this.color;
    this.context.lineWidth = this.lineWidth;
    this.context.lineCap = "round";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    window.addEventListener("resize", this.onResize, false);
    this.onResize();
    this.socket.on("drawing", this.onDrawingEvent);
  }
};
</script>

<style lang="scss">
#canvas {
  border-radius: 6px;
}
</style>
