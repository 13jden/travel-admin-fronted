<template>
  <div class="login-container">
    <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
      <h3 class="title">数字旅游后台管理系统</h3>
      
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          placeholder="用户名"
          type="text"
          auto-complete="off"
          prefix-icon="User"
        />
      </el-form-item>
      
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          placeholder="密码"
          type="password"
          auto-complete="off"
          prefix-icon="Lock"
          show-password
          @keyup.enter="handleLogin"
        />
      </el-form-item>
      
      <el-form-item prop="code">
        <div class="check-code-container">
          <el-input
            v-model="loginForm.code"
            placeholder="验证码"
            type="text"
            auto-complete="off"
            prefix-icon="Key"
            style="width: 60%"
            @keyup.enter="handleLogin"
          />
          <div class="captcha-container">
            <img
              v-if="captchaImg"
              :src="captchaImg"
              class="check-code-img"
              @click="refreshCaptcha"
              alt="验证码"
              title="点击刷新验证码"
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
        style="width: 100%"
        @click="handleLogin"
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
    console.log('验证码响应:', res) // 调试日志
    
    if (res.code === 1) { // 修改：后端返回 code: 1 表示成功
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
        
        console.log('登录响应:', res) // 调试日志
        
        if (res.code === 1) { // 修改：后端返回 code: 1 表示成功
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
        ElMessage.error('登录失败，请检查网络连接')
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .login-form {
    width: 400px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);

    .title {
      text-align: center;
      margin-bottom: 40px;
      color: #333;
      font-size: 24px;
      font-weight: 600;
    }

    .check-code-container {
      display: flex;
      align-items: center;
      gap: 12px;

      .captcha-container {
        flex: 1;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        background: #f5f7fa;

        .check-code-img {
          height: 38px;
          cursor: pointer;
          border-radius: 4px;
          transition: opacity 0.3s;

          &:hover {
            opacity: 0.8;
          }
        }

        .captcha-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #909399;
        }
      }
    }

    .el-form-item {
      margin-bottom: 24px;
    }

    .el-button {
      height: 44px;
      font-size: 16px;
      font-weight: 500;
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
        font-size: 20px;
        margin-bottom: 30px;
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
