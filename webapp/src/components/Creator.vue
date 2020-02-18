<template>
  <div class="creator-container disable-scrollbar">
    <transition key="find-song" name="search-input-transition" mode="out-in">
      <div v-if="!flagship" class="form-container">
        <div class="search-input-container">
          <SearchInput
            class="search-input"
            @submit="findTrack"
            placeholder="Find your starting song"
            :valueProp="findLastValue || null"
            :submitWord="!busy ? 'Find' : 'Working...'"
            :busy="busy"
            :valid="flagship || !findRetry"
          />
        </div>
        <div class="discoverable-container noselect">
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
        <div class="mode-select-container noselect">
          <div
            class="mode-container"
            :class="{ selected: editMode === false }"
            @click="editMode = false"
          >
            <img
              class="mode-icon"
              src="@/assets/svg/free-mode-icon.svg"
              alt="free-mode-icon"
            />
            <span class="mode-title">Free Mode</span>
            <p class="mode-description">
              Discover music based on automatic recommendations
            </p>
          </div>
          <div
            class="mode-container"
            :class="{ selected: editMode === true }"
            @click="editMode = true"
          >
            <img
              class="mode-icon"
              src="@/assets/svg/edit-mode-icon.svg"
              alt="edit-mode-icon"
            />
            <span class="mode-title">Edit Mode</span>
            <p class="mode-description">
              Create a curated music graph and share it with the world!
            </p>
          </div>
        </div>
      </div>
      <div v-else class="form-container" key="map-title">
        <div class="flagship-preview-container" v-if="flagship">
          <img
            class="flagship-preview-cover"
            :src="flagship.imgURL"
            alt="flagship-track-cover"
          />
          <span class="flagship-preview-title">
            {{ formattedTitle }}
          </span>
        </div>
        <SearchInput
          class="search-input"
          @submit="createMap"
          placeholder="Give your map a title"
          :valueProp="title"
          :submitWord="!busy ? 'Start!' : 'Working...'"
          label="Map Title"
          :valid="validTitle || !createRetry"
          :busy="busy"
        />
        <div class="previous-button-container">
          <button class="previous-button" @click="resetFlagship">
            Previous
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import SearchInput from '@/components/creator/SearchInput'
import { searchForTrack } from '@/api/spotify'
import { createMap as gqlCreateMap } from '@/api/graphql'

export default {
  components: {
    SearchInput,
  },
  data() {
    return {
      editMode: false,
      isPublic: true,

      busy: false,

      flagship: null,
      findRetry: false,
      findLastValue: null,

      title: null,
      validTitle: false,
      createRetry: false,
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
        this.title = replaceSpecial(this.flagship.title)
      } catch (error) {
        return
      } finally {
        this.findRetry = true
        this.busy = false
      }
    },
    async createMap(title) {
      if (this.busy) return

      try {
        this.busy = true
        this.createRetry = false

        if (!validateMapTitle(title)) {
          this.validTitle = false
          return
        }

        this.validTitle = true

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
        console.log(error)
        this.$store.dispatch('pushFlashQueue', {
          content: 'Error when trying to create a new map, please retry.',
          type: 'error',
        })
        return
      } finally {
        this.createRetry = true
        this.busy = false
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
  return str.replace(/[\W]+/g, ' ')
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
  justify-content: space-around;
}

.form-container > * {
  margin: 20px 0px;
}

.flagship-preview-container {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.flagship-preview-cover {
  width: 200px;
  height: 200px;
  margin: 10px;
}

.flagship-preview-title {
  overflow: hidden;
  text-overflow: ellipsis;
}

.discoverable-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.discoverable-select-group {
  display: flex;
}

.discoverable-select {
  padding: 5px;
  margin: 0px 3px;
  background-color: rgba(255, 255, 255, 0.03);
  cursor: pointer;
}

.mode-select-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px;
}

.mode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  margin: 2px;
  background-color: rgba(255, 255, 255, 0.05);
  opacity: 0.8;
  padding: 5px;
  cursor: pointer;
}

.previous-button-container {
  width: 100%;
  display: flex;
  justify-content: flex-start;
}

.previous-button {
  text-decoration: none;
  border: none;
  height: 50px;
  width: 100px;
  padding: 5px;
  margin-top: 50px;
  font-size: 15px;
  background-color: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
}

.selected {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.2);
  border: solid 1px rgba(255, 255, 255, 0.4);
}

.mode-icon {
  width: 40px;
}

.mode-description {
  color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 600px) {
  .form-container {
    width: 100%;
    height: 100%;
    justify-content: flex-start;
  }

  .flagship-preview-container {
    flex-direction: column;
  }

  .mode-select-container {
    width: 100%;
    flex-direction: column;
  }

  .mode-container {
    width: 100%;
  }

  .previous-button {
    margin-left: 10px;
  }
}

@media (min-width: 601px) {
  .form-container {
    max-width: 400px;
    max-height: 400px;
  }

  .discoverable-container {
    width: 400px;
  }

  .mode-select-container {
    max-height: 300px;
  }
  .mode-container {
    max-width: 300px;
  }
}

@media (min-width: 801px) {
  .form-container {
    width: 600px;
    height: 600px;
  }
}

.search-input-transition-enter-active,
.search-input-transition-leave-active {
  transition: all 0.1s;
}
.search-input-transition-enter,
.search-input-transition-leave-to {
  opacity: 0;
}
.search-input-transition-enter {
  transform: translateX(200px);
}
.search-input-transition-leave-to {
  transform: translateX(-200px);
}
</style>
