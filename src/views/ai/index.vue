<template>
  <div class="ai-knowledge-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>AI知识库管理</h2>
        <p>管理AI智能助手的知识库内容，包括问答对和文档上传</p>
      </div>
      <div class="header-actions">
        <el-upload
          action="#"
          :show-file-list="false"
          :auto-upload="false"
          @change="handleFileUpload"
        >
          <el-button type="success" class="action-btn">
            <el-icon><Upload /></el-icon>
            上传文件
          </el-button>
        </el-upload>
        <el-button type="primary" class="action-btn" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增问答
        </el-button>
        <el-button type="warning" class="action-btn" @click="handleTrain" :loading="training">
          <el-icon><Refresh /></el-icon>
          {{ training ? '训练中...' : '训练模型' }}
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <el-card class="search-card">
      <el-form :model="filters" class="search-form" inline>
        <el-form-item>
          <el-input
            v-model="filters.question"
            placeholder="请输入问题关键字"
            clearable
            @keyup.enter="handleFilter"
          />
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.category" placeholder="请选择分类" clearable>
            <el-option v-for="category in categories" :key="category" :label="category" :value="category" />
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
        :data="filteredKnowledge" 
        v-loading="loading" 
        class="desktop-table"
        style="width: 100%;"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="scope">
            <el-tag :type="getCategoryTag(scope.row.category)">{{ scope.row.category }}</el-tag>
          </template>
        </el-table-column>
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

    <!-- 移动端列表 -->
    <div class="mobile-list">
      <div v-for="item in filteredKnowledge" :key="item.id" class="mobile-card">
        <!-- 问答头部信息 -->
        <div class="qa-header">
          <div class="qa-title">
            <h3 class="qa-question">{{ item.question }}</h3>
            <el-tag :type="getCategoryTag(item.category)" size="small">{{ item.category }}</el-tag>
          </div>
        </div>

        <!-- 问答详细信息 -->
        <div class="qa-details">
          <div class="details-left">
            <div class="info-row">
              <span class="label">答案：</span>
              <span class="value">{{ item.answer.length > 100 ? item.answer.substring(0, 100) + '...' : item.answer }}</span>
            </div>
          </div>
          
          <div class="details-right">
            <el-button 
              type="primary" 
              class="action-btn"
              @click="handleEdit(item)"
            >
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button 
              type="danger" 
              class="action-btn"
              @click="handleDelete(item)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑 对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle" 
      width="60%" 
      class="qa-dialog"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" class="qa-form">
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类">
            <el-option v-for="category in categories" :key="category" :label="category" :value="category" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题" prop="question">
          <el-input v-model="form.question" type="textarea" :rows="2" placeholder="请输入游客可能会问的问题" />
        </el-form-item>
        <el-form-item label="答案" prop="answer">
          <el-input v-model="form.answer" type="textarea" :rows="5" placeholder="请输入对应的标准答案" />
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
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { Plus, Upload, Refresh, Edit, Delete } from '@element-plus/icons-vue'

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

const filters = reactive({
  question: '',
  category: '',
})

const categories = ['交通', '美食', '住宿', '历史', '景点', '文化', '购物', '其他']

const mockData = [
  { id: 1, category: '交通', question: '怎么去龙潭瀑布？', answer: '您可以从村口乘坐观光车，大约15分钟即可到达龙潭瀑布入口。' },
  { id: 2, category: '美食', question: '这里有什么好吃的？', answer: '龙潭村的特色美食有竹筒饭、烤全羊和各种新鲜的农家菜，推荐您去村中心的农家乐品尝。' },
  { id: 3, category: '住宿', question: '附近有地方住吗？', answer: '村里有多种特色的民宿可供选择，从经济型到高端型都有，您可以在我们的小程序上预订。' },
  { id: 4, category: '历史', question: '古树林有什么来历？', answer: '古树林据说已经有超过500年的历史，其中最大的一棵被当地人称为"神树"，是村子的守护象征。' },
  { id: 5, category: '景点', question: '有哪些必游景点？', answer: '龙潭村的主要景点包括古树林、龙潭瀑布、传统手工艺作坊和农家乐体验区。' },
  { id: 6, category: '文化', question: '可以体验什么传统文化？', answer: '您可以体验传统扎染、竹编工艺、农家生活体验和当地民俗表演。' },
]

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    knowledgeBase.value = mockData
    loading.value = false
  }, 500)
})

const filteredKnowledge = computed(() => {
  return knowledgeBase.value.filter(item => {
    const questionMatch = item.question.toLowerCase().includes(filters.question.toLowerCase())
    const categoryMatch = !filters.category || item.category === filters.category
    return questionMatch && categoryMatch
  })
})

const handleFilter = () => {
  // The computed property already handles filtering
}

const resetFilters = () => {
  filters.question = ''
  filters.category = ''
}

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

const getCategoryTag = (category) => {
  const tagMap = {
    '交通': 'primary',
    '美食': 'success',
    '住宿': 'warning',
    '历史': 'info',
    '景点': 'danger',
    '文化': 'primary',
    '购物': 'success',
    '其他': 'info'
  }
  return tagMap[category] || 'info'
}

</script>

<style scoped>
.ai-knowledge-container {
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

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  height: 40px;
  padding: 0 16px;
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

/* 移动端问答头部区域 */
.qa-header {
  margin-bottom: 16px;
}

.qa-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.qa-question {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

/* 移动端问答详细信息区域 */
.qa-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.details-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.details-right {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.label {
  color: #909399;
  font-size: 14px;
  flex-shrink: 0;
}

.value {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.qa-dialog .el-dialog__body {
  padding: 20px 24px;
}

.qa-form .el-form-item {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-knowledge-container {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-actions {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .action-btn {
    flex: 1;
    min-width: 120px;
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

  .qa-dialog .el-dialog__body {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .ai-knowledge-container {
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

  .qa-header {
    margin-bottom: 12px;
  }

  .action-btn {
    width: 28px;
    height: 28px;
    font-size: 11px;
  }
}
</style> 