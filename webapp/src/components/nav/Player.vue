<template>
  <div class="player-container">
    <div class="track-title-container noselect" @click="focus(knot)">
      <div class="track-title-text">
        {{ trackTitleStr }}
      </div>
    </div>
    <div class="action-button-group">
      <div class="button-wrapper like-button-group" @click="like">
        <img
          class="like-button-icon"
          v-if="isLiked"
          src="@/assets/svg/heart-icon-full.svg"
          alt="full-liked-icon"
        />
        <img
          class="like-button-icon"
          v-else
          src="@/assets/svg/heart-icon-empty.svg"
          alt="no-liked-icon"
        />
      </div>
      <div v-if="!readOnly" class="add-button-wrapper" @click="add">
        <img
          class="add-button"
          src="@/assets/svg/add-icon.svg"
          alt="add-track-icon"
        />
      </div>
      <div class="button-wrapper" v-if="!readOnly" @click="dislike">
        <img
          class="dislike-button"
          src="@/assets/svg/cross-icon.svg"
          alt="remove-track-icon"
        />
      </div>
    </div>
    <div class="playback-group" v-if="!previewMode">
      <div class="button-wrapper" @click="play">
        <img
          class="playback-button"
          v-if="status !== 'PLAYING'"
          src="@/assets/svg/play-icon.svg"
          alt="play-icon"
        />
        <img
          class="playback-button"
          v-else
          src="@/assets/svg/pause-icon.svg"
          alt="pause-icon"
        />
      </div>
      <PlayBar />
    </div>
    <div class="playback-group center" v-else>
      <audio controls autoplay :src="track && track.previewURL"></audio>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import PlayBar from '@/components/nav/player/PlayBar'

export default {
  components: {
    PlayBar,
  },
  data() {
    return {
      debounceLike: {
        callbackId: null,
        counter: 0,
      },
      blockDislike: false,
    }
  },
  async mounted() {
    try {
      if (this.$store.state.player.sdk === null) {
        const sdkIsLoaded = this.$store.dispatch('player/loadSdk')

        await sdkIsLoaded
        if (this.$store.state.player.likedPlaylist.id === null) {
          this.$store.dispatch('player/loadLikedPlaylist')
        }
      }

      window.addEventListener('keyup', e => {
        if (e.code === 'Space' && this.$route.hash === '') this.play()
        if (e.code === 'Equal' && this.$route.hash === '') this.add()
      })
    } catch (error) {
      // TODO
    }
  },
  computed: {
    ...mapState('player', ['sdk', 'track', 'knot', 'status', 'likedPlaylist']),
    ...mapState('map', ['readOnly', 'knots']),
    previewMode() {
      return this.$store.state.player.previewMode
    },
    trackTitleStr() {
      if (!this.track) return ''

      const title = this.hardWrapText(this.track.title)
      const artist = this.hardWrapText(this.track.artist)
      return `${artist} - ${title}`
    },
    likeCount() {
      if (!this.knot) return 0

      return this.$store.state.map.knots[this.knot].children.length
    },
    isSourceKnot() {
      if (!this.knot) return false

      return this.$store.state.map.knots[this.knot].level === 0
    },
    editMode() {
      return this.$store.state.map.editMode
    },
    isLiked() {
      if (!this.track) return false

      return this.likedPlaylist.tracks.includes(this.track.id)
    },
  },
  methods: {
    ...mapActions('map', ['createKnots']),
    hardWrapText(text) {
      const maxLength = 40
      if (text && text.length > maxLength) {
        return text.substring(0, maxLength) + '..'
      } else return text
    },
    play() {
      if (!this.track) return

      if (this.status !== 'PLAYING') {
        this.sdk.resume()
        this.$store.commit('player/STATUS_PLAYING')
      } else {
        this.sdk.pause()
        this.$store.commit('player/STATUS_PAUSED')
      }
    },
    async like() {
      if (!this.track) return

      try {
        if (this.isLiked) {
          await this.$store.dispatch(
            'player/removeFromLikedPlaylist',
            this.track.id,
          )
          this.$store.dispatch('pushFlashQueue', {
            content:
              "Track removed from the Spotify playlist 'Liked from Mimiko'",
            type: 'info',
            time: 4000,
          })
          return
        }

        if (!this.likedPlaylist.id) {
          await this.$store.dispatch('player/createLikedPlaylist')
        }
        await this.$store.dispatch('player/addToLikedPlaylist', this.track.id)
        this.$store.dispatch('pushFlashQueue', {
          content: "Track added to the Spotify playlist 'Liked from Mimiko'",
          type: 'info',
          time: 4000,
        })
      } catch (error) {
        //TODO
      }
    },
    // TODO Factorize
    switchHash(hash) {
      this.$router.replace({
        path: this.$route.path,
        query: this.$route.query,
        hash: hash,
      })
    },
    async add() {
      this.debounceLike.counter += 1

      if (!this.debounceLike.callbackId) {
        this.debounceLike.callbackId = setTimeout(() => {
          this.debounceLike.counter = 0
          this.debounceLike.callbackId = null
        }, 200)
      }

      if (this.debounceLike.counter > 1) return

      // TODO Better pattern to prevent duplicate queries if response is slow and
      // the button is spammed : Promise.all on all async operations associated
      // with a click, lock further queries until promise.all is done
      try {
        if (!this.readOnly) {
          const numNewKnots = 1
          await this.createKnots({
            sourceId: this.knot,
            number: numNewKnots,
          })
          if (Object.values(this.$store.state.map.knots).length <= 5) {
            await new Promise(r => setTimeout(r, 200))
            this.$store.dispatch('map/focus', 'ALL')
          }
        }
      } catch (error) {
        // TODO
      }
    },
    async dislike() {
      if (!this.knot || this.isSourceKnot) return

      this.blockDislike = true
      this.$store.dispatch('map/deleteKnots', this.knot)
      this.sdk.pause()
      if (this.$route.hash === '#add') this.switchHash('')
      this.blockDislike = false
    },
    focus(target) {
      this.$store.dispatch('map/focus', target)
    },
  },
  watch: {
    track: function() {
      clearTimeout(this.debounceLike.callbackId)
      this.debounceLike.counter = 0

      if (this.$store.state.player.previewMode) {
        this.$store.commit('player/STATUS_PLAYING')
        if (this.track && !this.track.previewURL) {
          this.$store.dispatch('pushFlashQueue', {
            content:
              'No audio preview available for this track on Spotify Free.',
            type: 'error',
            time: 3000,
          })
        }
      }
    },
  },
  async destroyed() {
    try {
      await this.$store.commit('player/DISCONNECT_SDK')
    } catch (error) {
      // TODO
    }
  },
}
</script>

<style lang="scss" scoped>
.player-container {
  min-width: 0;
  flex: 1;

  display: flex;
  justify-content: flex-start;
}

.button-wrapper,
.add-button-wrapper {
  width: 100%;
  height: 100%;

  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
}

.like-button-icon,
.add-button,
.playback-button,
.dislike-button {
  opacity: 0.8;
}

.like-button:hover {
  transition: scale(1.3);
}

.like-button-icon {
  width: 40px;
  height: 40px;
}

.add-button {
  width: 50px;
  height: 50px;
}

.dislike-button {
  width: 35px;
  height: 35px;
}

.playback-button {
  width: 30px;
  height: 30px;
}

.action-button-group {
  flex: initial;
  width: 300px;
  height: 64px;

  display: flex;
  justify-content: space-around;
  padding: 0px 10px;

  background-color: $bg-primary;

  & > div {
    margin: 0px 10px 0px 10px;
  }
}

@media (min-width: 800px) {
  .action-button-group {
    min-width: 180px;
  }
}

.playback {
  flex: 1;
  min-width: 0;

  display: flex;
}

.playback-group {
  flex: 1;
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: flex-start;

  background-color: $bg-primary;
  border-left: 1px solid black;

  .button-wrapper {
    width: 64px;
  }
}

.track-title-container {
  flex: 1;
  width: 100%;
  height: 100%;

  display: flex;
  min-width: 64px;
  justify-content: flex-end;
  align-items: center;

  cursor: pointer;

  background-color: $bg-primary;
  border-right: solid 1px black;
}

.track-title-text {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 20px;
  padding: 20px;
  min-width: 0;
}

.track-title-container:hover {
  background-color: $bg-primary;
}

.filler {
  width: 30vw;
  min-width: 0px;
  flex: 1;
  background-color: $bg-primary;
}

.button-wrapper:hover {
  transform: scale(1.2);
}

.add-button-wrapper {
  position: relative;
  flex: 2;
  height: 125%;
  bottom: 20%;
  background-color: $black;
  border-radius: 10px 10px 0px 0px;
}

.add-button-wrapper:hover {
  background-color: $black-lighter;
  transform: translateY(-3px);
}

.add-button-wrapper:hover:active {
  background-color: $black;
  transform: translateY(3px);
}

.playback-button {
  min-width: 64px;
}

.center {
  justify-content: center;
}
</style>
