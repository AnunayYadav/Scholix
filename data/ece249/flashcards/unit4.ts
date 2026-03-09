import { Flashcard } from "../../../types.ts";

export const unit4Flashcards: Flashcard[] = [
    { unit: 4, front: "What is the primary difference between a Combinational and Sequential circuit?", back: "Combinational outputs depend ONLY on present inputs (no memory). Sequential outputs depend on present inputs AND past states (has memory)." },
    { unit: 4, front: "What does a Half Adder do?", back: "It adds two $1$-bit binary numbers and produces a Sum ($S$) and Carry ($C$) without accounting for any previous carry input." },
    { unit: 4, front: "What are the boolean formulas for the Sum and Carry of a Half Adder?", back: "Sum: $S = A \\oplus B$. Carry: $C = A \\cdot B$." },
    { unit: 4, front: "What does a Full Adder do?", back: "It adds three bits: two significant bits ($A$ and $B$) and a carry-in ($C_{in}$) from a previous stage." },
    { unit: 4, front: "What is the boolean formula for the Sum ($S$) in a Full Adder?", back: "The formula is $S = A \\oplus B \\oplus C_{in}$." },
    { unit: 4, front: "How can you build a Full Adder using Half Adders?", back: "A Full Adder can be built using exactly two Half Adders and one OR gate acting on their carry outputs." },
    { unit: 4, front: "What are the Boolean formulas for the Difference ($D$) and Borrow ($Bo$) of a Half Subtractor?", back: "Difference: $D = A \\oplus B$. Borrow: $Bo = \\overline{A} \\cdot B$." },
    { unit: 4, front: "What is the function of a Multiplexer (MUX)?", back: "Also called a data selector, it selects one of $2^n$ input data lines and routes it to a single output line based on $n$ select lines." },
    { unit: 4, front: "For a 4:1 Multiplexer, how many select lines are required?", back: "It requires exactly $2$ select lines ($S_1, S_0$) because $2^2 = 4$ inputs." },
    { unit: 4, front: "What is the boolean expression for a 2:1 MUX with inputs $I_0, I_1$ and select line $S$?", back: "The equation is $Y = \\overline{S} \\cdot I_0 + S \\cdot I_1$." },
    { unit: 4, front: "What is the function of a Demultiplexer (DEMUX)?", back: "Also called a data distributor, it takes a single input and distributes it to one of $2^n$ output lines based on $n$ select lines." },
    { unit: 4, front: "What does a Decoder do?", back: "It converts an $n$-bit binary input into $2^n$ unique output lines, where only one output is active (HIGH) at a time." },
    { unit: 4, front: "How many outputs does a 3-to-8 Decoder have?", back: "It has exactly $8$ output lines ($D_0$ to $D_7$), each representing one minterm of the $3$ input variables." },
    { unit: 4, front: "What is the function of the Enable (E) input on a Decoder?", back: "When the Enable input is inactive ($E = 0$), all outputs of the decoder are forced to $0$ regardless of the input." },
    { unit: 4, front: "What is the difference between an Encoder and a Decoder?", back: "An Encoder converts $2^n$ inputs into an $n$-bit binary code. A Decoder does the exact opposite, converting $n$ bits to $2^n$ outputs." },
    { unit: 4, front: "Why is a Priority Encoder used instead of a standard Encoder?", back: "A standard encoder fails if multiple inputs are HIGH simultaneously. A Priority Encoder resolves this by selecting the highest-priority input." },
    { unit: 4, front: "What is a Magnitude Comparator?", back: "It is a combinational circuit that compares two binary numbers ($A$ and $B$) and determines if $A > B$, $A = B$, or $A < B$." },
    { unit: 4, front: "What is the boolean formula for the equality output ($A = B$) in a 1-bit comparator?", back: "The formula is an XNOR gate: $A_0 \\odot B_0 = A_0 B_0 + \\overline{A_0}\\overline{B_0}$." },
    { unit: 4, front: "What is the boolean formula for the greater-than output ($A > B$) in a 1-bit comparator?", back: "The formula is $A \\cdot \\overline{B}$ ($A$ is $1$ and $B$ is $0$)." },
    { unit: 4, front: "When comparing two 2-bit numbers in a comparator, which bits are checked first?", back: "The Most Significant Bits (MSBs) are checked first. If they are unequal, the result is decided immediately without checking the LSBs." }
];
