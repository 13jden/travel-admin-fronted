<template>
  <div class="user-container">
    <!-- 顶部搜索和操作区域 -->
    <el-card class="search-card">
      <div class="search-container">
        <el-input 
          v-model="searchKeyword" 
          placeholder="请输入邮箱或昵称" 
          clearable 
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
        
        <el-button type="primary" @click="handleCreateUser">
          创建官方账号
        </el-button>
      </div>
    </el-card>
    
    <!-- 用户列表 -->
    <el-card class="list-card">
      <el-table 
        :data="userList" 
        border 
        style="width: 100%" 
        v-loading="loading"
      >
        <el-table-column label="用户 ID" prop="userId" width="80" />
        
        <el-table-column label="用户信息" width="240">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="50" :src="row.avatar" @error="handleAvatarError">
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
        
        <el-table-column label="简介" prop="personIntruduction" show-overflow-tooltip />
        
        <el-table-column label="学校" prop="school" width="120" show-overflow-tooltip />
        
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
            <el-button type="primary" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="warning" link @click="handleResetPassword(row)">
              重置密码
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
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
    </el-card>
    
    <!-- 编辑/创建用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '创建官方账号' : '编辑用户'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
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
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
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
        <span class="dialog-footer">
          <el-button @click="resetPwdDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitResetPwd">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { 
  Search, 
  UserFilled, 
  Star, 
  Collection, 
  Link, 
  Plus,
  Avatar
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getUserList, 
  getUserDetail, 
  updateUser, 
  updateAvatar, 
  updateUserStatus, 
  resetPassword, 
  deleteUser, 
  registerUser 
} from '@/api/user'

// 数据列表
const userList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchKeyword = ref('')

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
  ],
  avatar: [
    { 
      validator: (rule, value, callback) => {
        if (!avatarFile.value && dialogType.value === 'create') {
          callback(new Error('请上传头像'));
        } else {
          callback();
        }
      }, 
      trigger: 'change' 
    }
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
  fetchUserList()
})

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const res = await getUserList(currentPage.value, pageSize.value, searchKeyword.value)
    if (res.code === 1) {
      // 记录获取的用户ID格式

      userList.value = res.data.records || []
      total.value = res.data.total || 0
    } else {
      ElMessage.error(res.message || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchUserList()
}

// 修改每页数量
const handleSizeChange = (size) => {
  pageSize.value = size
  fetchUserList()
}

// 修改当前页
const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchUserList()
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
  
  // 清除验证错误
  if (formRef.value) {
    formRef.value.clearValidate('avatar');
  }
  
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
const handleEdit = async (row) => {
  dialogType.value = 'edit'
  try {
    const res = await getUserDetail(row.userId)
    if (res.code === 1) {
      form.value = { ...res.data }
      imageUrl.value = res.data.avatar
      dialogVisible.value = true
    } else {
      ElMessage.error(res.message || '获取用户详情失败')
    }
  } catch (error) {
    console.error('获取用户详情失败:', error)
    ElMessage.error('获取用户详情失败')
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let res
        if (dialogType.value === 'create') {
          // 创建模式必须上传头像
          if (!avatarFile.value) {
            ElMessage.warning('请上传头像')
            return
          }
          
          res = await registerUser({
            nickName: form.value.nickName,
            email: form.value.email,
            password: form.value.password,
            personIntruduction: form.value.personIntruduction,
            isOfficial: form.value.isOfficial,
            avatar: avatarFile.value
          })
        } else {
          // 编辑模式：如果有选择新头像，则先上传头像
          if (avatarFile.value) {
            const avatarRes = await updateAvatar(form.value.userId, avatarFile.value)
            if (avatarRes.code === 1) {
              form.value.avatar = avatarRes.data
            } else {
              ElMessage.error(avatarRes.message || '头像上传失败')
              return
            }
          }
          
          res = await updateUser(form.value)
        }
        
        if (res.code === 1) {
          ElMessage.success(dialogType.value === 'create' ? '创建成功' : '更新成功')
          dialogVisible.value = false
          fetchUserList()
        } else {
          ElMessage.error(res.message || (dialogType.value === 'create' ? '创建失败' : '更新失败'))
        }
      } catch (error) {
        console.error(dialogType.value === 'create' ? '创建失败:' : '更新失败:', error)
        ElMessage.error(dialogType.value === 'create' ? '创建失败' : '更新失败')
      }
    }
  })
}

// 更改用户状态
const handleStatusChange = async (row) => {
  try {
    const res = await updateUserStatus(row.userId, row.status ? 1 : 0)
    if (res.code === 1) {
      ElMessage.success('状态更新成功')
    } else {
      ElMessage.error(res.message || '状态更新失败')
      // 恢复原状态
      row.status = !row.status
    }
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
        const res = await resetPassword(resetPwdForm.value.userId, resetPwdForm.value.newPassword)
        if (res.code === 1) {
          ElMessage.success('密码重置成功')
          resetPwdDialogVisible.value = false
        } else {
          ElMessage.error(res.message || '密码重置失败')
        }
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
      const res = await deleteUser(row.userId)
      if (res.code === 1) {
        ElMessage.success('删除成功')
        fetchUserList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
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

// 头像加载失败处理
const handleAvatarError = () => {
  // 可以设置默认头像
}
</script>

<style scoped>
.user-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input {
  width: 300px;
}

.list-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
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

.avatar-tip {
  margin-top: 10px;
  font-size: 12px;
  color: #606266;
}
</style> 