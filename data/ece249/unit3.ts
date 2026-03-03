export const unit3Title = "Unit 3: Introduction to Number System and Logic Gates";

export const unit3Body = `# Introduction to Number System and Logic Gates

## Table of Contents
- [Number Systems](#number-systems)
- [Number System Conversions](#number-system-conversions)
- [Codes](#codes)
- [Complements](#complements)
- [Binary Arithmetic](#binary-arithmetic)
- [Logic Gates](#logic-gates)
- [Boolean Algebra](#boolean-algebra)
- [SOP and POS Forms](#sop-and-pos-forms)
- [Karnaugh Map (K-Map)](#karnaugh-map-k-map)
- [Practice Questions](#practice-questions)

---

## Number Systems

* **Definition:** A number system is a mathematical notation for representing numbers using a set of digits or symbols. The base (or radix) of a number system determines the number of unique symbols used.

### Types of Number Systems

| Number System | Base | Digits Used | Example |
|---------------|------|-------------|---------|
| Binary | 2 | 0, 1 | $(1010)_2$ |
| Octal | 8 | 0-7 | $(752)_8$ |
| Decimal | 10 | 0-9 | $(945)_{10}$ |
| Hexadecimal | 16 | 0-9, A-F | $(3AF)_{16}$ |

### Positional Notation

* **Formula:** A number $N$ in base $r$ with digits $d_n d_{n-1}...d_1 d_0 . d_{-1} d_{-2}$ has value:

$$N = d_n \\times r^n + d_{n-1} \\times r^{n-1} + ... + d_0 \\times r^0 + d_{-1} \\times r^{-1} + ...$$

---

## Number System Conversions

### Decimal to Binary

* **Explanation:** Divide the decimal number repeatedly by 2 and collect the remainders from bottom to top.

* **Example:** Convert $(25)_{10}$ to binary.

**Solution:**
$25 \\div 2 = 12$, remainder $1$
$12 \\div 2 = 6$, remainder $0$
$6 \\div 2 = 3$, remainder $0$
$3 \\div 2 = 1$, remainder $1$
$1 \\div 2 = 0$, remainder $1$
Reading remainders bottom to top: $(25)_{10} = (11001)_2$

### Binary to Decimal

* **Explanation:** Multiply each bit by its positional weight ($2^n$) and sum them.

* **Example:** Convert $(11011)_2$ to decimal.

**Solution:**
$1 \\times 2^4 + 1 \\times 2^3 + 0 \\times 2^2 + 1 \\times 2^1 + 1 \\times 2^0$
$= 16 + 8 + 0 + 2 + 1 = (27)_{10}$

### Decimal to Octal

* **Example:** Convert $(156)_{10}$ to octal.

**Solution:**
$156 \\div 8 = 19$, remainder $4$
$19 \\div 8 = 2$, remainder $3$
$2 \\div 8 = 0$, remainder $2$
$(156)_{10} = (234)_8$

### Decimal to Hexadecimal

* **Example:** Convert $(255)_{10}$ to hexadecimal.

**Solution:**
$255 \\div 16 = 15$, remainder $15 = F$
$15 \\div 16 = 0$, remainder $15 = F$
$(255)_{10} = (FF)_{16}$

### Binary to Octal
- Group binary digits in sets of **3** from the right
- Convert each group to its octal equivalent

* **Example:** Convert $(110101011)_2$ to octal.

**Solution:**
Groups: $110 | 101 | 011$
$110 = 6$, $101 = 5$, $011 = 3$
$(110101011)_2 = (653)_8$

### Binary to Hexadecimal
- Group binary digits in sets of **4** from the right
- Convert each group to its hex equivalent

* **Example:** Convert $(10101111)_2$ to hexadecimal.

**Solution:**
Groups: $1010 | 1111$
$1010 = A$, $1111 = F$
$(10101111)_2 = (AF)_{16}$

---

## Codes

### BCD (Binary Coded Decimal)

* **Definition:** BCD represents each decimal digit separately using its 4-bit binary equivalent. Each decimal digit (0-9) is represented by a 4-bit binary number.

* **Example:** Convert $(85)_{10}$ to BCD.

**Solution:**
$8 = 1000$, $5 = 0101$
$(85)_{10} = (1000\\;0101)_{BCD}$

### Binary to Gray Code (B-G Conversion)

* **Definition:** Gray code is a binary numeral system where two successive values differ in only one bit. This is useful in error detection.

**Rules for Binary to Gray conversion:**
- The MSB (Most Significant Bit) of Gray code is same as MSB of binary
- Each subsequent Gray bit = XOR of current and previous binary bit

* **Formula:** $G_i = B_i \\oplus B_{i+1}$, and $G_{MSB} = B_{MSB}$

* **Example:** Convert binary $(1011)_2$ to Gray code.

**Solution:**
$B_3 = 1, B_2 = 0, B_1 = 1, B_0 = 1$
$G_3 = B_3 = 1$
$G_2 = B_3 \\oplus B_2 = 1 \\oplus 0 = 1$
$G_1 = B_2 \\oplus B_1 = 0 \\oplus 1 = 1$
$G_0 = B_1 \\oplus B_0 = 1 \\oplus 1 = 0$
Gray Code = $(1110)_G$

### Gray to Binary Code (G-B Conversion)

**Rules for Gray to Binary conversion:**
- The MSB of Binary is same as MSB of Gray
- Each subsequent Binary bit = XOR of current Gray bit and previous Binary bit

* **Formula:** $B_{MSB} = G_{MSB}$, and $B_i = G_i \\oplus B_{i+1}$

* **Example:** Convert Gray $(1010)_G$ to Binary.

**Solution:**
$G_3=1, G_2=0, G_1=1, G_0=0$
$B_3 = G_3 = 1$
$B_2 = G_2 \\oplus B_3 = 0 \\oplus 1 = 1$
$B_1 = G_1 \\oplus B_2 = 1 \\oplus 1 = 0$
$B_0 = G_0 \\oplus B_1 = 0 \\oplus 0 = 0$
Binary = $(1100)_2$

### Excess-3 Code

* **Definition:** Excess-3 code is a self-complementary BCD code obtained by adding 3 (binary $0011$) to each BCD digit.

* **Formula:** Excess-3 Code $=$ BCD $+ 0011$

* **Example:** Convert $(47)_{10}$ to Excess-3 code.

**Solution:**
$4 \\rightarrow BCD: 0100 \\rightarrow +0011 = 0111$
$7 \\rightarrow BCD: 0111 \\rightarrow +0011 = 1010$
Excess-3 Code = $0111\\;1010$

> The advantage of Excess-3 code is that it is self-complementary — the 9's complement of any decimal digit can be obtained by simply inverting all bits.

---

## Complements

### 1's Complement

* **Definition:** The 1's complement of a binary number is obtained by inverting (flipping) each bit — changing 0 to 1 and 1 to 0.

* **Example:** Find the 1's complement of $(1010)_2$.
**Solution:** $1's\\;complement = 0101$

### 2's Complement

* **Definition:** The 2's complement of a binary number is obtained by adding 1 to the 1's complement. It is the most common method for representing signed (negative) numbers in computers.

* **Formula:** $2's\\;complement = 1's\\;complement + 1$

* **Example:** Find the 2's complement of $(1010)_2$.

**Solution:**
$1's\\;complement = 0101$
$2's\\;complement = 0101 + 1 = 0110$

### 9's and 10's Complement (Decimal)

* **Formula:** $9's\\;complement = (10^n - 1) - N$

* **Formula:** $10's\\;complement = 9's\\;complement + 1$

* **Example:** Find 9's and 10's complement of $(3456)_{10}$.

**Solution:**
$9's\\;complement = 9999 - 3456 = 6543$
$10's\\;complement = 6543 + 1 = 6544$

---

## Binary Arithmetic

### Binary Addition Rules
- $0 + 0 = 0$
- $0 + 1 = 1$
- $1 + 0 = 1$
- $1 + 1 = 10$ (0, carry 1)
- $1 + 1 + 1 = 11$ (1, carry 1)

* **Example:** Add $(1011)_2 + (1101)_2$.

**Solution:**
$\\;\\;1011$
$+1101$
$------$
$11000$
Result: $(11000)_2 = (24)_{10}$ ✓ [since $11 + 13 = 24$]

### Binary Subtraction Using 2's Complement

**Method:**
1. Find the 2's complement of the subtrahend (number being subtracted)
2. Add it to the minuend
3. If there is a carry out, discard it — the result is positive
4. If there is no carry, take the 2's complement of the result and add a negative sign

* **Example:** Subtract $(0110)_2$ from $(1010)_2$ using 2's complement.

**Solution:**
$A = 1010$, $B = 0110$
$2's\\;complement\\;of\\;B = 1001 + 1 = 1010$
$A + 2's(B) = 1010 + 1010 = 1\\;0100$
Carry out exists → discard it → Result = $0100 = (4)_{10}$
Verify: $10 - 6 = 4$ ✓

* **Example:** Subtract $(1100)_2$ from $(0100)_2$ using 2's complement.

**Solution:**
$A = 0100$, $B = 1100$
$2's\\;complement\\;of\\;B = 0011 + 1 = 0100$
$A + 2's(B) = 0100 + 0100 = 1000$
No carry out → take 2's complement: $0111 + 1 = 1000$
Result = $-1000 = -(8)_{10}$
Verify: $4 - 12 = -8$ ✓

---

## Logic Gates

* **Definition:** A logic gate is a basic building block of any digital circuit. It performs a specific logical operation on one or more binary inputs and produces a single binary output.

### Basic Logic Gates

### AND Gate
- Output is HIGH (1) only when **ALL** inputs are HIGH
- Boolean Expression: $Y = A \\cdot B$

| A | B | Y = A·B |
|---|---|---------|
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

### OR Gate
- Output is HIGH (1) when **ANY** input is HIGH
- Boolean Expression: $Y = A + B$

| A | B | Y = A+B |
|---|---|---------|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 1 |

### NOT Gate (Inverter)
- Output is the **complement** of input
- Boolean Expression: $Y = \\overline{A}$

| A | Y |
|---|---|
| 0 | 1 |
| 1 | 0 |

### Universal Gates

### NAND Gate
- NOT + AND; Output is LOW only when all inputs are HIGH
- Boolean Expression: $Y = \\overline{A \\cdot B}$
- **Universal Gate:** Can implement any logic function

| A | B | Y |
|---|---|---|
| 0 | 0 | 1 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

### NOR Gate
- NOT + OR; Output is HIGH only when all inputs are LOW
- Boolean Expression: $Y = \\overline{A + B}$
- **Universal Gate:** Can implement any logic function

| A | B | Y |
|---|---|---|
| 0 | 0 | 1 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 0 |

### Special Gates

### XOR Gate (Exclusive OR)
- Output is HIGH when inputs are **different**
- Boolean Expression: $Y = A \\oplus B = A\\overline{B} + \\overline{A}B$

| A | B | Y |
|---|---|---|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

### XNOR Gate (Exclusive NOR)
- Output is HIGH when inputs are **same**
- Boolean Expression: $Y = \\overline{A \\oplus B} = AB + \\overline{A}\\overline{B}$

| A | B | Y |
|---|---|---|
| 0 | 0 | 1 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

---

## Boolean Algebra

### Laws and Theorems

**Basic Laws:**
- **Identity Law:** $A + 0 = A$; $A \\cdot 1 = A$
- **Null Law:** $A + 1 = 1$; $A \\cdot 0 = 0$
- **Complement Law:** $A + \\overline{A} = 1$; $A \\cdot \\overline{A} = 0$
- **Idempotent Law:** $A + A = A$; $A \\cdot A = A$
- **Involution Law:** $\\overline{\\overline{A}} = A$

**Commutative Law:**
- $A + B = B + A$
- $A \\cdot B = B \\cdot A$

**Associative Law:**
- $(A + B) + C = A + (B + C)$
- $(A \\cdot B) \\cdot C = A \\cdot (B \\cdot C)$

**Distributive Law:**
- $A \\cdot (B + C) = A \\cdot B + A \\cdot C$
- $A + (B \\cdot C) = (A + B) \\cdot (A + C)$

**Absorption Law:**
- $A + A \\cdot B = A$
- $A \\cdot (A + B) = A$

### De Morgan's Theorems

* **Statement:** Theorem 1: $\\overline{A + B} = \\overline{A} \\cdot \\overline{B}$ (Break the bar, change the sign)

* **Statement:** Theorem 2: $\\overline{A \\cdot B} = \\overline{A} + \\overline{B}$ (Break the bar, change the sign)

> De Morgan's theorems are fundamental for simplifying Boolean expressions and prove that NAND and NOR are universal gates.

---

## SOP and POS Forms

### Sum of Products (SOP)

* **Definition:** SOP form is a Boolean expression that is an OR (sum) of AND (product) terms. Each AND term is called a **minterm** and contains all variables in either true or complemented form.

* **Example:** $F = A\\overline{B}C + AB\\overline{C} + ABC$

**Minterm notation:** Each minterm is denoted as $m_i$ where $i$ is the decimal equivalent.
For 3 variables: $m_0 = \\overline{A}\\overline{B}\\overline{C}$, $m_1 = \\overline{A}\\overline{B}C$, ..., $m_7 = ABC$

$F = \\sum m(5, 6, 7)$ means $F = m_5 + m_6 + m_7$

### Product of Sums (POS)

* **Definition:** POS form is a Boolean expression that is an AND (product) of OR (sum) terms. Each OR term is called a **maxterm** and contains all variables in either true or complemented form.

* **Example:** $F = (A+B+C)(A+\\overline{B}+C)(\\overline{A}+B+C)$

**Maxterm notation:** Each maxterm is denoted as $M_i$.
$F = \\prod M(0, 2, 4)$ means $F = M_0 \\cdot M_2 \\cdot M_4$

### Conversion Between SOP and POS
- $SOP = \\sum m(...)$ and $POS = \\prod M(...)$
- Minterms not in SOP become Maxterms in POS and vice versa
- If $F_{SOP} = \\sum m(1,3,5,7)$ then $F_{POS} = \\prod M(0,2,4,6)$

---

## Karnaugh Map (K-Map)

* **Definition:** A Karnaugh Map (K-Map) is a graphical method for simplifying Boolean expressions. It arranges the minterms in a grid following Gray code order to easily identify groups of adjacent 1s or 0s for simplification.

### Rules for K-Map Simplification
1. Group only 1s (for SOP) or 0s (for POS)
2. Groups must be rectangular and contain $2^n$ cells (1, 2, 4, 8, 16...)
3. Groups should be as large as possible
4. Every 1 must be covered by at least one group
5. The map wraps around (leftmost and rightmost columns are adjacent, top and bottom rows are adjacent)
6. Overlapping groups are allowed
7. Don't-care conditions (X) can be treated as 1 or 0 as convenient

### 2-Variable K-Map

A grid of 4 cells ($2 \\times 2$).

### 3-Variable K-Map

A grid of 8 cells ($2 \\times 4$). Column headers follow Gray code: 00, 01, 11, 10.

* **Example:** Simplify $F(A,B,C) = \\sum m(0,2,4,5,6)$ using K-Map.

**Solution:**

Placing 1s at positions 0, 2, 4, 5, 6 in a 3-variable K-Map:

Column headers (BC): 00, 01, 11, 10

Row 0 (A=0): 1, 0, 0, 1
Row 1 (A=1): 1, 1, 0, 1

Groups:
- Group 1: m(0,2,4,6) — all four corners — gives $\\overline{C}$
- Group 2: m(4,5) — gives $A\\overline{B}$

$F = \\overline{C} + A\\overline{B}$

### 4-Variable K-Map

A grid of 16 cells ($4 \\times 4$). Both row and column headers follow Gray code: 00, 01, 11, 10.

* **Example:** Simplify $F(A,B,C,D) = \\sum m(0,1,2,5,8,9,10)$ using K-Map.

**Solution:**

Column headers (CD): 00, 01, 11, 10
Row headers (AB): 00, 01, 11, 10

Placing 1s and forming groups:
- Group 1: m(0,1,8,9) — gives $\\overline{B}\\overline{C}$
- Group 2: m(0,2,8,10) — gives $\\overline{B}\\overline{D}$
- Group 3: m(5) with m(1) — gives $\\overline{A}\\overline{B}D$ (if no larger group possible)

After proper grouping:
$F = \\overline{B}\\overline{C} + \\overline{B}\\overline{D} + \\overline{A}\\overline{C}D$

---

## Practice Questions

### Conceptual Questions
1. Convert $(157)_{10}$ to binary, octal, and hexadecimal.
2. Convert $(10110110)_2$ to decimal, octal, and hexadecimal.
3. Convert $(1101)_2$ to Gray code and verify by converting back.
4. State and prove De Morgan's theorems using truth tables.
5. Explain the difference between SOP and POS forms with examples.
6. Why are NAND and NOR called universal gates? Show how AND, OR, and NOT can be implemented using only NAND gates.
7. Explain the rules and procedure for K-Map simplification.
8. What is Excess-3 code? Why is it called self-complementary?

### Numerical Problems
1. Perform binary addition: $(11011)_2 + (10110)_2$.
2. Subtract $(1001)_2$ from $(0101)_2$ using 2's complement method.
3. Convert $(65)_{10}$ to BCD and Excess-3 code.
4. Simplify $F(A,B,C) = \\sum m(1,2,3,5,7)$ using K-Map.
5. Simplify $F(A,B,C,D) = \\sum m(0,1,3,5,7,8,9,11,15)$ using 4-variable K-Map.
6. Find the 1's and 2's complement of $(10110100)_2$.
7. Express $F = AB + \\overline{A}C + BC$ in POS form.
8. Convert Gray code $(11001)_G$ to binary.`;
