import { QuizQuestion } from "../../../types.ts";

export const ece249Unit5Subjective: QuizQuestion[] = [
    {
        unit: 5,
        type: 'subjective',
        question: "Compare Latch and Flip-Flop with respect to triggering and stability.",
        explanation: "A latch is a level-triggered device, meaning its output follows the input whenever the control signal (Enable) is HIGH or LOW (transparent). This makes it sensitive to input noise during the active period. A flip-flop is edge-triggered, meaning it only captures data at a specific clock transition (rising or falling edge). Flip-flops are generally more stable and are preferred in synchronous systems because they localize the timing of state changes.",
        difficulty: 'easy',
        topic: 'Flip-Flops'
    },
    {
        unit: 5,
        type: 'subjective',
        question: "Explain the 'Invalid' state in an SR latch and how it is avoided in a JK flip-flop.",
        explanation: "In an SR latch, setting both S and R to 1 forces both $Q$ and $\\overline{Q}$ to become 0. If both inputs return to 0 simultaneously, the device enters an unpredictable racing state. A JK flip-flop solves this by using internal feedback: when $J=1$ and $K=1$, the flip-flop 'toggles' its state ($Q_{next} = \\overline{Q}$). This allows all four input combinations to be useful.",
        difficulty: 'medium',
        topic: 'Latches'
    },
    {
        unit: 5,
        type: 'subjective',
        question: "What is the 'Race-around condition' in a JK flip-flop? How is it resolved?",
        explanation: "Race-around occurs when $J=K=1$ and the clock pulse width ($t_w$) is larger than the propagation delay ($t_{pd}$) of the flip-flop. The output toggles multiple times within a single clock pulse, leading to an unpredictable final state. It is resolved by: 1. Making $t_w < t_{pd}$ (difficult), 2. Using edge-triggering, or 3. Using a Master-Slave configuration.",
        difficulty: 'hard',
        topic: 'Master-Slave Flip-Flop'
    },
    {
        unit: 5,
        type: 'subjective',
        question: "Describe the working of a Master-Slave JK Flip-Flop.",
        explanation: "A Master-Slave flip-flop consists of two JK latches connected in series. The 'Master' is triggered during the HIGH pulse of the clock, while the 'Slave' remains idle. When the clock falls (LOW), the Master sits idle while the Slave captures the data stored in the Master and updates the final output. This ensures that the state changes only once per clock cycle, eliminating the race-around condition.",
        difficulty: 'medium',
        topic: 'Master-Slave Flip-Flop'
    },
    {
        unit: 5,
        type: 'subjective',
        question: "Explain the characteristic equations of D and T flip-flops.",
        explanation: "D Flip-Flop: $Q_{next} = D$. It simply stores the data bit present at the clock edge. T Flip-Flop: $Q_{next} = T\\overline{Q} + \\overline{T}Q$ (or $T \\oplus Q$). If $T=0$, it holds the state; if $T=1$, it toggles. These equations are fundamental for designing counters and custom state machines.",
        difficulty: 'easy',
        topic: 'Flip-Flops'
    },
    {
        unit: 5,
        type: 'subjective',
        question: "What is a 'Universal Shift Register'? Discuss its modes of operation.",
        explanation: "A Universal Shift Register is a multi-purpose register that can perform various tasks: 1. Hold data (no change), 2. Shift right, 3. Shift left, and 4. Parallel load. These modes are typically selected using a $4:1$ MUX for each flip-flop inside the register. It is the most flexible form of serial/parallel data storage and movement.",
        difficulty: 'hard',
        topic: 'Conversion of Flip-Flops'
    },
    {
        unit: 5,
        type: 'subjective',
        question: "Distinguish between Synchronous and Asynchronous Counters.",
        explanation: "In an Asynchronous (Ripple) counter, only the first flip-flop is clocked externally; subsequent stages are clocked by the output of the previous stage. This causes accumulated propagation delay. In a Synchronous counter, every flip-flop is connected to the same global clock signal and changes state simultaneously. Synchronous counters are faster and lack the 'glitches' associated with ripple counters.",
        difficulty: 'medium',
        topic: 'Sequential Circuits Overview'
    },
    {
        unit: 5,
        type: 'subjective',
        question: "Explain the design of a 3-bit Asynchronous Up-Down Counter.",
        explanation: "An Up-Down counter can count either $0 \rightarrow 7$ or $7 \rightarrow 0$. To do this, we use $T$ flip-flops in toggle mode ($T=1$). A control signal (M) decides whether to use the $Q$ output (for counting up) or the $\\overline{Q}$ output (for counting down) as the clock for the next stage. This is usually implemented using a $2:1$ MUX between each stage stage.",
        difficulty: 'hard',
        topic: 'Flip-Flops'
    },
    {
        unit: 5,
        type: 'subjective',
        question: "What are Ring and Johnson Counters? Compare their modulus.",
        explanation: "Ring Counter: The output of the last flip-flop is fed back to the input of the first. It circulates a single '1'. Modulus is $n$ (number of bits). Johnson (Twisted Ring) Counter: The complemented output of the last flip-flop is fed back to the first. Modulus is $2n$. A Johnson counter requires fewer flip-flops for the same number of states compared to a Ring counter.",
        difficulty: 'medium',
        topic: 'Table of Contents'
    },
    {
        unit: 5,
        type: 'subjective',
        question: "Describe the steps for 'Flip-Flop Conversion' (e.g., JK to T).",
        explanation: "1. Identify the 'Available' flip-flop (JK) and the 'Target' (T). 2. Write the Truth Table for the target (T) and determine its excitation requirements based on the available (JK) excitation table. 3. Use a K-map to simplify the logic for the inputs of the available flip-flop (e.g., $J=T, K=T$). 4. Draw the circuit with the external logic connected to the inputs of the available flip-flop.",
        difficulty: 'hard',
        topic: 'Conversion of Flip-Flops'
    },
    {
        unit: 5,
        type: 'subjective',
        question: "Define Setup and Hold times in the context of Flip-Flops.",
        explanation: "Setup Time ($t_s$) is the minimum time the data input must remain stable BEFORE the active clock edge occurs. Hold Time ($t_h$) is the minimum time the data must remain stable AFTER the clock edge occurs. Violating these times leads to 'Metastability', where the flip-flop output enters an unstable intermediate state and takes a long time to settle.",
        difficulty: 'hard',
        topic: 'Sequential Circuits Overview'
    },
    {
        unit: 5,
        type: 'subjective',
        question: "What is an 'Excitation Table'? How does it differ from a Truth Table?",
        explanation: "A Truth Table defines what the next state ($Q_{n+1}$) will be given current inputs and current state. An Excitation Table is the reverse: it defines what input combinations are required to force a specific state transition (e.g., $0 \rightarrow 1$). Excitation tables are essential for designing synchronous counters and state machines.",
        difficulty: 'medium',
        topic: 'Flip-Flops'
    },
    {
        unit: 5,
        type: 'subjective',
        question: "Explain the working of a SISO (Serial In Serial Out) Shift Register.",
        explanation: "SISO shift registers consist of $n$ D-flip-flops connected in series. Data is entered one bit at a time. On each clock pulse, the bits shift to the next flip-flop. After $n$ clock pulses, the first data bit reaches the output of the $n$-th flip-flop. It is typically used for time delay elements or serial communication buffers.",
        difficulty: 'easy',
        topic: 'Conversion of Flip-Flops'
    },
    {
        unit: 5,
        type: 'subjective',
        question: "What is a 'Decade Counter'? How is it implemented?",
        explanation: "A Decade counter (like the IC 7490) counts from 0 to 9 (10 states). It is typically a 4-bit binary counter ($2^4=16$) with modified logic: when the counter reaches 1010 (Decimal 10), an internal NAND gate detects this state and instantly resets all flip-flops to 0000. Effectively, it resets before '10' can be visually seen, creating a cycle of 0-9.",
        difficulty: 'medium',
        topic: 'Flip-Flops'
    },
    {
        unit: 5,
        type: 'subjective',
        question: "Discuss the use of 'Preset' and 'Clear' asynchronous inputs.",
        explanation: "Unlike J, K, R, S, or D inputs, Preset and Clear are asynchronous, meaning they override the clock and inputs. Preset (PR) forces the output to HIGH (1), and Clear (CLR) forces it to LOW (0). They are used for initializing systems or forcing an emergency reset regardless of the system's clock state.",
        difficulty: 'easy',
        topic: 'Flip-Flops'
    },
    {
        unit: 5,
        type: 'subjective',
        question: "How does a PISO (Parallel In Serial Out) shift register transfer data?",
        explanation: "A PISO register has a 'Load/Shift' control line. When set to 'Load', all $n$ bits from parallel inputs are loaded into the flip-flops simultaneously in one clock pulse. When switched to 'Shift', subsequent clock pulses move the bits out one by one from the last flip-flop. This is used to convert data from a parallel bus to a serial wire.",
        difficulty: 'medium',
        topic: 'Conversion of Flip-Flops'
    },
    {
        unit: 5,
        type: 'subjective',
        question: "Explain why Synchronous counters don't have 'Decoding Glitches'.",
        explanation: "In an asynchronous counter, flip-flops change state at slightly different times due to rippling delays ($011 \rightarrow 010 \rightarrow 110 \rightarrow 100$). This leads to brief intermediate 'glitch' states. In synchronous counters, since all flops change at the exact same clock edge, the transition from one state to the next is clean and direct, making them reliable for high-speed decoding.",
        difficulty: 'medium',
        topic: 'Sequential Circuits Overview'
    },
    {
        unit: 5,
        type: 'subjective',
        question: "What is Frequency Division in counters?",
        explanation: "Every stage of a binary ripple counter divides the input clock frequency by 2. The output of the first flip-flop has frequency $f/2$, the second $f/4$, the $n$-th $f/2^n$. This property is used in digital watches to divide a high-frequency crystal oscillator (e.g., 32.768 kHz) down to a stable 1 Hz signal for the seconds display.",
        difficulty: 'easy',
        topic: 'Flip-Flops'
    },
    {
        unit: 5,
        type: 'subjective',
        question: "Describe a 'Bidirectional Shift Register'.",
        explanation: "A Bidirectional shift register can shift data both left and right. It uses a control input (Mode) to select which adjacent flip-flop output should be fed into the current input. This is usually implemented with steering logic (AND-OR gates) or 4:1 MUXs for each stage. It is essential in CPUs for multiplication and division algorithms.",
        difficulty: 'medium',
        topic: 'Conversion of Flip-Flops'
    },
    {
        unit: 5,
        type: 'subjective',
        question: "What is 'Metastability' in digital systems?",
        explanation: "Metastability is an unstable equilibrium state where a flip-flop output remains stuck between 0 and 1 for an extended period. This usually happens when setup or hold times are violated (e.g., input changes exactly at the clock edge). It can cause system hangs or random bit errors in asynchronous data boundaries.",
        difficulty: 'hard',
        topic: 'Sequential Circuits Overview'
    }
];
