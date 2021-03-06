import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '@/views/Home'

import store from '@/store'
import axios from 'axios'

Vue.use(VueRouter)

const routes = [
  {
    path: '/home',
    name: 'home',
    component: Home,
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: () =>
      import(/* webpackChunkName: "welcome" */ '@/views/Welcome'),
  },
  {
    path: '/map/:id',
    name: 'map',
    component: () => import(/* webpackChunkName: "map" */ '@/views/Map'),
  },
  {
    path: '/callback/spotify',
    beforeEnter: async (to, from, next) => {
      const pathBeforeLogin = localStorage.getItem('path_before_login')

      const code = to.query.code
      try {
        await axios.post(process.env.VUE_APP_BACKEND_URL + '/login', code, {
          withCredentials: true,
        })
        await store.dispatch('auth/whoami')
      } catch (error) {
        store.dispatch('pushFlashQueue', {
          content: 'Login failed',
          type: 'error',
        })
      }

      next(pathBeforeLogin || '/')
    },
  },
  {
    path: '*',
    name: 'catchall',
    redirect: '/home',
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

router.beforeEach(async (to, from, next) => {
  if (to.path.includes('callback')) {
    next()
  } else {
    if (
      store.state.auth.user.logged === false &&
      !store.state.auth.relogAttempted
    ) {
      try {
        await store.dispatch('auth/whoami')
      } catch (error) {
        // TODO
      }
    }

    if (!store.state.auth.user.logged && to.path !== '/welcome') {
      next('/welcome')
    } else if (store.state.auth.user.logged && to.path === '/welcome') {
      next('/home')
    } else {
      next()
    }
  }
})

export default router
