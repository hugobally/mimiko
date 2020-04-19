<template>
  <div class="overlay-group" :style="{ ...reactivePosition, ...reactiveSize }">
    {{ (knot && knot.track.artist) + ' - ' + (knot && knot.track.title) }}
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      position: null,
    }
  },
  props: ['viewport'],
  computed: {
    ...mapState('map', ['knots', 'hovered']),
    knot() {
      if (!this.hovered) return null

      return this.knots[this.hovered]
    },
    reactivePosition() {
      return {
        left: `${this.position && this.position.x}px`,
        top: `${this.position && this.position.y}px`,
        display: this.hovered ? 'block' : 'none',
      }
    },
    reactiveSize() {
      let fontSize = this.$store.state.ui.zoomLevel * 20
      fontSize = Math.min(Math.max(fontSize, 20), 40)
      return {
        fontSize: `${fontSize}px`,
      }
    },
  },
  watch: {
    knot: function() {
      if (!this.knot) return

      const zoomGroup = document.getElementById('zoomgroup')
      const point = this.viewport.createSVGPoint()
      const matrix = zoomGroup.getCTM()
      point.x = this.knot.x
      point.y = this.knot.y + 25
      this.position = point.matrixTransform(matrix)
    },
  },
}
</script>

<style lang="scss" scoped>
.overlay-group {
  position: fixed;
  background-color: $black;
  color: $text-highlight;
  padding: 5px;

  z-index: 50;
}
</style>
