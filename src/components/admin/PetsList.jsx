import React, { useState, useEffect } from 'react';

/**
 * Componente para mostrar y gestionar la lista de mascotas
 * 
 * @param {Object} props
 * @param {Array} props.initialPets - Datos iniciales de mascotas
 */
const PetsList = ({ initialPets = [] }) => {
    // Estado para almacenar datos
    const [pets, setPets] = useState(initialPets);
    const [filteredPets, setFilteredPets] = useState(initialPets);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estado para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredPets.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPets.slice(indexOfFirstItem, indexOfLastItem);

    // Estado para filtros
    const [filters, setFilters] = useState({
        species: '',
        adoptionStatus: '',
        search: '',
    });

    // Mapeo de estados y colores
    const statusColors = {
        available: "green",
        adopted: "blue",
    };

    const statusNames = {
        available: "Disponible",
        adopted: "Adoptado",
    };

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
        let result = [...pets];

        // Filtro por especie (mayúsculas/minúsculas insensibles)
        if (filters.species) {
            result = result.filter(pet =>
                pet.species.toLowerCase() === filters.species.toLowerCase()
            );
        }

        // Filtro por estado de adopción
        if (filters.adoptionStatus) {
            const isAdopted = filters.adoptionStatus === 'adopted';
            result = result.filter(pet => pet.isAdopted === isAdopted);
        }

        // Filtro por búsqueda de texto
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(pet =>
                (pet.name && pet.name.toLowerCase().includes(searchLower)) ||
                (pet.breed && pet.breed.toLowerCase().includes(searchLower)) ||
                (pet.description && pet.description.toLowerCase().includes(searchLower))
            );
        }

        setFilteredPets(result);
        setCurrentPage(1); // Volver a primera página al filtrar
    }, [filters, pets]);

    // Función para cambiar de página
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
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

    // Formatear la edad para mostrar
    const formatAge = (pet) => {
        if (pet.ageGroup) {
            return pet.ageGroup;
        }
        if (pet.age) {
            return `${pet.age} ${pet.ageUnit === 'years' ? 'años' : 'meses'}`;
        }
        return "No especificada";
    };

    return (
        <div>
            {/* Filtros */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label
                            htmlFor="species"
                            className="block text-sm font-medium text-gray-700"
                        >
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
                            <option value="perro">Perros</option>
                            <option value="gato">Gatos</option>
                        </select>
                    </div>
                    <div>
                        <label
                            htmlFor="adoptionStatus"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Estado
                        </label>
                        <select
                            id="adoptionStatus"
                            name="adoptionStatus"
                            value={filters.adoptionStatus}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Todos</option>
                            <option value="available">Disponibles</option>
                            <option value="adopted">Adoptados</option>
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
                                placeholder="Nombre, raza..."
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
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabla de mascotas */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {isLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-70 flex justify-center items-center z-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {filteredPets.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        No se encontraron mascotas que coincidan con los criterios de búsqueda.
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
                                        Especie
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Raza
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Edad
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentItems.map((pet) => (
                                    <tr key={pet.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {pet.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {pet.imageUrl && (
                                                    <div className="flex-shrink-0 h-10 w-10 mr-3">
                                                        <img
                                                            className="h-10 w-10 rounded-full object-cover"
                                                            src={pet.imageUrl}
                                                            alt={pet.name}
                                                        />
                                                    </div>
                                                )}
                                                <div className="text-sm font-medium text-gray-900">
                                                    {pet.name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {pet.species}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {pet.breed}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatAge(pet)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pet.isAdopted ?
                                                    'bg-blue-100 text-blue-800' :
                                                    'bg-green-100 text-green-800'}`}
                                            >
                                                {pet.isAdopted ? statusNames.adopted : statusNames.available}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                {!pet.isAdopted ? (
                                                    <a
                                                        href={`/admin/mascotas/${pet.id}/editar`}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Editar"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </a>
                                                ) : (
                                                    <a
                                                        href={`/admin/mascotas/${pet.id}/detalles`}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Ver detalles"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </a>
                                                )
                                                }
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
                                            {Math.min(indexOfLastItem, filteredPets.length)}
                                        </span> de{" "}
                                        <span className="font-medium">{filteredPets.length}</span>{" "}
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
                                                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
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
                                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
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

export default PetsList;
