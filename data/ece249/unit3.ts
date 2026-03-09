export const unit3Title = "Unit 3: Number Systems and Logic Gates";

export const unit3Body = `# Unit 3: Number Systems and Logic Gates

## Number Systems

**Definition**

A number system is a way to represent numbers using a specific set of symbols. The total number of symbols used is called the "Base" or "Radix".

**Explanation**

Think of the base as the number of fingers an alien might have. We have 10 fingers, so we use Base-10 (Decimal). A computer only has "two fingers" (On and Off switches), so it uses Base-2 (Binary). 

### Types of Number Systems

| Number System | Base | Digits Used | Example |
|---------------|------|-------------|---------|
| Binary | 2 | 0, 1 | $(1010)_2$ |
| Octal | 8 | 0 to 7 | $(752)_8$ |
| Decimal | 10 | 0 to 9 | $(945)_{10}$ |
| Hexadecimal | 16 | 0 to 9, A to F | $(3AF)_{16}$ |

### Positional Notation

**Formula**

For a number $N$ in base $r$ with digits $d$:

$$
N = (d_2 \\times r^2) + (d_1 \\times r^1) + (d_0 \\times r^0)
$$

## Number System Conversions

### Decimal to Binary

**Explanation**

To convert Decimal to Binary (or any other base), keep dividing the number by the new base (2) and write down the remainders. Read the remainders from bottom to top.

**Example**

Convert $(25)_{10}$ to binary.

**Solution**

### Step Method

Step 1 → Divide 25 by 2: Quotient is 12, Remainder is $1$.
Step 2 → Divide 12 by 2: Quotient is 6, Remainder is $0$.
Step 3 → Divide 6 by 2: Quotient is 3, Remainder is $0$.
Step 4 → Divide 3 by 2: Quotient is 1, Remainder is $1$.
Step 5 → Divide 1 by 2: Quotient is 0, Remainder is $1$.

Reading remainders bottom to top: $(25)_{10} = (11001)_2$.

### Binary to Decimal

**Explanation**

Multiply each bit by its positional weight ($2^n$) starting from $n=0$ on the right, and then add them all up.

**Example**

Convert $(1101)_2$ to decimal.

**Solution**

$$
= (1 \\times 2^3) + (1 \\times 2^2) + (0 \\times 2^1) + (1 \\times 2^0)
$$
$$
= 8 + 4 + 0 + 1 = (13)_{10}
$$

### Decimal to Octal

**Example**

Convert $(156)_{10}$ to octal.

**Solution**

$156 \\div 8 = 19$, remainder $4$
$19 \\div 8 = 2$, remainder $3$
$2 \\div 8 = 0$, remainder $2$
Read bottom to top: $(156)_{10} = (234)_8$

### Decimal to Hexadecimal

**Explanation**

Divide by 16. Remember that $10=A, 11=B, 12=C, 13=D, 14=E, 15=F$.

**Example**

Convert $(255)_{10}$ to hexadecimal.

**Solution**

$255 \\div 16 = 15$, remainder $15$ (which is $F$).
$15 \\div 16 = 0$, remainder $15$ (which is $F$).
Read bottom to top: $(255)_{10} = (FF)_{16}$

### Binary to Octal

**Explanation**

Group the binary digits in sets of **3**, starting from the right. Then convert each group into its decimal equivalent. (Add leading zeros on the left if needed).

**Example**

Convert $(110101)_{2}$ to octal.

**Solution**

Groups: $110 \\ | \\ 101$
$110 = 6$
$101 = 5$
Result: $(65)_8$

### Binary to Hexadecimal

**Explanation**

Group the binary digits in sets of **4**, starting from the right. Add leading zeros if necessary. Convert each group.

**Example**

Convert $(10101111)_2$ to hexadecimal.

**Solution**

Groups: $1010 \\ | \\ 1111$
$1010 = 10 = A$
$1111 = 15 = F$
Result: $(AF)_{16}$

**Exam Tip**

Always start grouping bits from the right (Least Significant Bit). If you group from the left, your answer will be completely wrong!

## Codes

### BCD (Binary Coded Decimal)

**Definition**

BCD represents every single decimal digit with its own 4-bit binary group.

**Example**

Convert $(85)_{10}$ to BCD.

**Solution**

Convert 8 into 4 bits: $1000$.
Convert 5 into 4 bits: $0101$.
Result: $(85)_{10} = (1000\\,0101)_{BCD}$.

### Binary to Gray Code

**Definition**

Gray code is a special code where only one bit changes between consecutive numbers. This helps reduce errors in digital communication.

**Explanation**

To convert Binary to Gray:
1. The first bit (Leftmost) stays the same.
2. For the next bits, XOR the current binary bit with the previous binary bit. (Different = 1, Same = 0)

**Example**

Convert binary $(1011)_2$ to Gray.

**Solution**

1st bit = $1$.
2nd bit = $1 \\oplus 0 = 1$.
3rd bit = $0 \\oplus 1 = 1$.
4th bit = $1 \\oplus 1 = 0$.
Gray Code = $(1110)_G$.

### Gray to Binary Code

**Explanation**

To convert Gray to Binary:
1. The first bit (Leftmost) stays the same.
2. For the next bits, XOR the current Gray bit with the **previous Binary bit** you just found.

**Example**

Convert Gray $(1010)_G$ to Binary.

**Solution**

1st Binary = $1$.
2nd Binary = $0 \\oplus 1 = 1$.
3rd Binary = $1 \\oplus 1 = 0$.
4th Binary = $0 \\oplus 0 = 0$.
Binary = $(1100)_2$.

### Excess-3 Code

**Definition**

Excess-3 code is found by simply adding 3 (which is $0011$ in binary) to each BCD digit.

**Formula**

$$
\\text{Excess-3} = \\text{BCD} + 0011
$$

**Example**

Convert $(4)_{10}$ to Excess-3 code.

**Solution**

The BCD for $4$ is $0100$.
Add 3 ($0011$): $0100 + 0011 = 0111$.
Result = $0111$.

## Complements

**Definition**

Complements are used in computers to represent negative numbers and to perform subtraction using an addition circuit.

### 1's Complement

**Definition**

To find the 1's complement of a binary number, just flip every bit. Change all 0s to 1s, and all 1s to 0s.

**Example**

Find the 1's complement of $(1010)_2$.

**Solution**

$1\\text{'s complement} = 0101$.

### 2's Complement

**Definition**

To find the 2's complement, find the 1's complement and then add 1 to the result.

**Formula**

$$
2\\text{'s complement} = 1\\text{'s complement} + 1
$$

**Example**

Find the 2's complement of $(1010)_2$.

**Solution**

Step 1: 1's complement = $0101$.
Step 2: Add 1: $0101 + 1 = 0110$.
Result = $0110$.

### 9's and 10's Complement

**Definition**

Used for decimal numbers. The 9's complement is found by subtracting each digit from 9. The 10's complement is 9's complement plus 1.

**Example**

Find 9's and 10's complement of $(34)_{10}$.

**Solution**

9's complement = $99 - 34 = 65$.
10's complement = $65 + 1 = 66$.

## Binary Arithmetic

### Binary Addition Rule

**Rules**
- $0 + 0 = 0$
- $0 + 1 = 1$
- $1 + 0 = 1$
- $1 + 1 = 10$ (Write 0, carry 1 to next column)
- $1 + 1 + 1 = 11$ (Write 1, carry 1)

**Example**

Add $(101)_2 + (011)_2$.

**Solution**

  101
+ 011
------
 1000

Result is $(1000)_2$.

### Binary Subtraction Using 2's Complement

**Explanation**

Computers don't like subtracting. Instead of $A - B$, they calculate $A + (-B)$. The negative form of $B$ is its 2's complement.

**Example**

Subtract $(0110)_2$ from $(1010)_2$.

**Solution**

### Step Method

Step 1 → Find 2's complement of the number to subtract (0110).
  1's comp = 1001.
  2's comp = 1001 + 1 = 1010.
Step 2 → Add this 2's complement to the first number.
  1010 + 1010 = 1 0100.
Step 3 → Look at the carry. There is a 5th bit (carry out of 1). Discard the carry.
Step 4 → Final Answer is $0100$.

**Exam Tip**

If there is NO carry bit at the end, the result is negative. You must take the 2's complement of the result and put a minus sign in front of it!

## Logic Gates

**Definition**

A logic gate is a basic building block of a digital circuit that performs a logical operation.

### Basic Logic Gates

### AND Gate

**Explanation**

Output is 1 ONLY if BOTH inputs are 1. Think of two switches in series.

**Formula**

$$
Y = A \\cdot B
$$

### OR Gate

**Explanation**

Output is 1 if AT LEAST ONE input is 1. Think of two switches in parallel.

**Formula**

$$
Y = A + B
$$

### NOT Gate (Inverter)

**Explanation**

Output is the opposite of the input.

**Formula**

$$
Y = \\overline{A}
$$

### Universal Gates

**Definition**

NAND and NOR are called Universal Gates because you can build ANY other logic gate using only NAND gates or only NOR gates.

### NAND Gate

**Explanation**

It is an AND gate followed by a NOT gate. Output is 0 ONLY if BOTH inputs are 1.

**Formula**

$$
Y = \\overline{A \\cdot B}
$$

### NOR Gate

**Explanation**

It is an OR gate followed by a NOT gate. Output is 1 ONLY if BOTH inputs are 0.

**Formula**

$$
Y = \\overline{A + B}
$$

### Special Gates

### XOR Gate (Exclusive OR)

**Explanation**

Output is 1 if inputs are DIFFERENT (one is 1, the other is 0).

**Formula**

$$
Y = A \\oplus B = A\\overline{B} + \\overline{A}B
$$

### XNOR Gate (Exclusive NOR)

**Explanation**

Output is 1 if inputs are the SAME (both 1 or both 0).

**Formula**

$$
Y = \\overline{A \\oplus B}
$$

## Boolean Algebra

**Definition**

Boolean algebra is the mathematics of digital logic. We use laws to simplify large logic circuits into smaller, cheaper ones.

### Boolean Laws

- **Identity Law:** $A + 0 = A$ ; $A \\cdot 1 = A$
- **Null Law:** $A + 1 = 1$ ; $A \\cdot 0 = 0$
- **Complement Law:** $A + \\overline{A} = 1$ ; $A \\cdot \\overline{A} = 0$
- **Idempotent Law:** $A + A = A$ ; $A \\cdot A = A$

### De Morgan's Theorems

**Definition**

De Morgan's Theorems are the most important tools for simplifying expressions with a "bar" over the whole equation. 

**Formula**

Theorem 1 (Break the bar, change the sign):
$$
\\overline{A + B} = \\overline{A} \\cdot \\overline{B}
$$

Theorem 2 (Break the bar, change the sign):
$$
\\overline{A \\cdot B} = \\overline{A} + \\overline{B}
$$

## SOP and POS Forms

### Sum of Products (SOP)

**Definition**

SOP is an expression where AND terms (Products) are ORed (Summed) together. For example: $AB + CD$. It focuses on the 1s in a truth table.

### Product of Sums (POS)

**Definition**

POS is an expression where OR terms (Sums) are ANDed (Multiplied) together. For example: $(A+B)(C+D)$. It focuses on the 0s in a truth table.

**Exam Tip**

A fast way to convert SOP to POS: any missing number in the SOP minterms (like 0, 2, 4 if it's a 3-variable system) becomes the maxterms for POS.

## Karnaugh Map (K-Map)

**Definition**

A K-Map is a visual table used to quickly simplify Boolean expressions without using complex algebra laws.

### Rules for K-Map

1. Only group 1s (for SOP).
2. Group sizes MUST be powers of 2 (1, 2, 4, 8, 16 cells). Cannot group 3 or 6 cells!
3. Groups must be rectangles or squares.
4. Try to make the largest groups possible.
5. The map wraps around (the far right wraps to the far left).

**Explanation**

Think of playing a game of Tetris where you want to cover all the 1s using the fewest number of large rectangle blocks.

### K-Map Variable Sizes

- **2-Variable:** 4 cells.
- **3-Variable:** 8 cells. (Headers are 00, 01, 11, 10). Notice 11 comes BEFORE 10 to maintain Gray Code order!
- **4-Variable:** 16 cells. 

### Common Mistakes

- Writing headers as 00, 01, 10, 11 instead of 00, 01, 11, 10. This breaks the K-Map rule (only one bit can change at a time).

## Quick Revision

| Concept | Key Point |
|---------|-----------|
| Binary Base | 2 |
| Hexadecimal Base | 16 |
| BCD | 4 bits per decimal digit |
| 2's Complement | 1's Complement + 1 |
| Universal Gates | NAND and NOR |
| De Morgan 1 | $\\overline{A+B} = \\overline{A} \\cdot \\overline{B}$ |
| K-Map Box Sizes | 1, 2, 4, 8, 16 |

## Final Summary Table

| Gate | Boolean Expression | Output is 1 when... |
|------|--------------------|---------------------|
| AND | $A \\cdot B$ | Both inputs are 1 |
| OR | $A + B$ | Any input is 1 |
| NOT | $\\overline{A}$ | Input is 0 |
| XOR | $A \\oplus B$ | Inputs are different |
| XNOR | $\\overline{A \\oplus B}$ | Inputs are same |

## Self Assessment

1 Convert $(27)_{10}$ to binary and hex.
2 Add the binary numbers $(1101)_2$ and $(1011)_2$.
3 What makes a NAND gate "Universal"?
4 State De Morgan's two theorems.
5 List the rules for grouping 1s in a Karnaugh Map.
`;
