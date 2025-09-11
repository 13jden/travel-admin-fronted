<template>
  <div class="user-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>用户管理</h2>
        <p>管理系统用户，包括普通用户和官方账号</p>
      </div>
      <el-button type="primary" class="add-btn" @click="handleCreateUser">
        <el-icon><Plus /></el-icon>
        创建官方账号
      </el-button>
    </div>

    <!-- 搜索筛选区域 -->
    <el-card class="search-card">
      <el-form :model="filters" class="search-form" inline>
        <el-form-item>
          <el-input
            v-model="filters.keyword"
            placeholder="请输入邮箱或昵称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.status" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 桌面端表格 -->
    <el-card class="table-card">
      <el-table 
        :data="filteredUsers" 
        v-loading="loading" 
        class="desktop-table"
        style="width: 100%;"
      >
        <el-table-column prop="userId" label="ID" width="80" />
        <el-table-column label="用户信息" width="240">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="50" :src="row.avatar">
                {{ row.nickName ? row.nickName.substring(0, 1) : 'U' }}
              </el-avatar>
              <div class="user-details">
                <div class="nickname">
                  {{ row.nickName }}
                  <el-tag v-if="row.isOfficial" size="small" type="warning">官方</el-tag>
                </div>
                <div class="username">{{ row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="personIntruduction" label="简介" show-overflow-tooltip />
        <el-table-column prop="school" label="学校" width="120" show-overflow-tooltip />
        <el-table-column label="注册时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.joinTime) }}
          </template>
        </el-table-column>
        <el-table-column label="最后登录" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.lastLoginTime) }}
          </template>
        </el-table-column>
        <el-table-column label="数据统计" width="240">
          <template #default="{ row }">
            <div class="stats">
              <el-tooltip content="粉丝数" placement="top">
                <div class="stat-item">
                  <el-icon><UserFilled /></el-icon>
                  {{ row.fansCount || 0 }}
                </div>
              </el-tooltip>
              <el-tooltip content="点赞数" placement="top">
                <div class="stat-item">
                  <el-icon><Star /></el-icon>
                  {{ row.likeCount || 0 }}
                </div>
              </el-tooltip>
              <el-tooltip content="收藏数" placement="top">
                <div class="stat-item">
                  <el-icon><Collection /></el-icon>
                  {{ row.collectCount || 0 }}
                </div>
              </el-tooltip>
              <el-tooltip content="关注数" placement="top">
                <div class="stat-item">
                  <el-icon><Link /></el-icon>
                  {{ row.focusCount || 0 }}
                </div>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="true"
              :inactive-value="false"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="warning" link @click="handleResetPassword(row)">重置密码</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 移动端列表 -->
    <div class="mobile-list">
      <div v-for="user in filteredUsers" :key="user.userId" class="mobile-card">
        <!-- 用户头部信息 -->
        <div class="user-header">
          <div class="user-title">
            <div class="user-avatar">
              <el-avatar :size="40" :src="user.avatar">
                {{ user.nickName ? user.nickName.substring(0, 1) : 'U' }}
              </el-avatar>
            </div>
            <div class="user-info-mobile">
              <h3 class="user-name">{{ user.nickName }}</h3>
              <div class="user-meta">
                <span class="user-email">{{ user.email }}</span>
              </div>
            </div>
          </div>
          <el-tag v-if="user.isOfficial" size="small" type="warning" class="official-tag">官方</el-tag>
        </div>

        <!-- 用户详细信息 -->
        <div class="user-details">
          <div class="details-left">
            <div class="info-row">
              <span class="label">简介：</span>
              <span class="value">{{ user.personIntruduction || '暂无简介' }}</span>
            </div>
            <div class="info-row">
              <span class="label">学校：</span>
              <span class="value">{{ user.school || '未填写' }}</span>
            </div>
            <div class="info-row">
              <span class="label">注册时间：</span>
              <span class="value">{{ formatDateTime(user.joinTime) }}</span>
            </div>
            <div class="info-row">
              <span class="label">最后登录：</span>
              <span class="value">{{ formatDateTime(user.lastLoginTime) }}</span>
            </div>
            <div class="info-row">
              <span class="label">状态：</span>
              <el-switch 
                v-model="user.status" 
                @change="handleStatusChange(user)"
                size="small"
              />
            </div>
          </div>
          
          <div class="details-right">
            <el-button 
              type="primary" 
              class="action-btn"
              @click="handleEdit(user)"
            >
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button 
              type="warning" 
              class="action-btn"
              @click="handleResetPassword(user)"
            >
              <el-icon><Key /></el-icon>
            </el-button>
            <el-button 
              type="danger" 
              class="action-btn"
              @click="handleDelete(user)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 编辑/创建用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '创建官方账号' : '编辑用户'"
      width="60%"
      class="user-dialog"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
        class="user-form"
      >
        <el-form-item label="头像" prop="avatar">
          <el-upload
            class="avatar-uploader"
            action=""
            :auto-upload="false"
            :show-file-list="false"
            @change="handleAvatarChange"
          >
            <img v-if="imageUrl" :src="imageUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">只能上传jpg/png文件，且不超过2MB</div>
            </template>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="form.nickName" placeholder="请输入昵称" />
        </el-form-item>
        
        <el-form-item label="用户名" prop="email">
          <el-input v-model="form.email" placeholder="请输入用户名" />
        </el-form-item>
        
        <el-form-item v-if="dialogType === 'create'" label="密码" prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="个人简介" prop="personIntruduction">
          <el-input 
            v-model="form.personIntruduction" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入个人简介" 
          />
        </el-form-item>
        
        <el-form-item label="官方账号">
          <el-switch
            v-model="form.isOfficial"
            :active-value="true"
            :inactive-value="false"
          />
        </el-form-item>
        
        <el-form-item v-if="dialogType === 'edit'" label="性别">
          <el-radio-group v-model="form.sex">
            <el-radio :label="false">女</el-radio>
            <el-radio :label="true">男</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item v-if="dialogType === 'edit'" label="生日">
          <el-date-picker 
            v-model="form.birthday" 
            type="date" 
            placeholder="选择生日" 
            format="YYYY-MM-DD" 
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item v-if="dialogType === 'edit'" label="学校">
          <el-input v-model="form.school" placeholder="请输入学校" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="resetPwdDialogVisible"
      title="重置密码"
      width="400px"
    >
      <el-form
        ref="resetPwdFormRef"
        :model="resetPwdForm"
        :rules="resetPwdRules"
        label-width="100px"
      >
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="resetPwdForm.newPassword" 
            type="password" 
            placeholder="请输入新密码" 
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="resetPwdForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入新密码" 
            show-password
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetPwdDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitResetPwd">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { 
  Search, 
  UserFilled, 
  Star, 
  Collection, 
  Link, 
  Plus,
  Edit,
  Delete,
  Key
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 数据列表
const userList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 筛选条件
const filters = reactive({
  keyword: '',
  status: null,
})

// 表单数据
const dialogVisible = ref(false)
const dialogType = ref('create') // 'create' 或 'edit'
const formRef = ref(null)
const form = ref({
  userId: '',
  nickName: '',
  email: '',
  password: '',
  personIntruduction: '',
  sex: false,
  birthday: '',
  school: '',
  isOfficial: false
})

// 重置密码
const resetPwdDialogVisible = ref(false)
const resetPwdFormRef = ref(null)
const resetPwdForm = ref({
  userId: '',
  newPassword: '',
  confirmPassword: ''
})

// 头像上传
const imageUrl = ref('')
const avatarFile = ref(null)

// 模拟数据
const mockData = [
  {
    userId: 1,
    nickName: '张三',
    email: 'zhangsan@example.com',
    avatar: 'https://via.placeholder.com/50',
    personIntruduction: '热爱旅游的背包客，喜欢探索未知的风景',
    sex: true,
    birthday: '1990-05-15',
    school: '北京大学',
    isOfficial: false,
    status: true,
    joinTime: '2023-01-15 10:30:00',
    lastLoginTime: '2023-12-01 14:20:00',
    fansCount: 1250,
    likeCount: 3200,
    collectCount: 180,
    focusCount: 450
  },
  {
    userId: 2,
    nickName: '龙潭村官方',
    email: 'official@longtan.com',
    avatar: 'https://via.placeholder.com/50',
    personIntruduction: '龙潭村官方账号，为您提供最新的旅游资讯',
    sex: false,
    birthday: '',
    school: '',
    isOfficial: true,
    status: true,
    joinTime: '2023-01-01 09:00:00',
    lastLoginTime: '2023-12-01 16:45:00',
    fansCount: 5600,
    likeCount: 12800,
    collectCount: 320,
    focusCount: 120
  },
  {
    userId: 3,
    nickName: '李四',
    email: 'lisi@example.com',
    avatar: 'https://via.placeholder.com/50',
    personIntruduction: '美食爱好者，专注于发现各地特色小吃',
    sex: false,
    birthday: '1988-08-22',
    school: '清华大学',
    isOfficial: false,
    status: false,
    joinTime: '2023-03-20 15:20:00',
    lastLoginTime: '2023-11-28 09:15:00',
    fansCount: 890,
    likeCount: 2100,
    collectCount: 95,
    focusCount: 320
  },
  {
    userId: 4,
    nickName: '王五',
    email: 'wangwu@example.com',
    avatar: 'https://via.placeholder.com/50',
    personIntruduction: '摄影爱好者，用镜头记录美好时光',
    sex: true,
    birthday: '1992-12-03',
    school: '复旦大学',
    isOfficial: false,
    status: true,
    joinTime: '2023-06-10 11:45:00',
    lastLoginTime: '2023-12-01 20:30:00',
    fansCount: 2100,
    likeCount: 5800,
    collectCount: 240,
    focusCount: 680
  },
  {
    userId: 5,
    nickName: '赵六',
    email: 'zhaoliu@example.com',
    avatar: 'https://via.placeholder.com/50',
    personIntruduction: '文化探索者，对传统手工艺有浓厚兴趣',
    sex: false,
    birthday: '1985-04-18',
    school: '中山大学',
    isOfficial: false,
    status: true,
    joinTime: '2023-08-05 14:10:00',
    lastLoginTime: '2023-11-30 18:25:00',
    fansCount: 1500,
    likeCount: 4200,
    collectCount: 180,
    focusCount: 520
  }
]

// 表单校验规则
const formRules = {
  nickName: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ]
}

// 重置密码校验规则
const resetPwdRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== resetPwdForm.value.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 初始化
onMounted(() => {
  loading.value = true
  setTimeout(() => {
    userList.value = mockData
    total.value = mockData.length
    loading.value = false
  }, 500)
})

// 筛选用户
const filteredUsers = computed(() => {
  return userList.value.filter(user => {
    const keywordMatch = !filters.keyword || 
      user.nickName.toLowerCase().includes(filters.keyword.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.keyword.toLowerCase())
    const statusMatch = filters.status === null || user.status === filters.status
    return keywordMatch && statusMatch
  })
})

// 搜索
const handleSearch = () => {
  // 筛选逻辑在 computed 中处理
}

// 重置筛选
const resetFilters = () => {
  filters.keyword = ''
  filters.status = null
}

// 修改每页数量
const handleSizeChange = (size) => {
  pageSize.value = size
}

// 修改当前页
const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 头像上传前的验证
const handleAvatarChange = (uploadInfo) => {
  const file = uploadInfo.raw;
  
  if (!file) {
    ElMessage.error('无法识别上传的图片文件');
    return;
  }
  
  // 验证文件类型和大小
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 10;
  
  if (!isImage) {
    ElMessage.error('上传头像图片只能是图片格式!');
    return;
  }
  
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 10MB!');
    return;
  }
  
  // 保存文件引用
  avatarFile.value = file;
  
  // 释放之前的Blob URL避免内存泄漏
  if (imageUrl.value && imageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(imageUrl.value);
  }
  
  // 创建预览图
  imageUrl.value = URL.createObjectURL(file);
  
  ElMessage.success('头像已选择，将在保存时上传');
}

// 创建用户
const handleCreateUser = () => {
  dialogType.value = 'create'
  form.value = {
    nickName: '',
    email: '',
    password: '',
    personIntruduction: '',
    isOfficial: false
  }
  imageUrl.value = ''
  avatarFile.value = null
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row) => {
  dialogType.value = 'edit'
  form.value = { ...row }
  imageUrl.value = row.avatar
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (dialogType.value === 'create') {
          // 创建新用户
          const newUser = {
            userId: Math.max(...userList.value.map(u => u.userId)) + 1,
            ...form.value,
            avatar: imageUrl.value || 'https://via.placeholder.com/50',
            joinTime: new Date().toLocaleString(),
            lastLoginTime: new Date().toLocaleString(),
            fansCount: 0,
            likeCount: 0,
            collectCount: 0,
            focusCount: 0
          }
          userList.value.unshift(newUser)
          total.value = userList.value.length
          ElMessage.success('创建成功')
        } else {
          // 编辑用户
          const index = userList.value.findIndex(u => u.userId === form.value.userId)
          if (index !== -1) {
            userList.value[index] = { ...userList.value[index], ...form.value }
            if (imageUrl.value) {
              userList.value[index].avatar = imageUrl.value
            }
          }
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败')
      }
    }
  })
}

// 更改用户状态
const handleStatusChange = async (row) => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('更新状态失败')
    // 恢复原状态
    row.status = !row.status
  }
}

// 重置密码
const handleResetPassword = (row) => {
  resetPwdForm.value = {
    userId: row.userId,
    newPassword: '',
    confirmPassword: ''
  }
  resetPwdDialogVisible.value = true
}

// 提交重置密码
const submitResetPwd = async () => {
  if (!resetPwdFormRef.value) return
  
  await resetPwdFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        ElMessage.success('密码重置成功')
        resetPwdDialogVisible.value = false
      } catch (error) {
        console.error('密码重置失败:', error)
        ElMessage.error('密码重置失败')
      }
    }
  })
}

// 删除用户
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${row.nickName}" 吗？此操作不可逆。`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300))
      userList.value = userList.value.filter(u => u.userId !== row.userId)
      total.value = userList.value.length
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 格式化日期时间
const formatDateTime = (datetime) => {
  if (!datetime) return '未知'
  const date = new Date(datetime)
  return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`
}

// 补零
const padZero = (num) => {
  return num < 10 ? `0${num}` : num
}
</script>

<style scoped>
.user-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-left p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.add-btn {
  height: 40px;
  padding: 0 20px;
  font-size: 14px;
}

.search-card {
  margin-bottom: 24px;
  border-radius: 8px;
}

.search-form {
  margin: 0;
}

.search-form .el-form-item {
  margin-bottom: 0;
}

.table-card {
  border-radius: 8px;
}

.desktop-table {
  display: table;
}

.mobile-list {
  display: none;
}

.mobile-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 移动端用户头部区域 */
.user-header {
  margin-bottom: 16px;
  position: relative;
}

.user-title {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.user-avatar {
  flex-shrink: 0;
}

.user-info-mobile {
  flex: 1;
  text-align: left;
}

.user-name {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
  margin: 0 0 4px 0;
  text-align: left;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.user-email {
  color: #909399;
  font-size: 14px;
  text-align: left;
}

/* 官方标签右上角定位 */
.official-tag {
  position: absolute;
  top: 0;
  right: 0;
}

/* 移动端用户详细信息区域 */
.user-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.details-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.details-right {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.label {
  color: #909399;
  font-size: 14px;
  flex-shrink: 0;
}

.value {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-details {
  margin-left: 10px;
  display: flex;
  flex-direction: column;
}

.nickname {
  font-weight: bold;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
}

.nickname .el-tag {
  margin-left: 5px;
}

.username {
  font-size: 12px;
  color: #606266;
}

.stats {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.stat-item .el-icon {
  margin-right: 5px;
}

/* 头像上传样式 */
.avatar-uploader {
  width: 100%;
  text-align: center;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.avatar {
  height: 100px;
  width: auto;
  max-width: 200px;
  display: block;
  object-fit: cover;
  margin: 0 auto;
}

.user-dialog .el-dialog__body {
  padding: 20px 24px;
}

.user-form .el-form-item {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-container {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .search-form {
    flex-direction: column;
  }
  
  .search-form .el-form-item {
    width: 100%;
    margin-bottom: 16px;
  }
  
  .search-form .el-input,
  .search-form .el-select {
    width: 100% !important;
  }

  .desktop-table {
    display: none;
  }

  .mobile-list {
    display: block;
  }

  .user-dialog .el-dialog__body {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .user-container {
    padding: 16px;
  }
  
  .page-header {
    padding: 16px;
  }
  
  .header-left h2 {
    font-size: 20px;
  }

  .mobile-card {
    padding: 12px;
  }

  .user-header {
    margin-bottom: 12px;
  }

  .action-btn {
    width: 36px;
    height: 36px;
    font-size: 13px;
  }
}
</style> 