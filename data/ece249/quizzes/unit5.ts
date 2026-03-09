import { QuizQuestion } from "../../../types.ts";

export const unit5Quizzes: QuizQuestion[] = [
    {
        unit: 5,
        question: "What is the primary feature that distinguishes sequential logic circuits from combinational logic circuits?",
        options: [
            "Sequential circuits use only NAND gates",
            "Sequential circuits have no propagation delay",
            "Sequential circuits contain memory elements and depend on past states",
            "Sequential circuits cannot perform arithmetic operations"
        ],
        correctAnswer: 2,
        explanation: "Sequential circuits use memory elements (like latches and flip-flops) to store past states, meaning their output depends on both current inputs and the previous state."
    },
    {
        unit: 5,
        question: "What is the fundamental difference between a latch and a flip-flop?",
        options: [
            "A latch is edge-triggered; a flip-flop is level-triggered",
            "A latch is level-triggered; a flip-flop is edge-triggered",
            "A latch requires a clock signal; a flip-flop does not",
            "A latch stores multiple bits; a flip-flop stores one bit"
        ],
        correctAnswer: 1,
        explanation: "Latches are level-triggered (transparent when active), whereas flip-flops are edge-triggered (change state only at the rising or falling edge of the clock)."
    },
    {
        unit: 5,
        question: "In an SR latch constructed using NOR gates, which input combination results in a forbidden or invalid state?",
        options: [
            "$S = 0, R = 0$",
            "$S = 0, R = 1$",
            "$S = 1, R = 0$",
            "$S = 1, R = 1$"
        ],
        correctAnswer: 3,
        explanation: "When $S=1$ and $R=1$, both outputs try to become $0$, which violates the complementary rule and leads to an unpredictable state when inputs return to $0$."
    },
    {
        unit: 5,
        question: "What is the characteristic equation of an SR flip-flop?",
        options: [
            "$Q_{n+1} = S + \\overline{R} \\cdot Q_n$",
            "$Q_{n+1} = S \\cdot R + Q_n$",
            "$Q_{n+1} = \\overline{S} + R \\cdot Q_n$",
            "$Q_{n+1} = S \\oplus R$"
        ],
        correctAnswer: 0,
        explanation: "The characteristic equation is $Q_{n+1} = S + \\overline{R} \\cdot Q_n$, subject to the constraint $SR = 0$."
    },
    {
        unit: 5,
        question: "How does a D latch solve the forbidden state problem of the SR latch?",
        options: [
            "By adding a clock signal",
            "By ensuring $S$ and $R$ are never logically equal via an inverter",
            "By using only NAND gates",
            "By adding a third input pin"
        ],
        correctAnswer: 1,
        explanation: "In a D latch, the $D$ input is connected to $S$, and $\\overline{D}$ is connected to $R$. This ensures $S$ and $R$ are always complementary, preventing the $1,1$ state."
    },
    {
        unit: 5,
        question: "Which input condition causes a JK flip-flop to toggle its output state ($Q_{n+1} = \\overline{Q_n}$)?",
        options: [
            "$J = 0, K = 0$",
            "$J = 0, K = 1$",
            "$J = 1, K = 0$",
            "$J = 1, K = 1$"
        ],
        correctAnswer: 3,
        explanation: "Unlike the SR flip-flop which enters an invalid state, a JK flip-flop toggles (inverts its current state) when $J=1$ and $K=1$."
    },
    {
        unit: 5,
        question: "What is the characteristic equation of a JK flip-flop?",
        options: [
            "$Q_{n+1} = JQ_n + K\\overline{Q_n}$",
            "$Q_{n+1} = J\\overline{Q_n} + \\overline{K}Q_n$",
            "$Q_{n+1} = J \\oplus K$",
            "$Q_{n+1} = J\\overline{K} + \\overline{J}K$"
        ],
        correctAnswer: 1,
        explanation: "The next state $Q_{n+1}$ is determined by $J\\overline{Q_n} + \\overline{K}Q_n$, which defines the Set, Reset, Hold, and Toggle operations."
    },
    {
        unit: 5,
        question: "What is the 'race-around condition' in sequential circuits?",
        options: [
            "When signals propagate too slowly through logic gates",
            "When output continuously toggles multiple times during a single HIGH clock pulse in a JK flip-flop",
            "When asynchronous inputs override the clock signal",
            "When the clock frequency is too low"
        ],
        correctAnswer: 1,
        explanation: "In a JK flip-flop with $J=K=1$, if the clock pulse width is longer than the flip-flop's propagation delay, the output toggles unpredictably multiple times."
    },
    {
        unit: 5,
        question: "Which of the following architectures is explicitly designed to eliminate the race-around condition?",
        options: [
            "D Latch",
            "T Flip-Flop",
            "Master-Slave Flip-Flop",
            "Asynchronous Ripple Counter"
        ],
        correctAnswer: 2,
        explanation: "The Master-Slave flip-flop uses two cascaded stages clocked on opposite edges, ensuring the output changes only once per full clock cycle."
    },
    {
        unit: 5,
        question: "What is the characteristic equation for a D flip-flop?",
        options: [
            "$Q_{n+1} = \\overline{D}$",
            "$Q_{n+1} = D \\oplus Q_n$",
            "$Q_{n+1} = D \\cdot Q_n$",
            "$Q_{n+1} = D$"
        ],
        correctAnswer: 3,
        explanation: "A D flip-flop simply captures and stores the data input $D$ at the active clock edge, so $Q_{n+1} = D$."
    },
    {
        unit: 5,
        question: "What is the characteristic equation for a T (Toggle) flip-flop?",
        options: [
            "$Q_{n+1} = T + Q_n$",
            "$Q_{n+1} = T \\oplus Q_n$",
            "$Q_{n+1} = T \\cdot Q_n$",
            "$Q_{n+1} = \\overline{T} \\oplus Q_n$"
        ],
        correctAnswer: 1,
        explanation: "When $T=1$, the output toggles (inverts $Q_n$). When $T=0$, $Q_n$ holds. This behavior matches the XOR logic: $T \\oplus Q_n$."
    },
    {
        unit: 5,
        question: "How is a T flip-flop typically constructed from a JK flip-flop?",
        options: [
            "By setting $J=1$ and $K=0$",
            "By tying $J$ and $K$ together ($J = K = T$)",
            "By connecting $J$ to the clock and $K$ to ground",
            "By using an inverter between $J$ and $K$"
        ],
        correctAnswer: 1,
        explanation: "Connecting both $J$ and $K$ inputs to a single logic signal $T$ creates a toggle flip-flop, since $J=K=1$ toggles and $J=K=0$ holds."
    },
    {
        unit: 5,
        question: "What type of shift register takes $n$ clock pulses to load data and requires outputs to be read one bit at a time?",
        options: [
            "SIPO (Serial In Parallel Out)",
            "PISO (Parallel In Serial Out)",
            "PIPO (Parallel In Parallel Out)",
            "SISO (Serial In Serial Out)"
        ],
        correctAnswer: 3,
        explanation: "A SISO shift register is the slowest type; inputs enter serially and exit serially, meaning it takes $n$ pulses to load and $n$ pulses to read."
    },
    {
        unit: 5,
        question: "Which shift register configuration is best suited for serial-to-parallel data conversion?",
        options: [
            "SISO",
            "SIPO",
            "PISO",
            "PIPO"
        ],
        correctAnswer: 1,
        explanation: "SIPO (Serial In Parallel Out) accepts data sequentially and, after loading, makes all bits available simultaneously on parallel output lines."
    },
    {
        unit: 5,
        question: "What defines an Asynchronous (Ripple) counter?",
        options: [
            "All flip-flops receive the clock signal simultaneously",
            "It does not require flip-flops",
            "Flip-flops are triggered by the output of the previous flip-flop",
            "It cannot count downwards"
        ],
        correctAnswer: 2,
        explanation: "In an asynchronous counter, only the first flip-flop receives the external clock. Subsequent flip-flops are clocked by the output of the preceding one."
    },
    {
        unit: 5,
        question: "What is a major disadvantage of asynchronous counters compared to synchronous counters?",
        options: [
            "They are more complex to design",
            "They consume significantly more power",
            "Propagation delay accumulates, limiting maximum frequency",
            "They require more flip-flops for the same modulus"
        ],
        correctAnswer: 2,
        explanation: "Because clock signals ripple through each stage sequentially, the propagation delays add up, which can cause reading glitches and limits operational frequency."
    },
    {
        unit: 5,
        question: "How many state combinations (modulus) does an $n$-bit Ring Counter have?",
        options: [
            "$2^n$",
            "$n$",
            "$2n$",
            "$2^{n-1}$"
        ],
        correctAnswer: 1,
        explanation: "A ring counter circulates a single $1$ through its flip-flops, so an $n$-bit ring counter features exactly $n$ unique states."
    },
    {
        unit: 5,
        question: "What is the modulus of a 4-bit Johnson (Twisted Ring) counter?",
        options: [
            "4",
            "8",
            "10",
            "16"
        ],
        correctAnswer: 1,
        explanation: "A Johnson counter has a modulus equal to $2n$. For 4 bits, the modulus is $2 \\times 4 = 8$."
    },
    {
        unit: 5,
        question: "To convert a JK flip-flop into a D flip-flop, what excitation logic is required for inputs $J$ and $K$?",
        options: [
            "$J = D$, $K = D$",
            "$J = \\overline{D}$, $K = D$",
            "$J = D$, $K = \\overline{D}$",
            "$J = 1$, $K = \\overline{D}$"
        ],
        correctAnswer: 2,
        explanation: "Connecting $J$ directly to $D$ and $K$ to $\\overline{D}$ ensures that the JK flip-flop explicitly Sets when $D=1$ and Resets when $D=0$, mirroring exactly a D flip-flop."
    },
    {
        unit: 5,
        question: "To design a synchronous Mod-10 counter, what is the minimum number of flip-flops required?",
        options: [
            "3",
            "4",
            "5",
            "10"
        ],
        correctAnswer: 1,
        explanation: "The minimum number of flip-flops $n$ must satisfy $2^n \\geq N$. For $N=10$, $2^3 = 8$ is too small, but $2^4 = 16$ is sufficient. Thus, 4 flip-flops are needed."
    }
];
