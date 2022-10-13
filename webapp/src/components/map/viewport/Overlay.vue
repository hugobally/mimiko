<template>
  <div class="overlay-group" :class="{ hidden: !hoveredKnot }"
       @mouseover="onMouseOver()" @mouseleave="onMouseLeave()">
    <div :style="{ ...bottomAnchor}">
    <span class="track-title" :style="{ ...{}, ...reactiveFontSize}">
      {{ (hoveredKnot && hoveredKnot.track.artist) + ' - ' + (hoveredKnot && hoveredKnot.track.title) }}
    </span>
    </div>
        <div :style="{ ...leftAnchor}">
          <button class="play-this-button" :style="{ ...reactiveFontSize }">Play</button>

        </div>
    <!--    <div class="mouseover-backdrop"/>-->
  </div>
</template>

<script>
import {mapState} from 'vuex'

export default {
  data() {
    return {
      middleAnchor: null,
      bottomAnchor: null,
      leftAnchor: null,
      topAnchor: null,
      rightAnchor: null,
    }
  },
  props: ['viewport'],
  computed: {
    ...mapState('map', ['knots', 'hovered']),
    ...mapState('ui', ['zoomLevel']),
    hoveredKnot() {
      if (!this.hovered) return null

      return this.knots[this.hovered]
    },
    reactiveFontSize() {
      let fontSize = this.$store.state.ui.zoomLevel * 20
      fontSize = Math.min(Math.max(fontSize, 20), 40)
      return {
        fontSize: `${fontSize}px`,
      }
    },
  },
  watch: {
    hoveredKnot: function () {
      if (!this.hoveredKnot) return
      this.setAnchorPositions()
    },
    zoomLevel: function () {
      if (!this.hoveredKnot) return
      this.setAnchorPositions()
    }
  },
  methods: {
    onMouseOver(e) {
      this.$store.dispatch('map/knotHoverEvent', this.hovered)
    },
    onMouseLeave() {
      this.$store.dispatch('map/knotHoverEvent', null)
    },
    setAnchorPositions() {
      const zoomGroup = document.getElementById('zoomgroup')
      const matrix = zoomGroup.getCTM()

      const positionStyle = (x, y) => {
        const p = new DOMPoint(x, y).matrixTransform(matrix)
        return {
          position: 'fixed',
          left: `${p.x}px`,
          top: `${p.y}px`,
        }
      }

      // const verticalOffset = (1 / this.zoomLevel) * 200
      // const horizontalOffset = (1 / this.zoomLevel) * 400
      const verticalOffset = 20
      const horizontalOffset = 120

      this.bottomAnchor = positionStyle(this.hoveredKnot.x, this.hoveredKnot.y + verticalOffset)
      // this.topAnchor = positionStyle(this.hoveredKnot.x, this.hoveredKnot.y - 22)
      this.leftAnchor = positionStyle(this.hoveredKnot.x - horizontalOffset, this.hoveredKnot.y)
      // this.rightAnchor = positionStyle(this.hoveredKnot.x + 50, this.hoveredKnot.y)
    }
  }
}
</script>

<style lang="scss" scoped>
.overlay-group {
  position: fixed;
}

.play-this-button {
  position: absolute;
  //left: -150px;
  //top: -50px;
  padding: 10px;
}

.track-title {
  background-color: $black-lighter;
  color: $text-highlight;
  padding: 5px;
  border-radius: 5px;
}

.overlay-group > * ::before {
  content: '';
  position: absolute;
  width: 110%;
  height: 110%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

</style>
