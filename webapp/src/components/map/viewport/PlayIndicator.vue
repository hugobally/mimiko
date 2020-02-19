<template>
  <g
    class="indicator-container"
    :transform="transformStr"
    :opacity="playing ? 1 : 0"
  >
    <circle
      class="animated-circle"
      :class="{ 'animated-paused': paused }"
      fill="none"
      :stroke="paused ? '#5f8dd3' : '#eeeeee'"
      stroke-width="2"
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
  animation-duration: 4s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-name: circle-animation;
}

.animated-paused {
  animation-duration: 9s;
}
</style>
