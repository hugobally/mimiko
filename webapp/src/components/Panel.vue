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
  background-color: $bg-primary;
}

.panel-container {
  position: relative;
  left: 0px;
  height: 100%;
  width: 100%;
  background-color: $bg-primary;
  display: flex;
  flex-direction: column;
}

.panel-header {
  width: 100%;
  position: relative;
}

.panel-title {
  width: 100%;
  height: 80px;
  padding: 0px 0px 5px 5px;
  border-bottom: solid $bg-primary;
  text-align: left;
  font-size: 50px;
}

.close-icon {
  width: 50px;
  height: 50px;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}
</style>
