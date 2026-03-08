import { Flashcard } from "../../../types.ts";

export const unit5Flashcards: Flashcard[] = [
    { unit: 5, front: "What is a Sequential Logic Circuit?", back: "Digital circuits whose outputs depend not only on CURRENT inputs but also heavily on PAST state inputs via memory loops." },
    { unit: 5, front: "What is a Latch?", back: "A primary bistable memory element constructed from heavily cross-coupled NOR or NAND gates. It is continuously 'Level-Sensitive'." },
    { unit: 5, front: "What is the Invalid/Forbidden state in an SR Latch?", back: "`S=1, R=1`. Both outputs (Q and Q') simultaneously attempt to reach identical logic low states (`0`), which is wildly unpredictable electrically." },
    { unit: 5, front: "What is a D (Data) Latch?", back: "Designed specifically to solve the SR Latch's invalid `1,1` state by connecting R to the inverted S via an internal inverter." },
    { unit: 5, front: "What specifically converts Latches into Flip-Flops?", back: "An explicit Clock signal circuitry that only registers on immediate instantaneous edge transitions!" },
    { unit: 5, front: "Latches vs Flip-flops?", back: "Latches = Level-Sensitive (continuous windows). Flip-flops = Edge-Triggered (millisecond camera snapshots)." },
    { unit: 5, front: "What is an Edged-Triggered Clock?", back: "Data inputs are strictly ONLY sampled exactly when the clock abruptly transitions from LOW to HIGH (or HIGH to LOW)." },
    { unit: 5, front: "What is a JK Flip-Flop?", back: "Universal Flip-Flop solving the SR Latch's generic forbidden state by turning the `J=1, K=1` input combination into a deliberate purely 'toggling' state." },
    { unit: 5, front: "What is a T (Toggle) Flip-Flop?", back: "Consists purely of tying J and K inputs together to rapidly build divided frequency counters. Output simply flips its state constantly if T is HIGH." },
    { unit: 5, front: "What is an Excitation Table?", back: "Opposite of Truth Tables: tells you exactly 'If you currently have Q=0 and DESIRE Q=1, what manual inputs drastically must you apply?'" },
    { unit: 5, front: "What is the characteristic equation for a D Flip-flop?", back: "`Q_next = D`. Very simple exact Delay register." },
    { unit: 5, front: "What solves the 'Race Around' uncontrollability condition heavily present in standard high-speed JK flip-flops?", back: "The Master-Slave Configuration! The Master loads precisely during HIGH, but completely locks out the isolated Slave until exactly LOW." }
];
