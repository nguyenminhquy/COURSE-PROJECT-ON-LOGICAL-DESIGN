#ifndef PUMP_CONTROL_H
#define PUMP_CONTROL_H

//#define PUMP_PIN 6
#define PUMP_PIN 7 
#define SOIL_THRESHOLD 40
extern bool pump_state;
void pump_task(void *pvParameters);

#endif