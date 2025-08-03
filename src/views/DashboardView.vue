<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/apiClient';
import { useAppStore } from '@/stores/app';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from 'chart.js';

// 註冊 Chart.js 所需的元件
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

const appStore = useAppStore();

// 頂部統計卡片的數據
const stats = ref([
  { title: '總使用者數', value: 0, icon: 'mdi-account-group', color: 'primary' },
  { title: '今日訪客', value: '1,234', icon: 'mdi-eye', color: 'success' },
  { title: '總銷售額', value: '$5,678', icon: 'mdi-currency-usd', color: 'warning' },
]);

// 曲線圖的數據
const chartData = ref({
  labels: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'],
  datasets: [
    {
      label: '銷售額 (USD)',
      backgroundColor: '#f87979',
      borderColor: '#f87979',
      data: [40, 39, 10, 40, 39, 80, 40],
      tension: 0.2, // 使線條更平滑
    },
  ],
});

// 曲線圖的設定選項
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: '每週銷售趨勢',
    },
  },
});

const fetchStats = async () => {
  appStore.setGlobalLoading(true);
  try {
    const response = await apiClient.get('/users');
    stats.value[0].value = response.data.length;
  } catch (error)
{
    console.error('Failed to fetch stats:', error);
    appStore.showSnackbar('無法載入儀表板數據', 'error');
  } finally {
    appStore.setGlobalLoading(false);
  }
};

onMounted(fetchStats);
</script>

<template>
  <v-container fluid>
    <!-- 頂部統計卡片 -->
    <v-row>
      <v-col cols="12" sm="6" md="4" v-for="stat in stats" :key="stat.title">
        <v-card class="pa-3" rounded="lg">
          <div class="d-flex align-center">
            <v-avatar :color="stat.color" rounded="lg" size="60">
              <v-icon :icon="stat.icon" size="30" color="white"></v-icon>
            </v-avatar>
            <div class="ml-4">
              <div class="text-h4 font-weight-bold">{{ stat.value }}</div>
              <div class="text-grey">{{ stat.title }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 新增的圖表區塊 -->
    <v-row>
      <v-col cols="12">
        <v-card rounded="lg">
          <v-card-title>數據分析</v-card-title>
          <v-card-text>
            <div style="height: 400px">
              <Line :data="chartData" :options="chartOptions" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
