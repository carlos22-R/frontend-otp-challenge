# OTP Verification - Front-End Technical Challenge

Interfaz de verificación de código OTP (One-Time Password) de 4 dígitos construida con React + TypeScript.

---

## Tecnologías

| Herramienta | Uso |
|---|---|
| React 19 | UI |
| TypeScript | Tipado estático |
| Vite | Bundler y dev server |
| TailwindCSS | Estilos |
| React Router DOM | Navegación SPA |
| Express | Servidor backend para generar/verificar OTP |
| Vitest + React Testing Library | Testing |

---

## Requisitos previos

- **Node.js** >= 18
- **npm** >= 9

---

## Instalación

```bash
git clone <url-del-repositorio>
cd otp-project
npm install
```

---

## Ejecución

### Opción 1 — Todo junto (recomendado)

```bash
npm run dev:full
```

Esto inicia el servidor backend (puerto 3001) y el frontend (puerto 5173) simultáneamente.

### Opción 2 — Por separado

```bash
# Terminal 1: servidor backend
npm run server

# Terminal 2: frontend
npm run dev
```

### Acceder a la aplicación

Abrir [http://localhost:5173](http://localhost:5173) en el navegador.

---

## Flujo de uso

1. **Login** — Ingresar un email válido y presionar "Continuar"
2. El servidor genera un OTP de 4 dígitos y redirige a `/verify?otp=XXXX`
3. **Verificación** — Ingresar el código OTP en los 4 campos
4. Si el código es correcto, el botón se habilita y se puede continuar
5. **Éxito** — Pantalla de verificación exitosa

> El OTP generado se imprime en la consola del servidor para facilitar las pruebas.

---

## Testing

```bash
# Ejecutar tests una vez
npm test -- --run

# Ejecutar tests en modo watch
npm test
```

### Tests incluidos (10 pruebas)

| Test | Descripción |
|---|---|
| Muestra 4 inputs | Verifica el renderizado correcto del formulario |
| Botón deshabilitado | El botón está disabled con código incompleto |
| Botón habilitado con OTP correcto | Se habilita al ingresar el código válido |
| Error con OTP incorrecto | Muestra mensaje de error al no coincidir |
| Pegar código completo | Distribuye los dígitos pegados en cada input |
| Sanitizar pegado | Extrae solo dígitos de texto pegado con caracteres inválidos |
| Navegación ArrowLeft | Flecha izquierda mueve foco al input anterior |
| Navegación ArrowRight | Flecha derecha mueve foco al siguiente input |
| Backspace en vacío | Retrocede al input anterior si el actual está vacío |
| Redirige sin OTP válido | Redirige al login si la URL no tiene OTP de 4 dígitos |

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el frontend (Vite) |
| `npm run server` | Inicia el servidor backend (Express) |
| `npm run dev:full` | Inicia frontend + backend simultáneamente |
| `npm run build` | Build de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm test` | Ejecuta las pruebas con Vitest |

---

## Estructura del proyecto

```
otp-project/
├── server/
│   └── index.ts              # Servidor Express (genera y verifica OTP)
├── src/
│   ├── pages/
│   │   ├── Login.tsx          # Pantalla de login (email)
│   │   ├── Osp.tsx            # Pantalla de verificación OTP
│   │   ├── Success.tsx        # Pantalla de éxito
│   │   ├── NotFound.tsx       # Página 404
│   │   └── __tests__/
│   │       └── Osp.test.tsx   # Tests del componente OTP
│   ├── test/
│   │   └── setup.ts           # Setup de Vitest
│   ├── App.tsx                # Rutas de la aplicación
│   └── main.tsx               # Entry point
├── vite.config.ts             # Configuración de Vite + Vitest + proxy
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Decisiones técnicas

- **Express como backend ligero**: se agregó un servidor mínimo para generar y validar OTP server-side, en vez de solo comparar en frontend. El OTP se almacena en memoria con expiración de 5 minutos.
- **Vite proxy**: las peticiones `/api/*` del frontend se redirigen al backend (puerto 3001) mediante el proxy de Vite, evitando problemas de CORS en desarrollo.
- **Validación dual**: el OTP se valida tanto en el frontend (comparación con query param para UX inmediata) como en el backend (`POST /api/verify-otp` para seguridad).
- **Vitest + React Testing Library**: herramientas estándar del ecosistema Vite/React para testing, con `userEvent` para simular interacción real del usuario.
- **Accesibilidad**: inputs con `aria-label`, botón con `aria-disabled`, errores con `role="alert"`, foco visible en todos los elementos interactivos.

---

## Supuestos realizados

- El OTP siempre es de exactamente 4 dígitos numéricos.
- En esta demo, el OTP se devuelve en la respuesta del servidor y se pasa por URL para facilitar las pruebas. En producción se enviaría por email/SMS y no se expondría al frontend.
- El almacenamiento en memoria (Map) es suficiente para demo; en producción se usaría Redis o base de datos.
- No se requiere persistencia de sesión entre recargas.

---

## Mejoras con más tiempo

- Envío real del OTP por email (integración con SendGrid, Resend, etc.)
- Rate limiting en los endpoints para prevenir abuso
- Almacenamiento en Redis con TTL nativo en vez de Map en memoria
- Contador de intentos fallidos con bloqueo temporal
- Temporizador visual de expiración del OTP en el frontend
- Animaciones de transición entre pantallas
- Tests E2E con Playwright
