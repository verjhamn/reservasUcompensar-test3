import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import { useQuery } from "@tanstack/react-query";
import { fetchSpaces } from "../Services/spacesService";

const ResultsTable = ({ filters }) => {
  const [page, setPage] = useState(0); // Página actual
  const itemsPerPage = 10; // Número de elementos por página

  // Lista de imágenes aleatorias
  const images = [
    "/src/assets/1.webp",
    "/src/assets/2.webp",
    "/src/assets/3.webp",
    "/src/assets/4.webp",
  ];

  // Función para obtener una imagen aleatoria
  const getRandomImage = () => {
    return images[Math.floor(Math.random() * images.length)];
  };

  // Usar React Query para manejar las solicitudes
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["spaces", page, filters], // Cambia cada vez que cambian los filtros o la página
    queryFn: () => fetchSpaces(page, filters),
    keepPreviousData: true, // Mantener los datos previos mientras se cargan nuevos
  });

  // Manejar cambio de página
  const handlePageChange = ({ selected }) => {
    setPage(selected);
  };

  // Acción para el botón "Reservar"
  const handleReserve = (item) => {
    console.log("Reservando espacio:", item);
    alert(`Has reservado el espacio: ${item.espaciofisico}`);
  };

  if (isLoading) {
    return <p>Cargando...</p>;
  }

  if (isError) {
    return <p>Error al cargar los datos. Por favor, inténtalo de nuevo.</p>;
  }

  // Mostrar mensaje si no hay datos
  if (data.length === 0) {
    return <p>No se encontraron resultados para los filtros seleccionados.</p>;
  }

  return (
    <div className="bg-white shadow-md p-6">
      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item, index) => (
          <div
            key={index}
            className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition duration-300"
          >
            {/* Imagen aleatoria */}
            <img
              src={getRandomImage()}
              alt="Espacio"
              className="h-48 w-full object-cover"
            />
            {/* Contenido */}
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800">{item.sede}</h3>
              <p className="text-gray-600 text-sm">Ubicación: {item.localidad}</p>
              <p className="text-gray-600 text-sm">Espacio: {item.espaciofisico}</p>
              <p className="text-gray-600 text-sm">Recurso: {item.recurso}</p>
              <p className="text-gray-600 text-sm">
                Horario: {item.horainicio} - {item.horafinal}
              </p>
              <p className="text-gray-600 text-sm">
                <em>Descripción genérica del espacio disponible.</em>
              </p>
              {/* Botón Reservar */}
              <button
                onClick={() => handleReserve(item)}
                className="mt-4 w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
              >
                Reservar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="mt-6">
        <ReactPaginate
          pageCount={5} // Ajusta según el total de páginas
          onPageChange={handlePageChange}
          containerClassName="flex justify-center space-x-2"
          activeClassName="text-blue-500 font-bold"
          previousClassName="text-gray-500 hover:text-blue-500"
          nextClassName="text-gray-500 hover:text-blue-500"
          pageClassName="text-gray-500 hover:text-blue-500"
        />
      </div>
    </div>
  );
};

export default ResultsTable;
