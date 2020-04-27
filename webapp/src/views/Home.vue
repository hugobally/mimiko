<template>
  <div class="home-container">
    <div ref="welcome-header" class="welcome-header-container"></div>
    <h1 v-if="userMaps.length > 0" class="header noselect">
      Maps
    </h1>
    <MapList class="map-list" :readOnly="false" :maps="userMaps" />
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
      lastVisited: null,
    }
  },
  computed: {
    userMaps() {
      return this.$store.getters['maplist/userMaps']
    },
    currentPath() {
      return this.$route.path
    },
  },
  async mounted() {
    await this.$store.dispatch('maplist/fetchAllUserMaps')
    if (this.userMaps.length === 0) {
      this.$router.push({ path: this.$route.path, hash: '#new' })
    }
    this.lastVisited = localStorage.getItem('last_visited')
  },
}
</script>

<style lang="scss" scoped>
.home-container {
  position: fixed;
  overflow-y: scroll;

  background-color: $bg-primary;
}

.text-logo {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-link {
  width: 100%;
  font-size: 30px;
  color: $bg-primary;
  padding: 10px;
  margin-left: 5px;
}

.quick-link:hover {
  background-color: $bg-primary;
}

.quick-links-container {
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.quick-links-container > .quick-link {
  padding: 5px 0px;
  text-align: left;
}

.header {
  padding: 20px 10px;
  width: 100%;
  background-color: $bg-primary;
  border-bottom: solid $bg-primary;
  font-size: 50px;
  text-align: left;
}

.user-maps-header {
  display: flex;
  justify-content: flex-start;
  border-bottom: solid $bg-primary;
  align-items: center;
}

.create-map-icon {
  width: 20px;
  height: 20px;
  margin-left: 10px;
}
</style>
