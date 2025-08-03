<script setup>
import { ref } from 'vue';
import apiClient from '@/services/apiClient';

const itemsPerPage = ref(10);
const headers = ref([
  { title: '訂單ID', key: 'id', align: 'start' },
  { title: '產品名稱', key: 'productName' },
  { title: '金額 (USD)', key: 'amount', align: 'end' },
  { title: '日期', key: 'date' },
]);

const serverItems = ref([]);
const loading = ref(true);
const totalItems = ref(0);

async function loadItems({ page, itemsPerPage, sortBy }) {
  loading.value = true;
  try {
    let url = `/sales?_page=${page}&_limit=${itemsPerPage}`;
    if (sortBy.length > 0) {
      url += `&_sort=${sortBy[0].key}&_order=${sortBy[0].order}`;
    }
    const response = await apiClient.get(url);
    serverItems.value = response.data;
    totalItems.value = parseInt(response.headers['x-total-count']) || 0;
  } catch (error) {
    console.error('Failed to load sales data:', error);
    // 在這裡可以加入 snackbar 錯誤提示
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-container fluid>
    <v-card rounded="lg">
      <v-toolbar flat>
        <v-toolbar-title>銷售紀錄</v-toolbar-title>
      </v-toolbar>

      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="serverItems"
        :items-length="totalItems"
        :loading="loading"
        item-value="id"
        @update:options="loadItems"
      >
        <template v-slot:item.amount="{ value }">
          ${{ value }}
        </template>
      </v-data-table-server>
    </v-card>
  </v-container>
</template>
