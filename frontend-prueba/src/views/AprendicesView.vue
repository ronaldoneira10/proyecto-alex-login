<script setup>
import { ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useAprendicesStore } from "../stores/aprendices";
import { useCursosStore } from "../stores/cursos";
import { getErrors, notifyError, notifyOk } from "../utils/errors";

const $q = useQuasar();
const store = useAprendicesStore();
const cursos = useCursosStore();

const filtro = ref("");
const estado = ref("todos"); // todos | activos | inactivos
const cursoFiltro = ref(null); // _id del curso o null

const columns = [
  { name: "documento", label: "Documento", field: "documento", align: "left", sortable: true },
  { name: "nombre", label: "Nombre", field: "nombre", align: "left", sortable: true },
  { name: "email", label: "Email", field: "email", align: "left" },
  {
    name: "curso",
    label: "Curso",
    // `curso` viene poblado desde el backend; el ?. evita errores si quedo sin curso
    field: (row) => row.curso?.nombre ?? "—",
    align: "left",
    sortable: true,
  },
  { name: "status", label: "Estado", field: "status", align: "center" },
  { name: "acciones", label: "Acciones", align: "center" },
];

const rows = computed(() =>
  store.items.filter((a) => {
    const okEstado =
      estado.value === "todos" ? true : estado.value === "activos" ? a.status === 0 : a.status === 1;
    const okCurso = !cursoFiltro.value || a.curso?._id === cursoFiltro.value;
    return okEstado && okCurso;
  })
);

const opcionesFiltroCurso = computed(() =>
  cursos.items.map((c) => ({ label: c.nombre, value: c._id }))
);

// ---- formulario (crear / editar) ----
const vacio = () => ({ documento: "", nombre: "", email: "", curso: null });
const dialog = ref(false);
const editId = ref(null);
const form = ref(vacio());
const errores = ref([]);
const guardando = ref(false);

// Solo cursos activos; si se edita un aprendiz de un curso inactivo, se conserva ese.
const opcionesCurso = computed(() =>
  cursos.items
    .filter((c) => c.status === 0 || c._id === form.value.curso)
    .map((c) => ({ label: `${c.codigo} — ${c.nombre}`, value: c._id }))
);

function nuevo() {
  editId.value = null;
  form.value = vacio();
  errores.value = [];
  dialog.value = true;
}

function editar(a) {
  editId.value = a._id;
  form.value = {
    documento: a.documento,
    nombre: a.nombre,
    email: a.email,
    curso: a.curso?._id ?? null, // el backend espera el ObjectId, no el nombre
  };
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
    errores.value = getErrors(e);
  } finally {
    guardando.value = false;
  }
}

function cambiarEstado(a) {
  const accion = a.status === 0 ? "desactivar" : "activar";
  $q.dialog({
    title: "Confirmar",
    message: `¿Desea ${accion} a ${a.nombre}?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      notifyOk(await store.cambiarEstado(a));
    } catch (e) {
      notifyError(e);
    }
  });
}

onMounted(() => {
  Promise.all([cursos.cargar(), store.cargar()]).catch(notifyError);
});
</script>

<template>
  <q-page padding>
    <q-table
      flat
      bordered
      title="Aprendices"
      row-key="_id"
      :rows="rows"
      :columns="columns"
      :loading="store.loading"
      :filter="filtro"
      :rows-per-page-options="[10, 25, 50, 100]"
      no-data-label="No hay aprendices"
      no-results-label="Ningún aprendiz coincide con la búsqueda"
    >
      <template #top-right>
        <div class="row q-gutter-sm items-center">
          <q-select
            v-model="cursoFiltro"
            :options="opcionesFiltroCurso"
            emit-value
            map-options
            clearable
            dense
            outlined
            label="Curso"
            style="min-width: 220px"
          />
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
          <q-btn color="primary" icon="add" label="Nuevo aprendiz" no-caps @click="nuevo" />
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
      <q-card style="width: 460px; max-width: 92vw">
        <q-card-section class="text-h6">
          {{ editId ? "Editar aprendiz" : "Nuevo aprendiz" }}
        </q-card-section>

        <q-form @submit.prevent="guardar">
          <q-card-section class="q-gutter-md">
            <q-input
              v-model="form.documento"
              label="Documento"
              outlined
              :rules="[(v) => !!v || 'El documento es obligatorio']"
            />
            <q-input
              v-model="form.nombre"
              label="Nombre"
              outlined
              :rules="[(v) => !!v || 'El nombre es obligatorio']"
            />
            <q-input
              v-model="form.email"
              type="email"
              label="Email"
              outlined
              :rules="[
                (v) => !!v || 'El email es obligatorio',
                (v) => /.+@.+\..+/.test(v) || 'El email no es válido',
              ]"
            />
            <q-select
              v-model="form.curso"
              :options="opcionesCurso"
              emit-value
              map-options
              label="Curso"
              outlined
              :rules="[(v) => !!v || 'El curso es obligatorio']"
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
