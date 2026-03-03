export const unit6Title = "Unit 6: Applications of Sequential Circuits";

export const unit6Body = `# Applications of Sequential Circuits

## Table of Contents
- [Registers](#registers)
- [Shift Register Operations](#shift-register-operations)
- [Types of Shift Registers](#types-of-shift-registers)
- [Counters Overview](#counters-overview)
- [Asynchronous Counters](#asynchronous-counters)
- [Synchronous Counters](#synchronous-counters)
- [Ring Counter and Johnson Ring Counter](#ring-counter-and-johnson-ring-counter)
- [Practice Questions](#practice-questions)

---

## Registers

* **Definition:** A register is a group of flip-flops used to store a binary word (multiple bits of data). An $n$-bit register consists of $n$ flip-flops and can store $n$ bits of binary information.

### Key Properties
- Each flip-flop stores **one bit**
- A 4-bit register uses 4 flip-flops and stores 4 bits
- Data can be loaded in **parallel** (all bits simultaneously) or **serial** (one bit at a time)
- Typically uses D flip-flops for data storage
- Controlled by a common clock signal

### Applications of Registers
- Temporary data storage in processors
- Data transfer between systems
- Buffering data
- Serial-to-parallel and parallel-to-serial data conversion

---

## Shift Register Operations

* **Definition:** A shift register is a register in which data is shifted (moved) from one flip-flop to the next at each clock pulse. The shifting can be to the left or to the right.

### Right Shift
- Data moves from left to right (MSB → LSB direction)
- At each clock pulse, $Q_3 \\rightarrow Q_2 \\rightarrow Q_1 \\rightarrow Q_0$
- New data enters from the leftmost flip-flop (Serial Input)
- Data exits from the rightmost flip-flop (Serial Output)

### Left Shift
- Data moves from right to left (LSB → MSB direction)
- At each clock pulse, $Q_0 \\rightarrow Q_1 \\rightarrow Q_2 \\rightarrow Q_3$
- New data enters from the rightmost flip-flop
- Data exits from the leftmost flip-flop

---

## Types of Shift Registers

### SISO (Serial In Serial Out)

* **Definition:** In SISO, data is entered serially (one bit at a time) and shifted out serially. Only one flip-flop receives external input; the rest receive input from the previous flip-flop.

**Operation (4-bit SISO, entering 1011 from left):**

| Clock Pulse | Input | $Q_3$ | $Q_2$ | $Q_1$ | $Q_0$ (Output) |
|-------------|-------|-------|-------|-------|-----------------|
| Initial | - | 0 | 0 | 0 | 0 |
| 1 | 1 | 1 | 0 | 0 | 0 |
| 2 | 0 | 0 | 1 | 0 | 0 |
| 3 | 1 | 1 | 0 | 1 | 0 |
| 4 | 1 | 1 | 1 | 0 | 1 |

- Requires $n$ clock pulses to load $n$ bits
- Requires another $n$ clock pulses to shift out all $n$ bits
- **Slowest** shift register mode but uses fewest connections

### SIPO (Serial In Parallel Out)

* **Definition:** In SIPO, data is entered serially (one bit at a time) but all bits are available as output simultaneously (in parallel) from the flip-flop outputs after loading is complete.

**Operation (entering 1101):**

| Clock Pulse | Input | $Q_3$ | $Q_2$ | $Q_1$ | $Q_0$ |
|-------------|-------|-------|-------|-------|-------|
| Initial | - | 0 | 0 | 0 | 0 |
| 1 | 1 | 1 | 0 | 0 | 0 |
| 2 | 1 | 1 | 1 | 0 | 0 |
| 3 | 0 | 0 | 1 | 1 | 0 |
| 4 | 1 | 1 | 0 | 1 | 1 |

After 4 clocks: Parallel output = $1011$ (read from $Q_3 Q_2 Q_1 Q_0$)

- Used for **serial-to-parallel data conversion**
- Requires $n$ clock pulses to load $n$ bits
- All data available simultaneously at outputs after loading

### PISO (Parallel In Serial Out)

* **Definition:** In PISO, all data bits are loaded simultaneously (in parallel) into the register, and then shifted out serially one bit at a time.

**Operation (loading 1011 in parallel, then shifting):**

| Clock Pulse | Mode | $Q_3$ | $Q_2$ | $Q_1$ | $Q_0$ (Serial Out) |
|-------------|------|-------|-------|-------|---------------------|
| Load | Parallel | 1 | 0 | 1 | 1 |
| Shift 1 | Serial | 0 | 1 | 0 | 1 → Out |
| Shift 2 | Serial | 0 | 0 | 1 | 0 → Out |
| Shift 3 | Serial | 0 | 0 | 0 | 1 → Out |
| Shift 4 | Serial | 0 | 0 | 0 | 0 → Out |

- Used for **parallel-to-serial data conversion**
- Loading is instantaneous (1 clock pulse)
- Requires $n$ shifts to output all $n$ bits serially

### PIPO (Parallel In Parallel Out)

* **Definition:** In PIPO, all data bits are loaded simultaneously and all output bits are available simultaneously. Data transfer occurs in a single clock pulse.

**Operation:**
- All inputs $D_3, D_2, D_1, D_0$ are applied simultaneously
- On the clock edge, all outputs $Q_3, Q_2, Q_1, Q_0$ load simultaneously
- **Fastest** shift register mode

- Used as a **buffer register** or **storage register**
- Data transfer in just **1 clock pulse**
- Used in ALU registers, data buffers, temporary storage

### Comparison of Shift Register Types

| Type | Input | Output | Clock Pulses to Load | Application |
|------|-------|--------|---------------------|-------------|
| SISO | Serial | Serial | $n$ | Delay line |
| SIPO | Serial | Parallel | $n$ | Serial to Parallel converter |
| PISO | Parallel | Serial | 1 | Parallel to Serial converter |
| PIPO | Parallel | Parallel | 1 | Buffer / Storage register |

---

## Counters Overview

* **Definition:** A counter is a sequential circuit that goes through a predetermined sequence of states upon the application of clock pulses. It counts the number of clock pulses that have occurred.

### Key Terms
- **Modulus (Mod):** The total number of unique states in the count sequence. A Mod-N counter has $N$ states and counts from 0 to $N-1$.
- **Number of flip-flops required:** $n = \\lceil \\log_2 N \\rceil$ (where $N$ is the modulus)

* **Formula:** For a counter with $n$ flip-flops: Maximum count $= 2^n - 1$, Modulus $= 2^n$

### Types of Counters
- **Asynchronous (Ripple) Counter:** Flip-flops are NOT triggered by the same clock. Output of one flip-flop drives the clock of the next.
- **Synchronous Counter:** All flip-flops are triggered by the **same clock** simultaneously.

---

## Asynchronous Counters

* **Definition:** In an asynchronous (ripple) counter, the first flip-flop is clocked by the external clock input, and each subsequent flip-flop is clocked by the output of the previous flip-flop. The clock signal "ripples" through the counter.

### Asynchronous UP Counter (3-bit)

* **Explanation:** Uses T flip-flops with $T=1$ (always toggle). Each flip-flop output is connected to the clock input of the next flip-flop. All flip-flops trigger on the **falling edge** (1→0 transition).

**Count Sequence (3-bit UP counter):**

| Clock | $Q_2$ | $Q_1$ | $Q_0$ | Decimal |
|-------|-------|-------|-------|---------|
| 0 | 0 | 0 | 0 | 0 |
| 1 | 0 | 0 | 1 | 1 |
| 2 | 0 | 1 | 0 | 2 |
| 3 | 0 | 1 | 1 | 3 |
| 4 | 1 | 0 | 0 | 4 |
| 5 | 1 | 0 | 1 | 5 |
| 6 | 1 | 1 | 0 | 6 |
| 7 | 1 | 1 | 1 | 7 |
| 8 | 0 | 0 | 0 | 0 (repeat) |

- Counts from $0$ to $2^n - 1$ ($0$ to $7$ for 3-bit)
- Modulus = $2^3 = 8$ (Mod-8 counter)

### Asynchronous DOWN Counter

* **Explanation:** Each flip-flop is triggered by the **complement output** ($\\overline{Q}$) of the previous flip-flop instead of $Q$.

**Count Sequence (3-bit DOWN counter):**

| Count | $Q_2$ | $Q_1$ | $Q_0$ | Decimal |
|-------|-------|-------|-------|---------|
| Start | 1 | 1 | 1 | 7 |
| 1 | 1 | 1 | 0 | 6 |
| 2 | 1 | 0 | 1 | 5 |
| ... | ... | ... | ... | ... |
| 7 | 0 | 0 | 0 | 0 |
| 8 | 1 | 1 | 1 | 7 (repeat) |

### Asynchronous Mod-N Counter

* **Definition:** A Mod-N counter counts from 0 to $N-1$ and then resets to 0. It uses a feedback mechanism (typically a NAND gate detecting the count $N$) to force a reset.

* **Example:** Design a Mod-5 counter (counts 0, 1, 2, 3, 4, then resets to 0).

**Solution:**
- Number of flip-flops needed: $\\lceil \\log_2 5 \\rceil = 3$ flip-flops
- The counter counts normally: 000 → 001 → 010 → 011 → 100
- When count reaches $5 = 101$, the NAND gate detects $Q_2 = 1$ and $Q_0 = 1$ and resets all flip-flops to 0
- Reset condition: Connect $Q_2$ and $Q_0$ to a NAND gate; NAND output connects to CLEAR of all flip-flops

* **Example:** Design a Mod-6 asynchronous counter.

**Solution:**
- Need 3 flip-flops ($\\lceil \\log_2 6 \\rceil = 3$)
- Counts: 000 → 001 → 010 → 011 → 100 → 101
- Reset at 6 ($110$): Detect $Q_2 = 1$ AND $Q_1 = 1$
- Connect $Q_2$ and $Q_1$ to reset logic

### Advantages and Disadvantages

**Advantages:**
- Simple circuit design
- Fewer components needed
- Easy to understand

**Disadvantages:**
- **Propagation delay** accumulates through each flip-flop
- Maximum operating frequency is limited
- **Glitches** may occur due to cumulative delay
- Not suitable for high-speed applications

---

## Synchronous Counters

* **Definition:** In a synchronous counter, all flip-flops receive the **same clock signal** simultaneously. The input logic for each flip-flop is designed so that the correct next state is reached on each clock edge.

### Synchronous UP Counter (3-bit)

* **Explanation:** All flip-flops are clocked simultaneously. The toggle condition for each flip-flop is determined by the states of the lower-order flip-flops.

**Design Logic:**
- $T_0 = 1$ (always toggles — LSB toggles every clock)
- $T_1 = Q_0$ (toggles when $Q_0 = 1$)
- $T_2 = Q_0 \\cdot Q_1$ (toggles when $Q_0 = 1$ AND $Q_1 = 1$)

**General rule for n-bit synchronous UP counter:**
* **Formula:** $T_i = Q_0 \\cdot Q_1 \\cdot Q_2 \\cdot ... \\cdot Q_{i-1}$ for each flip-flop $i$

### Synchronous DOWN Counter (3-bit)

**Design Logic:**
- $T_0 = 1$ (always toggles)
- $T_1 = \\overline{Q_0}$ (toggles when $Q_0 = 0$)
- $T_2 = \\overline{Q_0} \\cdot \\overline{Q_1}$ (toggles when $Q_0 = 0$ AND $Q_1 = 0$)

### Synchronous Mod-N Counter

* **Explanation:** Similar to the asynchronous Mod-N counter but with synchronous reset. The next-state logic is designed using state tables, K-Maps, and flip-flop excitation tables.

**Design Steps for Synchronous Mod-N Counter:**
1. Determine number of flip-flops: $n = \\lceil \\log_2 N \\rceil$
2. Draw the **state transition table** (present state → next state)
3. Determine required flip-flop inputs using **excitation tables**
4. Use **K-Maps** to simplify the input expressions
5. Draw the circuit

* **Example:** Design a Synchronous Mod-5 UP counter using JK flip-flops.

**State Table:**

| Present State ($Q_2 Q_1 Q_0$) | Next State ($Q_2 Q_1 Q_0$) |
|-------------------------------|----------------------------|
| 000 | 001 |
| 001 | 010 |
| 010 | 011 |
| 011 | 100 |
| 100 | 000 |

Using JK excitation table and K-Maps for each flip-flop to derive $J_2, K_2, J_1, K_1, J_0, K_0$ expressions:

$J_0 = 1$, $K_0 = 1$
$J_1 = Q_0\\overline{Q_2}$, $K_1 = Q_0$
$J_2 = Q_0 Q_1$, $K_2 = Q_0$

### Advantages and Disadvantages

**Advantages:**
- No propagation delay accumulation
- Higher maximum frequency
- Glitch-free operation
- Accurate timing

**Disadvantages:**
- More complex circuit design
- More gates required
- Higher power consumption

---

## Ring Counter and Johnson Ring Counter

### Ring Counter

* **Definition:** A ring counter is a type of counter composed of flip-flops connected in a shift register configuration, with the output of the last flip-flop fed back to the input of the first. Only one flip-flop is SET (has a 1) at any time, and this 1 circulates through the register.

**Working (4-bit Ring Counter):**
- Initial state: $Q_3 Q_2 Q_1 Q_0 = 1000$
- The single 1 shifts right through the register and wraps around

**Count Sequence:**

| Clock | $Q_3$ | $Q_2$ | $Q_1$ | $Q_0$ | State |
|-------|-------|-------|-------|-------|-------|
| 0 | 1 | 0 | 0 | 0 | S0 |
| 1 | 0 | 1 | 0 | 0 | S1 |
| 2 | 0 | 0 | 1 | 0 | S2 |
| 3 | 0 | 0 | 0 | 1 | S3 |
| 4 | 1 | 0 | 0 | 0 | S0 (repeat) |

**Properties:**
* **Formula:** Modulus $= n$ (where $n$ = number of flip-flops)
- Uses $n$ flip-flops for Mod-$n$ counter (inefficient compared to binary counter which needs only $\\lceil \\log_2 n \\rceil$)
- **No decoding logic** needed — each state is directly available at a flip-flop output
- Self-correcting versions can be designed

### Johnson Ring Counter (Twisted Ring Counter)

* **Definition:** A Johnson counter (also called twisted ring counter or Moebius counter) is a modified ring counter where the **complement** of the last flip-flop's output ($\\overline{Q}$ of last FF) is fed back to the input of the first flip-flop.

**Working (4-bit Johnson Counter):**
- Initial state: $Q_3 Q_2 Q_1 Q_0 = 0000$
- $\\overline{Q_0}$ is fed back to the input of the first flip-flop

**Count Sequence:**

| Clock | $Q_3$ | $Q_2$ | $Q_1$ | $Q_0$ | $\\overline{Q_0}$ (fed back) |
|-------|-------|-------|-------|-------|------------------------------|
| 0 | 0 | 0 | 0 | 0 | 1 |
| 1 | 1 | 0 | 0 | 0 | 1 |
| 2 | 1 | 1 | 0 | 0 | 1 |
| 3 | 1 | 1 | 1 | 0 | 1 |
| 4 | 1 | 1 | 1 | 1 | 0 |
| 5 | 0 | 1 | 1 | 1 | 0 |
| 6 | 0 | 0 | 1 | 1 | 0 |
| 7 | 0 | 0 | 0 | 1 | 0 |
| 8 | 0 | 0 | 0 | 0 | 1 (repeat) |

**Properties:**
* **Formula:** Modulus $= 2n$ (where $n$ = number of flip-flops)
- Uses $n$ flip-flops to get $2n$ states (double that of ring counter)
- A 4-bit Johnson counter is a **Mod-8** counter
- Decoding requires only **2-input AND gates** (one gate per state)
- The sequence follows a pattern: 1s fill from left, then 0s fill from left

### Decoding Johnson Counter States
- Each of the $2n$ states can be decoded using a **2-input AND gate**
- For state at clock $k$: use $Q_{k}$ and $\\overline{Q_{k+1}}$ (for first $n$ states)

### Ring Counter vs Johnson Counter

| Feature | Ring Counter | Johnson Counter |
|---------|-------------|-----------------|
| Feedback | $Q_{last} \\rightarrow D_{first}$ | $\\overline{Q_{last}} \\rightarrow D_{first}$ |
| Modulus | $n$ | $2n$ |
| States (4 FF) | 4 | 8 |
| Decoding | No gates needed | 2-input AND gates |
| Unused states | $2^n - n$ | $2^n - 2n$ |
| Efficiency | Low | Better than ring |

### Applications
- Frequency division
- Sequential logic timing
- Digital clock generation
- Phase signal generation
- LED chaser circuits

---

## Practice Questions

### Conceptual Questions
1. Explain the working of a SISO shift register with a timing diagram.
2. Differentiate between SIPO and PISO shift registers with applications.
3. What is the difference between an asynchronous and synchronous counter?
4. Explain the design of a Mod-N asynchronous counter with an example.
5. What is a ring counter? Draw the circuit for a 4-bit ring counter and show its count sequence.
6. What is a Johnson counter? How does it differ from a ring counter?
7. Compare the four types of shift registers (SISO, SIPO, PISO, PIPO).
8. What are the advantages of synchronous counters over asynchronous counters?

### Numerical / Design Problems
1. Design a 3-bit asynchronous UP counter and trace its count sequence from 0 to 7.
2. Design a Mod-10 (decade) asynchronous counter. How many flip-flops are needed?
3. Design a 3-bit synchronous UP counter using JK flip-flops. Derive all input expressions.
4. Design a 3-bit synchronous DOWN counter using T flip-flops.
5. A 4-bit Johnson counter starts at 0000. Write the complete count sequence.
6. How many flip-flops are needed for a Mod-12 counter? Design the feedback logic for an asynchronous implementation.
7. Show how a SIPO shift register converts serial data $1101$ to parallel form over 4 clock cycles.
8. Design a synchronous Mod-6 counter using JK flip-flops. Derive the state table and input equations.`;
