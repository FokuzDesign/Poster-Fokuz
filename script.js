document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('poster-form');
    const submitBtn = document.getElementById('submit-btn');
    const resultArea = document.getElementById('result-area');
    const loadingMessage = document.getElementById('loading-message');
    const posterContainer = document.getElementById('poster-container');
    const downloadBtn = document.getElementById('download-btn');
    const canvas = document.getElementById('poster-canvas');
    const formFields = {
        estilo: document.getElementById('estilo'),
        colores: document.getElementById('colores'),
        producto: document.getElementById('producto'),
        detalles: document.getElementById('detalles'),
        contacto: document.getElementById('contacto'),
        logo_usuario: document.getElementById('logo_usuario')
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!formFields.estilo.value || !formFields.producto.value) {
            alert("Por favor, llena los campos obligatorios.");
            return;
        }

        resultArea.classList.remove('hidden');
        loadingMessage.classList.remove('hidden');
        posterContainer.classList.add('hidden');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Creando...';

        const prompt = `Diseña un póster con estilo ${formFields.estilo.value} y colores ${formFields.colores.value || 'predeterminados'} para una persona que vende ${formFields.producto.value}. Incluir detalles: ${formFields.detalles.value || 'ninguno'}. Contacto: ${formFields.contacto.value || 'ninguno'}.`;

        try {
            const response = await fetch("/api/generate-image", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ prompt })
            });

            const data = await response.json();
            const imageUrl = data.imageUrl;

            if (imageUrl) {
                loadingMessage.classList.add('hidden');
                await addWatermark(imageUrl);
                posterContainer.classList.remove('hidden');
            } else {
                alert('No se pudo generar la imagen.');
                resetFormState();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error inesperado.');
            resetFormState();
        }
    });

    async function addWatermark(imageUrl) {
        return new Promise((resolve) => {
            const stage = new Konva.Stage({
                container: 'poster-canvas',
                width: 1024,
                height: 1024
            });

            const layer = new Konva.Layer();
            stage.add(layer);

            Konva.Image.fromURL(imageUrl, (posterImage) => {
                posterImage.setAttrs({
                    width: stage.width(),
                    height: stage.height()
                });
                layer.add(posterImage);
                layer.draw();

                Konva.Image.fromURL('assets/logo.png', (logoImage) => {
                    logoImage.setAttrs({
                        width: 100,
                        height: 40,
                        x: stage.width() - 110,
                        y: 10,
                        opacity: 0.7
                    });
                    layer.add(logoImage);
                    layer.draw();

                    const userLogoFile = formFields.logo_usuario.files[0];
                    if (userLogoFile) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            Konva.Image.fromURL(e.target.result, (userLogo) => {
                                userLogo.setAttrs({
                                    width: 150,
                                    height: 150,
                                    x: 50,
                                    y: stage.height() - 200,
                                    opacity: 0.8
                                });
                                layer.add(userLogo);
                                layer.draw();
                                resolve();
                            });
                        };
                        reader.readAsDataURL(userLogoFile);
                    } else {
                        resolve();
                    }
                });
            });
        });
    }

    downloadBtn.addEventListener('click', () => {
        const dataURL = canvas.toDataURL({ mimeType: 'image/jpeg', quality: 1.0 });
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'poster-fokuz.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    function resetFormState() {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Crear mi póster';
        loadingMessage.classList.add('hidden');
        posterContainer.classList.add('hidden');
    }
});