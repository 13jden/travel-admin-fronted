<template>
  <div class="product-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品信息管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增商品
          </el-button>
        </div>
      </template>

      <!-- 筛选区域 -->
      <div class="filter-container">
        <el-input
          v-model="filters.name"
          placeholder="请输入商品名称"
          style="width: 200px;"
          clearable
          @keyup.enter="handleFilter"
        />
        <el-select v-model="filters.category" placeholder="请选择分类" clearable style="width: 150px; margin-left: 10px;">
          <el-option label="手工艺品" value="crafts" />
          <el-option label="特色食品" value="food" />
          <el-option label="文创周边" value="merch" />
        </el-select>
        <el-button type="primary" @click="handleFilter" style="margin-left: 10px;">搜索</el-button>
        <el-button @click="resetFilters">重置</el-button>
      </div>

      <!-- 表格区域 -->
      <el-table :data="filteredProducts" v-loading="loading" style="width: 100%; margin-top: 20px;">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="商品图片" width="120">
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
        <el-table-column prop="name" label="商品名称" min-width="180" />
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
    </el-card>

    <!-- 新增/编辑 对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="50%">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择商品分类">
            <el-option label="手工艺品" value="crafts" />
            <el-option label="特色食品" value="food" />
            <el-option label="文创周边" value="merch" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品价格" prop="price">
          <el-input-number v-model="form.price" :precision="2" :step="1" :min="0" />
        </el-form-item>
        <el-form-item label="商品库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" />
        </el-form-item>
        <el-form-item label="上架状态">
          <el-switch v-model="form.status" />
        </el-form-item>
        <el-form-item label="商品图片" prop="image">
          <el-input v-model="form.image" placeholder="请输入图片URL" />
           <!-- TODO: Replace with a real upload component -->
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入商品描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const products = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

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
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入商品库存', trigger: 'blur' }],
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

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    products.value = mockData
    loading.value = false
  }, 500)
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
  dialogTitle.value = '新增商品'
  form.value = { id: null, name: '', category: '', price: 0, stock: 0, status: true, image: '', description: '', sales: 0 }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑商品'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除商品"${row.name}"吗？`, '提示', {
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
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.filter-container {
  margin-bottom: 20px;
}
</style> 