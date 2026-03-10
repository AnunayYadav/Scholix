import { QuizQuestion } from "../../../types.ts";

export const ece249Unit3Subjective: QuizQuestion[] = [
    {
        unit: 3,
        type: 'subjective',
        question: "Explain the importance of the Radix (Base) in different number systems like Binary, Octal, and Hexadecimal.",
        explanation: "The Radix or Base defines the total number of unique digits used in a number system. Binary (Base 2) uses 2 digits (0, 1), making it ideal for electronic switches. Octal (Base 8) uses 8 digits (0-7), and Hexadecimal (Base 16) uses 16 digits (0-9, A-F). These higher bases are used as 'shorthand' to represent long binary strings concisely in computing.",
        difficulty: 'easy',
        topic: 'Number Systems'
    },
    {
        unit: 3,
        type: 'subjective',
        question: "Describe the process of converting a fractional decimal number (e.g., 0.625) into its binary equivalent.",
        explanation: "To convert a fraction, repeatedly multiply the fractional part by the target base (2). Record the integer part of the result as the binary bit (from MSB to LSB). Example: $0.625 \\times 2 = 1.25$ (Bit 1), then $0.25 \\times 2 = 0.5$ (Bit 0), then $0.5 \\times 2 = 1.0$ (Bit 1). Stop when the fraction becomes zero. Thus, $(0.625)_{10} = (0.101)_2$.",
        difficulty: 'medium',
        topic: 'Number Systems'
    },
    {
        unit: 3,
        type: 'subjective',
        question: "What is BCD (Binary Coded Decimal)? How does it differ from straight binary representation?",
        explanation: "BCD represents each individual decimal digit (0-9) using a fixed 4-bit binary group (8421 code). In straight binary, the entire decimal value is converted as a whole. For example, $(12)_{10}$ is $(1100)_2$ in binary, but $(0001\\ 0010)_{BCD}$ in BCD. BCD is easier for human-interface devices like 7-segment displays but less efficient for calculations.",
        difficulty: 'medium',
        topic: 'Number Systems'
    },
    {
        unit: 3,
        type: 'subjective',
        question: "Explain the concept of 'Universal Gates'. Why are NAND and NOR classified as such?",
        explanation: "A universal gate is a logic gate that can be used to implement any Boolean function without needing any other type of gate. NAND and NOR are classified as universal because they can be configured to act as AND, OR, and NOT gates. This simplifies manufacturing, as a single chip type can implement an entire complex logic circuit.",
        difficulty: 'medium',
        topic: 'Logic Gates'
    },
    {
        unit: 3,
        type: 'subjective',
        question: "State and prove De Morgan's First and Second Laws using Truth Tables.",
        explanation: "First Law: The complement of an OR sum is equal to the AND product of the complements ($\\overline{A+B} = \\overline{A} \\cdot \\overline{B}$). Second Law: The complement of an AND product is equal to the OR sum of the complements ($\\overline{A \\cdot B} = \\overline{A} + \\overline{B}$). These laws are proven by showing that for all combinations of A and B, both sides of the equations yield identical columns in a truth table.",
        difficulty: 'hard',
        topic: 'Boolean Algebra'
    },
    {
        unit: 3,
        type: 'subjective',
        question: "Discuss the advantages of Gray code over standard binary in mechanical digital systems like rotary encoders.",
        explanation: "In standard binary, multiple bits can change simultaneously between successive values (e.g., $011 \\rightarrow 100$ changes 3 bits). If these sensors trigger at slightly different times, the system might read a completely wrong intermediate value. In Gray code, only one bit changes at a time, preventing such 'glitch' errors and ensuring reliability in physical position sensing.",
        difficulty: 'medium',
        topic: 'Number Systems'
    },
    {
        unit: 3,
        type: 'subjective',
        question: "What is a 'Don't Care' condition in a Karnaugh Map, and how is it used during simplification?",
        explanation: "A 'Don't Care' condition ($X$) occurs when the output of a function is irrelevant for certain input combinations (signals that never occur or don't affect output). In a K-map, an $X$ can be treated as either a $1$ or a $0$ to help form the largest possible groups of cells, thereby leading to the simplest possible Boolean expression.",
        difficulty: 'medium',
        topic: 'Karnaugh Map (K-Map)'
    },
    {
        unit: 3,
        type: 'subjective',
        question: "Explain the difference between the SOP (Sum of Products) and POS (Product of Sums) forms of Boolean expressions.",
        explanation: "SOP form is the ORing of multiple AND terms (e.g., $AB + CD$). It is based on identifying '1's in the truth table. POS form is the ANDing of multiple OR terms (e.g., $(A+B)(C+D)$) and is based on identifying '0's. SOP usually results in simpler circuits using NAND-NAND logic, while POS is often suited for NOR-NOR logic.",
        difficulty: 'medium',
        topic: 'SOP and POS Forms'
    },
    {
        unit: 3,
        type: 'subjective',
        question: "Describe the steps involved in simplifying a 4-variable logic function using a Karnaugh Map.",
        explanation: "1. Plot the truth table values into the 16 cells of the K-map. 2. Group adjacent 1s into the largest possible rectangles of size $2^n$ (1, 2, 4, 8, 16). 3. Groups can wrap around edges. 4. For each group, identify which variables remain constant across all cells. 5. OR these constant variables to form the final simplified SOP expression.",
        difficulty: 'hard',
        topic: 'Karnaugh Map (K-Map)'
    },
    {
        unit: 3,
        type: 'subjective',
        question: "Explain sign-magnitude and 2's complement representation for signed binary numbers.",
        explanation: "Sign-magnitude uses the MSB as a sign bit (0 for +, 1 for -) and the rest for magnitude. However, it allows for 'negative zero' and makes arithmetic complex. 2's complement is the standard: a negative number is the binary inverse plus 1. This allows subtraction to be performed as addition and has a single representation for zero.",
        difficulty: 'hard',
        topic: 'Binary Arithmetic'
    },
    {
        unit: 3,
        type: 'subjective',
        question: "How do you implement an OR gate using only NAND gates?",
        explanation: "According to De Morgan's law ($A+B = \\overline{\\overline{A} \\cdot \\overline{B}}$), you first invert the inputs A and B using NAND gates as inverters. Then, you feed these inverted signals ($\\overline{A}$ and $\\overline{B}$) into a third NAND gate. The result is the logical OR of A and B.",
        difficulty: 'medium',
        topic: 'Logic Gates'
    },
    {
        unit: 3,
        type: 'subjective',
        question: "Define the term 'Minterm' and explain how a Canonical SOP expression is formed.",
        explanation: "A minterm is a product term that contains every variable of a function exactly once (either in normal or complemented form). For a truth table, each combination that results in a '1' is a minterm. The Sum of Products formed by ORing all such minterms is called the Canonical (or Standard) SOP expression.",
        difficulty: 'medium',
        topic: 'SOP and POS Forms'
    },
    {
        unit: 3,
        type: 'subjective',
        question: "Discuss the Excess-3 code and its 'self-complementing' property.",
        explanation: "Excess-3 is an unweighted code where each BCD digit is increased by 3. It is self-complementing, meaning the bitwise 1's complement of an Excess-3 number is equal to the Excess-3 representation of its 9's complement (e.g., Excess-3 2 is 0101, its complement is 1010, which is Excess-3 7). This simplifies subtraction in decimal processors.",
        difficulty: 'hard',
        topic: 'Number Systems'
    },
    {
        unit: 3,
        type: 'subjective',
        question: "Explain the XOR (Exclusive-OR) logic function and its applications.",
        explanation: "XOR outputs HIGH only if the two inputs are different ($01$ or $10$). Its Boolean expression is $A\\overline{B} + \\overline{A}B$. Applications include: binary addition (the Sum bit of a Half Adder), parity checking, inequality detectors, and simple data encryption (XOR cipher).",
        difficulty: 'easy',
        topic: 'Logic Gates'
    },
    {
        unit: 3,
        type: 'subjective',
        question: "Describe the 'Grouping' rules in K-Map simplification.",
        explanation: "1. Groups must contain $2^n$ cells. 2. Groups must be rectangular or square. 3. Groups can overlap. 4. Wrap-around (top-bottom, left-right) is allowed. 5. Include all $1$s in at least one group. 6. Use the fewest and largest groups possible to achieve maximum simplicity.",
        difficulty: 'medium',
        topic: 'Karnaugh Map (K-Map)'
    },
    {
        unit: 3,
        type: 'subjective',
        question: "What is an 'Essential Prime Implicant' in the context of K-Map simplification?",
        explanation: "A Prime Implicant is a group of cells that cannot be combined into any larger group. An Essential Prime Implicant is a prime implicant that contains at least one '1' that is not covered by any other prime implicant. Essential prime implicants must be included in the final simplified expression.",
        difficulty: 'hard',
        topic: 'Karnaugh Map (K-Map)'
    },
    {
        unit: 3,
        type: 'subjective',
        question: "Explain the procedure for Binary Multiplication.",
        explanation: "Binary multiplication follows the same logic as decimal: multiply the multiplicand by each bit of the multiplier (resulting in partial products offset by one position). Effectively, if the multiplier bit is 1, copy the multiplicand; if 0, write zeros. Finally, perform binary addition of all partial products to get the result.",
        difficulty: 'medium',
        topic: 'Binary Arithmetic'
    },
    {
        unit: 3,
        type: 'subjective',
        question: "Compare the BCD and Hamming codes briefly.",
        explanation: "BCD (Binary Coded Decimal) is a character representation code used to encode decimal numbers for display or calculation. Hamming code is an error-correcting code that adds redundant 'parity bits' to a data word, allowing the system to detect and fix single-bit errors during transmission.",
        difficulty: 'hard',
        topic: 'Number Systems'
    },
    {
        unit: 3,
        type: 'subjective',
        question: "Define the term 'Maxterm' and explain its relation to POS form.",
        explanation: "A Maxterm is a sum term (OR logic) containing every variable of a function once. For a truth table, each combination resulting in a '0' is a maxterm. Product of Sums (POS) is formed by ANDing all these maxterms, creating an expression that is zero only for those specific input combinations.",
        difficulty: 'medium',
        topic: 'SOP and POS Forms'
    },
    {
        unit: 3,
        type: 'subjective',
        question: "Discuss the 1's and 2's complement of the binary number $(1101)_2$.",
        explanation: "1's complement of $(1101)_2$ is $(0010)_2$ (invert all bits). 2's complement is 1's complement $+ 1$: $(0010 + 0001) = (0011)_2$. 2's complement is preferred in hardware because it eliminates the 'negative zero' issue and simplifies adder-subtractor circuit design.",
        difficulty: 'easy',
        topic: 'Binary Arithmetic'
    }
];
