<template>
  <div class="home-container disable-scrollbar">
    <div ref="welcome-header" class="welcome-header-container">
      <h1 class="header noselect">Welcome to mimu</h1>
      <div class="quick-links-container">
        <router-link
          v-if="lastVisited"
          class="quick-link link"
          :to="{ path: `/map/${lastVisited}` }"
          >Go to last visited map</router-link
        >
        <router-link
          class="quick-link link"
          :to="{ path: currentPath, hash: '#explore' }"
          >Discover music from other users</router-link
        >
        <router-link
          class="quick-link link"
          :to="{ path: currentPath, hash: '#create' }"
          >Create a new music map
        </router-link>
      </div>
    </div>
    <h1 class="header noselect">
      Your Maps
    </h1>
    <MapList :readOnly="false" :maps="userMaps" />
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
  mounted() {
    this.$store.dispatch('maplist/fetchAllUserMaps')
    this.lastVisited = localStorage.getItem('last_visited')
  },
}
</script>

<style lang="scss" scoped>
.home-container {
  position: fixed;
  overflow-y: scroll;

  background-color: #121212;
}

.quick-link {
  width: 100%;
  font-size: 25px;
  color: rgba(255, 255, 255, 0.7);
  margin-left: 5px;
}

.quick-link:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.quick-links-container {
  display: flex;
  flex-direction: column;
}

.quick-links-container > .quick-link {
  padding: 5px 0px;
  text-align: left;
}

.header {
  padding: 0px 0px 5px 5px;
  background-color: rgba(255, 255, 255, 0.05);
  border-bottom: solid rgba(255, 255, 255, 0.1) 1px;
  font-size: 32px;
  text-align: left;
}

.user-maps-header {
  display: flex;
  justify-content: flex-start;
  border-bottom: solid rgba(255, 255, 255, 0.1) 1px;
  align-items: center;
}

.create-map-icon {
  width: 20px;
  height: 20px;
  margin-left: 10px;
}
</style>
