<template>
  <div class="dashboard-v2-container">
    <!-- 头部 -->
    <el-row :gutter="20" class="header-row">
      <el-col>
        <div class="welcome-card">
          <div class="welcome-text">
            <h2>你好, Admin!</h2>
            <p>欢迎回到龙潭村数字旅游管理后台，祝你拥有高效愉快的一天！</p>
          </div>
          <div class="weather-info">
            <span>龙潭村</span>
            <span>晴 26°C</span>
            <el-icon><Sunny /></el-icon>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-row :gutter="20">
      <el-col v-for="action in quickActions" :key="action.title" :span="6">
        <div class="quick-action-card" :style="{ background: action.color }" @click="() => {}">
          <el-icon><component :is="action.icon" /></el-icon>
          <span>{{ action.title }}</span>
        </div>
      </el-col>
    </el-row>

    <!-- 数据卡片 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="card in statCards" :key="card.title">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-header">
            <span class="stat-title">{{ card.title }}</span>
            <el-tag :type="card.trend >= 0 ? 'success' : 'danger'" size="small" effect="dark">
              {{ card.trend >= 0 ? '+' : '' }}{{ card.trend }}%
            </el-tag>
          </div>
          <div class="stat-card-content">
            <count-to
                :start-val="0"
                :end-val="card.value"
                :duration="2000"
                :prefix="card.prefix"
                class="stat-value"
              />
          </div>
           <div class="stat-card-footer">
            <span>较昨日</span>
            <el-icon :color="card.trend >= 0 ? '#67c23a' : '#f56c6c'">
                <component :is="card.trend >= 0 ? 'CaretTop' : 'CaretBottom'" />
            </el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 中部图表和列表 -->
    <el-row :gutter="20" class="main-content-row">
      <!-- 游客流量趋势 -->
      <el-col :span="16">
        <el-card shadow="hover" class="chart-card">
           <template #header>
            <div class="card-header">
              <span>游客流量趋势</span>
              <el-radio-group v-model="timeRange" size="small" @change="initMainChart">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="mainChart" class="chart"></div>
        </el-card>
      </el-col>

      <!-- 收入分析 -->
      <el-col :span="8">
        <el-card shadow="hover" class="pie-chart-card">
          <template #header>
            <div class="card-header">
              <span>收入分析</span>
            </div>
          </template>
          <div ref="pieChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部表格 -->
     <el-row :gutter="20">
      <el-col :span="16">
         <el-card shadow="hover" class="table-card">
          <template #header>
            <div class="card-header">
              <span>热门景点/产品排行</span>
               <el-tag type="danger" effect="dark" size="small">Top 5</el-tag>
            </div>
          </template>
          <el-table :data="hotContents" style="width: 100%" v-loading="hotContentsLoading">
            <el-table-column label="排名" width="80">
              <template #default="scope">
                <div class="rank" :class="{ 'top-rank': scope.$index < 3 }">{{ scope.$index + 1 }}</div>
              </template>
            </el-table-column>
            <el-table-column label="名称" min-width="200" show-overflow-tooltip prop="title" />
            <el-table-column label="类型" width="120">
                <template #default="scope">
                    <el-tag :type="scope.row.type === '景点' ? 'warning' : 'success'">{{ scope.row.type }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="热度" width="120" align="right" prop="heat" sortable>
                <template #default="scope">
                    {{ formatNumber(scope.row.heat || 0) }}
                </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="todo-list-card">
          <template #header>
            <div class="card-header">
              <span>待办事项</span>
              <el-button type="primary" size="small" plain>查看全部</el-button>
            </div>
          </template>
          <div v-for="item in todoList" :key="item.id" class="todo-item">
            <el-checkbox :model-value="item.done" :label="item.text" />
            <el-tag :type="item.tagType || 'info'" size="small">{{ item.tag }}</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { CountTo } from 'vue3-count-to'
import { 
  Plus, 
  Goods,
  Guide,
  Tickets,
  Sunny,
  CaretTop,
  CaretBottom
} from '@element-plus/icons-vue'

const quickActions = ref([
  { title: '发布攻略', icon: 'Guide', color: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)' },
  { title: '添加商品', icon: 'Goods', color: 'linear-gradient(to right, #fa709a 0%, #fee140 100%)' },
  { title: '创建路线', icon: 'Tickets', color: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)' },
  { title: '添加内容', icon: 'Plus', color: 'linear-gradient(to right, #6a82fb 0%, #fc5c7d 100%)' },
])

// 统计卡片数据
const statCards = ref([
  { title: '今日游客', value: 1258, trend: 15.2, prefix: '' },
  { title: '销售总额', value: 8650, trend: 8.3, prefix: '¥' },
  { title: '路线规划', value: 756, trend: -5.7, prefix: '' },
  { title: 'AI问答', value: 2431, trend: 20.1, prefix: '' },
])

const todoList = ref([
  { id: 1, text: '审核新的用户评论', done: false, tag: '评论', tagType: 'primary' },
  { id: 2, text: '更新本周热门活动', done: false, tag: '运营', tagType: 'success' },
  { id: 3, text: '处理商品退款申请', done: true, tag: '电商', tagType: 'warning' },
  { id: 4, text: '检查服务器状态', done: false, tag: '系统', tagType: 'danger' },
  { id: 5, text: '准备月度运营报告', done: false, tag: '报告', tagType: 'info' },
])

const timeRange = ref('week')
const hotContentsLoading = ref(false)
const hotContents = ref([])

const formatNumber = (num) => {
  return num >= 10000 ? (num / 10000).toFixed(1) + '万' : num
}

let mainChartInstance = null
let pieChartInstance = null
const mainChart = ref(null)
const pieChart = ref(null)

const initMainChart = () => {
  if (!mainChart.value) return
  mainChartInstance = echarts.init(mainChart.value)
  const days = timeRange.value === 'week' 
    ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    : Array.from({length: 30}, (_, i) => `${i+1}日`)
  
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: days },
    yAxis: { type: 'value' },
    series: [{
      name: '游客数量',
      type: 'line',
      smooth: true,
      data: generateRandomData(800, 500, days.length),
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(58,132,255,0.5)' },
          { offset: 1, color: 'rgba(58,132,255,0)' }
        ])
      }
    }]
  }
  mainChartInstance.setOption(option)
}

const initPieChart = () => {
  if (!pieChart.value) return
  pieChartInstance = echarts.init(pieChart.value)
  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
    legend: { orient: 'horizontal', bottom: '0', },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: { show: false },
      data: [
        { value: 8650, name: '文创商品' },
        { value: 12800, name: '门票' },
        { value: 5500, name: '特色项目' },
        { value: 3200, name: '餐饮' },
        { value: 2100, name: '其他' }
      ]
    }]
  }
  pieChartInstance.setOption(option)
}

const generateRandomData = (base, range, length) => {
  return Array.from({length}, () => Math.floor(base + Math.random() * range))
}

const fetchHotContents = () => {
  hotContentsLoading.value = true;
  setTimeout(() => {
    hotContents.value = [
      { id: 1, title: '古树林', type: '景点', heat: 25487 },
      { id: 2, title: '手工扎染体验', type: '产品', heat: 18935 },
      { id: 3, title: '龙潭瀑布', type: '景点', heat: 14578 },
      { id: 4, title: '特色竹筒饭', type: '产品', heat: 9876 },
      { id: 5, title: '观景台', type: '景点', heat: 8563 },
    ];
    hotContentsLoading.value = false;
  }, 500);
}

onMounted(() => {
  nextTick(() => {
    initMainChart()
    initPieChart()
    fetchHotContents()
    
    const resizeCharts = () => {
        mainChartInstance && mainChartInstance.resize()
        pieChartInstance && pieChartInstance.resize()
    }
    window.addEventListener('resize', resizeCharts)
  })
})
</script>

<style lang="scss" scoped>
.dashboard-v2-container {
  padding: 20px;
  background-color: #f7f8fa;
  
  .header-row, .quick-action-card, .el-card, .main-content-row > .el-col > .el-card {
    margin-bottom: 20px;
  }

  .welcome-card {
    background: linear-gradient(135deg, #434343 0%, #000000 100%);
    color: white;
    padding: 20px 30px;
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0 0 5px 0;
      font-size: 24px;
    }
    p {
      margin: 0;
      font-size: 14px;
      opacity: 0.8;
    }

    .weather-info {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 16px;
      .el-icon { font-size: 24px; color: #ffc83d; }
    }
  }

  .quick-action-card {
    color: white;
    padding: 20px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
    }
    
    .el-icon {
      font-size: 28px;
      margin-bottom: 10px;
    }
    
    span {
      font-weight: 600;
    }
  }
  
  .stat-card {
    border-radius: 12px;
    border: none;
    .stat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      .stat-title { color: #606266; font-size: 14px; }
    }
    .stat-card-content .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #303133;
    }
    .stat-card-footer {
      margin-top: 10px;
      font-size: 12px;
      color: #909399;
      display: flex;
      align-items: center;
      .el-icon { margin-left: 4px; }
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    span { font-size: 16px; font-weight: 600; }
  }

  .chart-card, .pie-chart-card {
    border-radius: 12px;
    height: 400px;
    .chart { height: calc(100% - 60px); width: 100%; }
  }
  .pie-chart-card .chart {
    height: calc(100% - 60px);
  }

  .table-card {
    border-radius: 12px;
    .rank {
      width: 24px;
      height: 24px;
      background-color: #f0f2f5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }
    .top-rank {
      background: linear-gradient(135deg, #fccb90 0%, #d57eeb 100%);
      color: white;
    }
  }

  .todo-list-card {
    border-radius: 12px;
    height: 100%;
    .todo-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #f0f2f5;
      &:last-child { border-bottom: none; }
      .el-checkbox {
        flex: 1;
        :deep(.el-checkbox__label) {
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
      }
    }
  }
}
</style> 