import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Register.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: () => import('@/layouts/BasicLayout.vue'),
      redirect: '/consultation',
      meta: { requiresAuth: true },
      children: [
        {
          path: '/consultation',
          name: 'Consultation',
          component: () => import('@/views/consultation/Consultation.vue'),
        },
        {
          path: '/consultation/history',
          name: 'ConsultationHistory',
          component: () => import('@/views/consultation/ConsultationHistory.vue'),
        },
        {
          path: '/consultation/transfers',
          name: 'HumanTransferList',
          component: () => import('@/views/consultation/HumanTransferList.vue'),
        },
        {
          path: '/consultation/process',
          name: 'HumanProcess',
          component: () => import('@/views/consultation/HumanProcess.vue'),
          meta: {
            requiresAuth: true,
            roles: ['COUNSELOR', 'ADMIN']
          },
        },
        {
          path: '/process',
          name: 'ProcessService',
          component: () => import('@/views/process/ProcessService.vue'),
        },
        {
          path: '/leave',
          name: 'Leave',
          component: () => import('@/views/leave/LeaveList.vue'),
        },
        {
          path: '/leave/apply',
          name: 'LeaveApply',
          component: () => import('@/views/leave/LeaveApply.vue'),
        },
        {
          path: '/leave/approve',
          name: 'LeaveApprove',
          component: () => import('@/views/leave/LeaveApprove.vue'),
        },
        {
          path: '/award',
          name: 'Award',
          component: () => import('@/views/award/AwardList.vue'),
        },
        {
          path: '/award/apply',
          name: 'AwardApply',
          component: () => import('@/views/award/AwardApply.vue'),
        },
        {
          path: '/award/approve',
          name: 'AwardApprove',
          component: () => import('@/views/award/AwardApprove.vue'),
        },
        {
          path: '/notifications',
          name: 'Notifications',
          component: () => import('@/views/notification/NotificationList.vue'),
        },
      ],
    },
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  userStore.initUserInfo()

  // 检查token是否过期
  if (userStore.token && userStore.isTokenExpired()) {
    userStore.logout()
    if (to.meta.requiresAuth) {
      next('/login')
      return
    }
  }

  if (to.meta.requiresAuth && !userStore.isLoggedIn()) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && userStore.isLoggedIn()) {
    next('/')
  } else if (to.meta.roles && to.meta.roles.length > 0) {
    // 检查角色权限
    if (!userStore.isLoggedIn()) {
      next('/login')
    } else {
      const hasRole = to.meta.roles.some((role: string) => userStore.role === role)
      if (hasRole) {
        next()
      } else {
        next('/')
      }
    }
  } else {
    next()
  }
})

export default router
