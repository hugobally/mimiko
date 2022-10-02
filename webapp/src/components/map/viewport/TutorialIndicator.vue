<template>
  <g
      :transform="transformStr"
  >
  </g>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      tutorialSteps: null,
    }
  },
  mounted() {
    this.tutorialSteps = localStorage.getItem('tutorial_steps')
  },
  computed: {
    ...mapState('map', ['knots']),
    targetKnot() {
      if (!this.tutorialSteps || !this.tutorialSteps.includes('play_knot') || this.knots.length === 0) return null

      return this.knots.length > 0 && this.knots[0]
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


</style>
