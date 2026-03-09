import { Flashcard } from "../../../types.ts";

export const unit6Flashcards: Flashcard[] = [
    { unit: 6, front: "What is the primary function of a Register in digital electronics?", back: "A register is a group of flip-flops used to store a binary word (multiple bits of data). An $n$-bit register uses $n$ flip-flops." },
    { unit: 6, front: "What is a Shift Register?", back: "A register in which stored data can be shifted (moved) from one flip-flop to the next (left or right) at each clock pulse." },
    { unit: 6, front: "In a Right Shift operation, in which direction do the bits move?", back: "Bits move from left to right (from MSB towards LSB direction). New data enters the leftmost flip-flop." },
    { unit: 6, front: "What does SISO stand for, and what is its operational characteristic?", back: "Serial In Serial Out. Data is entered one bit at a time and shifted out one bit at a time. It requires $n$ clocks to load $n$ bits." },
    { unit: 6, front: "Which type of shift register is ideal for converting serial data into parallel data?", back: "SIPO (Serial In Parallel Out) shift register." },
    { unit: 6, front: "How many clock pulses are required to load $n$ bits of data into a PISO or PIPO shift register?", back: "Just $1$ clock pulse, because data is loaded in parallel simultaneously." },
    { unit: 6, front: "Which is the fastest type of shift register mode and what is its typical application?", back: "PIPO (Parallel In Parallel Out), typically used as a buffer or temporary storage register." },
    { unit: 6, front: "What does the 'Modulus' (Mod) of a counter signify?", back: "The modulus is the total number of unique states in the counter's predetermined sequence. A Mod-$N$ counter counts from $0$ to $N-1$." },
    { unit: 6, front: "How many flip-flops $n$ are minimally required to design a counter with Modulus $N$?", back: "The mathematical condition is $n = \\lceil \\log_2 N \\rceil$, meaning $2^n \\ge N$." },
    { unit: 6, front: "What is the primary characteristic of an Asynchronous (Ripple) Counter?", back: "Flip-flops do NOT share a common clock. The output of one flip-flop acts as the clock trigger for the subsequent flip-flop." },
    { unit: 6, front: "What is the major disadvantage of an Asynchronous (Ripple) Counter?", back: "Accumulated propagation delay (rippling effect) limits its maximum frequency and can cause temporary glitches in the output." },
    { unit: 6, front: "How does a Synchronous Counter solve the propagation delay issue?", back: "All flip-flops in a synchronous counter are triggered simultaneously by the exact same clock signal." },
    { unit: 6, front: "To design a 3-bit Asynchronous UP counter using T flip-flops, how are the variables connected?", back: "All inputs $T = 1$. Each flip-flop is clocked by the normal output ($Q$) of the strictly preceding one, triggering on falling edges." },
    { unit: 6, front: "How is an Asynchronous Mod-N counter forced to reset at exactly $N$?", back: "By using combinational logic (usually a NAND gate) to detect the exact binary state $N$ and pulsing the asynchronous CLEAR inputs of the flip-flops." },
    { unit: 6, front: "In a Synchronous UP Counter, what is the logical rule to toggle flip-flop $i$ ($T_i$)?", back: "Flip-flop $i$ toggles only when all previous lower-order flip-flops are $1$. Thus, $T_i = Q_0 \\cdot Q_1 \\cdot Q_2 \\cdot ... \\cdot Q_{i-1}$." },
    { unit: 6, front: "What defines a Ring Counter?", back: "It's a shift register configured in a closed loop, where the output of the final flip-flop is directly fed back to the input of the first. Only a single $1$ circulates." },
    { unit: 6, front: "What is the Modulus of an $n$-bit Ring Counter?", back: "The Modulus is exactly $n$. It is computationally inefficient regarding state utilization but requires absolutely no decoding logic." },
    { unit: 6, front: "How does a Johnson Ring Counter (Twisted Ring Counter) structurally differ from a standard Ring Counter?", back: "The COMPLEMENTED output of the last flip-flop ($\\overline{Q_{last}}$) is fed back to the exact input of the first flip-flop." },
    { unit: 6, front: "What is the Modulus of a standard $n$-bit Johnson Counter?", back: "The Modulus is exactly $2n$. It fully doubles the number of states compared directly to a standard Ring Counter using identical hardware." },
    { unit: 6, front: "How many logic gates are mathematically required to decode every individual distinct state of an $n$-bit Johnson Counter?", back: "Each and every specific state strictly requires only a straightforward 2-input AND gate to decode logically properly." }
];
