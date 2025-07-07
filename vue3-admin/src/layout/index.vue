<template>
    <div class="app-wrapper">
      <div class="sidebar-container">
        <!-- 侧边栏 -->
        <div class="logo-container">
          <h1 class="logo-title">数字旅游后台管理系统</h1>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          router
        >
          <el-menu-item index="/index">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
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
            <span>旅游攻略管理</span>
          </el-menu-item>

          <el-sub-menu index="/routes">
            <template #title>
              <el-icon><MapLocation /></el-icon>
              <span>路线推荐管理</span>
            </template>
            <el-menu-item index="/routes/attractions">景点管理</el-menu-item>
            <el-menu-item index="/routes/templates">路线模板</el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/ai-knowledge">
            <el-icon><Cpu /></el-icon>
            <span>AI知识库管理</span>
          </el-menu-item>
                    
          <el-menu-item index="/user">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
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

      <div class="main-container">
        <div class="navbar">
          <!-- 左侧标题 -->
          <div class="page-title">
            {{ pageTitle }}
          </div>
          
          <div class="right-menu">
            <el-dropdown trigger="click">
              <span class="el-dropdown-link">
                管理员<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        
        <div class="app-main">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { HomeFilled, Document, ArrowDown, Connection, ChatDotRound, User, VideoCamera, Goods, Notebook, MapLocation, Cpu, Setting } from '@element-plus/icons-vue';
  
  const route = useRoute();
  const router = useRouter();
  
  // 页面标题
  const pageTitle = computed(() => {
    const matched = route.matched;
    if (matched.length > 0) {
      const lastMatched = matched[matched.length - 1];
      return lastMatched.meta?.title || '首页';
    }
    return '首页';
  });
  
  const logout = () => {
    sessionStorage.removeItem('token');
    document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  };
  
  </script>
  
  <style scoped>
  .app-wrapper {
    position: relative;
    height: 100%;
    width: 100%;
    display: flex;
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
  }
  
  .logo-container {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .logo-title {
    color: #fff;
    font-size: 18px;
    margin: 0;
  }
  
  .sidebar-menu {
    border-right: none;
  }
  
  .main-container {
    margin-left: 210px;
    min-height: 100%;
    width: calc(100% - 210px);
    position: relative;
  }
  
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
  }
  
  .page-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
  
  .right-menu {
    display: flex;
    align-items: center;
  }
  
  .app-main {
    padding: 20px;
    min-height: calc(100vh - 50px);
    position: relative;
  }
  </style>