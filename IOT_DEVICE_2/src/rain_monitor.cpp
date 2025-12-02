#include "rain_monitor.h"
#include <Arduino.h>

float rainValue = 0;
float rainPercent = 0;

void rain_monitor_task(void *pvParameters) {

    pinMode(RAIN_PIN, INPUT);

    while (1) {

        rainValue = analogRead(RAIN_PIN);               
        rainPercent = map(rainValue, 0, 4095, 0, 100);  

        Serial.print("[RAIN]: ");
        Serial.print(rainPercent);
        Serial.println("%");

        vTaskDelay(5000 / portTICK_PERIOD_MS); 
    }
}
