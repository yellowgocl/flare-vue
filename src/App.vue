<template>
  <div id="app">
    <canvas ref='mflareActorCanvas' ></canvas>
    <button v-for='(v, k) in animations' :key='`v-${k}`' @click='onclick(v)'>{{v}}</button>
  </div>
</template>

<script>
import FlareWrapper from './components/libs/flareWrapper';
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
            fw.load('http://localhost:8080/star.flr').then((fw) => {
                this.animations = fw.animations;
                console.info(this.animations)
            });
          } 
        });
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

<style>
</style>
