<template>
  <div class="welcome-inherited-container">
    <div class="welcome-container">
      <img class="logo-big" src="@/assets/svg/logo.svg" alt="hero-logo" />
      <h1 class="welcome-header">Welcome ! &#x1F3B8;</h1>
      <LoginButton class="login-button">
        <span>Login with Spotify</span>
      </LoginButton>
      <span class="info-message"
        >Don't have a Premium account ?<br />
        Stay tuned for Free users support !</span
      >
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

<style>
.welcome-inherited-container {
  position: relative;
  padding-top: 64px;

  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #121212;
}

.welcome-container {
  position: absolute;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  background-color: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 5px;
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

.welcome-header {
  margin: 30px 0px;
}

.info-message {
  color: rgba(255, 255, 255, 0.6);
}

.login-button {
  margin-bottom: 40px;
}

.login-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>
