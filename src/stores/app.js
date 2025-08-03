import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const globalLoading = ref(false);
  const snackbar = ref({
    show: false,
    text: '',
    color: 'success',
  });

  function showSnackbar(text, color = 'success') {
    snackbar.value.text = text;
    snackbar.value.color = color;
    snackbar.value.show = true;
  }

  function setGlobalLoading(isLoading) {
    globalLoading.value = isLoading;
  }

  return { globalLoading, snackbar, showSnackbar, setGlobalLoading };
});
