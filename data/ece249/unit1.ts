export const unit1Title = "Unit 1: Fundamentals of Electrical Laws, Semiconductor Devices and Applications";

export const unit1Body = `# Unit 1: Fundamentals of Electrical Laws, Semiconductor Devices and Applications

## Ohm's Law

**Definition**

Ohm's Law states that the current flowing through a conductor is directly proportional to the voltage across it, assuming temperature remains constant.

**Formula**

$$
V = IR
$$

Where:
- $V$ = Voltage (in Volts)
- $I$ = Current (in Amperes)
- $R$ = Resistance (in Ohms)

**Explanation**

Think of water flowing through a pipe. Voltage is the water pressure, current is the water flow, and resistance is the pipe size. More pressure (voltage) means more flow (current). A narrower pipe (more resistance) means less flow.

**Example**

A resistor of $10\\,\\Omega$ is connected across a $20\\,V$ battery. Find the current flowing through it.

**Solution**

### Step Method

Step 1 → Identify variables: $V = 20\\,V$, $R = 10\\,\\Omega$
Step 2 → Apply Ohm's Law formula: $I = \\frac{V}{R}$
Step 3 → Substitute values: $I = \\frac{20}{10}$
Step 4 → Solve and verify units: $I = 2\\,A$

**Exam Tip**

Always check if the components are non-linear (like diodes) because Ohm's law does not apply to them.

### Common Mistakes

- Forgetting to convert units (e.g., $k\\Omega$ to $\\Omega$ or $mA$ to $A$).
- Applying Ohm's law to semiconductors (it only applies to linear conductors).

## Kirchhoff's Laws

**Definition**

Kirchhoff's Laws are two rules used to find unknown currents and voltages in complex circuits. They are based on the conservation of charge and energy.

### Kirchhoff's Current Law (KCL)

**Definition**

The total current entering a node exactly equals the total current leaving the node. No charge is stored at the junction.

**Formula**

$$
\\sum I_{in} = \\sum I_{out}
$$

**Explanation**

Imagine a water junction where 3 pipes meet. The amount of water coming in from one pipe must equal the total water going out from the other two.

**Example**

At a junction, currents $I_1 = 3\\,A$ and $I_2 = 5\\,A$ enter. The current $I_3$ leaves. Find $I_3$.

**Solution**

### Step Method

Step 1 → Identify entering currents: $I_{in} = 3\\,A + 5\\,A = 8\\,A$
Step 2 → Apply KCL: $I_{in} = I_{out}$
Step 3 → Set leaving current: $I_3 = 8\\,A$

### Kirchhoff's Voltage Law (KVL)

**Definition**

The sum of all voltages around any closed loop in a circuit is exactly zero. Energy given by the battery equals energy used by the resistors.

**Formula**

$$
\\sum V = 0
$$

**Explanation**

Think of a hiking trip. If you start at base camp (0 height), hike up a mountain (+ voltage), and hike back down (- voltage drops), your total change in height when back at base camp is zero.

**Example**

A $12\\,V$ battery connects to resistors $R_1 = 4\\,\\Omega$ and $R_2 = 8\\,\\Omega$ in series. Find the voltage drop across each.

**Solution**

### Step Method

Step 1 → Find total resistance: $R = 4+8 = 12\\,\\Omega$
Step 2 → Find current using Ohm's law: $I = \\frac{12}{12} = 1\\,A$
Step 3 → Calculate individual voltage drops: $V_1 = 1 \\times 4 = 4\\,V$, and $V_2 = 1 \\times 8 = 8\\,V$
Step 4 → Verify KVL: $12 - 4 - 8 = 0$

**Exam Tip**

When writing KVL equations, always pick a direction (clockwise) and stick to standard sign conventions for voltage drops.

### Common Mistakes

- Messing up the + and - signs when going around a loop in KVL.
- Applying KCL on a single wire instead of a node.

## Voltage Division Rule

**Definition**

The Voltage Division Rule (VDR) helps you directly calculate the voltage across a specific resistor in a series circuit without finding the total current first.

**Formula**

For resistor $R_1$:

$$
V_1 = V \\times \\frac{R_1}{R_1 + R_2}
$$

**Explanation**

In a series circuit, voltage divides proportionally to resistance. A larger resistor gets a larger share of the total voltage.

**Example**

Two resistors $R_1 = 6\\,\\Omega$ and $R_2 = 3\\,\\Omega$ are in series across $18\\,V$. Find the voltage across $R_1$.

**Solution**

$$
V_1 = 18 \\times \\frac{6}{6+3} = 18 \\times \\frac{6}{9} = 12\\,V
$$

**Exam Tip**

VDR only works for series circuits. Never use it for parallel resistors!

## Current Division Rule

**Definition**

The Current Division Rule (CDR) helps you directly calculate the current flowing through a specific resistor in a parallel circuit without finding the total voltage first.

**Formula**

For resistor $R_1$:

$$
I_1 = I \\times \\frac{R_2}{R_1 + R_2}
$$

**Explanation**

In a parallel circuit, current takes the path of least resistance. The smaller resistor allows a larger share of the total current. Notice the formula uses the **opposite** resistor on top.

**Example**

Total current is $8\\,A$. Two parallel resistors are $4\\,\\Omega$ and $12\\,\\Omega$. Find the current through $4\\,\\Omega$.

**Solution**

$$
I_{4\\Omega} = 8 \\times \\frac{12}{4+12} = 8 \\times \\frac{12}{16} = 6\\,A
$$

**Exam Tip**

CDR formula places the OTHER resistor in the numerator. VDR places the SAME resistor in the numerator.

### Common Mistakes

- Using VDR in parallel circuits and CDR in series circuits.
- Forgetting to put the opposite resistor in the numerator for CDR.

## Basics of Semiconductors

**Definition**

A semiconductor is a material with electrical conductivity between a conductor (like copper) and an insulator (like rubber). Silicon (Si) and Germanium (Ge) are common examples.

**Explanation**

Think of a club with a VIP section (Conduction Band) and a general section (Valence Band). In an insulator, there is a massive wall between them. In conductors, the wall is broken. In a semiconductor, there is a small gate (Energy Gap). With a little energy (heat or voltage), people (electrons) can jump the gate.

### Energy Band Theory

- **Valence Band:** Outside band filled with electrons.
- **Conduction Band:** Band where electrons are free to move.
- **Forbidden Energy Gap ($E_g$):** Gap between valence and conduction bands. $1.1\\,eV$ for Silicon.

### Intrinsic Semiconductor

**Definition**

A pure semiconductor with no added impurities.

**Explanation**

At $0\\,K$, it is a perfect insulator. At room temperature, heat energy causes some electrons to jump to the conduction band, leaving empty spots called "holes." Number of electrons equals number of holes.

### Extrinsic Semiconductor

**Definition**

A semiconductor where impurities are intentionally added to increase conductivity. This process is called doping.

### N-Type Semiconductor

**Definition**

An extrinsic semiconductor doped with pentavalent impurities (5 outer electrons like Phosphorus).

**Explanation**

The extra electron from the impurity becomes free to conduct. Think of "N" for Negative, because the majority carriers are Negative electrons.

### P-Type Semiconductor

**Definition**

An extrinsic semiconductor doped with trivalent impurities (3 outer electrons like Boron).

**Explanation**

The missing electron creates a "hole". Think of "P" for Positive, because the majority carriers are Positive holes.

**Exam Tip**

N-type majority carriers = Electrons. P-type majority carriers = Holes.

### Common Mistakes

- Thinking N-Type or P-Type semiconductors carry a net electrical charge. They are electrically neutral because the total protons still equal total electrons.

## PN Junction Diode

**Definition**

A basic semiconductor device formed by joining P-type and N-type materials. It allows current to flow easily in only one direction.

### Depletion Region

**Definition**

When P and N materials meet, electrons and holes combine near the junction, creating a zone empty of free charge carriers.

**Explanation**

It acts like a physical barrier or a wall that stops more charges from crossing unless external voltage is applied.

### Forward Bias

**Definition**

When the P-side connects to the positive battery terminal and the N-side to the negative terminal.

**Explanation**

The battery pushes carriers forcefully across the junction, shrinking the depletion region and allowing heavy current flow.

### Reverse Bias

**Definition**

When the P-side connects to the negative terminal and the N-side to the positive terminal.

**Explanation**

The battery pulls carriers away from the junction, widening the depletion region. Only a tiny "leakage current" flows.

### Diode Current Equation

**Formula**

Shockley Equation:
$$
I = I_0 \\left( e^{\\frac{V}{\\eta V_T}} - 1 \\right)
$$

**Exam Tip**

In numericals, $V_T$ is often taken as $26\\,mV$ at room temperature.

## Applications of PN Junction Diode

**Definition**

Diodes are mainly used to convert AC (Alternating Current) to DC (Direct Current). This is called rectification.

### Half-Wave Rectifier

**Definition**

Uses a single diode to allow only the positive half of the AC cycle to pass, blocking the negative half.

**Formula**

$$
V_{dc} = \\frac{V_m}{\\pi}
$$

**Explanation**

Think of a one-way street toll booth that only lets daytime traffic pass and blocks night traffic.

### Full-Wave Rectifier

**Definition**

Uses two diodes and a center-tapped transformer to convert both positive and negative halves of AC into positive DC.

**Formula**

$$
V_{dc} = \\frac{2V_m}{\\pi}
$$

### Bridge Rectifier

**Definition**

Uses four diodes arranged in a bridge. It achives full-wave rectification without needing an expensive center-tapped transformer.

**Formula**

$$
V_{dc} = \\frac{2V_m}{\\pi}
$$

**Exam Tip**

The Bridge Rectifier has lower Peak Inverse Voltage ($PIV = V_m$) compared to a center-tap rectifier ($PIV = 2V_m$), making it cheaper and safer.

## Bipolar Junction Transistor (BJT)

**Definition**

A BJT is a three-terminal device (Emitter, Base, Collector) that acts as an amplifier or a switch. It relies on both electrons and holes.

### Types of BJT

- **NPN Transistor:** P-type base sandwiched between two N-type regions.
- **PNP Transistor:** N-type base sandwiched between two P-type regions.

### Construction of BJT

- **Emitter:** Heavily doped to inject carriers.
- **Base:** Very thin and lightly doped to smoothly pass carriers.
- **Collector:** Moderately doped, largest area to collect carriers and dissipate heat.

### Modes of Operation

**Explanation**

Depending on how we bias the two junctions (Emitter-Base and Collector-Base), the BJT does different jobs:

| Mode | E-B Junction | C-B Junction | Job |
|------|-------------|-------------|-----|
| Active | Forward | Reverse | Amplifier |
| Saturation | Forward | Forward | ON Switch |
| Cut-off | Reverse | Reverse | OFF Switch |

### Common Emitter (CE) Configuration

**Definition**

The Emitter terminal is common to both input and output. This is the most popular way to connect a BJT because it provides high voltage and current gain.

**Formula**

$$
I_E = I_B + I_C
$$
$$
\\beta = \\frac{I_C}{I_B}
$$

**Explanation**

Think of a water faucet. The Base is the handle. A small turn (Base current) controls a massive flow of water (Collector current) from the pipe (Emitter).

**Example**

In a CE circuit, $\\beta = 100$ and $I_B = 20\\,\\mu A$. Find $I_C$.

**Solution**

### Step Method

Step 1 → Identify formula: $I_C = \\beta \\times I_B$
Step 2 → Substitute: $I_C = 100 \\times 20\\,\\mu A$
Step 3 → Convert and solve: $I_C = 2000\\,\\mu A = 2\\,mA$

### Common Mistakes

- Forgetting that $\\beta$ connects collector and base currents ($I_C / I_B$), while $\\alpha$ connects collector and emitter currents ($I_C / I_E$).

## Quick Revision

| Concept | Key Idea |
|---------|----------|
| Ohm's Law | V = IR |
| KVL | Sum of loop voltages = 0 |
| KCL | Incoming current = Outgoing current |
| N-Type | Majority electrons (Pentavalent) |
| P-Type | Majority holes (Trivalent) |
| BJT Active Mode | E-B Forward, C-B Reverse |

## Final Summary Table

| Topic | Key Formula |
|-------|-------------|
| Ohm's Law | V = IR |
| VDR | $V_1 = V \\times (R_1 / (R_1+R_2))$ |
| CDR | $I_1 = I \\times (R_2 / (R_1+R_2))$ |
| Half-Wave | $V_{dc} = V_m / \\pi$ |
| Full-Wave | $V_{dc} = 2V_m / \\pi$ |
| BJT $\\beta$ | $\\beta = I_C / I_B$ |

## Self Assessment

1 Define Ohm's Law and its limitations.
2 Calculate the unknown current if $5\\,A$ and $2\\,A$ enter a node, and one current leaves.
3 Compare N-Type and P-Type semiconductors.
4 Explain the working of a Bridge Rectifier with a diagram.
5 A BJT has $\\beta = 150$ and base current $10\\,\\mu A$. Find the collector current.
`;
