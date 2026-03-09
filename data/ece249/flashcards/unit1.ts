import { Flashcard } from "../../../types.ts";

export const unit1Flashcards: Flashcard[] = [
    { unit: 1, front: "What is the formula for Ohm's Law?", back: "The formula is $V = I \\times R$, where $V$ is voltage, $I$ is current, and $R$ is resistance." },
    { unit: 1, front: "Does Ohm's Law apply to non-linear devices like diodes?", back: "No. Ohm's law ($V = I \\times R$) is only valid for linear devices where temperature and physical conditions are constant." },
    { unit: 1, front: "What is Kirchhoff's Current Law (KCL)?", back: "The algebraic sum of currents meeting at a node is zero: $\\sum I = 0$. (Total current entering = Total current leaving)." },
    { unit: 1, front: "What is Kirchhoff's Voltage Law (KVL)?", back: "The algebraic sum of all voltages around any closed loop in a circuit is zero: $\\sum V = 0$. It is based on the conservation of energy." },
    { unit: 1, front: "What is the Voltage Division Rule (VDR) formula for two series resistors?", back: "To find voltage across $R_1$: $V_1 = V \\times \\frac{R_1}{R_1 + R_2}$. Use the resistor you WANT on top." },
    { unit: 1, front: "What is the Current Division Rule (CDR) formula for two parallel resistors?", back: "To find current through $R_1$: $I_1 = I \\times \\frac{R_2}{R_1 + R_2}$. Use the OPPOSITE resistor on top." },
    { unit: 1, front: "What is an Intrinsic Semiconductor?", back: "A pure semiconductor (like pure Si or Ge) with no impurities. At room temperature, $n_e = n_h$." },
    { unit: 1, front: "How is an N-Type Semiconductor formed and what are its majority carriers?", back: "Formed by doping with Pentavalent impurities (e.g., Phosphorus). Majority carriers are electrons." },
    { unit: 1, front: "How is a P-Type Semiconductor formed and what are its majority carriers?", back: "Formed by doping with Trivalent impurities (e.g., Boron). Majority carriers are holes." },
    { unit: 1, front: "What is the built-in potential barrier ($V_0$) for a Silicon diode?", back: "For a Silicon diode, the potential barrier is approximately $0.7\\,V$." },
    { unit: 1, front: "What happens to the depletion region during Forward Bias?", back: "The depletion region narrows, allowing current to flow as the applied voltage overcomes the barrier potential." },
    { unit: 1, front: "What happens to the depletion region during Reverse Bias?", back: "The depletion region widens, acting as an open switch and allowing only a tiny reverse saturation current ($I_0$) to flow." },
    { unit: 1, front: "What is the DC output voltage formula for a Half-Wave Rectifier?", back: "The DC output voltage is $V_{dc} = \\frac{V_m}{\\pi}$." },
    { unit: 1, front: "What is the DC output voltage formula for a Full-Wave Rectifier?", back: "The DC output voltage is $V_{dc} = \\frac{2V_m}{\\pi}$." },
    { unit: 1, front: "What is the efficiency ($\\eta$) of a Full-Wave Rectifier?", back: "The efficiency of a Full-Wave Rectifier is $81.2\\%$." },
    { unit: 1, front: "What are the three terminals of a Bipolar Junction Transistor (BJT)?", back: "Emitter (E), Base (B), and Collector (C)." },
    { unit: 1, front: "Which region of a BJT is the most heavily doped?", back: "The Emitter is the most heavily doped to inject a large number of charge carriers." },
    { unit: 1, front: "What is the formula connecting Emitter, Base, and Collector currents in a BJT?", back: "The formula is $I_E = I_B + I_C$." },
    { unit: 1, front: "What is the formula for Common Emitter current gain ($\\beta$)?", back: "The current gain is $\\beta = \\frac{I_C}{I_B}$." },
    { unit: 1, front: "How do you calculate $\\beta$ if $\\alpha$ is given?", back: "The formula is $\\beta = \\frac{\\alpha}{1 - \\alpha}$." }
];
