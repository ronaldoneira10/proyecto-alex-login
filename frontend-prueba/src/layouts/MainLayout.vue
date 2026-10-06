<script setup>
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useAuthStore } from "../stores/auth";
import { useUiStore } from "../stores/ui";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();

// Aplica el modo oscuro guardado (Pinia persistido) al iniciar y al cambiarlo.
watch(() => ui.dark, (v) => $q.dark.set(v), { immediate: true });

const links = [
  { name: "cursos", label: "Cursos", icon: "school" },
  { name: "aprendices", label: "Aprendices", icon: "groups" },
  { name: "usuarios", label: "Usuarios", icon: "manage_accounts" },
];

function salir() {
  auth.logout();
  router.push({ name: "login" });
}
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="ui.drawer = !ui.drawer" />
        <q-toolbar-title>{{ route.meta.title || "Cursos y Aprendices" }}</q-toolbar-title>

        <q-btn
          flat
          round
          dense
          :icon="ui.dark ? 'light_mode' : 'dark_mode'"
          @click="ui.toggleDark()"
        >
          <q-tooltip>{{ ui.dark ? "Modo claro" : "Modo oscuro" }}</q-tooltip>
        </q-btn>

        <q-btn flat no-caps icon="account_circle" :label="auth.usuario?.nombre" class="q-ml-sm">
          <q-menu>
            <q-list style="min-width: 200px">
              <q-item>
                <q-item-section>
                  <q-item-label>{{ auth.usuario?.nombre }}</q-item-label>
                  <q-item-label caption>{{ auth.usuario?.email }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="salir">
                <q-item-section avatar><q-icon name="logout" /></q-item-section>
                <q-item-section>Cerrar sesión</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="ui.drawer" show-if-above bordered :width="220">
      <q-list padding>
        <q-item-label header>Menú</q-item-label>
        <q-item
          v-for="l in links"
          :key="l.name"
          :to="{ name: l.name }"
          clickable
          v-ripple
          active-class="text-primary text-weight-bold"
        >
          <q-item-section avatar><q-icon :name="l.icon" /></q-item-section>
          <q-item-section>{{ l.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
