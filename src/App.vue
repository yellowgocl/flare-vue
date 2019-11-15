<template>
  <div id="app">
    <canvas ref='mflareActorCanvas' ></canvas>
    <button v-for='(v, k) in animations' :key='`v-${k}`' @click='onclick(v)'>{{v}}</button>
    <div class="container">
    <div class="box box1" ref='viewport'></div>
    <div class="box box2" ref='content'></div>
    </div>
  </div>
</template>

<script>
import FlareWrapper from './components/libs/flareWrapper';
import { BoundsUtil, ScaleType } from './components/libs/transformUtil'
export default {
  name: 'app',
  data() {
        return {
            flareWrapper: null,
            animations: []
        }
    },
    mounted() {
        this.flareWrapper = new FlareWrapper(this.flareCanvas, {
          onReady: (fw) => {
            fw.load('/star.flr').then((fw) => {
                this.animations = fw.animations;
                console.info(this.animations)
            });
          } 
        });
        
        let content = this.$refs.content;
        let viewport = this.$refs.viewport
        let bound = BoundsUtil.getBounds(ScaleType.CENTER_CROP, 
            content.clientWidth, 
            content.clientHeight, 
            viewport.clientWidth, 
            viewport.clientHeight)
        content.style.top = `${bound.y}px`
        content.style.left = `${bound.x}px`
        content.style.width = `${bound.w}px`
        content.style.height = `${bound.h}px`

    },
    methods: {
      onclick(v) {
        this.flareWrapper.play(v);
      }
    },
    computed: {
        flareCanvas() {
            return this.$refs['mflareActorCanvas'];
        }
    }
}
</script>

<style scoped>
.container {
    position:relative;
}
.box {
    position: absolute;
}
.box1 {
    background: #ff0;
    width: 100px;
    height: 100px;
}
.box2 {
    background: #f00;
    width: 120px;
    height: 232px;
    opacity: 0.3;
}
</style>
