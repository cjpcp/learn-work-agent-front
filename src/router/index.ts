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
        {
          path: '/consultation/transfer-config',
          name: 'TransferConfig',
          component: () => import('@/views/consultation/TransferConfig.vue'),
          meta: {
            roles: ['ADMIN'],
          },
        },
        {
          path: '/approval/config',
          name: 'ApprovalConfig',
          component: () => import('@/views/approval/ApprovalConfig.vue'),
          meta: {
            roles: ['ADMIN'],
          },
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
  } else if (userStore.isLoggedIn() && (to.path === '/login' || to.path === '/register')) {
    next('/')
  } else if (to.meta.roles && Array.isArray(to.meta.roles) && to.meta.roles.length > 0) {
    // 检查角色权限
    if (!userStore.isLoggedIn()) {
      next('/login')
    } else {
      const hasRole = (to.meta.roles as string[]).some(
        (role: string) => userStore.roleName === role
      )
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
