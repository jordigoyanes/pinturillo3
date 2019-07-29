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
        //color: "black",
        //lineWidth: 2,
        x: 0,
        y: 0
      }
    };
  },
  computed: {
    ...mapState({
      socket: "socket",
      brush_color: "brush_color",
      brush_width: "brush_width"
    })
  },
  methods: {
    onMouseDown(e) {
      this.drawing = true;
      this.current.x = e.offsetX;
      this.current.y = e.offsetY;
    },
    onMouseUp(e) {
      // new coords
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
        this.brush_color,
        this.brush_width,
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
        this.brush_color,
        this.brush_width,
        true
      );
      this.current.x = mousemoveX;
      this.current.y = mousemoveY;
    },
    drawLine(x0, y0, x1, y1, color, brush_width, emit) {
      this.context.beginPath();
      this.context.moveTo(x0, y0);
      this.context.lineTo(x1, y1);

      this.context.strokeStyle = color;
      this.context.lineWidth = brush_width;
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
        color: color,
        brush_width: brush_width
      });
    },
    onDrawingEvent(data) {
      this.drawLine(
        data.x0,
        data.y0,
        data.x1,
        data.y1,
        data.color,
        data.brush_width
      );
    },
    onResize() {
      if (this.canvas.parentElement.clientWidth) {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
      }
    }
  },
  mounted() {
    this.canvas = this.$refs.canvas;
    this.context = this.$refs.canvas.getContext("2d");
    this.context.fillStyle = "#333";
    this.context.strokeStyle = this.brush_color;
    this.context.lineWidth = this.brush_width;
    this.context.lineCap = "round";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.onResize();
    window.addEventListener("resize", this.onResize, false);
    this.socket.on("drawing", this.onDrawingEvent);
    this.socket.on("clear_canvas", () => {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    });
  }
};
</script>

<style lang="scss">
#canvas {
  flex:1;
  background-color: white;
  box-shadow:  inset 0px 1px 6px rgba(0, 0, 0, 0.16), inset 0px 1px 6px rgba(0, 0, 0, 0.23);
}
</style>
