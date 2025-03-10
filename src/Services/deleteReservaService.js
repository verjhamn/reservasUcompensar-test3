import { axiosInstance } from "./authService";

const API_URL = import.meta.env.VITE_API_URL;

export const deleteReserva = async (idEspacio) => {
  try {
    console.log("[deleteReserva] Enviando solicitud de eliminación...");

    // Usamos axiosInstance para que maneje automáticamente la autenticación
    const response = await axiosInstance.delete(`${API_URL}/reservas/${idEspacio}`);

    console.log("[deleteReserva] Respuesta del servidor:", response.data);

    // Verificar si la respuesta es exitosa
    if (response.data.success || response.data.message === "Reserva cancelada con éxito.") {
      return response.data.data; // Retornar los datos de la reserva eliminada
    } else {
      console.error("[deleteReserva] Error en la respuesta:", response.data);
      throw new Error(response.data.message || "Error al cancelar la reserva.");
    }
  } catch (error) {
    console.error("[deleteReserva] Error al cancelar la reserva:", error);
    throw error;
  }
};
