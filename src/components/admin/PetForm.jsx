import { useState, useEffect } from "react";
import ImageUploader from "../ImageUploader";

export default function PetForm({ initialPet = {}, isAdopted = false, mode = "new", backUrl = "" }) {

    const [form, setForm] = useState({
        ...initialPet,
        imageUrl: initialPet.imageUrl || "",
        isAvailableForSponsorship: initialPet.isAvailableForSponsorship || false,
    });

    useEffect(() => {
        setForm({
            ...initialPet,
            imageUrl: initialPet.imageUrl || "",
            isAvailableForSponsorship: initialPet.isAvailableForSponsorship || false,
        });
    }, [initialPet]);

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const endpoint = mode === "new" ? "/api/admin/create-pet" : "/api/admin/update-pet";

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleImageUrl = (url) => {
        setForm((prev) => ({ ...prev, imageUrl: url }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            console.log("Submitting form data:", form);

            // Ensure the ID is properly formatted, if it exists
            const formData = {
                ...form,
                id: form.id ? String(form.id) : undefined,
            };

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Server responded with error:", res.status, errorText);
                throw new Error(`Error del servidor: ${res.status} ${errorText}`);
            }

            const responseData = await res.json();
            console.log("Server response:", responseData);

            const { data } = responseData;
            setResult(data);

            if (data.success) {
                setTimeout(() => {
                    window.location.href = "/admin/mascotas";
                }, 1800);
            }
        } catch (error) {
            console.error("Error in form submission:", error);
            setResult({ error: { message: error.message || "Error de red o del servidor." } });
        } finally {
            setLoading(false);
        }
    };

    if (isAdopted) {
        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                {result?.success && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
                        <p className="font-bold">¡Éxito!</p>
                        <p>{result.message}</p>
                    </div>
                )}
                {result?.error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                        <p className="font-bold">Error</p>
                        <p>{result.error.message || "Ocurrió un error al procesar el formulario."}</p>
                    </div>
                )}

                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
                    <p className="font-bold">Mascota Adoptada</p>
                    <p>Esta mascota ya ha sido adoptada. Solo puedes editar su descripción.</p>
                </div>

                <input type="hidden" name="imageUrl" value={form.imageUrl} />

                {/* All other fields are hidden, but we'll keep them in the form data */}
                {Object.entries(form).map(([key, value]) => {
                    if (key !== "description" && key !== "imageUrl") {
                        return <input key={key} type="hidden" name={key} value={value} />;
                    }
                    return null;
                })}

                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-2">Descripción:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={form.description || ""}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-md h-40"
                        disabled={loading}
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        className={`bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Actualizando...' : "Actualizar descripción"}
                    </button>
                    <a
                        href={backUrl}
                        className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400"
                    >
                        Cancelar
                    </a>
                </div>
            </form>
        );
    }

    // Standard form for non-adopted pets
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {result?.success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
                    <p className="font-bold">¡Éxito!</p>
                    <p>{result.message}</p>
                </div>
            )}
            {result?.error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{result.error.message || "Ocurrió un error al procesar el formulario."}</p>
                </div>
            )}

            <input type="hidden" name="imageUrl" value={form.imageUrl} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">Nombre:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={form.name || ""}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-md"
                        required
                        disabled={loading}
                    />
                </div>
                <div>
                    <label htmlFor="species" className="block text-sm font-medium mb-2">Especie:</label>
                    <select
                        id="species"
                        name="species"
                        value={form.species?.toLowerCase() || ""}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-md"
                        required
                        disabled={loading}
                    >
                        <option value="">Seleccionar especie</option>
                        <option value="perro">Perro</option>
                        <option value="gato">Gato</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="gender" className="block text-sm font-medium mb-2">Sexo:</label>
                    <select
                        id="gender"
                        name="gender"
                        value={form.gender?.toLowerCase() || ""}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-md"
                        required
                        disabled={loading}
                    >
                        <option value="">Seleccionar sexo</option>
                        <option value="macho">Macho</option>
                        <option value="hembra">Hembra</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="ageGroup" className="block text-sm font-medium mb-2">Grupo de edad:</label>
                    <select
                        id="ageGroup"
                        name="ageGroup"
                        value={form.ageGroup?.toLowerCase() || ""}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-md"
                        disabled={loading}
                    >
                        <option value="">Seleccionar edad</option>
                        <option value="cachorro">Cachorro</option>
                        <option value="joven">Joven</option>
                        <option value="adulto">Adulto</option>
                        <option value="senior">Senior</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="breed" className="block text-sm font-medium mb-2">Raza:</label>
                    <input
                        type="text"
                        id="breed"
                        name="breed"
                        value={form.breed || ""}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-md"
                        disabled={loading}
                    />
                </div>
                <div>
                    <label htmlFor="size" className="block text-sm font-medium mb-2">Tamaño:</label>
                    <select
                        id="size"
                        name="size"
                        value={form.size?.toLowerCase() || ""}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-md"
                        disabled={loading}
                    >
                        <option value="">Seleccionar tamaño</option>
                        <option value="pequeño">Pequeño</option>
                        <option value="mediano">Mediano</option>
                        <option value="grande">Grande</option>
                    </select>
                </div>
                <div className="col-span-2">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="isAvailableForSponsorship"
                            checked={form.isAvailableForSponsorship}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600"
                            disabled={loading}
                        />
                        <span className="text-sm font-medium">Disponible para apadrinamiento</span>
                    </label>
                </div>
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">Descripción:</label>
                <textarea
                    id="description"
                    name="description"
                    value={form.description || ""}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md h-40"
                    disabled={loading}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Imagen:</label>
                <ImageUploader
                    imageUrl={form.imageUrl}
                    setImageUrl={handleImageUrl}
                    key={form.imageUrl || 'uploader'} // Add key to force re-render when imageUrl changes
                />
            </div>

            <div className="flex gap-4 pt-4">
                <button
                    type="submit"
                    className={`bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={loading}
                >
                    {loading ? 'Guardando...' : (mode === "edit" ? "Actualizar mascota" : "Crear mascota")}
                </button>
                <a
                    href={backUrl}
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400"
                >
                    Cancelar
                </a>
            </div>
        </form>
    );
}