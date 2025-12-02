#include "motion_sensor.h"

bool motion_detected = false;

void motion_sensor_task(void *pvParameters) {
    pinMode(MOTION_PIN, INPUT);

    while (1) {
        int val = digitalRead(MOTION_PIN); 

        if (val == HIGH) {
            motion_detected = true;
            Serial.println("Motion: YES");
        } else {
            motion_detected = false;
            Serial.println("Motion: NO");
        }

        vTaskDelay(5000/ portTICK_PERIOD_MS); 
    }
}
