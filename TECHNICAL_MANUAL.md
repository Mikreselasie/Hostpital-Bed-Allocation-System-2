# RADIOACTIVE BED MANAGEMENT SYSTEM
# ENGINEERING & TECHNICAL REFERENCE MANUAL

**Version:** 2.4 "Nuclear Purge"  
**Date:** 2026-01-31  
**Author:** Principal Software Architect

---

## **TABLE OF CONTENTS**

1.  **[The Crisis of Bed Management & Engineering Vision](#chapter-1-crisis-vision)**
2.  **[Full-Stack Architecture & Environment](#chapter-2-architecture)**
3.  **[DSA Deep-Dive I: The Bed Registry (Hash Tables)](#chapter-3-dsa-registry)**
4.  **[DSA Deep-Dive II: The Admission Queue (Priority Queues)](#chapter-4-dsa-queue)**
5.  **[DSA Deep-Dive III: Smart Assignment (Greedy Algorithms)](#chapter-5-dsa-assignment)**
6.  **[Real-Time Synchronization (WebSockets & Socket.io)](#chapter-6-realtime)**
7.  **[Frontend Data Processing & Modern UI Design](#chapter-7-frontend-ui)**
8.  **[Security & Role-Based Access Control (RBAC)](#chapter-8-security)**
9.  **[Concurrency, Atomicity, and Race Conditions](#chapter-9-concurrency)**
10. **[Future Scalability & Clinical Standards (HL7/FHIR)](#chapter-10-roadmap)**

---

<a name="chapter-1-crisis-vision"></a>
## **CHAPTER 1: THE CRISIS OF BED MANAGEMENT & ENGINEERING VISION**

### **1.1 The Phenomenon of "Bed Blocking"**
In modern healthcare infrastructure, "Bed Blocking" (or delayed transfer of care) is a cascading failure mode where functional hospital capacity is artificially reduced by administrative latency. A bed might be physically empty for hours—specifically after a patient has been discharged but before the housekeeping team notifies admission control—creating a "Phantom Occupancy" state.

For a 500-bed facility, a 4-hour latency in status updates across 30 discharges per day results in **120 lost bed-hours daily**. This accumulation forces ambulance diversions, increases ED wait times, and linearly correlates with patient mortality rates.

### **1.2 Engineering Vision: Zero-Latency Synchronization**
The "Radioactive" system was architected to solve this specific temporal inefficiency. Unlike traditional EMRs (Electronic Medical Records) that treat bed status as a static database field updated via forms, this system treats bed allocation as a **Real-Time State Synchronization Problem**, similar to high-frequency trading platforms or multiplayer game servers.

**Core Philosophy:**
*   **Speed > Persistence:** The "Transfer of Care" event traverses the network in <100ms.
*   **Push > Pull:** Clients never poll for data; the server dictates the truth.
*   **DSA > CRUD:** Bed allocation is an algorithmic decision, not just a record insertion.

### **1.3 The "Single Source of Truth" Architecture**
To eliminate the "Two Generals Problem" where a nurse and a doctor see different bed statuses, the system enforces a strict **Single Source of Truth (SSOT)** in the backend memory. 

*   **State Authority:** The Node.js heap (`global.beds` Map) is the absolute authority.
*   **Database Role:** SQLite serves only as an asynchronous persistence layer (Write-Behind) for crash recovery. It is *never* read during the hot path of an assignment operation.

---

<a name="chapter-2-architecture"></a>
## **CHAPTER 2: FULL-STACK ARCHITECTURE & ENVIRONMENT**

### **2.1 Runtime Environment: Node.js v24.13.0 (Bleeding Edge)**
The application runs on **Node.js v24.13.0**, leveraging the V8 engine's latest optimizations for Map/Set lookups and Promise handling.
*   **ES Modules (ESM):** The project uses native ESM (`import`/`export`), allowing for tree-shaking and better static analysis.
*   **Non-Blocking I/O:** The Event Loop allows the server to handle concurrent WebSocket streams from hundreds of hospital terminals without the thread-blocking overhead of traditional Apache/PHP architectures.

### **2.2 Frontend Tooling: React v19 + Vite**
*   **Vite:** Utilizes native ES modules in development to provide Hot Module Replacement (HMR) with near-instant reflection of changes.
*   **React v19:** Uses the latest reconciler advancements. Components are designed to be "dumb" reflections of the backend state, minimizing client-side business logic and ensuring the UI is purely a function of the socket stream.
*   **Tailwind CSS v4:** A "CSS-first" utility engine. The "Nuclear" aesthetic is achieved through high-performance composable classes, avoiding runtime CSS-in-JS overhead.

### **2.3 Event-Driven Architecture**
The system is fundamentally event-driven. A user action (Mutation) does not simply write to a database; it triggers a cascade:
1.  **Action:** Doctor clicks "Discharge".
2.  **Event:** API Route calls `bedService.dischargePatient()`.
3.  **Mutation:** In-memory Hash Map is updated ($O(1)$).
4.  **Emission:** `io.emit('bedUpdate')` broadcasts the new state.
5.  **Persistence:** An async thread writes to SQLite.

---

<a name="chapter-3-dsa-registry"></a>
## **CHAPTER 3: DSA DEEP-DIVE I - THE BED REGISTRY (HASH TABLES)**

### **3.1 The Data Structure: `Map<string, Bed>`**
**File Focus:** `backend/services/bedService.js`

The core bed registry is not an Array; it is a Javascript **Map** (Hash Table).
```javascript
global.beds = new Map();
// Structure:
// "BED-101" => { id: "BED-101", status: "Occupied", patient: {...} }
```

### **3.2 The Mathematical Rationale: $O(1)$ vs $O(N)$**
In a traditional Hospital Information System (HIS), finding a bed might involve iterating through an array or searching a B-Tree index in a SQL DB.

*   **Array Iteration:** $O(N)$. For 5,000 beds, finding "BED-4999" requires 5,000 checks.
*   **Hash Table Lookup:** $O(1)$. Access is instantaneous regardless of facility size.

**Why this is mandatory:**
When a "Code Blue" or "Mass Casualty" event occurs, the system might receive bursts of 500+ concurrent status queries. An $O(1)$ lookup ensures that the server CPU time per request remains constant (negligible), preventing event loop lag that could delay critical updates.

### **3.3 Implementation Details**
Updates happen directly via the key:
```javascript
const bed = global.beds.get(bedId); // Instant access
bed.status = 'Occupied';            // Instant mutation
```
This pointer-based mutation immediately reflects across all references to that bed object in the application memory.

---

<a name="chapter-4-dsa-queue"></a>
## **CHAPTER 4: DSA DEEP-DIVE II - THE ADMISSION QUEUE (PRIORITY QUEUES)**

### **4.1 The Logic: Sorting the Waiting Room**
**File Focus:** `backend/services/patientService.js` (Concepts mapped from standard Priority Queue logic)

The waiting room is not a First-In-First-Out (FIFO) queue. It is a **Priority Queue** where position is determined by clinical urgency, not arrival time.

### **4.2 The Algorithm: Weighted Priority Score**
The system calculates an **Effective Priority Score** for every patient during the sort operation.

$$ P(x) = (T_x \times \alpha) - (W_x \times \beta) $$

Where:
*   $T_x$: Triage Level (1=Critical, 5=Minor). Lower is more urgent.
*   $W_x$: Wait Time in hours.
*   $\alpha, \beta$: Weighting coefficients.

Currently implemented as a dynamic sort function:
```javascript
queueState.sort((a, b) => {
    // Calculate Wait Time Decay
    // Compare Triage Level first, then Wait Time
    return scoreA - scoreB; 
});
```

### **4.3 Complexity Analysis: $O(N \log N)$**
Every time a patient is added or a triage level changes, the queue must be re-sorted. The V8 engine's `Array.prototype.sort` uses Timsort (a hybrid of Merge Sort and Insertion Sort), providing a worst-case complexity of $O(N \log N)$.
While less efficient than a specialized Binary Heap ($O(\log N)$ for insertion), the JS Array optimization is sufficient for current ER volumes (< 200 active queue items).

---

<a name="chapter-5-dsa-assignment"></a>
## **CHAPTER 5: DSA DEEP-DIVE III - SMART ASSIGNMENT (GREEDY ALGORITHMS)**

### **5.1 The Logic: Auto-Allocation**
**File Focus:** `backend/services/bedService.js` (Function: `assignBedGreedy`)

The "Smart Assignment" feature automates the search for an appropriate bed. It solves a resource allocation problem: "Find the best resource $r$ for task $t$."

### **5.2 The Greedy Search Strategy**
The system uses a **Greedy Algorithm** to find a **Local Optimum**. It does not attempt to solve the NP-Hard problem of "Perfect Hospital State" (knapsack problem). Instead, it makes the locally optimal choice for the *current* patient.

**Algorithm Steps:**
1.  **Filter ($O(N)$):** Scan all beds to find the subset $S$ where `status === 'Available'` AND `ward === patient.needs`.
2.  **Minimize Cost ($O(M)$):** Iterate through subset $S$ to find bed $b$ with minimum `distanceFromStation`.
    *   $b_{best} = \min_{b \in S} (b.distance)$
3.  **Assign:** Immediate lockout of $b_{best}$.

### **5.3 Why Greedy?**
In emergency medicine, speed is preferable to perfect global optimization. A greedy approach returns a valid bed immediately ($O(N)$). A global optimization (re-shuffling all existing patients to maximize capacity) would be computationally expensive ($O(N!)$) and clinically disruptive to moving patients.

---

<a name="chapter-6-realtime"></a>
## **CHAPTER 6: REAL-TIME SYNCHRONIZATION (WEBSOCKETS & SOCKET.IO)**

### **6.1 The Publisher-Subscriber Pattern**
Connection is handled via **Socket.io**.
*   **Server (Publisher):** Publishes topics `bedUpdate`, `queueUpdate`.
*   **Client (Subscriber):** React `useEffect` hooks subscribe to these topics.

### **6.2 The Data Lifecycle & Latency Budget**
The total "Round Trip Time" for a clinical update is strict:

1.  **Interaction:** Nurse clicks "Discharge" ($T=0ms$).
2.  **Transmission:** POST request to `/api/discharge` ($T+20ms$).
3.  **Processing:** Node.js updates Hash Map ($T+21ms$).
4.  **Emission:** Socket event broadcast to all connected clients ($T+25ms$).
5.  **Re-render:** 50 React clients receive payload and update Virtual DOM ($T+60ms$).

**Total Latency:** ~60-100ms. 
This puts the system update inside the "perceptual instant" window for human users.

### **6.3 Solving "Stale Data"**
In legacy systems (Polling), a client requests data every 30 seconds.
*   *Scenario:* Bed 101 becomes free at 12:00:01.
*   *Nurse A Polling:* Sees it free at 12:00:30.
*   *Nurse B Polling:* Sees it free at 12:00:15 and takes it.
*   *Result:* Nurse A tries to take an already-taken bed (Race Condition/Error).

With Sockets, Nurse A's screen updates to "Occupied" the millisecond Nurse B takes it, visually preventing the error before it can happen.

---

<a name="chapter-7-frontend-ui"></a>
## **CHAPTER 7: FRONTEND DATA PROCESSING & MODERN UI DESIGN**

### **7.1 The "Nuclear" Design Language**
The UI uses **Glassmorphism** (backdrop-blur, semi-transparent overlays) and stark, high-contrast typography to ensure readability in variable lighting conditions of a hospital ward.
**Tailwind v4** enables this with highly optimized compositing layers that use the GPU for rendering blurs, ensuring 60fps scrolling performance.

### **7.2 `useMemo` for High-Performance Filtering**
**File Focus:** `frontend/src/components/WardManagement.jsx`

Handling a grid of 500 beds requires careful reactiveness.
```javascript
const filteredBeds = useMemo(() => {
    return beds.filter(b => 
        (statusFilter === 'All' || b.status === statusFilter) &&
        (b.id.includes(searchQuery))
    );
}, [beds, statusFilter, searchQuery]);
```
`useMemo` ensures that the heavy $O(N)$ filtering logic only runs when dependencies change, not on every generic React render cycle. This prevents "UI Jitter" on low-end hospital terminals.

---

<a name="chapter-8-security"></a>
## **CHAPTER 8: SECURITY & ROLE-BASED ACCESS CONTROL (RBAC)**

### **8.1 JSON Web Tokens (JWT)**
Authentication is stateless. On login, the server signs a **JWT** containing the user's claims (`role`, `username`).
*   **Header:** `Authorization: Bearer <token>`
*   **Middleware:** `verify_auth.js` decodes the token on every protected route.

### **8.2 The Authorization Matrix**

| Feature | Doctor | Nurse | Admin |
| :--- | :---: | :---: | :---: |
| **View Dashboard** | ✅ | ✅ | ✅ |
| **Admit Patient** | ✅ | ✅ | ✅ |
| **Transfer Patient** | ✅ | ✅ | ✅ |
| **Smart Assignment** | ✅ | ✅ | ✅ |
| **Discharge (Clean)** | 🛑 | ✅ | 🛑 |
| **Nuclear Purge** | ✅ | 🛑 | ✅ |
| **System Audit** | ✅ | 🛑 | ✅ |

The backend strictly enforces these checks. For example, `bedService.dischargePatient` is wrapped in a route handler that checks `req.user.role`.

---

<a name="chapter-9-concurrency"></a>
## **CHAPTER 9: CONCURRENCY, ATOMICITY, AND RACE CONDITIONS**

### **9.1 The "Double-Click" Problem**
Scenario: Two doctors, Dr. X and Dr. Y, view the dashboard. Both see "BED-202" as Available. Both click "Assign" at the exact same millisecond.

### **9.2 Backend Validation Gates**
The Node.js single-threaded event loop processes these requests sequentially (serialization).
1.  **Request 1 (Dr. X):** Enters `assignBedManual`. Checks `bed.status`. It is 'Available'. Sets to 'Occupied'. Success.
2.  **Request 2 (Dr. Y):** Enters `assignBedManual`. Checks `bed.status`. It is NOW 'Occupied'. 
3.  **Resolution:** The function throws `Error('Bed is not available')`. Dr. Y receives a 400 Bad Request.

This Atomic "Check-Then-Act" sequence within the synchronous execution block guarantees data integrity without complex database locking mechanisms.

---

<a name="chapter-10-roadmap"></a>
## **CHAPTER 10: FUTURE SCALABILITY & CLINICAL STANDARDS**

### **10.1 FHIR Interoperability**
The next iteration will implement **HL7 FHIR (Fast Healthcare Interoperability Resources)**.
*   **Goal:** Replace the internal JSON patient object with the `Patient` resource standard.
*   **Impact:** Allows the bed management system to push discharge times directly to the hospital's main Billing & Insurance mainframe.

### **10.2 Multi-Tenant Scaling**
The current Hash Table architecture allows for "Sharding" by Facility ID.
 `Map<FacilityID, Map<BedID, BedData>>`
A single Node.js instance (using the `cluster` module) could manage the state for an entire hospital network (10+ facilities) by routing WebSocket connections to the appropriate memory shard based on user location.

---
**[END OF MANUAL]**
