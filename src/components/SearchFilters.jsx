import React, { useEffect, useState } from "react";
import { fetchSpaces } from "../Services/spacesService";

const SearchFilters = ({ filters, setFilters }) => {
  const [options, setOptions] = useState({
    sedes: [],
    espaciosFisicos: [],
    tiposRecurso: [],
  });

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const data = await fetchSpaces(); // Llama al servicio para obtener datos

        // Extraer valores únicos para los filtros
        const sedes = [...new Set(data.map((item) => item.sede))];
        const espaciosFisicos = [...new Set(data.map((item) => item.espaciofisico))];
        const tiposRecurso = [...new Set(data.map((item) => item.tiporecurso))];

        setOptions({ sedes, espaciosFisicos, tiposRecurso });
      } catch (error) {
        console.error("Error al cargar las opciones de los filtros:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  return (
    <div className="bg-white shadow-md p-6 mb-6">
      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Sede */}
        <div>
          <label className="block text-gray-700">Sede</label>
          <select
            name="sede"
            value={filters.sede || ""}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="">Seleccionar</option>
            {options.sedes.map((sede, index) => (
              <option key={index} value={sede}>
                {sede}
              </option>
            ))}
          </select>
        </div>

        {/* Capacidad */}
        <div>
          <label className="block text-gray-700">Capacidad</label>
          <input
            type="number"
            name="capacidad"
            value={filters.capacidad || ""}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            placeholder="Número de personas"
            min="1"
          />
        </div>

        {/* Espacio Físico */}
        <div>
          <label className="block text-gray-700">Espacio Físico</label>
          <select
            name="espaciofisico"
            value={filters.espaciofisico || ""}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="">Seleccionar</option>
            {options.espaciosFisicos.map((espacio, index) => (
              <option key={index} value={espacio}>
                {espacio}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de Recurso */}
        <div>
          <label className="block text-gray-700">Tipo de Recurso</label>
          <select
            name="tiporecurso"
            value={filters.tiporecurso || ""}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="">Seleccionar</option>
            {options.tiposRecurso.map((tipo, index) => (
              <option key={index} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha de Inicio */}
        <div>
          <label className="block text-gray-700">Fecha de Inicio</label>
          <input
            type="date"
            name="clseFechainicio"
            value={filters.clseFechainicio || ""}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {/* Fecha de Finalización */}
        <div>
          <label className="block text-gray-700">Fecha de Finalización</label>
          <input
            type="date"
            name="clseFechafinal"
            value={filters.clseFechafinal || ""}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {/* Hora de Inicio */}
        <div>
          <label className="block text-gray-700">Hora de Inicio</label>
          <input
            type="time"
            name="horainicio"
            value={filters.horainicio || ""}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {/* Hora de Finalización */}
        <div>
          <label className="block text-gray-700">Hora de Finalización</label>
          <input
            type="time"
            name="horafinal"
            value={filters.horafinal || ""}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
      </form>
    </div>
  );
};

export default SearchFilters;
