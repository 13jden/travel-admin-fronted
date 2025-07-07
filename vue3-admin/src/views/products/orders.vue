<template>
  <div class="orders-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
        </div>
      </template>

      <!-- 筛选区域 -->
      <div class="filter-container">
        <el-input
          v-model="filters.orderId"
          placeholder="请输入订单号"
          style="width: 200px;"
          clearable
        />
        <el-select v-model="filters.status" placeholder="订单状态" clearable style="width: 150px; margin-left: 10px;">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" @click="handleFilter" style="margin-left: 10px;">搜索</el-button>
        <el-button @click="resetFilters">重置</el-button>
      </div>

      <!-- 表格区域 -->
      <el-table :data="filteredOrders" v-loading="loading" style="width: 100%; margin-top: 20px;">
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
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleViewDetails(scope.row)">查看详情</el-button>
            <el-button v-if="scope.row.status === 'pending'" type="success" link @click="handleMarkAsPaid(scope.row)">标记付款</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 订单详情 对话框 -->
    <el-dialog v-model="dialogVisible" title="订单详情" width="60%">
      <div v-if="currentOrder">
        <el-descriptions :column="2" border>
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
        <el-button @click="dialogVisible = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const orders = ref([])
const dialogVisible = ref(false)
const currentOrder = ref(null)

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

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    orders.value = mockData
    loading.value = false
  }, 500)
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