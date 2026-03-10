import { QuizQuestion } from "../../../types.ts";

export const cse101Unit1Subjective: QuizQuestion[] = [
    {
        unit: 1,
        type: 'subjective',
        question: "Explain the history and evolution of the C programming language.",
        explanation: "C was developed by Dennis Ritchie at Bell Labs in the early 1970s (1972) to rewrite the UNIX operating system. It evolved from B and BCPL languages. C is known as a 'Middle-level' language because it combines the power of low-level assembly (hardware access) with the ease of high-level languages (structured logic). Its popularity led to standards like ANSI C (C89/C90), C99, C11, and C18.",
        difficulty: 'easy',
        topic: 'The C character set'
    },
    {
        unit: 1,
        type: 'subjective',
        question: "Differentiate between an Identifier and a Keyword in C.",
        explanation: "Keywords (e.g., int, if, while) are reserved words with a predefined meaning to the compiler; they cannot be redefined. Identifiers (e.g., student_id, total) are user-defined names given to variables, functions, or arrays. Identifiers must follow naming rules: they can start with a letter or underscore, and can contain alphanumeric characters, but cannot be a keyword.",
        difficulty: 'easy',
        topic: 'Identifiers and keywords'
    },
    {
        unit: 1,
        type: 'subjective',
        question: "What are 'Data Types' in C? Discuss Primary Data Types with their sizes.",
        explanation: "Data types specify the type and size of data a variable can hold. Primary types include: 1. char (1 byte, for characters), 2. int (usually 2 or 4 bytes, for integers), 3. float (4 bytes, for single-precision decimals), and 4. double (8 bytes, for double-precision decimals). There is also 'void', representing an empty set of values.",
        difficulty: 'medium',
        topic: 'Data types'
    },
    {
        unit: 1,
        type: 'subjective',
        question: "Explain 'Type Casting' (Implicit vs. Explicit) in C expressions.",
        explanation: "Type casting is converting one data type to another. Implicit Casting (Type Promotion) is done automatically by the compiler when operations involve different types (e.g., int + float results in float). Explicit Casting is forced by the programmer using parentheses, like `(int) 3.5`, which truncates the value to 3. Explicit casting is used to prevent data loss or force specific precision.",
        difficulty: 'medium',
        topic: 'Expressions'
    },
    {
        unit: 1,
        type: 'subjective',
        question: "Discuss the 'Precedence' and 'Associativity' of operators with examples.",
        explanation: "Operator Precedence decides the order in which operators are evaluated (e.g., * has higher priority than +). Associativity decides the order when operators of the same precedence appear together (e.g., + is left-to-right, so $a+b+c$ is $(a+b)+c$; assignment = is right-to-left). Understanding these prevents logical errors in complex formulas.",
        difficulty: 'hard',
        topic: 'The C character set'
    },
    {
        unit: 1,
        type: 'subjective',
        question: "Explain the purpose and usage of 'Bitwise Operators' in C.",
        explanation: "Bitwise operators perform operations at the binary level. Main operators are: & (AND), | (OR), ^ (XOR), ~ (NOT), << (Left Shift), and >> (Right Shift). They are used for low-level tasks like setting/clearing flags, hardware register manipulation, and optimizing calculations (e.g., x << 1 is faster than x * 2).",
        difficulty: 'hard',
        topic: 'Bitwise operators'
    },
    {
        unit: 1,
        type: 'subjective',
        question: "What are 'Escape Sequences'? Provide five common examples.",
        explanation: "Escape sequences start with a backslash (\\) and represent characters that can't be typed directly. Examples: 1. \\n (New line), 2. \\t (Horizontal tab), 3. \\b (Backspace), 4. \\' (Single quote), 5. \\\\ (Backslash itself). They are used within strings to format output.",
        difficulty: 'easy',
        topic: 'The C character set'
    },
    {
        unit: 1,
        type: 'subjective',
        question: "Distinguish between 'Constants' and 'Variables'.",
        explanation: "A Variable is a named memory location whose value can change during program execution (e.g., `int x = 5; x = 10;`). A Constant (Literal) is a value that remains fixed (e.g., 5, 'A'). Symbolic constants are defined using '#define' or the 'const' keyword, making the code more readable and easier to maintain without hardcoding values everywhere.",
        difficulty: 'easy',
        topic: 'Constants and variables'
    },
    {
        unit: 1,
        type: 'subjective',
        question: "Explain Arithmetic operators and the 'Modulo' operator specifically.",
        explanation: "Arithmetic operators include +, -, *, /, and %. The Modulo (%) operator is unique because it returns the remainder of an integer division (e.g., 7 % 3 is 1). It is strictly used for integer operands and is very useful for checking divisibility or cycling through a set of values.",
        difficulty: 'easy',
        topic: 'Arithmetic operators'
    },
    {
        unit: 1,
        type: 'subjective',
        question: "What is an 'Identifier'? State the naming conventions for a valid identifier.",
        explanation: "An identifier is a user-defined name for variables, functions, etc. Rules: 1. Must start with a letter (A-Z, a-z) or underscore (_). 2. Can be followed by any number of letters, digits, or underscores. 3. Keywords cannot be used. 4. C is case-sensitive, so 'Var' and 'var' are different. 5. No special characters (like !, @, $) or spaces are allowed.",
        difficulty: 'easy',
        topic: 'Identifiers and keywords'
    },
    {
        unit: 1,
        type: 'subjective',
        question: "How does C handle Truth and Falsity? Discuss Logical operators.",
        explanation: "In C, there is no built-in boolean type (pre-C99). 0 is treated as 'False', and any non-zero value is 'True'. Logical operators include && (AND), || (OR), and ! (NOT). They are used to combine relational expressions. C uses 'short-circuit evaluation': in `A && B`, if A is false, B is not evaluated; in `A || B`, if A is true, B is not evaluated.",
        difficulty: 'medium',
        topic: 'Logical'
    },
    {
        unit: 1,
        type: 'subjective',
        question: "Explain 'Unary', 'Binary', and 'Ternary' operators with examples.",
        explanation: "Unary: Takes one operand (e.g., ++x, -y). Binary: Takes two operands (e.g., a + b, x > y). Ternary: Takes three operands (e.g., the conditional operator `? :` like `(a > b) ? a : b`). This is C's only ternary operator and serves as a shorthand for simple if-else statements.",
        difficulty: 'medium',
        topic: 'Unary'
    },
    {
        unit: 1,
        type: 'subjective',
        question: "Discuss the compilation process of a C program.",
        explanation: "1. Preprocessing: Handles # directives (removes comments, includes headers). 2. Compilation: Translates preprocessed code into Assembly code. 3. Assembly: Converts assembly to Object code (machine code). 4. Linking: Combines object files and library files into a single Executable file. This modular process allows for efficient development and debugging.",
        difficulty: 'hard',
        topic: 'The C character set'
    },
    {
        unit: 1,
        type: 'subjective',
        question: "What is the 'Conditional Operator' (? :)? How is it used?",
        explanation: "It is a ternary operator used for decision making. Syntax: `condition ? value_if_true : value_if_false;`. For example, `max = (a > b) ? a : b;` assigns the larger of a and b to max. It is more concise than a full if-else block but should be used sparingly for readability.",
        difficulty: 'medium',
        topic: 'Assignment and conditional operators'
    },
    {
        unit: 1,
        type: 'subjective',
        question: "Explain the 'sizeof' operator and why it is useful.",
        explanation: "Sizeof is a compile-time operator that returns the size of a data type or variable in bytes. It is crucial because the size of types like 'int' can vary across different hardware architectures (e.g., 2 bytes on an old system vs 4 on modern). Using `sizeof` ensures the code remains portable and memory-safe.",
        difficulty: 'medium',
        topic: 'Arithmetic operators'
    },
    {
        unit: 1,
        type: 'subjective',
        question: "What are 'Assignment Operators'? Distinguish between '=' and '=='.",
        explanation: "Assignment operators (like =, +=, -=) store a value into a variable. The single equals (=) is the assignment operator (e.g., x = 5). The double equals (==) is a relational/equality operator used for comparison (e.g., if (x == 5)). Confusing these is a frequent source of logic errors in C programming.",
        difficulty: 'easy',
        topic: 'Assignment and conditional operators'
    },
    {
        unit: 1,
        type: 'subjective',
        question: "Describe 'Macros' in C. How do they differ from variables?",
        explanation: "Macros are defined using `#define PI 3.14`. They are handled by the preprocessor, which replaces every occurrence of the macro name with its value before compilation begins. Unlike variables, macros don't occupy memory at runtime and don't have a data type. They are ideal for global constants and simple inline logic.",
        difficulty: 'medium',
        topic: 'Constants and variables'
    },
    {
        unit: 1,
        type: 'subjective',
        question: "Explain relational operators and their return values.",
        explanation: "Relational operators (>, <, >=, <=, ==, !=) compare two values. They always return an integer result: 1 if the condition is true and 0 if it is false. These results are fundamental for control flow statements like if-statements and loops.",
        difficulty: 'easy',
        topic: 'Relational'
    },
    {
        unit: 1,
        type: 'subjective',
        question: "Discuss the 'void' data type and its applications.",
        explanation: "Void represents 'no value'. It has three main uses: 1. Function Return: `void myFunc()` returns nothing. 2. Function Arguments: `int myFunc(void)` means it takes no inputs. 3. Void Pointers: `void *ptr` can hold the address of ANY data type (generic pointer), which is extremely useful for advanced memory management tasks like `malloc`.",
        difficulty: 'hard',
        topic: 'Data types'
    },
    {
        unit: 1,
        type: 'subjective',
        question: "Explain the concept of 'Expressions' in C.",
        explanation: "An expression consists of at least one operand and zero or more operators that evaluate to a single value. Expressions range from simple literals (5) or variables (x) to complex formulas (5 + x * y). C treats almost everything as an expression, including assignments, which return the value assigned.",
        difficulty: 'easy',
        topic: 'Expressions'
    }
];
