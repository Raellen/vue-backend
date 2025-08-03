<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
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
  Filler,
} from 'chart.js';

// 註冊 Chart.js 所需的元件
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
);

const router = useRouter();
const appStore = useAppStore();

// 頂部統計卡片的數據
const stats = ref([
  { title: '總使用者數', value: 0, icon: 'mdi-account-group', color: 'primary', link: '/users' },
  { title: '總銷售額', value: 0, icon: 'mdi-currency-usd', color: 'success', link: '/sales' },
  { title: '今日訪客', value: '1,234', icon: 'mdi-eye', color: 'warning', link: null },
]);

// 曲線圖的數據 (初始為空)
const chartData = ref({
  labels: [],
  datasets: [
    {
      label: '銷售額 (USD)',
      borderColor: '#42A5F5',
      backgroundColor: 'rgba(66, 165, 245, 0.1)',
      data: [],
      tension: 0.3,
      fill: true,
    },
  ],
});

// 曲線圖的設定選項
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: '近期銷售趨勢',
      font: {
        size: 18,
      }
    },
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
});

// 處理卡片點擊事件
const navigateTo = (link) => {
  if (link) {
    router.push(link);
  }
};

// 獲取並處理所有數據
async function fetchData() {
  appStore.setGlobalLoading(true);
  try {
    // 使用 Promise.all 同時發送多個請求
    const [usersResponse, salesResponse] = await Promise.all([
      apiClient.get('/users'),
      apiClient.get('/sales?_sort=date&_order=asc') // 按日期排序獲取銷售數據
    ]);

    // 更新使用者總數
    stats.value[0].value = usersResponse.data.length;

    // 處理銷售數據
    const sales = salesResponse.data;
    const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
    stats.value[1].value = `$${totalSales.toLocaleString()}`;

    // 處理圖表數據
    const salesByDate = sales.reduce((acc, sale) => {
      const date = sale.date;
      acc[date] = (acc[date] || 0) + sale.amount;
      return acc;
    }, {});

    chartData.value.labels = Object.keys(salesByDate);
    chartData.value.datasets[0].data = Object.values(salesByDate);

  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    appStore.showSnackbar('無法載入儀表板數據', 'error');
  } finally {
    appStore.setGlobalLoading(false);
  }
}

onMounted(fetchData);
</script>

<template>
  <v-container fluid>
    <!-- 頂部統計卡片 -->
    <v-row>
      <v-col cols="12" sm="6" md="4" v-for="stat in stats" :key="stat.title">
        <v-card 
          class="pa-3 clickable-card" 
          rounded="lg"
          @click="navigateTo(stat.link)"
          :disabled="!stat.link"
        >
          <div class="d-flex align-center">
            <v-avatar :color="stat.color" rounded="lg" size="60">
              <v-icon :icon="stat.icon" size="30" color="white"></v-icon>
            </v-avatar>
            <div class="ml-4">
              <div class="text-h4 font-weight-bold">{{ stat.value }}</div>
              <div class="text-grey-darken-1">{{ stat.title }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 圖表區塊 -->
    <v-row>
      <v-col cols="12">
        <v-card rounded="lg">
          <v-card-text>
            <div style="height: 400px">
              <Line v-if="!appStore.globalLoading" :data="chartData" :options="chartOptions" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
