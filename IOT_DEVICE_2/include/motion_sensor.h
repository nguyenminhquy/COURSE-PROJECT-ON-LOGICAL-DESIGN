#ifndef MOTION_SENSOR_H
#define MOTION_SENSOR_H

#include <Arduino.h>


#define MOTION_PIN 10 

extern bool motion_detected;


void motion_sensor_task(void *pvParameters);

#endif
