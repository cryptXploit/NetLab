# NETLAB — Pocket Network Engineering Laboratory

![License](https://img.shields.io/badge/license-Proprietary-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![TypeScript](https://img.shields.io/badge/language-TypeScript-blue)
![React](https://img.shields.io/badge/framework-React-61DAFB)

## The Core Philosophy
**SEE &rarr; EXPERIMENT &rarr; BREAK &rarr; INVESTIGATE &rarr; FIX &rarr; EXPLAIN &rarr; PRACTICE &rarr; MASTER**

NETLAB is a premium, offline-first mobile laboratory designed to teach absolute, deterministic networking truth. It is not a textbook, a quiz app, or a simplified cloud simulator. It is a strict execution engine that relies on real networking invariants (ARP, ICMP, DHCP, DNS, IPV4, Routing, Switching) to calculate exact packet journeys.

## Key Features

- **Deterministic Simulation Engine:** Pure, state-driven execution loop. Devices possess real routing tables, MAC tables, ARP caches, and DHCP Leases. No mocked UI overlays; packets follow the exact physical links built in the workspace.
- **Interactive Sandbox & Topology Builder:** An elegant canvas to drop routers, switches, and hosts. Draw links, assign IP pools, and watch real-time flow paths.
- **Data-Driven Curriculum:** Step-by-step guided networking labs ranging from `Beginner` (Ping/ARP) to `Advanced` (Multi-router paths, DNS failures, DHCP exhaustion).
- **Network Doctor & Troubleshooting:** A built-in fault injection engine. Break the lab dynamically and use the Network Doctor and virtual Terminal tools to diagnose L2/L3 anomalies.
- **Adaptive Mastery & Dynamic Practice:** A deterministic practice generator creates randomized scenarios based on a Mulberry32 seed algorithm, adapting to your specific knowledge gaps (`SUBNETTING`, `MAC_LEARNING`, `DNS`).
- **Offline Data Vault:** Total privacy. Labs, history, and analytics are persisted securely via Dexie/IndexedDB and Zustand/localStorage, with robust Zod validation for JSON imports/exports.
- **Pro Architecture:** Built-in monetization boundaries providing Ad-Free experiences, advanced challenge unlocks, and deep-dive diagnostic hints.

## Technology Stack

### Frontend & UI
- **React (Vite)**
- **Tailwind CSS & Framer Motion** (Smooth hardware-accelerated animations)
- **Lucide React** (Consistent iconography)

### State & Data
- **Zustand** (Global reactive state management with persistence)
- **Dexie.js** (IndexedDB wrapper for offline lab/history persistence)
- **Zod** (Strict schema validation for JSON imports and Data Vault)

### Mobile & Native
- **Capacitor** (Bridging the web app to native iOS/Android device APIs)
- **Haptics** (Tactile feedback during critical UI interactions)

## Development

### Setup

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run the strict simulation test suite
npm run test

# Build for production
npm run build
```

### Engineering Guidelines
- **No Faking Logic:** If a protocol feature (like NAT or VLANs) is not modeled natively inside the `SimulationEngine.ts`, do not mock it in the UI. NETLAB relies on truth.
- **Type Strictness:** The domain models (`Lab.ts`, `Device.ts`, `Packet.ts`) must remain completely isolated from React/DOM constraints.

## License
Proprietary software. All rights reserved by `smartInnovations`.
