<template>
  <div class="guides-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>旅游攻略管理</h2>
        <p>管理旅游攻略内容，包括美食、景点、文化体验等</p>
      </div>
      <el-button type="primary" class="add-btn" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新建攻略
      </el-button>
    </div>

    <!-- 搜索筛选区域 -->
    <el-card class="search-card">
      <el-form :model="filters" class="search-form" inline>
        <el-form-item>
          <el-input
            v-model="filters.title"
            placeholder="请输入标题关键字"
            clearable
            @keyup.enter="handleFilter"
          />
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.type" placeholder="请选择类型" clearable>
            <el-option v-for="item in guideTypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 桌面端表格 -->
    <el-card class="table-card">
      <el-table 
        :data="filteredGuides" 
        v-loading="loading" 
        class="desktop-table"
        style="width: 100%;"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column label="类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeTag(scope.row.type)">{{ formatType(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否推荐" width="120">
          <template #default="scope">
            <el-switch v-model="scope.row.isRecommended" @change="handleRecommendChange(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="150" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 移动端列表 -->
    <div class="mobile-list">
      <div v-for="guide in filteredGuides" :key="guide.id" class="mobile-card">
        <!-- 攻略头部信息 -->
        <div class="guide-header">
          <div class="guide-title">
            <h3 class="guide-name">{{ guide.title }}</h3>
            <el-tag :type="getTypeTag(guide.type)" size="small">{{ formatType(guide.type) }}</el-tag>
          </div>
        </div>

        <!-- 攻略详细信息 -->
        <div class="guide-details">
          <div class="details-left">
            <div class="info-row">
              <span class="label">作者：</span>
              <span class="value">{{ guide.author }}</span>
            </div>
            <div class="info-row">
              <span class="label">创建时间：</span>
              <span class="value">{{ guide.createdAt }}</span>
            </div>
            <div class="info-row">
              <span class="label">推荐状态：</span>
              <el-switch 
                v-model="guide.isRecommended" 
                @change="handleRecommendChange(guide)"
                size="small"
              />
            </div>
          </div>
          
          <div class="details-right">
            <el-button 
              type="primary" 
              class="action-btn"
              @click="handleEdit(guide)"
            >
              <el-icon><Edit /></el-icon>
            </el-button>
            <div style="padding-right: 10px;">
              <el-button 
              type="danger" 
              class="action-btn"
              @click="handleDelete(guide)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
            </div>
            
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑 对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle" 
      width="60%" 
      class="guide-dialog"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="guide-form">
        <el-form-item label="攻略标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入攻略标题" />
        </el-form-item>
        <el-form-item label="攻略类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择攻略类型">
            <el-option v-for="item in guideTypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否推荐">
          <el-switch v-model="form.isRecommended" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="form.author" placeholder="请输入作者名" />
        </el-form-item>
        <el-form-item label="封面图" prop="coverImage">
          <el-input v-model="form.coverImage" placeholder="请输入封面图URL" />
        </el-form-item>
        <el-form-item label="攻略内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="10" placeholder="请输入攻略内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'

const loading = ref(false)
const guides = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

const guideTypes = [
  { value: 'food', label: '美食' },
  { value: 'attraction', label: '景点' },
  { value: 'culture', label: '文化体验' },
]

const form = ref({
  id: null,
  title: '',
  type: '',
  isRecommended: false,
  author: 'Admin',
  coverImage: '',
  content: '',
  createdAt: '',
})

const rules = {
  title: [{ required: true, message: '请输入攻略标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择攻略类型', trigger: 'change' }],
  author: [{ required: true, message: '请输入作者名', trigger: 'blur' }],
  content: [{ required: true, message: '请输入攻略内容', trigger: 'blur' }],
}

const filters = reactive({
  title: '',
  type: '',
})

// 模拟数据
const mockData = [
  { id: 1, title: '龙潭村特色农家菜-第一期', type: 'food', isRecommended: true, author: '小红', createdAt: '2023-10-01 10:00:00', content: '这里是农家菜的详细介绍...' },
  { id: 2, title: '龙潭村必游景点-古树林', type: 'attraction', isRecommended: true, author: '小明', createdAt: '2023-10-02 11:00:00', content: '古树林风景优美...' },
  { id: 3, title: '体验传统扎染工艺', type: 'culture', isRecommended: false, author: '小李', createdAt: '2023-10-03 14:00:00', content: '扎染是...' },
  { id: 4, title: '地道小吃街美食攻略', type: 'food', isRecommended: false, author: '小张', createdAt: '2023-10-04 18:00:00', content: '小吃街有很多好吃的...' },
]

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    guides.value = mockData
    loading.value = false
  }, 500)
})

const filteredGuides = computed(() => {
  return guides.value.filter(guide => {
    const titleMatch = guide.title.toLowerCase().includes(filters.title.toLowerCase())
    const typeMatch = !filters.type || guide.type === filters.type
    return titleMatch && typeMatch
  })
})

const handleFilter = () => {
  // The computed property already handles filtering, this is for triggering reactivity if needed
}

const resetFilters = () => {
  filters.title = ''
  filters.type = ''
}

const handleAdd = () => {
  dialogTitle.value = '新建攻略'
  form.value = { id: null, title: '', type: '', isRecommended: false, author: 'Admin', coverImage: '', content: '', createdAt: new Date().toLocaleString() }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑攻略'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除攻略《${row.title}》吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    const index = guides.value.findIndex(g => g.id === row.id)
    if (index !== -1) {
      guides.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleRecommendChange = (row) => {
  // In a real app, you would call an API here.
  ElMessage.success(`《${row.title}》的推荐状态已更新`)
}

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (form.value.id) {
        // Edit
        const index = guides.value.findIndex(g => g.id === form.value.id)
        if (index !== -1) {
          guides.value[index] = { ...form.value }
        }
      } else {
        // Add
        form.value.id = Math.max(0, ...guides.value.map(g => g.id)) + 1
        guides.value.unshift({ ...form.value })
      }
      dialogVisible.value = false
      ElMessage.success('保存成功')
    }
  })
}

const formatType = (type) => {
  return guideTypes.find(t => t.value === type)?.label || '未知'
}

const getTypeTag = (type) => {
  if (type === 'food') return 'success'
  if (type === 'attraction') return 'warning'
  if (type === 'culture') return 'primary'
  return 'info'
}

</script>

<style scoped>
.guides-container {
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

/* 移动端攻略头部区域 */
.guide-header {
  margin-bottom: 16px;
}

.guide-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.guide-name {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
  margin: 0;
}

/* 移动端攻略详细信息区域 */
.guide-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 100px;
  position: relative;
}

.details-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding-right: 60px;
}

.details-right {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.action-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  color: #909399;
  font-size: 14px;
}

.value {
  color: #606266;
  font-size: 14px;
}

.guide-dialog .el-dialog__body {
  padding: 20px 24px;
}

.guide-form .el-form-item {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .guides-container {
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

  .guide-dialog .el-dialog__body {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .guides-container {
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

  .guide-header {
    margin-bottom: 12px;
  }

  .details-left {
    padding-right: 50px;
  }

  .action-btn {
    width: 36px;
    height: 36px;
  }
}
</style> 