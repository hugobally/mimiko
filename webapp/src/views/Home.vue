<template>
  <div class="home-container">
    <h1 class="header noselect">
      Maps
    </h1>
    <div v-if="userMaps && userMaps.length === 0" >
      <div class="empty-text-container">
<!--        <img-->
<!--            width="100"-->
<!--            height="100"-->
<!--            src="@/assets/svg/favicon.svg"-->
<!--            alt="mimiko-logo"-->
<!--            class="mimiko-logo"-->
<!--        />-->
        <div class="empty-text">
          <h1 class="empty-text-title">
            Whoops, you have not created a map yet!
              Head
            <router-link to="/home#new" tag="a">
              over here
            </router-link>
            to get started.
          </h1>
        </div>
      </div>
    </div>
    <MapList class="map-list" :readOnly="false" :maps="userMaps" />
  </div>
</template>

<script>
import MapList from '@/components/explorer/MapList'
import SearchTrack from "@/components/SearchTrack";
import Creator from "@/components/Creator";

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
    // if (this.userMaps.length === 0) {
    //   this.$router.push({ path: this.$route.path, hash: '#new' })
    // }
    this.lastVisited = localStorage.getItem('last_visited')
    await this.$store.dispatch('map/resetMap')
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
  background-color: $bg-primary-shade;
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

.empty-text-centerer {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-text-container {
  display: flex;
  text-align: left;
}

.empty-text {
  margin-left: 30px;
}

.empty-text > * {
  margin-top: 20px;
}

</style>
