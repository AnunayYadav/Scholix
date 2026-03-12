import { QuizQuestion } from "../../../types.ts";

export const ece249Unit1Subjective: QuizQuestion[] = [
    {
        id: "ece249-s-u1-1",
        unit:unit:unit: 1,
        type: 'subjective',
        question: "Explain Ohm's Law and discuss its limitations in the context of electronic devices like diodes.",
        explanation: "Ohm's Law states that current (I) is directly proportional to voltage (V) across a conductor (V=IR), provided physical conditions like temperature remain constant. Limitations: 1. It only applies to linear conductors (metals). 2. It does not apply to non-ohmic devices like vacuum tubes or semiconductors (diodes, transistors) where the V-I relationship is non-linear. 3. It fails for unilateral networks where current flows in one direction only.",
difficulty: 'medium',
topic: 'Ohm\'s Law'
    },
    {
        id: "ece249-s-u1-2",
        unit:unit:unit: 1,
        type: 'subjective',
        question: "Distinguish between Kirchhoff's Current Law (KCL) and Kirchhoff's Voltage Law (KVL) with their fundamental principles.",
        explanation: "KCL is based on the Law of Conservation of Charge; it states that the algebraic sum of currents meeting at a node is zero (Sum I_in = Sum I_out). KVL is based on the Law of Conservation of Energy; it states that the algebraic sum of all voltages (potential rises and drops) around any closed loop in a circuit is zero (Sum V = 0).",
difficulty: 'medium',
topic: 'Kirchhoff\'s Laws'
    },
    {
        id: "ece249-s-u1-3",
        unit:unit:unit: 1,
        type: 'subjective',
        question: "What are semiconductors? Differentiate between Intrinsic and Extrinsic semiconductors.",
        explanation: "Semiconductors are materials with conductivity between conductors and insulators. Intrinsic semiconductors are pure (e.g., pure Si or Ge) where n_e = n_h. Extrinsic semiconductors are doped with impurities to increase conductivity, resulting in either N-type (pentavalent doping) or P-type (trivalent doping) materials.",
difficulty: 'medium',
topic: 'Basics of Semiconductors'
    },
    {
        id: "ece249-s-u1-4",
        unit:unit:unit: 1,
        type: 'subjective',
        question: "Describe the formation of a PN junction and the concept of the depletion region.",
        explanation: "When a P-type and N-type semiconductor are joined, majority carriers (holes from P and electrons from N) diffuse across the junction and recombine. This leaves behind immobile ions (negative in P, positive in N) near the junction, creating a region empty of mobile charge carriers called the Depletion Region, which sets up a built-in potential barrier.",
difficulty: 'medium',
topic: 'PN Junction Diode'
    },
    {
        id: "ece249-s-u1-5",
        unit:unit:unit: 1,
        type: 'subjective',
        question: "Explain the working of a PN junction diode under Forward and Reverse Bias conditions.",
        explanation: "Forward Bias: P-side connected to positive, N-side to negative. This reduces the depletion width and allows majority carriers to flow easily across the junction. Reverse Bias: P-side to negative, N-side to positive. This pulls carriers away from the junction, widening the depletion region and blocking the majority carrier flow, allowing only a tiny minority carrier leakage current.",
difficulty: 'medium',
topic: 'PN Junction Diode'
    },
    {
        id: "ece249-s-u1-6",
        unit:unit:unit: 1,
        type: 'subjective',
        question: "Define Rectification. Compare Half-wave and Full-wave Bridge rectifiers based on efficiency and PIV.",
        explanation: "Rectification is the process of converting AC to DC. Half-wave: Uses 1 diode, efficiency is 40.6%, PIV = Vm. Full-wave Bridge: Uses 4 diodes, efficiency is 81.2%, PIV = Vm. The bridge rectifier is superior as it doesn't require a center-tap transformer and has better ripple factor.",
difficulty: 'medium',
topic: 'PN Junction Diode'
    },
    {
        id: "ece249-s-u1-7",
        unit:unit:unit: 1,
        type: 'subjective',
        question: "Draw the constructional diagram of an NPN transistor and label its terminals.",
        explanation: "An NPN transistor consists of a thin P-type layer (Base) sandwiched between two N-type layers (Emitter and Collector). The Emitter is heavily doped, the Base is very thin and lightly doped, and the Collector is moderately doped with a large area for heat dissipation.",
difficulty: 'medium',
topic: 'Bipolar Junction Transistor (BJT)'
    },
    {
        id: "ece249-s-u1-8",
        unit:unit:unit: 1,
        type: 'subjective',
        question: "Explain the three modes of BJT operation based on junction biasing.",
        explanation: "1. Active Mode: E-B junction forward biased, C-B junction reverse biased (used for amplification). 2. Saturation Mode: Both junctions forward biased (used as ON switch). 3. Cut-off Mode: Both junctions reverse biased (used as OFF switch).",
difficulty: 'easy',
topic: 'Bipolar Junction Transistor (BJT)'
    },
    {
        id: "ece249-s-u1-9",
        unit:unit:unit: 1,
        type: 'subjective',
        question: "Define the term 'Common Emitter Configuration' and explain why it's the most widely used configuration.",
        explanation: "In CE configuration, the Emitter is common to both input and output. It is widely used because it provides high voltage gain, high current gain (Beta), and a medium input/output impedance, making it ideal for multi-stage amplification.",
difficulty: 'medium',
topic: 'Voltage Division Rule'
    },
    {
        id: "ece249-s-u1-10",
        unit:unit:unit: 1,
        type: 'subjective',
        question: "Derive the relationship between the transistor currents Ib, Ic, and Ie.",
        explanation: "By applying KCL to the transistor as a whole, the total current entering (Emitter current, in NPN) must equal the sum of currents leaving (Base and Collector currents). Thus, Ie = Ib + Ic. Since Ib is very small (typically <5%), Ic is approximately equal to Ie.",
difficulty: 'medium',
topic: 'Current Division Rule'
    },
    {
        id: "ece249-s-u1-11",
        unit:unit:unit: 1,
        type: 'subjective',
        question: "What is Doping? Explain its effect on the energy band structure of a semiconductor.",
        explanation: "Doping is the intentional addition of impurities to a pure semiconductor. For N-type, pentavalent impurities add a 'Donor Energy Level' just below the conduction band, making it easier for electrons to enter the conduction band. For P-type, trivalent impurities add an 'Acceptor Energy Level' just above the valence band, allowing electrons to jump easily from the valence band, creating holes.",
difficulty: 'medium',
topic: 'Basics of Semiconductors'
    },
    {
        id: "ece249-s-u1-12",
        unit:unit:unit: 1,
        type: 'subjective',
        question: "Explain the concept of 'Breakdown' in a PN junction diode (Zener vs. Avalanche).",
        explanation: "Zener Breakdown occurs in heavily doped diodes under reverse bias due to the high electric field pulling electrons out of covalent bonds. Avalanche Breakdown occurs in lightly doped diodes where minority carriers gain enough kinetic energy to knock out more electrons through impact ionization, leading to a cumulative effect.",
difficulty: 'medium',
topic: 'PN Junction Diode'
    },
    {
        id: "ece249-s-u1-13",
        unit:unit:unit: 1,
        type: 'subjective',
        question: "Calculate the DC output voltage of a Bridge Rectifier if the input AC voltage is 20V (RMS).",
        explanation: "Vm = Vrms * sqrt(2) = 20 * 1.414 = 28.28V. Vdc = (2 * Vm) / Pi = (2 * 28.28) / 3.14 = 18.01V. Thus, the DC output is approximately 18V.",
difficulty: 'medium',
topic: 'Voltage Division Rule'
    },
    {
        id: "ece249-s-u1-14",
        unit:unit:unit: 1,
        type: 'subjective',
        question: "What is the 'Early Effect' or Base Width Modulation in a BJT?",
        explanation: "The Early effect is the variation in the effective width of the base due to the variation in the width of the depletion region at the reverse-biased collector-base junction. As collector voltage increases, the depletion region widens, shortening the effective base width, which increases the current gain but can lead to punch-through.",
difficulty: 'easy',
topic: 'Bipolar Junction Transistor (BJT)'
    },
    {
        id: "ece249-s-u1-15",
        unit:unit:unit: 1,
        type: 'subjective',
        question: "Describe the V-I characteristics of a Silicon diode with a neat sketch.",
        explanation: "The V-I characteristic curve shows zero current until the knee voltage (0.7V for Si) in forward bias, followed by an exponential rise. In reverse bias, only a negligible leakage current flows until the breakdown voltage is reached, at which point current increases drastically.",
difficulty: 'medium',
topic: 'Current Division Rule'
    },
    {
        id: "ece249-s-u1-16",
        unit:unit:unit: 1,
        type: 'subjective',
        question: "Why is the Base of a transistor made very thin and lightly doped?",
        explanation: "To ensure that most of the charge carriers injected from the emitter pass through to the collector without recombining in the base. A thin, lightly doped base minimizes recombination, leading to a high current gain (alpha/beta).",
difficulty: 'easy',
topic: 'Current Division Rule'
    },
    {
        id: "ece249-s-u1-17",
        unit:unit:unit: 1,
        type: 'subjective',
        question: "Compare BJT and Field Effect Transistor (FET) briefly.",
        explanation: "BJT is a current-controlled bipolar device (uses both electrons and holes) with low input impedance. FET is a voltage-controlled unipolar device (uses only majority carriers) with very high input impedance and better thermal stability.",
difficulty: 'easy',
topic: 'Bipolar Junction Transistor (BJT)'
    },
    {
        id: "ece249-s-u1-18",
        unit:unit:unit: 1,
        type: 'subjective',
        question: "Explain the term 'Ripple Factor' and its significance in power supplies.",
        explanation: "Ripple Factor is the ratio of the RMS value of the AC component to the DC component in the rectifier output. A lower ripple factor indicates a 'cleaner' DC output. Filters (capacitor/inductor) are used to reduce this ripple.",
difficulty: 'medium',
topic: 'Applications of PN Junction Diode'
    },
    {
        id: "ece249-s-u1-19",
        unit:unit:unit: 1,
        type: 'subjective',
        question: "What is a Center-Tap Transformer and why is it used in some Full-wave rectifiers?",
        explanation: "It is a transformer with a secondary winding that has a connection at its midpoint (center tap). In a full-wave rectifier, it allows two diodes to conduct alternately during different halves of the AC cycle, providing full-wave rectification with only two diodes.",
difficulty: 'medium',
topic: 'PN Junction Diode'
    },
    {
        id: "ece249-s-u1-20",
        unit:unit:unit: 1,
        type: 'subjective',
        question: "Define Beta (Current Gain) of a transistor and give its typical range.",
        explanation: "Beta (B) is the common-emitter current gain, defined as the ratio of collector current to base current (Ic/Ib). Its typical range is from 20 to 500. It signifies how much the input base current is amplified to produce the output collector current.",
difficulty: 'medium',
topic: 'Current Division Rule'
    }
];