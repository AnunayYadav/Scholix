import { QuizQuestion } from '../../../types.ts';

export const mth166Unit2MCQs: QuizQuestion[] = [
    {
        unit: 2,
        topic: 'Linear Differential Equations',
        difficulty: 'easy',
        question: "What is the general form of a linear differential equation of order n?",
        options: ["y^(n) + a1 y^(n-1) + ... + an y = R(x)", "y' + y² = x", "y y' = x", "None of these"],
        correctAnswer: 0,
        explanation: "A linear DE has dependent variable and its derivatives in first degree and not multiplied together."
    },
    {
        unit: 2,
        topic: 'Differential Operator',
        difficulty: 'easy',
        question: "In the context of ODEs, what does the operator 'D' represent?",
        options: ["d/dx", "∫ dx", "d²/dx²", "1/x"],
        correctAnswer: 0,
        explanation: "D is the standard differential operator d/dx."
    },
    {
        unit: 2,
        topic: 'Linear Independence',
        difficulty: 'medium',
        question: "Two solutions y1 and y2 are linearly independent if their Wronskian W(y1, y2) is:",
        options: ["Zero", "Non-zero", "Constant", "Always 1"],
        correctAnswer: 1,
        explanation: "The Wronskian must be non-zero for linear independence."
    },
    {
        unit: 2,
        topic: 'Homogeneous Equations',
        difficulty: 'easy',
        question: "An ODE is called homogeneous if the right-hand side R(x) is:",
        options: ["1", "0", "x", "e^x"],
        correctAnswer: 1,
        explanation: "A homogeneous equation has no term independent of y or its derivatives."
    },
    {
        unit: 2,
        topic: 'Auxiliary Equation',
        difficulty: 'medium',
        question: "The auxiliary equation of (D² + 3D + 2)y = 0 is:",
        options: ["m² + 3m + 2 = 0", "m² + 3 = 0", "m + 2 = 0", "None of these"],
        correctAnswer: 0,
        explanation: "Replacing D with m gives the auxiliary equation."
    },
    {
        unit: 2,
        topic: 'Roots of AE',
        difficulty: 'medium',
        question: "If the roots of the auxiliary equation are m1 = 2 and m2 = 3, the complementary function (CF) is:",
        options: ["C1 e^(2x) + C2 e^(3x)", "C1 e^(-2x) + C2 e^(-3x)", "C1 cos 2x + C2 sin 3x", "None of these"],
        correctAnswer: 0,
        explanation: "For distinct real roots, CF is a sum of exponentials."
    },
    {
        unit: 2,
        topic: 'Repeated Roots',
        difficulty: 'medium',
        question: "If the auxiliary equation has repeated roots m1 = m2 = m, the CF is:",
        options: ["(C1 + C2x)e^(mx)", "C1 e^(mx) + C2 e^(mx)", "C1 e^(mx)", "None of these"],
        correctAnswer: 0,
        explanation: "Repeated roots require adding a factor of x for independence."
    },
    {
        unit: 2,
        topic: 'Complex Roots',
        difficulty: 'hard',
        question: "If the roots of the AE are complex conjugates α ± iβ, the CF is:",
        options: ["e^(αx)[C1 cos βx + C2 sin βx]", "e^(βx)[C1 cos αx + C2 sin αx]", "C1 e^(αx) + C2 e^(βx)", "None of these"],
        correctAnswer: 0,
        explanation: "Complex roots involve oscillating trigonometric functions with an exponential multiplier."
    },
    {
        unit: 2,
        topic: 'Differential Operator',
        difficulty: 'medium',
        question: "The expression (D - a)(D - b)y is equivalent to:",
        options: ["(D² - (a+b)D + ab)y", "(D² + ab)y", "D²y - aby", "None of these"],
        correctAnswer: 0,
        explanation: "Differential operators with constant coefficients follow algebraic polynomial rules."
    },
    {
        unit: 2,
        topic: 'Second Order ODE',
        difficulty: 'medium',
        question: "Find the CF of (D² - 4)y = 0.",
        options: ["C1 e^(2x) + C2 e^(-2x)", "C1 cos 2x + C2 sin 2x", "C1 e^(4x) + C2", "None of these"],
        correctAnswer: 0,
        explanation: "m² - 4 = 0 => m = ±2."
    },
    {
        unit: 2,
        topic: 'Second Order ODE',
        difficulty: 'medium',
        question: "Find the CF of (D² + 4)y = 0.",
        options: ["C1 cos 2x + C2 sin 2x", "C1 e^(2x) + C2 e^(-2x)", "C1 e^(2x) + C2", "None of these"],
        correctAnswer: 0,
        explanation: "m² + 4 = 0 => m = ±2i."
    },
    {
        unit: 2,
        topic: 'Third Order ODE',
        difficulty: 'hard',
        question: "The number of arbitrary constants in the general solution of a 3rd order ODE is:",
        options: ["1", "2", "3", "0"],
        correctAnswer: 2,
        explanation: "The order of the differential equation equals the number of arbitrary constants in its general solution."
    },
    {
        unit: 2,
        topic: 'Higher Order ODE',
        difficulty: 'hard',
        question: "Find the CF of (D - 1)³y = 0.",
        options: ["(C1 + C2x + C3x²)e^x", "C1 e^x + C2 e^x + C3 e^x", "C1 e^x + C2 x e^x", "None of these"],
        correctAnswer: 0,
        explanation: "For three repeated roots, use powers of x up to x²."
    },
    {
        unit: 2,
        topic: 'Linear Independence',
        difficulty: 'medium',
        question: "If y1 = e^x and y2 = e^(2x), are they linearly independent?",
        options: ["Yes", "No", "Only for x > 0", "None of these"],
        correctAnswer: 0,
        explanation: "Wronskian W = e^x(2e^(2x)) - e^(2x)(e^x) = e^(3x) ≠ 0."
    },
    {
        unit: 2,
        topic: 'Operator Theory',
        difficulty: 'medium',
        question: "D(sinh x) is:",
        options: ["cosh x", "-cosh x", "sinh x", "tanh x"],
        correctAnswer: 0,
        explanation: "Derivative of sinh x is cosh x."
    },
    {
        unit: 2,
        topic: 'Operator Theory',
        difficulty: 'medium',
        question: "D(cosh x) is:",
        options: ["sinh x", "-sinh x", "cosh x", "None of these"],
        correctAnswer: 0,
        explanation: "Derivative of cosh x is sinh x."
    },
    {
        unit: 2,
        topic: 'Complementary Function',
        difficulty: 'medium',
        question: "Roots of m² + 2m + 1 = 0 are:",
        options: ["-1, -1", "1, 1", "-1, 1", "0, -1"],
        correctAnswer: 0,
        explanation: "(m+1)² = 0 => m = -1 (repeated)."
    },
    {
        unit: 2,
        topic: 'Higher Order ODE',
        difficulty: 'medium',
        question: "Equation (D² + D + 1)y = 0 has roots:",
        options: ["-1/2 ± i√3/2", "1/2 ± i√3/2", "-1 ± i√3", "None of these"],
        correctAnswer: 0,
        explanation: "Using quadratic formula: m = [-1 ± √(1-4)]/2."
    },
    {
        unit: 2,
        topic: 'Differential Operator',
        difficulty: 'easy',
        question: "Is the operator D linear?",
        options: ["Yes", "No", "Sometimes", "Only for constants"],
        correctAnswer: 0,
        explanation: "D(af + bg) = aD(f) + bD(g), hence it is linear."
    },
    {
        unit: 2,
        topic: 'Homogeneous Equations',
        difficulty: 'medium',
        question: "The principle of superposition states that if y1 and y2 are solutions, then:",
        options: ["C1y1 + C2y2 is also a solution", "y1 * y2 is also a solution", "y1 / y2 is also a solution", "None of these"],
        correctAnswer: 0,
        explanation: "Linear combinations of solutions to homogeneous linear DEs are also solutions."
    },
    {
        unit: 2,
        topic: 'Roots of AE',
        difficulty: 'medium',
        question: "If the roots of AE are 0, 1, 2, the CF is:",
        options: ["C1 + C2e^x + C3e^(2x)", "C1e^x + C2e^(2x)", "C1 + C2x + C3x²", "None"],
        correctAnswer: 0,
        explanation: "m=0 gives C1 e^(0x) = C1."
    },
    {
        unit: 2,
        topic: 'Differential Operator',
        difficulty: 'medium',
        question: "Which of the following is an example of a 2nd order linear homogeneous DE?",
        options: ["y'' + 5y' + 6y = 0", "y'' + yy' = 0", "y'' + y² = 0", "y'' + 5y' + 6y = e^x"],
        correctAnswer: 0,
        explanation: "Coefficients of y and its derivatives are functions of x (or constants) and RHS is 0."
    },
    {
        unit: 2,
        topic: 'Auxiliary Equation',
        difficulty: 'medium',
        question: "The auxiliary equation is obtained by substituting ___ into the differential equation.",
        options: ["y = e^(mx)", "y = x^m", "y = sin(mx)", "y = m"],
        correctAnswer: 0,
        explanation: "This substitution reflects the exponential nature of solutions to constant-coefficient linear DEs."
    },
    {
        unit: 2,
        topic: 'Wronskian',
        difficulty: 'hard',
        question: "The Wronskian of y1 = cos x and y2 = sin x is:",
        options: ["1", "0", "-1", "sin x cos x"],
        correctAnswer: 0,
        explanation: "W = cos x(cos x) - sin x(-sin x) = cos²x + sin²x = 1."
    },
    {
        unit: 2,
        topic: 'Differential Operator',
        difficulty: 'easy',
        question: "The degree of the operator D² + 3D + 2 is:",
        options: ["2", "1", "0", "None"],
        correctAnswer: 0,
        explanation: "Refers to the highest power of the differential operator."
    },
    {
        unit: 2,
        topic: 'Linear ODE',
        difficulty: 'easy',
        question: "Is y''' + 6y'' + 11y' + 6y = 0 linear?",
        options: ["Yes", "No", "Only if y=0", "None"],
        correctAnswer: 0,
        explanation: "All y terms and their derivatives are in first degree."
    },
    {
        unit: 2,
        topic: 'Roots of AE',
        difficulty: 'medium',
        question: "If roots of AE are m = 3, 3, the CF is:",
        options: ["(C1 + C2x)e^(3x)", "C1e^(3x) + C2e^(3x)", "C1e^(3x)", "None"],
        correctAnswer: 0,
        explanation: "Repeated roots case."
    },
    {
        unit: 2,
        topic: 'Roots of AE',
        difficulty: 'medium',
        question: "If roots of AE are m = ±i, the CF is:",
        options: ["C1 cos x + C2 sin x", "C1 e^x + C2 e^-x", "C1 cosh x + C2 sinh x", "None"],
        correctAnswer: 0,
        explanation: "Purely imaginary roots lead to sine and cosine."
    },
    {
        unit: 2,
        topic: 'Fundamental Set',
        difficulty: 'hard',
        question: "A set of n linearly independent solutions of an nth order linear DE is called:",
        options: ["Fundamental set of solutions", "General solution", "Basis", "Both A and C"],
        correctAnswer: 3,
        explanation: "They form a basis for the solution space."
    },
    {
        unit: 2,
        topic: 'Wronskian',
        difficulty: 'medium',
        question: "If W(y1, y2) = 0 for all x in an interval, then y1 and y2 are:",
        options: ["Linearly dependent", "Linearly independent", "Orthogonal", "None"],
        correctAnswer: 0,
        explanation: "Standard property of the Wronskian for solutions of linear DEs."
    },
    {
        unit: 2,
        topic: 'Repeated Complex Roots',
        difficulty: 'hard',
        question: "If roots are (1±2i) repeated twice, the CF involves:",
        options: ["(C1+C2x)e^x cos 2x + (C3+C4x)e^x sin 2x", "e^x(C1 cos 2x + C2 sin 2x)", "C1e^x + C2e^x", "None"],
        correctAnswer: 0,
        explanation: "Apply the 'repeated roots' rule to the complex terms."
    },
    {
        unit: 2,
        topic: 'Differential Operator',
        difficulty: 'medium',
        question: "The inverse operator 1/D stands for:",
        options: ["Integration", "Differentiation", "Reciprocal", "None"],
        correctAnswer: 0,
        explanation: "1/D is defined such that D(1/D)y = y."
    },
    {
        unit: 2,
        topic: 'Homogeneous ODE',
        difficulty: 'easy',
        question: "The equation y'' - y = 0 is a:",
        options: ["Second-order homogeneous linear DE", "First-order DE", "Non-linear DE", "None"],
        correctAnswer: 0,
        explanation: "Order-2, rhs=0, linear."
    },
    {
        unit: 2,
        topic: 'Solution curve',
        difficulty: 'medium',
        question: "Does y = e^x satisfy y'' - y = 0?",
        options: ["Yes", "No", "Only for x=0", "None"],
        correctAnswer: 0,
        explanation: "y' = e^x, y'' = e^x. e^x - e^x = 0."
    },
    {
        unit: 2,
        topic: 'Solution curve',
        difficulty: 'medium',
        question: "Does y = e^-x satisfy y'' - y = 0?",
        options: ["Yes", "No", "Only for x=0", "None"],
        correctAnswer: 0,
        explanation: "y' = -e^-x, y'' = e^-x. e^-x - e^-x = 0."
    },
    {
        unit: 2,
        topic: 'Roots of AE',
        difficulty: 'medium',
        question: "For (D² - 5D + 6)y = 0, the roots are:",
        options: ["2, 3", "-2, -3", "1, 6", "None"],
        correctAnswer: 0,
        explanation: "m² - 5m + 6 = (m-2)(m-3) = 0."
    },
    {
        unit: 2,
        topic: 'Roots of AE',
        difficulty: 'medium',
        question: "For (D² + 2D + 5)y = 0, the roots are:",
        options: ["-1 ± 2i", "1 ± 2i", "-1 ± i", "None"],
        correctAnswer: 0,
        explanation: "m = [-2 ± √(4 - 20)] / 2 = -1 ± 2i."
    },
    {
        unit: 2,
        topic: 'Operator Theory',
        difficulty: 'medium',
        question: "f(D) y = 0 has a solution y = c e^(mx) if:",
        options: ["f(m) = 0", "f(0) = m", "f(m) = y", "None"],
        correctAnswer: 0,
        explanation: "m must be a root of the auxiliary polynomial."
    },
    {
        unit: 2,
        topic: 'Initial Value Problem',
        difficulty: 'hard',
        question: "A 2nd order DE with conditions y(0)=a, y'(0)=b is an:",
        options: ["Initial Value Problem (IVP)", "Boundary Value Problem (BVP)", "Eigenvalue Problem", "None"],
        correctAnswer: 0,
        explanation: "Conditions are specified at a single point."
    },
    {
        unit: 2,
        topic: 'Boundary Value Problem',
        difficulty: 'hard',
        question: "A 2nd order DE with conditions y(0)=a, y(1)=b is a:",
        options: ["Boundary Value Problem (BVP)", "Initial Value Problem (IVP)", "None", "Both"],
        correctAnswer: 0,
        explanation: "Conditions are specified at different points (boundaries)."
    },
    {
        unit: 2,
        topic: 'Linear ODE',
        difficulty: 'medium',
        question: "In y'' + P(x)y' + Q(x)y = 0, P and Q must be continuous for:",
        options: ["Existence and uniqueness of solutions", "Linearity", "Calculating Wronskian only", "None"],
        correctAnswer: 0,
        explanation: "Required for the fundamental existence and uniqueness theorem."
    },
    {
        unit: 2,
        topic: 'Auxiliary Equation',
        difficulty: 'easy',
        question: "What is the AE of y'' - 9y = 0?",
        options: ["m² - 9 = 0", "m - 9 = 0", "m² + 9 = 0", "None"],
        correctAnswer: 0,
        explanation: "D is replaced by m."
    },
    {
        unit: 2,
        topic: 'General Solution',
        difficulty: 'medium',
        question: "The general solution of y'' - 9y = 0 is:",
        options: ["C1 e^(3x) + C2 e^(-3x)", "C1 cos 3x + C2 sin 3x", "C1 e^(9x) + C2", "None"],
        correctAnswer: 0,
        explanation: "m = ±3."
    },
    {
        unit: 2,
        topic: 'General Solution',
        difficulty: 'medium',
        question: "The general solution of y'' + 9y = 0 is:",
        options: ["C1 cos 3x + C2 sin 3x", "C1 e^(3x) + C2 e^(-3x)", "C1 e^(9x) + C2", "None"],
        correctAnswer: 0,
        explanation: "m = ±3i."
    },
    {
        unit: 2,
        topic: 'Third Order ODE',
        difficulty: 'medium',
        question: "The auxiliary equation of y''' - y'' = 0 is:",
        options: ["m³ - m² = 0", "m³ - 1 = 0", "m - 1 = 0", "None"],
        correctAnswer: 0,
        explanation: "m²(m-1) = 0."
    },
    {
        unit: 2,
        topic: 'Third Order ODE',
        difficulty: 'hard',
        question: "The roots of m³ - m² = 0 are:",
        options: ["0, 0, 1", "0, 1, 1", "0, 1, -1", "None"],
        correctAnswer: 0,
        explanation: "m=0 (repeated) and m=1."
    },
    {
        unit: 2,
        topic: 'Third Order ODE',
        difficulty: 'hard',
        question: "The CF for r oots 0, 0, 1 is:",
        options: ["C1 + C2x + C3e^x", "C1e^x + C2e^x", "C1 + C2e^x", "None"],
        correctAnswer: 0,
        explanation: "(C1 + C2x)e^(0x) + C3 e^(1x)."
    },
    {
        unit: 2,
        topic: 'Linear independence',
        difficulty: 'medium',
        question: "Are x and x² linearly independent?",
        options: ["Yes", "No", "Only if x=0", "None"],
        correctAnswer: 0,
        explanation: "Their ratio x²/x = x is not a constant."
    },
    {
        unit: 2,
        topic: 'Higher Order ODE',
        difficulty: 'hard',
        question: "A DE of order 4 has how many independent solutions?",
        options: ["4", "1", "2", "0"],
        correctAnswer: 0,
        explanation: "Matches the order n."
    },
    {
        unit: 2,
        topic: 'Auxiliary Equation',
        difficulty: 'medium',
        question: "The AE of (D² + 1)²y = 0 is:",
        options: ["(m² + 1)² = 0", "m² + 1 = 0", "m⁴ + 1 = 0", "None"],
        correctAnswer: 0,
        explanation: "Direct substitution."
    },
    {
        unit: 2,
        topic: 'Roots of AE',
        difficulty: 'hard',
        question: "The roots of (m² + 1)² = 0 are:",
        options: ["±i, ±i (repeated)", "±i", "±1, ±1", "None"],
        correctAnswer: 0,
        explanation: "m² = -1 solved twice."
    },
    {
        unit: 2,
        topic: 'General Solution',
        difficulty: 'hard',
        question: "CF for roots ±i, ±i is:",
        options: ["(C1 + C2x)cos x + (C3 + C4x)sin x", "C1 cos x + C2 sin x", "C1 e^x + C2 e^-x", "None"],
        correctAnswer: 0,
        explanation: "Repeated complex roots rule."
    },
    {
        unit: 2,
        topic: 'ODE Property',
        difficulty: 'medium',
        question: "Linear DEs with constant coefficients are always solvable?",
        options: ["Yes, can always find CF", "No", "Only if order < 3", "None"],
        correctAnswer: 0,
        explanation: "We can always find roots of the polynomial (though finding them analytically might be hard for high degrees)."
    },
    {
        unit: 2,
        topic: 'Operator Theory',
        difficulty: 'medium',
        question: "Is D(fg) = fDg + gDf?",
        options: ["Yes", "No", "Only if f is const", "None"],
        correctAnswer: 0,
        explanation: "Product rule for differentiation."
    },
    {
        unit: 2,
        topic: 'Exponential solution',
        difficulty: 'easy',
        question: "If m is a root of AE, then ___ is a solution of homogeneous DE.",
        options: ["e^(mx)", "x^m", "sin mx", "None"],
        correctAnswer: 0,
        explanation: "Standard form for constant coefficient linear DEs."
    },
    {
        unit: 2,
        topic: 'Wronskian',
        difficulty: 'hard',
        question: "Abel's Identity relates the Wronskian to the ___ of the DE.",
        options: ["Coefficient of (n-1)th derivative", "Constant term", "Highest derivative", "None"],
        correctAnswer: 0,
        explanation: "W(x) = C e^-∫P1(x)dx."
    },
    {
        unit: 2,
        topic: 'Existence',
        difficulty: 'medium',
        question: "The general solution of an nth order linear DE has exactly n arbitrary constants?",
        options: ["True", "False", "Only for homogeneous", "None"],
        correctAnswer: 0,
        explanation: "By definition and uniqueness theorems."
    },
    {
        unit: 2,
        topic: 'Operator Theory',
        difficulty: 'medium',
        question: "The value of f(D) e^(ax) is:",
        options: ["f(a) e^(ax)", "f'(a) e^(ax)", "e^(ax) / f(a)", "None"],
        correctAnswer: 0,
        explanation: "Basic property of the differential operator acting on an exponential."
    },
    {
        unit: 2,
        topic: 'Roots of AE',
        difficulty: 'medium',
        question: "Roots of m² - 2m + 1 = 0 are:",
        options: ["1, 1", "-1, -1", "0, 1", "None"],
        correctAnswer: 0,
        explanation: "(m-1)² = 0."
    },
    {
        unit: 2,
        topic: 'General Solution',
        difficulty: 'medium',
        question: "General solution of y'' - 2y' + y = 0 is:",
        options: ["(C1 + C2x)e^x", "C1 e^x + C2 e^-x", "C1 cos x + C2 sin x", "None"],
        correctAnswer: 0,
        explanation: "Repeated roots m=1."
    },
    {
        unit: 2,
        topic: 'Linear independence',
        difficulty: 'easy',
        question: "Are e^x and 2e^x linearly independent?",
        options: ["No", "Yes", "Depends on x", "None"],
        correctAnswer: 0,
        explanation: "One is a constant multiple of the other."
    },
    {
        unit: 2,
        topic: 'Operator Theory',
        difficulty: 'easy',
        question: "D² (sin x) =",
        options: ["-sin x", "cos x", "sin x", "None"],
        correctAnswer: 0,
        explanation: "D(sin x) = cos x, D(cos x) = -sin x."
    },
    {
        unit: 2,
        topic: 'Operator Theory',
        difficulty: 'easy',
        question: "D² (e^2x) =",
        options: ["4e^2x", "2e^2x", "e^2x", "None"],
        correctAnswer: 0,
        explanation: "Derivative of e^ax is a e^ax, second is a² e^ax."
    },
    {
        unit: 2,
        topic: 'Higher Order ODE',
        difficulty: 'medium',
        question: "Order of (D² + 1)³ y = 0?",
        options: ["6", "2", "3", "None"],
        correctAnswer: 0,
        explanation: "Expanding operator gives highest power D⁶."
    },
    {
        unit: 2,
        topic: 'Roots of AE',
        difficulty: 'medium',
        question: "Roots of m³ - 1 = 0 are:",
        options: ["1, ω, ω²", "1, 1, 1", "-1, -1, -1", "None"],
        correctAnswer: 0,
        explanation: "Cube roots of unity (1 and complex conjugates)."
    },
    {
        unit: 2,
        topic: 'Roots of AE',
        difficulty: 'hard',
        question: "CF for roots 1, -1/2 ± i√3/2 is:",
        options: ["C1e^x + e^(-x/2)[C2 cos(√3x/2) + C3 sin(√3x/2)]", "C1e^x + C2e^-x", "None", "Both"],
        correctAnswer: 0,
        explanation: "Standard complex root formula application."
    },
    {
        unit: 2,
        topic: 'Linear independence',
        difficulty: 'medium',
        question: "Wronskian of e^x and xe^x is:",
        options: ["e^(2x)", "0", "1", "None"],
        correctAnswer: 0,
        explanation: "W = e^x(e^x + xe^x) - xe^x(e^x) = e^(2x) + xe^(2x) - xe^(2x) = e^(2x)."
    },
    {
        unit: 2,
        topic: 'Higher Order ODE',
        difficulty: 'easy',
        question: "Which term is missing in a homogeneous DE?",
        options: ["Term independent of y and its derivatives", "y term", "y' term", "None"],
        correctAnswer: 0,
        explanation: "RHS must be 0 for it to be homogeneous."
    },
    {
        unit: 2,
        topic: 'Formation',
        difficulty: 'hard',
        question: "The DE satisfying y = C1 cos x + C2 sin x is:",
        options: ["y'' + y = 0", "y'' - y = 0", "y' + y = 0", "None"],
        correctAnswer: 0,
        explanation: "m = ±i => m² = -1 => D² + 1 = 0."
    },
    {
        unit: 2,
        topic: 'Roots of AE',
        difficulty: 'medium',
        question: "Roots of m² + 4m + 4 = 0 are:",
        options: ["-2, -2", "2, 2", "-2, 2", "None"],
        correctAnswer: 0,
        explanation: "(m+2)² = 0."
    },
    {
        unit: 2,
        topic: 'General Solution',
        difficulty: 'medium',
        question: "Solution of y'' + 4y' + 4y = 0:",
        options: ["(C1 + C2x)e^-2x", "C1 e^2x + C2 e^-2x", "C1 cos 2x + C2 sin 2x", "None"],
        correctAnswer: 0,
        explanation: "Repeated roots m=-2."
    },
    {
        unit: 2,
        topic: 'Operator Theory',
        difficulty: 'medium',
        question: "If y = CF + PI, and it is a homogeneous equation, then PI is:",
        options: ["0", "1", "f(x)", "None"],
        correctAnswer: 0,
        explanation: "Homogeneous equations have 0 on RHS, so PI is 0."
    },
    {
        unit: 2,
        topic: 'Linear ODE',
        difficulty: 'easy',
        question: "Is y'' + 5y' + 6y = 0 a valid linear ODE with constant coefficients?",
        options: ["Yes", "No", "Only if y=0", "None"],
        correctAnswer: 0,
        explanation: "Coefficients are 1, 5, 6 (constants)."
    },
    {
        unit: 2,
        topic: 'Roots of AE',
        difficulty: 'medium',
        question: "Roots of AE for y'' + 5y' + 6y = 0 are:",
        options: ["-2, -3", "2, 3", "1, 6", "None"],
        correctAnswer: 0,
        explanation: "m² + 5m + 6 = (m+2)(m+3) = 0."
    },
    {
        unit: 2,
        topic: 'Differential Operator',
        difficulty: 'medium',
        question: "D² (x²) =",
        options: ["2", "2x", "x", "0"],
        correctAnswer: 0,
        explanation: "D(x²) = 2x, D(2x) = 2."
    },
    {
        unit: 2,
        topic: 'Differential Operator',
        difficulty: 'medium',
        question: "D³ (x²) =",
        options: ["0", "2", "6", "None"],
        correctAnswer: 0,
        explanation: "Derivative of a constant (2) is 0."
    },
    {
        unit: 2,
        topic: 'Operator Theory',
        difficulty: 'hard',
        question: "f(D) (y1 + y2) is equal to:",
        options: ["f(D)y1 + f(D)y2", "f(D)y1 * f(D)y2", "f(D) y1 / y2", "None"],
        correctAnswer: 0,
        explanation: "Property of linear operators."
    },
    {
        unit: 2,
        topic: 'Higher Order ODE',
        difficulty: 'medium',
        question: "How many constants in y''' = 0?",
        options: ["3", "1", "0", "None"],
        correctAnswer: 0,
        explanation: "Integration constant added thrice: Ax² + Bx + C."
    },
    {
        unit: 2,
        topic: 'General Solution',
        difficulty: 'medium',
        question: "General solution of y''' = 0 is:",
        options: ["C1x² + C2x + C3", "C1e^x", "C1x³", "None"],
        correctAnswer: 0,
        explanation: "Obtained by successive integration."
    },
    {
        unit: 2,
        topic: 'Roots of AE',
        difficulty: 'medium',
        question: "For (D² - 1)y = 0, solution is:",
        options: ["C1 e^x + C2 e^-x", "C1 cos x + C2 sin x", "C1 cosh x + C2 sinh x", "Both A and C"],
        correctAnswer: 3,
        explanation: "Linear combinations of exponentials can be rewritten using hyperbolic functions."
    },
    {
        unit: 2,
        topic: 'Solution type',
        difficulty: 'easy',
        question: "A solution which contains NO arbitrary constants is called:",
        options: ["Particular solution", "General solution", "Singular solution", "Both A and C could be correct"],
        correctAnswer: 3,
        explanation: "Depending on whether it can be derived from the general solution."
    },
    {
        unit: 2,
        topic: 'Existence',
        difficulty: 'medium',
        question: "Differential equation of all parabolas y² = 4ax has order:",
        options: ["1", "2", "0", "None"],
        correctAnswer: 0,
        explanation: "Only one arbitrary constant 'a'."
    },
    {
        unit: 2,
        topic: 'Linear independent',
        difficulty: 'medium',
        question: "Are sin x and cos x linearly independent?",
        options: ["Yes", "No", "Only for x=0", "None"],
        correctAnswer: 0,
        explanation: "Wronskian is 1 ≠ 0."
    },
    {
        unit: 2,
        topic: 'Linear independent',
        difficulty: 'medium',
        question: "Are sin x and sin(x+π) linearly independent?",
        options: ["No", "Yes", "None", "Both"],
        correctAnswer: 0,
        explanation: "sin(x+π) = -sin x, which is a multiple of sin x."
    },
    {
        unit: 2,
        topic: 'Roots of AE',
        difficulty: 'medium',
        question: "Roots for y'' = 0 are:",
        options: ["0, 0", "1, 1", "0, 1", "None"],
        correctAnswer: 0,
        explanation: "m² = 0."
    },
    {
        unit: 2,
        topic: 'Roots of AE',
        difficulty: 'medium',
        question: "Roots for y'' - y' = 0 are:",
        options: ["0, 1", "0, 0", "1, 1", "None"],
        correctAnswer: 0,
        explanation: "m(m-1) = 0."
    },
    {
        unit: 2,
        topic: 'Solution curve',
        difficulty: 'easy',
        question: "y = x is a solution to y'' = 0?",
        options: ["Yes", "No", "None", "Both"],
        correctAnswer: 0,
        explanation: "y' = 1, y'' = 0."
    },
    {
        unit: 2,
        topic: 'Operator Theory',
        difficulty: 'medium',
        question: "Value of (D - a) e^(ax) is:",
        options: ["0", "a e^(ax)", "e^(ax)", "None"],
        correctAnswer: 0,
        explanation: "D(e^ax) = a e^ax, so (D-a)e^ax = 0."
    },
    {
        unit: 2,
        topic: 'Roots of AE',
        difficulty: 'medium',
        question: "If roots of a 4th order DE are 1, 1, 1, 1, CF is:",
        options: ["(C1 + C2x + C3x² + C4x³)e^x", "C1e^x", "None", "Both"],
        correctAnswer: 0,
        explanation: "Each repeated root adds a power of x."
    },
    {
        unit: 2,
        topic: 'Wronskian',
        difficulty: 'hard',
        question: "The Wronskian of 1, x, x² is:",
        options: ["2", "0", "x", "None"],
        correctAnswer: 0,
        explanation: "Determinant of [[1, x, x²], [0, 1, 2x], [0, 0, 2]] = 2."
    },
    {
        unit: 2,
        topic: 'Roots of AE',
        difficulty: 'medium',
        question: "AE of y'' + 2y' + 2y = 0 roots are:",
        options: ["-1 ± i", "1 ± i", "-2 ± i", "None"],
        correctAnswer: 0,
        explanation: "m = [-2 ± √(4-8)]/2 = -1 ± i."
    },
    {
        unit: 2,
        topic: 'General Solution',
        difficulty: 'medium',
        question: "Solution of y'' + 2y' + 2y = 0 is:",
        options: ["e^-x (C1 cos x + C2 sin x)", "e^x (C1 cos x + C2 sin x)", "None", "Both"],
        correctAnswer: 0,
        explanation: "α = -1, β = 1."
    },
    {
        unit: 2,
        topic: 'Linearity',
        difficulty: 'easy',
        question: "Is y'' + sin y = 0 linear?",
        options: ["No", "Yes", "Depends on x", "None"],
        correctAnswer: 0,
        explanation: "sin y term violates linearity."
    },
    {
        unit: 2,
        topic: 'Linearity',
        difficulty: 'easy',
        question: "Is y'' + x²y = 0 linear?",
        options: ["Yes", "No", "Depends on y", "None"],
        correctAnswer: 0,
        explanation: "Coefficients can be functions of x."
    },
    {
        unit: 2,
        topic: 'Order',
        difficulty: 'easy',
        question: "Order of the DE (dy/dx)⁴ + y = 0 is:",
        options: ["1", "4", "0", "None"],
        correctAnswer: 0,
        explanation: "Highest derivative is 1st order."
    },
    {
        unit: 2,
        topic: 'Standard form',
        difficulty: 'easy',
        question: "For n=2, linear DE is y'' + Py' + Qy = R. If P, Q are constants, it is:",
        options: ["Linear DE with constant coefficients", "Variables separable", "Exact", "None"],
        correctAnswer: 0,
        explanation: "Standard terminology."
    },
    {
        unit: 2,
        topic: 'Solution Space',
        difficulty: 'hard',
        question: "The set of solutions to a homogeneous linear DE forms a:",
        options: ["Vector Space", "Group", "Ring", "Field"],
        correctAnswer: 0,
        explanation: "Standard linear algebra result for DEs."
    },
    {
        unit: 2,
        topic: 'Dimension',
        difficulty: 'hard',
        question: "Dimension of solution space for nth order homogeneous linear DE is:",
        options: ["n", "1", "Infinity", "0"],
        correctAnswer: 0,
        explanation: "There are n linearly independent basic solutions."
    },
    {
        unit: 2,
        topic: 'Differential Operator',
        difficulty: 'medium',
        question: "(D - 1)(D + 1) y is:",
        options: ["y'' - y", "y'' + y", "y' - y", "None"],
        correctAnswer: 0,
        explanation: "D² - 1 operator applied to y."
    },
    {
        unit: 2,
        topic: 'Operator Theory',
        difficulty: 'medium',
        question: "Does (D-a)(D-b) = (D-b)(D-a)?",
        options: ["Yes (for constant coefficients)", "No", "Only if a=b", "None"],
        correctAnswer: 0,
        explanation: "Operators commute if coefficients are constants."
    }
];
