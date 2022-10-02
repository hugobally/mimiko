<template>
  <g
      class="select-indicator-container"
      :transform="transformStr"
  >
    <circle
        class="animated-circle"
        :class="{ 'animated-paused': paused }"
        fill="none"
        stroke="#121212"
        stroke-width="2"
        :r="radius / 1.95"
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
    ...mapState('player', ['status', 'playedKnotId']),
    ...mapState('ui', ['selectedKnotId']),
    playing() {
      return this.status === 'PLAYING'
    },
    paused() {
      return this.status === 'PAUSED'
    },
    knot() {
      if (!this.playedKnotId) return null

      return this.knots[this.playedKnotId]
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
.select-indicator-container {
  pointer-events: none;
}

@keyframes circle-scale-animation-paused {
  0% {
    transform: scale(2)
  }

  83% {
    transform: scale(2);
  }

  85% {
    transform: scale(2.1);
  }

  87% {
    transform: scale(2);
  }

  89% {
    transform: scale(1.9);
  }

  91% {
    transform: scale(2);
  }

  100% {
    transform: scale(2);
  }
}

.animated-circle {
  opacity: 0;
  transition: opacity 1000ms;
}

.animated-paused {
  opacity: 1;
  animation-name: circle-scale-animation-paused;
  animation-iteration-count: infinite;
  animation-timing-function: ease-out;
  animation-duration: 5s;
}

</style>
