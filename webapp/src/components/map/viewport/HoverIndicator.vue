<template>
  <g class="hover-container" :transform="transformStr">
    <circle
      stroke="#121212"
      stroke-width="4"
      fill-opacity="0"
      :r="radius / 1.5"
    />
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
    ...mapState('map', ['knots', 'hovered', 'focused']),
    knotToAttachTo() {
      if (this.hovered) return this.knots[this.hovered]
      return null
    },
    transformStr() {
      const { x, y } = this.knotToAttachTo
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
