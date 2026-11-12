# Budgo + Booking

Budgo ya genera enlaces de búsqueda a Booking con destino, fechas y ocupación.
Booking gestiona actualmente las altas de afiliados de España mediante CJ
(Commission Junction). Una vez aprobado, genera en CJ un **deep link** para
Booking y configura su plantilla en `.env.local`:

```env
BOOKING_AFFILIATE_URL_TEMPLATE='https://www.anrdoezrs.net/click-TU_PID-TU_ADID?url={url}'
```

Conserva exactamente el marcador `{url}`. Budgo lo reemplaza por cada búsqueda
de Booking y así el clic se atribuye a tu cuenta de CJ. No subas `.env.local` a
Git ni lo publiques en el cliente.

## Precios y disponibilidad reales (opcional)

Sin una API, Budgo redirige al resultado real de Booking, pero los importes de la
lista son estimaciones demo. Para consultar inventario y precio reales dentro de
Budgo, Booking debe aprobarte para Demand API. Cuando tengas credenciales, añade
`BOOKING_API_MODE=live` y `BOOKING_API_TOKEN` en el entorno de despliegue.

En Netlify: **Site configuration → Environment variables**. Define las mismas
variables allí y vuelve a desplegar. El token debe estar solo en el servidor.

## Transparencia

El botón indica "Enlace afiliado". Antes de publicar, incorpora también una nota
equivalente en el aviso legal o en la política de afiliación del sitio.
