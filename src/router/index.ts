import { createMemoryHistory, createRouter } from 'vue-router'

import IndexView from '@/pages/index/index.vue'

const routes = [
  { path: '/', component: IndexView },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router