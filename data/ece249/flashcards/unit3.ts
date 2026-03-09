import { Flashcard } from "../../../types.ts";

export const unit3Flashcards: Flashcard[] = [
    { unit: 3, front: "What are the allowed digits and base for the Hexadecimal number system?", back: "The base is $16$ and the allowed digits are $0-9$ and $A-F$." },
    { unit: 3, front: "How do you systematically convert a decimal decimal integer to binary?", back: "By repeatedly dividing the decimal number by $2$ and recording the remainders from bottom to top." },
    { unit: 3, front: "How many binary bits are required to represent one Octal digit?", back: "You need exactly $3$ bits to represent one octal digit (from $000$ to $111$)." },
    { unit: 3, front: "How many binary bits are required to represent one Hexadecimal digit?", back: "You need exactly $4$ bits to represent one hexadecimal digit (from $0000$ to $1111$)." },
    { unit: 3, front: "What is BCD (Binary Coded Decimal)?", back: "BCD represents each individual decimal digit ($0-9$) using its $4$-bit binary equivalent." },
    { unit: 3, front: "What is the defining characteristic of Gray Code?", back: "It is a binary numeral system where two successive values differ in only one bit, useful for error detection." },
    { unit: 3, front: "How do you convert Binary to Gray Code?", back: "Keep the MSB the same. Then, XOR each binary bit with the previous binary bit ($G_i = B_i \\oplus B_{i+1}$)." },
    { unit: 3, front: "How is Excess-3 Code generated from BCD?", back: "By adding $3$ (binary $0011$) to the $4$-bit BCD representation of each decimal digit." },
    { unit: 3, front: "How do you find the 2's Complement of a binary number?", back: "First find the 1's complement by inverting all bits, then add $1$ to it ($2's = 1's + 1$)." },
    { unit: 3, front: "What is the output of an AND Gate?", back: "The output is HIGH ($1$) only if ALL inputs are HIGH ($1$). Boolean expression: $Y = A \\cdot B$." },
    { unit: 3, front: "What is the output of an OR Gate?", back: "The output is HIGH ($1$) if ANY input is HIGH ($1$). Boolean expression: $Y = A + B$." },
    { unit: 3, front: "Which two logic gates are known as Universal Gates?", back: "NAND and NOR gates are universal because any logic circuit can be built using only them." },
    { unit: 3, front: "What is the output of an XOR (Exclusive OR) Gate?", back: "The output is HIGH ($1$) only when the inputs are DIFFERENT. $Y = A \\oplus B = A\\overline{B} + \\overline{A}B$." },
    { unit: 3, front: "What is the Absorption Law in Boolean Algebra?", back: "The equations are $A + A \\cdot B = A$ and $A \\cdot (A + B) = A$." },
    { unit: 3, front: "State De Morgan's First Theorem.", back: "The complement of a sum equals the product of the complements: $\\overline{A + B} = \\overline{A} \\cdot \\overline{B}$." },
    { unit: 3, front: "State De Morgan's Second Theorem.", back: "The complement of a product equals the sum of the complements: $\\overline{A \\cdot B} = \\overline{A} + \\overline{B}$." },
    { unit: 3, front: "What is SOP (Sum of Products) Form?", back: "It is an OR (sum) of AND (product) terms. Each AND term containing all variables is called a minterm." },
    { unit: 3, front: "What is POS (Product of Sums) Form?", back: "It is an AND (product) of OR (sum) terms. Each OR term containing all variables is called a maxterm." },
    { unit: 3, front: "What is a Karnaugh Map (K-Map)?", back: "A graphical method for simplifying Boolean expressions by arranging minterms in a Gray code grid to find adjacent 1s." },
    { unit: 3, front: "In a K-Map, what are 'Don't-care' conditions?", back: "Inputs that will never occur or whose outputs don't matter, typically marked with 'X'. They can be treated as $1$ or $0$ to maximize grouping." }
];
