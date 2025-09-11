<template>
  <div class="orders-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>订单管理</h2>
        <p>管理用户订单信息</p>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="filters" inline class="search-form">
        <el-form-item label="订单号">
          <el-input
            v-model="filters.orderId"
            placeholder="请输入订单号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="filters.status" placeholder="订单状态" clearable style="width: 150px">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
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

    <!-- 订单列表 -->
    <el-card class="table-card" shadow="never">
      <!-- 桌面端表格 -->
      <el-table 
        :data="filteredOrders" 
        v-loading="loading" 
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        class="desktop-table"
      >
        <el-table-column prop="id" label="订单号" min-width="180" />
        <el-table-column prop="customer" label="下单用户" min-width="120" />
        <el-table-column label="订单金额" width="120" sortable>
          <template #default="scope">
            <span>¥ {{ scope.row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下单时间" width="180" sortable />
        <el-table-column label="订单状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)">{{ formatStatus(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleViewDetails(scope.row)">查看详情</el-button>
            <el-button v-if="scope.row.status === 'pending'" type="success" link @click="handleMarkAsPaid(scope.row)">标记付款</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 移动端卡片列表 -->
      <div class="mobile-list" v-if="isMobile">
        <div 
          v-for="order in filteredOrders" 
          :key="order.id"
          class="mobile-card"
        >
          <div class="card-header">
            <div class="card-title">
              <span class="order-id">{{ order.id }}</span>
              <el-tag :type="getStatusTag(order.status)" size="small">
                {{ formatStatus(order.status) }}
              </el-tag>
            </div>
            <div class="card-actions">
              <el-button size="small" type="primary" @click="handleViewDetails(order)">
                <el-icon><View /></el-icon>
              </el-button>
              <el-button v-if="order.status === 'pending'" size="small" type="success" @click="handleMarkAsPaid(order)">
                <el-icon><Check /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="card-content">
            <div class="info-row">
              <span class="label">下单用户：</span>
              <span class="value">{{ order.customer }}</span>
            </div>
            <div class="info-row">
              <span class="label">订单金额：</span>
              <span class="value amount">¥{{ order.amount.toFixed(2) }}</span>
            </div>
            <div class="info-row">
              <span class="label">下单时间：</span>
              <span class="value">{{ order.createdAt }}</span>
            </div>
            <div class="info-row">
              <span class="label">收货地址：</span>
              <span class="value">{{ order.address }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 订单详情 对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      title="订单详情" 
      :width="isMobile ? '95%' : '60%'"
      :close-on-click-modal="false"
      class="order-dialog"
    >
      <div v-if="currentOrder">
        <el-descriptions :column="isMobile ? 1 : 2" border>
          <el-descriptions-item label="订单号">{{ currentOrder.id }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ currentOrder.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="下单用户">{{ currentOrder.customer }}</el-descriptions-item>
          <el-descriptions-item label="订单金额">
            <el-tag size="small">¥ {{ currentOrder.amount.toFixed(2) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusTag(currentOrder.status)">{{ formatStatus(currentOrder.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="收货地址">{{ currentOrder.address }}</el-descriptions-item>
        </el-descriptions>

        <h3 style="margin-top: 20px;">商品列表</h3>
        <el-table :data="currentOrder.items" border>
          <el-table-column prop="name" label="商品名称" />
          <el-table-column label="单价" width="120">
            <template #default="scope">¥ {{ scope.row.price.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column label="小计" width="120">
            <template #default="scope">¥ {{ (scope.row.price * scope.row.quantity).toFixed(2) }}</template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, View, Check } from '@element-plus/icons-vue'

const loading = ref(false)
const orders = ref([])
const dialogVisible = ref(false)
const currentOrder = ref(null)
const isMobile = ref(false)

const filters = reactive({
  orderId: '',
  status: '',
})

const statusOptions = [
  { value: 'pending', label: '待付款' },
  { value: 'paid', label: '待发货' },
  { value: 'shipped', label: '已发货' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
]

const mockData = [
    { 
        id: '202310260001', customer: '张三', amount: 88.00, createdAt: '2023-10-26 10:30:00', status: 'completed',
        address: '龙潭村一号院',
        items: [{ name: '手工扎染帆布包', price: 88.00, quantity: 1 }]
    },
    { 
        id: '202310260002', customer: '李四', amount: 83.00, createdAt: '2023-10-26 11:00:00', status: 'shipped',
        address: '龙潭村二号院',
        items: [
            { name: '龙潭特色蜂蜜', price: 58.00, quantity: 1 },
            { name: '龙潭风景明信片', price: 25.00, quantity: 1 }
        ]
    },
    { 
        id: '202310250001', customer: '王五', amount: 18.00, createdAt: '2023-10-25 14:00:00', status: 'paid',
        address: '龙潭村三号院',
        items: [{ name: '风味豆干', price: 18.00, quantity: 1 }]
    },
    { 
        id: '202310240003', customer: '赵六', amount: 120.00, createdAt: '2023-10-24 18:00:00', status: 'pending',
        address: '龙潭村四号院',
        items: [{ name: '手工竹编', price: 120.00, quantity: 1 }]
    },
     { 
        id: '202310240001', customer: '孙七', amount: 25.00, createdAt: '2023-10-24 09:00:00', status: 'cancelled',
        address: '龙潭村五号院',
        items: [{ name: '龙潭风景明信片', price: 25.00, quantity: 1 }]
    },
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
    orders.value = mockData
    loading.value = false
  }, 500)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

const filteredOrders = computed(() => {
  return orders.value.filter(o => {
    const idMatch = o.id.includes(filters.orderId)
    const statusMatch = !filters.status || o.status === filters.status
    return idMatch && statusMatch
  })
})

const handleFilter = () => {}

const resetFilters = () => {
  filters.orderId = ''
  filters.status = ''
}

const handleViewDetails = (row) => {
  currentOrder.value = row
  dialogVisible.value = true
}

const handleMarkAsPaid = (row) => {
    ElMessageBox.confirm(`确定将订单"${row.id}"标记为已付款吗？`, '提示', {
        type: 'info'
    }).then(() => {
        const order = orders.value.find(o => o.id === row.id)
        if(order) order.status = 'paid'
        ElMessage.success('操作成功')
    })
}

const formatStatus = (status) => {
  return statusOptions.find(s => s.value === status)?.label || '未知'
}

const getStatusTag = (status) => {
    const map = {
        pending: 'warning',
        paid: 'primary',
        shipped: 'info',
        completed: 'success',
        cancelled: 'danger',
    }
    return map[status] || ''
}
</script>

<style scoped>
.orders-container {
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
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-id {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
}

.label {
  color: #909399;
  font-size: 14px;
  min-width: 80px;
}

.value {
  color: #606266;
  font-size: 14px;
  flex: 1;
}

.amount {
  color: #f56c6c;
  font-weight: 600;
}

.order-dialog .el-dialog__body {
  padding: 20px 24px;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .orders-container {
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

  .order-dialog .el-dialog__body {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .orders-container {
    padding: 12px;
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

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .card-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style> 