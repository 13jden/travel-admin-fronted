<template>
  <div class="app-wrapper" :class="{ 'mobile': isMobile }">
    <!-- 移动端遮罩层 -->
    <div 
      v-if="isMobile && sidebarOpen" 
      class="sidebar-mask"
      @click="closeSidebar"
    ></div>

    <!-- 侧边栏 -->
    <div 
      class="sidebar-container" 
      :class="{ 'sidebar-collapsed': isMobile && !sidebarOpen }"
    >
      <!-- Logo 区域 -->
      <div class="logo-container">
        <h1 class="logo-title" v-if="!isMobile || sidebarOpen">数字旅游后台</h1>
        <h1 class="logo-title-mobile" v-else>数</h1>
      </div>

      <!-- 菜单 -->
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="isMobile && !sidebarOpen"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
        @select="handleMenuSelect"
      >
        <el-menu-item index="/index">
          <el-icon><HomeFilled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>
        
        <el-sub-menu index="/products">
          <template #title>
            <el-icon><Goods /></el-icon>
            <span>文创商品管理</span>
          </template>
          <el-menu-item index="/products/list">商品信息</el-menu-item>
          <el-menu-item index="/products/categories">商品分类</el-menu-item>
          <el-menu-item index="/products/orders">订单管理</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/guides">
          <el-icon><Notebook /></el-icon>
          <template #title>旅游攻略管理</template>
        </el-menu-item>

        <el-sub-menu index="/routes">
          <template #title>
            <el-icon><MapLocation /></el-icon>
            <span>路线推荐管理</span>
          </template>
          <el-menu-item index="/routes/attractions">景点管理</el-menu-item>
          <el-menu-item index="/routes/templates">路线模板</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="/ai-knowledge">
          <template #title>
            <el-icon><Cpu /></el-icon>
            <span>AI知识库管理</span>
          </template>
          <el-menu-item index="/ai-knowledge">知识库管理</el-menu-item>
          <el-menu-item index="/ai-knowledge/qa">AI问答管理</el-menu-item>
        </el-sub-menu>
                  
        <el-menu-item index="/user">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>

        <el-sub-menu index="/system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </template>
          <el-menu-item index="/system/banner">轮播图管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>

    <!-- 主内容区域 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <div class="navbar">
        <!-- 移动端菜单按钮 -->
        <el-button
          v-if="isMobile"
          class="mobile-menu-btn"
          type="text"
          @click="toggleSidebar"
        >
          <el-icon><Menu /></el-icon>
        </el-button>

        <!-- 页面标题 -->
        <div class="page-title">
          {{ pageTitle }}
        </div>
        
        <!-- 右侧菜单 -->
        <div class="right-menu">
          <el-dropdown trigger="click">
            <span class="el-dropdown-link">
              <span v-if="!isMobile">管理员</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 主内容 -->
      <div class="app-main">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  HomeFilled, 
  ArrowDown, 
  User, 
  Goods, 
  Notebook, 
  MapLocation, 
  Cpu, 
  Setting,
  Menu
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();

// 响应式状态
const isMobile = ref(false);
const sidebarOpen = ref(false);

// 当前激活的菜单
const activeMenu = computed(() => route.path);

// 页面标题
const pageTitle = computed(() => {
  const matched = route.matched;
  if (matched.length > 0) {
    const lastMatched = matched[matched.length - 1];
    return lastMatched.meta?.title || '首页';
  }
  return '首页';
});

// 检测屏幕宽度
const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768;
  if (!isMobile.value) {
    sidebarOpen.value = false;
  }
};

// 切换侧边栏
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

// 关闭侧边栏
const closeSidebar = () => {
  sidebarOpen.value = false;
};

// 菜单选择处理
const handleMenuSelect = () => {
  if (isMobile.value) {
    closeSidebar();
  }
};

// 退出登录
const logout = () => {
  sessionStorage.removeItem('token');
  document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  router.push('/login');
};

onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});
</script>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;

  &.mobile {
    .sidebar-container {
      transform: translateX(-100%);
      transition: transform 0.3s ease;

      &:not(.sidebar-collapsed) {
        transform: translateX(0);
        z-index: 1001;
      }
    }

    .main-container {
      margin-left: 0;
      width: 100%;
    }
  }
}

.sidebar-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.sidebar-container {
  width: 210px;
  height: 100%;
  background-color: #304156;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  overflow-y: auto;
  z-index: 999;

  .logo-container {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 20px;

    .logo-title {
      color: #fff;
      font-size: 16px;
      margin: 0;
      text-align: center;
      line-height: 1.2;
    }

    .logo-title-mobile {
      color: #fff;
      font-size: 20px;
      margin: 0;
      font-weight: bold;
    }
  }

  .sidebar-menu {
    border-right: none;
    
    :deep(.el-menu-item) {
      &.is-active {
        background-color: #2c3e50 !important;
      }
    }

    :deep(.el-sub-menu) {
      .el-sub-menu__title:hover {
        background-color: #263445 !important;
      }
    }

    :deep(.el-menu-item:hover) {
      background-color: #263445 !important;
    }
  }
}

.main-container {
  margin-left: 210px;
  min-height: 100%;
  width: calc(100% - 210px);
  position: relative;
  transition: all 0.3s ease;

  .navbar {
    height: 50px;
    overflow: hidden;
    position: relative;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;

    .mobile-menu-btn {
      margin-right: 15px;
      font-size: 18px;
      color: #303133;
    }

    .page-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      flex: 1;
    }

    .right-menu {
      display: flex;
      align-items: center;

      .el-dropdown-link {
        cursor: pointer;
        display: flex;
        align-items: center;
        color: #303133;
        font-size: 14px;
      }
    }
  }

  .app-main {
    padding: 20px;
    min-height: calc(100vh - 50px);
    position: relative;
  }
}

// 移动端样式调整
@media (max-width: 768px) {
  .app-main {
    padding: 10px !important;
  }

  .navbar {
    padding: 0 15px !important;

    .page-title {
      font-size: 14px !important;
    }
  }

  .sidebar-container {
    width: 250px !important;
  }
}

// 平板样式调整
@media (max-width: 1024px) and (min-width: 769px) {
  .app-main {
    padding: 15px !important;
  }
}
</style>