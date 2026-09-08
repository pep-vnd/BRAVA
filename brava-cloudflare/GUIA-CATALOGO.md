# Gestionar las viviendas de BRAVA

Tu panel sigue siendo DatoCMS → Inmobiliaria LuxeEstate → Content → Inmueble.

## Añadir o modificar una vivienda

1. Abre una vivienda o pulsa **Add a new record**.
2. Rellena título, tipo de vivienda, zona, superficie, habitaciones, baños y descripción.
3. Sube las fotografías de esa vivienda a **Galería de fotos**. La primera será la portada.
4. En el nuevo selector **Operación**, elige **Venta** o **Alquiler**.
5. En **Precio**, escribe el precio total si vendes, o la renta mensual si alquilas. Solo el número en euros.
6. Guarda y pulsa **Publish**. Recarga BRAVA: puede tardar hasta unos cinco minutos en recoger los cambios.

El selector ya está creado, con identificador `operacion`. No se ha asignado una operación ni cambiado el precio de las dos viviendas existentes. Hasta que lo hagas, aparecerán como «Consultar operación» y «Consultar precio», y no entrarán en el filtro de compra/alquiler o presupuesto.

También están importadas las seis viviendas originales de BRAVA: cuatro ventas y dos alquileres. Se pueden editar desde este mismo panel. Su descripción empieza por `[DEMOSTRACIÓN BRAVA]`, que permite identificarlas como ficticias en la web. Conserva esa marca mientras sigan siendo ejemplos. Las consultas de visita de estas viviendas solo validan datos, sin enviar un correo real. Los identificadores internos ya no aparecen en tarjetas, fichas ni formularios.

Las zonas del buscador se generan a partir del catálogo. Usa siempre la misma escritura para una misma zona. Publica solo viviendas con fotos y datos numéricos completos. Los borradores no aparecen. Al retirar una vivienda de publicación, desaparecerá tras refrescarse la caché.

## Solicitudes de contacto, visitas y valoración

Los tres formularios usan la plantilla que ya tenías en EmailJS. Se conservan sus campos en español: nombre, email, telefono, mensaje, propiedad, precio, zona y url. El tipo de consulta se incluye en el mensaje.

Has confirmado que **To Email** en esa plantilla está configurado a **pepecarmona2904@gmail.com**. El destinatario se cambia en EmailJS, no en el formulario. El correo visible se cambia en `content/site.ts`.

La web solo muestra «Solicitud enviada» cuando EmailJS acepta la petición. Si hay un error, conserva los datos para poder intentarlo más tarde. La aceptación de EmailJS no garantiza que el mensaje llegue a la bandeja de entrada; revisa también spam. No se ha enviado un correo real durante las pruebas técnicas.

## Configuración técnica

- `DATOCMS_READONLY_TOKEN`: secreto del servidor, nunca se incluye en el navegador.
- `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`: identificadores públicos de EmailJS.
- `CONTACT_ENABLED=true`: activa los envíos; `false` mantiene la validación de demostración.

En local están en `.dev.vars`, excluido de Git. En la web alojada se guardan como variables de ejecución de Sites. Si se traslada a tu Cloudflare, habrá que configurarlas allí también. No subas `.dev.vars`, archivos `secret.txt` ni el ZIP antiguo a un repositorio público.

El catálogo utiliza consultas de solo lectura y una caché de cinco minutos por instancia. No escribe ni borra viviendas. Si DatoCMS falla, muestra un aviso; nunca sustituye un catálogo conectado por inmuebles ficticios.

No se ha contratado ningún plan de pago ni trasladado todavía el alojamiento a tu cuenta de Cloudflare. La identidad BRAVA y las fotos decorativas conservan su carácter de demostración. Antes de una publicación comercial, completa los datos de la agencia y la información de privacidad.
