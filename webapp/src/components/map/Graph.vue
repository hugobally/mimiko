<template>
  <g ref="graphGroup">
    <transition-group name="link-group" tag="g">
      <Link v-for="(link, key) in links" :key="key" :id="key" :link="link" />
    </transition-group>
    <transition-group name="knot-group" tag="g">
      <Knot v-for="(knot, key) in knots" :key="key" :id="key" :knot="knot" />
    </transition-group>
  </g>
</template>

<script>
import { mapState } from 'vuex'
import Knot from '@/components/map/graph/Knot'
import Link from '@/components/map/graph/Link'

export default {
  components: {
    Knot,
    Link,
  },
  computed: {
    ...mapState('map', ['knots', 'links']),
  },
}
</script>

<style lang="scss" scoped>
@-moz-document url-prefix() {
  .link-group-enter-active,
  .link-group-leave-active,
  .knot-group-enter-active,
  .knot-group-leave-active {
    transition: all 0.25s;
  }

  .link-group-enter,
  .link-group-leave-to,
  .knot-group-enter,
  .knot-group-leave-to {
    opacity: 0;
  }
}
</style>
