<template>
<!--  <div class="creator-container disable-scrollbar">-->
<!--    <div class="form-container">-->
<!--      <SearchTrack label="Choose a song to start from"/>-->
<!--      </div>-->
<!--  </div>-->
  <div class="welcome-text-centerer">
    <div class="welcome-text-container">
      <img
          width="100"
          height="100"
          src="@/assets/svg/favicon.svg"
          alt="mimiko-logo"
          class="mimiko-logo"
      />
      <div>
        <div class="welcome-text">
          <h1 class="welcome-text-title">
            Welcome to mimiko !
          </h1>
          <p class="welcome-text-content">
            Discover new songs by starting from a song you like, and create a map of new music !
          </p>
          <p class="welcome-text-content">
            For any issues or question, you can find <a href="https://github.com/hugobally/mimiko/issues">the project on github</a> or <a href="mailto:bally.hugo@gmail.com">send me an email</a>.
          </p>
        </div>
        <SearchTrack class="search-track-container"/>
      </div>
    </div>
  </div>
</template>

<script>
import SearchTrack from "@/components/SearchTrack";

export default {
  components: {
    SearchTrack,
  },
}
</script>

<style lang="scss" scoped>
.welcome-text-centerer {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-text-container {
  display: flex;
  align-items: center;
  text-align: left;
}

.welcome-text {
  margin-bottom: 40px;
}

.welcome-text, .search-track-container {
  margin-left: 30px;
}

.welcome-text > p {
  margin-top: 20px;
}

.welcome-text-content {
  max-width: 400px;
}

.mimiko-logo {
  border-radius: 50px;
}

.start-button {
  border-radius: 10px;
  background: $bg-secondary;
  color: $text-primary;
  border: none;
  cursor: pointer;
  text-decoration: none;
  font-size: 20px;
}

</style>
