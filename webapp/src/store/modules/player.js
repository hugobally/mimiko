import {
  getToken,
  playTrack,
  recoFromTrack,
  findPlaylist,
  createPlaylist,
  getPlaylistTracks,
  addTrackToPlaylist,
} from '@/api/spotify'
import { updateKnot } from '@/api/graphql'

function initialBuffer() {
  return {
    previous: null,
    current: null,
    next: null,
  }
}

function initialPlayer() {
  return {
    track: null,
    knot: null,

    position: 0,
    duration: 0,

    buffer: initialBuffer(),
    bufferBlock: false,

    playQueue: [],

    status: 'IDLE',
  }
}

function initialSdk() {
  return {
    sdk: null,
    deviceId: '',
    likedPlaylist: { id: null, tracks: [] },
  }
}

function initialState() {
  return {
    ...initialSdk(),
    ...initialPlayer(),
  }
}

export default {
  namespaced: true,
  state: initialState,
  mutations: {
    SET_SDK(state, sdk) {
      state.sdk = sdk
    },
    SET_DEVICE_ID(state, id) {
      state.deviceId = id
    },

    SET_TRACK(state, track) {
      state.track = track
    },
    SET_TIMESTAMP(state, playerState) {
      if (state.track) {
        state.position = playerState.position
        state.duration = playerState.duration
      }
    },

    SET_KNOT(state, knot) {
      state.knot = knot
    },

    BUFFER_ROTATE(state) {
      state.buffer.previous = state.buffer.current
      state.buffer.current = state.buffer.next
      state.buffer.next = null
    },
    BUFFER_RESET(state, item = null) {
      state.buffer = initialBuffer()
      if (item) state.buffer.current = item
    },
    BUFFER_SET_NEXT(state, item) {
      state.buffer.next = item
    },
    BUFFER_UPDATE_CURRENT(state, item) {
      state.buffer.current = item
    },
    BUFFER_BLOCK(state) {
      state.bufferBlock = true
    },
    BUFFER_UNBLOCK(state) {
      state.bufferBlock = false
    },

    PLAYQUEUE_PUSH(state, item) {
      state.playQueue.push(item)
    },
    PLAYQUEUE_UNSHIFT(state, item) {
      state.playQueue.unshift(item)
    },
    PLAYQUEUE_SHIFT(state) {
      state.playQueue.shift()
    },
    PLAYQUEUE_RESET(state) {
      state.playQueue = []
    },

    STATUS_PLAYING(state) {
      state.status = 'PLAYING'
    },
    STATUS_PAUSED(state) {
      state.status = 'PAUSED'
    },
    STATUS_IDLE(state) {
      state.status = 'IDLE'
    },

    LIKED_PLAYLIST_INIT(state, { id, tracks }) {
      state.likedPlaylist = { id, tracks }
    },
    LIKED_PLAYLIST_PUSH(state, id) {
      state.likedPlaylist.tracks.push(id)
    },

    RESET_PLAYER(state) {
      Object.assign(state, {
        ...initialState(),
        ...{
          sdk: state.sdk,
          deviceId: state.deviceId,
          likedPlaylist: state.likedPlaylist,
        },
      })
    },
    DISCONNECT_SDK(state) {
      state.sdk.disconnect()
      state.sdk = null
    },
  },
  actions: {
    loadSdk({ state, commit, dispatch }) {
      if (window.onSpotifyWebPlaybackSDKReady) return

      const spotifyPlaybackSDK = document.createElement('script')
      spotifyPlaybackSDK.setAttribute(
        'src',
        'https://sdk.scdn.co/spotify-player.js',
      )
      spotifyPlaybackSDK.async = true

      document.body.appendChild(spotifyPlaybackSDK)

      window.onSpotifyWebPlaybackSDKReady = () => {
        // eslint-disable-next-line no-undef
        const player = new Spotify.Player({
          name: 'Mimiko WebApp',
          getOAuthToken: async callback => {
            try {
              const token = await getToken()
              callback(token.access)
            } catch (error) {
              console.log('SDK authtoken error : ', error)
              callback('')
            }
          },
        })

        player.addListener('player_state_changed', playerState => {
          console.log(playerState)
          if (!playerState) {
            // TODO Resetting player is buggy
            // commit('RESET_PLAYER')
            return
          }

          commit('SET_TIMESTAMP', playerState)

          if (playerState.paused && state.status === 'PLAYING') {
            commit('STATUS_PAUSED')
          }
          if (!playerState.paused && state.status !== 'PLAYING') {
            commit('STATUS_PLAYING')
          }

          dispatch('bufferSync', playerState)
        })

        player.addListener('ready', ({ device_id }) => {
          commit('SET_DEVICE_ID', device_id)
        })
        player.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID has gone offline', device_id)
        })

        player.connect()
        commit('SET_SDK', player)
      }
    },

    async loadLikedPlaylist({ commit }) {
      try {
        const id = await findPlaylist()
        if (!id) return

        const tracks = await getPlaylistTracks(id)
        commit('LIKED_PLAYLIST_INIT', { id: id, tracks: tracks })
      } catch (error) {
        console.log(error)
      }
    },
    async createLikedPlaylist({ commit }) {
      try {
        const id = await createPlaylist()
        commit('LIKED_PLAYLIST_INIT', { id: id, tracks: [] })
      } catch (error) {
        console.log(error)
      }
    },
    async addToLikedPlaylist({ state, commit }, trackId) {
      if (!state.likedPlaylist.id) return
      if (state.likedPlaylist.tracks.includes(trackId)) return

      await addTrackToPlaylist(state.likedPlaylist.id, trackId)
      commit('LIKED_PLAYLIST_PUSH', trackId)
    },

    playKnot({ commit, dispatch }, { track, knot }) {
      commit('PLAYQUEUE_RESET')
      commit('PLAYQUEUE_PUSH', { track: track, knot: knot })
      dispatch('bufferPush')
    },

    async bufferPush({ state, commit, dispatch }) {
      if (state.bufferBlock) return
      if (state.playQueue.length === 0) return

      commit('BUFFER_BLOCK')

      const newCurrent = state.playQueue[0]
      commit('PLAYQUEUE_SHIFT')

      commit('BUFFER_RESET', newCurrent)

      try {
        await dispatch('bufferPlay')
        await dispatch('bufferFindNext')
      } catch (error) {
        commit('STATUS_PAUSED')
      } finally {
        commit('BUFFER_UNBLOCK')
      }
    },
    async bufferSync({ state, rootState, commit, dispatch }, remote) {
      if (state.bufferBlock) return

      const tracks = remote.track_window

      const remoteCurrent = tracks.current_track

      // TODO DISABLED -- Resetting the player is buggy
      // If a track was not played from local player, reset local player
      //
      // const bufferCurrent = state.buffer.current
      // if (bufferCurrent && remoteCurrent.id !== bufferCurrent.track.id) {
      //   if (remoteCurrent.name !== bufferCurrent.track.title) {
      //     const bufferPrevious = state.buffer.previous
      //     if (!bufferPrevious) commit('RESET_PLAYER')
      //     if (
      //       bufferPrevious &&
      //       remoteCurrent.name !== bufferPrevious.track.title
      //     ) {
      //       commit('RESET_PLAYER')
      //     }
      //   }
      // }

      const remotePrevious = tracks.previous_tracks[0]

      if (
        remote.position === 0 &&
        remote.paused &&
        remotePrevious &&
        remotePrevious.id === remoteCurrent.id
      ) {
        commit('BUFFER_BLOCK')

        commit('BUFFER_ROTATE')

        const newCurrent = state.buffer.current
        if (!newCurrent) return commit('BUFFER_UNBLOCK')

        if (!newCurrent.knot) {
          const parentId = state.buffer.previous.knot
          const params = {
            sourceId: parentId,
            newTracks: [newCurrent.track],
          }

          await dispatch('map/createKnotsWithReco', params, { root: true })

          const knots = rootState.map.knots
          for (const childId of knots[parentId].children) {
            if (knots[childId].track.id === newCurrent.track.id) {
              commit('BUFFER_UPDATE_CURRENT', {
                ...newCurrent,
                ...{ knot: childId },
              })
              break
            }
          }
        }

        await dispatch('bufferPlay')

        dispatch('bufferFindNext')

        await new Promise(r => setTimeout(r, 1000))

        commit('map/SET_FOCUSED', state.buffer.current.knot, { root: true })
        commit('BUFFER_UNBLOCK')
      }
    },
    async bufferFindNext({ state, commit, rootState }) {
      if (!state.buffer.current || rootState.map.editMode) return

      if (state.playQueue.length === 0) {
        const knots = rootState.map.knots
        const current = state.buffer.current.knot

        if (knots[current].children.length > 0) {
          const stack = [current]
          let last = null
          while (stack.length > 0) {
            last = stack[stack.length - 1]
            commit('PLAYQUEUE_PUSH', { track: knots[last].track, knot: last })
            stack.pop()
            if (knots[last].children.length > 0) {
              for (const child of knots[last].children) {
                stack.push(child)
              }
            }
          }
          commit('PLAYQUEUE_SHIFT')
        } else if (!rootState.map.readOnly) {
          let newTrack = null
          try {
            const seeds = [knots[current].track.id]
            let step = knots[current]
            for (let i = 0; i < 4; i++) {
              if (!step.parent) break

              step = knots[step.parent]
              seeds.push(step.track.id)
            }
            const recos = await recoFromTrack(seeds, 1)
            newTrack = recos[0]
          } catch (error) {
            console.log(error)
          }
          if (newTrack) {
            commit('PLAYQUEUE_PUSH', { track: newTrack, knot: null })
          }
        }
      }

      const newBufferItem = state.playQueue[0]
      if (newBufferItem) {
        commit('PLAYQUEUE_SHIFT')
        commit('BUFFER_SET_NEXT', newBufferItem)
      }
    },
    async bufferPlay({ state, rootState, commit }) {
      const current = state.buffer.current

      if (
        !rootState.map.knots[current.knot].visited &&
        !rootState.map.editMode &&
        !rootState.map.readOnly
      ) {
        try {
          await updateKnot(current.knot, { visited: true })
          commit('map/KNOT_SET_VISITED', current.knot, { root: true })
        } catch (error) {
          console.log(error)
        }
      }
      commit('SET_TRACK', current.track)
      commit('SET_KNOT', current.knot)

      await playTrack([current.track.id], state.deviceId)
    },
  },
}
