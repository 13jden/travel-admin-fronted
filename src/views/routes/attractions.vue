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

      <!-- 搜索区域 -->
      <div class="search-area" style="margin-bottom: 20px;">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索景点标题"
          style="width: 300px; margin-right: 10px;"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
        <el-button @click="resetSearch">重置</el-button>
      </div>

      <!-- 表格区域 -->
      <el-table :data="attractions" v-loading="loading" style="width: 100%;">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="封面图片" width="120">
          <template #default="scope">
            <el-image 
              style="width: 80px; height: 60px; border-radius: 4px;"
              :src="scope.row.coverImageUrl" 
              :preview-src-list="[scope.row.coverImageUrl]"
              fit="cover"
              preview-teleported
            />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="景点标题" min-width="150" />
        <el-table-column prop="titleEn" label="英文标题" min-width="150" />
        <el-table-column prop="sort" label="排序" width="80" sortable />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isEnable ? 'success' : 'danger'">
              {{ scope.row.isEnable ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleView(scope.row)">查看</el-button>
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="primary" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container" style="margin-top: 20px; text-align: right;">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 查看详情 对话框 -->
    <el-dialog v-model="viewDialogVisible" title="景点详情" width="80%">
      <div v-if="viewData" class="attraction-detail">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <label>景点标题：</label>
              <span>{{ viewData.title }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>英文标题：</label>
              <span>{{ viewData.titleEn }}</span>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <label>景点描述：</label>
              <p>{{ viewData.description }}</p>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>英文描述：</label>
              <p>{{ viewData.descriptionEn }}</p>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <label>排序：</label>
              <span>{{ viewData.sort }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <label>状态：</label>
              <el-tag :type="viewData.isEnable ? 'success' : 'danger'">
                {{ viewData.isEnable ? '启用' : '禁用' }}
              </el-tag>
            </div>
          </el-col>
        </el-row>

        <div class="detail-item">
          <label>景点内容：</label>
          <p>{{ viewData.content }}</p>
        </div>

        <div class="detail-item">
          <label>英文内容：</label>
          <p>{{ viewData.contentEn }}</p>
        </div>

        <div class="detail-item">
          <label>景点图片：</label>
          <div v-if="viewData.images && viewData.images.length > 0" class="detail-images">
            <div class="image-grid">
              <div 
                v-for="(image, index) in viewData.images" 
                :key="image.id"
                class="image-item"
                :class="{ 'is-cover': image.isCover }"
              >
                <el-image
                  :src="image.fileUrl"
                  fit="cover"
                  class="image-preview"
                  :preview-src-list="viewData.images.map(img => img.fileUrl)"
                />
                <div v-if="image.isCover" class="cover-badge">封面</div>
              </div>
            </div>
          </div>
          <div v-else class="no-images">暂无图片</div>
        </div>
      </div>
    </el-dialog>

    <!-- 新增/编辑 对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="80%">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="景点标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入景点标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="英文标题" prop="titleEn">
              <el-input v-model="form.titleEn" placeholder="请输入英文标题" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="景点描述" prop="description">
              <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入景点描述" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="英文描述" prop="descriptionEn">
              <el-input v-model="form.descriptionEn" type="textarea" :rows="3" placeholder="请输入英文描述" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="0" :max="9999" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="isEnable">
              <el-switch v-model="form.isEnable" active-text="启用" inactive-text="禁用" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="景点内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="4" placeholder="请输入景点详细内容" />
        </el-form-item>

        <el-form-item label="英文内容" prop="contentEn">
          <el-input v-model="form.contentEn" type="textarea" :rows="4" placeholder="请输入英文详细内容" />
        </el-form-item>

        <el-form-item label="景点图片" prop="images">
          <div class="image-upload-container">
            <!-- 图片上传区域 -->
            <el-upload
              class="image-uploader"
              :show-file-list="false"
              :before-upload="beforeImageUpload"
              :http-request="handleImageUpload"
              accept="image/*"
              multiple
            >
              <div class="upload-area">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <div class="upload-text">点击或拖拽上传图片</div>
              </div>
            </el-upload>
            
            <!-- 图片列表 - 使用拖拽排序 -->
            <div v-if="form.images && form.images.length > 0" class="image-list">
              <div class="image-list-header">
                <span>已上传图片 ({{ form.images.length }})</span>
              </div>
              <div 
                class="image-grid"
                @dragover.prevent
                @drop="handleDrop"
              >
                <div 
                  v-for="(image, index) in form.images" 
                  :key="image.tempId || image.id"
                  class="image-item" 
                  :class="{ 'is-cover': image.isCover }"
                  draggable="true"
                  @dragstart="handleDragStart(index)"
                  @dragend="handleDragEnd"
                >
                  <el-image
                    :src="image.fileUrl"
                    fit="cover"
                    class="image-preview"
                  />
                  <div class="image-actions">
                    <el-button 
                      v-if="!image.isCover" 
                      type="primary" 
                      size="small" 
                      @click="setCoverImage(index)"
                    >
                      设为封面
                    </el-button>
                    <el-button 
                      type="danger" 
                      size="small" 
                      @click="removeImage(index)"
                    >
                      删除
                    </el-button>
                  </div>
                  <div v-if="image.isCover" class="cover-badge">封面</div>
                  <div class="drag-handle">
                    <el-icon><Rank /></el-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
import { Plus, Search, Rank } from '@element-plus/icons-vue'
import { 
  getAttractions, 
  getAttractionById,
  createAttraction, 
  updateAttraction, 
  deleteAttraction,
  searchAttractions 
} from '@/api/attraction'
import { uploadFile, getFileByUuid, getFileUrl } from '@/api/file'

const loading = ref(false)
const attractions = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 新增查看详情相关状态
const viewDialogVisible = ref(false)
const viewData = ref(null)

const form = ref({
  id: null,
  title: '',
  titleEn: '',
  description: '',
  descriptionEn: '',
  content: '',
  contentEn: '',
  sort: 0,
  coverImageId: null,
  isEnable: true,
  images: [] // 图片列表
})

const rules = {
  title: [{ required: true, message: '请输入景点标题', trigger: 'blur' }],
  titleEn: [{ required: true, message: '请输入英文标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入景点描述', trigger: 'blur' }],
  descriptionEn: [{ required: true, message: '请输入英文描述', trigger: 'blur' }],
  content: [{ required: true, message: '请输入景点内容', trigger: 'blur' }],
  contentEn: [{ required: true, message: '请输入英文内容', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }],
  images: [{ required: true, message: '请至少上传一张图片', trigger: 'change' }],
}

// 获取景点列表
const fetchAttractions = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value - 1,
      size: pageSize.value
    }
    
    let response
    if (searchKeyword.value.trim()) {
      response = await searchAttractions(searchKeyword.value, params)
    } else {
      response = await getAttractions(params)
    }
    
    // 处理景点数据，确保图片URL正确
    const attractionsData = response.data || response
    attractions.value = attractionsData.map(attraction => {
      // 处理封面图片URL - 使用coverImageUuid拼接
      if (attraction.coverImageUuid) {
        attraction.coverImageUrl = getFileUrl(attraction.coverImageUuid)
      }
      
      // 处理景点图片列表 - 使用images字段中的coverImageUuid拼接
      if (attraction.images && attraction.images.length > 0) {
        attraction.images = attraction.images.map(img => ({
          ...img,
          fileUrl: img.coverImageUuid ? getFileUrl(img.coverImageUuid) : null
        }))
      }
      
      return attraction
    })
    
    total.value = response.totalElements || response.total || response.length
  } catch (error) {
    console.error('获取景点列表失败:', error)
    ElMessage.error('获取景点列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAttractions()
})

const handleAdd = () => {
  dialogTitle.value = '新增景点'
  form.value = { 
    id: null,
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    content: '',
    contentEn: '',
    sort: 0,
    coverImageId: null,
    isEnable: true,
    images: []
  }
  dialogVisible.value = true
}

// 查看详情
const handleView = async (row) => {
  try {
    loading.value = true
    const response = await getAttractionById(row.id)
    
    // 处理详情数据，确保图片URL正确
    const detailData = response.data || response
    viewData.value = {
      ...detailData,
      // 处理封面图片URL
      coverImageUrl: detailData.coverImageUuid ? getFileUrl(detailData.coverImageUuid) : null,
      // 处理图片列表 - 使用images字段
      images: detailData.images ? detailData.images.map((img, index) => ({
        ...img,
        fileUrl: img.coverImageUuid ? getFileUrl(img.coverImageUuid) : null,
        isCover: img.id === detailData.coverImageId
      })) : []
    }
    
    viewDialogVisible.value = true
  } catch (error) {
    console.error('获取景点详情失败:', error)
    ElMessage.error('获取景点详情失败')
  } finally {
    loading.value = false
  }
}

// 编辑景点 - 调用详情接口获取完整数据
const handleEdit = async (row) => {
  try {
    loading.value = true
    const response = await getAttractionById(row.id)
    
    // 处理详情数据
    const detailData = response.data || response
    const images = detailData.images || []
    
    form.value = { 
      ...detailData,
      images: images.map((img, index) => ({
        ...img,
        tempId: img.id || `temp_${Date.now()}_${index}`,
        isCover: img.id === detailData.coverImageId,
        // 使用coverImageUuid拼接预览URL
        fileUrl: img.coverImageUuid ? getFileUrl(img.coverImageUuid) : null
      }))
    }
    
    dialogTitle.value = '编辑景点'
    dialogVisible.value = true
  } catch (error) {
    console.error('获取景点详情失败:', error)
    ElMessage.error('获取景点详情失败')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除景点"${row.title}"吗？`, '提示', {
      type: 'warning',
    })
    
    await deleteAttraction(row.id)
    ElMessage.success('删除成功')
    await fetchAttractions()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除景点失败:', error)
      ElMessage.error('删除景点失败')
    }
  }
}

// 提交表单时处理图片数据
const submitForm = async () => {
  try {
    await formRef.value.validate()
    
    // 处理提交数据 - 使用AttractionImageDto.Input结构
    const submitData = {
      title: form.value.title,
      titleEn: form.value.titleEn,
      description: form.value.description,
      descriptionEn: form.value.descriptionEn,
      content: form.value.content,
      contentEn: form.value.contentEn,
      sort: form.value.sort,
      coverImageId: form.value.coverImageId,
      isEnable: form.value.isEnable,
      images: form.value.images.map((img, index) => ({
        imageId: img.id, // 景点图片id
        fileId: img.fileId, // 文件id
        sort: index + 1 // 排序
      }))
    }
    
    if (form.value.id) {
      // 编辑
      await updateAttraction(form.value.id, submitData)
      ElMessage.success('更新成功')
    } else {
      // 新增
      await createAttraction(submitData)
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
    await fetchAttractions()
  } catch (error) {
    console.error('保存景点失败:', error)
    ElMessage.error('保存景点失败')
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchAttractions()
}

const resetSearch = () => {
  searchKeyword.value = ''
  currentPage.value = 1
  fetchAttractions()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchAttractions()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchAttractions()
}

// 图片上传相关
const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  return true
}

// 拖拽相关状态
const draggedIndex = ref(null)
const draggedOverIndex = ref(null)

// 拖拽开始
const handleDragStart = (index) => {
  draggedIndex.value = index
}

// 拖拽结束
const handleDragEnd = () => {
  draggedIndex.value = null
  draggedOverIndex.value = null
}

// 拖拽放置
const handleDrop = (event) => {
  event.preventDefault()
  const dropIndex = Array.from(event.currentTarget.children).indexOf(event.target.closest('.image-item'))
  
  if (draggedIndex.value !== null && dropIndex !== -1 && draggedIndex.value !== dropIndex) {
    // 移动图片
    const draggedImage = form.value.images[draggedIndex.value]
    form.value.images.splice(draggedIndex.value, 1)
    form.value.images.splice(dropIndex, 0, draggedImage)
    
    // 更新排序
    form.value.images.forEach((img, index) => {
      img.sort = index + 1
    })
    
    // 第一张图片自动设为封面
    if (form.value.images.length > 0) {
      form.value.images.forEach((img, index) => {
        img.isCover = index === 0
      })
      form.value.coverImageId = form.value.images[0].fileId
    }
    
    ElMessage.success('图片顺序已更新')
  }
}

// 修改图片上传处理，第一张自动设为封面
const handleImageUpload = async (options) => {
  try {
    const response = await uploadFile(options.file, { folder: 'attractions' })
    
    // 根据后端返回的数据结构，文件信息在data字段中
    const fileData = response.data
    const fileId = fileData.id
    const fileUuid = fileData.uuid
    
    if (fileUuid) {
      // 使用getFileUrl拼接预览URL
      const fileUrl = getFileUrl(fileUuid)
      
      const newImage = {
        tempId: `temp_${Date.now()}_${Math.random()}`,
        fileId: fileId,
        fileUuid: fileUuid,
        fileUrl: fileUrl,
        fileName: options.file.name,
        fileSize: fileData.size,
        fileType: fileData.type,
        sort: form.value.images.length + 1,
        isCover: form.value.images.length === 0 // 第一张图片自动设为封面
      }
      
      form.value.images.push(newImage)
      
      // 如果是第一张图片，设为封面
      if (form.value.images.length === 1) {
        form.value.coverImageId = fileId
      }
      
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error('上传失败：未获取到文件UUID')
    }
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败')
  }
}

// 设置封面图片
const setCoverImage = (index) => {
  form.value.images.forEach((img, i) => {
    img.isCover = i === index
  })
  form.value.coverImageId = form.value.images[index].fileId
  ElMessage.success('已设为封面图片')
}

// 删除图片
const removeImage = (index) => {
  const removedImage = form.value.images[index]
  form.value.images.splice(index, 1)
  
  // 如果删除的是封面图片，重新设置封面
  if (removedImage.isCover && form.value.images.length > 0) {
    form.value.images[0].isCover = true
    form.value.coverImageId = form.value.images[0].fileId
  } else if (form.value.images.length === 0) {
    form.value.coverImageId = null
  }
  
  ElMessage.success('图片已删除')
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
.search-area {
  display: flex;
  align-items: center;
}

/* 图片上传样式 */
.image-upload-container {
  width: 100%;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  width: 120px;
  height: 80px;
  text-align: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: border-color 0.3s;
  margin-right: 10px;
  margin-bottom: 10px;
  float: left;
}

.upload-area:hover {
  border-color: #409eff;
}

.upload-icon {
  font-size: 20px;
  color: #8c939d;
  margin-bottom: 4px;
}

.upload-text {
  color: #606266;
  font-size: 12px;
  line-height: 1.2;
}

.image-list {
  margin-top: 20px;
  clear: both;
}

.image-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-item {
  position: relative;
  border: 2px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.3s;
  width: 120px;
  height: 80px;
  cursor: move;
}

.image-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.image-item.is-cover {
  border-color: #67c23a;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.2);
}

.image-preview {
  width: 100%;
  height: 100%;
  display: block;
}

.image-actions {
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  padding: 2px;
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-item:hover .image-actions {
  opacity: 1;
}

.image-actions .el-button {
  padding: 2px 4px;
  font-size: 10px;
}

.cover-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  background: #67c23a;
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 0 4px 0 0;
}

.drag-handle {
  position: absolute;
  top: 2px;
  left: 2px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 2px;
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-item:hover .drag-handle {
  opacity: 1;
}

.drag-handle .el-icon {
  font-size: 12px;
}

/* 详情页面样式 */
.attraction-detail {
  padding: 20px;
}

.detail-item {
  margin-bottom: 20px;
}

.detail-item label {
  font-weight: bold;
  color: #606266;
  margin-right: 10px;
}

.detail-item p {
  margin: 5px 0;
  line-height: 1.6;
  color: #303133;
}

.detail-images {
  margin-top: 10px;
}

.detail-images .image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.detail-images .image-item {
  position: relative;
  border: 2px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  width: 120px;
  height: 80px;
  cursor: pointer;
}

.detail-images .image-item.is-cover {
  border-color: #67c23a;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.2);
}

.detail-images .image-preview {
  width: 100%;
  height: 100%;
  display: block;
}

.detail-images .cover-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  background: #67c23a;
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 0 4px 0 0;
}

.no-images {
  color: #909399;
  font-style: italic;
}
</style> 