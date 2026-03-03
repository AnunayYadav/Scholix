export const unit1Title = "Unit 1: Fundamentals of Electrical Laws, Semiconductor Devices and its Applications";

export const unit1Body = `# Fundamentals of Electrical Laws, Semiconductor Devices and Applications

## Table of Contents
- [Ohm's Law](#ohms-law)
- [Kirchhoff's Laws](#kirchhoffs-laws)
- [Voltage Division Rule](#voltage-division-rule)
- [Current Division Rule](#current-division-rule)
- [Basics of Semiconductors](#basics-of-semiconductors)
- [PN Junction Diode](#pn-junction-diode)
- [Applications of PN Junction Diode](#applications-of-pn-junction-diode)
- [Bipolar Junction Transistor (BJT)](#bipolar-junction-transistor-bjt)
- [Practice Questions](#practice-questions)

---

## Ohm's Law

* **Definition:** Ohm's Law states that the current flowing through a conductor between two points is directly proportional to the voltage across the two points, provided the temperature and other physical conditions remain constant.

* **Formula:** $V = IR$

Where:
- $V$ = Voltage (in Volts, V)
- $I$ = Current (in Amperes, A)
- $R$ = Resistance (in Ohms, Ω)

$$V = IR$$

* **Explanation:** If we increase the voltage across a resistor while keeping the resistance constant, the current increases proportionally. Similarly, if resistance increases, current decreases for the same voltage.

### Derived Forms of Ohm's Law

* **Formula:** $I = \\frac{V}{R}$

* **Formula:** $R = \\frac{V}{I}$

### Power Relations from Ohm's Law

* **Formula:** $P = VI = I^2R = \\frac{V^2}{R}$

Where $P$ is the power dissipated in Watts (W).

### Solved Examples

* **Example:** A resistor of $10\\,\\Omega$ is connected across a $20\\,V$ battery. Find the current flowing through it.

**Solution:**
Using Ohm's Law: $I = \\frac{V}{R} = \\frac{20}{10} = 2\\,A$

* **Example:** A current of $5\\,A$ flows through a wire when $25\\,V$ is applied. Find the resistance and power dissipated.

**Solution:**
$R = \\frac{V}{I} = \\frac{25}{5} = 5\\,\\Omega$
$P = VI = 25 \\times 5 = 125\\,W$

### Limitations of Ohm's Law
- Not valid for non-linear devices (diodes, transistors)
- Not valid at very high temperatures
- Not applicable for unilateral elements

---

## Kirchhoff's Laws

### Kirchhoff's Current Law (KCL)

* **Statement:** The algebraic sum of all currents entering and leaving a node (junction) in an electrical circuit is zero.

* **Formula:** $\\sum I_{in} = \\sum I_{out}$

Or equivalently:

$$\\sum_{k=1}^{n} I_k = 0$$

* **Explanation:** KCL is based on the law of conservation of electric charge. No charge can accumulate at a node, so whatever current enters must leave.

* **Example:** At a junction, three currents $I_1 = 3\\,A$, $I_2 = 5\\,A$ enter, and $I_3$ leaves. Find $I_3$.

**Solution:**
By KCL: $I_1 + I_2 = I_3$
$I_3 = 3 + 5 = 8\\,A$

### Kirchhoff's Voltage Law (KVL)

* **Statement:** The algebraic sum of all voltages around any closed loop (mesh) in a circuit is zero.

* **Formula:** $\\sum V = 0$ (around a closed loop)

$$\\sum_{k=1}^{n} V_k = 0$$

* **Explanation:** KVL is based on the law of conservation of energy. The total energy supplied by sources equals the total energy consumed by resistors in a closed loop.

* **Example:** In a series circuit with a $12\\,V$ battery and two resistors $R_1 = 4\\,\\Omega$ and $R_2 = 8\\,\\Omega$, find the voltage drop across each resistor.

**Solution:**
Total resistance: $R_T = R_1 + R_2 = 4 + 8 = 12\\,\\Omega$
Current: $I = \\frac{V}{R_T} = \\frac{12}{12} = 1\\,A$
$V_1 = IR_1 = 1 \\times 4 = 4\\,V$
$V_2 = IR_2 = 1 \\times 8 = 8\\,V$
Verification (KVL): $12 - 4 - 8 = 0$ ✓

---

## Voltage Division Rule

* **Definition:** The Voltage Division Rule (VDR) is used to find the voltage across a particular resistor in a series circuit without calculating the current first.

* **Formula:** For resistors $R_1$ and $R_2$ in series with total voltage $V$:

$$V_1 = V \\times \\frac{R_1}{R_1 + R_2}$$

$$V_2 = V \\times \\frac{R_2}{R_1 + R_2}$$

* **Explanation:** In a series circuit, the voltage divides across each resistor in proportion to its resistance value. The larger resistor gets a larger share of the voltage.

* **Example:** Two resistors $R_1 = 6\\,\\Omega$ and $R_2 = 3\\,\\Omega$ are connected in series across a $18\\,V$ source. Find voltage across each.

**Solution:**
$V_1 = 18 \\times \\frac{6}{6+3} = 18 \\times \\frac{6}{9} = 12\\,V$
$V_2 = 18 \\times \\frac{3}{6+3} = 18 \\times \\frac{3}{9} = 6\\,V$

---

## Current Division Rule

* **Definition:** The Current Division Rule (CDR) is used to find the current through a particular resistor in a parallel circuit without calculating individual voltages first.

* **Formula:** For two resistors $R_1$ and $R_2$ in parallel with total current $I$:

$$I_1 = I \\times \\frac{R_2}{R_1 + R_2}$$

$$I_2 = I \\times \\frac{R_1}{R_1 + R_2}$$

* **Explanation:** In a parallel circuit, the current divides inversely proportional to the resistances. The smaller resistor carries the larger current.

* **Example:** Two resistors $R_1 = 4\\,\\Omega$ and $R_2 = 12\\,\\Omega$ are in parallel. Total current is $8\\,A$. Find individual currents.

**Solution:**
$I_1 = 8 \\times \\frac{12}{4+12} = 8 \\times \\frac{12}{16} = 6\\,A$
$I_2 = 8 \\times \\frac{4}{4+12} = 8 \\times \\frac{4}{16} = 2\\,A$

---

## Basics of Semiconductors

* **Definition:** A semiconductor is a material whose electrical conductivity lies between that of a conductor (e.g., copper) and an insulator (e.g., glass). Common examples: Silicon (Si) and Germanium (Ge).

### Energy Band Theory
- **Valence Band:** The outermost energy band filled with electrons.
- **Conduction Band:** The energy band where electrons are free to move and conduct electricity.
- **Forbidden Energy Gap ($E_g$):** The gap between the valence and conduction bands.
  - For Silicon: $E_g = 1.1\\,eV$
  - For Germanium: $E_g = 0.72\\,eV$

### Intrinsic Semiconductors

* **Definition:** A pure semiconductor without any impurity is called an intrinsic semiconductor. At absolute zero ($0\\,K$), it behaves as an insulator.

- At room temperature, some electrons gain energy and jump to the conduction band, leaving behind **holes** in the valence band.
- In an intrinsic semiconductor: $n_i = n_e = n_h$
  Where $n_i$ = intrinsic carrier concentration, $n_e$ = electron concentration, $n_h$ = hole concentration.

* **Formula:** $n_i^2 = n_e \\times n_h$

### Extrinsic Semiconductors

* **Definition:** A semiconductor doped with impurity atoms to increase its conductivity is called an extrinsic semiconductor.

### N-Type Semiconductor
- Doped with **pentavalent** impurities (P, As, Sb — Group V elements)
- **Majority carriers:** Electrons
- **Minority carriers:** Holes
- The impurity atom is called a **Donor** (donates an electron)

### P-Type Semiconductor
- Doped with **trivalent** impurities (B, Al, Ga — Group III elements)
- **Majority carriers:** Holes
- **Minority carriers:** Electrons
- The impurity atom is called an **Acceptor** (accepts an electron)

> In N-type, electrons are majority carriers. In P-type, holes are majority carriers. The semiconductor remains electrically neutral overall.

---

## PN Junction Diode

* **Definition:** A PN junction diode is formed when a P-type semiconductor is joined with an N-type semiconductor. It is the most basic semiconductor device.

### Formation of Depletion Region
- When P and N materials are joined, electrons from N-side diffuse to P-side and holes from P-side diffuse to N-side.
- This creates a region depleted of free carriers called the **Depletion Region** or **Space Charge Region**.
- A built-in potential barrier ($V_0$) is formed:
  - For Silicon: $V_0 \\approx 0.7\\,V$
  - For Germanium: $V_0 \\approx 0.3\\,V$

### Forward Bias
- **P-side** is connected to **positive terminal** and **N-side** to **negative terminal** of the battery.
- The depletion region narrows, and current flows when voltage exceeds the barrier potential.

### Reverse Bias
- **P-side** is connected to **negative terminal** and **N-side** to **positive terminal**.
- The depletion region widens, and only a small **reverse saturation current** flows due to minority carriers.

### Diode Current Equation (Shockley Equation)

* **Formula:** $I = I_0 \\left( e^{\\frac{V}{\\eta V_T}} - 1 \\right)$

Where:
- $I_0$ = Reverse saturation current
- $V$ = Applied voltage
- $\\eta$ = Ideality factor (1 for Ge, 2 for Si)
- $V_T = \\frac{kT}{q} \\approx 26\\,mV$ at room temperature ($T = 300\\,K$)

---

## Applications of PN Junction Diode

### Half-Wave Rectifier

* **Definition:** A half-wave rectifier converts only one half of the AC input cycle into pulsating DC output using a single diode.

* **Formula:** DC Output Voltage: $V_{dc} = \\frac{V_m}{\\pi}$

* **Formula:** Ripple Factor: $\\gamma = 1.21$

* **Formula:** Efficiency: $\\eta = 40.6\\%$

* **Formula:** PIV (Peak Inverse Voltage): $PIV = V_m$

### Full-Wave Rectifier (Center-Tapped)

* **Definition:** A full-wave rectifier converts both halves of the AC input cycle into pulsating DC using two diodes and a center-tapped transformer.

* **Formula:** DC Output Voltage: $V_{dc} = \\frac{2V_m}{\\pi}$

* **Formula:** Ripple Factor: $\\gamma = 0.48$

* **Formula:** Efficiency: $\\eta = 81.2\\%$

* **Formula:** PIV: $PIV = 2V_m$

### Bridge Rectifier

* **Definition:** A bridge rectifier uses four diodes in a bridge configuration to achieve full-wave rectification without a center-tapped transformer.

* **Formula:** $V_{dc} = \\frac{2V_m}{\\pi}$ (same as full-wave)

* **Formula:** PIV: $PIV = V_m$ (advantage over center-tap)

### Diode as a Switch
- In **forward bias**, the diode acts as a **closed switch** (ON state).
- In **reverse bias**, the diode acts as an **open switch** (OFF state).
- Used in digital logic circuits, clamping, and clipping circuits.

---

## Bipolar Junction Transistor (BJT)

* **Definition:** A Bipolar Junction Transistor (BJT) is a three-terminal semiconductor device (Emitter E, Base B, Collector C) used for amplification and switching. It uses both electrons and holes as charge carriers.

### Types of BJT
- **NPN Transistor:** Two N-type regions separated by a thin P-type base. Current flows from collector to emitter. More commonly used.
- **PNP Transistor:** Two P-type regions separated by a thin N-type base. Current flows from emitter to collector.

### Construction
- **Emitter:** Heavily doped, provides charge carriers.
- **Base:** Very thin and lightly doped, controls carrier flow.
- **Collector:** Moderately doped, collects charge carriers. Physically the largest region.

### Modes of Operation

| Mode | E-B Junction | C-B Junction | Application |
|------|-------------|-------------|-------------|
| Active | Forward Biased | Reverse Biased | Amplification |
| Saturation | Forward Biased | Forward Biased | Switch (ON) |
| Cut-off | Reverse Biased | Reverse Biased | Switch (OFF) |
| Reverse Active | Reverse Biased | Forward Biased | Rarely used |

### Common Emitter (CE) Configuration

* **Definition:** In the CE configuration, the emitter terminal is common to both input and output circuits. It is the most widely used configuration for amplification.

**Key Parameters:**

* **Formula:** Current Gain (β or $h_{FE}$): $\\beta = \\frac{I_C}{I_B}$

* **Formula:** Relation between $\\alpha$ and $\\beta$: $\\beta = \\frac{\\alpha}{1 - \\alpha}$

* **Formula:** Also: $\\alpha = \\frac{\\beta}{1 + \\beta}$

* **Formula:** $I_C = \\beta I_B$

* **Formula:** $I_E = I_C + I_B = (\\beta + 1) I_B$

Where:
- $\\alpha$ = Common Base current gain ($I_C / I_E$), typically 0.95 to 0.99
- $\\beta$ = Common Emitter current gain ($I_C / I_B$), typically 20 to 500

**CE Configuration Characteristics:**
- **Input Characteristics:** Plot of $I_B$ vs $V_{BE}$ at constant $V_{CE}$ — similar to a forward-biased diode.
- **Output Characteristics:** Plot of $I_C$ vs $V_{CE}$ at constant $I_B$ — shows Active, Saturation, and Cut-off regions.
- Provides **high voltage gain**, **high current gain**, and **high power gain**.
- Output signal is **180° out of phase** with input.

* **Example:** In a CE configuration, $\\beta = 100$ and $I_B = 20\\,\\mu A$. Find $I_C$ and $I_E$.

**Solution:**
$I_C = \\beta \\times I_B = 100 \\times 20\\,\\mu A = 2\\,mA$
$I_E = I_C + I_B = 2\\,mA + 0.02\\,mA = 2.02\\,mA$

* **Example:** If $\\alpha = 0.98$, find $\\beta$.

**Solution:**
$\\beta = \\frac{\\alpha}{1 - \\alpha} = \\frac{0.98}{1 - 0.98} = \\frac{0.98}{0.02} = 49$

---

## Practice Questions

### Conceptual Questions
1. State and explain Ohm's Law with its limitations.
2. State KCL and KVL with examples.
3. Differentiate between intrinsic and extrinsic semiconductors.
4. Explain the formation of depletion region in a PN junction.
5. Explain the working of a PN junction diode under forward and reverse bias.
6. Compare half-wave and full-wave rectifiers.
7. Explain the three modes of operation of a BJT.
8. Draw and explain the input and output characteristics of CE configuration.

### Numerical Problems
1. Three resistors of $3\\,\\Omega$, $6\\,\\Omega$, and $9\\,\\Omega$ are connected in series across a $36\\,V$ battery. Find the current and voltage across each resistor.
2. A current of $12\\,A$ divides into two parallel branches of $4\\,\\Omega$ and $6\\,\\Omega$. Find individual branch currents using CDR.
3. A half-wave rectifier has $V_m = 100\\,V$. Calculate $V_{dc}$ and the PIV rating of the diode.
4. In a BJT CE circuit, $\\beta = 150$ and $I_C = 3\\,mA$. Find $I_B$ and $I_E$.
5. Calculate $\\beta$ if $\\alpha = 0.99$.`;
