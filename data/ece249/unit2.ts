export const unit2Title = "Unit 2: Introduction of Arduino and Sensors";

export const unit2Body = `# Introduction of Arduino and Sensors

## Table of Contents
- [Analog and Digital Signals](#analog-and-digital-signals)
- [Arduino Board](#arduino-board)
- [IR Sensor](#ir-sensor)
- [LDR (Light Dependent Resistor)](#ldr-light-dependent-resistor)
- [Ultrasonic Sensor](#ultrasonic-sensor)
- [Temperature Sensor (DHT11/DHT22)](#temperature-sensor-dht11dht22)
- [Practice Questions](#practice-questions)

---

## Analog and Digital Signals

### Analog Signals

* **Definition:** An analog signal is a continuous signal that varies smoothly over time and can take any value within a given range. It represents physical quantities like temperature, pressure, and sound.

- Varies continuously with time
- Can have infinite possible values between any two points
- More susceptible to noise
- Examples: Audio signals, temperature readings, sine waves

### Digital Signals

* **Definition:** A digital signal is a discrete signal that can only take specific values, typically represented as binary (0 and 1). It represents data in two distinct states: HIGH (1) and LOW (0).

- Exists in only two states: HIGH (typically $5\\,V$ or $3.3\\,V$) and LOW ($0\\,V$)
- More immune to noise compared to analog signals
- Easier to store, process, and transmit
- Examples: Computer data, digital clock, switch states

### Key Differences

| Parameter | Analog Signal | Digital Signal |
|-----------|--------------|----------------|
| Nature | Continuous | Discrete |
| Values | Infinite | Only 0 and 1 |
| Noise immunity | Low | High |
| Hardware | Complex | Simple |
| Example | Sine wave | Square wave |
| Bandwidth | Low | High |

### Analog to Digital Conversion (ADC)
- Arduino has a built-in **10-bit ADC**
- Converts analog voltage ($0-5\\,V$) to digital values ($0-1023$)
- Resolution = $\\frac{5}{1023} \\approx 4.88\\,mV$ per step

* **Formula:** Digital Value $= \\frac{V_{in}}{V_{ref}} \\times (2^n - 1)$

Where $n$ = number of bits (10 for Arduino UNO)

* **Example:** If an analog sensor outputs $2.5\\,V$, what is the digital reading on Arduino?

**Solution:**
Digital Value $= \\frac{2.5}{5} \\times 1023 = 511.5 \\approx 512$

---

## Arduino Board

* **Definition:** Arduino is an open-source electronics platform based on easy-to-use hardware and software. The most popular board is the **Arduino UNO** which uses the **ATmega328P** microcontroller.

### Arduino UNO Pin Configuration

**Microcontroller Specifications:**
- Microcontroller: ATmega328P
- Operating Voltage: $5\\,V$
- Input Voltage (recommended): $7-12\\,V$
- Input Voltage (limits): $6-20\\,V$
- Clock Speed: $16\\,MHz$
- Flash Memory: $32\\,KB$ (0.5 KB used by bootloader)
- SRAM: $2\\,KB$
- EEPROM: $1\\,KB$

### Pin Description

**Digital I/O Pins (0-13):**
- Total: 14 digital pins
- Can be configured as INPUT or OUTPUT
- Operate at $5\\,V$ logic
- Maximum current per pin: $20\\,mA$ (absolute max: $40\\,mA$)
- Pins 0 and 1 are also used for serial communication (TX and RX)
- Pins marked with **~** (3, 5, 6, 9, 10, 11) support **PWM** (Pulse Width Modulation) output

**Analog Input Pins (A0-A5):**
- Total: 6 analog input pins
- 10-bit ADC resolution (values from 0 to 1023)
- Can also be used as digital I/O pins
- Reference voltage: $5\\,V$ (default)

**Power Pins:**
- **VIN:** Supply voltage to the board (when using external power)
- **5V:** Regulated $5\\,V$ output from the onboard regulator
- **3.3V:** Regulated $3.3\\,V$ output (max $50\\,mA$)
- **GND:** Ground pins (multiple available)
- **RESET:** Active LOW reset pin

**Communication Pins:**
- **Serial (UART):** Pins 0 (RX) and 1 (TX)
- **SPI:** Pins 10 (SS), 11 (MOSI), 12 (MISO), 13 (SCK)
- **I2C:** A4 (SDA) and A5 (SCL)

**Special Pins:**
- Pin 13: Built-in LED
- AREF: Analog Reference voltage
- RESET: Reset the microcontroller

### Basic Arduino Programming Structure

**setup() function:** Runs once when the board powers up or resets. Used to initialize pins, serial communication, etc.

**loop() function:** Runs continuously after setup(). Contains the main logic of the program.

### Key Arduino Functions
- **pinMode(pin, mode):** Set pin as INPUT or OUTPUT
- **digitalWrite(pin, value):** Write HIGH or LOW to a digital pin
- **digitalRead(pin):** Read HIGH or LOW from a digital pin
- **analogRead(pin):** Read analog value (0-1023) from analog pin
- **analogWrite(pin, value):** Write PWM value (0-255) to a PWM pin
- **delay(ms):** Pause program for specified milliseconds
- **Serial.begin(baud):** Initialize serial communication
- **Serial.println(data):** Print data to serial monitor

---

## IR Sensor

* **Definition:** An Infrared (IR) sensor is an electronic device that detects infrared radiation in its surrounding environment. It consists of an IR LED (transmitter) and a photodiode (receiver).

### Working Principle
- The **IR LED** emits infrared light
- When an object is placed in front, the IR light reflects back
- The **photodiode** detects the reflected IR light
- The sensor outputs a **digital signal**: LOW (object detected) or HIGH (no object)

### Key Specifications
- Operating Voltage: $3.3\\,V$ to $5\\,V$
- Detection Range: $2\\,cm$ to $30\\,cm$ (adjustable via potentiometer)
- Output: Digital (HIGH/LOW)
- Active Buzzer: Some modules include onboard LED indicator

### Applications
- Obstacle detection in robots
- Line following robots (black line on white surface)
- Object counting systems
- Proximity sensing
- Automatic door systems

### Arduino Connection
- **VCC** → $5\\,V$
- **GND** → GND
- **OUT** → Digital Pin (e.g., Pin 2)

---

## LDR (Light Dependent Resistor)

* **Definition:** A Light Dependent Resistor (LDR) is a passive electronic component whose resistance decreases with increasing incident light intensity. It is also called a photoresistor or photocell.

### Working Principle
- Made of semiconductor material (Cadmium Sulphide, CdS)
- In **darkness**: Resistance is very high ($\\sim 1\\,M\\Omega$)
- In **bright light**: Resistance drops significantly ($\\sim 100\\,\\Omega$ to $1\\,k\\Omega$)
- This change in resistance is used to measure light intensity

### Characteristics
- **Dark Resistance:** $\\sim 1\\,M\\Omega$ or higher
- **Light Resistance:** $\\sim 100\\,\\Omega$ to few $k\\Omega$
- **Spectral Response:** Most sensitive to visible light
- **Response Time:** Relatively slow (tens of milliseconds)

### Voltage Divider Circuit with LDR

* **Formula:** $V_{out} = V_{in} \\times \\frac{R}{R + R_{LDR}}$

Where $R$ is a fixed resistor in series with the LDR.

* **Explanation:** As light increases, $R_{LDR}$ decreases, so $V_{out}$ increases. This changing voltage is read by Arduino's analog pin.

### Applications
- Automatic street lights
- Light intensity measurement
- Day/night detection
- Camera light meters
- Automatic brightness control

### Arduino Connection
- One leg of LDR → $5\\,V$
- Other leg → Analog Pin (e.g., A0) AND through a $10\\,k\\Omega$ resistor to GND

---

## Ultrasonic Sensor

* **Definition:** An ultrasonic sensor is a device that measures distance by sending ultrasonic sound waves ($40\\,kHz$) and measuring the time taken for the echo to return after bouncing off an object.

### Basic Principle

* **Statement:** The sensor sends a short ultrasonic pulse (trigger) and measures the time it takes for the echo to return. Distance is calculated using the speed of sound.

* **Formula:** $d = \\frac{v \\times t}{2}$

Where:
- $d$ = Distance to object
- $v$ = Speed of sound in air $\\approx 343\\,m/s$ (or $0.0343\\,cm/\\mu s$)
- $t$ = Total time for echo (divided by 2 because sound travels to object and back)

$$d = \\frac{0.0343 \\times t}{2}\\,\\text{cm}$$

### HC-SR04 Ultrasonic Sensor Specifications
- Operating Voltage: $5\\,V$ DC
- Operating Current: $15\\,mA$
- Measuring Range: $2\\,cm$ to $400\\,cm$
- Measuring Angle: $15°$
- Trigger Input Signal: $10\\,\\mu s$ TTL pulse
- Resolution: $0.3\\,cm$

### Pin Configuration
- **VCC:** $5\\,V$ power supply
- **Trig:** Trigger pin (INPUT — sends ultrasonic pulse)
- **Echo:** Echo pin (OUTPUT — receives reflected pulse)
- **GND:** Ground

### Working Steps
1. Arduino sends a $10\\,\\mu s$ HIGH pulse to the **Trig** pin
2. Sensor transmits 8 ultrasonic pulses at $40\\,kHz$
3. Sound waves hit the object and reflect back
4. **Echo** pin goes HIGH for the duration proportional to distance
5. Arduino measures this duration using **pulseIn()** function
6. Distance is calculated using the formula

* **Example:** The echo pin of an ultrasonic sensor stays HIGH for $580\\,\\mu s$. Calculate the distance of the object.

**Solution:**
$d = \\frac{0.0343 \\times 580}{2} = \\frac{19.894}{2} = 9.95\\,cm \\approx 10\\,cm$

### Applications
- Distance measurement
- Obstacle avoidance in robotics
- Water level monitoring
- Parking assistance systems
- Object detection

---

## Temperature Sensor (DHT11/DHT22)

* **Definition:** DHT11 and DHT22 are digital temperature and humidity sensors that provide calibrated digital output. They contain a resistive humidity sensing element and a thermistor (NTC) for temperature measurement.

### DHT11 Specifications
- Operating Voltage: $3.3\\,V$ to $5\\,V$
- Temperature Range: $0°C$ to $50°C$
- Temperature Accuracy: $\\pm 2°C$
- Humidity Range: $20\\%$ to $80\\%$ RH
- Humidity Accuracy: $\\pm 5\\%$ RH
- Sampling Rate: $1\\,Hz$ (one reading per second)
- Output: Digital signal (single-wire)

### DHT22 (AM2302) Specifications
- Operating Voltage: $3.3\\,V$ to $5\\,V$
- Temperature Range: $-40°C$ to $80°C$
- Temperature Accuracy: $\\pm 0.5°C$
- Humidity Range: $0\\%$ to $100\\%$ RH
- Humidity Accuracy: $\\pm 2\\%$ RH
- Sampling Rate: $0.5\\,Hz$ (one reading every 2 seconds)
- Output: Digital signal (single-wire)

### DHT11 vs DHT22 Comparison

| Parameter | DHT11 | DHT22 |
|-----------|-------|-------|
| Temperature Range | $0°C$ to $50°C$ | $-40°C$ to $80°C$ |
| Temp Accuracy | $\\pm 2°C$ | $\\pm 0.5°C$ |
| Humidity Range | $20-80\\%$ | $0-100\\%$ |
| Sampling Rate | $1\\,Hz$ | $0.5\\,Hz$ |
| Cost | Lower | Higher |
| Body Size | Smaller (blue) | Larger (white) |

### Working Principle
- Uses a **capacitive humidity sensor** and a **thermistor**
- The humidity sensor has two electrodes with a moisture-holding substrate between them
- As humidity changes, the substrate's conductivity changes, which changes the resistance
- The thermistor (NTC) changes resistance with temperature
- An internal chip converts the analog readings to a digital signal

### Pin Configuration
- **VCC:** $3.3\\,V$ to $5\\,V$
- **DATA:** Digital output pin (connect to any digital pin on Arduino)
- **NC:** Not Connected (DHT11 has 4 pins, pin 3 is NC)
- **GND:** Ground
- A **$10\\,k\\Omega$ pull-up resistor** is needed between VCC and DATA pin

### Applications
- Weather stations
- Home automation (HVAC control)
- Environmental monitoring
- Agriculture (greenhouse monitoring)
- Industrial temperature control

---

## Practice Questions

### Conceptual Questions
1. Differentiate between analog and digital signals with examples.
2. Explain the pin configuration of Arduino UNO board.
3. What is the resolution of Arduino ADC? How many discrete levels can it represent?
4. Explain the working principle of an IR sensor.
5. What is an LDR? Explain how its resistance varies with light intensity.
6. Explain the basic principle of an ultrasonic sensor for distance measurement.
7. Compare DHT11 and DHT22 temperature sensors.
8. What is PWM? Which Arduino pins support it?

### Numerical Problems
1. If an analog sensor gives $3.7\\,V$ output, what will be the ADC reading on Arduino UNO?
2. An ultrasonic sensor echo pin is HIGH for $1160\\,\\mu s$. Calculate the distance of the object.
3. In an LDR voltage divider circuit, $V_{in} = 5\\,V$, $R = 10\\,k\\Omega$, and $R_{LDR} = 5\\,k\\Omega$ in light. Find $V_{out}$.
4. If Arduino's ADC reads a value of 768, what is the corresponding voltage?
5. An ultrasonic sensor measures a distance of $25\\,cm$. What is the echo pulse duration?`;
