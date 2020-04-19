<template>
  <footer>
    <div class="nav-container">
      <Menu />
      <Player v-if="logged" />
      <div class="filler" v-else></div>
      <User />
    </div>
  </footer>
</template>

<script>
import Menu from '@/components/nav/Menu'
import Player from '@/components/nav/Player'
import User from '@/components/nav/User'

export default {
  components: {
    Menu,
    Player,
    User,
  },
  computed: {
    logged() {
      return this.$store.state.auth.user.logged
    },
  },
}
</script>

<style lang="scss" scoped>
.nav-container {
  display: flex;
  height: 100%;
  background-color: $bg-primary;
  border-top: solid 1px black;
}

.filler {
  flex: 1;
  background-color: $bg-primary;
}
</style>
