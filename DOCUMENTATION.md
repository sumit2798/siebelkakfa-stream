# Streamly - Clickbait Kafka Demo: Codebase Documentation

This document explains the architecture and functionality of each file in the project.

## 1. Backend (Java / Spring Boot)

The backend is responsible for receiving HTTP requests from the frontend, publishing them to Kafka, consuming them back from Kafka, and pushing them to the Real-time Dashboard via WebSockets.

### **Controllers**
*   **`src/main/java/com/example/clickbait/controller/ClickController.java`**
    *   **Role**: REST API Endpoint.
    *   **Functionality**: Exposes `POST /api/click`. Receives the click data (JSON) from the frontend.
    *   **Key Logic**: Uses `ObjectMapper` to convert the payload to a JSON string and calls `EventProducer` to send it to Kafka.

### **Services**
*   **`src/main/java/com/example/clickbait/service/EventProducer.java`**
    *   **Role**: Kafka Producer.
    *   **Functionality**: Wraps `KafkaTemplate`.
    *   **Key Logic**: The `sendClickEvent(String message)` method publishes the JSON string to the `clickbait-events` Kafka topic.

*   **`src/main/java/com/example/clickbait/service/EventConsumer.java`**
    *   **Role**: Kafka Consumer & WebSocket Publisher.
    *   **Functionality**: Listens to the `clickbait-events` topic.
    *   **Key Logic**: When a message arrives from Kafka, the `@KafkaListener` method triggers and immediately forwards the message to the WebSocket channel `/topic/clicks` using `SimpMessagingTemplate`.

### **Configuration**
*   **`src/main/java/com/example/clickbait/config/KafkaConfig.java`**
    *   **Role**: Kafka Setup.
    *   **Functionality**:  Defines the Kafka `NewTopic` bean named `clickbait-events`. This ensures the topic is created automatically if it doesn't exist.

*   **`src/main/java/com/example/clickbait/config/WebSocketConfig.java`**
    *   **Role**: WebSocket Setup.
    *   **Functionality**:
        *   Enables the STOMP message broker.
        *   Registers the WebSocket endpoint `/ws-streamly` (used by the frontend to connect).
        *   Enables a simple memory-based broker on `/topic` for broadcasting messages.

### **Main Application**
*   **`src/main/java/com/example/clickbait/ClickbaitApplication.java`**
    *   **Role**: Entry Point.
    *   **Functionality**: Standard Spring Boot main class to bootstrap the application.

---

## 2. Frontend (HTML / JS / CSS)

The frontend consists of two parts: the "Clickbait" landing page (Producer) and the "Dashboard" (Consumer).

### **Landing Page (The "Clickbait" Site)**
*   **`src/main/resources/static/index.html`**
    *   **Role**: User Interface for generating events.
    *   **Functionality**: Displays the clickbait cards. Contains a simple `trackClick()` JavaScript function that sends a `POST` request to the backend whenever a card is clicked.
*   **`src/main/resources/static/css/style.css`**
    *   **Role**: Styling.
    *   **Functionality**: Provides the premium dark-mode aesthetic, gradients, and animations for both pages.

### **Real-time Dashboard**
*   **`src/main/resources/static/dashboard.html`**
    *   **Role**: Analytics UI.
    *   **Functionality**: The structure for the live feed and the bar chart. Loads `SockJS`, `Stomp.js`, and `Chart.js` libraries.
*   **`src/main/resources/static/js/dashboard.js`**
    *   **Role**: Dashboard Logic.
    *   **Functionality**:
        *   Connects to the WebSocket endpoint `/ws-streamly`.
        *   Subscribes to `/topic/clicks`.
        *   **`handleEvent()`**: Parses incoming JSON events, adds them to the "Live Feed" list, and updates the Chart.js dataset in real-time.

---

## 3. Infrastructure & Setup

*   **`pom.xml`**
    *   **Role**: Maven Project Configuration.
    *   **Functionality**: Manages dependencies:
        *   `spring-boot-starter-web` (REST API)
        *   `spring-kafka` (Kafka integration)
        *   `spring-boot-starter-websocket` (Real-time features)
        *   `lombok` (Boilerplate reduction)
*   **`src/main/resources/application.properties`**
    *   **Role**: Application Config.
    *   **Functionality**: Sets the server port (default 8080) and Kafka bootstrap server location (`localhost:9092`).
*   **`install_kafka.ps1`**
    *   **Role**: Setup Script.
    *   **Functionality**: Automation script to download and extract Kafka to your D: drive.

---

## 4. Middleware vs. Direct Integration

You asked: *"If Siebel has Kafka in a new version, why do I need Spring Boot?"*

### Scenario A: Siebel -> Spring Boot -> Kafka (Current Demo)
*   **Why?**: Siebel versions without native Kafka support need a "bridge".
*   **Flow**: Siebel (HTTP) -> Spring Boot (HTTP Endpoint) -> Kafka (Topic).
*   **Role of Spring Boot**: Ingestion Layer + Dashboard Backend.

### Scenario B: Siebel -> Kafka Directly (Newer Versions)
*   **Why?**: Newer Siebel versions (23.x+) might have native Kafka connectors.
*   **Flow**: Siebel (Native Native) -> Kafka (Topic).
*   **Role of Spring Boot**:
    1.  **Ingestion**: **NOT NEEDED**. Siebel talks perfectly to Kafka directly.
    2.  **Dashboard**: **STILL NEEDED**. Browsers (JavaScript) cannot safely consume Kafka directly (protocol issues + security).
    *   So, in this scenario, Spring Boot becomes just the **Dashboard Backend**, consuming events from Kafka to show them on the UI.

### Scenario C: Siebel as the Dashboard (Your Latest Question)
*   **Can Siebel be the Dashboard?**: **YES**.
*   **How?**: You use **Siebel OpenUI**.
    *   Create a "Special Applet" in Siebel.
    *   Write a **Physical Renderer (PR)** for this applet.
    *   Copy my `dashboard.js` logic (SockJS + Stomp) *into* that Siebel PR.
*   **Result**: The chart and live feed appear *inside* a Siebel view.
*   **Role of Spring Boot**: It acts as the **WebSocket Server**. Siebel connects to it to listen for updates.

In short: If your Siebel has Kafka, you can delete the `ClickController.java` and `EventProducer.java`, but you still need `EventConsumer.java` and `WebSocketConfig.java` to power the live dashboard.

---

## 5. Deployment FAQ: Can I run Spring Boot INSIDE Siebel?

You asked: *"Can we run Spring Boot IN Siebel?"*

The short answer is: **No, they are separate processes, but they can live on the same server.**

### 1. The Structure
*   **Siebel Server**: This is a robust C++ application backend. You cannot "run" a Java Spring Boot app inside the Siebel.exe process.
*   **Siebel AI (Application Interface)**: This is usually a Tomcat Web Server.

### 2. Can I merge them? (Advanced)
*   **Option A: Side-by-Side (Recommended)**
    *   You install Spring Boot on the **same physical server** as Siebel.
    *   Siebel runs on Port 443 (HTTPS).
    *   Spring Boot runs on Port 8080.
    *   They talk to each other via `localhost`. This is the cleanest, safest way.

*   **Option B: WAR Deployment (Possible but Risky)**
    *   Spring Boot can be built as a `.war` file (instead of `.jar`).
    *   You *could* technically copy this WAR file into Siebel's Tomcat `webapps` folder.
    *   **Result**: Siebel and your App share the same Tomcat.
    *   **Warning**: Siebel's Tomcat is heavily customized by Oracle. Deploying your own apps there might break Siebel or cause conflicts (e.g., conflicting logging libraries, memory limits). **We do not recommend this.**

### 3. Conclusion
Treat Spring Boot as a **"Sidecar"**. It runs next to Siebel, holding its hand, but not inside its skin.

---

## 6. Terminology: Siebel AI vs. Spring Boot Sidecar

You asked: *"Is the Siebel Application Interface (AI) Sidecar the same as a Spring Boot Sidecar?"*

**No, they are different technologies, but they play a similar "helper" role.**

| Feature | Siebel Application Interface (AI) | Spring Boot Sidecar (My App) |
| :--- | :--- | :--- |
| **Technology** | **Tomcat** (Java Web Server) | **Embedded Tomcat/Jetty** (Java App) |
| **Purpose** | Serves Siebel HTML/JS/CSS to the browser. | Connects Siebel to Kafka & WebSockets. |
| **Owner** | Owned & Managed by **Oracle**. | Owned & Managed by **YOU**. |
| **Relationship** | It is **Mandatory**. Siebel cannot work without it. | It is **Optional**. Only needed for Kafka/Modern UI. |

**Think of it this way:**
*   **Siebel AI**: The "Front Door" of the house. Everyone must enter through it.
*   **Spring Boot Sidecar**: The "Security Camera" installed next to the door. It watches what happens and sends data to the cloud (Kafka), but people don't walk *through* it to get inside.
