<script setup>
import { ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useCursosStore } from "../stores/cursos";
import { getErrors, notifyError, notifyOk } from "../utils/errors";

const $q = useQuasar();
const store = useCursosStore();

const filtro = ref("");
const estado = ref("todos"); // todos | activos | inactivos

const columns = [
  { name: "codigo", label: "Código", field: "codigo", align: "left", sortable: true },
  { name: "nombre", label: "Nombre", field: "nombre", align: "left", sortable: true },
  { name: "duracion", label: "Duración (h)", field: "duracion", align: "right", sortable: true },
  { name: "status", label: "Estado", field: "status", align: "center" },
  { name: "acciones", label: "Acciones", align: "center" },
];

const rows = computed(() =>
  store.items.filter((c) =>
    estado.value === "todos" ? true : estado.value === "activos" ? c.status === 0 : c.status === 1
  )
);

// ---- formulario (crear / editar) ----
const vacio = () => ({ codigo: "", nombre: "", duracion: null });
const dialog = ref(false);
const editId = ref(null);
const form = ref(vacio());
const errores = ref([]);
const guardando = ref(false);

function nuevo() {
  editId.value = null;
  form.value = vacio();
  errores.value = [];
  dialog.value = true;
}

function editar(curso) {
  editId.value = curso._id;
  form.value = { codigo: curso.codigo, nombre: curso.nombre, duracion: curso.duracion };
  errores.value = [];
  dialog.value = true;
}

async function guardar() {
  errores.value = [];
  guardando.value = true;
  try {
    const msg = await store.guardar(form.value, editId.value);
    notifyOk(msg);
    dialog.value = false;
  } catch (e) {
    errores.value = getErrors(e); // errores de validacion del backend
  } finally {
    guardando.value = false;
  }
}

function cambiarEstado(curso) {
  const accion = curso.status === 0 ? "desactivar" : "activar";
  $q.dialog({
    title: "Confirmar",
    message: `¿Desea ${accion} el curso ${curso.nombre}?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      notifyOk(await store.cambiarEstado(curso));
    } catch (e) {
      notifyError(e);
    }
  });
}

onMounted(() => store.cargar().catch(notifyError));
</script>

<template>
  <q-page padding>
    <q-table
      flat
      bordered
      title="Cursos"
      row-key="_id"
      :rows="rows"
      :columns="columns"
      :loading="store.loading"
      :filter="filtro"
      :rows-per-page-options="[10, 25, 50]"
      no-data-label="No hay cursos"
      no-results-label="Ningún curso coincide con la búsqueda"
    >
      <template #top-right>
        <div class="row q-gutter-sm items-center">
          <q-btn-toggle
            v-model="estado"
            no-caps
            unelevated
            toggle-color="primary"
            :options="[
              { label: 'Todos', value: 'todos' },
              { label: 'Activos', value: 'activos' },
              { label: 'Inactivos', value: 'inactivos' },
            ]"
          />
          <q-input v-model="filtro" dense outlined debounce="250" placeholder="Buscar...">
            <template #append><q-icon name="search" /></template>
          </q-input>
          <q-btn color="primary" icon="add" label="Nuevo curso" no-caps @click="nuevo" />
        </div>
      </template>

      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="props.row.status === 0 ? 'positive' : 'grey'">
            {{ props.row.status === 0 ? "Activo" : "Inactivo" }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-acciones="props">
        <q-td :props="props">
          <q-btn flat round dense color="primary" icon="edit" @click="editar(props.row)">
            <q-tooltip>Editar</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            :color="props.row.status === 0 ? 'negative' : 'positive'"
            :icon="props.row.status === 0 ? 'block' : 'check_circle'"
            @click="cambiarEstado(props.row)"
          >
            <q-tooltip>{{ props.row.status === 0 ? "Desactivar" : "Activar" }}</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 440px; max-width: 92vw">
        <q-card-section class="text-h6">
          {{ editId ? "Editar curso" : "Nuevo curso" }}
        </q-card-section>

        <q-form @submit.prevent="guardar">
          <q-card-section class="q-gutter-md">
            <q-input
              v-model="form.codigo"
              label="Código"
              outlined
              :rules="[(v) => !!v || 'El código es obligatorio']"
            />
            <q-input
              v-model="form.nombre"
              label="Nombre"
              outlined
              :rules="[(v) => !!v || 'El nombre es obligatorio']"
            />
            <q-input
              v-model.number="form.duracion"
              type="number"
              label="Duración (horas)"
              outlined
              :rules="[
                (v) => (v !== null && v !== '') || 'La duración es obligatoria',
                (v) => Number.isInteger(v) && v >= 1 || 'Debe ser un número entero mayor a 0',
              ]"
            />
            <q-banner v-if="errores.length" rounded class="bg-red-1 text-negative">
              <div v-for="(err, i) in errores" :key="i">{{ err }}</div>
            </q-banner>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" no-caps v-close-popup />
            <q-btn type="submit" color="primary" label="Guardar" no-caps :loading="guardando" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>
