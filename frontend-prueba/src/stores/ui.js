import { defineStore } from "pinia";
import { ref } from "vue";

export const useUiStore = defineStore(
  "ui",
  () => {
    const dark = ref(false);
    const drawer = ref(true);

    function toggleDark() {
      dark.value = !dark.value;
    }

    return { dark, drawer, toggleDark };
  },
  { persist: { pick: ["dark"] } } // el drawer no hace falta recordarlo
);
