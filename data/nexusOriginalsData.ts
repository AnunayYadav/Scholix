
import { NexusOriginal } from "../types";

export const nexusOriginalsData: NexusOriginal[] = [
    {
        id: "ece249-originals",
        subject: "ECE249: BASIC ELECTRICAL AND ELECTRONICS ENGINEERING",
        semester: "2",
        program: "B.Tech",
        ltp: "L:3 T:0 P:0",
        credits: 3,
        content: {
            notes: [
                {
                    unit: 1,
                    title: "Unit I: Fundamentals & Semiconductor Devices",
                    image: "/nexus-originals/ece249_unit1.png",
                    body: `
# Unit I: Fundamentals of Electrical Laws and Semiconductor Devices

## 1. Fundamentals of Electrical Laws
### Ohm's Law
*   **Statement:** The current through a conductor between two points is directly proportional to the voltage across the two points, provided temperature and other physical conditions remain constant.
*   **Formula:** $V = I \times R$
*   **Key Components:** 
    *   $V$: Voltage (Volts)
    *   $I$: Current (Amperes)
    *   $R$: Resistance (Ohms)

### Kirchhoff's Laws
1.  **Kirchhoff's Current Law (KCL):** The total current entering a junction or node is exactly equal to the total current leaving that junction. (Conservation of Charge)
2.  **Kirchhoff's Voltage Law (KVL):** The directed sum of electrical potential differences (voltage) around any closed loop is zero. (Conservation of Energy)

### Voltage & Current Division Rules
*   **Voltage Division Rule (VDR):** In a series circuit, voltage across a resistor is directly proportional to its resistance. $V_x = V_{total} \times (R_x / R_{total})$
*   **Current Division Rule (CDR):** In a parallel circuit, current through a branch is inversely proportional to its resistance. $I_x = I_{total} \times (R_{total} / R_x)$

## 2. Semiconductor Devices
### Basics of Semiconductors
*   **Intrinsic:** Pure semiconductor (e.g., Silicon, Germanium). No impurities.
*   **Extrinsic:** Doped semiconductor. 
    *   **N-type:** Doped with Pentavalent impurities (e.g., Phosphorus). Majority carriers: Electrons.
    *   **P-type:** Doped with Trivalent impurities (e.g., Boron). Majority carriers: Holes.

### PN Junction Diode
*   **Working:** Formed by joining P-type and N-type materials. A depletion region is formed at the junction.
*   **Characteristics:**
    *   **Forward Bias:** Conducts current easily (low resistance).
    *   **Reverse Bias:** Blocks current flow (high resistance) until breakdown.
*   **Applications:**
    *   **Rectifier:** Converts AC to DC.
    *   **Switch:** Controls the flow of current.

### Bipolar Junction Transistor (BJT)
*   **Types:** NPN and PNP.
*   **Terminals:** Emitter (E), Base (B), and Collector (C).
*   **CE Configuration:** Common Emitter configuration is most common for amplification due to high voltage and current gain.

> **Key Takeaway:** Understanding the fundamental laws of electricity is crucial for analyzing any circuit, while semiconductor devices form the building blocks of modern electronics.

**Example:** Think of voltage as water pressure, current as the flow of water, and resistance as the width of the pipe. Ohm's law simply relates these three!
          `
                },
                {
                    unit: 2,
                    title: "Unit II: Introduction to Arduino and Sensors",
                    body: `
# Unit II: Introduction of Arduino and Sensors

## 1. Signal Basics
*   **Analog Signals:** Continuous signals that vary over time (e.g., temperature reading).
*   **Digital Signals:** Discrete signals, typically high (1) or low (0) (e.g., light switch).

## 2. Arduino Board
*   **Overview:** An open-source electronics platform based on easy-to-use hardware and software.
*   **Pin Configuration:**
    *   **Digital Pins:** Used for digital input/output (Pins 0-13).
    *   **Analog Input Pins:** Used for reading analog values (A0-A5).
    *   **Power Pins:** 5V, 3.3V, GND, Vin.
    *   **PWM Pins:** Pulse Width Modulation for varied output level (marked with ~).

## 3. Sensors
### IR Sensor (Infrared)
*   **Principle:** Emits IR light and detects its reflection to sense objects or color.
*   **Application:** Obstacle detection, line following robots.

### LDR (Light Dependent Resistor)
*   **Principle:** Resistance decreases as light intensity increases.
*   **Application:** Automatic street lights.

### Ultrasonic Sensor (HC-SR04)
*   **Principle:** Measures distance by sending sound waves and measuring the time taken for the echo to return.
*   **Application:** Proximity sensing, distance measurement.

### Temperature & Humidity Sensor (DHT11/DHT22)
*   **Working:** Provides digital output calibrated for temperature and humidity.
*   **Application:** Weather monitoring, HVAC systems.

> **Key Takeaway:** Arduino acts as the "brain," while sensors act as the "eyes and ears" of an electronic project.

**Example:** An automatic night light uses an LDR to sense darkness and then tells the Arduino to turn on an LED.
          `
                },
                {
                    unit: 3,
                    title: "Unit III: Number Systems and Logic Gates",
                    body: `
# Unit III: Number System and Logic Gates

## 1. Number Systems
*   **Binary (Base 2):** 0, 1.
*   **Octal (Base 8):** 0-7.
*   **Decimal (Base 10):** 0-9.
*   **Hexadecimal (Base 16):** 0-9, A-F.
*   **Conversion:** Process of changing a number from one base to another (e.g., Decimal to Binary using successive division).

## 2. Digital Codes
*   **B-G Conversion:** Binary to Gray code.
*   **G-B Conversion:** Gray code to Binary.
*   **Excess-3 & BCD:** Used for specific digital calculations and displays.

## 3. Binary Arithmetic
*   **Addition:** Standard binary rules ($1+1=10$).
*   **Subtraction using 2's Complement:** 
    1. Find 2's complement of the number to be subtracted.
    2. Add it to the other number.
    3. Ignore carry if it exists (result is positive); if no carry, find 2's complement of result (result is negative).

## 4. Logic Gates & Boolean Algebra
*   **Basic Gates:** AND, OR, NOT.
*   **Universal Gates:** NAND, NOR (Can implement any basic gate).
*   **Derived Gates:** XOR, XNOR.
*   **Boolean Laws:** De Morgan's Theorem, Distributive Law, etc.

## 5. K-Map (Karnaugh Map)
*   **Purpose:** Simplification of Boolean expressions.
*   **Up to 4 variables:** Systematic way to group 1s (SOP) or 0s (POS) in a grid to find the minimal expression.

> **Key Takeaway:** Logic gates are the fundamental decision-makers in digital electronics, and K-maps provide a visual way to optimize them.
          `
                },
                {
                    unit: 4,
                    title: "Unit IV: Combinational Logic Circuits",
                    body: `
# Unit IV: Introduction to Combinational Logic Circuits

## 1. What are Combinational Circuits?
*   Circuits where the output at any time depends only on the current inputs. No memory involved.

## 2. Common Combinational Circuits
### Adders & Subtractors
*   **Half Adder:** Adds 2 bits. Produces Sum and Carry.
*   **Full Adder:** Adds 3 bits (including carry-in).
*   **Half/Full Subtractor:** Performs subtraction producing Difference and Borrow.

### Multiplexers (MUX)
*   **Function:** Many-to-one. Selects one of many input signals and forwards it to a single output.
*   **Application:** Data selection, signal routing.

### De-multiplexers (DEMUX)
*   **Function:** One-to-many. Takes a single input and routes it to one of many outputs.

### Decoders & Encoders
*   **Decoder:** Converts $n$ input lines to $2^n$ output lines.
*   **Encoder:** Converts $2^n$ input lines to $n$ output lines (Inverse of decoder).

### Magnitude Comparator
*   **Function:** Compares two binary numbers (A and B) and determines if $A>B$, $A<B$, or $A=B$.

> **Key Takeaway:** Combinational circuits are used for processing data instantly without storing it.
          `
                },
                {
                    unit: 5,
                    title: "Unit V: Sequential Logic Circuits",
                    body: `
# Unit V: Introduction to Sequential Logic Circuits

## 1. What are Sequential Circuits?
*   Circuits where output depends on current inputs AND past outputs (requires memory elements).

## 2. Latches and Flip-Flops
*   **Latch:** Level-triggered storage element.
    *   **SR Latch:** Set-Reset. 
    *   **D Latch:** Data latch.
*   **Flip-Flop:** Edge-triggered storage element (changes state only on clock pulse).
    *   **SR Flip-Flop:** Similar to SR latch but clocked.
    *   **JK Flip-Flop:** "Universal" flip-flop, solves the invalid state issue of SR.
    *   **D Flip-Flop:** Delay/Data flip-flop. State follows input.
    *   **T Flip-Flop:** Toggle flip-flop. State flips on every clock if T=1.

## 3. Master-Slave Flip-Flop
*   Consists of two flip-flops (Master and Slave) connected together to eliminate "race around" conditions in JK flip-flops.

## 4. Flip-Flop Conversion
*   The process of converting one type of flip-flop into another (e.g., SR to JK) using additional logic gates.

> **Key Takeaway:** Flip-flops are the basic building blocks of memory in digital systems.
          `
                },
                {
                    unit: 6,
                    title: "Unit VI: Applications of Sequential Circuits",
                    body: `
# Unit VI: Applications of Sequential Circuits

## 1. Registers
*   A group of flip-flops used to store multiple bits of data.
*   **Shift Registers:**
    *   **SISO:** Serial-In Serial-Out.
    *   **SIPO:** Serial-In Parallel-Out.
    *   **PISO:** Parallel-In Serial-Out.
    *   **PIPO:** Parallel-In Parallel-Out.

## 2. Counters
*   Circuits that cyclicly go through a sequence of states.
*   **Asynchronous (Ripple) Counter:** Clock is applied only to the first flip-flop; others are triggered by the previous flip-flop's output.
*   **Synchronous Counter:** Clock is applied simultaneously to all flip-flops. Higher speed.
*   **Special Counters:**
    *   **UP/DOWN Counter:** Can count in both directions.
    *   **Mod-N Counter:** Counts up to N states (e.g., Mod-10 counts 0-9).
    *   **Ring Counter:** A shift register with the last output fed back to the first.
    *   **Johnson Counter:** Similar to ring counter but inverted feedback.

> **Key Takeaway:** Registers store data, while counters track the sequence of events or time.
          `
                }
            ],
            quizzes: [
                {
                    unit: 1,
                    question: "Which law states that the sum of voltages around a closed loop is zero?",
                    options: ["Ohm's Law", "Kirchhoff's Voltage Law", "Kirchhoff's Current Law", "Coulomb's Law"],
                    correctAnswer: 1,
                    explanation: "KVL is based on the principle of conservation of energy."
                },
                {
                    unit: 2,
                    question: "Which sensor is commonly used for distance measurement in Arduino projects?",
                    options: ["IR Sensor", "LDR", "Ultrasonic Sensor", "DHT11"],
                    correctAnswer: 2,
                    explanation: "Ultrasonic sensors use sound waves to measure distance."
                },
                {
                    unit: 3,
                    question: "What is the 2's complement of binary 1010?",
                    options: ["0110", "0101", "1011", "0111"],
                    correctAnswer: 0,
                    explanation: "1's complement of 1010 is 0101. Adding 1 gives 0110."
                },
                {
                    unit: 4,
                    question: "Which combinational circuit is known as 'many-to-one'?",
                    options: ["Decoder", "Encoder", "Multiplexer", "De-multiplexer"],
                    correctAnswer: 2,
                    explanation: "A Multiplexer (MUX) selects one from multiple inputs based on selection lines."
                },
                {
                    unit: 5,
                    question: "Which flip-flop toggle its state when the input is high?",
                    options: ["SR Flip-flop", "D Flip-flop", "JK Flip-flop", "T Flip-flop"],
                    correctAnswer: 3,
                    explanation: "T stands for Toggle. If T=1, the state changes."
                },
                {
                    unit: 6,
                    question: "In which shift register is data loaded all at once but read bit-by-bit?",
                    options: ["SISO", "SIPO", "PISO", "PIPO"],
                    correctAnswer: 2,
                    explanation: "PISO (Parallel-In Serial-Out) loads bits in parallel and shifts them out serially."
                }
            ],
            flashcards: [
                { front: "What does VDR stand for?", back: "Voltage Division Rule - used in series circuits to find voltage across a resistor." },
                { front: "What is the majority carrier in P-type semiconductor?", back: "Holes" },
                { front: "How many pins are typically on an Arduino Uno digital header?", back: "14 (0 to 13)" },
                { front: "Which gate is called the universal gate?", back: "NAND or NOR" },
                { front: "What is the main advantage of Master-Slave Flip-Flops?", back: "Eliminates race-around conditions in JK Flip-Flops." },
                { front: "What is a Mod-8 counter?", back: "A counter that has 8 states, counting from 0 to 7." }
            ]
        },
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
    }
];
