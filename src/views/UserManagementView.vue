<script setup>
import { ref, reactive, computed, nextTick } from 'vue';
import apiClient from '@/services/apiClient';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();
const itemsPerPage = ref(10); // 將每頁顯示筆數從 5 改為 10
const headers = ref([
  // { title: 'ID', key: 'id', align: 'start' },
  { title: '姓名', key: 'name' },
  { title: '電子郵件', key: 'email' },
  { title: '角色', key: 'role' },
  { title: '狀態', key: 'status' },
  { title: '操作', key: 'actions', sortable: false },
]);

const serverItems = ref([]);
const loading = ref(true);
const totalItems = ref(0);
const search = ref('');
const dialog = ref(false);
const dialogDelete = ref(false);

const defaultItem = { id: null, name: '', email: '', role: 'Viewer', status: 'Active' };
let editedItem = reactive({ ...defaultItem });
const editedIndex = ref(-1);

const formTitle = computed(() => (editedIndex.value === -1 ? '新增使用者' : '編輯使用者'));

async function loadItems({ page, itemsPerPage, sortBy, search }) {
  loading.value = true;
  try {
    let url = `/users?_page=${page}&_limit=${itemsPerPage}`;
    if (sortBy.length > 0) {
      url += `&_sort=${sortBy[0].key}&_order=${sortBy[0].order}`;
    }
    if (search) {
      url += `&q=${search}`;
    }
    const response = await apiClient.get(url);
    serverItems.value = response.data;
    // **FIX:** 如果後端沒有回傳總數，則預設為 0，避免 NaN 錯誤
    totalItems.value = parseInt(response.headers['x-total-count']) || 0;
  } catch (error) {
    console.error('Failed to load users:', error);
    appStore.showSnackbar('無法載入使用者資料', 'error');
  } finally {
    loading.value = false;
  }
}

function openDialog(item) {
  editedIndex.value = item ? serverItems.value.findIndex(u => u.id === item.id) : -1;
  Object.assign(editedItem, item || defaultItem);
  dialog.value = true;
}

function closeDialog() {
  dialog.value = false;
  nextTick(() => {
    Object.assign(editedItem, defaultItem);
    editedIndex.value = -1;
  });
}

async function saveItem() {
  loading.value = true;
  try {
    if (editedIndex.value > -1) { // 更新現有使用者
      await apiClient.put(`/users/${editedItem.id}`, editedItem);
      appStore.showSnackbar('使用者資料已更新');
    } else { // 新增使用者
      const newUserPayload = { ...editedItem };
      delete newUserPayload.id;
      await apiClient.post('/users', newUserPayload);
      appStore.showSnackbar('使用者已新增');
    }
    closeDialog();
    // 重新載入資料以顯示最新變更
    await loadItems({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: search.value });
  } catch (error) {
    console.error('Failed to save user:', error);
    appStore.showSnackbar('儲存失敗', 'error');
  } finally {
    loading.value = false;
  }
}

function openDeleteDialog(item) {
  editedIndex.value = serverItems.value.findIndex(u => u.id === item.id);
  Object.assign(editedItem, item);
  dialogDelete.value = true;
}

function closeDeleteDialog() {
  dialogDelete.value = false;
  nextTick(() => {
    Object.assign(editedItem, defaultItem);
    editedIndex.value = -1;
  });
}

async function deleteItemConfirm() {
  loading.value = true;
  try {
    await apiClient.delete(`/users/${editedItem.id}`);
    appStore.showSnackbar('使用者已刪除');
    closeDeleteDialog();
    // 重新載入資料
    await loadItems({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: search.value });
  } catch (error) {
    console.error('Failed to delete user:', error);
    appStore.showSnackbar('刪除失敗', 'error');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-container fluid>
    <v-card rounded="lg">
      <v-toolbar flat>
        <v-toolbar-title>使用者列表</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-inner-icon="mdi-magnify"
          label="搜尋使用者 (姓名, email)"
          single-line
          hide-details
          density="compact"
          class="mr-4"
          style="max-width: 300px;"
        ></v-text-field>
        <v-btn color="primary" @click="openDialog()">新增使用者</v-btn>
      </v-toolbar>

      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="serverItems"
        :items-length="totalItems"
        :loading="loading"
        :search="search"
        item-value="id"
        @update:options="loadItems"
      >
        <template v-slot:item.status="{ value }">
          <v-chip :color="value === 'Active' ? 'green' : 'red'" size="small">{{ value }}</v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-icon size="small" class="mr-2" @click="openDialog(item)">mdi-pencil</v-icon>
          <v-icon size="small" @click="openDeleteDialog(item)">mdi-delete</v-icon>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- 編輯/新增對話框 -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="editedItem.name" label="姓名"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="editedItem.email" label="電子郵件"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select v-model="editedItem.role" :items="['Admin', 'Editor', 'Viewer']" label="角色"></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select v-model="editedItem.status" :items="['Active', 'Inactive']" label="狀態"></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeDialog">取消</v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="saveItem">儲存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 刪除確認對話框 -->
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">確定要刪除此使用者嗎？</v-card-title>
        <v-card-text>此操作無法復原。</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeDeleteDialog">取消</v-btn>
          <v-btn color="red-darken-1" variant="text" @click="deleteItemConfirm">刪除</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
