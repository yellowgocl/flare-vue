<template>
    <div class="container">
        <canvas ref='mflareActorCanvas'></canvas>
    </div>
</template>
<script>
import FlareWrapper from './libs/flareWrapper'
import { ScaleType } from './libs/transformUtil'

export default {
    data() {
        return {
            flareWrapper: null
        }
    },
    props: {
        src: {
            type: String,
            required: true
        },
        animation: {
            type: [Number,String],
            default: () => 0
        },
        scaleType: {
            type: Symbol,
            validator: (val) => ScaleType.values().includes(val)
        }
    },
    destroyed() {
        this.flareWrapper.dispose();
        this.flareWrapper = null;
    },
    async mounted() {
        this.flareWrapper = await FlareWrapper.build(this.flareCanvas)
        this.load(this.src)
    },
    watch: {
        src(nv) {
            this.load(nv)
        },
        animation(nv) {
            this.play(nv)
        }
    },
    methods: {
        load(src) {
            return this.flareWrapper.load(src).then(() => {
                this.$emit('onLoad', src, this.flareWrapper);
                return this.flareWrapper
            })
        },
        play(animation) {
            this.flareWrapper.play(animation);
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

</style>