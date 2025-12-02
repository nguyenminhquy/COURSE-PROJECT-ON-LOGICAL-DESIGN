#include "coreiot.h"
#include <WiFi.h>
#include "light_monitor.h"  
#include "soil_moisture.h"  
#include "pump_control.h"   
#include "motion_sensor.h"  
 
// ----------- CONFIGURE THESE! -----------
const char* coreIOT_Server = "app.coreiot.io";  
const char* coreIOT_Token = "ztx0lfbkjif28tzgt889";   // Uncomment this when use
const int   mqttPort = 1883;

WiFiClient espClient;
PubSubClient client(espClient);

// Biến để theo dõi thời gian gửi dữ liệu
unsigned long last_send_time = 0;

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    // Chỉ thử kết nối lại khi đã có WiFi
    if (WiFi.status() == WL_CONNECTED) {
        Serial.print("Attempting MQTT connection...");
        // Attempt to connect (username=token, password=empty)
        if (client.connect("ESP32_TEST", coreIOT_Token, "")) {
            Serial.println("connected to CoreIOT Server!");
        } else {
            Serial.print("failed, rc=");
            Serial.print(client.state());
            Serial.println(" try again in 5 seconds");
            // Dùng vTaskDelay thay vì delay()
            vTaskDelay(5000 / portTICK_PERIOD_MS);
        }
    } else {
        Serial.println("MQTT reconnect: Waiting for WiFi...");
        vTaskDelay(5000 / portTICK_PERIOD_MS);
    }
  }
}


void setup_coreiot(){

  client.setBufferSize(512);  
  client.setServer(coreIOT_Server, mqttPort);
  

  Serial.println("Connecting to CoreIOT server...");

  if(client.connect("ESP32_TEST", coreIOT_Token, "")){
    Serial.println("Connected to CoreIOT Server");
  }
  else {
    Serial.println("Failed to connect with state: ");
    Serial.println(client.state());
    reconnect();
  }
}

void coreiot_task(void *pvParameters){

    setup_coreiot();

    while(1){

        // Chờ cho đến khi có kết nối WiFi
        if (WiFi.status() != WL_CONNECTED) {
            Serial.println("CoreIOT Task: Waiting for WiFi connection...");
            vTaskDelay(5000 / portTICK_PERIOD_MS);
            continue; // Quay lại đầu vòng lặp
        }

        if (!client.connected()) {
            reconnect();
        }
        client.loop();

        // Gửi dữ liệu mỗi 10 giây
        if (millis() - last_send_time > 10000) {
            last_send_time = millis();

            // Tạo chuỗi JSON để gửi đi
            String payload = "{";
            payload += "\"light\":";
            payload += light_raw;
            payload += ",";
            payload += "\"soil_moisture\":";
            payload += percentage;
            payload += ",";
            payload += "\"pump_status\":";
            payload += pump_state ? "true" : "false"; // Gửi true/false thay vì 1/0
            payload += ",";
            payload += "\"motion\":";
            payload += motion_detected ? "true" : "false"; // Gửi true/false
            payload += "}";

            // Publish lên topic telemetry của CoreIOT
            client.publish("v1/devices/me/telemetry", payload.c_str());

            Serial.println("Published payload: " + payload);
        }
        vTaskDelay(20 / portTICK_PERIOD_MS); // Tạm dừng ngắn để các task khác chạy

    }
}