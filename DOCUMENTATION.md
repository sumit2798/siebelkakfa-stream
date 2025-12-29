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

