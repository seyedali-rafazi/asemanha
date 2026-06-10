<div align="center">

# Asemanyar

**An interactive flight-tracking and aviation map platform**

Real-time-style aircraft visualization, rich drawing tools, and layered map data — built with React, Mapbox GL, and deck.gl.

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![Mapbox GL](https://img.shields.io/badge/Mapbox%20GL-3-000000?logo=mapbox&logoColor=white)
![deck.gl](https://img.shields.io/badge/deck.gl-9-29323c)
![MUI](https://img.shields.io/badge/MUI-7-007fff?logo=mui&logoColor=white)

</div>

---

## Overview

**live :** [asemanyar.ir](https://www.asemanyar.ir/)


**Asemanyar** ("sky companion") is a dark-themed aviation map application centered on Iranian airspace. It renders a simulated live fleet of aircraft moving along realistic flight paths, alongside airports and radio antennas, on top of switchable base maps. A full suite of drawing and measurement tools turns the map into an interactive workspace.

> Aircraft movement is **simulated client-side** — each aircraft advances along predefined waypoints at its real cruise speed using haversine math, animated at ~20 Hz. No external flight-data API is required.

## Features

### Map

- **4 base map styles** — Balad (default, token-free), Mapbox Streets, Dark, and Satellite — switchable live with camera preserved
- **deck.gl overlay** rendering 50 aircraft (heading-rotated icons), 15 airports, and 12 antennas (Radar, ADS-B, VOR/DME, …)
- **Layers panel** — toggle whole categories or individual items, search, and focus entities on the map
- **Item popups** with full details for any aircraft, airport, or antenna
- **Flight tracks** — draw a track for any aircraft and watch its path render from origin toward its live position
- **Viewport aircraft badge** — live count of visible aircraft in the current view
- **Coordinate display** — live cursor lat/lon with click-to-copy pick mode
- Flat 2D enforced view, fly-home, zoom, compass reset, IP-based locate, box-zoom, and fullscreen controls

### Drawing tools

| Tool | Description |
|------|-------------|
| Marker | Place named markers with custom color, icon shape (star/circle/square), size, and opacity |
| Line | Multi-point polylines with name, color, width, and opacity |
| Free draw | Freehand strokes with adjustable color and width |
| Rectangle | Drag-to-draw, then move/resize |
| Polygon | Click vertices, finish with Enter or double-click |
| Circle | Drag from center with km radius |
| Intersection | Draw multiple lines — intersections between them are auto-detected and marked |

### Extra tools

| Tool | Description |
|------|-------------|
| Go To | Fly to coordinates — Lat/Lon or UTM (zone + hemisphere) |
| Ruler | Multi-segment distance measurement with per-segment and total km labels |
| Image overlay | Drop JPG/PNG images on the map with scale, rotation, and opacity controls |
| Capture area | Drag-select a region of the map and download it as a PNG |

### Fleet pages

- **Fleet overview** (`/airplane`) — searchable, filterable, sortable grid of all aircraft
- **Aircraft detail** (`/airplane/:id`) — telemetry, position, waypoints, and a *View on Map* shortcut

### Settings

- Base map style selector
- Airplane icon size (16–64 px)
- Altitude label visibility toggle

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build | [Vite 5](https://vitejs.dev/) |
| Map engine | [Mapbox GL JS 3](https://docs.mapbox.com/mapbox-gl-js/) via [react-map-gl 8](https://visgl.github.io/react-map-gl/) |
| Data visualization | [deck.gl 9](https://deck.gl/) (IconLayer, PathLayer, ScatterplotLayer, TextLayer) |
| UI | [Material UI 7](https://mui.com/) + Emotion |
| State | [Redux Toolkit](https://redux-toolkit.js.org/) + React Context |
| Routing | [React Router 7](https://reactrouter.com/) |
| Notifications | [Sonner](https://sonner.emilkowal.ski/) |

## Getting started

### Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** (ships with Node)
- A free **Mapbox access token** *(optional — only needed for the Streets / Dark / Satellite styles; the default Balad style works without one)*

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd ase

# 2. Install dependencies
npm install

# 3. Configure environment (optional)
copy .env.example .env
# then put your token in .env:
# VITE_MAPBOX_TOKEN=pk.your_token_here

# 4. Start the dev server
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint over the project |

## Configuration

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_MAPBOX_TOKEN` | No | Mapbox access token. Get one at [account.mapbox.com](https://account.mapbox.com/access-tokens/). Without it, only the **Balad** style (served from raah.ir) is available. |

### Data files

All map entities are local JSON — easy to swap or extend:

| File | Contents |
|------|----------|
| `src/pages/Home/components/AircraftLayer/data/iran_aircraft_50.json` | 50 aircraft with callsign, airline, type, speed, altitude, and waypoint paths |
| `src/pages/Home/components/AirportLayer/data/iran_airports.json` | 15 airports (IATA/ICAO, city, elevation, runways) |
| `src/pages/Home/components/AntennaLayer/data/iran_antennas.json` | 12 antennas (type, frequency, range, operator, status) |

## Project structure

```
ase/
├── public/                  # Static assets (favicon, sprites, icons)
├── src/
│   ├── App.tsx              # Theme, routes, providers, sidebar config
│   ├── main.tsx             # Entry point + boot loader handoff
│   ├── components/
│   │   ├── layout/          # AppShell (persistent map across routes)
│   │   ├── map/             # Map core
│   │   │   ├── AsemanhaMap.tsx
│   │   │   ├── components/
│   │   │   │   ├── MapDrawTool/      # Marker, line, polygon, circle, … tools
│   │   │   │   ├── ExtraMapTools/    # Ruler, go-to, capture, image overlay
│   │   │   │   ├── MapNavigator/     # Zoom, compass, locate, fly-home
│   │   │   │   ├── CoordinateDisplay/
│   │   │   │   └── ...
│   │   │   └── context/     # MapToolContext (exclusive tool management)
│   │   └── utils/           # Sidebar, expandable tool boxes
│   ├── pages/
│   │   ├── Home/            # Map page: aircraft/airport/antenna layers,
│   │   │                    # layers panel, tracks, popups, focus control
│   │   ├── Aircraft/        # Fleet list + aircraft detail pages
│   │   └── Settings/        # Settings panel (sidebar)
│   ├── store/               # Redux Toolkit (settings slice, map styles)
│   └── hooks/               # Shared hooks
├── .env.example
└── package.json
```

## Routes

| Route | Page |
|-------|------|
| `/` | Interactive map (supports `?select=<aircraftId>` to focus an aircraft) |
| `/airplane` | Fleet overview list |
| `/airplane/:id` | Aircraft detail page |

## Architecture notes

- **Persistent map** — the map is mounted once in `AppShell` and hidden (with simulation paused) on non-home routes, avoiding the heavy Mapbox/deck.gl teardown-and-rebuild cost when navigating.
- **Exclusive tools** — `MapToolContext` guarantees only one interactive tool (draw, ruler, capture, …) is active at a time.
- **Style switching** — `MapStyleSynchronizer` swaps Mapbox styles in place while preserving the camera, then re-attaches the deck.gl overlay.
- **Simulation loop** — `LiveAircraftContext` drives a `requestAnimationFrame` loop that advances every aircraft along its waypoint path at its real ground speed.

## License

This project is private and not currently licensed for public use.
