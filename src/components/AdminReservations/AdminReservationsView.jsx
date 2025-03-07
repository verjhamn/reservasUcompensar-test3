import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import SearchFilters from '../SearchFilters';
import ReservationCalendar from '../Calendar/ReservationCalendar';
import { getAllReservations } from '../../Services/adminReservasService';
import { deleteReserva } from '../../Services/deleteReservaService';
import { showConfirmation, showSuccessToast, showErrorToast } from '../UtilComponents/Confirmation';
import ReservationList from '../Calendar/ReservationList';
import { format } from 'date-fns';

const AdminReservationsView = () => {
    const [filters, setFilters] = useState({});
    const [reservations, setReservations] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Cambiar la dependencia del useEffect para que solo se ejecute con filters
    useEffect(() => {
        fetchReservations();
    }, [filters]); // Remover selectedDate de las dependencias

    const fetchReservations = async () => {
        try {
            const data = await getAllReservations(filters); // No incluir fecha en los filtros
            
            const formattedReservations = data.map(reservation => ({
                id: reservation.id,
                titulo: reservation.titulo,
                descripcion: reservation.descripcion,
                estado: reservation.estado,
                usuario: reservation.usuario,
                type: reservation.espacio?.key || 'Coworking',
                idEspacio: reservation.espacio?.codigo,
                espacio: {
                    codigo: reservation.espacio?.codigo,
                    key: reservation.espacio?.key,
                    tipo: reservation.espacio?.tipo_espacio,
                    nombre: reservation.espacio?.nombre
                },
                start: new Date(reservation.hora_inicio),
                end: new Date(reservation.hora_fin),
                hora_inicio: reservation.hora_inicio,
                hora_fin: reservation.hora_fin
            }));

            setReservations(formattedReservations);
        } catch (error) {
            console.error('Error al cargar reservas:', error);
            showErrorToast('Error al cargar las reservas');
        }
    };

    const handleCancelReservation = async (reservationId) => {
        try {
            const confirmed = await showConfirmation(
                () => { },
                "¿Estás seguro de que deseas cancelar esta reserva?"
            );

            if (confirmed) {
                await deleteReserva(reservationId);
                await fetchReservations();
                showSuccessToast('Reserva cancelada con éxito');
            }
        } catch (error) {
            showErrorToast('Error al cancelar la reserva');
        }
    };

    const filteredReservations = reservations.filter(event =>
        format(new Date(event.start), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
    );

    return (
        <div className="container mx-auto">
            <Toaster />
            <div className="flex flex-col lg:flex-row gap-6">
                <div className=" sticky top-4 w-full lg:w-1/4">
                    <SearchFilters
                        filters={filters}
                        setFilters={setFilters}
                        isAdminView={true}
                    />
                </div>
                <div className="w-full lg:flex-1 flex flex-col gap-4">
                    <div className="w-full">
                        <ReservationCalendar
                            events={reservations}
                            selectedDate={selectedDate}
                            onSelectDate={setSelectedDate}
                        />
                    </div>
                    <div className="w-full">
                        <ReservationList
                            selectedDate={selectedDate}
                            events={filteredReservations}
                            onCancelReservation={handleCancelReservation}
                            showStatus={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReservationsView;
