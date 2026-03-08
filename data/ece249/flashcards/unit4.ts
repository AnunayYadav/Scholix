import { Flashcard } from "../../../types.ts";

export const unit4Flashcards: Flashcard[] = [
    { unit: 4, front: "What is a Combinational Logic Circuit?", back: "Digital circuits whose outputs strictly depend ONLY on the current input values. They have no memory." },
    { unit: 4, front: "What does a Half-Adder do?", back: "Adds exactly two 1-bit numbers. Outputs: Sum (A ⊕ B) and Carry (A . B)." },
    { unit: 4, front: "Why are Half-Adders limited?", back: "They cannot accept a carry-in from a previous or lower significant addition bit column." },
    { unit: 4, front: "What does a Full-Adder do?", back: "Adds three 1-bit numbers (A, B, and a Carry-In). Outputs: Sum (A ⊕ B ⊕ Cin) and Carry-Out." },
    { unit: 4, front: "How many Half-Adders make a Full-Adder?", back: "Two Half-Adders cascaded with an extra OR gate for the carries." },
    { unit: 4, front: "What does an XOR gate compute in Arithmetic Circuits?", back: "The 'Sum' or 'Difference'. S = A ⊕ B." },
    { unit: 4, front: "What does an Inverter (NOT) compute in Arithmetic Circuits?", back: "Because it subtracts, a Half-Subtractor 'Borrow' output uses A'. (Borrow = A' . B)." },
    { unit: 4, front: "What is a Multiplexer (MUX)?", back: "A 'Data Selector'. It merges `2^n` input lines to exactly ONE output line based on `n` select lines." },
    { unit: 4, front: "Think of an analogy for a MUX.", back: "A traffic cop at a toll both, merging a dense multi-lane highway down to one toll lane." },
    { unit: 4, front: "How many select lines does an 8x1 MUX need?", back: "3 select lines. (Since 2^3 = 8)." },
    { unit: 4, front: "What is a De-multiplexer (DEMUX)?", back: "A 'Data Distributor'. It routes ONE input line to one of `2^n` output lines based on `n` select lines." },
    { unit: 4, front: "What does an n-to-2^n Decoder do?", back: "Converts binary data on `n` input lines to activate a specific line among max `2^n` unique output lines." },
    { unit: 4, front: "What does a 2^n-to-n Encoder do?", back: "The inverse of Decoder! Generates the `n`-bit binary code for whichever single `2^n` input line is actively HIGH." },
    { unit: 4, front: "What solves the issue of multiple inputs in Encoders?", back: "A Priority Encoder. It exclusively outputs the highest priority active input's binary code if a collision occurs." },
    { unit: 4, front: "What is a Magnitude Comparator?", back: "A combinational circuit that determines relative magnitudes of numbers (A and B). Outputs: `A > B`, `A = B`, `A < B`." },
    { unit: 4, front: "Which gate determines Equality (A=B) in a Comparator?", back: "The XNOR Gate. HIGH output exactly when both inputs are identical." },
    { unit: 4, front: "What checks does a 2-bit Comparator perform sequentially?", back: "Strictly compares MSBs (Most Significant Bits) first. Only if MSBs are identical will it look at the LSBs." }
];
