export const unit2Title = "Unit 2: Introduction to Arduino and Sensors";

export const unit2Body = `# Unit 2: Introduction to Arduino and Sensors

## Analog and Digital Signals

**Definition**

In electronics, signals carry information. They can be either analog (continuous) or digital (discrete). 

**Explanation**

Think of a ramp vs stairs. A ramp represents an analog signal because you can stand at any exact height (e.g., $1.23\\,m$, $1.24\\,m$). Stairs represent a digital signal because you can only be on specific steps (Step 1, Step 2, but nothing in between).

### Analog Signals

**Definition**

A continuous signal that smoothly varies over time and can have any value within a range. 

**Explanation**

Examples include the human voice, temperature, and audio waves. They are very sensitive to noise because any small change in voltage changes the information.

### Digital Signals

**Definition**

A discrete signal represented by only two specific voltage levels: HIGH (usually $5\\,V$ or $3.3\\,V$, representing binary 1) and LOW ($0\\,V$, representing binary 0).

**Explanation**

Examples include computer data and switch states. Because they only care if the voltage is "high" or "low", they easily ignore small noise.

### Analog to Digital Conversion (ADC)

**Definition**

The process of converting a continuous analog voltage into a digital number that a microcontroller (like Arduino) can understand.

**Explanation**

Arduino UNO has a 10-bit ADC. This means it can divide the $0$ to $5\\,V$ range into $2^{10} = 1024$ discrete steps (from 0 to 1023).

**Formula**

$$
\\text{Digital Value} = \\frac{V_{in}}{V_{ref}} \\times (2^n - 1)
$$

Where:
- $V_{in}$ = Analog voltage input
- $V_{ref}$ = Maximum reference voltage (usually $5\\,V$)
- $n$ = Number of bits (10 for Arduino UNO)

**Example**

An analog sensor outputs $2.5\\,V$. What will the Arduino's ADC read?

**Solution**

### Step Method

Step 1 → Identify variables: $V_{in} = 2.5\\,V$, $V_{ref} = 5\\,V$, $n = 10$.
Step 2 → Note that $2^{10} - 1 = 1023$.
Step 3 → Apply formula: $\\text{Digital Value} = \\frac{2.5}{5} \\times 1023$
Step 4 → Calculate: $0.5 \\times 1023 = 511.5 \\approx 512$.

**Exam Tip**

An ADC reading of 0 always means $0\\,V$. For a $5\\,V$ Arduino, a reading of 1023 always means $5\\,V$. A reading of 512 means $2.5\\,V$.

### Common Mistakes

- Forgetting that the max value of a 10-bit ADC is 1023, not 1024 (because we start counting at 0).

## Arduino Board

**Definition**

Arduino is an open-source electronics platform based on easy-to-use hardware and software. The most common board is the Arduino UNO, powered by the ATmega328P microcontroller.

**Explanation**

Think of the Arduino as the "brain". You can connect "senses" (sensors like temperature or light) to the input pins, and "muscles" (actuators like motors or LEDs) to the output pins. The code you write tells the brain how to react.

### Arduino UNO Pin Configuration

**Explanation**

The UNO has different types of pins for different tasks:
- **Digital I/O Pins (0-13):** 14 pins used for digital input or output (HIGH/LOW).
- **PWM Pins (3, 5, 6, 9, 10, 11):** Marked with a tilde (~). They can simulate analog output.
- **Analog Input Pins (A0-A5):** 6 pins used to read analog voltages ($0-5\\,V$) via the 10-bit ADC.
- **Power Pins:** $5\\,V$, $3.3\\,V$, GND (Ground), and VIN (Voltage In).

### Basic Arduino Programming Structure

**Definition**

Every Arduino program (called a Sketch) has two main and mandatory functions: \`setup()\` and \`loop()\`.

**Explanation**

- **\`setup()\`:** Think of this as the morning routine. It runs exactly once when you power on the board. You use it to set up pins as INPUT or OUTPUT.
- **\`loop()\`:** Think of this as breathing. It runs over and over forever. Your main logic (reading sensors, turning on LEDs) goes here.

### Key Arduino Functions

To code an Arduino, you need basic commands:
- **\`pinMode(pin, mode)\`**: Tells the board if a pin is an INPUT or OUTPUT.
- **\`digitalWrite(pin, value)\`**: Outputs HIGH ($5\\,V$) or LOW ($0\\,V$) to a pin.
- **\`digitalRead(pin)\`**: Checks if a pin is HIGH or LOW.
- **\`analogRead(pin)\`**: Reads an analog pin and returns 0 to 1023.

## IR Sensor

**Definition**

An Infrared (IR) sensor is an electronic module that detects obstacles by emitting and receiving infrared light.

**Explanation**

Think of a bat using echolocation, but with invisible light instead of sound. 

### Working Principle

The sensor has two main parts:
- **IR Transmitter (LED):** Shines an invisible infrared beam forward.
- **IR Receiver (Photodiode):** Detects if the beam bounces back off an object.

If the invisible beam hits something and bounces back, the receiver catches it and sends a LOW signal to the Arduino. If the beam doesn't bounce back (no obstacle), it sends a HIGH signal.

### Arduino Connection

- **VCC:** Connect to $5\\,V$.
- **GND:** Connect to GND.
- **OUT:** Connect to any digital pin (e.g., Pin 2) because it gives a digital HIGH/LOW output.

**Exam Tip**

IR sensors usually output LOW when an object is detected. This is called "active low" logic. Black surfaces absorb IR light, so the sensor might not detect a black object!

## LDR (Light Dependent Resistor)

**Definition**

An LDR (also known as a photoresistor) is a special resistor whose resistance decreases when light shines on it.

**Explanation**

Think of the LDR as a night owl. In the dark, it is very strong (high resistance, over $1\\,M\\Omega$). When bright light hits it, it gets weak (low resistance, drops to a few hundred ohms).

### Voltage Divider Circuit with LDR

**Definition**

Because Arduino cannot directly "read" resistance, we must convert the changing resistance of the LDR into a changing voltage using a Voltage Divider circuit.

**Formula**

$$
V_{out} = V_{in} \\times \\frac{R}{R + R_{LDR}}
$$

Where:
- $V_{in}$ = Usually $5\\,V$ from Arduino
- $R$ = Fixed resistor (usually $10\\,k\\Omega$)
- $R_{LDR}$ = Changing resistance of the LDR

**Example**

In bright light, an LDR has $R_{LDR} = 1\\,k\\Omega$. We use a fixed resistor $R = 10\\,k\\Omega$ and $V_{in} = 5\\,V$. Find $V_{out}$.

**Solution**

### Step Method

Step 1 → Identify variables: $V_{in} = 5\\,V$, $R = 10\\,k\\Omega$, $R_{LDR} = 1\\,k\\Omega$.
Step 2 → Apply formula: $V_{out} = 5 \\times \\frac{10}{10 + 1}$
Step 3 → Solve: $V_{out} = 5 \\times \\frac{10}{11} \\approx 4.54\\,V$

The Arduino's analog pin reads this $4.54\\,V$ to know it is bright outside!

### Common Mistakes

- Connecting the LDR directly to an analog pin without a fixed pull-down resistor. The Arduino will just read $5\\,V$ randomly.

## Ultrasonic Sensor

**Definition**

An ultrasonic sensor (like HC-SR04) measures distance by shooting high-frequency sound waves and timing how long the echo takes to return.

**Explanation**

This is exactly how a submarine uses sonar to find the ocean floor. 

### Working Principle

1. The sensor fires a short burst of sound at $40\\,kHz$ (too high for humans to hear).
2. A built-in timer starts.
3. The sound wave hits an object and bounces back.
4. When the sensor hears the echo, the timer stops.

### Distance Formula

**Formula**

$$
d = \\frac{v \\times t}{2}
$$

Where:
- $d$ = Distance (in cm)
- $v$ = Speed of sound in air (approx $0.0343\\,cm/\\mu s$)
- $t$ = Total time the echo took (in $\\mu s$)

We divide by 2 because the sound had to travel *to* the object and *back*.

**Example**

The sensor's echo takes $500\\,\\mu s$ to return. What is the distance to the object?

**Solution**

### Step Method

Step 1 → Identify variables: $v = 0.0343\\,cm/\\mu s$, $t = 500\\,\\mu s$.
Step 2 → Apply formula: $d = \\frac{0.0343 \\times 500}{2}$
Step 3 → Solve: $d = \\frac{17.15}{2} = 8.575\\,cm$.

### Pin Configuration

- **VCC:** $5\\,V$ power.
- **Trig:** The Arduino sends a $10\\,\\mu s$ pulse here to "pull the trigger" and fire the sound.
- **Echo:** This pin stays HIGH for the exact amount of time the sound took to return.
- **GND:** Ground.

## Temperature Sensor (DHT11/DHT22)

**Definition**

DHT series sensors are digital devices that measure both temperature and humidity at the same time. 

**Explanation**

Inside the plastic shell is a thermistor (for temperature) and a moisture-holding capacitor (for humidity). A tiny built-in chip reads them and sends a neat digital signal to the Arduino.

### DHT11 Specifications

- Blue color.
- Temperature: $0^\\circ C$ to $50^\\circ C$ (Accuracy $\\pm 2^\\circ C$)
- Humidity: $20\\%$ to $80\\%$
- Slower delivery (1 reading per second)
- Cheap and good for basic student projects.

### DHT22 Specifications

- White color.
- Temperature: $-40^\\circ C$ to $80^\\circ C$ (Accuracy $\\pm 0.5^\\circ C$)
- Humidity: $0\\%$ to $100\\%$
- Slightly slower delivery (1 reading every 2 seconds)
- More expensive, used in precise weather stations.

**Exam Tip**

If an exam asks for a high-accuracy, wide-range sensor, choose the DHT22. If asked for a cheap, indoor sensor, choose DHT11.

## Quick Revision

| Sensor/Concept | Key Idea |
|----------------|----------|
| Analog Signal | Continuous values (e.g., Voice) |
| Digital Signal | Discrete values (0 or 1) |
| ADC | Converts Analog to Digital |
| IR Sensor | Outputs LOW when obstacle detected |
| LDR | Resistance drops in bright light |
| Ultrasonic | Measures distance using sound echoes |
| DHT11/22 | Measures Temp and Humidity |

## Final Summary Table

| Formula/Rule | Equation/Value |
|--------------|----------------|
| ADC Value | $(V_{in} / V_{ref}) \\times 1023$ |
| LDR Voltage | $V_{out} = V_{in} \\times (R / (R+R_{ldr}))$ |
| Distance | $d = (v \\times t) / 2$ |
| Speed of Sound | $0.0343\\,cm/\\mu s$ |
| UNO ADC bits | 10 bits |

## Self Assessment

1 Calculate the digital ADC value on an Arduino UNO if an analog sensor outputs $1.2\\,V$.
2 Explain the difference between the \`setup()\` and \`loop()\` functions in Arduino.
3 Why do we need a voltage divider circuit when using an LDR?
4 An ultrasonic sensor's echo takes $1000\\,\\mu s$ to return. Calculate the distance in cm.
5 Detail the four pins of the HC-SR04 ultrasonic sensor and their functions.
`;
