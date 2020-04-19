<template>
  <div class="zoombar-container-center">
    <div class="zoombar-container">
      <img
        class="zoom-button"
        @click="manualZoom(1)"
        src="@/assets/svg/zoom-in.svg"
        alt="zoom-in"
      />
      <img
        class="zoom-button"
        @click="manualZoom(-1)"
        src="@/assets/svg/zoom-out.svg"
        alt="zoom-out"
      />
      <img
        class="zoom-button"
        @click="focus($store.state.player.knot)"
        src="@/assets/svg/locate.svg"
        alt="focus-playing"
      />
      <img
        class="zoom-button"
        @click="focus('ALL')"
        src="@/assets/svg/full-zoom.svg"
        alt="focus-all"
      />
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    manualZoom(diff) {
      this.$store.commit('PUSH_ZOOM_QUEUE', diff)
    },
    focus(target) {
      this.$store.dispatch('map/focus', target)
    },
  },
}
</script>

<style lang="scss" scoped>
.zoombar-container-center {
  position: absolute;
  right: 0px;
  height: 100%;
  margin-right: 15px;
  padding-bottom: 15px;
  pointer-events: none;

  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.zoombar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  background-color: $bg-primary;
}

.zoombar-container > img {
  padding: 7px;
  pointer-events: auto;
  cursor: pointer;
  border: solid 1px black;
}

.zoombar-container > img:hover {
  background-color: $bg-secondary;
}

.zoom-button {
  width: 40px;
  height: 40px;
}
</style>
