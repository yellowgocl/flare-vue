<template>
    <div class="container">
        <canvas ref='mflareActorCanvas'></canvas>
    </div>
</template>
<script>
import FlareWrapper from './libs/flareWrapper'

export default {
    data() {
        return {
            flareWrapper: null
        }
    },
    mounted() {
        this.flareWrapper = new FlareWrapper(this.flareCanvas);
        this.flareWrapper.load('~/assets/star.flr');
    },
    computed: {
        flareCanvas() {
            return this.$refs['mflareActorCanvas'];
        }
    }
}
</script>
<style scoped>

</style>