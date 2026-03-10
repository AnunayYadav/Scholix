import { QuizQuestion } from "../../../types.ts";

export const ece249Unit4Subjective: QuizQuestion[] = [
    {
        unit: 4,
        type: 'subjective',
        question: "Compare Combinational and Sequential circuits.",
        explanation: "Combinational circuits have outputs that depend solely on the current input values (e.g., Adders, MUX). They have no memory or feedback loops. Sequential circuits have outputs that depend on both current and previous inputs (history), meaning they contain memory elements like Flip-Flops and often require a clock signal to synchronize state changes.",
        difficulty: 'easy',
        topic: 'Combinational vs Sequential Circuits'
    },
    {
        unit: 4,
        type: 'subjective',
        question: "Design a Full Adder using two Half Adders and one OR gate. Explain the logic.",
        explanation: "To build a Full Adder: 1. Feed inputs A and B into the first Half Adder. 2. Feed the Sum from the first HA and the Carry-in ($C_{in}$) into the second Half Adder. 3. The Sum from the second HA is the final Full Adder Sum ($S$). 4. Feed the Carry-out from both Half Adders into an OR gate to get the final Carry-out ($C_{out}$). Logic: $S = (A \oplus B) \oplus C_{in}$ and $C_{out} = AB + C_{in}(A \oplus B)$.",
        difficulty: 'medium',
        topic: 'Adders'
    },
    {
        unit: 4,
        type: 'subjective',
        question: "Explain the working of a 4-bit Ripple Carry Adder and discuss its primary limitation.",
        explanation: "A 4-bit Ripple Carry Adder is formed by cascading 4 Full Adders, where the Carry-out ($C_{out}$) of each stage is connected to the Carry-in ($C_{in}$) of the next Most Significant Bit. The primary limitation is 'Propagation Delay'. Each adder must wait for the carry bit to 'ripple' through previous stages before calculating its own sum, making it slow for large bit-widths.",
        difficulty: 'medium',
        topic: 'Adders'
    },
    {
        unit: 4,
        type: 'subjective',
        question: "What is a Carry Look-Ahead (CLA) Adder? How does it solve the speed issue of Ripple Carry Adders?",
        explanation: "A CLA Adder reduces propagation delay by calculating carry bits for all stages in parallel rather than waiting for them to ripple. it uses two intermediate functions: Generate ($G_i = A_i B_i$) and Propagate ($P_i = A_i \oplus B_i$). By expressing carries in terms of these functions and the initial carry-in, hardware can determine all carries almost simultaneously.",
        difficulty: 'hard',
        topic: 'Adders'
    },
    {
        unit: 4,
        type: 'subjective',
        question: "Describe the function of a Multiplexer (MUX) and its internal logic structure.",
        explanation: "A Multiplexer is a data selector that routes one of several inputs to a single output based on select lines. For a $2^n:1$ MUX, there are $n$ select lines. Internally, it consists of AND gates (one for each input) where each AND gate is enabled by a unique combination of select lines, followed by an OR gate that combines the outputs of all AND gates.",
        difficulty: 'medium',
        topic: 'Multiplexers'
    },
    {
        unit: 4,
        type: 'subjective',
        question: "Explain how a 1:4 Demultiplexer works and write its truth table logic.",
        explanation: "A 1:4 Demultiplexer takes 1 input (D) and directs it to one of 4 outputs ($Y_0, Y_1, Y_2, Y_3$) based on two select lines ($S_1, S_0$). When $S_1S_0 = 00$, $Y_0=D$ and others are $0$. When $01$, $Y_1=D$, and so on. It acts like a digital switch distributing data.",
        difficulty: 'easy',
        topic: 'Multiplexers'
    },
    {
        unit: 4,
        type: 'subjective',
        question: "What is the difference between a Decoder and a Demultiplexer?",
        explanation: "Structurally they are similar, but their purpose differs. A Decoder translates an n-bit binary code into $2^n$ unique output lines (usually used for address decoding). A Demultiplexer takes a data input and routes it to one of $2^n$ outputs. In hardware, a Decoder with an 'Enable' input functions exactly like a Demultiplexer where the Enable acts as the data input.",
        difficulty: 'medium',
        topic: 'Decoders'
    },
    {
        unit: 4,
        type: 'subjective',
        question: "Explain the concept of a Priority Encoder. Why is it needed over a standard Encoder?",
        explanation: "A standard encoder produces incorrect results if two inputs are active at once. A Priority Encoder solves this by assigning a higher priority to higher-index inputs. If multiple inputs are HIGH, the encoder outputs the binary code of the input with the highest priority. It also typically includes a 'Valid' bit to indicate if any input is active.",
        difficulty: 'hard',
        topic: 'Encoders'
    },
    {
        unit: 4,
        type: 'subjective',
        question: "Discuss the design of a 2-bit Magnitude Comparator. What are the logical conditions for A=B, A>B, and A<B?",
        explanation: "Comparing $A(A_1A_0)$ and $B(B_1B_0)$. $A=B$ if $(A_1 XNOR B_1) \cdot (A_0 XNOR B_0)$. $A>B$ if $A_1 > B_1$ OR $(A_1=B_1 \text{ and } A_0 > B_0)$. $A<B$ if $A_1 < B_1$ OR $(A_1=B_1 \text{ and } A_0 < B_0)$. High-order bits are checked first; lower-order bits are only relevant if higher bits are equal.",
        difficulty: 'hard',
        topic: 'Combinational vs Sequential Circuits'
    },
    {
        unit: 4,
        type: 'subjective',
        question: "How can a Multiplexer be used as a Universal Logic Module?",
        explanation: "A MUX can implement any Boolean function of $n$ variables using a $2^{(n-1)}:1$ MUX. We connect $(n-1)$ variables to select lines and the remaining variable (or its complement, or 0, or 1) to the data inputs based on the target function's truth table. This makes MUX incredibly versatile for implementing complex logic in FPGAs.",
        difficulty: 'hard',
        topic: 'Multiplexers'
    },
    {
        unit: 4,
        type: 'subjective',
        question: "Explain the working of a BCD to Seven-Segment Decoder.",
        explanation: "This circuit converts a 4-bit Binary Coded Decimal (0-9) into 7 individual signals (labeled a through g) that control the segments of a LED/LCD display. For each input value, the decoder activates the specific combination of segments required to form the visible digit. For example, for input 0000 (0), segments a, b, c, d, e, f are ON and g is OFF.",
        difficulty: 'medium',
        topic: 'Decoders'
    },
    {
        unit: 4,
        type: 'subjective',
        question: "Describe the internal logic of a Half Subtractor and derive expressions for Difference and Borrow.",
        explanation: "A Half Subtractor performs $A - B$. The Difference ($D$) is $A \oplus B$, which is 1 if inputs are different. The Borrow ($Bo$) is $\overline{A} \cdot B$, which is 1 only when $A=0$ and $B=1$ (subtracting 1 from 0 requires a borrow from the next higher stage).",
        difficulty: 'easy',
        topic: 'Subtractors'
    },
    {
        unit: 4,
        type: 'subjective',
        question: "What is a 'Magnitude Comparator' and where is it used in computer systems?",
        explanation: "A Magnitude Comparator is a combinational circuit that compares two binary strings and determines their relative size ($A>B, A=B, A<B$). It is used in ALUs for implementing branching conditions (if, else), sorting algorithms in digital signal processing, and in various threshold detection circuits.",
        difficulty: 'easy',
        topic: 'Combinational vs Sequential Circuits'
    },
    {
        unit: 4,
        type: 'subjective',
        question: "Explain 'Cascading' of multiplexers with an example.",
        explanation: "Cascading is combining smaller MUXs to create a larger one. For example, to build an 8:1 MUX using 2:1 MUXs: you use 4 MUXs in the first level (taking 8 inputs), 2 in the second level, and 1 in the final level. Alternatively, two 4:1 MUXs and one 2:1 MUX can be used. This allows flexible implementation using standard parts.",
        difficulty: 'medium',
        topic: 'Multiplexers'
    },
    {
        unit: 4,
        type: 'subjective',
        question: "Define 'Parity Generator' and 'Parity Checker'.",
        explanation: "A Parity Generator calculates a bit (0 or 1) to be added to a data packet so that the total number of 1s becomes even (Even Parity) or odd (Odd Parity) before transmission. A Parity Checker at the receiver re-calculates the parity to see if a single-bit error occurred during transit. Both primarily use XOR logic.",
        difficulty: 'medium',
        topic: 'Combinational vs Sequential Circuits'
    },
    {
        unit: 4,
        type: 'subjective',
        question: "What is the difference between a 'Binary to Gray' and 'Gray to Binary' code converter?",
        explanation: "Binary to Gray: Preserve MSB; each subsequent Gray bit is the XOR of current and previous Binary bits. Gray to Binary: Preserve MSB; each subsequent Binary bit is the XOR of previous binary bit and the current Gray bit. These are used to resolve ambiguities in physical encoders.",
        difficulty: 'hard',
        topic: 'Combinational vs Sequential Circuits'
    },
    {
        unit: 4,
        type: 'subjective',
        question: "How does a 3-to-8 Decoder work? Mention its input-output relationship.",
        explanation: "It has 3 inputs ($A, B, C$) representing a binary number 000 to 111. It has 8 output lines ($Y_0$ to $Y_7$). For any input combination, exactly one output corresponding to that binary value becomes active (HIGH). For example, if input is 011, $Y_3$ is HIGH and all others are LOW.",
        difficulty: 'easy',
        topic: 'Decoders'
    },
    {
        unit: 4,
        type: 'subjective',
        question: "Explain the role of 'Enable' inputs in combinational logic blocks.",
        explanation: "The Enable input controls the activation of the entire circuit. If Enable is inactive, all outputs are forced to an idle state (usually 0) regardless of the other inputs. This is crucial for bus-sharing architectures where only one component should be driving the shared data line at any given time.",
        difficulty: 'medium',
        topic: 'Decoders'
    },
    {
        unit: 4,
        type: 'subjective',
        question: "Summarize the design of an Octal-to-Binary Encoder.",
        explanation: "An Octal-to-Binary encoder has 8 inputs representing digits 0 to 7 and 3 output lines producing the binary code (000 to 111). Only one input is assumed active at a time. The logic involves ORing the inputs that correspond to a bit being 1 in binary (e.g., Output $A_0 = D_1 + D_3 + D_5 + D_7$).",
        difficulty: 'medium',
        topic: 'Encoders'
    },
    {
        unit: 4,
        type: 'subjective',
        question: "What are the advantages of using MSI (Medium Scale Integration) devices like MUX over individual gates?",
        explanation: "MSI devices reduce chip count on circuit boards, decrease overall cost, simplify PCB routing, improve reliability, and lower power consumption. They provide pre-tested, high-performance logic functions like Adders or Data Selectors that would otherwise require dozens of individual logic gates to implement.",
        difficulty: 'easy',
        topic: 'Quick Revision'
    }
];
