export default {
  state: {
    flashQueue: [],
    manualZoomQueue: [],
  },
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
