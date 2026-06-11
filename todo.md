# Beri Disposable - Project TODO

## Fase 2: Arquitectura de datos y tema visual
- [x] Definir esquema de base de datos (códigos, query logs, wholesale inquiries, wholesale users, site images, admins)
- [x] Generar y aplicar migraciones SQL
- [x] Configurar sistema de tema visual (paleta blanco/negro/gris, fuentes, glasmorfismo)
- [x] Configurar fuentes Google Fonts modernas

## Fase 3: Backend
- [x] Sistema de autenticación propio (admin login con email/password + JWT propio)
- [x] Sistema de autenticación wholesale (registro, login, aprobación)
- [x] API: verificación de códigos de autenticación (público)
- [x] API: registro de query logs (IP, user agent, resultado)
- [x] API: importar códigos CSV/TXT (admin)
- [x] API: CRUD de códigos (admin)
- [x] API: solicitud wholesale (público) + notificación al owner
- [x] API: gestión wholesale inquiries (admin: listar, aprobar, rechazar, export CSV)
- [x] API: flujo de aprobación con token de registro por email
- [x] API: gestión de imágenes del sitio (subir, asignar a secciones)
- [x] Helper de envío de emails (preparado para SMTP/Resend en Railway)
- [x] Tests vitest para procedimientos clave

## Fase 4: Frontend público
- [x] Layout público con navbar moderno (dropdown Products), warning de nicotina en header
- [x] Footer con warning de nicotina y emails de contacto
- [x] Home: hero banner, carrusel de productos, secciones Beri Crush y Beri Cliq
- [x] Página Beri Crush con galería de sabores (placeholders grises con medidas)
- [x] Página Beri Cliq con galería de sabores (placeholders grises con medidas)
- [x] Página Authenticate: formulario de código + Scratch/Scan/Certify + respuesta visual
- [x] Página Wholesale: formulario de solicitud
- [x] Página de registro/login wholesale (auth propio)
- [x] Página de completar registro (desde email token)
- [x] Componente PlaceholderImage (gris con dimensiones visibles)

## Fase 5: Panel admin
- [x] Login de admin propio
- [x] Layout del panel admin (sidebar estilo WordPress)
- [x] Dashboard con estadísticas
- [x] Gestión Verify Codes (importar, listar, buscar, añadir, eliminar)
- [x] Query Logs (listar, buscar)
- [x] Wholesale Inquiries (listar, aprobar, rechazar, export CSV)
- [x] Gestión de usuarios wholesale aprobados
- [x] Gestión de imágenes del sitio (subir, asignar secciones)

## Fase 6: Pulido visual y pruebas
- [x] Glasmorfismo, bordes redondeados, animaciones de entrada
- [x] Efectos parallax y scroll suave
- [x] Responsive completo
- [x] Verificar todos los flujos en navegador
- [x] Ejecutar tests vitest

## Fase 7: Deploy y entrega
- [x] Documentación de deploy en Railway (variables de entorno, R2, email)
- [x] Documentar integración Cloudflare R2
- [x] Probar flujos faltantes en navegador (código inválido, wholesale submit/approve, logs, inquiries, images)
- [x] Push a GitHub (repo privado georgemontilva-crypto/beri-disposable)
- [x] Checkpoint y entrega

## Mejoras Home (v2)
- [x] Sección hero general arriba (breve, impactante)
- [x] Sección Beri Crush: specs reales (World's 1st Auto-Adaptive Power, Crush Mode 25K / Normal Mode 50K puffs, Interactive HD Screen, 2.5x Charging Speed, Quad Coil Technology) + carrusel automático de sabores
- [x] Sección Beri Cliq: specs reales (Cliq Mode 25K / Normal Mode 50K puffs, 360° Crystal Tank, 2.5x Charging Speed, LED Display, Refillable Pod, Dual Mesh Coil) + carrusel automático de sabores
- [x] Carruseles de sabores con autoplay (3-4s), indicadores y transición suave
- [x] Checkpoint y push a GitHub (04bfc890)

## Mejoras v3
- [x] Hero: reemplazar por video horizontal (95% ancho, centrado, 35px margen top/bottom), gestionable desde admin
- [x] Backend: añadir slot de video hero al sistema de imágenes/media del admin
- [x] Admin: sección para subir/cambiar el video del hero
- [x] Páginas de producto: añadir bento grid de especificaciones con imágenes de detalle y etiquetas (estilo referencia)
- [x] Slots de imágenes de detalle de specs en el panel admin (crush_spec_1..4, cliq_spec_1..4)
- [x] Tipografía: cambiar títulos y subtítulos a Bebas Neue (Impact-style)
- [x] Checkpoint y push a GitHub (5b87ab76)

## Solicitud v4 (pendiente)
- [x] Título BERI CRUSH / BERI CLIQ alineado a la izquierda en ProductPage.tsx (junto al texto, no centrado)
- [x] Hero video con altura fija de 800px en Home.tsx
- [x] Fondos negros en secciones de las páginas de producto (ProductPage.tsx)
- [x] Scroll al top al navegar entre productos (botón inferior en ProductPage.tsx)
- [x] Pantalla de carga negra completa con círculo SVG animado que cambia de colores (amarillo → azul → rosa → verde) y porcentaje numérico (LoadingScreen.tsx)
