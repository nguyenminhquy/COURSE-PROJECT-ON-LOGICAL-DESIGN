#ifndef ___MAIN_SERVER__
#define ___MAIN_SERVER__
#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include "global.h"
#include "task_wifi.h"

#define BLUE_LED 6
#define GREEN_LED 7
#define BOOT_PIN 0

extern WebServer server;

extern bool isAPMode;




String mainPage();
String settingsPage();

void startAP();
void setupServer();

void main_server_task(void *pvParameters);

#endif