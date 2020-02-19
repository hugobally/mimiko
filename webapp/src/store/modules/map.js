import Vue from 'vue'

import * as gql from '@/api/graphql'
import * as spotify from '@/api/spotify'

function initialState() {
  return {
    id: '',
    meta: {
      title: '',
      author: {
        id: '',
        username: '',
      },
    },

    load: 0,
    freshCreated: false,

    readOnly: true,
    editMode: false,

    knots: {},
    links: {},

    hovered: null,
    focused: null,

    linkColors: {
      current: 0,
      values: ['#a8e6cf', '#dcedc1', '#ffd3b6', '#ffaaa5', '#ff8b94'],
    },
  }
}

export default {
  namespaced: true,
  state: initialState,
  mutations: {
    MAP_SET_ID(state, id) {
      state.id = id
    },
    MAP_SET_META(state, map) {
      state.meta.author = map.author
      state.meta.title = map.title
    },
    MAP_SET_READONLY(state, value) {
      state.readOnly = value
    },
    MAP_SET_LOAD(state, val) {
      state.load = val
    },
    MAP_SET_FRESH_CREATED(state, val) {
      state.freshCreated = val
    },
    MAP_RESET(state) {
      Object.assign(state, initialState())
    },
    MAP_ADD_KNOTS(state, knots) {
      for (const knot of knots) {
        Vue.set(state.knots, knot.id, {
          track: knot.track || { id: knot.trackId },
          x: knot.x || 0,
          y: knot.y || 0,
          level: knot.level,
          parent: knot.parent || null,
          children: knot.children || [],
          visited: knot.visited || false,
        })

        if (knot.children && knot.level === 1) {
          const colors = state.linkColors
          state.knots[knot.id].color = colors.values[colors.current]
          colors.current += 1
          if (colors.current === colors.values.length) colors.current = 0
        }
      }
    },
    MAP_ADD_LINKS(state, links) {
      for (const link of links) {
        Vue.set(state.links, link.id, {
          source: link.source,
          target: link.target,
          auto: link.auto,
        })
      }
    },
    SET_EDIT_MODE(state, value) {
      state.editMode = value
    },

    KNOT_SET_TRACK(state, { track, knots }) {
      if (!knots) return

      for (const id of knots) {
        const knot = state.knots[id]
        knot.track = { ...knot.track, ...track }
      }
    },
    KNOT_ADD_CHILDREN(state, { id, children }) {
      for (const child of children) {
        state.knots[id].children.push(child)
      }
    },
    KNOT_REMOVE_CHILDREN(state, { id, childrenToRemove }) {
      const newChildren = state.knots[id].children.filter(
        id => !childrenToRemove.includes(id),
      )
      state.knots[id].children = newChildren
    },
    KNOT_SET_VISITED(state, id) {
      state.knots[id].visited = true
    },
    KNOTS_SET_POS(state, newKnots) {
      for (const v of newKnots) {
        const knot = state.knots[v.id] || {}
        knot.x = v.x
        knot.y = v.y
      }
    },
    KNOTS_DELETE(state, ids) {
      for (const id of ids) {
        Vue.delete(state.knots, id)
      }
    },

    LINKS_SET_SRC(state, links) {
      for (const link of links) {
        state.links[link.key].target = link.val.target
      }
    },
    LINKS_DELETE(state, ids) {
      for (const id of ids) {
        Vue.delete(state.links, id)
      }
    },

    SET_HOVERED(state, id) {
      state.hovered = id
    },
    SET_FOCUSED(state, id) {
      state.focused = id
    },
  },
  actions: {
    // Get map from backend and layout each level progressively
    async fetchMap({ commit, dispatch, state, rootState }, id) {
      const map = await gql.map(id)

      commit('MAP_SET_ID', id)
      commit('MAP_SET_META', map)

      commit('MAP_SET_READONLY', map.author.id !== rootState.auth.user.id)
      commit('MAP_SET_LOAD', 1)

      let level = 0
      let current = map.knots.filter(knot => knot.level === level)

      while (current.length > 0) {
        // Set parent and children for current level
        current = current.map(knot => {
          const lk = map.links.find(link => link.target === knot.id)
          knot.parent = lk ? lk.source : null
          knot.children = []
          for (const link of map.links) {
            if (link.source === knot.id) knot.children.push(link.target)
          }

          return knot
        })

        // Deploy the level
        const newLinks = map.links.filter(link =>
          current.find(knot => knot.id === link.target),
        )

        dispatch('addKnots', current)
        dispatch('addLinks', newLinks)

        // Setup next level
        level += 1

        const next = map.knots.filter(knot => knot.level === level)
        const slots = []

        // Setup possible slots for the next level
        const radius = level * 300
        const items = level === 1 ? next.length : 256
        // let items = next.length * 2 * Math.max(1, Math.round(level / 2))
        // if (items < 16) items = 16

        for (let i = 0; i < items; i++) {
          slots.push({
            x: radius * Math.cos((2 * Math.PI * i) / items),
            y: radius * Math.sin((2 * Math.PI * i) / items),
          })
        }

        // Push and position children for each parent
        for (const parent of current) {
          for (const childId of parent.children) {
            const childKnot = next.find(knot => knot.id === childId)

            const parentX = state.knots[parent.id].x
            const parentY = state.knots[parent.id].y
            const closest = { delta: null, coord: {} }
            for (const slot of slots) {
              const dx = parentX - slot.x
              const dy = parentY - slot.y
              const delta = Math.pow(dx, 2) + Math.pow(dy, 2)
              if (closest.delta === null || delta < closest.delta) {
                closest.delta = delta
                closest.coord = slot
                closest.index = slots.indexOf(slot)
              }
            }

            childKnot.x = closest.coord.x
            childKnot.y = closest.coord.y

            slots.splice(closest.index, 1)
          }
        }

        current = next
      }
      dispatch('force/initForceLayout', null, { root: true })
    },

    // Populate track data from spotify API
    async populate({ commit, state, dispatch }) {
      let ac = { count: 0, tracks: {} }
      for (const key in state.knots) {
        const id = state.knots[key].track.id
        if (ac.tracks[id]) {
          ac.tracks[id].push(key)
        } else {
          ac.tracks[id] = [key]
        }
        ac.count++
        if (ac.count === 50) {
          await dispatch('setTracksData', ac.tracks)
          ac = { count: 0, tracks: {} }
        }
      }
      if (ac.count !== 0) await dispatch('setTracksData', ac.tracks)
    },
    async setTracksData({ commit, state }, input) {
      const trackIds = Object.keys(input).join()
      const parsedTracks = await spotify.getTracks(trackIds)

      for (const track of parsedTracks) {
        commit('KNOT_SET_TRACK', {
          track: track,
          knots: input[track.id],
        })
      }
    },

    // Create new knots
    async createKnots(
      { commit, state, dispatch },
      { input, sourceId, visited },
    ) {
      let r = await gql.createKnots(
        state.id,
        Object.keys(input),
        state.knots[sourceId].level + 1,
        visited,
      )
      if (r.errors) {
        console.log(r.errors)
      }

      const newKnots = r.knots.map(v => {
        return {
          ...v,
          ...input[v.trackId],
          ...{ parent: sourceId, children: [] },
        }
      })

      const childrenIds = r.knots.map(v => v.id)
      commit('KNOT_ADD_CHILDREN', { id: sourceId, children: childrenIds })

      r = await gql.createLinks(state.id, sourceId, childrenIds)
      if (r.errors) {
        console.log(r.errors)
      }

      dispatch('addKnots', newKnots)
      dispatch('addLinks', r.links)

      commit('force/RESTART_SIM', null, { root: true })

      commit('player/PLAYQUEUE_RESET', null, { root: true })
      dispatch('player/bufferFindNext', null, { root: true })
    },
    // TODO Rework => not specific to creating with recommendation
    async createKnotsWithReco(
      { state, dispatch },
      { sourceId, newTracks, number, autoplay, visited },
    ) {
      const knot = state.knots[sourceId]

      if (!newTracks) {
        try {
          const seeds = [knot.track.id]
          let current = knot
          for (let i = 0; i < 4; i++) {
            if (!current.parent) break

            current = state.knots[current.parent]
            seeds.push(current.track.id)
          }
          newTracks = await spotify.recoFromTrack(seeds, number)
        } catch (error) {
          console.log(error)
          return
        }
      }

      let newX,
        newY = 0

      const parent = state.knots[knot.parent]
      if (!parent) {
        const randXSide = Math.random() > 0.5 ? -1 : 1
        const randYSide = Math.random() > 0.5 ? -1 : 1
        newX = Math.random() * 10 * randXSide
        newY = Math.random() * 10 * randYSide
      } else {
        newX = knot.x + (knot.x - parent.x) * 0.3 + (knot.x > 0 ? 1 : -1) * 10
        newY = knot.y + (knot.y - parent.y) * 0.3 + (knot.y > 0 ? 1 : -1) * 10
      }

      const createInput = newTracks.reduce((acc, track) => {
        acc[track.id] = { track, x: newX, y: newY }
        return acc
      }, {})

      await dispatch('createKnots', {
        input: createInput,
        sourceId,
        visited: autoplay || visited ? true : false,
      })
    },

    //
    async deleteKnot({ commit, dispatch, state, rootState }, knotId) {
      // TODO keep a counter of knots length
      if (Object.keys(state.knots).length < 2) return

      const rootKnot = state.knots[knotId]
      if (rootKnot.level === 0) return

      const knotsToDelete = []
      const linksToDelete = []

      const links = Object.entries(state.links)

      // TODO generic DFS function (shared with autoplay, etc..)
      const [parentLinkId, parentLink] = links.find(
        ([k, v]) => v.target === knotId,
      )
      // const dfs = links.filter(([k, v]) => v.source === knotId)
      const dfs = [parentLinkId]
      while (dfs.length > 0) {
        const current = dfs[dfs.length - 1]

        linksToDelete.push(current)
        dfs.pop()

        const target = state.links[current].target
        knotsToDelete.push(target)
        for (const [k, _] of links.filter(([k, v]) => v.source === target)) {
          dfs.push(k)
        }
      }

      try {
        const linkCount = await gql.deleteLinks(state.id, linksToDelete)
        if (linkCount !== linksToDelete.length) {
          // TODO flash error -- set error flag that prevents any action
          // ask to reload the page
          console.log('error with remote link deletion')
          return
        }
        const knotCount = await gql.deleteKnots(state.id, knotsToDelete)
        if (knotCount !== knotsToDelete.length) {
          // TODO see above
          console.log('error with remote knot deletion')
        }

        await rootState.player.sdk.nextTrack().catch(() => {})
        commit('player/RESET_PLAYER', null, { root: true })

        dispatch('removeLinks', linksToDelete)
        dispatch('removeKnots', knotsToDelete)
        commit('KNOT_REMOVE_CHILDREN', {
          id: parentLink.source,
          childrenToRemove: knotId,
        })
      } catch (error) {
        console.log(error)
      }
    },

    // Wrapper around adding new knots so that the D3 simulation is synchronized
    addKnots({ commit }, knots) {
      commit('MAP_ADD_KNOTS', knots)
      commit('force/ADD_KNOTS', knots, { root: true })
    },
    removeKnots({ commit }, knots) {
      commit('KNOTS_DELETE', knots)
      commit('force/KNOTS_DELETE', knots, { root: true })
    },

    addLinks({ commit }, links) {
      commit('MAP_ADD_LINKS', links)
    },
    removeLinks({ commit }, links) {
      commit('LINKS_DELETE', links)
    },

    async focus({ commit, rootState }, target) {
      commit('SET_FOCUSED', null)
      await new Promise(r => setTimeout(r, 100))
      commit('SET_FOCUSED', target)
    },

    resetMap({ dispatch, commit }) {
      commit('player/RESET_PLAYER', null, { root: true })
      dispatch('force/resetForce', null, { root: true })
      commit('MAP_RESET')
    },
  },
}
