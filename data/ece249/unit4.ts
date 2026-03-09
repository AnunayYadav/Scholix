export const unit4Title = "Unit 4: Combinational Logic Circuits";

export const unit4Body = `# Unit 4: Combinational Logic Circuits

## Combinational vs Sequential Circuits

**Definition**

Digital circuits are divided into two main categories: Combinational and Sequential. 

- **Combinational Circuit:** A circuit where the output depends **only** on the present inputs. It has no memory.
- **Sequential Circuit:** A circuit where the output depends on both present inputs and past states. It has memory (like flip-flops).

**Explanation**

Think of a combinational circuit like a traditional calculator. If you press $5+5$, it immediately shows $10$. It doesn't remember what you did yesterday. A sequential circuit is like a combination lock on a safe. It only opens if you remember the previous numbers you entered in the correct order.

| Feature | Combinational | Sequential |
|---------|---------------|------------|
| Memory | No | Yes |
| Output depends on | Present inputs | Present inputs + Past states |
| Clock Signal | Not needed | Needed |
| Example | Adders, Multiplexers | Counters, Flip-flops |

## Adders

**Definition**

Adders are combinational circuits used to add binary numbers. They are the core of the Arithmetic Logic Unit (ALU) in computers.

### Half Adder

**Definition**

A half adder adds two 1-bit binary numbers ($A$ and $B$) and produces two outputs: Sum ($S$) and Carry ($C$).

**Explanation**

It is called "half" because it cannot accept a carry input from a previous addition stage. 

**Truth Table**

| A | B | Sum (S) | Carry (C) |
|---|---|---------|-----------|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 1 |

**Formula**

$$
S = A \\oplus B
$$
$$
C = A \\cdot B
$$

**Exam Tip**

A half adder is built using exactly one XOR gate (for Sum) and one AND gate (for Carry).

### Full Adder

**Definition**

A full adder adds three 1-bit binary numbers: two data bits ($A$, $B$) and one carry-in bit ($C_{in}$) from a previous stage. It produces a Sum ($S$) and a Carry-out ($C_{out}$).

**Explanation**

A full adder can be built by connecting two half adders and an OR gate.

**Truth Table**

| A | B | $C_{in}$ | Sum (S) | $C_{out}$ |
|---|---|----------|---------|-----------|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 | 1 |
| 1 | 0 | 1 | 0 | 1 |
| 1 | 1 | 0 | 0 | 1 |
| 1 | 1 | 1 | 1 | 1 |

*(Note: Shows only few key rows for simplicity, but know that 1+1+1 = Sum 1, Carry 1).*

**Formula**

$$
S = A \\oplus B \\oplus C_{in}
$$
$$
C_{out} = AB + BC_{in} + AC_{in}
$$

### n-bit Ripple Carry Adder

**Definition**

To add large numbers (like 4-bit or 8-bit numbers), we cascade (connect) multiple full adders in a chain, where the $C_{out}$ of one adder connects to the $C_{in}$ of the next.

## Subtractors

**Definition**

Subtractors are combinational circuits that perform the subtraction of binary numbers.

### Half Subtractor

**Definition**

A half subtractor subtracts one bit ($B$) from another bit ($A$) and produces two outputs: Difference ($D$) and Borrow ($B_{out}$).

**Truth Table**

| A | B | Difference (D) | Borrow ($B_{out}$) |
|---|---|----------------|--------------------|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 1 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 0 |

**Formula**

$$
D = A \\oplus B
$$
$$
B_{out} = \\overline{A} \\cdot B
$$

**Exam Tip**

The Difference formula is exactly the same as the Sum formula in an adder (XOR). Only the Carry/Borrow formula changes.

### Full Subtractor

**Definition**

A full subtractor subtracts two bits and a borrow-in ($B_{in}$) from a previous stage.

**Formula**

$$
D = A \\oplus B \\oplus B_{in}
$$
$$
B_{out} = \\overline{A}B + \\overline{A}B_{in} + B B_{in}
$$

## Multiplexers

**Definition**

A Multiplexer (MUX) is a data selector. It takes many inputs but only allows one input to pass through to the single output line. 

**Explanation**

Think of a TV. The TV receives hundreds of channels (inputs) from the cable, but you use the remote control (select lines) to choose exactly one channel (output) to watch on the screen.

- If there are $n$ select lines, there can be $2^n$ input lines.

### 2:1 Multiplexer

**Definition**

Has 2 inputs ($I_0, I_1$), 1 select line ($S$), and 1 output ($Y$).

**Formula**

$$
Y = \\overline{S} \\cdot I_0 + S \\cdot I_1
$$

**Explanation**

If $S=0$, $Y$ equals $I_0$. If $S=1$, $Y$ equals $I_1$.

### 4:1 Multiplexer

**Definition**

Has 4 inputs ($I_0, I_1, I_2, I_3$), 2 select lines ($S_1, S_0$), and 1 output ($Y$).

**Formula**

$$
Y = \\overline{S_1} \\overline{S_0} I_0 + \\overline{S_1} S_0 I_1 + S_1 \\overline{S_0} I_2 + S_1 S_0 I_3
$$

### Common Mistakes

- Confusing $S_1$ and $S_0$. Ensure the MSB is $S_1$ and LSB is $S_0$ when looking at the truth table.

## Demultiplexers

**Definition**

A Demultiplexer (DEMUX) does the exact opposite of a MUX. It takes a single input line and routes it to one of many output lines, controlled by select pins.

**Explanation**

Think of a mail sorter. One pile of mail comes in (input), and the sorter looks at the zip code (select lines) to put each letter into one of many specific city boxes (outputs).

### 1:4 Demultiplexer

**Definition**

Has 1 data input ($D$), 2 select lines ($S_1, S_0$), and 4 outputs ($Y_0, Y_1, Y_2, Y_3$).

**Formula**

$$
Y_0 = \\overline{S_1} \\overline{S_0} D
$$
$$
Y_3 = S_1 S_0 D
$$

*(Only the selected output gets the data $D$. The rest of the outputs are forced to 0).*

## Decoders

**Definition**

A decoder translates an $n$-bit binary code into $2^n$ separate output lines. Only **one** output line is HIGH at a time, based on the binary input value.

**Explanation**

Think of an elevator panel. The computer inside knows you are on floor binary "10" (which is Decimal 2). It activates only the single light behind the button "Floor 2".

### 2-to-4 Decoder

**Definition**

Takes 2 input lines ($A_1, A_0$) and produces 4 output lines ($D_0, D_1, D_2, D_3$).

**Formula**

$$
D_2 = A_1 \\overline{A_0}
$$

*(If input is 10, then $D_2$ is HIGH, everything else is LOW).*

**Exam Tip**

Decoders are identical to Demultiplexers mathematically! A 1:4 DEMUX is basically a 2-to-4 Decoder where the DEMUX input $D$ acts as an "Enable" pin for the Decoder.

## Encoders

**Definition**

An encoder performs the reverse operation of a decoder. It takes $2^n$ input lines (where only one is HIGH at a time) and converts them to an $n$-bit binary output code.

### 4-to-2 Encoder

**Definition**

Takes 4 inputs ($D_0, D_1, D_2, D_3$) and outputs a 2-bit binary number ($A_1, A_0$).

**Formula**

$$
A_0 = D_1 + D_3
$$
$$
A_1 = D_2 + D_3
$$

### Priority Encoder

**Definition**

A standard encoder breaks if the user presses two buttons at the same time. A priority encoder fixes this by only encoding the input with the highest priority (highest number) and ignoring the rest.

## Comparators

**Definition**

A magnitude comparator is a combinational circuit that compares two binary numbers ($A$ and $B$) and determines if $A>B$, $A=B$, or $A<B$.

### 1-Bit Comparator

**Definition**

Compares exactly two 1-bit numbers.

**Formula**

$$
(A > B) = A \\overline{B}
$$
$$
(A = B) = A \\odot B
$$
$$
(A < B) = \\overline{A} B
$$

**Explanation**

If $A=1$ and $B=0$, then $A>B$ is TRUE ($1 \\cdot \\overline{0} = 1$). 
For equality, we use the XNOR gate because it outputs 1 when both inputs are identical.

### 2-Bit Comparator

**Definition**

Compares two 2-bit numbers ($A_1 A_0$ and $B_1 B_0$). 

**Explanation**

The circuit first looks at the Most Significant Bits ($A_1$ and $B_1$). If $A_1$ is 1 and $B_1$ is 0, then $A$ is definitely greater than $B$. It only checks the lowest bits ($A_0, B_0$) if the highest bits are exactly the same!

**Example**

Compare $A=10$ and $B=01$.

**Solution**

### Step Method

Step 1 → Look at MSB: $A_1 = 1, B_1 = 0$.
Step 2 → Since $1 > 0$, we know $A > B$ immediately. 
Step 3 → No need to check $A_0$ and $B_0$. Final result: $A > B$.

## Quick Revision

| Concept | Key Point |
|---------|-----------|
| Combinational | Outputs depend ONLY on present inputs |
| Half Adder | Sum = XOR, Carry = AND |
| Multiplexer | Data Selector (Many-to-One) |
| Demultiplexer | Data Distributor (One-to-Many) |
| Decoder | Converts binary code to 1-of-N lines |
| Priority Encoder | Solves the overlapping input problem |

## Final Summary Table

| Circuit | Input | Output | Formula / Key Operation |
|---------|-------|--------|-------------------------|
| Half Adder | $A, B$ | $S, C$ | $S = A \\oplus B$, $C = AB$ |
| Half Subtractor | $A, B$ | $D, B_{out}$ | $D = A \\oplus B$, $B_{out} = \\overline{A}B$ |
| 4:1 MUX | 4 Data, 2 Select | 1 Output | Routes one data pin to output |
| 2:4 Decoder | 2 Inputs | 4 Outputs | Makes exactly one output HIGH |
| 1-bit Comparator | $A, B$ | $>, =, <$ | $(A = B) = A \\odot B$ |

## Self Assessment

1 Define a Combinational Circuit and give two examples.
2 Draw the truth table of a Half Adder.
3 Why is a Multiplexer called a "Data Selector"?
4 Write the boolean expression for the 2:1 Multiplexer's output.
5 Explain why a Priority Encoder is better than a standard Encoder.
`;
