#include "traffic_light.h"
#include <Arduino.h>
#include "light_monitor.h"






void traffic_light_task(void *pvParameters) {

    pinMode(TL_A, OUTPUT);
    pinMode(TL_B, OUTPUT);
   

    while (1) {
        
        if (light_raw < 300) {
            // RED = 11
            digitalWrite(TL_A, HIGH);
            digitalWrite(TL_B, HIGH);
            Serial.println("Ánh sáng yếu");
           
        } 
        else if (light_raw >= 300 && light_raw <= 1000) {
            // GREEN = 10
            digitalWrite(TL_A, HIGH);
            digitalWrite(TL_B, LOW);
            Serial.println("Ánh sáng bình thường");
            
        } 
        else {
            // YELLOW = 01
            digitalWrite(TL_A, LOW);
            digitalWrite(TL_B, HIGH);
            Serial.println("Ánh sáng mạnh");
            
        }

        
        vTaskDelay(5000 / portTICK_PERIOD_MS);
    }
}
