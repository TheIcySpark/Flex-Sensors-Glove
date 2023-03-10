const int TUMB_FINGER_PIN = A0;
const int INDEX_PINGER_PIN = A1;
const int MIDDLE_FINGER_PIN = A2;
const int RIGHT_FINGER_PIN = A3;
const int LITTLE_FINGER_PIN = A4;
const int WRIST_PIN = A6;

void setup() {
  Serial.begin(9600);
  pinMode(TUMB_FINGER_PIN, INPUT);
  pinMode(INDEX_PINGER_PIN, INPUT);
  pinMode(MIDDLE_FINGER_PIN, INPUT);
  pinMode(RIGHT_FINGER_PIN, INPUT);
  pinMode(LITTLE_FINGER_PIN, INPUT);
  pinMode(WRIST_PIN, INPUT);
}

void loop() {
  Serial.println(String(analogRead(TUMB_FINGER_PIN)) + " " + 
    String(analogRead(INDEX_PINGER_PIN)) + " " + 
    String(analogRead(MIDDLE_FINGER_PIN)) + " " + 
    String(analogRead(RIGHT_FINGER_PIN)) + " " +
    String(analogRead(LITTLE_FINGER_PIN)) + " " +
    String(analogRead(WRIST_PIN)));
  delay(250);
}
