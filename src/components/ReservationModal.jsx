import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay, addHours } from "date-fns";
import es from "date-fns/locale/es";
import { createReservation } from "../Services/createReservationService";

const locales = { es: es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const ReservationModal = ({ isOpen, onClose, spaceData, reservas }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedEndTime, setSelectedEndTime] = useState("");
  const [selectedHours, setSelectedHours] = useState([]);
  const [reservationTitle, setReservationTitle] = useState("");
  const [reservationDescription, setReservationDescription] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  const isCoworking = spaceData?.tiporecurso === "Sala de reuniones";

  useEffect(() => {
    // Verifica si existe spaceData y si tiene la propiedad reservas
    if (spaceData && spaceData.reservas) {
      // Transforma cada reserva en un objeto de evento para el calendario
      const eventsForSpace = spaceData.reservas.map(reserva => ({
        // Mapea las propiedades de la reserva al formato requerido por el calendario
        id: reserva.idReserva,
        title: reserva.titulo,
        // Convierte las fechas del formato DD/MM/YYYY HH:mm al formato YYYY-MM-DD HH:mm
        // usando una expresión regular para reorganizar las partes de la fecha
        start: new Date(reserva.inicio.replace(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}:\d{2})/, '$3-$2-$1 $4')),
        end: new Date(reserva.fin.replace(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}:\d{2})/, '$3-$2-$1 $4')),
        // Crea una descripción con el nombre del usuario
        desc: `Reservado por: ${reserva.usuario.nombre}`,
        // Mantiene la referencia al usuario y estado de la reserva
        usuario: reserva.usuario,
        estado: reserva.estado
      }));
      // Actualiza el estado con los eventos transformados
      setFilteredEvents(eventsForSpace);
    }
  }, [spaceData]); // El efecto se ejecuta cuando spaceData cambia

  const handleSlotSelect = (slotInfo) => {
    const isSlotOccupied = filteredEvents.some(
      (event) =>
        new Date(slotInfo.start) < new Date(event.end) &&
        new Date(slotInfo.end) > new Date(event.start)
    );

    if (!isSlotOccupied) {
      setSelectedSlot(slotInfo);
    } else {
      alert("Este horario ya está ocupado. Por favor seleccione otro.");
    }
  };

  const handleConfirmReservation = async () => {
    if (!reservationTitle.trim()) {
      alert("Por favor ingrese un título para la reserva");
      return;
    }

    let startDateTime, endDateTime;

    if (isCoworking) {
      if (!selectedPeriod) {
        alert("Por favor seleccione un período de tiempo");
        return;
      }
      // Usar el período seleccionado
      startDateTime = new Date(`${format(selectedDate, "yyyy-MM-dd")}T${selectedPeriod.start}`);
      endDateTime = new Date(`${format(selectedDate, "yyyy-MM-dd")}T${selectedPeriod.end}`);
    } else {
      if (!selectedHours.length) {
        alert("Por favor seleccione al menos una hora");
        return;
      }
      // Usar las horas seleccionadas (código existente)
      startDateTime = new Date(`${format(selectedDate, "yyyy-MM-dd")}T${selectedHours[0]}`);
      endDateTime = new Date(`${format(selectedDate, "yyyy-MM-dd")}T${selectedHours[selectedHours.length - 1]}`);
      endDateTime.setHours(endDateTime.getHours() + 1);
    }

    const formattedStart = format(startDateTime, "dd/MM/yyyy HH:mm");
    const formattedEnd = format(endDateTime, "dd/MM/yyyy HH:mm");

    const reservationData = {
      idEspacio: spaceData.idEspacio,
      titulo: reservationTitle,
      descripcion: reservationDescription,
      inicio: formattedStart,
      fin: formattedEnd,
      idUsuario: "U001",
      nombreUsuario: "Juan Pérez",
      correoUsuario: "juan.perez@example.com",
      detalles: {
        equiposNecesarios: ["Proyector"],
        comentarios: "Reserva realizada desde el sistema"
      }
    };

    console.log("Intentando crear reserva con datos:", reservationData);

    try {
      const response = await createReservation(reservationData);
      console.log("=== Reserva creada exitosamente ===");
      console.log("ID de reserva:", response.data.id);
      console.log("Fecha de creación:", response.data.created_at);
      console.log("Fecha de inicio:", response.data.inicio);
      console.log("Fecha de fin:", response.data.fin);
      console.log("Respuesta completa:", response);

      alert(`Reserva confirmada con éxito para el día ${format(selectedDate, "dd/MM/yyyy", { locale: es })} de ${selectedHours[0]} a ${format(endDateTime, 'HH:mm')}`);
      onClose();
    } catch (error) {
      console.error("=== Error al crear la reserva ===");
      console.error("Tipo de error:", error.name);
      console.error("Mensaje:", error.message);
      console.error("Detalles completos:", error);

      alert("Hubo un error al crear la reserva. Por favor, intente nuevamente.");
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 21; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const isTimeSlotAvailable = (timeSlot) => {
    const slotDate = new Date(`${format(selectedDate, "yyyy-MM-dd")}T${timeSlot}`);

    return !filteredEvents.some(event =>
      slotDate >= new Date(event.start) &&
      slotDate < new Date(event.end)
    );
  };

  const handleTimeSelect = (time) => {
    if (selectedHours.includes(time)) {
      // Si la hora ya está seleccionada, la quitamos
      setSelectedHours(prev => prev.filter(hour => hour !== time));
      return;
    }

    // Convertimos todas las horas a números para ordenarlas
    const allHours = [...selectedHours, time].map(h => parseInt(h.split(':')[0]));
    const min = Math.min(...allHours);
    const max = Math.max(...allHours);

    // Verificamos si las horas son consecutivas
    if (max - min + 1 !== allHours.length) {
      alert("Solo puedes seleccionar horas consecutivas");
      return;
    }

    setSelectedHours(prev => [...prev, time].sort());
  };

  const coworkingPeriods = [
    { id: 0, name: "Mañana", start: "07:00", end: "12:00" },
    { id: 1, name: "Mañana", start: "13:00", end: "17:00" },
    { id: 2, name: "Mañana-Tarde", start: "07:00", end: "17:00" },
    { id: 3, name: "Tarde-Noche", start: "17:00", end: "22:00" },
    
  ];

  const renderTimeSelector = () => {
    if (isCoworking) {
      return (
        <div className="bg-white p-4 mt-4">
          <h3 className="text-lg font-semibold text-turquesa mb-3">Seleccionar período</h3>
          <div className="grid grid-cols-2 gap-4">
            {coworkingPeriods.map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period)}
                className={`
                  p-4 rounded-md text-sm
                  ${selectedPeriod?.id === period.id
                    ? 'bg-turquesa text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }
                `}
              >
                {period.name}
                <br />
                <span className="text-xs">
                  {period.start} - {period.end}
                </span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-4 mt-4">
        <h3 className="text-lg font-semibold text-turquesa mb-3">Seleccionar horario</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {generateTimeSlots().map((time) => (
            <button
              key={time}
              onClick={() => handleTimeSelect(time)}
              disabled={!isTimeSlotAvailable(time)}
              className={`
                p-2 rounded-md text-sm
                ${selectedHours.includes(time)
                  ? 'bg-turquesa text-white'
                  : isTimeSlotAvailable(time)
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {time}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen || !spaceData) return null;

  const dayPropGetter = (date) => {
    if (format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")) {
      return {
        style: {
          backgroundColor: "#00aab7",
          color: "#fff",
        },
      };
    }
    return {};
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-6xl w-full max-h-[95vh] overflow-auto">
        {/* Header del Modal */}
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Detalles del Espacio</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b mb-6">
          <button
            onClick={() => setActiveTab("info")}
            className={`py-2 px-4 ${activeTab === "info"
              ? "border-b-2 border-turquesa font-bold text-turquesa"
              : "text-gray-600 hover:text-gray-800"
              }`}
          >
            Información
          </button>
          <button
            onClick={() => setActiveTab("availability")}
            className={`py-2 px-4 ${activeTab === "availability"
              ? "border-b-2 border-turquesa font-bold text-turquesa"
              : "text-gray-600 hover:text-gray-800"
              }`}
          >
            Disponibilidad
          </button>
        </div>

        {/* Contenido de las pestañas */}
        {activeTab === "info" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="w-full md:w-2/3">
                <img
                  src={spaceData.image}
                  alt={spaceData.espaciofisico}
                  className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
                />
              </div>
              <div className="w-full max-h-80 md:w-1/3 grid grid-cols-2 md:grid-cols-1 gap-4 overflow-y-auto">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-700 text-lg truncate">ID</h3>
                  <p className="text-gray-600 text-base truncate">{spaceData.idEspacio}</p>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-700 text-lg truncate">Sede</h3>
                  <p className="text-gray-600 text-base truncate">{spaceData.sede}</p>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-700 text-lg truncate">Nombre</h3>
                  <p className="text-gray-600 text-base truncate">{spaceData.nombre}</p>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-700 text-lg truncate">Capacidad</h3>
                  <p className="text-gray-600 text-base truncate">{spaceData.capacidad}</p>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-700 text-lg truncate">Ubicación</h3>
                  <p className="text-gray-600 text-base truncate">{spaceData.ubicacion}</p>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-700 text-lg truncate">Tipo recurso</h3>
                  <p className="text-gray-600 text-base truncate">{spaceData.ubicacion}</p>
                </div>
              </div>
            </div>

            <div className="bg-gris-sutil p-4 md:p-6 rounded-lg">
              <h3 className="font-semibold text-gray-700 text-lg mb-3">Información Adicional</h3>
              <p className="text-gray-600 text-base">
                <em>Descripción genérica del espacio disponible.</em>
              </p>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setActiveTab("availability")}
                className="px-6 py-3 bg-turquesa text-white rounded-lg hover:bg-turquesa/90 transition flex items-center gap-2"
              >
                Siguiente
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {activeTab === "availability" && (
          <div>
            <Calendar
              localizer={localizer}
              events={filteredEvents}
              selectable
              onSelectSlot={handleSlotSelect}
              date={selectedDate}
              onNavigate={(date) => setSelectedDate(date)}
              views={["month"]}
              style={{ height: 300 }}
              dayPropGetter={dayPropGetter}
            />
            {renderTimeSelector()}
            {/* Campo de título y descripción de la reserva */}
            <div className="bg-white p-4 mt-4">
              <h3 className="text-lg font-semibold text-turquesa mb-3">Título de la reserva</h3>
              <input
                type="text"
                value={reservationTitle}
                onChange={(e) => setReservationTitle(e.target.value)}
                placeholder="Ingrese el título de la reserva"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-turquesa mb-4"
              />

              <h3 className="text-lg font-semibold text-turquesa mb-3">Descripción de la reserva</h3>
              <textarea
                value={reservationDescription}
                onChange={(e) => setReservationDescription(e.target.value)}
                placeholder="Ingrese la descripción de la reserva"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-turquesa"
                rows="3"
              />
            </div>

            {/* Lista de eventos */}
            {/*<div className="bg-white p-4 mt-4">
              <h3 className="text-lg font-semibold text-turquesa mb-3">
                Reservas del {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: es })}
              </h3>
              {filteredEvents.length > 0 ? (
                <ul className="space-y-4">
                  {filteredEvents.map((event) => (
                    <li key={event.id} className="border-b pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-base font-semibold text-gris-medio">
                            {event.title}
                          </h4>
                          <p className="text-sm text-gris-medio">
                            {format(new Date(event.start), "HH:mm")} - {format(new Date(event.end), "HH:mm")}
                          </p>
                          <p className="text-sm text-gris-medio">{event.desc}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => alert("Editar no implementado aún.")}
                            className="text-sm text-white bg-turquesa px-3 py-1 rounded hover:bg-turquesa/90 transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => alert("Cancelar no implementado aún.")}
                            className="text-sm text-white bg-fucsia px-3 py-1 rounded hover:bg-fucsia/90 transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gris-medio">No hay reservas para este día.</p>
              )}
            </div>*/}

            {/* Botón de confirmación */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleConfirmReservation}
                className="px-6 py-3 bg-turquesa text-white rounded-lg hover:bg-turquesa/90 transition"
              >
                Confirmar Reserva
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationModal;
