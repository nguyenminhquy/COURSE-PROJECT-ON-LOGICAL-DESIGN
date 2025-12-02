#ifndef RAIN_MONITOR_H
#define RAIN_MONITOR_H

#define RAIN_PIN 3  

extern float rainValue;
extern float rainPercent;

void rain_monitor_task(void *pvParameters);

#endif