<template>
  <div class="menu">
    <!-- <div class="logo-container">
      <img class="logo" src="@/assets/svg/logo-text.svg" alt="logo-link-home" />
    </div> -->
    <div class="menu-buttons">
      <router-link to="/home" class="menu-item menu-button noselect" tag="div">
        <span>Home</span>
      </router-link>
<!--      <div-->
<!--        @click="toggleExplorer"-->
<!--        class="menu-item menu-button noselect"-->
<!--        :class="{ 'highlighted-button': currentPanel == '#explore' }"-->
<!--      >-->
<!--        <span>Explore</span>-->
<!--      </div>-->
      <div
        @click="toggleCreator"
        class="menu-item menu-button noselect"
        :class="{ 'highlighted-button': currentPanel == '#new' }"
      >
        <span>New</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    currentPanel() {
      if (!this.$route || !this.$route.hash) return ''

      return this.$route.hash
    },
  },
  methods: {
    toggleExplorer() {
      const newHash = this.currentPanel === '#explore' ? '' : '#explore'
      this.$router.push({ path: this.$route.path, hash: newHash })
    },
    toggleCreator() {
      const newHash = this.currentPanel === '#new' ? '' : '#new'
      this.$router.push({ path: this.$route.path, hash: newHash })
    },
  },
}
</script>

<style lang="scss" scoped>
.menu {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background-color: $bg-primary;
  border-right: solid 1px black;
}

.logo-container {
  width: 64px;
  height: 64px;

  display: flex;
  align-items: center;
  justify-content: center;

  transition: all 0.05s ease-out;
}

.logo {
  width: 44px;
  height: 44px;
}

.menu-buttons {
  height: 100%;
  flex: 1;
  display: flex;
}

.menu-button {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 5px 10px 0px 10px;
}

.menu-item {
  width: 80px;
}

.menu-button:hover {
  color: #eee;
  background-color: black;
  transition: background-color 0.05s;
}

.highlighted-button {
  color: #eee;
  background-color: black;
}
</style>
