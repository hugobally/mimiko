import axios from 'axios'
import store from '@/store'

const API_BASE_URL = 'https://api.spotify.com/v1/'
const LIKED_PLAYLIST_NAME = 'Liked from mimiko'

// PERFORM REQUEST

export async function getToken() {
  let retries = 0
  let token = null

  while (!token && retries < 10) {
    await store.dispatch('auth/refreshToken').catch(() => {})
    token = store.getters['auth/token']('spotify')

    if (!token) {
      retries++
      await new Promise(r => setTimeout(r, 1000))
    }
  }

  return token
}

async function performGetRequest(endpoint, params) {
  const token = await getToken()
  const response = await axios.get(API_BASE_URL + endpoint, {
    headers: {
      Authorization: 'Bearer ' + token.access,
    },
    params: params,
  })
  return response.data
}

async function performPostRequest(endpoint, data, method = 'POST') {
  const token = await getToken()
  const response = await axios({
    method: method,
    url: API_BASE_URL + endpoint,
    data: data,
    headers: {
      Authorization: 'Bearer ' + token.access,
    },
  })
  return response.data
}

// HELPERS

function parseTracks(tracks) {
  return tracks.map(track => {
    return {
      id: track.id,
      title: track.name,
      artist: artistNamesToString(track.artists),
      imgURL: track.album.images[1].url, // TODO There are 3 image sizes returned
      previewURL: track.preview_url,
    }
  })
}

function artistNamesToString(artists) {
  let result = ''
  artists.forEach((artist, i) => {
    if (i !== 0) result += ', '
    result += artist.name
  })
  return result
}

// REQUESTS

export async function getTracks(ids) {
  const params = {
    ids: ids,
  }
  const data = await performGetRequest('tracks', params)
  return parseTracks(data.tracks)
}

export async function searchForTrack(searchString) {
  const params = {
    q: searchString,
    type: 'track',
    limit: 1,
    market: 'from_token',
  }
  const data = await performGetRequest('search', params)
  return parseTracks([data.tracks.items[0]])
}

export async function recoFromTrack(seeds, number) {
  const params = {
    limit: number,
    seed_tracks: seeds.join(),
    market: 'from_token',
  }
  const data = await performGetRequest('recommendations', params)
  return parseTracks(data.tracks)
}

//TODO Device id is always the web browser, support playing on other devices ?
export async function playTrack(tracks, deviceId) {
  const data = {
    uris: tracks.map(id => `spotify:track:${id}`),
  }
  await performPostRequest(
    `me/player/play${deviceId ? '?device_id=' + deviceId : ''}`,
    data,
    'PUT',
  )
}

export async function findPlaylist() {
  let playlist = null

  const params = {
    limit: 20,
    offset: 0,
  }

  let total = params.limit + 1
  while (!playlist && total > params.offset + params.limit) {
    const data = await performGetRequest('me/playlists', params)
    playlist = data.items.find(
      playlist => playlist.name === LIKED_PLAYLIST_NAME,
    )

    total = data.total
    params.offset += params.limit
  }

  return playlist ? playlist.id : null
}

export async function createPlaylist() {
  const params = {
    name: LIKED_PLAYLIST_NAME,
    public: false,
  }
  const token = await getToken()

  console.log(token)
  const data = await performPostRequest(
    `users/${token.userId}/playlists`,
    params,
  )
  console.log(data)
  return data.id
}

export async function getPlaylistTracks(playlistId) {
  const params = {
    fields: 'items.track.id,total',
    limit: 100,
    offset: 0,
    market: 'from_token',
  }

  let total = params.limit + 1
  const tracks = []

  while (tracks.length !== total && total > params.offset + params.limit) {
    const data = await performGetRequest(
      `playlists/${playlistId}/tracks`,
      params,
    )
    for (const trackId of data.items.map(item => item.track.id)) {
      tracks.push(trackId)
    }
    params.offset += params.limit
    total = data.total
  }
  return tracks
}

export async function addTrackToPlaylist(playlistId, trackUri) {
  const params = {
    uris: [`spotify:track:${trackUri}`],
    position: 0,
  }
  await performPostRequest(`playlists/${playlistId}/tracks`, params)
}
