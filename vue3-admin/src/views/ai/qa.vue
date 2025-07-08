<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>AI问答管理</span>
          <el-button type="primary" @click="handleAdd">新增问答</el-button>
        </div>
      </template>
      
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="问题内容">
          <el-input v-model="queryParams.question" placeholder="请输入问题关键词" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="qaList" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="question" label="问题" show-overflow-tooltip />
        <el-table-column prop="answer" label="回答" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="pagination"
      />
    </el-card>
    
    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="50%"
      :before-close="handleDialogClose"
    >
      <el-form :model="qaForm" :rules="rules" ref="qaFormRef" label-width="80px">
        <el-form-item label="问题" prop="question">
          <el-input v-model="qaForm.question" type="textarea" :rows="2" placeholder="请输入问题内容" />
        </el-form-item>
        <el-form-item label="回答" prop="answer">
          <el-input v-model="qaForm.answer" type="textarea" :rows="5" placeholder="请输入回答内容" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="qaForm.category" placeholder="请选择分类">
            <el-option label="景点介绍" value="景点介绍" />
            <el-option label="旅游指南" value="旅游指南" />
            <el-option label="当地美食" value="当地美食" />
            <el-option label="交通信息" value="交通信息" />
            <el-option label="民俗文化" value="民俗文化" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 查询参数
const queryParams = reactive({
  question: '',
  page: 1,
  pageSize: 10
})

// 数据列表
const qaList = ref([])
const loading = ref(false)

// 表单参数
const dialogVisible = ref(false)
const dialogTitle = ref('新增问答')
const qaForm = reactive({
  id: null,
  question: '',
  answer: '',
  category: '',
  createTime: ''
})
const qaFormRef = ref(null)

// 表单校验规则
const rules = {
  question: [{ required: true, message: '请输入问题内容', trigger: 'blur' }],
  answer: [{ required: true, message: '请输入回答内容', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

// 初始化
onMounted(() => {
  getList()
})

// 获取列表数据
const getList = () => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    // 这里应该是实际的API调用
    const mockData = [
      {
        id: 1,
        question: '当地有哪些著名景点?',
        answer: '我们这里有美丽的山水风光、历史文化遗址、民俗村落等多个著名景点。主要包括青山绿水风景区、古镇老街、传统民居群等，每个景点都有其独特的魅力。',
        category: '景点介绍',
        createTime: '2023-06-15 09:30:45'
      },
      {
        id: 2,
        question: '当地特色美食有哪些?',
        answer: '我们这里的特色美食非常丰富，有农家土菜、传统小吃、特色点心等。比如山野菜、土窑鸡、农家豆腐、手工面点等，都是游客喜爱的美食。',
        category: '当地美食',
        createTime: '2023-06-16 14:22:33'
      },
      {
        id: 3,
        question: '如何前往景区?',
        answer: '您可以选择多种交通方式前往景区。公共交通有旅游专线大巴，每天早上8点到晚上6点，每小时一班。自驾的话，导航到"青山绿水景区"即可，景区有专门的停车场。',
        category: '交通信息',
        createTime: '2023-06-17 11:15:20'
      }
    ]
    
    qaList.value = mockData
    total.value = mockData.length
    loading.value = false
  }, 300)
}

// 查询
const handleQuery = () => {
  queryParams.page = 1
  getList()
}

// 重置查询
const resetQuery = () => {
  queryParams.question = ''
  handleQuery()
}

// 页码变化
const handleCurrentChange = (val) => {
  queryParams.page = val
  getList()
}

// 每页条数变化
const handleSizeChange = (val) => {
  queryParams.pageSize = val
  getList()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增问答'
  Object.keys(qaForm).forEach(key => {
    qaForm[key] = key === 'id' ? null : ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑问答'
  Object.assign(qaForm, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确认删除问题 "${row.question}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用删除API
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {
    // 取消删除
  })
}

// 关闭对话框
const handleDialogClose = () => {
  dialogVisible.value = false
}

// 提交表单
const submitForm = () => {
  qaFormRef.value.validate((valid) => {
    if (valid) {
      // 这里应该调用保存API
      if (qaForm.id) {
        // 编辑
        ElMessage.success('编辑成功')
      } else {
        // 新增
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      getList()
    }
  })
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 