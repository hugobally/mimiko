<template>
  <g class="indicator-container" :transform="transformStr">
    <circle
      fill="none"
      :stroke="paused ? '#5f8dd3' : '#eeeeee'"
      stroke-width="6"
    >
      <animate
        ref="animSize"
        id="playanim"
        attributeName="r"
        :from="radius / 2.5"
        :to="radius * 2"
        :dur="!paused ? '3s' : '9s'"
        begin="indefinite;playanim.end+0.5s"
      />
      <animate
        ref="animOpacity"
        attributeName="opacity"
        from="1"
        to="0"
        :dur="!paused ? '3s' : '9s'"
        begin="indefinite;playanim.end+0.5s"
      />
    </circle>
  </g>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      radius: 40,
    }
  },
  computed: {
    ...mapState('map', ['knots', 'hovered']),
    ...mapState('player', ['status']),
    playing() {
      return this.$store.state.player.knot
    },
    paused() {
      return this.status !== 'PLAYING'
    },
    knot() {
      if (!this.playing) return null

      return this.knots[this.playing]
    },
    transformStr() {
      const { x, y } = this.knot
      return `translate(${x} ${y})`
    },
  },
  mounted() {
    this.$refs.animSize.beginElement()
    this.$refs.animOpacity.beginElement()
  },
}
</script>

<style lang="scss" scoped>
.indicator-container {
  pointer-events: none;
}
</style>
