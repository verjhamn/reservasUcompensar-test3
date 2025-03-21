import { axiosInstance } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const createReservation = async (reservationData) => {
    try {
        console.log("[createReservation] Enviando solicitud de reserva...");

        // Realizar la solicitud usando axiosInstance, que maneja la autenticación automáticamente
        const response = await axiosInstance.post(`${API_BASE_URL}/reservas/crear`, reservationData);

        console.log("[createReservation] Respuesta del servidor:", response.data);

        if (response.data.status === "success") {
            return response.data;
        } else {
            throw new Error(response.data.message || "Error al crear la reserva");
        }
    } catch (error) {
        console.error("[createReservation] Error en la reserva:", error.response || error);
        throw new Error(error.response?.data?.message || error.message || "Error al crear la reserva");
    }
};
