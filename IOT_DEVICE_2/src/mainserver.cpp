#include "mainserver.h"
#include <WiFi.h>
#include <WebServer.h>
#include "temp_humi_monitor.h"
#include "led_blinky.h"
#include "neo_blinky.h"
#include <Preferences.h>
#include <ArduinoJson.h>

Preferences prefs;

bool led1_state = false;
bool led2_state = false;
bool isAPMode = true;

bool loggedIn = false;
String valid_user = "";
String valid_pass = "";

WebServer server(80);

String ssid = "ESP32-AP";
String password = "12345678";
String wifi_ssid = "";
String wifi_password = "";

unsigned long connect_start_ms = 0;
bool connecting = false;
Adafruit_NeoPixel strip(LED_COUNT, NEO_PIN, NEO_GRB + NEO_KHZ800);

String mainPage() {
  float temperature = temp;
  float humidity = hum;
  String led1 = led1_state ? "ON" : "OFF";
  String led2 = led2_state ? "ON" : "OFF";
  pinMode(LED_GPIO, OUTPUT);
    strip.begin();
    // Set all pixels to off to start
    strip.clear();
    strip.show();
  digitalWrite(LED_GPIO, led1_state);
  if(led2_state){
    strip.setPixelColor(0, strip.Color(255, 50, 203)); // Set pixel color
    strip.show(); // Update the strip
  }
  else{
    strip.setPixelColor(0, strip.Color(0, 0, 0)); // Set pixel 0 to red
    strip.show(); // Update the strip
  }
 return R"rawliteral(
<!DOCTYPE html><html><head>
  
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>ESP32 Dashboard</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background-color: #1e1e1e;
      color: #ffffff;
      margin: 0;
      padding: 0;
      text-align: center;
    }
    .container {
      max-width: 400px;
      margin: 30px auto;
      background-color: #2c2c2c;
      border-radius: 12px;
      box-shadow: 0 0 15px rgba(0,0,0,0.5);
      padding: 25px;
    }
    h2 {
      margin-bottom: 20px;
      color: #00d1b2;
    }
    .data-block {
      margin: 15px 0;
      font-size: 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 20px;
      margin: 10px;
      font-size: 18px;
      border: none;
      border-radius: 6px;
      background-color: #444;
      color: white;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #00d1b2;
    }
    #settings, #logout {
      background-color: #00d1b2;
      color: black;
      float: right;
      margin-top: 10px;
    }
    .status {
      font-weight: bold;
      color: #ffd700;
    }
  </style>
</head>
<body>
  <div class='container'>
    <h2>ESP32 Dashboard</h2>
    <div class='data-block'>
      Temperature: <span id='temp'>)rawliteral" + String(temperature) + R"rawliteral(</span> °C
    </div>
    <div class='data-block'>
      Humidity: <span id='hum'>)rawliteral" + String(humidity) + R"rawliteral(</span> %
    </div>
    <div class='data-block'>
      <button class='button' onclick='toggleLED(1)'>LED1: <span id="l1" class="status">)rawliteral" + led1 + R"rawliteral(</span></button>
      <button class='button' onclick='toggleLED(2)'>LED2: <span id="l2" class="status">)rawliteral" + led2 + R"rawliteral(</span></button>
    </div>
    <div>
      <button class='button' id="settings" onclick="window.location='/settings'">&#9881; Settings</button>
      <button class='button' id="logout" onclick="window.location='/logout'">Logout</button>
    </div>
  </div>
  <script>
    function toggleLED(id) {
      fetch('/toggle?led='+id)
      .then(response=>response.json())
      .then(json=>{
        document.getElementById('l1').innerText=json.led1;
        document.getElementById('l2').innerText=json.led2;
      });
    }
    setInterval(()=>{
      fetch('/sensors')
       .then(res=>res.json())
       .then(d=>{
         document.getElementById('temp').innerText=d.temp;
         document.getElementById('hum').innerText=d.hum;
       });
    },3000);
  </script>
</body></html>
)rawliteral";
}

String settingsPage() {
  return R"rawliteral(
    <!DOCTYPE html><html><head>
      <meta name='viewport' content='width=device-width, initial-scale=1.0'>
      <title>Settings</title>
      <style>
        body { font-family: Arial; text-align:center; margin:0;}
        .container { margin:20px auto; max-width:350px;background:#f9f9f9;border-radius:10px;box-shadow:0 2px 10px #ccc;padding:20px;}
        input[type=text], input[type=password]{width:90%;padding:10px;}
        button { padding:10px 15px; margin:10px; font-size:18px;}
      </style>
    </head>
    <body>
      <div class='container'>
        <h2>Wi-Fi Settings</h2>
        <form id="wifiForm">
          <input name="ssid" id="ssid" placeholder="SSID" required><br>
          <input name="password" id="pass" type="password" placeholder="Password" required><br><br>
          <button type="submit">Connect</button>
          <button type="button" onclick="window.location='/'">Back</button>
        </form>
        <div id="msg"></div>
      </div>
      <script>
        document.getElementById('wifiForm').onsubmit = function(e){
          e.preventDefault();
          let ssid = document.getElementById('ssid').value;
          let pass = document.getElementById('pass').value;
          fetch('/connect?ssid='+encodeURIComponent(ssid)+'&pass='+encodeURIComponent(pass))
            .then(r=>r.text())
            .then(msg=>{
              document.getElementById('msg').innerText=msg;
            });
        };
      </script>
    </body></html>
  )rawliteral";
}

String loginPage() {
  return R"rawliteral(
    <!DOCTYPE html><html><head>
      <meta name='viewport' content='width=device-width, initial-scale=1.0'>
      <title>Login</title>
      <style>
        body {
          font-family: Arial;
          background: linear-gradient(135deg, #00c6ff 0%, #1ea0f7 50%, #4183d3 100%);
          color: white;
          text-align: center;
          margin: 0;
        }
        .login-box {
          background: rgba(255,255,255,0.1);
          border-radius: 15px;
          padding: 30px;
          margin: 100px auto;
          width: 300px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        input {
          width: 90%;
          padding: 10px;
          margin: 10px 0;
          border-radius: 8px;
          border: none;
          outline: none;
        }
        button {
          background: #fff;
          color: #0072ff;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
        }
        button:hover {
          background: #e0e0e0;
        }
        #msg {
          color: yellow;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="login-box">
        <h2>Login</h2>
        <input type="text" id="user" placeholder="Username"><br>
        <input type="password" id="pass" placeholder="Password"><br>
        <button onclick="login()">Login</button>
        <button class="btn-primary" onclick="location.href='/register'">Register</button>
        <div id="msg"></div>
      </div>
      <script>
        function login() {
          let u = document.getElementById('user').value;
          let p = document.getElementById('pass').value;
          fetch('/doLogin?user='+encodeURIComponent(u)+'&pass='+encodeURIComponent(p))
            .then(r=>r.text())
            .then(t=>{
              if (t === 'OK') {
                window.location = '/';
              } else {
                document.getElementById('msg').innerText = t;
              }
            });
        }
      </script>
    </body></html>
  )rawliteral";
}

String registerPage() {
  return R"rawliteral(
<!DOCTYPE html><html>
<head>
<meta name='viewport' content='width=device-width, initial-scale=1.0'>
<title>Register</title>
<style>
  body {
    font-family: Arial;
    background: linear-gradient(135deg, #00c6ff 0%, #1ea0f7 50%, #4183d3 100%);
    color: white;
    text-align: center;
    margin: 0;
    padding-top: 40px;
  }
  .box {
    background: rgba(255,255,255,0.1); 
    border-radius: 15px;
    padding: 30px;
    width: 300px;
    margin: auto;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }
  input {
    width: 90%;
    padding: 10px;
    margin: 10px 0;
    border-radius: 8px;
    border: none;
    outline: none;
  }
  button {
    background: #fff;
    color: #0072ff;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
  }
  button:hover {
    background: #e0e0e0;
  }
  #msg { color: yellow; margin-top: 10px; }
</style>
</head>
<body>

<div class="box">
  <h2>Register</h2>
  <input id="gmail" placeholder="Gmail"><br>
  <input id="user" placeholder="Username"><br>
  <input id="pass" type="password" placeholder="Password"><br>

  <button class="btn-primary" onclick="doRegister()">Register</button>
  <button class="btn-secondary" onclick="location.href='/login'">Login</button>

  <p id="msg"></p>
</div>

<script>
function doRegister() {
  let gmail = document.getElementById('gmail').value;
  let user = document.getElementById('user').value;
  let pass = document.getElementById('pass').value;

  fetch(`/doRegister?gmail=${encodeURIComponent(gmail)}&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`)
    .then(r => r.text())
    .then(t => {
      if (t === "OK") {
        alert("Register success!");
        window.location = "/login";
      } else {
        document.getElementById('msg').innerText = t;
      }
    })
}
</script>

</body></html>
)rawliteral";
}


// ========== Handlers ==========
void handleRoot() {
  // Kiểm tra đã có ít nhất 1 tài khoản hay chưa
  String accountsStr = prefs.getString("accounts", "[]");

  // Nếu mảng rỗng → chưa có tài khoản nào → chuyển tới register
  if (accountsStr == "[]" || accountsStr.length() < 3) {
    server.sendHeader("Location", "/register");
    server.send(302, "text/plain", "");
    return;
  }

  // Nếu chưa login → chuyển đến login
  if (!loggedIn) {
    server.sendHeader("Location", "/login");
    server.send(302, "text/plain", "");
    return;
  }

  // Nếu login rồi → vào dashboard
  server.send(200, "text/html", mainPage());
}


void handleToggle() {
  int led = server.arg("led").toInt();
  if (led == 1) led1_state = !led1_state;
  else if (led == 2) led2_state = !led2_state;
  server.send(200, "application/json",
    "{\"led1\":\"" + String(led1_state ? "ON":"OFF") +
    "\",\"led2\":\"" + String(led2_state ? "ON":"OFF") + "\"}");
  
  digitalWrite(LED_GPIO, led1_state);

  Adafruit_NeoPixel strip(LED_COUNT, NEO_PIN, NEO_GRB + NEO_KHZ800);
    strip.begin();
    // Set all pixels to off to start
    strip.clear();
    strip.show();
  digitalWrite(LED_GPIO, led1_state);
  if(led2_state){
    strip.setPixelColor(0, strip.Color(255, 50, 203)); // Set pixel color
    strip.show(); // Update the strip
  }
  else{
    strip.setPixelColor(0, strip.Color(0, 0, 0)); // Set pixel 0 to red
    strip.show(); // Update the strip
  }
}

void handleSensors() {
  float t = temp;
  float h = hum;
  String json = "{\"temp\":"+String(t)+",\"hum\":"+String(h)+"}";
  server.send(200, "application/json", json);
}

void handleSettings() { server.send(200, "text/html", settingsPage()); }

void handleLogin() {
  server.send(200, "text/html", loginPage());
}


void handleDoLogin() {
  String user = server.arg("user");
  String pass = server.arg("pass");

  String accountsStr = prefs.getString("accounts", "[]");
  DynamicJsonDocument doc(1024);
  deserializeJson(doc, accountsStr);
  JsonArray arr = doc.as<JsonArray>();

  for (JsonObject acc : arr) {
    if (acc["user"] == user && acc["pass"] == pass) {
      loggedIn = true;
      valid_user = user;
      server.send(200, "text/plain", "OK");
      return;
    }
  }

  loggedIn = false;
  server.send(200, "text/plain", "Sai tên đăng nhập hoặc mật khẩu!");
}
void handleRegister() {
  server.send(200, "text/html", registerPage());
}
void handleDoRegister() {
  String gmail = server.arg("gmail");
  String user = server.arg("user");
  String pass = server.arg("pass");

  if (gmail.length() < 5 || user.length() < 3 || pass.length() < 3) {
    server.send(200, "text/plain", "Thông tin không hợp lệ");
    return;
  }
 String accountsStr = prefs.getString("accounts", "[]"); 
  DynamicJsonDocument doc(2048);
  deserializeJson(doc, accountsStr);
  JsonArray arr = doc.as<JsonArray>();

  
  for (JsonObject acc : arr) {
    if (acc["user"] == user) {
      server.send(200, "text/plain", "Username đã tồn tại!");
      return;
    }
    if (acc["gmail"] == gmail) {
      server.send(200, "text/plain", "Gmail đã được đăng ký!");
      return;
    }
  }

  
  JsonObject newAcc = arr.createNestedObject();
  newAcc["gmail"] = gmail;
  newAcc["user"] = user;
  newAcc["pass"] = pass;

  // Lưu lại Preferences
  String output;
  serializeJson(arr, output);
  prefs.putString("accounts", output);

  server.send(200, "text/plain", "OK");
}
void handleLogout() {
  loggedIn = false;         
  server.sendHeader("Location", "/register"); 
  server.send(302, "text/plain", "");
}


void handleConnect() {
  wifi_ssid = server.arg("ssid");
  wifi_password = server.arg("pass");
  server.send(200, "text/plain", "Connecting....");
  isAPMode = false;
  connecting = true;
  connect_start_ms = millis();
  connectToWiFi();
}

// ========== WiFi ==========
void setupServer() {
  server.on("/", HTTP_GET, handleRoot);
  server.on("/toggle", HTTP_GET, handleToggle);
  server.on("/sensors", HTTP_GET, handleSensors);
  server.on("/settings", HTTP_GET, handleSettings);
  server.on("/connect", HTTP_GET, handleConnect);
  server.on("/login", HTTP_GET, handleLogin);
  server.on("/doLogin", HTTP_GET, handleDoLogin);
  server.on("/register", HTTP_GET, handleRegister);
  server.on("/doRegister", HTTP_GET, handleDoRegister);
  server.on("/logout", HTTP_GET, handleLogout);
  server.begin();
}

void startAP() {
  WiFi.mode(WIFI_AP);
  WiFi.softAP(ssid.c_str(), password.c_str());
  Serial.print("AP IP address: ");
  Serial.println(WiFi.softAPIP());
  isAPMode = true;
  connecting = false;
}

void connectToWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(wifi_ssid.c_str(), wifi_password.c_str());
  Serial.print("Connecting to ");
  Serial.print(wifi_ssid.c_str());
  Serial.print(wifi_password.c_str());
  
  Serial.println(wifi_ssid);
}

// ========== Main task ==========
void main_server_task(void *pvParameters){
  loggedIn = false; 
  pinMode(BOOT_PIN, INPUT_PULLUP);

  prefs.begin("auth", false);





  startAP();
  setupServer();

  while(1){
    server.handleClient();

    // Nếu nhấn BOOT thì về AP mode
    if (digitalRead(BOOT_PIN) == LOW) {
      vTaskDelay(100);
      if (digitalRead(BOOT_PIN) == LOW) {
        if (!isAPMode) {
          startAP();
          setupServer();
        }
      }
    }

    // Nếu đang connect STA
    if (connecting) {
      if (WiFi.status() == WL_CONNECTED) {
        Serial.print("STA IP address: ");
        Serial.println(WiFi.localIP());
        isAPMode = false;
        connecting = false;
      } else if (millis() - connect_start_ms > 10000) { // timeout 10s
        Serial.println("WiFi connect failed! Back to AP.");
        startAP();
        setupServer();
        connecting = false;
      }
    }

    vTaskDelay(20); // avoid watchdog reset
  }
}