<template>
  <div @click.self="closePanel" class="panel-ext-container">
    <div class="panel-container">
      <div class="panel-header">
        <h1 class="panel-title noselect">{{ titleStr }}</h1>
        <img
          @click="closePanel"
          class="close-icon"
          src="@/assets/svg/close-icon.svg"
          alt="close-icon"
        />
      </div>
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      kbListener: null,
    }
  },
  mounted() {
    const onKeyUp = e => {
      this.kbHandler(e)
    }
    window.addEventListener('keyup', onKeyUp)
    this.kbListener = onKeyUp
  },
  destroyed() {
    window.removeEventListener('keyup', this.kbListener)
  },
  computed: {
    titleStr() {
      const str = this.$route.hash.slice(1).replace('-', ' ')
      return str.charAt(0).toUpperCase() + str.slice(1)
    },
  },
  methods: {
    kbHandler(e) {
      if (e.key === 'Escape') this.closePanel()
    },
    closePanel() {
      this.$router.replace({
        path: this.$route.path,
        hash: '',
        query: this.$route.query,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.panel-ext-container {
  position: fixed;

  justify-content: center;
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.4);
}

.panel-container {
  position: relative;
  left: 0px;
  height: 100%;
  width: 100%;
  background-color: rgba(30, 30, 30, 1);
  display: flex;
  flex-direction: column;
}

@media (min-width: 1024px) {
  .panel-container {
    width: 800px;
  }
}

.panel-header {
  width: 100%;
  position: relative;
}

.close-icon {
  width: 20px;
  height: 20px;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}

.panel-title {
  width: 100%;
  padding: 0px 0px 5px 5px;
  border-bottom: solid rgba(255, 255, 255, 0.1) 1px;
  text-align: left;
}
</style>
