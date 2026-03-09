import { QuizQuestion } from "../../../types.ts";

export const unit6Quizzes: QuizQuestion[] = [
    {
        unit: 6,
        question: "What is the physical structure of an n-bit register?",
        options: [
            "A sequential logic gate composed of n independent NAND gates",
            "A discrete combinational multiplexer outputting n digital signals",
            "Exactly n independent interconnected latches arranged logically",
            "A structured group of n individual edge-triggered flip-flops"
        ],
        correctAnswer: 3,
        explanation: "Every register is structurally composed of flip-flops. Each flip-flop stores precisely one distinct binary bit."
    },
    {
        unit: 6,
        question: "What primary operation specifically defines a Shift Register?",
        options: [
            "Storing data permanently",
            "Shifting data bit-by-bit from one flip-flop to the next synchronously",
            "Converting analog signals to digital",
            "Adding binary numbers together directly"
        ],
        correctAnswer: 1,
        explanation: "A shift register explicitly moves (shifts) stored binary data laterally from one internal flip-flop directly into the adjacent one exactly at each active clock pulse."
    },
    {
        unit: 6,
        question: "In a definitive Right Shift operation, what is the precise direction of data movement?",
        options: [
            "From LSB (right) to MSB (left)",
            "From MSB (left) to LSB (right)",
            "Data swaps between odd and even positions",
            "Data outputs in parallel simultaneously"
        ],
        correctAnswer: 1,
        explanation: "During a Right Shift operation, binary data moves explicitly from left to right (from the Most Significant Bit precisely down toward the Least Significant Bit direction)."
    },
    {
        unit: 6,
        question: "What does the abbreviation SISO precisely stand for regarding shift registers?",
        options: [
            "Simultaneous In Sequential Out",
            "Synchronous Input Serial Output",
            "Serial In Serial Out",
            "Static In Static Out"
        ],
        correctAnswer: 2,
        explanation: "SISO stands for Serial In Serial Out, meaning binary data enters the register precisely one bit at a time and identically exits one bit at a time sequentially."
    },
    {
        unit: 6,
        question: "Why is the SISO shift register considered structurally the slowest classification?",
        options: [
            "It solely operates using significantly slower latch components",
            "It requires exactly n explicit clock pulses to merely load n bits, and another n pulses systematically to logically read them all",
            "It possesses excessive internal capacitance physically limiting maximum frequency",
            "It uses complex decoding logic mathematically delaying processing identically"
        ],
        correctAnswer: 1,
        explanation: "Because the SISO architecture is strictly fully serial, it mandatorily requires n discrete clock pulses continuously fully sequentially to load the entire specific binary word, and an additional necessary n clock pulses linearly to completely logically shift it completely out."
    },
    {
        unit: 6,
        question: "Which specific type of shift register configuration serves uniquely as a 'Serial-to-Parallel' electronic converter?",
        options: [
            "SISO",
            "PISO",
            "PIPO",
            "SIPO"
        ],
        correctAnswer: 3,
        explanation: "A SIPO (Serial In Parallel Out) shift register accepts input bits serially, then effectively makes the complete stored binary word available completely in parallel exactly logically at the outputs."
    },
    {
        unit: 6,
        question: "How many actual clock pulses are technically required logically to completely load an n-bit PISO or PIPO parallel shift register?",
        options: [
            "1",
            "n-1",
            "n",
            "2n"
        ],
        correctAnswer: 0,
        explanation: "Since structurally data is mathematically cleanly entered in parallel simultaneously, it requires exactly 1 logic clock pulse."
    },
    {
        unit: 6,
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
        unit: 6,
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
        unit: 6,
        question: "How many state combinations (modulus) does an n-bit Ring Counter have?",
        options: [
            "2^n",
            "n",
            "2n",
            "2^{n-1}"
        ],
        correctAnswer: 1,
        explanation: "A ring counter circulates a single 1 through its flip-flops, so an n-bit ring counter features exactly n unique states."
    }
];
