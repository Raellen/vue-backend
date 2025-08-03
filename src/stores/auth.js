import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';
import apiClient from '@/services/apiClient';
import { useAppStore } from './app';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const appStore = useAppStore();

  const user = ref(JSON.parse(localStorage.getItem('user')));
  const token = ref(localStorage.getItem('token'));

  const isAuthenticated = computed(() => !!token.value);
  const userName = computed(() => user.value?.name || '');
  const userEmail = computed(() => user.value?.email || '');
  const userInitials = computed(() => (user.value?.name ? user.value.name.substring(0, 2).toUpperCase() : ''));

  async function login(credentials) {
    appStore.setGlobalLoading(true);
    try {
      const { data } = await apiClient.get(`/users?email=${credentials.email}`);
      if (data && data.length > 0) {
        const loggedInUser = data[0];
        token.value = `fake-jwt-token-for-${loggedInUser.email}`;
        user.value = loggedInUser;
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        localStorage.setItem('token', token.value);
        appStore.showSnackbar('登入成功！');
        router.push('/');
        return true;
      } else {
        appStore.showSnackbar('帳號或密碼錯誤', 'error');
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      appStore.showSnackbar('登入時發生錯誤', 'error');
      return false;
    } finally {
      appStore.setGlobalLoading(false);
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    appStore.showSnackbar('您已成功登出');
    router.push('/login');
  }

  return { user, token, isAuthenticated, userName, userEmail, userInitials, login, logout };
});
