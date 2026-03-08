import { Flashcard } from "../../../types.ts";

export const unit3Flashcards: Flashcard[] = [
    { unit: 3, front: "What are the common Number Systems Bases?", back: "Decimal (Base-10), Binary (Base-2), Octal (Base-8), Hexadecimal (Base-16)." },
    { unit: 3, front: "How do you convert from Decimal to Binary?", back: "Divide and rise: Successively divide by 2, record the remainders, read bottom to top (MSB to LSB)." },
    { unit: 3, front: "How do you convert Binary to Decimal?", back: "Multiply and add: Multiply each digit by the base raised to its position power (from power 0)." },
    { unit: 3, front: "What is BCD (Binary Coded Decimal)?", back: "Represents each single decimal digit (0-9) using exactly 4 binary bits (e.g., 19 = 0001 1001)." },
    { unit: 3, front: "What is Excess-3 (XS-3) Code?", back: "A self-complementing code where you add '3' (binary 0011) to a standard BCD number." },
    { unit: 3, front: "What is Gray Code primarily used for?", back: "Mechanical encoders! Adjacent binary values differ by only a SINGLE bit at a time, to prevent massive error spikes." },
    { unit: 3, front: "How do you compute the 1's Complement?", back: "Invert all bits (`0` becomes `1`, and `1` becomes `0`)." },
    { unit: 3, front: "How do you compute the 2's Complement?", back: "Take the 1's Complement and simply add `1` to the LSB." },
    { unit: 3, front: "Why are complements used in computers?", back: "To simplify subtraction inside a CPU, effectively turning it into a simple addition problem." },
    { unit: 3, front: "What is logic gate AND?", back: "Output is HIGH only when ALL inputs are HIGH. Example: A . B." },
    { unit: 3, front: "What is logic gate OR?", back: "Output is HIGH when ANY input is HIGH. Example: A + B." },
    { unit: 3, front: "What are Universal Logic Gates?", back: "NAND and NOR gates. You can construct *ANY* other logic gate using only these!" },
    { unit: 3, front: "How does the XOR Gate (Exclusive OR) work?", back: "Output is HIGH (1) only when the inputs are DIFFERENT. It acts as an 'inequality detector'." },
    { unit: 3, front: "What is De Morgan's Law for NAND?", back: "(A . B)' = A' + B' (NAND equals a Bubbled OR)." },
    { unit: 3, front: "What is De Morgan's Law for NOR?", back: "(A + B)' = A' . B' (NOR equals a Bubbled AND)." },
    { unit: 3, front: "What is SOP (Sum of Products)?", back: "An expression where AND-ed clusters are joined by ORs (e.g., AB + CD). Focuses on output '1s' (Minterms)." },
    { unit: 3, front: "What is POS (Product of Sums)?", back: "An expression where OR-ed clusters are joined by ANDs (e.g., (A+B)(C+D)). Focuses on output '0s' (Maxterms)." },
    { unit: 3, front: "What is a K-Map (Karnaugh Map)?", back: "A graphical grid used to highly simplify Boolean expressions quickly. Uses Gray Code edge ordering (00, 01, 11, 10)." },
    { unit: 3, front: "What rule governs grouping in a K-Map?", back: "Group adjacent '1s' in powers of two (2, 4, 8, 16 cells). Finding larger groups eliminates more variables." },
    { unit: 3, front: "Can groups wrap around the edges in a K-Map?", back: "Yes! Top edge is adjacent to bottom, left edge adjacent to right. Like a physical donut/torus." }
];
