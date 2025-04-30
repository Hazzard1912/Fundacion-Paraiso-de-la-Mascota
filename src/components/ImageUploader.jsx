import { useRef, useState, useEffect } from "react";

export default function ImageUploader({ imageUrl: initialImageUrl, setImageUrl, buttonText = "Subir imagen", slideId }) {
    const [imageUrl, setLocalImageUrl] = useState(initialImageUrl);
    const [imageData, setImageData] = useState(null);
    const inputRef = useRef();

    const handleFileSelection = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo de archivo
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            alert("Por favor seleccione un archivo de imagen válido (PNG, JPG o WEBP)");
            return;
        }

        // Validar tamaño (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("El tamaño de la imagen no debe exceder 5MB");
            return;
        }

        // Crear una URL local para previsualización
        const objectUrl = URL.createObjectURL(file);
        setLocalImageUrl(objectUrl);

        // Convertir a base64 para enviar al servidor
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageData(reader.result);

            // Guardar el base64 en un campo oculto del formulario
            const form = document.getElementById(`slideForm-${slideId}`);
            if (form) {
                const hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = 'imageData';
                hiddenInput.value = reader.result;

                // Reemplazar el input anterior si existe
                const existingInput = form.querySelector('input[name="imageData"]');
                if (existingInput) {
                    form.removeChild(existingInput);
                }

                form.appendChild(hiddenInput);
            }
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        // Limpiar URL de objeto al desmontar
        return () => {
            if (imageUrl && imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [imageUrl]);

    return (
        <div className="flex items-center space-x-6">
            <div className="w-40 h-40 bg-gray-100 rounded-md overflow-hidden" id="image-preview">
                {imageUrl ? (
                    <img src={imageUrl} alt="Previsualización" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No hay imagen</div>
                )}
            </div>
            <div>
                <input
                    type="file"
                    accept="image/*"
                    ref={inputRef}
                    style={{ display: "none" }}
                    onChange={handleFileSelection}
                />
                <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    onClick={() => inputRef.current.click()}
                >
                    {imageUrl ? "Cambiar imagen" : buttonText}
                </button>
            </div>
        </div>
    );
}