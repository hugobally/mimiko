<template>
  <div class="menu">
    <router-link to="/home" class="logo-container" tag="div">
      <img class="logo" src="@/assets/svg/mimu-logo.svg" alt="logo-link-home" />
    </router-link>
    <div class="menu-buttons">
      <div @click="toggleExplorer" class="menu-item menu-button noselect">
        <span>Explore</span>
      </div>
      <div @click="toggleCreator" class="menu-item menu-button noselect">
        <span>Create</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    toggleExplorer() {
      const newHash = this.$route.hash === '#explore' ? '' : '#explore'
      this.$router.push({ path: this.$route.path, hash: newHash })
    },
    toggleCreator() {
      const newHash = this.$route.hash === '#create' ? '' : '#create'
      this.$router.push({ path: this.$route.path, hash: newHash })
    },
  },
}
</script>

<style lang="scss" scoped>
.menu {
  flex: 1;
  min-width: 200px;
  max-width: 250px;

  display: flex;
  justify-content: flex-start;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.05);
}

.logo-container {
  width: 64px;
  height: 64px;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  transition: all 0.05s ease-out;
}

.logo {
  width: 44px;
  height: 44px;
}

.logo-container:hover {
  .logo {
    filter: brightness(3);
  }
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

.menu-button:hover {
  color: #eee;
}

.menu-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transition: background-color 0.05s;
}
</style>
