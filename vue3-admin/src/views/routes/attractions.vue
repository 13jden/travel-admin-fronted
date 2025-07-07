<template>
  <div class="attractions-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>景点管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增景点
          </el-button>
        </div>
      </template>

      <!-- 表格区域 -->
      <el-table :data="attractions" v-loading="loading" style="width: 100%;">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="图片" width="120">
          <template #default="scope">
            <el-image 
              style="width: 80px; height: 60px; border-radius: 4px;"
              :src="scope.row.image" 
              :preview-src-list="[scope.row.image]"
              fit="cover"
              preview-teleported
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="景点名称" min-width="150" />
        <el-table-column prop="openingHours" label="开放时间" width="150" />
        <el-table-column label="门票价格" width="120" sortable>
          <template #default="scope">
            <span>{{ scope.row.ticketPrice > 0 ? `¥ ${scope.row.ticketPrice.toFixed(2)}` : '免费' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" min-width="200" />
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
        <el-form-item label="景点名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入景点名称" />
        </el-form-item>
        <el-form-item label="开放时间" prop="openingHours">
          <el-input v-model="form.openingHours" placeholder="例如：08:00 - 18:00" />
        </el-form-item>
        <el-form-item label="门票价格" prop="ticketPrice">
          <el-input-number v-model="form.ticketPrice" :precision="2" :step="1" :min="0" />
        </el-form-item>
        <el-form-item label="景点地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="景点图片" prop="image">
          <el-input v-model="form.image" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="景点描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入景点描述" />
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
const attractions = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

const form = ref({
  id: null,
  name: '',
  openingHours: '08:00 - 18:00',
  ticketPrice: 0,
  address: '',
  image: '',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入景点名称', trigger: 'blur' }],
  openingHours: [{ required: true, message: '请输入开放时间', trigger: 'blur' }],
  address: [{ required: true, message: '请输入景点地址', trigger: 'blur' }],
  image: [{ required: true, message: '请输入图片URL', trigger: 'blur' }],
}

const mockData = [
    { id: 1, name: '龙潭瀑布', openingHours: '全天', ticketPrice: 0, address: '龙潭村东侧山谷', image: 'https://via.placeholder.com/150/87cefa/ffffff?text=Attraction1', description: '非常壮观的瀑布' },
    { id: 2, name: '古树林', openingHours: '08:00 - 18:00', ticketPrice: 20, address: '龙潭村北侧', image: 'https://via.placeholder.com/150/228b22/ffffff?text=Attraction2', description: '拥有百年历史的古树群' },
    { id: 3, name: '观景台', openingHours: '全天', ticketPrice: 0, address: '龙潭村山顶', image: 'https://via.placeholder.com/150/ffdab9/808080?text=Attraction3', description: '可以俯瞰整个村庄的景色' },
    { id: 4, name: '民俗文化馆', openingHours: '09:00 - 17:00', ticketPrice: 15, address: '龙潭村村委会旁', image: 'https://via.placeholder.com/150/d8bfd8/ffffff?text=Attraction4', description: '展示了当地的民俗文化' },
]

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    attractions.value = mockData
    loading.value = false
  }, 500)
})

const handleAdd = () => {
  dialogTitle.value = '新增景点'
  form.value = { id: null, name: '', openingHours: '08:00 - 18:00', ticketPrice: 0, address: '', image: '', description: '' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑景点'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除景点"${row.name}"吗？`, '提示', {
    type: 'warning',
  }).then(() => {
    attractions.value = attractions.value.filter(a => a.id !== row.id)
    ElMessage.success('删除成功')
  })
}

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (form.value.id) {
        // Edit
        const index = attractions.value.findIndex(a => a.id === form.value.id)
        if (index !== -1) attractions.value[index] = { ...form.value }
      } else {
        // Add
        form.value.id = Math.max(0, ...attractions.value.map(a => a.id)) + 1
        attractions.value.unshift({ ...form.value })
      }
      dialogVisible.value = false
      ElMessage.success('保存成功')
    }
  })
}
</script>

<style scoped>
.attractions-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 