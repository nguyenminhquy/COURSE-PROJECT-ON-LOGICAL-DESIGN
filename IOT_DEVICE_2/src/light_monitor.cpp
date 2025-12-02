#include "light_monitor.h"

int light_raw = 0;
//int light_percent = 0;

void light_monitor_task(void *pvParameters) {
    pinMode(LIGHT_PIN, INPUT);

    while (1) {
        light_raw = analogRead(LIGHT_PIN);
       // light_percent = map(light_raw, 0, 4095, 0, 100);

        Serial.print("Light: ");
        Serial.print(light_raw);
        Serial.println("lx");

        vTaskDelay(5000 / portTICK_PERIOD_MS); 
    }
}
