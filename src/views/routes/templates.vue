<template>
  <div class="templates-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>路线模板管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增模板
          </el-button>
        </div>
      </template>

      <!-- 表格区域 -->
      <el-table :data="templates" v-loading="loading" style="width: 100%;">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="路线名称" min-width="200" />
        <el-table-column prop="estimatedTime" label="预计用时" width="120" />
        <el-table-column prop="suitableFor" label="适合人群" width="150" />
        <el-table-column label="包含景点" min-width="250">
            <template #default="scope">
                <el-tag v-for="attraction in scope.row.attractions" :key="attraction" style="margin-right: 5px; margin-bottom: 5px;">
                    {{ getAttractionName(attraction) }}
                </el-tag>
            </template>
        </el-table-column>
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
        <el-form-item label="路线名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入路线名称" />
        </el-form-item>
        <el-form-item label="预计用时" prop="estimatedTime">
          <el-input v-model="form.estimatedTime" placeholder="例如：半天、1天" />
        </el-form-item>
        <el-form-item label="适合人群" prop="suitableFor">
          <el-input v-model="form.suitableFor" placeholder="例如：亲子、情侣" />
        </el-form-item>
        <el-form-item label="选择景点" prop="attractions">
          <el-select
            v-model="form.attractions"
            multiple
            filterable
            placeholder="请选择景点"
            style="width: 100%"
          >
            <el-option
              v-for="item in allAttractions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="路线描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入路线描述" />
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
const templates = ref([])
const allAttractions = ref([]) // 用于表单中的景点选择
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

const form = ref({
  id: null,
  name: '',
  estimatedTime: '',
  suitableFor: '',
  attractions: [],
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入路线名称', trigger: 'blur' }],
  estimatedTime: [{ required: true, message: '请输入预计用时', trigger: 'blur' }],
  suitableFor: [{ required: true, message: '请输入适合人群', trigger: 'blur' }],
  attractions: [{ required: true, type: 'array', message: '请至少选择一个景点', trigger: 'change' }],
}

const mockAttractions = [
    { id: 1, name: '龙潭瀑布' },
    { id: 2, name: '古树林' },
    { id: 3, name: '观景台' },
    { id: 4, name: '民俗文化馆' },
]

const mockTemplates = [
    { id: 1, name: '经典一日游', estimatedTime: '1天', suitableFor: '所有人群', attractions: [2, 1, 3], description: '包含核心景点的全日游路线' },
    { id: 2, name: '亲子半日游', estimatedTime: '半天', suitableFor: '家庭亲子', attractions: [4, 2], description: '适合带孩子的轻松半日游' },
    { id: 3, name: '自然风光游', estimatedTime: '半天', suitableFor: '摄影爱好者', attractions: [1, 3], description: '专注于自然风光的路线' },
]

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    templates.value = mockTemplates
    allAttractions.value = mockAttractions
    loading.value = false
  }, 500)
})

const getAttractionName = (id) => {
    return allAttractions.value.find(a => a.id === id)?.name || '未知景点'
}

const handleAdd = () => {
  dialogTitle.value = '新增模板'
  form.value = { id: null, name: '', estimatedTime: '', suitableFor: '', attractions: [], description: '' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑模板'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除路线模板"${row.name}"吗？`, '提示', {
    type: 'warning',
  }).then(() => {
    templates.value = templates.value.filter(t => t.id !== row.id)
    ElMessage.success('删除成功')
  })
}

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (form.value.id) {
        // Edit
        const index = templates.value.findIndex(t => t.id === form.value.id)
        if (index !== -1) templates.value[index] = { ...form.value }
      } else {
        // Add
        form.value.id = Math.max(0, ...templates.value.map(t => t.id)) + 1
        templates.value.unshift({ ...form.value })
      }
      dialogVisible.value = false
      ElMessage.success('保存成功')
    }
  })
}
</script>

<style scoped>
.templates-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 