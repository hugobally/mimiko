<template>
  <g ref="zoomGroup" :transform="transformStr">
    <slot></slot>
  </g>
</template>

<script>
import * as d3zoom from 'd3-zoom'
import { select as d3select, event as d3event } from 'd3-selection'
import { mapState } from 'vuex'

export default {
  props: ['viewport', 'graph'],
  data() {
    return {
      transform: { x: 0, y: 0, k: 1 },
      d3ZoomObj: null,
      d3Viewport: null,
      config: {},
      transitionTime: 2000,
    }
  },
  computed: {
    ...mapState('map', ['knots', 'focused', 'load', 'freshCreated']),
    ...mapState({
      manualZoomQueue: state => state.ui.manualZoomQueue,
    }),

    transformStr() {
      return `translate(${this.transform.x} ${this.transform.y}) scale(${this.transform.k})`
    },
  },
  watch: {
    viewport: async function() {
      if (this.viewport === undefined || this.d3Viewport !== null) return

      this.d3Viewport = d3select(this.viewport)
      this.d3ZoomObj = d3zoom
        .zoom()
        .scaleExtent([0.1, 20])
        .on('zoom', this.transformCallback)
      this.d3Viewport.call(this.d3ZoomObj)
    },
    load: function(loadValue) {
      if (loadValue === 100) {
        this.fit(0)
      }
    },
    focused: function(newFocus) {
      if (newFocus === 'ALL') {
        this.fit(500)
      } else {
        this.translateZoom(1000)
      }
    },
    manualZoomQueue: function(queue) {
      if (queue.length === 0) return

      const diff = queue[0]
      this.$store.commit('SHIFT_ZOOM_QUEUE')
      this.manualZoom(diff, 300)
    },
  },
  methods: {
    transformCallback() {
      this.transform = d3event.transform
    },
    async fit(transitionTime = null) {
      const target = this.graph.$refs.graphGroup.getBBox()
      console.log('debug', this.freshCreated)
      const padding = this.freshCreated ? 0.03 : 0.8

      const width = this.viewport.clientWidth
      const height = this.viewport.clientHeight

      const tgtWidth = target.width || 40
      const tgtHeight = target.height || 40

      const centerX = target.x + tgtWidth / 2
      const centerY = target.y + tgtHeight / 2

      const scale = padding / Math.max(tgtWidth / width, tgtHeight / height)
      const translateX = width / 2 - scale * centerX
      const translateY = height / 2 - scale * centerY

      const newTransform = d3zoom.zoomIdentity
        .translate(translateX, translateY)
        .scale(scale)

      let base = this.d3Viewport

      if (transitionTime === null) transitionTime = this.transitionTime
      if (transitionTime > 0) base = base.transition().duration(transitionTime)

      base.call(this.d3ZoomObj.transform, newTransform)
    },
    getZoomTarget() {
      if (!this.focused || this.focus === 'ALL') return null

      return { x: this.knots[this.focused].x, y: this.knots[this.focused].y }
    },
    translateZoom(transition) {
      const target = this.getZoomTarget()

      this.d3ZoomObj.translateTo(
        this.d3Viewport.transition().duration(transition),
        target.x,
        target.y,
      )
    },
    manualZoom(diff, transition) {
      const scale = diff > 0 ? 1.5 : 1 / 1.5
      this.d3ZoomObj.scaleBy(
        this.d3Viewport.transition().duration(transition),
        scale,
      )
    },
  },
}
</script>
