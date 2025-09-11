<template>
  <div class="category-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>商品分类管理</h2>
        <p>管理商品分类信息</p>
      </div>
      <el-button type="primary" @click="handleAdd" class="add-btn">
        <el-icon><Plus /></el-icon>
        新增分类
      </el-button>
    </div>

    <!-- 分类列表 -->
    <el-card class="table-card" shadow="never">
      <!-- 桌面端表格 -->
      <el-table 
        :data="categories" 
        v-loading="loading" 
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        class="desktop-table"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="productCount" label="商品数量" sortable />
        <el-table-column prop="createdAt" label="创建时间" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 移动端卡片列表 -->
      <div class="mobile-list" v-if="isMobile">
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="mobile-card"
        >
          <!-- 移动端：ID和操作按钮一行，左右分布 -->
          <div class="card-header">
            <div class="card-left">
              <span class="category-id">ID: {{ category.id }}</span>
            </div>
            <div class="card-right">
              <el-button size="small" type="primary" @click="handleEdit(category)" class="action-btn">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(category)" class="action-btn">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          
          <!-- 分类信息 -->
          <div class="card-content">
            <div class="category-info">
              <div class="category-name">{{ category.name }}</div>
              <el-tag type="primary" size="small">
                {{ category.productCount }}个商品
              </el-tag>
            </div>
            <div class="category-time">
              <span class="label">创建时间：</span>
              <span class="value">{{ category.createdAt }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 新增/编辑 对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle" 
      :width="isMobile ? '95%' : '400px'"
      :close-on-click-modal="false"
      class="category-dialog"
    >
      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="rules" 
        :label-width="isMobile ? '80px' : '80px'"
        class="category-form"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
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
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'

const loading = ref(false)
const categories = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
const isMobile = ref(false)

const form = ref({
  id: null,
  name: '',
})

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
}

const mockData = [
  { id: 1, name: '手工艺品', productCount: 2, createdAt: '2023-09-01 10:00:00' },
  { id: 2, name: '特色食品', productCount: 2, createdAt: '2023-09-01 10:05:00' },
  { id: 3, name: '文创周边', productCount: 1, createdAt: '2023-09-01 10:10:00' },
]

// 检测屏幕尺寸
const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  loading.value = true
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
  setTimeout(() => {
    categories.value = mockData
    loading.value = false
  }, 500)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

const handleAdd = () => {
  dialogTitle.value = '新增分类'
  form.value = { id: null, name: '' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑分类'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除分类"${row.name}"吗？`, '提示', {
    type: 'warning',
  }).then(() => {
    categories.value = categories.value.filter(c => c.id !== row.id)
    ElMessage.success('删除成功')
  })
}

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (form.value.id) {
        // Edit
        const index = categories.value.findIndex(c => c.id === form.value.id)
        if (index !== -1) categories.value[index].name = form.value.name
      } else {
        // Add
        categories.value.push({
          id: Math.max(0, ...categories.value.map(c => c.id)) + 1,
          name: form.value.name,
          productCount: 0,
          createdAt: new Date().toLocaleString()
        })
      }
      dialogVisible.value = false
      ElMessage.success('保存成功')
    }
  })
}
</script>

<style scoped>
.category-container {
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
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 移动端卡片头部 - ID和操作按钮左右分布 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-left {
  display: flex;
  align-items: center;
}

.category-id {
  color: #909399;
  font-size: 14px;
  font-weight: 500;
}

.card-right {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 移动端卡片内容 */
.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-name {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

.category-time {
  display: flex;
  align-items: center;
}

.label {
  color: #909399;
  font-size: 14px;
  margin-right: 8px;
}

.value {
  color: #606266;
  font-size: 14px;
}

.category-dialog .el-dialog__body {
  padding: 20px 24px;
}

.category-form .el-form-item {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .category-container {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .desktop-table {
    display: none;
  }

  .mobile-list {
    display: block;
  }

  .category-dialog .el-dialog__body {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .category-container {
    padding: 12px;
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

  .action-btn {
    width: 32px;
    height: 32px;
  }
}
</style> 