import { Flashcard } from "../../../types.ts";

export const unit1Flashcards: Flashcard[] = [
    { unit: 1, front: "What is Ohm's Law?", back: "Current is directly proportional to voltage, provided physical conditions (like temperature) remain constant. V = I * R." },
    { unit: 1, front: "What is the formula for Ohm's Law?", back: "V = I * R (Voltage = Current × Resistance)" },
    { unit: 1, front: "Does Ohm's Law apply to diodes and transistors?", back: "No. They are non-ohmic devices (their V-I curve is not a straight line)." },
    { unit: 1, front: "What is Kirchhoff's Current Law (KCL)?", back: "The algebraic sum of currents entering and leaving a node (junction) is zero. (What goes in must come out)." },
    { unit: 1, front: "What is Kirchhoff's Voltage Law (KVL)?", back: "The algebraic sum of all voltages around any closed loop in a circuit is exactly zero." },
    { unit: 1, front: "When do you use the Voltage Division Rule (VDR)?", back: "In SERIES circuits, to find the voltage across a specific resistor. Formula: V_R1 = V_total * (R1 / (R1 + R2))" },
    { unit: 1, front: "When do you use the Current Division Rule (CDR)?", back: "In PARALLEL circuits, to find the current through a specific branch. Formula: I_R1 = I_total * (R2 / (R1 + R2)) -> Notice you use the OPPOSITE resistor!" },
    { unit: 1, front: "What is an Intrinsic Semiconductor?", back: "A pure semiconductor material (like pure Silicon). At room temp, it has equal numbers of electrons and holes. Very poor conductivity." },
    { unit: 1, front: "What is an Extrinsic Semiconductor?", back: "An impure semiconductor created by 'doping' to drastically increase conductivity." },
    { unit: 1, front: "How is an N-Type Semiconductor formed?", back: "By doping with Pentavalent impurities (e.g., Phosphorus). Electrons become the majority carriers." },
    { unit: 1, front: "How is a P-Type Semiconductor formed?", back: "By doping with Trivalent impurities (e.g., Boron). Holes become the majority carriers." },
    { unit: 1, front: "What is a PN Junction Diode?", back: "Formed by joining P-type and N-type semiconductors. It acts as a one-way valve allowing current to flow in only one direction." },
    { unit: 1, front: "What is the cut-in (knee) voltage of a Silicon Diode?", back: "Approximately 0.7 Volts. You must apply at least 0.7V in forward bias to make it conduct." },
    { unit: 1, front: "How does a diode operate in Forward Bias?", back: "Positive terminal to P-side, Negative to N-side. Shrinks the depletion region, allowing current to flow freely." },
    { unit: 1, front: "How does a diode operate in Reverse Bias?", back: "Positive to N-side, Negative to P-side. Widens the depletion region, blocking current flow." },
    { unit: 1, front: "What is a Rectifier mostly built using?", back: "PN Junction diodes, used to convert Alternating Current (AC) into Direct Current (DC)." },
    { unit: 1, front: "What are the three terminals of a Bipolar Junction Transistor (BJT)?", back: "Emitter (injects carriers), Base (controls flow), and Collector (collects carriers)." },
    { unit: 1, front: "Which BJT terminal is the most heavily doped?", back: "The Emitter (E)." },
    { unit: 1, front: "What is the relationship between currents in a BJT?", back: "I_E = I_B + I_C (Emitter current = Base current + Collector current)" },
    { unit: 1, front: "In a Common Emitter (CE) configuration, how does the transistor amplify?", back: "A very tiny change in Base current controls a massive change in the Collector current." }
];
