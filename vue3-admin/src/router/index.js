import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/login.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: 'index',
        name: 'Dashboard',
        component: () => import('@/views/index/index.vue'),
        meta: { title: '首页', icon: 'HomeFilled' }
      }
    ]
  },
  {
    path: '/products',
    component: Layout,
    meta: { title: '文创商品管理', icon: 'Goods' },
    children: [
      {
        path: 'list',
        name: 'ProductList',
        component: () => import('@/views/products/list.vue'),
        meta: { title: '商品信息' }
      },
      {
        path: 'categories',
        name: 'ProductCategories',
        component: () => import('@/views/products/categories.vue'),
        meta: { title: '商品分类' }
      },
      {
        path: 'orders',
        name: 'ProductOrders',
        component: () => import('@/views/products/orders.vue'),
        meta: { title: '订单管理' }
      }
    ]
  },
  {
    path: '/guides',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Guides',
        component: () => import('@/views/guides/index.vue'),
        meta: { title: '旅游攻略管理', icon: 'Notebook' }
      }
    ]
  },
  {
    path: '/routes',
    component: Layout,
    meta: { title: '路线推荐管理', icon: 'MapLocation' },
    children: [
      {
        path: 'attractions',
        name: 'Attractions',
        component: () => import('@/views/routes/attractions.vue'),
        meta: { title: '景点管理' }
      },
      {
        path: 'templates',
        name: 'RouteTemplates',
        component: () => import('@/views/routes/templates.vue'),
        meta: { title: '路线模板' }
      }
    ]
  },
  {
    path: '/ai-knowledge',
    component: Layout,
    meta: { title: 'AI知识库管理', icon: 'Cpu' },
    children: [
      {
        path: '',
        name: 'AiKnowledge',
        component: () => import('@/views/ai/index.vue'),
        meta: { title: '知识库管理' }
      },
      {
        path: 'qa',
        name: 'AiQA',
        component: () => import('@/views/ai/qa.vue'),
        meta: { title: 'AI问答管理' }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    children: [
      {
        path: '',
        name: 'User',
        component: () => import('@/views/user/index.vue'),
        meta: { title: '用户管理', icon: 'User' }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    meta: { title: '系统设置', icon: 'Setting' },
    children: [
      {
        path: 'banner',
        name: 'Banner',
        component: () => import('@/views/system/banner.vue'),
        meta: { title: '轮播图管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由拦截器
router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('token')
  
  if (to.path === '/login') {
    // 如果已登录，访问登录页则重定向到首页
    if (token) {
      next('/')
    } else {
      next()
    }
  } else {
    // 修改为检查 sessionStorage 中的 token
    if (token) {
      next()
    } else {
      next('/login')
    }
    /* 原有逻辑
    const cookieToken = getCookie('adminToken');
    if (!cookieToken) {
      next('/login')
    } else {
      sessionStorage.setItem('token', cookieToken);
      next()
    }
    */
  }
})

/*
// 获取cookie的辅助函数
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}
*/

export default router 