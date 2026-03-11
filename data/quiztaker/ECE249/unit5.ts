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
        explanation: "Sequential circuits use memory elements (like latches and flip-flops) to store past states, meaning their output depends on both current inputs and the previous state.",
difficulty: 'medium',
topic: 'Sequential Circuits Overview'
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
        explanation: "Latches are level-triggered (transparent when active), whereas flip-flops are edge-triggered (change state only at the rising or falling edge of the clock).",
difficulty: 'easy',
topic: 'Flip-Flops'
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
        explanation: "When $S=1$ and $R=1$, both outputs try to become $0$, which violates the complementary rule and leads to an unpredictable state when inputs return to $0$.",
difficulty: 'medium',
topic: 'Table of Contents'
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
        explanation: "The characteristic equation is $Q_{n+1} = S + \\overline{R} \\cdot Q_n$, subject to the constraint $SR = 0$.",
difficulty: 'easy',
topic: 'Master-Slave Flip-Flop'
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
        explanation: "In a D latch, the $D$ input is connected to $S$, and $\\overline{D}$ is connected to $R$. This ensures $S$ and $R$ are always complementary, preventing the $1,1$ state.",
difficulty: 'easy',
topic: 'Latches'
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
        explanation: "Unlike the SR flip-flop which enters an invalid state, a JK flip-flop toggles (inverts its current state) when $J=1$ and $K=1$.",
difficulty: 'medium',
topic: 'Master-Slave Flip-Flop'
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
        explanation: "The next state $Q_{n+1}$ is determined by $J\\overline{Q_n} + \\overline{K}Q_n$, which defines the Set, Reset, Hold, and Toggle operations.",
difficulty: 'easy',
topic: 'Master-Slave Flip-Flop'
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
        explanation: "In a JK flip-flop with $J=K=1$, if the clock pulse width is longer than the flip-flop's propagation delay, the output toggles unpredictably multiple times.",
difficulty: 'easy',
topic: 'Sequential Circuits Overview'
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
        explanation: "The Master-Slave flip-flop uses two cascaded stages clocked on opposite edges, ensuring the output changes only once per full clock cycle.",
difficulty: 'medium',
topic: 'Master-Slave Flip-Flop'
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
        explanation: "A D flip-flop simply captures and stores the data input $D$ at the active clock edge, so $Q_{n+1} = D$.",
difficulty: 'easy',
topic: 'Master-Slave Flip-Flop'
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
        explanation: "When $T=1$, the output toggles (inverts $Q_n$). When $T=0$, $Q_n$ holds. This behavior matches the XOR logic: $T \\oplus Q_n$.",
difficulty: 'easy',
topic: 'Master-Slave Flip-Flop'
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
        explanation: "Connecting both $J$ and $K$ inputs to a single logic signal $T$ creates a toggle flip-flop, since $J=K=1$ toggles and $J=K=0$ holds.",
difficulty: 'easy',
topic: 'Master-Slave Flip-Flop'
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
        explanation: "A SISO shift register is the slowest type; inputs enter serially and exit serially, meaning it takes $n$ pulses to load and $n$ pulses to read.",
difficulty: 'medium',
topic: 'Conversion of Flip-Flops'
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
        explanation: "SIPO (Serial In Parallel Out) accepts data sequentially and, after loading, makes all bits available simultaneously on parallel output lines.",
difficulty: 'medium',
topic: 'Conversion of Flip-Flops'
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
        explanation: "In an asynchronous counter, only the first flip-flop receives the external clock. Subsequent flip-flops are clocked by the output of the preceding one.",
difficulty: 'easy',
topic: 'Flip-Flops'
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
        explanation: "Because clock signals ripple through each stage sequentially, the propagation delays add up, which can cause reading glitches and limits operational frequency.",
difficulty: 'medium',
topic: 'Sequential Circuits Overview'
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
        explanation: "A ring counter circulates a single $1$ through its flip-flops, so an $n$-bit ring counter features exactly $n$ unique states.",
difficulty: 'medium',
topic: 'Flip-Flops'
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
        explanation: "A Johnson counter has a modulus equal to $2n$. For 4 bits, the modulus is $2 \\times 4 = 8$.",
difficulty: 'easy',
topic: 'Table of Contents'
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
        explanation: "Connecting $J$ directly to $D$ and $K$ to $\\overline{D}$ ensures that the JK flip-flop explicitly Sets when $D=1$ and Resets when $D=0$, mirroring exactly a D flip-flop.",
difficulty: 'medium',
topic: 'Master-Slave Flip-Flop'
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
        explanation: "The minimum number of flip-flops $n$ must satisfy $2^n \\geq N$. For $N=10$, $2^3 = 8$ is too small, but $2^4 = 16$ is sufficient. Thus, 4 flip-flops are needed.",
difficulty: 'medium',
topic: 'Flip-Flops'
    },
    // Expansion
    { unit: 5, topic: 'Flip-Flops', difficulty: 'easy', question: "A latch is a ___ device.", options: ["Level sensitive", "Edge sensitive", "Frequency sensitive", "None"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'easy', question: "A flip-flop is a ___ device.", options: ["Level sensitive", "Edge sensitive", "Speed sensitive", "None"], correctAnswer: 1, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'medium', question: "Which flip-flop has no invalid state?", options: ["SR", "JK", "D", "Both JK and D"], correctAnswer: 3, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Sequential Circuits Overview', difficulty: 'medium', question: "Clock frequency of counter is $10$ MHz. If MOD is 5, output frequency is:", options: ["$2$ MHz", "$10$ MHz", "$50$ MHz", "$0.5$ MHz"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Master-Slave Flip-Flop', difficulty: 'hard', question: "Master-Slave JK flip-flop is free from race around because:", options: ["It uses two stages", "Output changes only on clock edge", "Master is active during pulse, Slave at edge", "All of above"], correctAnswer: 3, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Conversion of Flip-Flops', difficulty: 'hard', question: "To convert D to T flip-flop, use:", options: ["XOR gate", "AND gate", "OR gate", "NOT gate"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'medium', question: "Excitation table for D flip-flop:", options: ["$D = Q_{next}$", "$D = Q_{prev}$", "$D = 1$", "$D = 0$"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Conversion of Flip-Flops', difficulty: 'easy', question: "Register used to store data is:", options: ["Counter", "Memory Register", "Latch", "Decoder"], correctAnswer: 1, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Sequential Circuits Overview', difficulty: 'medium', question: "Minimum number of flip-flops to count to 100:", options: ["$6$", "$7$", "$10$", "$100$"], correctAnswer: 1, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'easy', question: "Preset and Clear are:", options: ["Synchronous", "Asynchronous", "Clocked", "None"], correctAnswer: 1, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Conversion of Flip-Flops', difficulty: 'easy', question: "Serial to Parallel converter is:", options: ["SISO", "SIPO", "PISO", "PIPO"], correctAnswer: 1, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'medium', question: "For a JK flip-flop, if $J=0, K=1$, next state is:", options: ["$0$", "$1$", "Toggle", "No change"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'medium', question: "For a JK flip-flop, if $J=1, K=0$, next state is:", options: ["$0$", "$1$", "Toggle", "No change"], correctAnswer: 1, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Sequential Circuits Overview', difficulty: 'easy', question: "Up-down counter can count:", options: ["Up only", "Down only", "Both", "None"], correctAnswer: 2, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'easy', question: "Symbol for positive edge trigger is:", options: ["Bubble", "Triangle", "Dot", "Square"], correctAnswer: 1, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Sequential Circuits Overview', difficulty: 'hard', question: "A ripple counter with $N$ flip-flops has modulus:", options: ["$2^N$", "$N$", "$2N$", "$N^2$"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Conversion of Flip-Flops', difficulty: 'medium', question: "Universal Shift Register can:", options: ["Shift left", "Shift right", "Parallel load", "All of above"], correctAnswer: 3, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'medium', question: "Which input is 'Data' input?", options: ["S", "R", "D", "K"], correctAnswer: 2, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'easy', question: "SR latch with $S=1, R=0$ results in:", options: ["$Q=1$", "$Q=0$", "No change", "Invalid"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'medium', question: "Toggling happens when:", options: ["$T=0$", "$T=1$", "Clock stops", "Always"], correctAnswer: 1, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Sequential Circuits Overview', difficulty: 'hard', question: "Synchronous counter speed is:", options: ["Higher than asynchronous", "Lower", "Same", "Zero"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'easy', question: "Bistable multivibrator is a:", options: ["Latch", "Flip-flop", "Register", "All"], correctAnswer: 1, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Sequential Circuits Overview', difficulty: 'medium', question: "Self-starting counter is one that:", options: ["Always reaches main cycle", "Has memory", "Is fast", "Locked"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Conversion of Flip-Flops', difficulty: 'easy', question: "Buffer register stores:", options: ["1 bit", "Word of bits", "Addresses", "Instructions"], correctAnswer: 1, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'medium', question: "Output of D flip-flop depends on clock and:", options: ["Previous state", "Input D", "Reset", "All"], correctAnswer: 1, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Sequential Circuits Overview', difficulty: 'hard', question: "Modulo 6 counter needs ___ flip flops.", options: ["$2$", "$3$", "$4$", "$6$"], correctAnswer: 1, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'medium', question: "What happens when $J=K=0$ in JK flip-flop?", options: ["Toggle", "Set", "Reset", "No change"], correctAnswer: 3, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Conversion of Flip-Flops', difficulty: 'hard', question: "Bidirectional shift register shifts:", options: ["Both directions", "Clockwise", "Anti-clockwise", "Zero"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'medium', question: "Hold time is:", options: ["Time input must be stable after clock", "Before clock", "During toggle", "None"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'medium', question: "Setup time is:", options: ["Before clock edge", "After clock edge", "During pulse", "None"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Sequential Circuits Overview', difficulty: 'easy', question: "State table defines:", options: ["Input/Output/State relations", "Gate count", "Power", "Voltage"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'medium', question: "A transparent latch is:", options: ["D latch", "SR latch", "T latch", "None"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Shift Registers', difficulty: 'medium', question: "PIPO register is used for:", options: ["Data storage", "S-to-P", "P-to-S", "None"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Counters', difficulty: 'medium', question: "MOD-16 counter counts from:", options: ["$0-15$", "$1-16$", "$0-16$", "$0-7$"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'easy', question: "JK flip-flop is better than SR because:", options: ["It is smaller", "It avoids invalid state", "It is faster", "None"], correctAnswer: 1, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Sequential Circuits Overview', difficulty: 'hard', question: "Excitation table for JK:", options: ["$J = 1, K = X$", "$J, K$ terms for needed transition", "All 1s", "All 0s"], correctAnswer: 1, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Shift Registers', difficulty: 'hard', question: "Number of clock cycles to load 4-bit SISO:", options: ["$1$", "$2$", "$4$", "$8$"], correctAnswer: 2, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Counters', difficulty: 'medium', question: "Decade counter is MOD:", options: ["$8$", "$10$", "$12$", "$16$"], correctAnswer: 1, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'easy', question: "Primary use of T flip-flop:", options: ["Frequency division", "Memory", "Amplification", "None"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'medium', question: "Master-Slave flip-flop output is active at:", options: ["Trailing edge", "Leading edge", "High pulse", "Low pulse"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Sequential Circuits Overview', difficulty: 'easy', question: "Feedback is essential in:", options: ["Combinational", "Sequential", "Logic gates", "Buffer"], correctAnswer: 1, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Counters', difficulty: 'medium', question: "Synchronous counter clock is connected to:", options: ["Stage $0$ only", "All stages", "Odd stages", "Even stages"], correctAnswer: 1, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'medium', question: "Output $Q$ and $\\overline{Q}$ must be:", options: ["Same", "Complementary", "Zero", "One"], correctAnswer: 1, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Shift Registers', difficulty: 'easy', question: "Data shifting is used for:", options: ["Multiplication/Division", "Storage only", "Display", "None"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Counters', difficulty: 'medium', question: "Ring counter uses:", options: ["D flip-flops", "SR flip-flops", "JK", "Both A and C"], correctAnswer: 3, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'easy', question: "An edge-triggered flip-flop is also called:", options: ["Flip-flop", "Latch", "Pulse-triggered", "None"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Counters', difficulty: 'hard', question: "Which counter has highest speed?", options: ["Ripple", "Synchronous", "Serial", "None"], correctAnswer: 1, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Sequential Circuits Overview', difficulty: 'medium', question: "A counter that counts $0, 1, 2, 0, 1, 2$ is MOD:", options: ["$2$", "$3$", "$4$", "$1$"], correctAnswer: 1, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'easy', question: "Which has Toggle mode?", options: ["SR", "JK", "D", "None"], correctAnswer: 1, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Shift Registers', difficulty: 'medium', question: "Static shift register uses:", options: ["Flip-flops", "Capacitors", "Resistors", "Inductors"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Counters', difficulty: 'medium', question: "Frequency of output of MOD-2 counter:", options: ["$f/2$", "$2f$", "$f$", "$f/4$"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'medium', question: "Characteristic eq of T flip-flop:", options: ["$TQ' + T'Q$", "$T+Q$", "$TQ$", "$T \oplus Q$"], correctAnswer: 3, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Sequential Circuits Overview', difficulty: 'easy', question: "RAM is a type of:", options: ["Sequential circuit", "Combinational circuit", "Analog", "None"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Counters', difficulty: 'medium', question: "4-bit Ripple counter uses how many XOR?", options: ["$0$", "$1$", "$4$", "$8$"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'medium', question: "Gating a clock is used for:", options: ["Power saving", "Increasing speed", "Toggling", "None"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Shift Registers', difficulty: 'medium', question: "A shift register that can clear all bits at once has:", options: ["Reset input", "Clock", "Toggle", "None"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Counters', difficulty: 'hard', question: "Glitch in ripple counter happens at:", options: ["Transition", "High level", "Low level", "Idle"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'easy', question: "Which latch is called active-low SR latch?", options: ["NAND SR", "NOR SR", "JK", "D"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Counters', difficulty: 'medium', question: "Johnson counter is also called:", options: ["Creeping counter", "Walking counter", "Twisted ring", "All"], correctAnswer: 3, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Sequential Circuits Overview', difficulty: 'easy', question: "Computer clock is a:", options: ["Square wave", "Sine wave", "Sawtooth", "Triangle"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'medium', question: "D flip-flop is basically a ___ delay.", options: ["$1$ clock pulse", "$2$ pulse", "Zero", "Variable"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Shift Registers', difficulty: 'medium', question: "Register size for 16-bit word:", options: ["$4$ bit", "$8$ bit", "$16$ bit", "$32$ bit"], correctAnswer: 2, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'easy', question: "Toggle flip-flop is also called:", options: ["T flip-flop", "JK flip-flop", "SR", "D"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Counters', difficulty: 'medium', question: "A counter with $M=10$ is called:", options: ["Decade", "Hex", "Octal", "Binary"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Sequential Circuits Overview', difficulty: 'medium', question: "Max propagation delay is in:", options: ["Ripple counter", "Synchronous", "Combinational", "None"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'easy', question: "SR flip-flop has ___ inputs.", options: ["$2$", "$3$", "$1$", "$4$"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Shift Registers', difficulty: 'medium', question: "PISO needs ___ control signal.", options: ["Load/Shift", "Clock only", "Enable", "Toggle"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Counters', difficulty: 'hard', question: "Which counter is non-self-starting usually?", options: ["Ring", "Ripple", "Synchronous", "None"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Sequential Circuits Overview', difficulty: 'easy', question: "Smallest unit of memory:", options: ["Flip-flop", "Byte", "NIBBLE", "WORD"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'medium', question: "Forbidden state in SR latch is:", options: ["$0,0$", "$0,1$", "$1,0$", "$1,1$"], correctAnswer: 3, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Counters', difficulty: 'medium', question: "Frequency divider is a:", options: ["Counter", "Register", "MUX", "Decoder"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'easy', question: "Clock used in flip-flop for:", options: ["Synchronization", "Power", "Voltage", "Current"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Shift Registers', difficulty: 'medium', question: "Serial data is transferred bit by bit via ___ line.", options: ["Single", "Multiple", "Parallel", "Bus"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'medium', question: "Which gate implements D latch from SR latch?", options: ["NOT", "AND", "OR", "XOR"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Counters', difficulty: 'medium', question: "Modulus of 2 cascaded MOD-4 counters:", options: ["$8$", "$16$", "$4$", "$2$"], correctAnswer: 1, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Sequential Circuits Overview', difficulty: 'easy', question: "State transition diagram is for:", options: ["Sequential circuits", "Combinational", "Resistors", "Capacitors"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'medium', question: "If $Q_n=1$ and $J=1, K=1$, then $Q_{n+1}=$", options: ["$0$", "$1$", "No change", "Invalid"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Counters', difficulty: 'medium', question: "Up-counter using negative edge trigger needs:", options: ["$Q$ connected to clock", "$Q'$ connected to clock", "Both", "None"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Shift Registers', difficulty: 'easy', question: "Register that rotates data is:", options: ["Shift register", "Counter", "Accumulator", "None"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." },
    { unit: 5, topic: 'Flip-Flops', difficulty: 'easy', question: "JK flip-flop is also called:", options: ["Universal flip-flop", "Base", "Primary", "None"], correctAnswer: 0, explanation: "Correct answer based on English grammar and context." }
];
