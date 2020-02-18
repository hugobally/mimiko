<template>
  <div class="map-settings-container">
    <SearchInput
      class="rename-input"
      @submit="renameMap"
      :valueProp="meta.title"
      label="Rename the map"
      :submitWord="!busy ? 'Rename' : 'Working...'"
      :valid="validTitle || !renameRetry"
      :busy="busy"
      :success="renameSuccess"
    />
    <div class="editmode-container noselect">
      <span class="editmode-label">Edit Mode</span>
      <div class="editmode-select-group">
        <div
          class="editmode-select"
          @click="editMode = true"
          :class="{ selected: editMode }"
        >
          ON
        </div>
        <div
          class="editmode-select"
          @click="editMode = false"
          :class="{ selected: !editMode }"
        >
          OFF
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { updateMap as gqlUpdateMap } from '@/api/graphql'
import { mapState } from 'vuex'
import SearchInput from '@/components/creator/SearchInput'

export default {
  components: {
    SearchInput,
  },
  data() {
    return {
      busy: false,
      title: null,
      validTitle: false,
      renameRetry: false,
      renameSuccess: false,
      editMode: false,
    }
  },
  computed: {
    ...mapState('map', ['id', 'meta']),
  },
  mounted() {
    this.editMode = this.$store.state.map.editMode
  },
  methods: {
    async renameMap(title) {
      if (this.busy) return

      try {
        this.busy = true
        this.renameRetry = false
        this.validTitle = true

        if (!validateMapTitle(title)) {
          this.validTitle = false
          this.renameSuccess = false
          return
        }

        this.validTitle = true

        const map = await gqlUpdateMap(this.id, {
          title: title,
        })

        if (!map) throw new Error()

        this.$store.commit('map/MAP_SET_META', map)
        this.$store.commit('maplist/USER_MAPS_UPDATE', {
          id: this.id,
          newVal: map,
        })
        this.renameSuccess = true
      } catch (error) {
        console.log(error)
        this.$store.dispatch('pushFlashQueue', {
          content: 'Could not rename the map',
          type: 'error',
        })
        return
      } finally {
        this.renameRetry = true
        this.busy = false
      }
    },
  },
  watch: {
    editMode: function(editMode) {
      const newQuery = editMode ? { edit: true } : {}
      this.$router.replace({
        path: this.$route.path,
        query: newQuery,
        hash: this.$route.hash,
      })
    },
  },
}

function validateMapTitle(title) {
  if (title.length < 1 || title.length > 80) return false
  if (!/^[\w\s]+$/.test(title)) return false

  return true
}
</script>

<style lang="scss" scoped>
.map-settings-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.editmode-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 50px;
  font-size: 20px;
}

.editmode-container > * {
  margin: 0px 20px;
}

.editmode-select-group {
  display: flex;
}

.editmode-select {
  padding: 5px;
  min-width: 50px;
  margin: 0px 3px;
  background-color: rgba(255, 255, 255, 0.03);
  cursor: pointer;
}

.selected {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.2);
  border: solid 1px rgba(255, 255, 255, 0.4);
}
</style>
