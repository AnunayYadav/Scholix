export const unit4Title = "Unit 4: Introduction to Combinational Logic Circuits";

export const unit4Body = `# Introduction to Combinational Logic Circuits

## Table of Contents
- [Combinational vs Sequential Circuits](#combinational-vs-sequential-circuits)
- [Adders](#adders)
- [Subtractors](#subtractors)
- [Multiplexers](#multiplexers)
- [Demultiplexers](#demultiplexers)
- [Decoders](#decoders)
- [Encoders](#encoders)
- [Comparators](#comparators)
- [Practice Questions](#practice-questions)

---

## Combinational vs Sequential Circuits

* **Definition:** A combinational circuit is a digital circuit whose output depends only on the present combination of inputs and not on previous inputs or states. It has no memory or feedback.

| Feature | Combinational Circuit | Sequential Circuit |
|---------|----------------------|-------------------|
| Memory | No | Yes (uses flip-flops) |
| Output depends on | Present inputs only | Present inputs + past states |
| Feedback | No | Yes |
| Clock | Not required | Required |
| Examples | Adder, MUX, Decoder | Counter, Register, Flip-flop |

---

## Adders

### Half Adder

* **Definition:** A half adder is a combinational circuit that adds two single-bit binary numbers and produces a **Sum** and a **Carry** output. It does not account for any carry input from a previous stage.

**Truth Table:**

| A | B | Sum (S) | Carry (C) |
|---|---|---------|-----------|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 1 |

* **Formula:** Sum: $S = A \\oplus B$ (XOR gate)

* **Formula:** Carry: $C = A \\cdot B$ (AND gate)

* **Explanation:** The half adder uses one XOR gate for the Sum and one AND gate for the Carry. It is called "half" because it cannot handle carry input from a previous addition.

### Full Adder

* **Definition:** A full adder is a combinational circuit that adds three single-bit binary numbers — two significant bits ($A$, $B$) and a carry input ($C_{in}$) from a previous stage — and produces a Sum ($S$) and Carry Output ($C_{out}$).

**Truth Table:**

| A | B | $C_{in}$ | Sum (S) | $C_{out}$ |
|---|---|----------|---------|-----------|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 0 | 1 | 1 | 0 |
| 0 | 1 | 0 | 1 | 0 |
| 0 | 1 | 1 | 0 | 1 |
| 1 | 0 | 0 | 1 | 0 |
| 1 | 0 | 1 | 0 | 1 |
| 1 | 1 | 0 | 0 | 1 |
| 1 | 1 | 1 | 1 | 1 |

* **Formula:** Sum: $S = A \\oplus B \\oplus C_{in}$

* **Formula:** Carry: $C_{out} = AB + BC_{in} + AC_{in}$ or equivalently $C_{out} = AB + C_{in}(A \\oplus B)$

* **Explanation:** A full adder can be built using two half adders and one OR gate. The first half adder computes $A \\oplus B$, the second adds $C_{in}$, and the OR gate combines the carry outputs.

### n-bit Ripple Carry Adder
- Cascading $n$ full adders to add two $n$-bit numbers
- The carry output of each stage connects to the carry input of the next stage
- **Limitation:** Carry must "ripple" through all stages, causing propagation delay

---

## Subtractors

### Half Subtractor

* **Definition:** A half subtractor is a combinational circuit that subtracts one single-bit binary number (B) from another (A) and produces a **Difference** and a **Borrow** output.

**Truth Table:**

| A | B | Difference (D) | Borrow (Bo) |
|---|---|----------------|-------------|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 1 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 0 |

* **Formula:** Difference: $D = A \\oplus B$

* **Formula:** Borrow: $Bo = \\overline{A} \\cdot B$

### Full Subtractor

* **Definition:** A full subtractor subtracts two bits with a borrow input from a previous stage and produces a Difference and Borrow output.

**Truth Table:**

| A | B | $B_{in}$ | D | $B_{out}$ |
|---|---|----------|---|-----------|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 0 | 1 | 1 | 1 |
| 0 | 1 | 0 | 1 | 1 |
| 0 | 1 | 1 | 0 | 1 |
| 1 | 0 | 0 | 1 | 0 |
| 1 | 0 | 1 | 0 | 0 |
| 1 | 1 | 0 | 0 | 0 |
| 1 | 1 | 1 | 1 | 1 |

* **Formula:** Difference: $D = A \\oplus B \\oplus B_{in}$

* **Formula:** Borrow: $B_{out} = \\overline{A}B + \\overline{A}B_{in} + BB_{in}$ or $B_{out} = \\overline{A}B + B_{in}(\\overline{A \\oplus B})$

---

## Multiplexers

* **Definition:** A Multiplexer (MUX) is a combinational circuit that selects one of $2^n$ input data lines and routes it to a single output line based on $n$ selection (control) lines. It is also called a **data selector**.

### 2:1 Multiplexer
- Inputs: $I_0$, $I_1$; Select line: $S$; Output: $Y$

* **Formula:** $Y = \\overline{S} \\cdot I_0 + S \\cdot I_1$

| S | Y |
|---|---|
| 0 | $I_0$ |
| 1 | $I_1$ |

### 4:1 Multiplexer
- Inputs: $I_0, I_1, I_2, I_3$; Select lines: $S_1, S_0$; Output: $Y$

* **Formula:** $Y = \\overline{S_1}\\overline{S_0} \\cdot I_0 + \\overline{S_1}S_0 \\cdot I_1 + S_1\\overline{S_0} \\cdot I_2 + S_1 S_0 \\cdot I_3$

| $S_1$ | $S_0$ | Y |
|-------|-------|---|
| 0 | 0 | $I_0$ |
| 0 | 1 | $I_1$ |
| 1 | 0 | $I_2$ |
| 1 | 1 | $I_3$ |

### 8:1 Multiplexer
- 8 data inputs, 3 select lines, 1 output
- $Y = \\sum_{i=0}^{7} m_i \\cdot I_i$ where $m_i$ are minterms of select lines

> A $2^n$-to-1 MUX can implement any Boolean function of $n$ variables directly.

### Applications
- Data routing and selection
- Parallel-to-serial data conversion
- Boolean function implementation
- Communication systems

---

## Demultiplexers

* **Definition:** A Demultiplexer (DEMUX) is a combinational circuit that takes a single input and distributes it to one of $2^n$ output lines based on $n$ selection lines. It is the reverse of a multiplexer, also called a **data distributor**.

### 1:4 Demultiplexer
- Input: $D$; Select lines: $S_1, S_0$; Outputs: $Y_0, Y_1, Y_2, Y_3$

* **Formula:** $Y_0 = \\overline{S_1}\\overline{S_0} \\cdot D$
* **Formula:** $Y_1 = \\overline{S_1}S_0 \\cdot D$
* **Formula:** $Y_2 = S_1\\overline{S_0} \\cdot D$
* **Formula:** $Y_3 = S_1 S_0 \\cdot D$

| $S_1$ | $S_0$ | Selected Output |
|-------|-------|----------------|
| 0 | 0 | $Y_0 = D$ |
| 0 | 1 | $Y_1 = D$ |
| 1 | 0 | $Y_2 = D$ |
| 1 | 1 | $Y_3 = D$ |

### Applications
- Data distribution
- Serial-to-parallel data conversion
- Address decoding in memory systems

---

## Decoders

* **Definition:** A Decoder is a combinational circuit that converts an $n$-bit binary input code into $2^n$ unique output lines, of which only one is activated (HIGH) at a time.

### 2-to-4 Decoder
- Inputs: $A_1, A_0$; Outputs: $D_0, D_1, D_2, D_3$

* **Formula:** $D_0 = \\overline{A_1}\\overline{A_0}$, $D_1 = \\overline{A_1}A_0$, $D_2 = A_1\\overline{A_0}$, $D_3 = A_1 A_0$

| $A_1$ | $A_0$ | $D_0$ | $D_1$ | $D_2$ | $D_3$ |
|-------|-------|-------|-------|-------|-------|
| 0 | 0 | 1 | 0 | 0 | 0 |
| 0 | 1 | 0 | 1 | 0 | 0 |
| 1 | 0 | 0 | 0 | 1 | 0 |
| 1 | 1 | 0 | 0 | 0 | 1 |

### 3-to-8 Decoder
- Inputs: $A_2, A_1, A_0$; Outputs: $D_0$ to $D_7$
- Each output represents one minterm of the input variables
- Used for memory address decoding

### Enable Input
- Most decoders have an **Enable (E)** input
- When $E = 0$, all outputs are forced to 0 (inactive)
- Enables cascading of smaller decoders to build larger ones

### Applications
- Memory address decoding
- Instruction decoding in CPUs
- Data demultiplexing
- Seven-segment display drivers
- Minterm generation for Boolean functions

---

## Encoders

* **Definition:** An Encoder is a combinational circuit that performs the reverse operation of a decoder. It converts $2^n$ input lines into an $n$-bit binary code. Only one input should be active (HIGH) at a time.

### 4-to-2 Encoder
- Inputs: $D_0, D_1, D_2, D_3$ (only one active at a time)
- Outputs: $A_1, A_0$

* **Formula:** $A_0 = D_1 + D_3$
* **Formula:** $A_1 = D_2 + D_3$

| $D_3$ | $D_2$ | $D_1$ | $D_0$ | $A_1$ | $A_0$ |
|-------|-------|-------|-------|-------|-------|
| 0 | 0 | 0 | 1 | 0 | 0 |
| 0 | 0 | 1 | 0 | 0 | 1 |
| 0 | 1 | 0 | 0 | 1 | 0 |
| 1 | 0 | 0 | 0 | 1 | 1 |

### 8-to-3 Encoder (Octal to Binary)
- 8 inputs ($D_0$ to $D_7$), 3 outputs ($A_2, A_1, A_0$)

### Priority Encoder

* **Definition:** A priority encoder handles the case where multiple inputs are active simultaneously. It encodes the **highest-priority** (highest-numbered) active input and ignores the rest. It also has a **Valid (V)** output bit.

* **Explanation:** In a standard encoder, undefined behavior occurs when multiple inputs are active. A priority encoder solves this by assigning priority levels. The input with the highest priority determines the output.

### Applications
- Keyboard encoding
- Interrupt handling in processors
- Decimal to BCD conversion

---

## Comparators

* **Definition:** A comparator (or magnitude comparator) is a combinational circuit that compares two binary numbers and determines their relative magnitude — whether one is greater than, less than, or equal to the other.

### 1-Bit Comparator
- Compares two 1-bit inputs $A$ and $B$
- Three outputs: $A > B$, $A = B$, $A < B$

* **Formula:** $A > B = A\\overline{B}$
* **Formula:** $A = B = A \\odot B = AB + \\overline{A}\\overline{B}$ (XNOR)
* **Formula:** $A < B = \\overline{A}B$

| A | B | A>B | A=B | A<B |
|---|---|-----|-----|-----|
| 0 | 0 | 0 | 1 | 0 |
| 0 | 1 | 0 | 0 | 1 |
| 1 | 0 | 1 | 0 | 0 |
| 1 | 1 | 0 | 1 | 0 |

### 2-Bit Comparator

* **Definition:** A 2-bit magnitude comparator compares two 2-bit binary numbers $A = A_1A_0$ and $B = B_1B_0$ and provides three outputs indicating their relative magnitude.

- Let $x_1 = A_1 \\odot B_1$ and $x_0 = A_0 \\odot B_0$ (bit-wise equality checks)

* **Formula:** $(A = B) = x_1 \\cdot x_0$

* **Formula:** $(A > B) = A_1\\overline{B_1} + x_1 \\cdot A_0\\overline{B_0}$

* **Formula:** $(A < B) = \\overline{A_1}B_1 + x_1 \\cdot \\overline{A_0}B_0$

* **Explanation:** The comparator first checks the MSBs. If $A_1 > B_1$, then $A > B$ regardless of lower bits. If MSBs are equal ($x_1 = 1$), it then checks the LSBs.

* **Example:** Compare $A = 10$ and $B = 01$ using 2-bit comparator.

**Solution:**
$A_1 = 1, A_0 = 0, B_1 = 0, B_0 = 1$
$A_1\\overline{B_1} = 1 \\cdot 1 = 1$
So $(A > B) = 1$ → **A is greater than B** ($2 > 1$) ✓

### IC 7485 — 4-Bit Magnitude Comparator
- Compares two 4-bit numbers
- Has cascading inputs for expanding to larger bit widths
- Outputs: A>B, A=B, A<B

### Applications
- Data sorting
- Process control
- Arithmetic circuits
- Password verification systems

---

## Practice Questions

### Conceptual Questions
1. Differentiate between combinational and sequential circuits.
2. Design a half adder using logic gates and derive its Boolean expressions.
3. Explain the working of a full adder. How is it constructed using two half adders?
4. What is a multiplexer? Explain the working of a 4:1 MUX.
5. Differentiate between encoder and decoder with truth tables.
6. What is a priority encoder? Why is it preferred over a simple encoder?
7. Explain the working of a 2-bit magnitude comparator.
8. How can a decoder be used as a demultiplexer?

### Numerical Problems
1. Design a full subtractor using logic gates. Write its truth table and Boolean expressions.
2. Implement the Boolean function $F(A,B,C) = \\sum m(1,2,6,7)$ using an 8:1 MUX.
3. Design a 3-to-8 decoder and show how it generates all 8 minterms of 3 variables.
4. Compare the two 2-bit numbers $A = 11$ and $B = 10$ using a 2-bit comparator. Show all output values.
5. Implement a full adder using only NAND gates.`;
