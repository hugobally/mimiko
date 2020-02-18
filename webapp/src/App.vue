<template>
  <div id="app">
    <FlashMessage :style="flashLayout" />

    <transition name="panel">
      <Panel v-if="panelContent" :style="pageLayout">
        <component :is="panelContent" />
      </Panel>
    </transition>

    <router-view :key="routePath" :style="pageLayout" />

    <Nav :class="{ hidden: maskNav && !logged }" :style="navLayout"> </Nav>
    <div class="debug-center"></div>
  </div>
</template>

<script>
import Nav from '@/components/Nav'

import Panel from '@/components/Panel'
import Explorer from '@/components/Explorer'
import Creator from '@/components/Creator'
import Add from '@/components/map/Add'
import MapSettings from '@/components/map/MapSettings'
import Settings from '@/components/Settings'

import FlashMessage from '@/components/utils/FlashMessage'

export default {
  props: ['hideNav'],
  components: {
    Nav,
    FlashMessage,
    Panel,
    Settings,
    explore: Explorer,
    create: Creator,
    add: Add,
    settings: Settings,
    'map-settings': MapSettings,
  },
  data() {
    return {
      navHeight: 64,
      maskNav: true,
    }
  },
  computed: {
    panelContent() {
      return this.$route.hash.slice(1)
    },
    navLayout() {
      return {
        position: 'fixed',
        bottom: '0px',
        width: '100%',
        height: `${this.navHeight}px`,
      }
    },
    flashLayout() {
      return {
        position: 'fixed',
        top: `0px`,
        minWidth: '100%',
        minHeight: '50px',
        zIndex: '2',
      }
    },
    pageLayout() {
      return {
        marginBottom: `${this.navHeight}px`,
        width: '100%',
        height: `calc(100vh - ${this.navHeight}px`,
      }
    },
    routePath() {
      return this.$route.path
    },
    logged() {
      if (!this.$store.auth) return false

      return this.$store.auth.user.logged
    },
  },
  watch: {
    routePath(newVal) {
      console.log(newVal)
      if (newVal.substr(0, 8) !== '/welcome') {
        this.maskNav = false
      } else {
        this.maskNav = true
      }
    },
  },
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=IBM+Plex+Sans&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #121212;
}
#app {
  font-family: 'IBM Plex Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #eee;
}

img,
.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Opera and Firefox */
}

.hidden {
  display: none;
}

.link {
  text-decoration: none;
}

.mask-nav {
  background-color: #121212;
  z-index: 2;
}

.panel-enter-active,
.panel-leave-active {
  transition: all 0.2s;
}

.panel-enter,
.panel-leave-to {
  opacity: 0;
}

.disable-scrollbar {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}
.disable-scrollbar::-webkit-scrollbar {
  width: 0px;
  background: transparent; /* Chrome/Safari/Webkit */
}

.button {
  text-decoration: none;
  border: none;
  padding: 5px;
  background-color: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
}

</style>
