#include <Arduino.h>
#include "soil_moisture.h"

int raw, percentage;
void soil_moisture(void *pvParameters) {
    pinMode(SOIL_PIN, INPUT);

    while (1) {
        raw = analogRead(SOIL_PIN);

        percentage = map(raw, 0, 4095, 0, 100);

        Serial.printf("Soil Moisture: %d%%\n", percentage);

        vTaskDelay(5000 / portTICK_PERIOD_MS);
    }
}
