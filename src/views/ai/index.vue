<template>
  <div class="ai-knowledge-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>AI知识库管理</span>
          <div>
            <el-upload
              action="#"
              :show-file-list="false"
              :auto-upload="false"
              @change="handleFileUpload"
              style="display: inline-block; margin-right: 10px;"
            >
              <el-button type="success">
                <el-icon><Upload /></el-icon>
                上传知识库文件
              </el-button>
            </el-upload>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增问答
            </el-button>
             <el-button type="warning" @click="handleTrain" :loading="training">
              <el-icon><Refresh /></el-icon>
              {{ training ? '训练中...' : '训练AI模型' }}
            </el-button>
          </div>
        </div>
      </template>

      <!-- 表格区域 -->
      <el-table :data="knowledgeBase" v-loading="loading" style="width: 100%;">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="question" label="问题" min-width="250" />
        <el-table-column prop="answer" label="答案" min-width="350" show-overflow-tooltip/>
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
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类" prop="category">
          <el-input v-model="form.category" placeholder="例如：历史、交通、美食" />
        </el-form-item>
        <el-form-item label="问题" prop="question">
          <el-input v-model="form.question" type="textarea" :rows="2" placeholder="请输入游客可能会问的问题" />
        </el-form-item>
        <el-form-item label="答案" prop="answer">
          <el-input v-model="form.answer" type="textarea" :rows="5" placeholder="请输入对应的标准答案" />
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
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { Plus, Upload, Refresh } from '@element-plus/icons-vue'

const loading = ref(false)
const training = ref(false)
const knowledgeBase = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

const form = ref({
  id: null,
  category: '',
  question: '',
  answer: ''
})

const rules = {
  category: [{ required: true, message: '请输入分类', trigger: 'blur' }],
  question: [{ required: true, message: '请输入问题', trigger: 'blur' }],
  answer: [{ required: true, message: '请输入答案', trigger: 'blur' }],
}

const mockData = [
  { id: 1, category: '交通', question: '怎么去龙潭瀑布？', answer: '您可以从村口乘坐观光车，大约15分钟即可到达龙潭瀑布入口。' },
  { id: 2, category: '美食', question: '这里有什么好吃的？', answer: '龙潭村的特色美食有竹筒饭、烤全羊和各种新鲜的农家菜，推荐您去村中心的农家乐品尝。' },
  { id: 3, category: '住宿', question: '附近有地方住吗？', answer: '村里有多种特色的民宿可供选择，从经济型到高端型都有，您可以在我们的小程序上预订。' },
  { id: 4, category: '历史', question: '古树林有什么来历？', answer: '古树林据说已经有超过500年的历史，其中最大的一棵被当地人称为"神树"，是村子的守护象征。' },
]

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    knowledgeBase.value = mockData
    loading.value = false
  }, 500)
})

const handleFileUpload = (file) => {
  ElMessage.info(`已选择文件：${file.name}，在实际应用中这里会执行上传操作。`)
  // Mock upload and add to knowledge base
  const reader = new FileReader();
  reader.onload = (e) => {
      const content = e.target.result;
      ElMessageBox.alert(`文件内容（模拟）：\n${content.substring(0,100)}...`, '文件上传成功', {
        confirmButtonText: '好的',
        callback: () => {
             ElMessage.success('知识库已更新，请手动点击训练模型')
        }
    });
  };
  reader.readAsText(file.raw);
}

const handleTrain = () => {
    training.value = true;
    ElNotification({
        title: '开始训练',
        message: 'AI模型正在训练中，这可能需要一些时间...',
        type: 'info',
        duration: 3000
    });
    setTimeout(() => {
        training.value = false;
        ElNotification({
            title: '训练完成',
            message: 'AI模型已更新至最新知识库版本。',
            type: 'success',
            duration: 3000
        });
    }, 5000)
}

const handleAdd = () => {
  dialogTitle.value = '新增问答'
  form.value = { id: null, category: '', question: '', answer: '' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑问答'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除问题"${row.question}"吗？`, '提示', {
    type: 'warning',
  }).then(() => {
    knowledgeBase.value = knowledgeBase.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  })
}

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (form.value.id) {
        // Edit
        const index = knowledgeBase.value.findIndex(item => item.id === form.value.id)
        if (index !== -1) knowledgeBase.value[index] = { ...form.value }
      } else {
        // Add
        form.value.id = Math.max(0, ...knowledgeBase.value.map(item => item.id)) + 1
        knowledgeBase.value.unshift({ ...form.value })
      }
      dialogVisible.value = false
      ElMessage.success('保存成功')
    }
  })
}
</script>

<style scoped>
.ai-knowledge-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 