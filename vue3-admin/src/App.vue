<script setup>
import { onMounted } from 'vue'
import { inject } from 'vue'

// 注入websocket服务
const websocket = inject('websocket')

// 在应用加载后尝试连接websocket
onMounted(() => {
  // 检查是否有token，有则尝试连接
  const token = sessionStorage.getItem('token')
  if (token && websocket) {
    console.log('App mounted, attempting to connect websocket')
    websocket.connect()
  }
})
</script>

<template>
  <router-view />
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  height: 100%;
}
</style>
