<template>
  <div class="viewport-container">
    <Overlay :viewport="viewportRef" />
    <svg
      ref="viewport"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      :opacity="loaded ? 1 : 0"
    >
      <ZoomHandler id="zoomgroup" :viewport="viewportRef" :graph="graphRef">
        <!-- <CircleBackground /> -->
        <PlayIndicator v-if="playing" :key="playing" />
        <Graph ref="graphComponent" />
        <HoverIndicator v-if="hovered" />
      </ZoomHandler>

      <Filters radius="40"></Filters>
    </svg>
  </div>
</template>

<script>
import Graph from '@/components/map/Graph'
import ZoomHandler from '@/components/map/viewport/ZoomHandler'
import Filters from '@/components/map/viewport/Filters'
// import CircleBackground from '@/components/map/viewport/CircleBackground'
import PlayIndicator from '@/components/map/viewport/PlayIndicator'
import HoverIndicator from '@/components/map/viewport/HoverIndicator'
import Overlay from '@/components/map/viewport/Overlay'

export default {
  props: ['loaded'],
  data() {
    return {
      viewportRef: null,
      graphRef: null,
    }
  },
  components: {
    Overlay,
    ZoomHandler,
    Graph,
    Filters,
    // CircleBackground,
    PlayIndicator,
    HoverIndicator,
  },
  mounted() {
    this.viewportRef = this.$refs.viewport
    this.graphRef = this.$refs.graphComponent
  },
  computed: {
    hovered() {
      return this.$store.state.map.hovered
    },
    playing() {
      return this.$store.state.player.knot
    },
    mapId() {
      return this.$store.state.map.id
    },
  },
}
</script>

<style lang="scss" scoped>
.viewport-container {
  overflow: hidden;
  flex: 1;

  background-color: $bg-primary;
}
</style>
