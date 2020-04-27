import * as gql from '@/api/graphql'

export default async function({ commit, dispatch, state, rootState }, knotId) {
  // TODO keep a store getter of knots array length
  if (Object.keys(state.knots).length < 2) return

  const rootKnot = state.knots[knotId]
  if (rootKnot.level === 0) return

  const knotsToDelete = []
  const linksToDelete = []

  const linkIds = Object.keys(state.links)

  const parentLinkId = linkIds.find(id => state.links[id].target === knotId)

  if (parentLinkId) {
    // TODO generic DFS function to lib
    const dfs = [parentLinkId]
    while (dfs.length > 0) {
      const current = dfs[dfs.length - 1]

      linksToDelete.push(current)
      dfs.pop()

      const target = state.links[current].target

      knotsToDelete.push(target)

      for (const id of linkIds.filter(
        id => state.links[id].source === target,
      )) {
        dfs.push(id)
      }
    }
  }

  try {
    // TODO Handle desynchronization errors
    await rootState.player.sdk.nextTrack().catch(() => {})
    commit('player/RESET_PLAYER', null, { root: true })

    await gql.deleteLinks(state.id, linksToDelete)
    await gql.deleteKnots(state.id, knotsToDelete)

    dispatch('removeLinks', linksToDelete)
    dispatch('removeKnots', knotsToDelete)

    commit('KNOT_REMOVE_CHILDREN', {
      id: state.links[parentLinkId].source,
      childrenToRemove: knotId,
    })
  } catch (error) {
    //
  }
}
