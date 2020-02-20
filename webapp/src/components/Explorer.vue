<template>
  <div class="explorer-container disable-scrollbar">
    <input
      class="explorer-searchbar"
      placeholder="Search for songs, artists, maps"
      v-model="searchString"
    />
    <MapList
      v-if="!noSearchResult"
      :readOnly="true"
      :maps="filteredMaps || publicMaps"
    />
    <div class="no-result" v-else>No result. Add yours to the list ! ;)</div>
  </div>
</template>

<script>
import MapList from '@/components/explorer/MapList'

export default {
  components: {
    MapList,
  },
  data() {
    return {
      searchString: '',
      filteredMaps: null,
      debounce: null,
    }
  },
  computed: {
    mapList() {
      return this.filteredMaps || this.publicMaps
    },
    publicMaps() {
      return this.$store.getters['maplist/publicMaps']
    },
    noSearchResult() {
      return (
        this.searchString !== '' &&
        this.filteredMaps &&
        this.filteredMaps.length === 0
      )
    },
  },
  mounted() {
    this.$store.dispatch('maplist/fetchAllPublicMaps')
  },
  methods: {
    filterMaps() {
      if (this.searchString === '') this.filteredMaps = null

      this.filteredMaps = this.publicMaps.filter(map => {
        return mapMetadataIncludes(this.searchString.toLowerCase(), [
          map.title,
          map.author && map.author.username,
          map.flagship && map.flagship.artist,
          map.flagship && map.flagship.title,
        ])
      })
    },
  },
  watch: {
    searchString: function() {
      if (this.debounce) {
        clearTimeout(this.debounce)
      }

      this.debounce = setTimeout(this.filterMaps, 500)
    },
  },
}

function mapMetadataIncludes(str, fields) {
  for (const field of fields) {
    if (field && field.toLowerCase().includes(str)) return true
  }
  return false
}
</script>

<style lang="scss" scoped>
.explorer-container {
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
}

.explorer-searchbar {
  height: 32px;
  width: 100%;
  border: 0px;
  padding: 5px;
  font-size: 20px;
  font-family: 'IBM Plex Sans', sans-serif;
  background-color: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.3);
}

.explorer-searchbar::placeholder {
  font-size: 30px;
}

@media (min-width: 601px) {
  .explorer-searchbar {
    height: 64px;
  }
}

.no-result {
  color: rgba(255, 255, 255, 0.4);
  margin: 20px 0px;
}
</style>
