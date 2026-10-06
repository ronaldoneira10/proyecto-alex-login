import { Notify } from "quasar";

/**
 * Convierte cualquier error de axios en una lista de mensajes legibles.
 * Backend: 400 validacion -> { msg, errors: [..] } | otros -> { msg }
 */
export function getErrors(e) {
  const data = e?.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length) return data.errors;
  if (data?.msg) return [data.msg];
  if (!e?.response) return ["No hay conexion con el servidor"];
  return ["Ocurrio un error inesperado"];
}

export function notifyError(e) {
  Notify.create({ type: "negative", message: getErrors(e).join(" · ") });
}

export function notifyOk(message) {
  Notify.create({ type: "positive", message });
}
