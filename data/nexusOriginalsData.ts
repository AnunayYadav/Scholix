import { NexusOriginal } from "../types.ts";

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
                    title: "Unit I: Semiconductor Physics & BJT",
                    image: "file:///C:/Users/ASUS/.gemini/antigravity/brain/385cb81f-3c0a-45ac-b5ba-d4f7d9c8e010/ece249_unit1_semiconductor_bjt_diagram_1772440128046.png",
                    body: `
# Table of Contents
[1. Semiconductor Physics](#semiconductor-physics)
[2. Formation of P-N Junction](#pn-junction)
[3. V-I Characteristics of Diode](#v-i-characteristics)
[4. Zener Diode as Voltage Regulator](#zener-diode)
[5. Bipolar Junction Transistors (BJT)](#bjt)
[6. Transistor Characteristics (CE)](#transistor-characteristics)
[7. Transistor as Amplifier & Switch](#applications)

# Semiconductor Physics
Semiconductors are materials with electrical conductivity between that of a conductor and an insulator. The most common semiconductor material is **Silicon (Si)**.

## Intrinsic Semiconductors
* **Intrinsic:** These are pure semiconductors without any added impurities. At $0 K$, they act as insulators. At room temperature, some covalent bonds break, creating electron-hole pairs.
* **Carrier Concentration:** In intrinsic semiconductors, the number of electron density ($n$) equals hole density ($p$):
$$ n = p = n_i $$

## Extrinsic Semiconductors
* **Extrinsic:** Created by adding a controlled amount of impurity atoms (doping).
* **N-Type:** Formed by adding **Pentavalent** impurities (e.g., Phosphorus, Arsenic). Majority carriers are **Electrons**.
* **P-Type:** Formed by adding **Trivalent** impurities (e.g., Boron, Aluminum). Majority carriers are **Holes**.

# Formation of P-N Junction
When a P-type and N-type material are joined, a **Depletion Region** is formed at the junction due to the diffusion of carriers.

* **Depletion Layer:** A region devoid of free charge carriers, acting as a potential barrier.
* **Barrier Potential:** For Silicon, $V_0 \approx 0.7V$. For Germanium, $V_0 \approx 0.3V$.

# V-I Characteristics
The Voltage-Current relationship of a diode is given by the diode equation:

$$ I = I_0(e^{\frac{V}{\eta V_T}} - 1) $$

Where:
* $I$ = Diode current
* $I_0$ = Reverse saturation current
* $V$ = Applied voltage
* $V_T$ = Thermal voltage ($\approx 26mV$ at room temperature)

# Zener Diode 
* **Zener Diode:** A heavily doped diode designed to operate in the reverse breakdown region.
* **Voltage Regulation:** It maintains a constant voltage $V_Z$ across its terminals even when current changes.

# Bipolar Junction Transistors (BJT)
A BJT is a three-terminal semiconductor device that can act as an amplifier or a switch. Its terminals are **Emitter (E)**, **Base (B)**, and **Collector (C)**.

* **Current Relationship:** The fundamental current equation for a BJT is:
$$ I_E = I_B + I_C $$

* **Common Emitter Gain ($\beta$):** 
$$ \beta = \frac{I_C}{I_B} $$

# Applications
* **Transistor as an Amplifier:** Small changes in input $I_B$ lead to large changes in $I_C$. 
* **Transistor as a Switch:** 
    * **OFF State:** Operating in cut-off region.
    * **ON State:** Operating in saturation region.

> **Key Takeaway:** Semiconductors are the heart of modern electronics. Understanding the P-N junction leads to understanding diodes, while the BJT allows us to control and amplify electrical signals.
`
                },
                {
                    unit: 2,
                    title: "Unit II: FET and Operational Amplifiers",
                    image: "file:///C:/Users/ASUS/.gemini/antigravity/brain/385cb81f-3c0a-45ac-b5ba-d4f7d9c8e010/ece249_unit2_fet_opamp_diagram_1772440151493.png",
                    body: `
# Table of Contents
[1. Field Effect Transistors (FET)](#fet)
[2. JFET Characteristics](#jfet)
[3. MOSFET Overview](#mosfet)
[4. Introduction to Op-Amp](#op-amp-basics)
[5. Op-Amp Applications](#op-amp-applications)

# Field Effect Transistors (FET)
FETs are unipolar devices where current is controlled by an electric field rather than current.

## JFET Characteristics
* **Shockley's Equation:** The drain current $I_D$ is related to gate-source voltage $V_{GS}$ as:
$$ I_D = I_{DSS} \left( 1 - \frac{V_{GS}}{V_P} \right)^2 $$

Where:
* $I_{DSS}$ = Short-circuit drain current
* $V_P$ = Pinch-off voltage

# MOSFET Overview
* **Enhancement Mode:** Channel is created only when $V_{GS} > V_{Th}$.
* **Depletion Mode:** Channel exists at $V_{GS} = 0$.

# Introduction to Op-Amp
* **Op-Amp:** A high-gain DC-coupled electronic voltage amplifier with differential inputs.

## Ideal Op-Amp Characteristics
* **Open-loop Gain ($A_{OL}$):** $\infty$
* **Input Impedance ($Z_{in}$):** $\infty$
* **Output Impedance ($Z_{out}$):** $0$

# Op-Amp Applications

## 1. Inverting Amplifier
Output is $180^\circ$ out of phase with input.
$$ V_{out} = -\left( \frac{R_f}{R_1} \right) V_{in} $$

## 2. Non-Inverting Amplifier
Output is in phase with input.
$$ V_{out} = \left( 1 + \frac{R_f}{R_1} \right) V_{in} $$

## 3. Integrator
Output is the integral of the input voltage.
$$ V_{out} = -\frac{1}{RC} \int V_{in} dt $$

## 4. Differentiator
Output is proportional to the rate of change of input.
$$ V_{out} = -RC \frac{dV_{in}}{dt} $$

> **Key Takeaway:** While BJTs are current-controlled, FETs offer superior input resistance. Op-Amps are versatile building blocks for analog signal processing.
`
                },
                {
                    unit: 3,
                    title: "Unit III: Logic Gates & Combinational Circuits",
                    image: "file:///C:/Users/ASUS/.gemini/antigravity/brain/385cb81f-3c0a-45ac-b5ba-d4f7d9c8e010/ece249_unit3_logic_gates_diagram_v2_1772440321841.png",
                    body: `
# Table of Contents
[1. Digital Logic Gates](#logic-gates)
[2. Universal Gates](#universal-gates)
[3. De Morgan's Theorem](#de-morgan)
[4. Combinational Circuits](#combinational-circuits)

# Digital Logic Gates
* **AND Gate:** $Y = A \cdot B$
* **OR Gate:** $Y = A + B$
* **NOT Gate:** $Y = \overline{A}$
* **XOR Gate:** $Y = A \oplus B$

# Universal Gates
**NAND** and **NOR** gates are called Universal Gates because they can implement any other logic gate.
* **NAND Expression:** $Y = \overline{A \cdot B}$
* **NOR Expression:** $Y = \overline{A + B}$

# De Morgan's Theorem
Crucial for simplifying logic expressions:
* **First Theorem:**
$$ \overline{A \cdot B} = \overline{A} + \overline{B} $$
* **Second Theorem:**
$$ \overline{A + B} = \overline{A} \cdot \overline{B} $$

# Combinational Circuits
Circuits where output depends solely on current inputs.

## Full Adder Equations
* **Sum ($S$):** $A \oplus B \oplus C_{in}$
* **Carry-out ($C_{out}$):** $(A \cdot B) + (C_{in} \cdot (A \oplus B))$

> **Key Takeaway:** Logic gates manage digital decisions, while combinational circuits process input data immediately.
`
                },
                {
                    unit: 4,
                    title: "Unit IV: Sequential Circuits & Arduino",
                    image: "file:///C:/Users/ASUS/.gemini/antigravity/brain/385cb81f-3c0a-45ac-b5ba-d4f7d9c8e010/ece249_unit4_sequential_arduino_diagram_v2_1772440346693.png",
                    body: `
# Table of Contents
[1. Sequential Logic Basics](#sequential-logic-basics)
[2. Flip-Flops](#flip-flops)
[3. Arduino Uno Architecture](#arduino-uno-architecture)

# Sequential Logic Basics
* **Sequential Circuits:** Unlike combinational circuits, these have **memory**. Output depends on current inputs AND previous states.

# Flip-Flops
Memory elements that store 1 bit of data.
* **SR Flip-Flop:** Set-Reset.
* **JK Flip-Flop:** Universal flip-flop that eliminates SR invalid state.
* **D Flip-Flop:** Data flip-flop.
* **T Flip-Flop:** Toggle flip-flop.

# Arduino Uno Architecture
* **Microcontroller:** ATmega328P
* **Clock Speed:** $16 MHz$
* **Input Voltage:** $7-12 V$

## Core Functions
* **Reading Sensors:** \`analogRead(pin)\`, \`digitalRead(pin)\`
* **Controlling Actuators:** \`analogWrite(pin, value)\`, \`digitalWrite(pin, state)\`

> **Key Takeaway:** Sequential circuits provide memory, and Arduino provides the software-controlled platform to run them.
`
                }
            ],
            quizzes: [
                {
                    unit: 1,
                    question: "What is the knee voltage for a Silicon diode?",
                    options: ["0.3V", "0.5V", "0.7V", "1.1V"],
                    correctAnswer: 2,
                    explanation: "Silicon diodes generally start conducting after a barrier potential of 0.7V is overcome."
                },
                {
                    unit: 2,
                    question: "In an ideal Op-Amp, what is the value of input impedance?",
                    options: ["Zero", "1 kOhm", "1 MOhm", "Infinite"],
                    correctAnswer: 3,
                    explanation: "Ideal op-amps draw zero current from inputs, implying infinite input impedance."
                },
                {
                    unit: 3,
                    question: "Which of these is a Universal Gate?",
                    options: ["AND", "OR", "NAND", "XOR"],
                    correctAnswer: 2,
                    explanation: "NAND and NOR can be used to construct any other basic logic gate."
                },
                {
                    unit: 4,
                    question: "Which type of Flip-Flop is also called a Toggle Flip-Flop?",
                    options: ["SR", "D", "JK", "T"],
                    correctAnswer: 3,
                    explanation: "The T flip-flop 'toggles' its output on every active clock edge if T=1."
                }
            ],
            flashcards: [
                { front: "What is Doping?", back: "The intentional addition of impurities to a semiconductor to change its electrical properties." },
                { front: "State Ohm's Law.", back: "V = I * R" },
                { front: "What is a Transistor Beta (\u03B2)?", back: "The current gain of a BJT in CE configuration (Ic / Ib)." },
                { front: "Equation for Inverting Op-Amp Gain?", back: "G = -Rf / R1" },
                { front: "What is De Morgan's 1st Law?", back: "(A * B)' = A' + B'" },
                { front: "What is a MOD-16 counter?", back: "A counter that counts 16 states (0 to 15)." }
            ]
        },
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
    }
];
