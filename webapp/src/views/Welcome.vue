<template>
  <div class="welcome-inherited-container">
    <div class="background-fill"></div>
    <div class="welcome-container">
      <h1 class="welcome-header">Welcome</h1>
      <LoginButton class="login-button">
        <span>Login with Spotify</span>
      </LoginButton>
    </div>
  </div>
</template>

<script>
import LoginButton from '@/components/utils/LoginButton'
export default {
  components: {
    LoginButton,
  },
}
</script>

<style lang="scss" scoped>
.welcome-inherited-container {
  position: relative;
  padding-top: 64px;

  display: flex;
  justify-content: center;
  align-items: center;
  background-color: $bg-primary;
}

.welcome-container {
  position: absolute;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.logo-big {
  width: 100px;
  height: 100px;
  opacity: 0.9;
}

@media (min-width: 601px) {
  .welcome-container {
    width: 600px;
    padding: 50px 100px;
  }
}

@media (max-width: 600px) {
  .welcome-container {
    margin: 0px 50px;
    padding: 20px;
  }
}

.hero-logo {
}

.welcome-header {
  margin: 30px 0px;
  background-color: $bg-primary;
  border: solid 1px #121212;
  padding: 20px;
}

.info-message {
  color: $bg-primary;
}

.login-button {
  margin-bottom: 40px;
}

.login-button:hover {
  background-color: $bg-primary;
}

.background-fill {
  position: fixed;
  left: 0px;
  width: 50%;
  height: 100%;
  background-color: $black;
}
</style>
