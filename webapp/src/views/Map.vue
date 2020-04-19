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
      let startKnotId = null

      for (const key of keys) {
        if (this.knots[key].level === 0) {
          startKnotId = key
          break
        }
      }

      const freshCreated = keys.length === 1
      if (freshCreated) this.$store.commit('map/MAP_SET_FRESH_CREATED', true)

      this.$store.commit('map/MAP_SET_LOAD', 100)

      if (freshCreated) {
        await new Promise(r => setTimeout(r, 500))
        // await this.$store.dispatch('map/createKnotsWithReco', {
        //   sourceId: startKnotId,
        //   number: 1,
        // })
        this.$store.commit('map/MAP_SET_FRESH_CREATED', false)
      }
    } catch (error) {
      this.mapError()
      if (this.load !== 100) this.$store.commit('map/MAP_SET_LOAD', 0)
      return
    }
  },
  destroyed() {
    const sdk = this.$store.state.player.sdk
    if (sdk) sdk.pause()
    this.$store.commit('player/RESET_PLAYER')
  },
  methods: {
    mapError() {
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
