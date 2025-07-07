<template>
  <div class="category-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品分类管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增分类
          </el-button>
        </div>
      </template>

      <!-- 表格区域 -->
      <el-table :data="categories" v-loading="loading" style="width: 100%;">
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
    </el-card>

    <!-- 新增/编辑 对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="400px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const categories = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

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

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    categories.value = mockData
    loading.value = false
  }, 500)
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
  ElMessageBox.confirm(`确定删除分类“${row.name}”吗？`, '提示', {
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
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 