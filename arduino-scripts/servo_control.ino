/*
 * SCRIPT 2 : SERVO CONTROLLER
 * this script receives position data from the face tracking webpage
 * format "x,y" where x and y are between 0 and 180 degrees (servo motion limit)
 */

#include <Servo.h>

Servo servoX;

void setup() {
  Serial.begin(115200);
  servoX.attach(9);        // Servo connected to pin 9
  servoX.write(90);        // Start at center position
}

void loop() {
  if (Serial.available()) {
    String data = Serial.readStringUntil('\n');

    // Find the comma separating x and y
    int commaIndex = data.indexOf(',');

    if (commaIndex != -1) {
      // Extract x value and move servo
      int x = data.substring(0, commaIndex).toInt();
      servoX.write(constrain(x, 0, 180));
    }
  }
}

/* CHALLENGES (IF YOU DARE) :
 * 
 * EASY : make the built-in LED turn on when a face is detected
 * hint : the webpage sends data when it sees a face
 *
 * MEDIUM : add a second servo for up/down movement
 * hint 1 : you'll need to define another servo object and attach it to another digital pwm pin
 * Servo servoY; and servoY.attach(10);
 * hint 2 : to get the y value use this : int y = data.substring(commaIndex + 1).toInt();
 *
 * HARD : make the servo movement smoother
 * right now it jumps instantly. can it move gradually somehow?
 * hint : slowly increment position or look up 'servo easing'
 *
 * CHAOS :
 * can you make it act erratically when it doesn't detect a face?
 * can you make it move opposite to the motion of the face?
 * how can you detect when no data is coming in?
 *
 * CURSED :
 * add random twitches to make it creepy
 * hint : random() function + small position change
 */
