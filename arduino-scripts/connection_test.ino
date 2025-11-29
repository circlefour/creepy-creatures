/*
 SCRIPT 1 : CONNECTION TEST
 use this to verify that the arduino can talk to your computer
 
 how to use :
 * upload this
 * open the serial monitor
 * send "on" or "off" from the serial monitor
 
 */
#include <Servo.h>

void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);

  /* CHALLENGE :
   * make the LED blink 3 times when the arduino starts to show your arduino is ready.
   * hint : digitalWrite(LED_BUILTIN, HIGH) turns it on
   * LOW = off
   * delay(500) waits 500 milliseconds
   */
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');

    // challenge : change the command and see what happens
    if (command == "on") {
      digitalWrite(LED_BUILTIN, HIGH);
      Serial.println("LED is ON");
    }
    else if (command == "off") {
      digitalWrite(LED_BUILTIN, LOW);
      Serial.println("LED is OFF");
    }
  }
}
