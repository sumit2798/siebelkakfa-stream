# Clickbait Kafka Stream Walkthrough

The **Clickbait Kafka Demo** is ready! This application showcases how user interactions (clicks) on a web frontend are streamed in real-time to a Kafka topic.

## 1. Prerequisites
Ensure you have your local Kafka environment running.

**Step 1: Start Zookeeper**
Open a terminal (PowerShell or CMD) in your Kafka installation directory **`d:\kafka_2.13-3.6.1`** and run:
```powershell
.\bin\windows\zookeeper-server-start.bat .\config\zookeeper.properties
```

**Step 2: Start Kafka Broker**
Open a *new* terminal window in the same directory (`d:\kafka_2.13-3.6.1`) and run:
```powershell
.\bin\windows\kafka-server-start.bat .\config\server.properties
```

*   **Zookeeper Port**: `localhost:2181`
*   **Kafka Broker Port**: `localhost:9092`

## 2. Running the Application
Open a terminal in `d:\Kafka-ClickBait` and run:

```bash
mvn spring-boot:run
```
*Alternatively, you can run the built JAR:*
```bash
java -jar target/clickbait-kafka-demo-0.0.1-SNAPSHOT.jar
```

## 3. Using the Demo
1.  Open your browser and navigate to **[http://localhost:8080](http://localhost:8080)**.
2.  You will see the "Streamly" dashboard with Trending Clickbait cards.
3.  **Click on any card.**
4.  A toast notification "Event Sent to Kafka!" will appear at the bottom.

## 4. Verifying Kafka Messages
To confirm messages are reaching Kafka, you can check the logs of the running application or use a Kafka Console Consumer:

```bash
# Verify using console consumer (adjust path to your kafka bin)
kafka-console-consumer.bat --bootstrap-server localhost:9092 --topic clickbait-events --from-beginning
```

You should see JSON-like messages arriving as you click items on the webpage.

## 5. Real-time Dashboard
A live dashboard is available to visualize the stream.

1.  Open **[http://localhost:8080/dashboard.html](http://localhost:8080/dashboard.html)**.
2.  Open **[http://localhost:8080](http://localhost:8080)** in a separate window.
3.  Click on cards in the main page.
4.  Watch the Dashboard update instantly with the new events and a chart.



## 6. Next Steps
- Implement Siebel OpenUI integration.
- Add real-time analytics dashboard consuming the stream.
