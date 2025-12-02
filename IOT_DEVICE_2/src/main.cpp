#include "global.h"

#include "led_blinky.h"
#include "neo_blinky.h"
#include "temp_humi_monitor.h"
#include "mainserver.h"
#include "tinyml.h"
#include "soil_moisture.h"
#include "light_monitor.h"
#include "rain_monitor.h"
#include "pump_control.h"
#include "traffic_light.h"
#include "motion_sensor.h"
#include "coreiot.h"

void setup() {
  Serial.begin(115200);

  //xTaskCreate( led_blinky, "Task LED Blink" ,2048  ,NULL  ,2 , NULL);
  //xTaskCreate( neo_blinky, "Task NEO Blink" ,2048  ,NULL  ,2 , NULL);
  //xTaskCreate( temp_humi_monitor, "Task TEMP HUMI Monitor" ,2048  ,NULL  ,2 , NULL);
  xTaskCreate( main_server_task, "Task Main Server" ,8192  ,NULL  ,2 , NULL);
  xTaskCreate(soil_moisture,"Soil Moisture", 4096, NULL, 1, NULL);
  xTaskCreate(light_monitor_task, "Light Monitor", 2048, NULL, 1, NULL);
  //xTaskCreate(rain_monitor_task, "Rain Task", 2048, NULL, 1, NULL);
  xTaskCreate(pump_task, "Pump Control", 2048, NULL, 1, NULL);
  xTaskCreate(traffic_light_task, "Traffic Light", 2048, NULL, 1, NULL);
  xTaskCreate(motion_sensor_task, "Motion Sensor", 2048, NULL, 1, NULL);
  xTaskCreate(coreiot_task, "CoreIOT Task", 4096, NULL, 2, NULL);
  //xTaskCreate( tiny_ml_task, "Tiny ML Task" ,2048  ,NULL  ,2 , NULL);
}

void loop() {
  
}