<template>
  <div
    class="overlay-group"
    @mouseover="onMouseOver()"
    @mouseleave="onMouseLeave()"
  >
    <div :style="{ ...topEdge }" v-if="tutorialKnot">
      <div class="top-edge-container">
<!--        <div :style="{ ...reactiveSize }" class="top-edge-backdrop" />-->
        <!--        <input v-model="inputTrackId" />-->
        <!--        <button @click="updateTrackId">update</button>-->
        <span class="select-knot-tutorial tutorial-bubble">
          1. Click on a song to select it !
        </span>
        <div class="tutorial-arrow"></div>
      </div>
    </div>
    <div
      :style="{ ...bottomEdge }"
      class="bottom-edge"
      :class="{ hidden: !hoveredKnot }"
    >
      <div class="bottom-edge-container">
        <div :style="{ ...reactiveSize }" class="bottom-edge-backdrop" />
        <a
          class="track-title-and-link"
          :href="moreInfoLink"
          target="_blank"
          :style="{ ...reactiveFontSize }"
        >
          {{ (knot && knot.track.artist) + ' - ' + (knot && knot.track.title) }}
          <img src="@/assets/svg/more-info.svg" alt="more info icon" />
        </a>
      </div>
    </div>
    <div :style="{ ...leftEdge }" :class="{ hidden: !hoveredKnot }">
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
    <div :style="{ ...rightEdge }" :class="{ hidden: !hoveredKnot }">
      <div class="right-edge-container">
        <div :style="{ ...reactiveSize }" class="right-edge-backdrop" />
        <button class="add-button" @click="add">
          <img
            :style="{ ...reactiveSize }"
            src="@/assets/svg/add-icon.svg"
            alt="add icon"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getTracks } from '@/api/spotify'
import { updateKnot } from '@/api/graphql'

export default {
  data() {
    return {
      topEdge: null,
      bottomEdge: null,
      leftEdge: null,
      rightEdge: null,
      inputTrackId: '',
    }
  },
  props: ['viewport'],
  computed: {
    ...mapState('map', [
      'knots',
      'hovered',
      'selected',
      'readOnly',
      'rootKnotId',
    ]),
    ...mapState('ui', [
      'zoomLevel',
      'transform',
      'selectedKnotId',
      'tutorialSteps',
    ]),
    ...mapState('player', ['status', 'playedKnotId']),
    hoveredKnot() {
      if (!this.hovered) return null

      return this.knots[this.hovered]
    },
    tutorialKnot() {
      if (!this.tutorialSteps.includes('select_knot')) return null

      return this.knots[this.rootKnotId]
    },
    knot() {
      return this.hoveredKnot || this.tutorialKnot
    },
    reactiveFontSize() {
      let fontSize = this.$store.state.ui.zoomLevel * 20
      fontSize = Math.min(Math.max(fontSize, 20), 25)
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
      if (!this.knot) return ''

      return `https://open.spotify.com/track/${this.knot.track.id}`
    },
  },
  watch: {
    // TODO DRY
    knot: function() {
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
      if (!this.knot) return

      const zoomGroup = document.getElementById('zoomgroup')
      const matrix = zoomGroup.getCTM()

      const transform = (x, y) => {
        const p = new DOMPoint(x, y).matrixTransform(matrix)
        return {
          transform: `translate(${p.x}px, ${p.y}px)`,
          position: 'fixed',
        }
      }

      const circleRadius = 20

      this.topEdge = transform(this.knot.x, this.knot.y - circleRadius)
      this.bottomEdge = transform(this.knot.x, this.knot.y + circleRadius)

      this.leftEdge = transform(this.knot.x - circleRadius, this.knot.y)
      this.rightEdge = transform(this.knot.x + circleRadius, this.knot.y)
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
      this.$store.dispatch('ui/selectKnot', this.hovered)
    },
    // TODO Factorize w/ Player.vue
    async add() {
      if (!this.readOnly) {
        const newKnots = await this.$store.dispatch('map/createKnots', {
          sourceId: this.hovered,
          number: 5,
          visited: false,
        })
        newKnots.forEach(knot =>
          this.$store.commit('player/PLAYQUEUE_SHIFT', {
            track: knot.track,
            knot: knot.id,
          }),
        )
        if (this.status !== 'PLAYING') {
          await this.$store.dispatch('player/playKnot', {
            knot: newKnots[0].id,
            track: newKnots[0].track,
          })
        }
      }
    },
    async updateTrackId() {
      const track = (await getTracks(this.inputTrackId))[0]
      await updateKnot(this.hovered, { trackId: track.id })
      this.$store.commit('map/KNOT_SET_TRACK', { knots: [this.hovered], track })
    },
  },
}
</script>

<style lang="scss" scoped>
.overlay-group {
  position: fixed;
}

.play-this-button,
.add-button {
  transform: translate(0, -50%);
  padding: 10px;
  border-radius: 0px;
}
.more-info-link {
  display: block;
}
//.more-info-link {
//  padding: 10px;
//  transform: translate(-50%, 0);
//}

//.bottom-edge::before {
//  content: '';
//  position: absolute;
//  width: 130%;
//  height: 110%;
//  left: 50%;
//  top: 50%;
//  transform: translate(-50%, -50%);
//}

.right-edge-container,
.left-edge-container,
.top-edge-container,
.bottom-edge-container {
  position: absolute;
  display: flex;
}
.left-edge-container {
  flex-direction: row;
  right: 0px;
}
.right-edge-container {
  flex-direction: row;
  left: 0px;
}
.top-edge-container {
  flex-direction: column;
  bottom: 0px;
}
.bottom-edge-container {
  display: flex;
  flex-direction: column;
  top: 0px;
}

.track-title-and-link {
  border: none;
  cursor: pointer;
  text-decoration: none;

  width: max-content;
  transform: translateX(-50%);

  background-color: $black-lighter;
  color: $text-highlight;
  padding: 5px;
  border-radius: 5px;

  text-wrap: none;
}

.left-edge-backdrop,
.right-edge-backdrop {
  transform: scaleY(2);
}
.top-edge-backdrop,
.bottom-edge-backdrop {
  transform: scaleX(4);
}

.tutorial-bubble {
  border-radius: 5px;
  background-color: white;
  font-size: 25px;
  padding: 10px;
  width: max-content;
  text-wrap: none;
}

.tutorial-arrow {
  height: 50px;
  width: 0px;
  border: solid black;
  border-width: 0 0 0 5px;
  transform: rotate(30deg);
  margin-left: 30px;
}

</style>
