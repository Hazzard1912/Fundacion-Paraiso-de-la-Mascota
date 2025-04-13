import React, { useState, useEffect } from 'react';

/**
 * Componente para mostrar y gestionar la lista de solicitudes de adopción
 * 
 * @param {Object} props
 * @param {Array} props.initialRequests - Datos iniciales de solicitudes de adopción
 */
const AdoptionRequestsList = ({ initialRequests = [] }) => {
    // Estado para almacenar datos
    const [requests, setRequests] = useState(initialRequests);
    const [filteredRequests, setFilteredRequests] = useState(initialRequests);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estado para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

    // Estado para filtros
    const [filters, setFilters] = useState({
        status: '',
        dateRange: '',
        search: '',
    });

    // Mapeo de estados y colores
    const statusColors = {
        pending: "yellow",
        approved: "green",
        rejected: "red",
    };

    const statusNames = {
        pending: "Pendiente",
        approved: "Aprobada",
        rejected: "Rechazada",
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
        let result = [...requests];

        // Filtro por estado
        if (filters.status) {
            result = result.filter(request =>
                request.requestStatus === filters.status
            );
        }

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
            }

            result = result.filter(request =>
                new Date(request.requestDate) >= fromDate
            );
        }

        // Filtro por búsqueda de texto
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(request =>
                (request.petName && request.petName.toLowerCase().includes(searchLower)) ||
                (request.adopterName && request.adopterName.toLowerCase().includes(searchLower)) ||
                (request.adopterEmail && request.adopterEmail.toLowerCase().includes(searchLower)) ||
                (request.adopterPhone && request.adopterPhone.toLowerCase().includes(searchLower))
            );
        }

        setFilteredRequests(result);
        setCurrentPage(1); // Volver a primera página al filtrar
    }, [filters, requests]);

    // Función para cambiar de página
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Funciones para aprobar/rechazar solicitudes
    const handleApprove = async (requestId) => {
        if (!confirm('¿Está seguro que desea aprobar esta solicitud?')) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/admin/update-adoption-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requestId,
                    status: 'approved'
                }),
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                // Actualizar estado local
                setRequests(prev =>
                    prev.map(req =>
                        req.requestId === requestId
                            ? { ...req, requestStatus: 'approved' }
                            : req
                    )
                );
            } else {
                setError(`Error al aprobar: ${result.error || 'Error desconocido'}`);
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async (requestId) => {
        if (!confirm('¿Está seguro que desea rechazar esta solicitud?')) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/admin/update-adoption-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requestId,
                    status: 'rejected'
                }),
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                // Actualizar estado local
                setRequests(prev =>
                    prev.map(req =>
                        req.requestId === requestId
                            ? { ...req, requestStatus: 'rejected' }
                            : req
                    )
                );
            } else {
                setError(`Error al rechazar: ${result.error || 'Error desconocido'}`);
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
                            htmlFor="status"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Estado
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Todos</option>
                            <option value="pending">Pendientes</option>
                            <option value="approved">Aprobadas</option>
                            <option value="rejected">Rechazadas</option>
                        </select>
                    </div>
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
                                placeholder="Nombre, mascota..."
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

            {/* Tabla de solicitudes */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {isLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-70 flex justify-center items-center z-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {filteredRequests.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        No se encontraron solicitudes de adopción.
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
                                        Solicitante
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dirección
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contacto
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha Solicitud
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
                                {currentItems.map((request) => (
                                    <tr key={request.requestId}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {request.requestId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {request.petName || `Mascota #${request.petId}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {request.adopterName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>{request.adopterAddress}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>{request.adopterEmail}</div>
                                            <div>{request.adopterPhone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(request.requestDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${statusColors[request.requestStatus]}-100 text-${statusColors[request.requestStatus]}-800`}
                                            >
                                                {statusNames[request.requestStatus]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {request.requestStatus === "pending" ? (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleApprove(request.requestId)}
                                                        className="text-green-600 hover:text-green-900"
                                                        disabled={isLoading}
                                                        title="Aprobar"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(request.requestId)}
                                                        className="text-red-600 hover:text-red-900"
                                                        disabled={isLoading}
                                                        title="Rechazar"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ) : (
                                                <a href={`/admin/solicitudes/${request.requestId}`} className="text-blue-600 hover:text-blue-900" title="Detalles">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </a>
                                            )}
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
                                            {Math.min(indexOfLastItem, filteredRequests.length)}
                                        </span> de{" "}
                                        <span className="font-medium">{filteredRequests.length}</span>{" "}
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

export default AdoptionRequestsList;
