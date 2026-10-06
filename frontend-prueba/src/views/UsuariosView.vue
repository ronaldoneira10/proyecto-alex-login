<script setup>
import { ref } from "vue";
import { usuariosService } from "../services/usuarios.service";
import { getErrors, notifyOk } from "../utils/errors";

const vacio = () => ({ nombre: "", email: "", password: "" });
const form = ref(vacio());
const verClave = ref(false);
const errores = ref([]);
const guardando = ref(false);
const formRef = ref(null);

async function crear() {
  errores.value = [];
  guardando.value = true;
  try {
    const { data } = await usuariosService.crear(form.value);
    notifyOk(data.msg);
    form.value = vacio();
    formRef.value?.resetValidation();
  } catch (e) {
    errores.value = getErrors(e);
  } finally {
    guardando.value = false;
  }
}
</script>

<template>
  <q-page padding>
    <q-card flat bordered style="max-width: 460px">
      <q-card-section>
        <div class="text-h6">Crear usuario</div>
        <div class="text-caption text-grey-7">
          Cuenta nueva para acceder al sistema (la crea alguien con sesión iniciada).
        </div>
      </q-card-section>

      <q-form ref="formRef" @submit.prevent="crear">
        <q-card-section class="q-gutter-md">
          <q-input
            v-model="form.nombre"
            label="Nombre"
            outlined
            :rules="[(v) => !!v || 'El nombre es obligatorio']"
          />
          <q-input
            v-model="form.email"
            type="email"
            label="Correo"
            outlined
            :rules="[
              (v) => !!v || 'El email es obligatorio',
              (v) => /.+@.+\..+/.test(v) || 'El email no es válido',
            ]"
          />
          <q-input
            v-model="form.password"
            :type="verClave ? 'text' : 'password'"
            label="Contraseña"
            outlined
            :rules="[
              (v) => !!v || 'La contraseña es obligatoria',
              (v) => v.length >= 6 || 'Debe tener al menos 6 caracteres',
            ]"
          >
            <template #append>
              <q-icon
                :name="verClave ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="verClave = !verClave"
              />
            </template>
          </q-input>
          <q-banner v-if="errores.length" rounded class="bg-red-1 text-negative">
            <div v-for="(err, i) in errores" :key="i">{{ err }}</div>
          </q-banner>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn type="submit" color="primary" label="Crear usuario" no-caps :loading="guardando" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>
