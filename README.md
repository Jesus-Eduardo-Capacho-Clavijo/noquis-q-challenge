# 🏆 Ñoquis Q Challenge | SoloQ Tournament Tracker

Plataforma de clasificación y seguimiento de estadísticas en tiempo real inspirada en **[SoloQ Challenge](https://soloqchallenge.gg/)**, diseñada para que puedas organizar desafíos y torneos de League of Legends con tus amigos o comunidad añadiendo cualquier cuenta de Riot Games.

![SoloQ Challenge Dark Theme](https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/ranked-emblem/wings_challenger.png)

---

## ✨ Características

- 🎮 **Añade cualquier Riot ID**: Agrega cuentas de cualquier servidor (**LAN, LAS, EUW, NA, KR, BR, etc.**) especificando Riot ID (`Nombre#TAG`), rol principal y país.
- ⚡ **Integración Oficial con Riot Games API**: Consulta rangos en vivo (Challenger, GM, Master, Diamond...), LP, Winrate, Rachas (Hot Streak) e historial de partidas.
- 🧪 **Modo Simulado / Fallback automático**: Si no tienes una API Key a mano, la aplicación funciona de inmediato con datos de prueba realistas para que puedas disfrutar de la experiencia visual sin bloqueos.
- 🥇 **Podio Top 3**: Visualización destacada de los 3 líderes de la tabla con efectos dorados, plateados y de bronce.
- ⏳ **Contador Regresivo del Torneo**: Cronómetro personalizable para saber cuánto tiempo queda para el cierre del desafío.
- 🛡️ **Items del Torneo (Aegis & Shells)**: Sistema de bonificaciones y items especiales personalizables.
- 🔍 **Filtros Avanzados**: Búsqueda en tiempo real, filtro por roles (Top, Jng, Mid, Adc, Sup) y por Elo (High Elo vs Low Elo).
- 📊 **Modal Detallado de Jugador**: Historial de partidas con KDA, CS, duración, ítems y campeones jugados.
- 🌙 **Diseño eSports Dark Mode**: UI moderna con Tailwind CSS, acentos neón y efectos visuales de alta fidelidad.

---

## 🚀 Inicio Rápido

### 1. Requisitos
- **Node.js** v18 o superior.
- (Opcional) Una **Riot Games API Key** de [developer.riotgames.com](https://developer.riotgames.com/).

### 2. Instalación de Dependencias
Ejecuta en la raíz del proyecto:
```bash
npm run install:all
```

### 3. Iniciar en Desarrollo
```bash
npm run dev
```
Esto levantará simultáneamente:
- **Frontend (Vite + React)** en `http://localhost:5173`
- **Backend (Express API)** en `http://localhost:3001`

---

## 🔑 Configurar tu Riot Games API Key

1. Entra a [Riot Developer Portal](https://developer.riotgames.com/) e inicia sesión.
2. Copia tu **Personal API Key** (`RGAPI-...`).
3. Puedes ingresarla de dos formas:
   - **Desde la Web**: Haz clic en el icono de tuerca ⚙️ (Configuración) en la barra superior de la app, pega tu clave y haz clic en **Guardar Key**.
   - **Mediante archivo `.env`**: Crea un archivo `.env` en la raíz o en la carpeta `server/`:
     ```env
     RIOT_API_KEY=RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
     PORT=3001
     ```

---

## 📁 Estructura del Proyecto

```
ÑoquisQchallenge/
├── client/                      # Frontend en React + TypeScript + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx       # Barra de navegación superior
│   │   │   ├── HeroSection.tsx  # Podio Top 3, Stats y Countdown
│   │   │   ├── Leaderboard.tsx  # Tabla interactiva con filtros
│   │   │   ├── PlayerModal.tsx  # Historial de partidas y estadísticas
│   │   │   ├── AddPlayerModal.tsx # Formulario para agregar cuentas
│   │   │   ├── EditPlayerModal.tsx # Edición de participantes
│   │   │   ├── RulesModal.tsx   # Reglamento del torneo
│   │   │   ├── SettingsModal.tsx# Configuración de API Key y Torneo
│   │   │   └── RoleIcon.tsx     # Iconos vectoriales de roles de LoL
│   │   ├── data/
│   │   │   └── ddragon.ts       # Conector DataDragon para imágenes de LoL
│   │   ├── App.tsx              # Componente principal
│   │   └── index.css            # Estilos globales y efectos neon
│   └── vite.config.ts
├── server/                      # Backend Express & Proxy Riot API
│   ├── src/
│   │   ├── index.ts             # Endpoints REST
│   │   ├── riotService.ts       # Comunicación con Riot Games API
│   │   ├── storage.ts           # Persistencia local JSON y cálculo MMR
│   │   └── types.ts             # Tipos TypeScript
│   └── data/                    # Base de datos local (players.json, config.json)
└── package.json                 # Scripts raíz
```
