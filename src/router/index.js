import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
      meta: { title: '登入', requiresAuth: false }
    },
    {
      path: '/',
      name: 'Dashboard',
      component: DashboardView,
      meta: { title: '儀表板', requiresAuth: true }
    },
    {
      path: '/users',
      name: 'UserManagement',
      component: () => import('../views/UserManagementView.vue'),
      meta: { title: '使用者管理', requiresAuth: true }
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token'); // 檢查 token
  
  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login' });
  } else if (to.name === 'Login' && token) {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router
