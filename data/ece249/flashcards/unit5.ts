import { Flashcard } from "../../../types.ts";

export const unit5Flashcards: Flashcard[] = [
    { unit: 5, front: "What is the defining characteristic of a Sequential Logic Circuit compared to a Combinational one?", back: "Sequential circuits possess memory elements; their output depends on both present inputs AND the past state." },
    { unit: 5, front: "What is the primary operational difference between a Latch and a Flip-Flop?", back: "A Latch is level-triggered (transparent when enabled). A Flip-Flop is edge-triggered (changes state only at clock transitions)." },
    { unit: 5, front: "In an SR Latch constructed using NOR gates, what happens when $S = 1$ and $R = 1$?", back: "This is the invalid/forbidden condition because both outputs ($Q$ and $\\overline{Q}$) try to become $0$, leading to an unpredictable final state." },
    { unit: 5, front: "What is the Characteristic Equation for an SR Latch or Flip-Flop?", back: "The equation is $Q_{n+1} = S + \\overline{R} \\cdot Q_n$, completely restricted by the condition $S \\cdot R = 0$." },
    { unit: 5, front: "How does a D Latch eliminate the invalid state of an SR Latch?", back: "It uses a single data input ($D$) connected directly to $S$, and inverted ($\\overline{D}$) to $R$, ensuring $S$ and $R$ are never logically equal." },
    { unit: 5, front: "What is the Characteristic Equation for a JK Flip-Flop?", back: "The equation is $Q_{n+1} = J\\overline{Q_n} + \\overline{K}Q_n$." },
    { unit: 5, front: "What happens in a JK Flip-Flop when both $J = 1$ and $K = 1$?", back: "The output uniquely toggles (complements its current state: $Q_{n+1} = \\overline{Q_n}$)." },
    { unit: 5, front: "What is the 'Race-Around Condition' in a JK Flip-Flop?", back: "When $J=1$ and $K=1$, if the clock pulse is too long, the output repeatedly toggles, creating unpredictable oscillation." },
    { unit: 5, front: "What architectural design explicitly solves the Race-Around Condition?", back: "The Master-Slave Flip-Flop configuration, which utilizes two flip-flops clocked on completely opposite edges." },
    { unit: 5, front: "What is the Characteristic Equation for a D Flip-Flop?", back: "The equation is simply $Q_{n+1} = D$. The output definitively follows the input precisely at the active clock edge." },
    { unit: 5, front: "What is the Characteristic Equation for a T (Toggle) Flip-Flop?", back: "The equation is $Q_{n+1} = T \\oplus Q_n$." },
    { unit: 5, front: "How is a T Flip-Flop physically constructed from a standard JK Flip-Flop?", back: "By permanently tying the $J$ and $K$ inputs together logically ($J = K = T$)." },
    { unit: 5, front: "What fundamental tool is utilized to systematically derive the combinational logic required for flip-flop conversion?", back: "The Excitation Table of the target (available) flip-flop combined carefully with Karnaugh Maps." },
    { unit: 5, front: "When converting a D Flip-Flop to a T Flip-Flop, what is the required combinational logic input for $D$?", back: "The required logic input is $D = T \\oplus Q_n$." },
    { unit: 5, front: "When converting a JK Flip-Flop to a D Flip-Flop, what are the inputs applied to $J$ and $K$?", back: "The required logic is $J = D$ and $K = \\overline{D}$." },
    { unit: 5, front: "What distinguishes Asynchronous from Synchronous Sequential Circuits?", back: "Asynchronous circuits respond to input changes immediately without a clock. Synchronous circuits only change exactly at defined clock edges." },
    { unit: 5, front: "What is an Excitation Table?", back: "A table explicitly showing the minimum required inputs to transition a flip-flop from a given present state ($Q_n$) to a desired next state ($Q_{n+1}$)." },
    { unit: 5, front: "In the Excitation Table for a JK Flip-Flop, to transition from $Q_n=0$ to $Q_{n+1}=1$, what must $J$ and $K$ be?", back: "The required inputs are $J = 1$ and $K = X$ (Don't care)." },
    { unit: 5, front: "In the Excitation Table for an SR Flip-Flop, to transition from $1$ to $0$, what must $S$ and $R$ be?", back: "The required inputs are $S = 0$ and $R = 1$." },
    { unit: 5, front: "What does $Q_n$ represent mathematically in sequential logic equations?", back: "It represents clearly the present state originally stored inside the memory element perfectly prior to the clock pulse." }
];
