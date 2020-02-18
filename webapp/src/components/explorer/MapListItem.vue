<template>
  <div class="map-list-item-container noselect">
    <div class="map-navigate-group" @click="navigateToMap">
      <img
        class="map-flagship-cover"
        :src="map.flagship && map.flagship.imgURL"
        alt="cover"
      />
      <span class="map-title">{{ map.title }}</span>
      <span class="map-author-name" v-if="readOnly">
        by {{ map.author.username }}
      </span>
    </div>
    <div v-if="!readOnly" class="map-actions" @click="deleteMap">
      <transition name="delete-confirm" mode="out-in">
        <svg
          v-if="!askDeleteConfirm"
          class="map-action-delete-svg"
          viewBox="0 0 100 100"
        >
          <g transform="translate(110.73412,-94.984412)">
            <path
              class="map-action-delete-path"
              style="display:inline;fill-opacity:1;stroke:#999999;stroke-width:13.33333397;stroke-miterlimit:4;stroke-dasharray:none"
              d="m 202.32422,138.85742 c -8.05111,0 -14.85012,2.77388 -20.4961,8.40625 l -40.99218,40.99024 c -5.63237,5.63236 -8.40625,12.4503 -8.40625,20.49804 0,8.05111 2.77388,14.85024 8.40625,20.4961 l 88.60937,88.60937 -88.60937,88.60742 c -5.63237,5.54778 -8.40625,12.44843 -8.40625,20.4961 0,8.05111 2.77388,14.85016 8.40625,20.49609 l 40.99218,40.99414 c 5.63245,5.63237 12.43149,8.40625 20.4961,8.40625 8.05111,0 14.85023,-2.77388 20.49609,-8.40625 l 88.60742,-88.60937 88.60938,88.60937 c 5.6324,5.63237 12.45034,8.40625 20.49805,8.40625 8.05103,0 14.85016,-2.77388 20.49609,-8.40625 l 40.99023,-40.99414 c 5.63237,-5.54778 8.40625,-12.43141 8.40625,-20.49609 0,-8.05111 -2.77388,-14.85024 -8.40625,-20.4961 l -88.60742,-88.60742 88.60742,-88.60937 c 5.63237,-5.54778 8.40625,-12.43149 8.40625,-20.4961 0,-8.05111 -2.77388,-14.85211 -8.40625,-20.49804 l -40.99023,-40.99024 c -5.63237,-5.5478 -12.44842,-8.40625 -20.49609,-8.40625 -8.05108,0 -14.86901,2.77388 -20.49805,8.40625 l -88.60938,88.60742 -88.60742,-88.60742 c -5.63236,-5.5478 -12.44842,-8.40625 -20.49609,-8.40625 z"
              transform="matrix(0.26458333,0,0,0.26458333,-144.00892,60.008942)"
            />
          </g>
        </svg>
        <div v-else>
          <button @click.stop="deleteMap({ confirmed: true })" class="button">
            Confirm
          </button>
          <button @click.stop="askDeleteConfirm = false" class="button">
            Cancel
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { deleteMap as apiDeleteMap } from '@/api/graphql'

export default {
  props: ['map', 'readOnly'],
  data() {
    return {
      askDeleteConfirm: false,
    }
  },
  methods: {
    navigateToMap() {
      this.$router.push({ path: `/map/${this.map.id}` })
    },
    async deleteMap({ confirmed }) {
      if (!this.askDeleteConfirm) {
        this.askDeleteConfirm = true
        return
      }

      if (!confirmed) return

      try {
        await apiDeleteMap(this.map.id)
        this.$store.commit('maplist/USER_MAPS_REMOVE', this.map.id)
      } catch (error) {
        this.$store.dispatch('pushFlashQueue', {
          content: 'Error when trying to delete the map, please retry.',
          type: 'error',
        })
      } finally {
        this.askDeleteConfirm = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.map-list-item-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}

.map-navigate-group {
  flex: 1;
  min-width: 0;

  display: flex;
  cursor: pointer;
  align-items: center;
}

.map-list-item-container:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.map-flagship-cover {
  flex: initial;
  width: 90px;
  height: 90px;
  margin: 5px;
  border-radius: 5px;
}

.map-title {
  flex: 2;

  margin-left: 10px;
  font-size: 20px;

  text-align: left;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-author-name {
  flex: 1;
  min-width: 0;
  margin-right: 5px;
  color: rgba(255, 255, 255, 0.6);

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}

.map-actions {
  flex: initial;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100px;
  height: 100px;
  cursor: pointer;
}

.map-actions:hover {
  background-color: #121212;
  .map-action-delete-path {
    fill: rgba(255, 255, 255, 0.5);
  }
}

.map-action-delete-svg {
  width: 30px;
  height: 30px;
}

.map-action-delete-path {
  fill: none;
}

.delete-confirm-enter-active,
.delele-confirm-leave-active {
  transition: all 0.5s;
}

.delete-confirm-enter,
.delete-confirm-leave-to {
  opacity: 0;
}
</style>
