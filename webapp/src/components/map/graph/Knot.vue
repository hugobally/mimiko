<template>
  <g
    :id="id"
    :transform="transformStr"
    @click="playThis"
    @mouseover="setHovered(true)"
    @mouseleave="setHovered(false)"
  >
    <circle :r="radius / 1.9" :fill="color"> </circle>
    <image
      class="album-art-circle"
      :x="-radius / 2"
      :y="-radius / 2"
      :width="radius"
      :height="radius"
      :xlink:href="knot.track.imgURL"
      :clip-path="`url(#circle-template)`"
      stroke="#ffffff"
    >
    </image>
  </g>
</template>

<script>
export default {
  props: ['id', 'knot'],
  data() {
    return {
      radius: 40,
      track: {},
      hovered: false,
      hoveredExit: false,
    }
  },
  computed: {
    color() {
      return this.$store.state.map.meta.color
    },
    transformStr() {
      const { x, y } = this.knot
      return `translate(${x} ${y})`
    },
  },
  methods: {
    playThis() {
      this.$store.dispatch('player/playKnot', {
        knot: this.id,
        track: this.knot.track,
      })
    },
    setHovered(isHovered) {
      this.$store.commit('map/SET_HOVERED', isHovered ? this.id : null)
    },
  },
}
</script>

<style lang="scss" scoped>
g {
  cursor: pointer;
}
</style>
