<template>
  <div class="login-container">
    <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
      <h3 class="title">数字旅游后台管理系统</h3>
      <el-form-item prop="account">
        <el-input
          v-model="loginForm.account"
          placeholder="账号"
          type="text"
          auto-complete="off"
        />
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          placeholder="密码"
          type="password"
          auto-complete="off"
          @keyup.enter.native="handleLogin"
        />
      </el-form-item>
      <!--
      <el-form-item prop="checkCode">
        <div class="check-code-container">
          <el-input
            v-model="loginForm.checkCode"
            placeholder="验证码"
            type="text"
            auto-complete="off"
            style="width: 60%"
          />
          <img
            :src="checkCodeImg"
            class="check-code-img"
            @click="refreshCheckCode"
            alt="验证码"
          />
        </div>
      </el-form-item>
      -->
      <el-button
        :loading="loading"
        type="primary"
        style="width: 100%"
        @click.native.prevent="handleLogin"
      >
        登录
      </el-button>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCheckCode, login } from '@/api/admin'

// 路由和依赖
const router = useRouter()

// 表单引用
const loginFormRef = ref(null)

// 响应式数据
const loading = ref(false)
// const checkCodeImg = ref('')

const loginForm = reactive({
  account: '',
  password: '',
  // checkCode: '',
  // checkCodeKey: ''
})

const loginRules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  // checkCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

// 获取 Cookie
function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

/*
// 刷新验证码
async function refreshCheckCode() {
  try {
    const res = await getCheckCode()
    if (res.code === 1) {
      checkCodeImg.value = res.data.checkCode
      loginForm.checkCodeKey = res.data.checkCodeKey
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
    ElMessage.error('获取验证码失败')
  }
}
*/

// 登录逻辑
const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      // 新增的硬编码登录逻辑
      if (loginForm.account === 'admin' && loginForm.password === 'admin') {
        ElMessage.success('登录成功');
        sessionStorage.setItem('token', 'admin-token'); // 使用一个模拟token
        router.push('/index');
      } else {
        ElMessage.error('账号或密码错误');
      }
      loading.value = false;

      /* 原有登录逻辑
      try {
        if (!loginForm.checkCodeKey) {
          ElMessage.error('请先获取验证码')
          refreshCheckCode()
          return
        }

        const res = await login(loginForm)
        if (res.code === 1) {
          ElMessage.success('登录成功')

          const token = getCookie('adminToken')
          console.log('保存token:', token)

          if (token) {
            sessionStorage.setItem('token', token)

            router.push('/index')
          } else {
            ElMessage.error('获取token失败')
            refreshCheckCode()
          }
        } else {
          ElMessage.error(res.message || '登录失败')
          refreshCheckCode()
        }
      } catch (error) {
        console.error('登录失败:', error)
        refreshCheckCode()
      } finally {
        loading.value = false
      }
      */
    }
  })
}

onMounted(() => {
  // refreshCheckCode()
})
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('../../images/admin-cover.jpg') no-repeat center center;
  background-size: cover;

  .login-form {
    width: 400px;
    padding: 30px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .title {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
    }

    .check-code-container {
      display: flex;
      align-items: center;
      gap: 10px;

      .check-code-img {
        height: 40px;
        cursor: pointer;
      }
    }
  }
}
</style>
