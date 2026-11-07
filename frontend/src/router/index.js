import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/translate', name: 'translate', component: () => import('../views/LiveTranslator.vue') },
    { path: '/conversation', name: 'conversation', component: () => import('../views/Conversation.vue') },
    { path: '/history', name: 'history', component: () => import('../views/History.vue') },
    { path: '/settings', name: 'settings', component: () => import('../views/Settings.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
