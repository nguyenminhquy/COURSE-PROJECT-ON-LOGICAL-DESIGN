#include "task_wifi.h"

void startAP()
{
    WiFi.mode(WIFI_AP);
    WiFi.softAP(String(SSID_AP), String(PASS_AP));
    Serial.print("AP IP: ");
    Serial.println(WiFi.softAPIP());
}

void startSTA()
{
    if (WIFI_SSID.isEmpty())
    {
        vTaskDelete(NULL);
    }
    static uint8_t count = 0;

    Serial.printf("Connecting to %s...", &WIFI_SSID);

    WiFi.mode(WIFI_STA);

    if (WIFI_PASS.isEmpty())
    {
        WiFi.begin(WIFI_SSID.c_str());
    }
    else
    {
        WiFi.begin(WIFI_SSID.c_str(), WIFI_PASS.c_str());
    }
    
    while (WiFi.status() != WL_CONNECTED)
    {
        if(++count > 100){
            Serial.println("\nConnection failed, trying to reconnect in 3 seconds");
            delay(3000);
            Serial.printf("Connecting to %s...", &WIFI_SSID);
            count = 0;
        }
        vTaskDelay(100 / portTICK_PERIOD_MS);
        Serial.printf(".");
    }
    Serial.println("");
    Serial.println("Wifi:" + WIFI_SSID + " connected successfully");
    isWifiConnected = true;
    //Give a semaphore here
    xSemaphoreGive(xBinarySemaphoreInternet);
}

bool Wifi_reconnect()
{
    const wl_status_t status = WiFi.status();
    if (status == WL_CONNECTED)
    {
        return true;
    }
    startSTA();
    Serial.println("\nReconnected successfully");
    return true;
}
