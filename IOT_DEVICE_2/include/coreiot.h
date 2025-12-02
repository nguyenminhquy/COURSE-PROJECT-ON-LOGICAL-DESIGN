
#ifndef __COREIOT_H__
#define __COREIOT_H__

#include <Arduino.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <ThingsBoard.h>


void coreiot_task(void *pvParameters);
void setup_coreiot();
void sendTelemetry();

#endif
