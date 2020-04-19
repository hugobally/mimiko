<template>
  <g
    class="indicator-container"
    :transform="transformStr"
    :opacity="playing ? 0.3 : 0"
  >
    <circle
      class="animated-circle"
      :class="{ 'animated-paused': paused }"
      fill="none"
      :stroke="paused ? '#5f8dd3' : '#121212'"
      stroke-width="1"
      :r="radius / 2.5"
    >
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
    ...mapState('player', ['status', 'previewMode']),
    playing() {
      return this.$store.state.player.knot
    },
    paused() {
      return this.status !== 'PLAYING' && !this.previewMode
    },
    knot() {
      if (!this.playing) return null

      return this.knots[this.playing]
    },
    transformStr() {
      if (!this.knot) return
      const { x, y } = this.knot
      return `translate(${x} ${y})`
    },
  },
}
</script>

<style lang="scss" scoped>
.indicator-container {
  pointer-events: none;
}

@keyframes circle-animation {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  60% {
    transform: scale(5);
    opacity: 0;
  }

  100% {
    transform: scale(5);
    opacity: 0;
  }
}

.animated-circle {
  animation-duration: 3s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-name: circle-animation;
}

.animated-paused {
  animation-duration: 6s;
}
</style>
