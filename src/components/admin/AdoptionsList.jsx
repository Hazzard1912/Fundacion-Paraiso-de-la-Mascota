import React, { useState, useEffect } from 'react';

/**
 * Componente mejorado para mostrar y gestionar la lista de adopciones
 * 
 * @param {Object} props
 * @param {Array} props.initialAdoptions - Datos iniciales de adopciones
 */
const AdoptionsList = ({ initialAdoptions = [] }) => {
    // Estado para almacenar datos
    const [adoptions, setAdoptions] = useState(initialAdoptions);
    const [filteredAdoptions, setFilteredAdoptions] = useState(initialAdoptions);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estado para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredAdoptions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAdoptions.slice(indexOfFirstItem, indexOfLastItem);

    // Estado para filtros
    const [filters, setFilters] = useState({
        dateRange: '',
        species: '',
        search: '',
    });

    // Handler para cambios en filtros
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Aplicar filtros cuando cambian
    useEffect(() => {
        let result = [...adoptions];

        // Filtro por rango de fecha
        if (filters.dateRange) {
            const now = new Date();
            let fromDate = new Date();

            switch (filters.dateRange) {
                case 'last-week':
                    fromDate.setDate(now.getDate() - 7);
                    break;
                case 'last-month':
                    fromDate.setMonth(now.getMonth() - 1);
                    break;
                case 'last-3-months':
                    fromDate.setMonth(now.getMonth() - 3);
                    break;
                case 'last-year':
                    fromDate.setFullYear(now.getFullYear() - 1);
                    break;
            }

            result = result.filter(adoption =>
                new Date(adoption.adoptionDate) >= fromDate
            );
        }

        // Filtro por especie
        if (filters.species) {
            result = result.filter(adoption =>
                adoption.petSpecies?.toLowerCase() === filters.species.toLowerCase()
            );
        }

        // Filtro por búsqueda de texto
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(adoption =>
                (adoption.petName && adoption.petName.toLowerCase().includes(searchLower)) ||
                (adoption.adopterName && adoption.adopterName.toLowerCase().includes(searchLower)) ||
                (adoption.adopterEmail && adoption.adopterEmail.toLowerCase().includes(searchLower)) ||
                (adoption.adopterPhone && adoption.adopterPhone.toLowerCase().includes(searchLower))
            );
        }

        setFilteredAdoptions(result);
        setCurrentPage(1); // Volver a primera página al filtrar
    }, [filters, adoptions]);

    // Función para cambiar de página
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Función para eliminar adopción - Usa fetch directamente al endpoint
    const handleDelete = async (adoptionId) => {
        if (!confirm('¿Está seguro que desea eliminar esta adopción?')) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/admin/delete-adoption', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: adoptionId }),
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                // Actualizar estado local eliminando la adopción
                setAdoptions(prev => prev.filter(a => a.adoptionId !== adoptionId));
                // No es necesario actualizar filteredAdoptions aquí porque el efecto lo hará
            } else {
                setError(`Error al eliminar: ${result.error || 'Error desconocido'}`);
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Mostrar un número limitado de páginas en la paginación
    const renderPaginationButtons = () => {
        const pageButtons = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageButtons.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`relative inline-flex items-center px-4 py-2 border ${currentPage === i
                        ? "bg-blue-50 border-blue-500 text-blue-600"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        } text-sm font-medium`}
                >
                    {i}
                </button>
            );
        }

        return pageButtons;
    };

    return (
        <div>
            {/* Filtros */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label
                            htmlFor="dateRange"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Rango de fechas
                        </label>
                        <select
                            id="dateRange"
                            name="dateRange"
                            value={filters.dateRange}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Todas las fechas</option>
                            <option value="last-week">Última semana</option>
                            <option value="last-month">Último mes</option>
                            <option value="last-3-months">Últimos 3 meses</option>
                            <option value="last-year">Último año</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="species" className="block text-sm font-medium text-gray-700">
                            Especie
                        </label>
                        <select
                            id="species"
                            name="species"
                            value={filters.species}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Todas</option>
                            <option value="perro">Perro</option>
                            <option value="gato">Gato</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                            Buscar
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <input
                                type="text"
                                id="search"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Mascota, adoptante..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mensaje de error si existe */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                        <div className="ml-auto pl-3">
                            <div className="-mx-1.5 -my-1.5">
                                <button
                                    type="button"
                                    onClick={() => setError(null)}
                                    className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    <span className="sr-only">Cerrar</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 011.414 1.414L11.414 10l4.293 4.293a1 1 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabla de adopciones */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {isLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-70 flex justify-center items-center z-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {filteredAdoptions.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        No se encontraron registros de adopción.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mascota
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Especie/Raza
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Adoptante
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dirección
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contacto
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha de Adopción
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentItems.map((adoption) => (
                                    <tr key={adoption.adoptionId}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {adoption.adoptionId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {adoption.petImageUrl && (
                                                    <div className="flex-shrink-0 h-10 w-10 mr-3">
                                                        <img
                                                            className="h-10 w-10 rounded-full object-cover"
                                                            src={adoption.petImageUrl}
                                                            alt={adoption.petName}
                                                        />
                                                    </div>
                                                )}
                                                <div className="text-sm font-medium text-gray-900">
                                                    {adoption.petName}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {adoption.petSpecies}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {adoption.petBreed}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {adoption.adopterName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {adoption.adopterAddress}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {adoption.adopterEmail}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {adoption.adopterPhone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(adoption.adoptionDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex justify-center">
                                                <a
                                                    href={`/admin/adopciones/${adoption.adoptionId}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Actualizar"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </a>
                                                {/* <button
                                                    onClick={() => handleDelete(adoption.adoptionId)}
                                                    className="text-red-600 hover:text-red-900"
                                                    disabled={isLoading}
                                                    title="Eliminar"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m5-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button> */}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Paginación */}
                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a{" "}
                                        <span className="font-medium">
                                            {Math.min(indexOfLastItem, filteredAdoptions.length)}
                                        </span> de{" "}
                                        <span className="font-medium">{filteredAdoptions.length}</span>{" "}
                                        resultados
                                    </p>
                                </div>
                                <div>
                                    <nav
                                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                        aria-label="Pagination"
                                    >
                                        <button
                                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Anterior</span>
                                            <svg
                                                className="h-5 w-5"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 01-1.414 1.414l-4-4a1 1 010-1.414l4-4a1 1 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>

                                        {/* Botones de página */}
                                        {renderPaginationButtons()}

                                        <button
                                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Siguiente</span>
                                            <svg
                                                className="h-5 w-5"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M7.293 14.707a1 1 010-1.414L10.586 10 7.293 6.707a1 1 011.414-1.414l4 4a1 1 010 1.414l-4 4a1 1 01-1.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdoptionsList;