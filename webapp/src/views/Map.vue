<template>
  <div class="map-container">
    <Viewport :loaded="loaded" />
    <ZoomBar />
    <MapTitle />

    <span v-if="loading" class="loading">LOADING...</span>
  </div>
</template>

<script>
import Viewport from '@/components/map/Viewport'
import ZoomBar from '@/components/map/ui/ZoomBar'
import MapTitle from '@/components/map/MapTitle'

import { mapState } from 'vuex'

export default {
  components: {
    Viewport,
    ZoomBar,
    MapTitle,
  },
  computed: {
    ...mapState('map', ['load', 'knots']),
    loading() {
      return this.load > 0 && this.load < 100
    },
    loaded() {
      return this.load === 100
    },
    showOverlay() {
      return this.$store.state.map.focused && !this.$store.state.ui.zooming
    },
    id() {
      return this.$route.params.id
    },
    query() {
      return this.$route.query
    },
  },
  created() {
    const id = this.$store.state.map.id
    if (id && this.$route.params.id !== id) this.$store.dispatch('map/resetMap')
  },
  async mounted() {
    try {
      this.$store.commit('map/SET_EDIT_MODE', this.query.edit ? true : false)
      await this.$store.dispatch('map/fetchMap', this.id)
      await this.$store.dispatch('map/populate')
      localStorage.setItem('last_visited', this.id)

      const keys = Object.keys(this.knots)
      if (keys.length === 1) {
        const id = keys[0]
        const track = this.knots[id].track
        await this.$store.dispatch('map/createKnotsWithReco', {
          sourceId: id,
          number: 1,
        })
        this.$store.dispatch('player/playKnot', { track, knot: id })
      }
    } catch (error) {
      this.mapError(error)
      this.$store.commit('map/MAP_SET_LOAD', 0)
      return
    }
    this.$store.commit('map/MAP_SET_LOAD', 100)
  },
  destroyed() {
    const sdk = this.$store.state.player.sdk
    if (sdk) sdk.pause()
    this.$store.commit('player/RESET_PLAYER')
  },
  methods: {
    mapError(error) {
      console.log(error)
      this.$store.dispatch('pushFlashQueue', {
        content: 'Whoops ! The map could not be loaded.',
        type: 'error',
      })
    },
  },
  watch: {
    query: function() {
      this.$store.commit('map/SET_EDIT_MODE', this.query.edit ? true : false)
    },
  },
}
</script>

<style lang="scss" scoped>
.map-container {
  position: fixed;
  display: flex;
}

.loading {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4em;
}
</style>
