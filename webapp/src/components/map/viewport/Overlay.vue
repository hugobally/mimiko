<template>
  <div
    class="overlay-group"
    @mouseover="onMouseOver()"
    @mouseleave="onMouseLeave()"
    :class="{ hidden: !hoveredKnot }"
  >
    <div :style="{ ...bottomEdge }" class="bottom-edge">
      <span class="track-title " :style="{ ...{}, ...reactiveFontSize }">
        {{ (knot && knot.track.artist) + ' - ' + (knot && knot.track.title) }}
      </span>
    </div>
    <div :style="{ ...leftEdge }">
      <div class="left-edge-container">
        <button class="play-this-button" @click="playOrPauseSelected">
          <img
            :style="{ ...reactiveSize }"
            v-if="status === 'PLAYING' && playedKnotId === hovered"
            src="@/assets/svg/pause-icon.svg"
            alt="play icon"
          />
          <img
            :style="{ ...reactiveSize }"
            v-else
            src="@/assets/svg/play-icon.svg"
            alt="pause icon"
          />
        </button>
        <div :style="{ ...reactiveSize }" class="left-edge-backdrop" />
      </div>
    </div>
    <div :style="{ ...rightEdge }">
      <div class="right-edge-container">
        <div :style="{ ...reactiveSize }" class="right-edge-backdrop" />
        <a class="more-info-link" :href="moreInfoLink" target="_blank">
          <img
            :style="{ ...reactiveSize }"
            src="@/assets/svg/more-info.svg"
            alt="more info icon"
          />
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      bottomEdge: null,
      leftEdge: null,
      rightEdge: null,
    }
  },
  props: ['viewport'],
  computed: {
    ...mapState('map', ['knots', 'hovered', 'selected']),
    ...mapState('ui', ['zoomLevel', 'transform', 'selectedKnotId']),
    ...mapState('player', ['status', 'playedKnotId']),
    hoveredKnot() {
      if (!this.hovered) return null

      return this.knots[this.hovered]
    },
    selectedKnot() {
      if (!this.selectedKnotId) return null

      return this.knots[this.selectedKnotId]
    },
    knot() {
      return this.hoveredKnot
    },
    reactiveFontSize() {
      let fontSize = this.$store.state.ui.zoomLevel * 20
      fontSize = Math.min(Math.max(fontSize, 20), 40)
      return {
        fontSize: `${fontSize}px`,
      }
    },
    reactiveSize() {
      const sideLength = Math.max(10 * this.$store.state.ui.zoomLevel, 25)
      return {
        width: `${sideLength}px`,
        height: `${sideLength}px`,
      }
    },
    moreInfoLink() {
      if (!this.hoveredKnot) return ''

      return `https://open.spotify.com/track/${this.hoveredKnot.track.id}`
    },
  },
  watch: {
    // TODO DRY
    hoveredKnot: function() {
      this.setAnchorPositions()
    },
    selectedKnot: function() {
      this.setAnchorPositions()
    },
    transform: function() {
      this.setAnchorPositions()
    },
    zoomLevel: function() {
      setTimeout(() => this.setAnchorPositions(), 50)
    },
  },
  methods: {
    onMouseOver() {
      this.$store.dispatch('map/knotHoverEvent', this.hovered)
    },
    onMouseLeave() {
      this.$store.dispatch('map/knotHoverEvent', null)
    },
    setAnchorPositions() {
      const knot = this.hoveredKnot
      if (!knot) return

      const zoomGroup = document.getElementById('zoomgroup')
      const matrix = zoomGroup.getCTM()

      const transform = (x, y) => {
        const p = new DOMPoint(x, y).matrixTransform(matrix)
        return {
          transform: `translate(${p.x}px, ${p.y}px)`,
          position: 'fixed',
        }
      }

      const verticalOffset = 41
      const horizontalOffset = 20

      this.bottomEdge = transform(knot.x, knot.y + verticalOffset)

      this.leftEdge = transform(knot.x - horizontalOffset, knot.y)
      this.rightEdge = transform(knot.x + horizontalOffset, knot.y)
    },
    playOrPauseSelected() {
      if (this.playedKnotId === this.hovered) {
        this.$store.dispatch(
          this.status === 'PLAYING'
            ? 'player/pausePlayback'
            : this.status === 'PAUSED'
            ? 'player/resumePlayback'
            : '',
        )
        return
      }

      this.$store.dispatch('player/playKnot', {
        knot: this.hovered,
        track: this.hoveredKnot.track,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.overlay-group {
  position: fixed;
}

.play-this-button,
.more-info-link {
  display: block;
  transform: translate(0, -50%);

  padding: 10px;
  margin-left: 0px;
}

.track-title {
  background-color: $black-lighter;
  color: $text-highlight;
  padding: 5px;
  border-radius: 5px;
}

.bottom-edge {
  transition: transform 100ms ease-out;
}

.bottom-edge::before {
  content: '';
  position: absolute;
  width: 130%;
  height: 110%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.right-edge-container,
.left-edge-container {
  position: absolute;
  display: flex;
  flex-direction: row;
}
.left-edge-container {
  right: 0px;
}

.right-edge-container {
  left: 0px;
}

.left-edge-backdrop,
.right-edge-backdrop {
  transform: scaleY(4);
}
</style>
