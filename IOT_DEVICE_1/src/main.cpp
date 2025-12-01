#include "global.h"

#include "led_blinky.h"
#include "neo_blinky.h"
#include "temp_humi_monitor.h"
#include "mainserver.h"
#include "tinyml.h"
#include "coreiot.h"
#include "printTerminal.h"
#include "waterSensor.h"
#include "fanControl.h"

// include task

#define LED_PIN 48
#define SENSOR_PIN 4

void setup()
{
  delay(3000);
  Serial.begin(115200);
  lcd.begin();
  Serial.println("Booted successfully");
  //startSTA();
  // pinMode(LED_GPIO, OUTPUT);
  //check_info_File(0);

  //--IOAS Sensor--//
  pinMode(SENSOR_PIN, INPUT_PULLUP);
  pinMode(BLUE_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);



  xTaskCreatePinnedToCore(led_blinky, "Task LED Blink", 2048, NULL, 1, NULL, 1);
  xTaskCreatePinnedToCore(neo_blinky, "Task NEO Blink", 4096, NULL, 6, NULL, 0);
  // xTaskCreatePinnedToCore(neo_blinky, "Task NEO Blink", 2048, NULL, 6, NULL, 1);
  xTaskCreatePinnedToCore(temp_humi_monitor, "Task TEMP HUMI Monitor", 8192, NULL, 4, NULL, 1);
  xTaskCreatePinnedToCore(reportTempAndHumidity, "Report T and H", 8192, NULL, 3, &tempHumidTaskHandle, 1);
  xTaskCreatePinnedToCore(waterSensing, "Water sensing", 2048, NULL, 4, NULL, 1);
  xTaskCreatePinnedToCore(reportWaterAmount, "Report Water Amount", 8192, NULL, 3, &waterTaskHandle, 1);
  xTaskCreatePinnedToCore(switchLCD, "Switching messages", 8192, NULL, 2, NULL, 1);
  // xTaskCreatePinnedToCore(printTH, "Print Temp and Humidity", 2048, NULL, 1, NULL, 1);
  // xTaskCreatePinnedToCore(printCondition, "Print Condition", 2048, NULL, 1, NULL, 1);
  // xTaskCreatePinnedToCore(main_server_task, "Task Main Server" ,8192  ,NULL  ,3 , NULL, 0);
  // xTaskCreatePinnedToCore(tiny_ml_task, "Tiny ML Task" ,2048  ,NULL  ,3 , NULL, 0);
  // xTaskCreatePinnedToCore(coreiot_task, "CoreIOT Task" ,8192  ,NULL  ,2 , NULL, 0);
  // xTaskCreatePinnedToCore(Task_Toogle_BOOT, "Task_Toogle_BOOT", 4096, NULL, 1, NULL, 0);
  // xTaskCreatePinnedToCore(fanDrive, "Controling fan", 2048, NULL, 2, NULL, 1);
}

void loop()
{
  // if (check_info_File(1))
  // {
  //   if (!Wifi_reconnect())
  //   {
  //     Webserver_stop();
  //   }
  //   else
  //   {
  //     CORE_IOT_reconnect();
  //   }
  // }
  // Webserver_reconnect();
  
}