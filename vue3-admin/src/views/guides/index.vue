<template>
  <div class="guides-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>旅游攻略管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新建攻略
          </el-button>
        </div>
      </template>

      <!-- 筛选区域 -->
      <div class="filter-container">
        <el-input
          v-model="filters.title"
          placeholder="请输入标题关键字"
          style="width: 200px;"
          clearable
          @keyup.enter="handleFilter"
        />
        <el-select v-model="filters.type" placeholder="请选择类型" clearable style="width: 150px; margin-left: 10px;">
          <el-option v-for="item in guideTypes" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" @click="handleFilter" style="margin-left: 10px;">搜索</el-button>
        <el-button @click="resetFilters">重置</el-button>
      </div>

      <!-- 表格区域 -->
      <el-table :data="filteredGuides" v-loading="loading" style="width: 100%; margin-top: 20px;">
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

    <!-- 新增/编辑 对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="60%">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
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