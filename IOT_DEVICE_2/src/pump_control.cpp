#include <Arduino.h>
#include "pump_control.h"
#include "soil_moisture.h" 

bool pump_state;
void pump_task(void *pvParameters) {

    pinMode(PUMP_PIN, OUTPUT);
    

    while (1) {

        int soilHumidity = percentage;

        if (soilHumidity < SOIL_THRESHOLD) {
            digitalWrite(PUMP_PIN, HIGH);  
            pump_state = 1;
            Serial.println("Pump: ON");
        } else {
            digitalWrite(PUMP_PIN, LOW);
            pump_state = 0;
            Serial.println("Pump: OFF");
        }
    
        vTaskDelay(5000 / portTICK_PERIOD_MS);
    }
}