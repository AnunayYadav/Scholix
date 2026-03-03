export const unit5Title = "Unit 5: Introduction to Sequential Logic Circuits";

export const unit5Body = `# Introduction to Sequential Logic Circuits

## Table of Contents
- [Sequential Circuits Overview](#sequential-circuits-overview)
- [Latches](#latches)
- [Flip-Flops](#flip-flops)
- [Master-Slave Flip-Flop](#master-slave-flip-flop)
- [Conversion of Flip-Flops](#conversion-of-flip-flops)
- [Practice Questions](#practice-questions)

---

## Sequential Circuits Overview

* **Definition:** A sequential circuit is a digital circuit whose output depends on both the **present inputs** and the **past state** (history) of the circuit. It contains memory elements (latches or flip-flops) that store the previous state.

### Key Differences from Combinational Circuits
- Contains memory elements (feedback path)
- Output depends on input AND current state
- Requires a clock signal for synchronous circuits
- Has feedback from output to input

### Types
- **Asynchronous Sequential Circuits:** Output changes immediately when input changes (no clock). Example: Latches.
- **Synchronous Sequential Circuits:** Output changes only at specific clock edges. Example: Flip-Flops, Counters, Registers.

---

## Latches

* **Definition:** A latch is a basic memory element that stores one bit of information. It is **level-triggered**, meaning its output can change as long as the enable input is active (HIGH or LOW depending on design).

### SR Latch (Set-Reset Latch)

* **Definition:** An SR latch has two inputs — Set (S) and Reset (R) — and two complementary outputs — Q and $\\overline{Q}$. It can be constructed using cross-coupled NOR gates or NAND gates.

### SR Latch using NOR Gates

**Truth Table:**

| S | R | Q (next) | $\\overline{Q}$ | Condition |
|---|---|----------|-----------------|-----------|
| 0 | 0 | Q (prev) | $\\overline{Q}$ (prev) | No change (Hold) |
| 0 | 1 | 0 | 1 | Reset |
| 1 | 0 | 1 | 0 | Set |
| 1 | 1 | ? | ? | **Invalid / Forbidden** |

* **Explanation:** When $S=1, R=0$: the output is SET ($Q=1$). When $S=0, R=1$: the output is RESET ($Q=0$). When $S=R=0$: the latch holds its previous state. When $S=R=1$: the condition is **forbidden** because both outputs try to be 0, and the final state becomes unpredictable when both inputs return to 0.

### Characteristic Equation

* **Formula:** $Q_{n+1} = S + \\overline{R} \\cdot Q_n$ (with constraint $S \\cdot R = 0$)

### SR Latch using NAND Gates
- Inputs are active LOW ($\\overline{S}$ and $\\overline{R}$)
- $\\overline{S} = 0, \\overline{R} = 1$: Set
- $\\overline{S} = 1, \\overline{R} = 0$: Reset
- $\\overline{S} = 1, \\overline{R} = 1$: No change
- $\\overline{S} = 0, \\overline{R} = 0$: **Invalid**

### D Latch (Data Latch / Transparent Latch)

* **Definition:** The D (Data) latch eliminates the invalid state of the SR latch by using a single data input (D). The output Q follows the input D when the Enable signal is HIGH, and holds the last value when Enable is LOW.

**Truth Table (with Enable E):**

| E | D | Q (next) | Condition |
|---|---|----------|-----------|
| 0 | X | Q (prev) | Hold (Latched) |
| 1 | 0 | 0 | Reset (Q follows D) |
| 1 | 1 | 1 | Set (Q follows D) |

* **Formula:** $Q_{n+1} = D$ (when Enable = 1)

* **Explanation:** The D latch is derived from the SR latch by connecting D to S and $\\overline{D}$ to R. This ensures S and R are never equal, thus eliminating the forbidden state. When E=1, the latch is "transparent" — output follows input.

> The D latch is called a transparent latch because when enabled, any change in D immediately appears at Q.

---

## Flip-Flops

* **Definition:** A flip-flop is an **edge-triggered** bistable device that changes its output only at the rising edge (positive edge, 0→1) or falling edge (negative edge, 1→0) of the clock signal. Unlike latches, flip-flops are not affected by input changes between clock edges.

### SR Flip-Flop

**Truth Table:**

| S | R | $Q_{n+1}$ | Condition |
|---|---|-----------|-----------|
| 0 | 0 | $Q_n$ | No change |
| 0 | 1 | 0 | Reset |
| 1 | 0 | 1 | Set |
| 1 | 1 | ? | **Invalid** |

* **Formula:** Characteristic Equation: $Q_{n+1} = S + \\overline{R} \\cdot Q_n$ (with $SR = 0$)

**Excitation Table (for flip-flop conversion):**

| $Q_n$ | $Q_{n+1}$ | S | R |
|-------|-----------|---|---|
| 0 | 0 | 0 | X |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 0 | 1 |
| 1 | 1 | X | 0 |

### JK Flip-Flop

* **Definition:** The JK flip-flop is a refined version of the SR flip-flop that eliminates the invalid state. When $J=K=1$, the output **toggles** (complemented) instead of being undefined.

**Truth Table:**

| J | K | $Q_{n+1}$ | Condition |
|---|---|-----------|-----------|
| 0 | 0 | $Q_n$ | No change |
| 0 | 1 | 0 | Reset |
| 1 | 0 | 1 | Set |
| 1 | 1 | $\\overline{Q_n}$ | **Toggle** |

* **Formula:** Characteristic Equation: $Q_{n+1} = J\\overline{Q_n} + \\overline{K}Q_n$

**Excitation Table:**

| $Q_n$ | $Q_{n+1}$ | J | K |
|-------|-----------|---|---|
| 0 | 0 | 0 | X |
| 0 | 1 | 1 | X |
| 1 | 0 | X | 1 |
| 1 | 1 | X | 0 |

* **Explanation:** The JK flip-flop is the most versatile flip-flop. J acts as Set, K acts as Reset, and $J=K=1$ provides a toggle function useful for counters.

### D Flip-Flop

* **Definition:** The D (Data) flip-flop captures the value of the D input at the clock edge and stores it. The output Q takes the value of D at each active clock edge.

**Truth Table:**

| D | $Q_{n+1}$ | Condition |
|---|-----------|-----------|
| 0 | 0 | Reset |
| 1 | 1 | Set |

* **Formula:** Characteristic Equation: $Q_{n+1} = D$

**Excitation Table:**

| $Q_n$ | $Q_{n+1}$ | D |
|-------|-----------|---|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

* **Explanation:** The simplest flip-flop. Whatever value is at D when the clock edge arrives, that value is stored. Very commonly used in registers, data storage, and pipeline stages.

### T Flip-Flop (Toggle Flip-Flop)

* **Definition:** The T (Toggle) flip-flop has a single input T. When $T=1$, the output toggles (complements) at each active clock edge. When $T=0$, the output remains unchanged.

**Truth Table:**

| T | $Q_{n+1}$ | Condition |
|---|-----------|-----------|
| 0 | $Q_n$ | No change |
| 1 | $\\overline{Q_n}$ | Toggle |

* **Formula:** Characteristic Equation: $Q_{n+1} = T \\oplus Q_n$

**Excitation Table:**

| $Q_n$ | $Q_{n+1}$ | T |
|-------|-----------|---|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

* **Explanation:** The T flip-flop is derived from the JK flip-flop by connecting $J = K = T$. When $T=1$, the flip-flop toggles its state. This is the fundamental building block of binary counters.

---

## Master-Slave Flip-Flop

* **Definition:** A Master-Slave flip-flop consists of two flip-flops connected in series — the **Master** (front-end) and the **Slave** (back-end). The master is clocked on one edge and the slave on the opposite edge, eliminating the race condition (timing issues).

### Working Principle
1. When Clock = HIGH: The **Master** flip-flop is enabled and captures the input. The **Slave** is disabled and holds its previous state.
2. When Clock goes LOW: The **Master** is disabled and holds its captured value. The **Slave** is now enabled and transfers the Master's output to the final output Q.

### Master-Slave JK Flip-Flop
- Solves the **race-around condition** in JK flip-flops
- **Race-around condition:** When $J=K=1$ and the clock is HIGH for too long, the output keeps toggling multiple times unpredictably
- The Master-Slave architecture ensures the output changes only **once per clock cycle**

### Advantages
- Eliminates race-around condition
- Provides reliable edge triggering
- Output changes only on clock transition

### Disadvantages
- Longer propagation delay (two flip-flop delays)
- **1s catching problem**: If a glitch appears at J or K while clock is HIGH, the master captures it

> Modern edge-triggered flip-flops have largely replaced master-slave designs, but understanding Master-Slave is important for conceptual foundation.

---

## Conversion of Flip-Flops

* **Definition:** Flip-flop conversion is the process of designing one type of flip-flop using another type as the base, by adding appropriate combinational logic at the inputs.

### General Steps for Conversion
1. Write the **characteristic table** of the desired flip-flop
2. Write the **excitation table** of the available (given) flip-flop
3. Combine both tables — for each combination of present state $Q_n$ and desired input, find the required inputs to the given flip-flop
4. Use K-Map to derive the expressions for the given flip-flop inputs in terms of the desired flip-flop inputs and $Q_n$

### SR to JK Conversion

**Combined Table:**

| $Q_n$ | J | K | $Q_{n+1}$ | S | R |
|-------|---|---|-----------|---|---|
| 0 | 0 | 0 | 0 | 0 | X |
| 0 | 0 | 1 | 0 | 0 | X |
| 0 | 1 | 0 | 1 | 1 | 0 |
| 0 | 1 | 1 | 1 | 1 | 0 |
| 1 | 0 | 0 | 1 | X | 0 |
| 1 | 0 | 1 | 0 | 0 | 1 |
| 1 | 1 | 0 | 1 | X | 0 |
| 1 | 1 | 1 | 0 | 0 | 1 |

* **Formula:** $S = J\\overline{Q_n}$
* **Formula:** $R = K Q_n$

### JK to SR Conversion

* **Formula:** $J = S$
* **Formula:** $K = R$
(with the constraint that $S = R = 1$ is not allowed)

### JK to D Conversion

* **Formula:** $J = D$
* **Formula:** $K = \\overline{D}$

### JK to T Conversion

* **Formula:** $J = T$
* **Formula:** $K = T$

### D to JK Conversion

* **Formula:** $D = J\\overline{Q_n} + \\overline{K}Q_n$

### D to T Conversion

* **Formula:** $D = T \\oplus Q_n$

### T to JK Conversion

* **Formula:** $T = JQ_n' + KQ_n$

### T to D Conversion

* **Formula:** $T = D \\oplus Q_n$

---

## Practice Questions

### Conceptual Questions
1. Differentiate between latches and flip-flops.
2. Explain the working of an SR latch using NOR gates with its truth table.
3. Why is the $S=R=1$ condition called "forbidden" or "invalid" in an SR latch?
4. Explain the working of a D flip-flop and state its characteristic equation.
5. What is the difference between level-triggered and edge-triggered devices?
6. Explain the race-around condition in JK flip-flop and how Master-Slave architecture solves it.
7. Write the excitation tables for SR, JK, D, and T flip-flops.
8. Explain the T flip-flop and its significance in counter design.

### Numerical / Design Problems
1. Convert an SR flip-flop to a JK flip-flop. Derive the input expressions and draw the circuit.
2. Convert a JK flip-flop to a D flip-flop. Derive the logic and draw the circuit.
3. Convert a D flip-flop to a T flip-flop.
4. Design a Master-Slave JK flip-flop and trace its operation for the input sequence $J=1, K=1$ over two clock cycles.
5. Implement a T flip-flop using a JK flip-flop and verify using the truth table.
6. Given a JK flip-flop with initial state $Q=0$, determine the output after the following input sequence is applied at successive clock pulses: $(J,K) = (1,0), (1,1), (0,1), (1,0), (1,1)$.`;
