#ifndef LIGHT_MONITOR_H
#define LIGHT_MONITOR_H

#include <Arduino.h>


#define LIGHT_PIN 2

extern int light_raw;       
//extern int light_percent;   
void light_monitor_task(void *pvParameters); 

#endif