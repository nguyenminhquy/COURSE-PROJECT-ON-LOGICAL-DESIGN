#include "global.h"

QueueHandle_t TempHumidQueue = xQueueCreate(1, sizeof(TempHumid));

String WIFI_SSID = "Haohao";
String WIFI_PASS = "haohao24410";
String CORE_IOT_TOKEN;
String CORE_IOT_SERVER;
String CORE_IOT_PORT;

// String ssid = "ESP32-YOUR NETWORK HERE!!!";
// String password = "12345678";
// String wifi_ssid = "KietNguyen";
// String wifi_password = "88888888";
boolean isWifiConnected = false;

SemaphoreHandle_t xBinarySemaphoreInternet = xSemaphoreCreateBinary();