// Utilidades para la funcionalidad de compartir en redes sociales

document.addEventListener('DOMContentLoaded', () => {
    // Manejo de los botones para copiar enlace
    document.querySelectorAll('.copy-link').forEach(button => {
        button.addEventListener('click', async () => {
            const url = button.getAttribute('data-copy-url');
            if (!url) return;

            try {
                // Intenta usar la API moderna de portapapeles
                await navigator.clipboard.writeText(url);
                showToast('¡Enlace copiado!');
            } catch (err) {
                // Fallback para navegadores que no soportan la API moderna
                const textarea = document.createElement('textarea');
                textarea.value = url;
                textarea.style.position = 'fixed';
                document.body.appendChild(textarea);
                textarea.select();

                try {
                    document.execCommand('copy');
                    showToast('¡Enlace copiado!');
                } catch (err) {
                    console.error('No se pudo copiar el enlace:', err);
                    showToast('No se pudo copiar el enlace', 'error');
                }

                document.body.removeChild(textarea);
            }
        });
    });

    // Función para mostrar toast de notificación
    function showToast(message, type = 'success') {
        // Verifica si ya existe un toast
        let toast = document.getElementById('share-toast');

        // Si no existe, creamos el elemento toast
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'share-toast';
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.zIndex = '9999';
            toast.style.padding = '12px 20px';
            toast.style.borderRadius = '8px';
            toast.style.fontSize = '14px';
            toast.style.fontWeight = '500';
            toast.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
            toast.style.transition = 'opacity 0.3s, transform 0.3s';
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, 20px)';
            document.body.appendChild(toast);
        }

        // Configuramos el estilo según el tipo
        if (type === 'success') {
            toast.style.backgroundColor = '#eab308';
            toast.style.color = 'white';
        } else {
            toast.style.backgroundColor = '#ef4444';
            toast.style.color = 'white';
        }

        // Actualizamos el mensaje
        toast.textContent = message;

        // Mostramos el toast
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translate(-50%, 0)';
        }, 10);

        // Ocultamos después de 3 segundos
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, 20px)';
        }, 3000);

        // Eliminamos el elemento después de la animación
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 3300);
    }

    // Detectar clicks fuera de los menús compartir
    document.addEventListener('click', (event) => {
        const shareMenus = document.querySelectorAll('.share-menu:not(.hidden)');
        const shareButtons = document.querySelectorAll('.share-button');

        let clickedInsideMenu = false;
        shareMenus.forEach(menu => {
            if (menu.contains(event.target)) {
                clickedInsideMenu = true;
            }
        });

        let clickedOnButton = false;
        shareButtons.forEach(button => {
            if (button.contains(event.target)) {
                clickedOnButton = true;
            }
        });

        if (!clickedInsideMenu && !clickedOnButton) {
            // Cerrar todos los menús abiertos
            shareMenus.forEach(menu => {
                menu.classList.add('opacity-0', 'scale-95');
                setTimeout(() => {
                    menu.classList.add('hidden');
                }, 200);
            });
        }
    });
});
