<template>
  <div
    v-if="id"
    class="map-title-container noselect"
    :class="{ hoverable: !readOnly }"
    @click="openSettings"
  >
    <span>{{ meta.title }}</span>
    <span>
      <span v-if="readOnly" class="title-separator">by</span>
      <span v-if="readOnly">{{ meta.author.username }}</span>
    </span>
    <img
      v-if="!readOnly"
      class="settings-icon"
      src="@/assets/svg/cogwheel.svg"
      alt="settings"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('map', ['id', 'meta', 'readOnly']),
  },
  methods: {
    openSettings() {
      if (this.readOnly) return

      this.$router.replace({
        path: this.$route.path,
        query: this.$route.query,
        hash: '#map-settings',
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.map-title-container {
  position: absolute;
  top: 0px;
  left: 0px;

  padding: 5px;
  font-size: 25px;
  color: rgba(255, 255, 255, 0.5);
  background-color: #121212dd;

  display: flex;
  align-items: center;
}

.title-separator {
  padding: 0px 5px;
  color: rgba(255, 255, 255, 0.7);
}

.settings-icon {
  width: 20px;
  height: 20px;
  margin-left: 10px;
  opacity: 0.4;
}

.hoverable:hover {
  cursor: pointer;
  background-color: #eee;
  color: #121212dd;

  .settings-icon {
    filter: brightness(0);
    opacity: 1;
  }
}
</style>
