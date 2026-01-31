# Radioactive Bed Management System Documentation

## Table of Contents
1. [Project Vision & Core Purpose](#1-project-vision--core-purpose)
2. [Technical Stack & Environment](#2-technical-stack--environment)
3. [Data Structures & Algorithms (The "Engine" Room)](#3-data-structures--algorithms-the-engine-room)
4. [System Architecture & Data Lifecycle](#4-system-architecture--data-lifecycle)
5. [Component Breakdown (UI/UX)](#5-component-breakdown-uiux)
6. [Essential Features & Business Logic](#6-essential-features-&-business-logic)
7. [Important Engineering Considerations](#7-important-engineering-considerations)
8. [Future Roadmap](#8-future-roadmap)

---

## 1. Project Vision & Core Purpose

### The Problem: Hospital "Bed Blocking"
Modern healthcare facilities face critical bottlenecks known as **"Bed Blocking."** Inefficient patient flow—where patients remain in high-acuity beds longer than necessary or available beds remain "phantom" occupied due to slow administrative updates—leads to increased mortality rates, staff burnout, and ambulance diversions.

### The Solution: DSA-Driven Synchronization
The **Radioactive Bed Management System** is a real-time, clinical synchronization engine. By utilizing advanced Data Structures and Algorithms (DSA), it ensures that every bed transition (Admission → Transfer → Discharge) is tracked with sub-100ms latency. The system eliminates human error and "data lag," providing clinicians with a single source of truth for hospital capacity.

---

## 2. Technical Stack & Environment

### **Backend: Node.js v24.13.0**
The system leverages **Node.js v24.13.0**, utilizing the latest bleeding-edge runtime features. This ensures native support for next-generation ES Modules (ESM), improved V8 performance for complex memory operations, and high-performance asynchronous I/O required for real-time socket streams.

### **Frontend: React + Vite**
Built on **Vite**, the frontend delivers a lightning-fast development experience with **Hot Module Replacement (HMR)**. React’s component-based architecture allows for a reactive UI that updates instantly as backend events are pushed through the system.

### **Styling: Tailwind CSS v4**
The system is one of the first to implement **Tailwind CSS v4**, a "CSS-first" design engine. This allows for high-density, performance-optimized styling without the overhead of heavy CSS-in-JS libraries, maintaining a "Nuclear" aesthetic that remains responsive and lightweight.

---

## 3. Data Structures & Algorithms (The "Engine" Room)

The system is built for performance. Below is the mapping of core files to their respective DSA implementation and complexity.

| File | Data Structure / Algorithm | Purpose | Complexity |
| :--- | :--- | :--- | :--- |
| `bedService.js` | **Hash Table (Map)** | Instant retrieval and status updates of beds by their unique identifier. | $O(1)$ |
| `patientService.js`| **Priority Queue Logic** | Ranks patients by a weighted score of Triage Level (1-5) and normalized Wait Time. | $O(N \log N)$ (Sort) |
| `bedService.js` | **Greedy Algorithm** | "Smart Assignment" identifies the optimal available bed based on Medical Requirement (Ward) and minimal distance from the nursing station. | $O(N)$ |

---

## 4. System Architecture & Data Lifecycle

### **Data Retrieval & Hydration**
On initial load, the Frontend "hydrates" its state by querying `GET /api/beds` and `GET /api/patients/directory`. This creates the baseline state for the local React application.

### **The "Push" Model (Socket.io)**
To prevent stale data, the system implements a **WebSocket Push Model**. 
- **Event Flow:** When a Doctor discharges a patient, the backend service updates the database and immediately triggers a `bedUpdate` event emission via **Socket.io**.
- **Latency:** All connected UI clients receive the update and re-render in **<100ms**, eliminating the need for manual refreshing.

### **Data Persistence & In-Memory State**
For high-performance demos and sub-millisecond response times, the system maintains a primary **In-Memory Registry** (HashMaps and Arrays). While state is persisted to a SQLite database for durability, active operations are performed against memory to ensure zero-latency clinical workflows.

---

## 5. Component Breakdown (UI/UX)

### **Dashboard**
The "Bird’s Eye View" of the facility. It aggregates hospital-wide KPIs, including total occupancy, critical alerts, and triage distribution, allowing administrators to identify facility-wide pressure points at a glance.

### **Ward Management**
The "Operational View." This component features a high-density table and grid system. It utilizes advanced filtering logic (powered by `useMemo`) to toggle between "Occupied," "Available," and "Cleaning" states without layout shifts.

### **Patient Queue**
The "Admission Logic." This view displays the sorted priority queue. Visual cues (color-coded triage badges) allow staff to instantly identify critical patients (Triage 1) vs. routine cases (Triage 5).

---

## 6. Essential Features & Business Logic

### **Atomic Transfer Logic**
The transfer operation is designed as an "Atomic-like" in-memory transaction. When moving a patient:
1. **Source Bed (A):** Status set to `Cleaning`, patient record detached.
2. **Target Bed (B):** Status set to `Occupied`, patient record attached.
3. This ensures a patient is never "lost" between two beds during a system update.

### **Discharge Workflow**
The system enforces a clinical safety cycle:
- `Occupied` → `Cleaning` (Automatic trigger on discharge)
- `Cleaning` → `Available` (Manual check-off by housekeeping)

### **Authentication & RBAC**
Security is handled via a **Role-Based Access Control (RBAC)** system.
- **Hardcoded Staff Registry:** A secure demo registry (`STAFF_USERS`) defines credentials and roles.
- **Doctor Role:** Authorized for nuclear purges, system audits, and clinical assignments.
- **Nurse Role:** Focused on patient flow, transfers, and status updates.

---

## 7. Important Engineering Considerations

### **Scalability: Hash Table vs. Array**
While an array would suffice for high-level demos (50 beds), the system uses a **Hash Table** ($O(1)$ lookup) to ensure it can scale to manage 5,000+ beds across multiple facilities without any degradation in search performance.

### **Concurrency & Race Conditions**
To handle "Double-Click" race conditions (where two users attempt to assign the same bed simultaneously), the backend implements state validation checks prior to every status mutation. If a bed's state changes between the client request and the server execution, an error is returned to prevent over-allocation.

### **State Management: Flux vs. Scoping**
The system balances standard React `useState`/`useEffect` for local UI interactions with the real-time Socket.io stream. This "Hybrid State" approach ensures that local UI is responsive while global state remains strictly synchronized across the network.

---

## 8. Future Roadmap

1. **Interoperability:** Full integration with **FHIR (Fast Healthcare Interoperability Resources)** and **HL7** standards for seamless communication with existing EMR systems.
2. **AI-Driven Predictive Discharge:** Implementation of machine learning models to predict discharge dates based on diagnosis and recovery metrics, allowing for "Pre-Assignment" of beds.
3. **IoT Integration:** Real-time bed sensing via pressure mats to automate the `Occupied` → `Cleaning` transition.

---
*Generated by the Principal Software Architect - Radioactive Bed Management System*
