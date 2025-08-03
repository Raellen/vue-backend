<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useAppStore } from '@/stores/app';

const route = useRoute();
const authStore = useAuthStore();
const appStore = useAppStore();

const { isAuthenticated, userInitials, userName, userEmail } = storeToRefs(authStore);
const { globalLoading, snackbar } = storeToRefs(appStore);
const { logout } = authStore;

const drawer = ref(null);

// 監聽路由變化，更新頁面標題
const pageTitle = ref('');
watch(route, (to) => {
  pageTitle.value = to.meta.title || '';
}, { immediate: true });
</script>

<template>
  <v-app>
    <!-- 全域讀取指示器 -->
    <div v-if="globalLoading" class="loading-overlay">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <!-- 導覽側邊欄 -->
    <v-navigation-drawer v-if="isAuthenticated" v-model="drawer">
      <v-list-item prepend-icon="mdi-alpha-v-box" title="Vuetify Admin" subtitle="管理系統"></v-list-item>
      <v-divider></v-divider>
      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-view-dashboard" title="儀表板" value="dashboard" to="/"></v-list-item>
        <v-list-item prepend-icon="mdi-account-group" title="使用者管理" value="users" to="/users"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- 頂部應用欄 -->
    <v-app-bar v-if="isAuthenticated">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>{{ pageTitle }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar color="primary" size="36">
              <span class="text-subtitle-1">{{ userInitials }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item :title="userName" :subtitle="userEmail"></v-list-item>
          <v-divider></v-divider>
          <v-list-item prepend-icon="mdi-logout" title="登出" @click="logout"></v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- 主要內容區 -->
    <v-main class="bg-grey-lighten-4">
      <router-view v-slot="{ Component }">
        <v-fade-transition mode="out-in">
          <component :is="Component" />
        </v-fade-transition>
      </router-view>
    </v-main>

    <!-- 全域通知條 -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">關閉</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<style>
/* 全域樣式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
</style>
