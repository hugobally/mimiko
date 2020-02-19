<template>
  <div class="player-container">
    <div class="track-title-container noselect" @click="focus(knot)">
      <div class="track-title-text">
        {{ trackTitleStr }}
      </div>
    </div>
    <div class="action-button-group">
      <div class="button-wrapper" @click="addOrLike">
        <img
          class="add-button"
          v-if="isSourceKnot || editMode"
          src="@/assets/svg/add-icon.svg"
          alt="add-track-icon"
        />
        <img
          class="like-button"
          v-else-if="isLiked"
          src="@/assets/svg/heart-icon-full.svg"
          alt="full-liked-icon"
        />
        <img
          class="like-button"
          v-else
          src="@/assets/svg/heart-icon-empty.svg"
          alt="no-liked-icon"
        />
      </div>
      <div
        class="button-wrapper"
        v-if="!isSourceKnot && !readOnly"
        @click="dislike"
      >
        <img
          class="dislike-button"
          src="@/assets/svg/cross-icon.svg"
          alt="remove-track-icon"
        />
      </div>
    </div>
    <div class="playback-group">
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
        this.$store.dispatch('player/loadSdk')
      }
      if (this.$store.state.player.likedPlaylist.id === null) {
        this.$store.dispatch('player/loadLikedPlaylist')
      }

      window.addEventListener('keyup', e => {
        if (e.code === 'Space' && this.$route.hash === '') this.play()
      })
    } catch (error) {
      console.log(error)
    }
  },
  computed: {
    ...mapState('player', ['sdk', 'track', 'knot', 'status', 'likedPlaylist']),
    ...mapState('map', ['readOnly']),
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
    ...mapActions('map', ['createKnotsWithReco']),
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
    addOrLike() {
      if (this.editMode) return this.add()

      return this.like()
    },
    add() {
      if (!this.track) return
      if (this.isSourceKnot && !this.editMode) return this.like()
      const hash = this.$route.hash === '#add' ? '' : '#add'
      this.switchHash(hash)
    },
    // TODO Factorize to shared lib
    switchHash(hash) {
      this.$router.replace({
        path: this.$route.path,
        query: this.$route.query,
        hash: hash,
      })
    },
    async like() {
      if (!this.track) return

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
          const numNewKnots = this.likeCount < 1 && !this.isSourceKnot ? 2 : 1
          await this.createKnotsWithReco({
            sourceId: this.knot,
            number: numNewKnots,
          })
        }
        if (!this.isSourceKnot || this.readOnly) {
          console.log(this.likedPlaylist)
          if (!this.likedPlaylist.id) {
            await this.$store.dispatch('player/createLikedPlaylist')
          }
          await this.$store.dispatch('player/addToLikedPlaylist', this.track.id)
        }
      } catch (error) {
        console.log(error)
      }
    },
    async dislike() {
      if (!this.knot) return

      this.blockDislike = true
      this.$store.dispatch('map/deleteKnot', this.knot)
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
    },
  },
  async destroyed() {
    try {
      await this.$store.commit('player/DISCONNECT_SDK')
    } catch (error) {
      console.log(error)
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

.button-wrapper {
  width: 100%;
  min-width: 64px;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
}

.button-wrapper:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.like-button,
.add-button,
.playback-button,
.dislike-button {
  opacity: 0.8;
}

.like-button,
.add-button {
  width: 40px;
  height: 40px;
}

.dislike-button {
  width: 30px;
  height: 30px;
}

.playback-button {
  width: 30px;
  height: 30px;
}

.action-button-group {
  flex: initial;
  min-width: 128px;
  height: 64px;

  display: flex;
  justify-content: space-around;

  background-color: rgba(255, 255, 255, 0.01);
}

@media (min-width: 800px) {
  .action-button-group {
    width: 180px;
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

  background-color: rgba(255, 255, 255, 0.11);

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
  // padding: 0px 20px;

  background-color: rgba(255, 255, 255, 0.11);
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
  background-color: rgba(255, 255, 255, 0.2);
}

.filler {
  width: 30vw;
  min-width: 0px;
  flex: 1;
  background-color: rgba(255, 255, 255, 0.06);
}
</style>
