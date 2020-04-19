<template>
  <a class="login-button link" :href="url" @click="storeCurrentUrl">
    <img
      class="spotify-logo"
      src="@/assets/svg/spotify-logo.svg"
      alt="spotify-logo"
    />
    <slot></slot>
  </a>
</template>

<script>
export default {
  data() {
    return {
      url: process.env.VUE_APP_BACKEND_URL + '/login',
    }
  },
  methods: {
    storeCurrentUrl() {
      localStorage.setItem('path_before_login', this.$route.path)
    },
  },
}
</script>

<style lang="scss" scoped>
.login-button {
  display: flex;
  align-items: center;
  justify-content: center;

background-color: $bg-primary;
  color: $text-primary;
  border: solid 1px black;

  padding: 12px;
}

.spotify-logo {
  width: 20px;
  height: 20px;
  margin-right: 5px;
}
</style>
