import { Flashcard } from "../../../types.ts";

export const unit2Flashcards: Flashcard[] = [
    { unit: 2, front: "What is an Analog Signal?", back: "A continuous range of values varying smoothly over time (like a sine wave, from 0 to 1023)." },
    { unit: 2, front: "What is a Digital Signal?", back: "Discrete values, usually sequence of 0s and 1s, or LOW and HIGH voltages." },
    { unit: 2, front: "What does ADC stand for?", back: "Analog-to-Digital Converter, which maps smooth voltages into distinct whole numbers (0-1023 on Arduino)." },
    { unit: 2, front: "What is the Arduino Uno?", back: "A microcontroller board based on the ATmega328P, essentially a tiny computer designed to read sensors." },
    { unit: 2, front: "What do Digital Pins (0-13) do?", back: "Used for simple ON/OFF signals (`HIGH`/`LOW`), or Pulse Width Modulation (PWM) on select pins." },
    { unit: 2, front: "What is PWM (Pulse Width Modulation)?", back: "Rapidly turning a digital pin ON and OFF to simulate an analog output voltage." },
    { unit: 2, front: "What do Analog Pins (A0-A5) do?", back: "Used to read continuous internal voltages from analog sensors using the board's internal ADC." },
    { unit: 2, front: "Why avoid using Pin 0 and Pin 1 on an Arduino?", back: "They act as RX (Receive) and TX (Transmit) for Serial communication." },
    { unit: 2, front: "What is the maximum safe current to draw directly from an Arduino digital pin?", back: "Between 20mA - 40mA to prevent burning out the microcontroller." },
    { unit: 2, front: "How does an IR Sensor (Infrared) work?", back: "IR Emitter LED shines light. If an obstacle exists, light bounces back into the IR Receiver Photo-diode, outputting a LOW signal." },
    { unit: 2, front: "What is an LDR (Light Dependent Resistor)?", back: "A photoresistor whose electrical resistance decreases significantly as light intensity increases." },
    { unit: 2, front: "How is an LDR connected to Arduino?", back: "Typically used with a fixed resistor in a voltage divider circuit to output a variable analog voltage." },
    { unit: 2, front: "How does an Ultrasonic Sensor (HC-SR04) work?", back: "Trigger pin sends out high-frequency sound waves. Echo pin times how long the round-trip took to bounce off an object." },
    { unit: 2, front: "What is the formula to calculate distance with an Ultrasonic Sensor?", back: "Distance = (Speed of Sound * Time) / 2" },
    { unit: 2, front: "Why divide by 2 in the Ultrasonic distance formula?", back: "Because the sound traveled fully to the object AND all the way back." },
    { unit: 2, front: "What do DHT11 and DHT22 sensors measure?", back: "Digital sensors used to measure both Ambient Temperature and Relative Humidity." },
    { unit: 2, front: "DHT11 vs DHT22?", back: "DHT11: Cheap, basic, decent accuracy. DHT22: More expensive, highly accurate, handles negative temperatures." }
];
