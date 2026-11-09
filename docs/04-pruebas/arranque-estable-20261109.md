# Arranque estable y retorno · 9 de noviembre de 2026

Christian informó recargas al salir y volver y una pantalla que entra y sale durante el arranque. Había dos actualizadores simultáneos: el contenedor recreaba el iframe y el script interno podía recargar toda la aplicación. Además, el script interno forzaba una segunda carga al encontrar un marcador local anterior, aun cuando el documento acababa de descargarse de la red.

Se conserva el actualizador interno como coordinador único. La primera lectura válida registra la versión de referencia sin reiniciar; un cambio posterior mantiene la actualización existente, pospuesta mientras hay un campo activo. Las comprobaciones concurrentes se agrupan y se recuperan después de un fallo inicial de red. La configuración del service worker, cachés, datos y permisos no se modifica.

El contenedor espera a que la pantalla legacy termine su carga antes de retirar la portada. Ya no libera la interfaz a los seis segundos con datos incompletos. Una conexión lenta ofrece reintentar, pero si termina permite entrar sin otra recarga. Los temporizadores de documentos anteriores se descartan. La navegación interna a ODD no se trata como un arranque fallido.

Validación: trece pruebas específicas de arranque y actualización; suite completa y compilación Next.js. Revisión cruzada sin bloqueos. No se puede impedir que el sistema operativo descarte una aplicación en segundo plano; ese caso sí requiere cargar al volver.
