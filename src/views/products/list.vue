<template>
  <div class="product-list-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>文创产品管理</h2>
        <p>管理文创产品信息和库存</p>
      </div>
      <el-button type="primary" @click="handleAdd" class="add-btn">
        <el-icon><Plus /></el-icon>
        新增产品
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="filters" inline class="search-form">
        <el-form-item label="产品名称">
          <el-input
            v-model="filters.name"
            placeholder="请输入产品名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleFilter"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="filters.category" placeholder="请选择分类" clearable style="width: 150px; margin-left: 10px;">
            <el-option label="手工艺品" value="crafts" />
            <el-option label="特色食品" value="food" />
            <el-option label="文创周边" value="merch" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetFilters">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 产品列表 -->
    <el-card class="table-card" shadow="never">
      <!-- 桌面端表格 -->
      <el-table 
        :data="filteredProducts" 
        v-loading="loading" 
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        class="desktop-table"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="产品图片" width="120">
          <template #default="scope">
            <el-image 
              style="width: 80px; height: 80px; border-radius: 4px;"
              :src="scope.row.image" 
              :preview-src-list="[scope.row.image]"
              fit="cover"
              preview-teleported
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="产品名称" min-width="180" />
        <el-table-column label="分类" width="120">
          <template #default="scope">
            <el-tag>{{ formatCategory(scope.row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="120" sortable>
            <template #default="scope">
                <span>¥ {{ scope.row.price.toFixed(2) }}</span>
            </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" sortable />
        <el-table-column label="上架状态" width="120">
          <template #default="scope">
            <el-switch v-model="scope.row.status" @change="handleStatusChange(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="100" sortable />
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
          v-for="product in filteredProducts" 
          :key="product.id"
          class="mobile-card"
        >
          <!-- 产品图片 - 占一行 -->
          <div class="product-image-section">
            <el-image 
              style="width: 100%; height: 200px; border-radius: 8px;"
              :src="product.image" 
              fit="cover"
            />
          </div>
          
          <!-- 产品信息区域 -->
          <div class="product-info-section">
            <div class="product-header">
              <div class="product-title">
                <span class="product-name">{{ product.name }}</span>
                <el-tag>{{ formatCategory(product.category) }}</el-tag>
              </div>
            </div>
            
            <div class="product-details">
              <div class="details-left">
                <div class="info-row">
                  <span class="label">价格：</span>
                  <span class="value price">¥{{ product.price.toFixed(2) }}</span>
                </div>
                <div class="info-row">
                  <span class="label">库存：</span>
                  <span class="value">{{ product.stock }}</span>
                </div>
                <div class="info-row">
                  <span class="label">销量：</span>
                  <span class="value">{{ product.sales }}</span>
                </div>
                <div class="info-row">
                  <span class="label">状态：</span>
                  <el-switch 
                    v-model="product.status" 
                    @change="handleStatusChange(product)"
                    size="small"
                  />
                </div>
              </div>
              
              <!-- 操作按钮 - 固定在右侧 -->
              <div class="details-right">
                <div style="padding-right: -10px;">
                   <el-button size="small" type="primary" @click="handleEdit(product)" class="action-btn">
                  <el-icon><Edit /></el-icon>
                </el-button>
                </div>
               
                <div style="padding-right: 10px;">
                  <el-button size="small" type="danger"  @click="handleDelete(product)" class="action-btn">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 新增/编辑 对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle" 
      :width="isMobile ? '95%' : '50%'"
      :close-on-click-modal="false"
      class="product-dialog"
    >
      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="rules" 
        :label-width="isMobile ? '80px' : '100px'"
        class="product-form"
      >
        <el-row :gutter="20">
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="产品名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入产品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="产品分类" prop="category">
              <el-select v-model="form.category" placeholder="请选择产品分类" style="width: 100%">
                <el-option label="手工艺品" value="crafts" />
                <el-option label="特色食品" value="food" />
                <el-option label="文创周边" value="merch" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="产品价格" prop="price">
              <el-input-number v-model="form.price" :precision="2" :step="1" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="产品库存" prop="stock">
              <el-input-number v-model="form.stock" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="上架状态">
              <el-switch v-model="form.status" />
            </el-form-item>
          </el-col>
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="产品图片" prop="image">
              <el-input v-model="form.image" placeholder="请输入图片URL" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="产品描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入产品描述" />
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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete } from '@element-plus/icons-vue'

const loading = ref(false)
const products = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
const isMobile = ref(false)

const form = ref({
  id: null,
  name: '',
  category: '',
  price: 0,
  stock: 0,
  status: true,
  image: '',
  description: '',
  sales: 0
})

const rules = {
  name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择产品分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入产品价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入产品库存', trigger: 'blur' }],
  image: [{ required: true, message: '请输入图片URL', trigger: 'blur' }],
}

const filters = reactive({
  name: '',
  category: '',
})

const mockData = [
    { id: 1, name: '手工扎染帆布包', category: 'crafts', price: 88.00, stock: 100, status: true, image: 'https://via.placeholder.com/150/f0f8ff/808080?text=Product1', sales: 50 },
    { id: 2, name: '龙潭特色蜂蜜', category: 'food', price: 58.00, stock: 200, status: true, image: 'https://via.placeholder.com/150/f5f5dc/808080?text=Product2', sales: 120 },
    { id: 3, 'name': '龙潭风景明信片', category: 'merch', price: 25.00, stock: 500, status: true, image: 'https://via.placeholder.com/150/e6e6fa/808080?text=Product3', sales: 300 },
    { id: 4, name: '手工竹编', category: 'crafts', price: 120.00, stock: 50, status: false, image: 'https://via.placeholder.com/150/fff0f5/808080?text=Product4', sales: 10 },
    { id: 5, name: '风味豆干', category: 'food', price: 18.00, stock: 300, status: true, image: 'https://via.placeholder.com/150/d2b48c/808080?text=Product5', sales: 250 },
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
    products.value = mockData
    loading.value = false
  }, 500)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const nameMatch = p.name.toLowerCase().includes(filters.name.toLowerCase())
    const categoryMatch = !filters.category || p.category === filters.category
    return nameMatch && categoryMatch
  })
})

const handleFilter = () => {}

const resetFilters = () => {
  filters.name = ''
  filters.category = ''
}

const handleAdd = () => {
  dialogTitle.value = '新增产品'
  form.value = { id: null, name: '', category: '', price: 0, stock: 0, status: true, image: '', description: '', sales: 0 }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑产品'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除产品"${row.name}"吗？`, '提示', {
    type: 'warning',
  }).then(() => {
    products.value = products.value.filter(p => p.id !== row.id)
    ElMessage.success('删除成功')
  })
}

const handleStatusChange = (row) => {
  ElMessage.success(`"${row.name}" 的状态已更新`)
}

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (form.value.id) {
        // Edit
        const index = products.value.findIndex(p => p.id === form.value.id)
        if (index !== -1) products.value[index] = { ...form.value }
      } else {
        // Add
        form.value.id = Math.max(0, ...products.value.map(p => p.id)) + 1
        products.value.unshift({ ...form.value })
      }
      dialogVisible.value = false
      ElMessage.success('保存成功')
    }
  })
}

const formatCategory = (category) => {
  const map = { crafts: '手工艺品', food: '特色食品', merch: '文创周边' }
  return map[category] || '未知'
}
</script>

<style scoped>
.product-list-container {
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

/* 移动端产品图片区域 */
.product-image-section {
  margin-bottom: 16px;
}

/* 移动端产品信息区域 */
.product-info-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.product-name {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

.product-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 120px; /* 确保有足够的高度让内容垂直居中 */
}

.details-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding-right: 60px; /* 为右侧操作按钮留出空间 */
}

.details-right {
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

.price {
  color: #f56c6c;
  font-weight: 600;
}

.product-dialog .el-dialog__body {
  padding: 20px 24px;
}

.product-form .el-form-item {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-list-container {
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

  .product-dialog .el-dialog__body {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .product-list-container {
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

  .product-image-section {
    margin-bottom: 12px;
  }

  .details-left {
    padding-right: 50px; /* 小屏幕时减少右侧空间 */
  }

  .action-btn {
    width: 36px;
    height: 36px;
  }
}
</style> 