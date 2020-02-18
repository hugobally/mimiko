<template>
  <g class="hover-container" :transform="transformStr">
    <circle fill="#eeeeee" :r="radius / 1.5" />
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
    knot() {
      if (!this.hovered) return null

      return this.knots[this.hovered]
    },
    transformStr() {
      const { x, y } = this.knot
      return `translate(${x} ${y})`
    },
  },
}
</script>

<style lang="scss" scoped>
.hover-container {
  pointer-events: none;
}
</style>
