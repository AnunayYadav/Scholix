import { Flashcard } from "../../../types.ts";

export const unit2Flashcards: Flashcard[] = [
    { unit: 2, front: "What is the main difference between an analog and a digital signal?", back: "Analog signals are continuous and can have infinite values. Digital signals are discrete and have only two states (HIGH/1 and LOW/0)." },
    { unit: 2, front: "What is the resolution of the built-in ADC in an Arduino UNO?", back: "The Arduino UNO has a 10-bit ADC, which provides a resolution of $2^{10} = 1024$ discrete logic levels ($0$ to $1023$)." },
    { unit: 2, front: "What is the formula to convert an analog voltage to a digital value on an Arduino UNO?", back: "The formula is $\\text{Digital Value} = \\frac{V_{in}}{V_{ref}} \\times 1023$, where $V_{ref}$ is typically $5\\,V$." },
    { unit: 2, front: "Which microcontroller is used in the Arduino UNO board?", back: "The Arduino UNO uses the ATmega328P microcontroller." },
    { unit: 2, front: "How many digital I/O pins and analog input pins does an Arduino UNO have?", back: "It has 14 digital I/O pins (0-13) and 6 analog input pins (A0-A5)." },
    { unit: 2, front: "What is PWM and which Arduino UNO pins support it?", back: "PWM stands for Pulse Width Modulation. Pins designated with a tilde (~) support it: 3, 5, 6, 9, 10, and 11." },
    { unit: 2, front: "What is the basic purpose of the `setup()` and `loop()` functions in Arduino?", back: "`setup()` runs once to initialize settings (like pin modes), while `loop()` runs continuously repeatedly containing the main logic." },
    { unit: 2, front: "What does the `analogRead()` function do in Arduino?", back: "It reads the voltage from an analog pin and returns a digital integer value between $0$ and $1023$." },
    { unit: 2, front: "What components make up an IR sensor?", back: "An IR sensor basically consists of an IR LED (transmitter) and a photodiode (receiver)." },
    { unit: 2, front: "What is the output of a standard IR obstacle sensor?", back: "It provides a digital output: LOW when an object is detected (reflected light) and HIGH when no object is detected." },
    { unit: 2, front: "What is an LDR and how does it work?", back: "A Light Dependent Resistor (LDR) is a component whose resistance decreases significantly as the light intensity falling on it increases." },
    { unit: 2, front: "What happens to the resistance of an LDR in complete darkness?", back: "In complete darkness, its resistance is very high, typically around $1\\,M\\Omega$." },
    { unit: 2, front: "What is the voltage divider formula used for an LDR circuit?", back: "The formula is $V_{out} = V_{in} \\times \\frac{R}{R + R_{LDR}}$, where $R$ is a fixed series resistor." },
    { unit: 2, front: "What is the fundamental working principle of an Ultrasonic Sensor?", back: "It sends an ultrasonic pulse and measures the time ($t$) it takes for the echo to return to calculate distance." },
    { unit: 2, front: "What is the formula to calculate distance using an Ultrasonic sensor?", back: "The formula is $d = \\frac{v \\times t}{2}$, where $v$ is the speed of sound and $t$ is the total time." },
    { unit: 2, front: "What is the approximate speed of sound in air used for ultrasonic calculations?", back: "The speed of sound is approximately $343\\,m/s$, which is $0.0343\\,cm/\\mu s$." },
    { unit: 2, front: "What are the four pins of an HC-SR04 ultrasonic sensor?", back: "The four pins are VCC ($5\\,V$), Trig (Trigger), Echo, and GND (Ground)." },
    { unit: 2, front: "What are DHT11 and DHT22 sensors used for?", back: "They are digital sensors used to measure both temperature and humidity." },
    { unit: 2, front: "What is a main advantage of the DHT22 over the DHT11?", back: "The DHT22 provides a wider measurement range and higher accuracy ($\\pm 0.5°C$) compared to the DHT11 ($\\pm 2°C$)." },
    { unit: 2, front: "What type of output do the DHT11/DHT22 sensors provide to the Arduino?", back: "They both provide a calibrated digital signal output on a single wire." }
];
