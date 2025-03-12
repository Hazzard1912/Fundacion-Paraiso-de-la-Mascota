import { useState, useEffect } from 'react';

export default function PetListing({ initialPets, filters }) {
  // Get initial URL parameters without React Router
  const getInitialParams = () => {
    if (typeof window === 'undefined') return { especie: '', tamaño: '', edad: '', sexo: '' };
    const url = new URL(window.location.href);
    return {
      especie: url.searchParams.get('especie') || '',
      tamaño: url.searchParams.get('tamaño') || '',
      edad: url.searchParams.get('edad') || '',
      sexo: url.searchParams.get('sexo') || '',
    };
  };

  const [filteredPets, setFilteredPets] = useState(initialPets);
  const [activeFilters, setActiveFilters] = useState(getInitialParams());

  // Update filters when form changes
  const handleFilterChange = (category, value) => {
    const newFilters = { ...activeFilters, [category]: value };
    setActiveFilters(newFilters);

    // Update URL params for shareable links without page reload
    const url = new URL(window.location.href);

    // Clear existing params
    url.searchParams.forEach((_, key) => {
      url.searchParams.delete(key);
    });

    // Add new params
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) url.searchParams.set(key, val);
    });

    // Update URL without reloading the page
    window.history.pushState({}, '', url);
  };

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setActiveFilters(getInitialParams());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Apply filters to pets
  useEffect(() => {
    const applyFilters = () => {
      return initialPets.filter(pet => {
        if (activeFilters.especie && pet.species !== activeFilters.especie) return false;
        if (activeFilters.tamaño && pet.size !== activeFilters.tamaño) return false;
        if (activeFilters.edad && pet.ageGroup !== activeFilters.edad) return false;
        if (activeFilters.sexo && pet.gender !== activeFilters.sexo) return false;
        return true;
      });
    };

    setFilteredPets(applyFilters());
  }, [activeFilters, initialPets]);

  // Helper function to clear all filters
  const clearFilters = () => {
    setActiveFilters({ especie: '', tamaño: '', edad: '', sexo: '' });
    // Update URL, removing all query params
    const url = new URL(window.location.href);
    url.search = '';
    window.history.pushState({}, '', url);
  };

  return (
    <>
      {/* Modern filters with animation */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 transform hover:shadow-xl transition-all duration-300">
        <h2 className="text-2xl font-semibold mb-6 text-amber-900">
          Filtrar Mascotas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(filters).map(([category, options]) => (
            <div className="group" key={category}>
              <label className="block text-sm font-semibold text-amber-800 mb-2 capitalize">
                {category}
              </label>
              <div className="relative">
                <select
                  value={activeFilters[category]}
                  onChange={(e) => handleFilterChange(category, e.target.value)}
                  className="w-full rounded-lg border border-amber-200 bg-amber-50 py-3 px-4 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-400 focus:ring-opacity-50 appearance-none transition-colors text-gray-700"
                >
                  <option value="">Todos</option>
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-amber-700">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pets grid with transition animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPets.map((pet) => (
          <a
            key={pet.id}
            href={`/mascotas/${pet.id}`}
            className="group transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={pet.imageUrl}
                  alt={pet.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h3 className="text-white text-xl font-semibold">{pet.name}</h3>
                  <p className="text-amber-200 text-sm">{pet.ageGroup} · {pet.species}</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-600 line-clamp-2">{pet.description || "Sin descripción"}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                    {pet.size}
                  </span>
                  <span className="text-amber-600 font-medium text-sm">Ver detalles →</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {filteredPets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No encontramos mascotas que coincidan con tus filtros.</p>
          <button
            onClick={clearFilters}
            className="mt-4 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </>
  );
}
