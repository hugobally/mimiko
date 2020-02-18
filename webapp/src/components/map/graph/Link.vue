<template>
  <g :opacity="highlighted ? 1 : 0.5">
    <transition name="link-path">
      <path
        v-if="path.steps && path.steps.length > 0"
        :key="path.steps.length"
        :d="buildPath()"
        :style="color"
      />
    </transition>
    <path
      v-if="path.unvisitedSteps && path.unvisitedSteps.length > 0"
      :d="buildPathUnvisited()"
      :style="color"
      stroke-dasharray="10"
    />
  </g>
</template>

<script>
import { line as d3Line, curveNatural } from 'd3-shape'
import { mapState } from 'vuex'

export default {
  props: ['link', 'id'],
  computed: {
    ...mapState('map', ['knots', 'links', 'focused']),
    lineGenerator() {
      return d3Line()
        .curve(curveNatural)
        .x(id => this.knots[id].x)
        .y(id => this.knots[id].y)
    },
    color() {
      return {
        stroke: this.path.color || '#ddd',
      }
    },
    dashed() {
      return {
        strokeDasharray: this.path.hasUnvisited ? 10 : 0,
      }
    },
    path() {
      const source = this.knots[this.link.source]
      const target = this.knots[this.link.target]
      if (target.children.length !== 0) return {}

      const steps = []
      const unvisitedSteps = []
      let endUnvisited = false

      let color = null

      let id = this.link.target

      while (id) {
        const obj = this.knots[id]

        if (!color && obj.color) color = obj.color

        if (!endUnvisited && !obj.visited) {
          unvisitedSteps.push(id)
        } else {
          if (!endUnvisited) {
            unvisitedSteps.push(id)
            endUnvisited = true
          }
          steps.push(id)
        }

        // if (!obj.parent && steps.length < 2 && unvisitedSteps.length < 2) {
        //   unvisitedSteps.push(id)
        // }
        id = obj.parent
        console.log(steps.unvisitedSteps)
      }
      return {
        steps: steps.reverse(),
        unvisitedSteps: unvisitedSteps ? unvisitedSteps.reverse() : null,
        color: color,
      }
    },
    highlighted() {
      const knot = this.$store.state.player.knot

      const onVisited = this.path.steps && this.path.steps.includes(knot)
      const onUnvisited =
        this.path.unvisitedSteps && this.path.unvisitedSteps.includes(knot)

      return knot && (onVisited || onUnvisited)
    },
  },
  methods: {
    buildPath() {
      return this.lineGenerator(this.path.steps)
    },
    buildPathUnvisited() {
      return this.lineGenerator(this.path.unvisitedSteps)
    },
  },
}
</script>

<style scoped>
path {
  fill: none;
  stroke-width: 3;
}

.link-path-enter-active,
.link-path-leave-active {
  transition: all 0.5s;
}

.link-path-enter,
.link-path-leave-to {
  opacity: 0;
}
</style>
