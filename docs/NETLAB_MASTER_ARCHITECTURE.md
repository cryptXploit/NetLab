# NETLAB Master Architecture

## 1. Product Vision
NetLab is envisioned as an **offline-first Network Engineering Lab**. It is a premium React/Capacitor application that enables users to learn, simulate, and visualize networks through a rich, interactive, and offline-capable environment. The primary goal is to provide a seamless, highly educational experience where users can watch packets move across a simulated network.

## 2. System Architecture
The architecture strictly enforces a **UI vs. Simulation Engine decoupling**.
- **Frontend / UI Layer**: Responsible for presentation, user interaction, and the topology rendering.
- **Core Engine Layer**: Responsible for the underlying network simulation and domain logic.

## 3. Simulation Architecture
The core simulation engine (located at `src/core/`) is designed to be **event-driven, deterministic, and written in pure TypeScript**.
- **CRITICAL REQUIREMENT**: The core network simulation (`src/core/`) must **NOT** depend on React, Capacitor, or any environment-specific APIs. It must be completely agnostic to the frontend framework, ensuring it is 100% testable in isolation and portable.

## 4. Persistence Architecture
The application employs a layered persistence strategy:
- **Preferences / Small Settings**: Stored using standard lightweight key-value stores (e.g., localStorage or Capacitor Preferences).
- **Structured Lab Data**: Managed via **Dexie / IndexedDB** for robust, queried, offline-first data storage.
- **Large Exports / Imports**: Utilizing the native filesystem for exporting or importing lab topologies and packet captures.

## 5. Tech Stack & Dependencies
- **Core Framework**: React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Cross-Platform Delivery**: Capacitor (for iOS, Android, and Desktop deployments)

## 6. UI/UX Requirements
NetLab requires a **premium, dark-mode-first, SVG-based topology renderer**. The interface should be modern, highly responsive, and capable of rendering complex networking topologies smoothly using optimized SVG elements.

## 7. Data / State Requirements
As part of the layered persistence model, the application will synchronize UI state (using Zustand) with local persistence layers (Dexie/IndexedDB) to maintain the offline-first capability effortlessly.

## 8. Error Handling & Security
NetLab strictly adheres to an **offline-first** philosophy. The application **must not crash or block access** if the internet, AdMob, or Play Billing services are unavailable. Graceful degradation and local-first fallbacks must be implemented for all external interactions.

## 9. Testing
Rigorous testing is required for the simulation engine. All core simulation domain logic (including routing, ARP, subnetting, and packet traversal) must have comprehensive **unit tests**. Because `src/core/` is isolated from the UI, these tests can be run seamlessly in a Node/CLI environment.

## 10. Development Phases
1. **Phase 0**: Research + Product Architecture (Current)
2. **Phase 1**: Project Initialization & CI/CD Setup
3. **Phase 2**: Core Simulation Engine (Domain Models, ARP, IP, Routing)
4. **Phase 3**: Core Engine Testing & Verification
5. **Phase 4**: UI Architecture & Basic Layout
6. **Phase 5**: SVG Topology Renderer Implementation
7. **Phase 6**: Engine & UI Integration (Event Bus, Zustand)
8. **Phase 7**: Local Persistence (Dexie integration)
9. **Phase 8**: Capacitor Cross-Platform Builds & Testing
10. **Phase 9**: Final Polish, Dark Mode, Performance Tuning

## 11. Git & Commit Strategy
We follow a **phase-based commit strategy**. Commits should logically group changes by the current phase and follow a standard format:
- `phase(XX): brief description`
- Example: `phase(00): establish product architecture`

This ensures clear milestones and traceable progression throughout the project's lifecycle.
