**PROJEKTÜBERBLICK**

**Tech-Stack (Frontend)**
- [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) als Build-Tool
- [Pinia](https://pinia.vuejs.org/) für State-Management
- [lucide-vue-next](https://www.npmjs.com/package/lucide-vue-next) für Icons
- Modularer Aufbau mit Feature-basiertem Ordnersystem (`/features/auftraege`, `/features/lager`, …)


Projektstruktur

handwerksprojekt/
│
├── apps/
│   └── handwerks-portal/        # Frontend (Vue 3 + TS)
│       ├── src/
│       │   ├── components/      # Wiederverwendbare UI-Komponenten
│       │   ├── features/        # Hauptmodule: Aufträge, Lager, Rechnungen, Kunden, Termine …
│       │   ├── services/        # API-Logik (z. B. /services/inventory.ts)
│       │   ├── stores/          # Pinia Stores (z. B. /stores/inventory.ts)
│       │   └── router/          # Vue Router
│       ├── mock/db.json         # Lokale Mock-Daten
│       └── .env.local.example   # Beispiel-Umgebungsvariablen fürs Frontend
│
├── backend/
│   └── app/                     # FastAPI-Anwendung (Work in Progress)
│
├── docker-compose.yml           # Lokale Container-Orchestrierung
├── .env.example                 # Beispiel .env für Backend / Root
└── README.md


# EINRICHTUNG

### Repository klonen
git clone https://github.com/M94-AI/BWStudio_Handwerksapp.git
cd BWStudio_Handwerksapp


.env.examples habe ich beigelegt
Für Local bitte im .env.local:

VITE_API_URL=http://localhost:3000
VITE_USE_MOCK=true

**FRONTEND STARTEN**
# Terminal 1: Mock-API starten

cd apps/handwerks-portal
npx json-server --watch src/mock/db.json --port 4000  

# Terminal 2: Frontend starten
cd apps/handwerks-portal 

npm install
npm run dev

Danach öffnet sich das Dashboard unter:
http://localhost:5173



Architektur
	•	Frontend-first Ansatz: Das Vue-Frontend nutzt VITE_USE_MOCK=true, um unabhängig vom Backend lauffähig zu sein.
	•	API-Service Layer: Jede Feature-Gruppe hat eigene API-Services (z. B. /services/inventory.ts), die später gegen die echten FastAPI-Endpunkte ausgetauscht werden.
	•	Pinia Stores: Einheitlicher Zugriff auf Daten + lokales Caching mit TTL.
	•	Responsive Layout: Sidebar-Collapse, Mobile Navigation, modulare Cards.



Autoren
Marvin Holthausen

Entwicklung, Design & Architektur

