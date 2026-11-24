# TÓTEM · PWA del videojuego

Página para dar a conocer el videojuego TÓTEM. Es una PWA: se puede instalar como app y funciona sin internet.

## Archivos

```
totem-pwa/
├── index.html        Página principal (meta theme-color, manifest y registro del Service Worker en el <head>)
├── manifest.json     Nombre, colores, íconos 192 y 512, display standalone
├── sw.js             Service Worker (caché para funcionar sin conexión)
├── css/estilos.css   Diseño, animaciones y media queries (responsivo)
├── js/app.js         Intro, animaciones, galería, controles, reto de preguntas y botón de instalar
└── img/
    ├── iconos/       icon-192.png, icon-512.png, icon-maskable-512.png, favicon, apple-touch-icon
    ├── salas/        Fondos de las 7 salas del juego
    ├── sprites/      Personajes, enemigos y objetos (hojas de sprites animadas con CSS)
    └── capturas/     Capturas que usa el manifest al instalar
```

## Cómo abrirla en XAMPP

1. Copia la carpeta `totem-pwa` dentro de `C:\xampp\htdocs\`.
2. Abre el **XAMPP Control Panel** y da clic en **Start** en **Apache**.
3. En Chrome o Edge abre: **http://localhost/totem-pwa/**
4. Para instalarla: en la barra de direcciones aparece el ícono de instalar (o menú ⋮ → **Instalar TÓTEM**). También está el botón **Instalar app** en la página.

> La PWA necesita **HTTPS o localhost**. Por eso funciona en `http://localhost`, pero **no** si abres el `index.html` con doble clic (`file:///...`).

## Probar que funciona sin conexión

1. Abre la página una vez con Apache encendido.
2. Presiona **F12 → Application → Service Workers** y verifica que `sw.js` diga *activated and is running*.
3. En **Application → Manifest** revisa el nombre, colores e íconos.
4. Marca **Offline** en la pestaña **Network** (o detén Apache) y recarga: la página sigue funcionando.

## Estrategias de caché

| Estrategia | Cómo funciona | Ventaja | Desventaja | Dónde se usa aquí |
|---|---|---|---|---|
| **Cache-first** | Primero busca el archivo en la caché; si no está, lo pide a la red y lo guarda. | Muy rápida y funciona sin internet. | Si cambias el archivo, se sigue viendo el viejo hasta subir la versión del caché. | CSS, JS, imágenes, íconos y fuentes |
| **Network-first** | Primero pide el archivo a la red; si no hay conexión, usa la copia de la caché. | Siempre muestra lo más nuevo cuando hay internet. | Es más lenta porque espera a la red. | El `index.html` |

## Cada vez que cambies algo

1. Edita lo que necesites (textos en `index.html`, estilos en `css/estilos.css`).
2. Si agregas imágenes nuevas, ponlas también en la lista `ARCHIVOS` de `sw.js`.
3. Sube la versión en `sw.js`: `const VERSION = 'totem-v1';` → `'totem-v2'`.
4. Recarga la página dos veces (o en F12 → Application → Service Workers marca *Update on reload*).

## Pendientes

- **Equipo de desarrollo:** en `index.html`, sección `EQUIPO`, cambia "Nombre del integrante" y "Rol" por los datos reales. Copia una tarjeta `<article class="miembro">` si son más.
- **Actualizar la PWA cuando cambie el juego.** Si mejoras los sprites o agregas mecánicas:
  - Sprites nuevos → reemplaza los PNG en `img/sprites/` y `img/salas/` (mismo nombre y mismo número de cuadros).
  - Mecánicas nuevas → agrega una tarjeta en la sección **Cómo se juega**.
  - Enemigos o personajes nuevos → agrega un bloque en **Personajes** o **Villanos**.
  - Preguntas nuevas → agrégalas en `PREGUNTAS` dentro de `js/app.js`.
  - Al final, sube la `VERSION` en `sw.js`.
