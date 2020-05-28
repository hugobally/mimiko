<template>
  <div class="creator-container disable-scrollbar">
    <!-- <transition key="find-song" name="search-input-transition" mode="out-in"> -->
    <div class="form-container">
      <div class="search-input-container">
        <SearchInput
          class="search-input"
          @submit="findTrack"
          placeholder="Title, artist"
          :valueProp="findLastValue || null"
          :submitWord="!busy ? 'Start' : 'Working...'"
          label="Let's start with a song you like !"
          :busy="busy"
          :valid="flagship || !findRetry"
          :autocompleteFunction="autocomplete"
        />
      </div>
      <!-- <GenreGrid class="genre-grid-layout" /> -->
      <div class="discoverable-container noselect hidden">
        <span class="discoverable-label">Map Discoverability</span>
        <div class="discoverable-select-group">
          <div
            class="discoverable-select"
            @click="isPublic = true"
            :class="{ selected: isPublic }"
          >
            Public
          </div>
          <div
            class="discoverable-select"
            @click="isPublic = false"
            :class="{ selected: !isPublic }"
          >
            Secret
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SearchInput from '@/components/creator/SearchInput'
// import GenreGrid from '@/components/creator/GenreGrid'
import { searchForTrack, autocomplete } from '@/api/spotify'
import { createMap as gqlCreateMap } from '@/api/graphql'

export default {
  components: {
    SearchInput,
    // GenreGrid,
  },
  data() {
    return {
      editMode: false,
      isPublic: false,

      busy: false,

      flagship: null,
      findRetry: false,
      findLastValue: null,

      title: null,
      validTitle: false,
      createRetry: false,

      autocomplete: autocomplete,
    }
  },
  computed: {
    formattedTitle() {
      if (!this.flagship) return ''

      return formatTitle(this.flagship)
    },
  },
  methods: {
    async findTrack(value) {
      if (this.busy || value.length < 1) return
      if (this.findRetry && value === this.findLastValue) return

      try {
        this.busy = true
        this.findRetry = false
        this.findLastValue = value

        const tracks = await searchForTrack(value)

        if (tracks) this.flagship = tracks[0]
        this.title = replaceSpecial(this.flagship.artist)
        this.createMap(this.title)
      } catch (error) {
        // TODO
      } finally {
        this.findRetry = true
        this.busy = false
      }
    },
    async createMap(title) {
      try {
        const map = await gqlCreateMap({
          title: title,
          public: this.isPublic,
          flagshipId: this.flagship.id,
        })
        if (!map) throw new Error()
        map.flagship = this.flagship
        this.$store.commit('maplist/USER_MAPS_PUSH', map)
        this.$router.push({
          path: `/map/${map.id}`,
          query: this.editMode ? { edit: true } : {},
        })
      } catch (error) {
        this.$store.dispatch('pushFlashQueue', {
          content: 'Error when trying to create a new map, please retry.',
          type: 'error',
        })
      }
    },
    resetFlagship() {
      this.flagship = null
      this.findRetry = false
      this.createRetry = false
    },
  },
}

function formatTitle(track) {
  const str = `${track.artist + ' - ' + track.title}`
  return str.substring(0, 79)
}

function validateMapTitle(title) {
  if (title.length < 1 || title.length > 80) return false
  if (!/^[\w\s]+$/.test(title)) return false

  return true
}

function replaceSpecial(str) {
  return str.replace(/[\W]+/g, ' ').substring(0, 79)
}
</script>

<style lang="scss" scoped>
.creator-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: scroll;
}

.form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.form-container > * {
  margin: 20px 0px;
}

.discoverable-container {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-around;
}

.discoverable-select-group {
  display: flex;
  color: $text-primary;
}

.discoverable-select {
  padding: 5px;
  margin: 0px 3px;
  cursor: pointer;
}

.selected {
  border: solid 1px $bg-secondary;
}

@media (max-width: 800px) {
  .form-container {
    width: 100%;
    height: 100%;
    justify-content: flex-start;
  }
}

@media (min-width: 801px) {
  .form-container {
    width: 600px;
    height: 600px;
  }
}

.genre-grid-layout {
  width: 100%;
}
</style>
