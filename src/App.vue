<template>
  <div id="app">
    <canvas ref='mflareActorCanvas' ></canvas>
    <button @click='onclick'>sdfs</button>
  </div>
</template>

<script>
import FlareWrapper from './components/libs/flareWrapper';
export default {
  name: 'app',
  data() {
        return {
            flareWrapper: null
        }
    },
    mounted() {
        this.flareWrapper = new FlareWrapper(this.flareCanvas, {
          onReady: (fw) => {
            fw.setSize(320, 600);
            fw.load('http://localhost:8080/star.flr');
          } 
        });
    },
    methods: {
      onclick() {
        this.flareWrapper.restart();
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
