<template>
  <div class="login-container">
    <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
      <h3 class="title">
        <span class="title-main">数字旅游后台管理系统</span>
        <span class="title-sub">Digital Tourism Management System</span>
      </h3>
      
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          placeholder="用户名 / Username"
          type="text"
          auto-complete="off"
          prefix-icon="User"
          class="form-input"
        />
      </el-form-item>
      
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          placeholder="密码 / Password"
          type="password"
          auto-complete="off"
          prefix-icon="Lock"
          show-password
          class="form-input"
          @keyup.enter="handleLogin"
        />
      </el-form-item>
      
      <el-form-item prop="code">
        <div class="check-code-container">
          <el-input
            v-model="loginForm.code"
            placeholder="验证码 / Verification Code"
            type="text"
            auto-complete="off"
            prefix-icon="Key"
            class="form-input code-input"
            @keyup.enter="handleLogin"
          />
          <div class="captcha-container">
            <img
              v-if="captchaImg"
              :src="captchaImg"
              class="check-code-img"
              @click="refreshCaptcha"
              alt="验证码"
              title="点击刷新验证码 / Click to refresh"
            />
            <div v-else class="captcha-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
            </div>
          </div>
        </div>
      </el-form-item>
      
      <el-button
        :loading="loading"
        type="primary"
        class="login-button"
        @click="handleLogin"
      >
        <span class="button-text">
          <span class="button-main">登录</span>
          <span class="button-sub">Login</span>
        </span>
      </el-button>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Key, Loading } from '@element-plus/icons-vue'
import { getCaptcha, login } from '@/api/auth'

// 路由和依赖
const router = useRouter()

// 表单引用
const loginFormRef = ref(null)

// 响应式数据
const loading = ref(false)
const captchaImg = ref('')
const captchaUuid = ref('')

const loginForm = reactive({
  username: '',
  password: '',
  code: '',
  uuid: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 1, message: '验证码不能为空', trigger: 'blur' }
  ]
}

// 刷新验证码
const refreshCaptcha = async () => {
  try {
    const res = await getCaptcha()
    console.log('验证码响应:', res)
    
    if (res.code === 1) {
      captchaImg.value = res.data.img
      captchaUuid.value = res.data.uuid
      loginForm.uuid = res.data.uuid
    } else {
      ElMessage.error(res.message || '获取验证码失败')
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
    ElMessage.error('获取验证码失败')
  }
}

// 登录逻辑
const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      try {
        const res = await login({
          username: loginForm.username,
          password: loginForm.password,
          code: loginForm.code,
          uuid: loginForm.uuid
        })
        
        console.log('登录响应:', res)
        
        if (res.code === 1) {
          ElMessage.success('登录成功')
          
          // 保存用户信息和token
          const userInfo = res.data
          sessionStorage.setItem('token', userInfo.token)
          sessionStorage.setItem('userInfo', JSON.stringify({
            id: userInfo.id,
            username: userInfo.username,
            nickname: userInfo.nickname,
            avatar: userInfo.avatar,
            phone: userInfo.phone,
            role: userInfo.role
          }))
          
          // 跳转到首页
          router.push('/index')
        } else {
          ElMessage.error(res.message || '登录失败')
          // 登录失败后刷新验证码
          refreshCaptcha()
        }
      } catch (error) {
        console.error('登录失败:', error)
        ElMessage.error('登录失败')
        // 登录失败后刷新验证码
        refreshCaptcha()
      } finally {
        loading.value = false
      }
    }
  })
}

// 页面加载时获取验证码
onMounted(() => {
  refreshCaptcha()
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
    width: 420px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);

    .title {
      text-align: center;
      margin-bottom: 35px;
      color: #333;

      .title-main {
        display: block;
        font-size: 24px;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 5px;
      }

      .title-sub {
        display: block;
        font-size: 14px;
        color: #7f8c8d;
        font-weight: 400;
        letter-spacing: 0.5px;
      }
    }

    .form-input {
      height: 48px;
      border-radius: 8px;
      border: 2px solid #e1e8ed;
      transition: all 0.3s ease;

      :deep(.el-input__wrapper) {
        box-shadow: none;
        border: none;
        background: transparent;
        padding: 0 15px;
      }

      :deep(.el-input__inner) {
        font-size: 15px;
        color: #2c3e50;
        font-weight: 500;
      }

      :deep(.el-input__prefix) {
        color: #7f8c8d;
        font-size: 16px;
      }

      &:hover {
        border-color: #3498db;
      }

      &:focus-within {
        border-color: #2980b9;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
      }
    }

    .code-input {
      width: 60%;
    }

    .check-code-container {
      display: flex;
      align-items: center;
      gap: 12px;

      .captcha-container {
        flex: 1;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #e1e8ed;
        border-radius: 8px;
        background: #f8f9fa;
        transition: all 0.3s ease;

        &:hover {
          border-color: #3498db;
          background: #f0f8ff;
        }

        .check-code-img {
          height: 44px;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.3s ease;

          &:hover {
            opacity: 0.8;
            transform: scale(1.02);
          }
        }

        .captcha-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #7f8c8d;
          font-size: 18px;
        }
      }
    }

    .el-form-item {
      margin-bottom: 25px;

      :deep(.el-form-item__error) {
        font-size: 12px;
        color: #e74c3c;
        margin-top: 5px;
        line-height: 1.4;
      }
    }

    .login-button {
      height: 50px;
      width: 100%;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      transition: all 0.3s ease;
      margin-top: 10px;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
      }

      &:active {
        transform: translateY(0);
      }

      .button-text {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;

        .button-main {
          font-size: 16px;
          font-weight: 600;
        }

        .button-sub {
          font-size: 12px;
          font-weight: 400;
          opacity: 0.8;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 480px) {
  .login-container {
    padding: 20px;

    .login-form {
      width: 100%;
      padding: 30px 20px;

      .title {
        .title-main {
          font-size: 20px;
        }

        .title-sub {
          font-size: 12px;
        }
      }

      .check-code-container {
        flex-direction: column;
        gap: 8px;

        .captcha-container {
          width: 100%;
        }
      }
    }
  }
}
</style>
