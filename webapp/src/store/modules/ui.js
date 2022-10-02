import {indexOf} from "core-js/internals/array-includes";

function initialGlobalUI() {
  return {
    flashQueue: [],
  }
}

function initialMapUI() {
  return {
    manualZoomQueue: [],
    zoomLevel: 1,
    selectedKnotId: null,
  }
}

function initialState() {
  return {
    ...initialGlobalUI(),
    ...initialMapUI(),
  }
}

export default {
  namespaced: true,
  state: initialState,
  mutations: {
    PUSH_FLASH_QUEUE(state, message) {
      state.flashQueue.push(message)
    },
    SHIFT_FLASH_QUEUE(state) {
      state.flashQueue.shift()
    },
    PUSH_ZOOM_QUEUE(state, diff) {
      state.manualZoomQueue.push(diff)
    },
    SHIFT_ZOOM_QUEUE(state) {
      state.manualZoomQueue.shift()
    },
    SET_ZOOM_LEVEL(state, newVal) {
      state.zoomLevel = newVal
    },
    SET_SELECTED_KNOT_ID(state, knotId) {
      state.selectedKnotId = knotId
    },
    RESET_MAP_UI(state) {
      Object.assign(state, {
        ...state,
        ...initialMapUI(),
      })
    }
  },
  actions: {
    // TODO unnecessary, use commit
    pushFlashQueue({ commit }, message) {
      commit('PUSH_FLASH_QUEUE', message)
    },
    shiftFlashQueue({ commit }) {
      commit('SHIFT_FLASH_QUEUE')
    },
  },
}
