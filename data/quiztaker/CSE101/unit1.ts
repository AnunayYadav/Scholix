import { QuizQuestion } from "../../../types.ts";

export const cse101Unit1MCQs: QuizQuestion[] = [
    {
        unit: 1,
        question: "Who developed the C programming language?",
        options: ["Dennis Ritchie", "Bjarne Stroustrup", "Guido van Rossum", "James Gosling"],
        correctAnswer: 0,
        explanation: "Dennis Ritchie developed C in the early 1970s at Bell Labs.",
difficulty: 'easy',
topic: 'The C character set'
    },
    {
        unit: 1,
        question: "Which of the following is an invalid identifier in C?",
        options: ["my_variable", "_temp", "2ndVar", "totalSales"],
        correctAnswer: 2,
        explanation: "Identifiers cannot start with a digit. They must start with a letter or an underscore.",
difficulty: 'easy',
topic: 'Identifiers and keywords'
    },
    {
        unit: 1,
        question: "How many keywords are there in the standard C89/C90 library?",
        options: ["24", "32", "48", "64"],
        correctAnswer: 1,
        explanation: "The original C standard defines 32 reserved keywords (like int, if, while).",
difficulty: 'easy',
topic: 'Identifiers and keywords'
    },
    {
        unit: 1,
        question: "What is the size of the 'char' data type in C?",
        options: ["1 byte", "2 bytes", "4 bytes", "8 bytes"],
        correctAnswer: 0,
        explanation: "A char typically occupies 1 byte (8 bits) in memory.",
difficulty: 'easy',
topic: 'The C character set'
    },
    {
        unit: 1,
        question: "Which operator is used to find the remainder of a division?",
        options: ["/", "%", "&", "#"],
        correctAnswer: 1,
        explanation: "The modulo operator (%) returns the remainder of an integer division.",
difficulty: 'easy',
topic: 'Arithmetic operators'
    },
    {
        unit: 1,
        question: "What is the output of the expression 10 + 5 * 2?",
        options: ["30", "20", "25", "15"],
        correctAnswer: 1,
        explanation: "Due to operator precedence, multiplication is performed first: 10 + (5 * 2) = 20.",
difficulty: 'easy',
topic: 'Expressions'
    },
    {
        unit: 1,
        question: "Which of the following is a logical operator?",
        options: ["&", "==", "&&", "|"],
        correctAnswer: 2,
        explanation: "&& is the logical AND operator, used for boolean logic.",
difficulty: 'easy',
topic: 'Logical'
    },
    {
        unit: 1,
        question: "What is the value of 'x' if int x = 5; x++;?",
        options: ["4", "5", "6", "0"],
        correctAnswer: 2,
        explanation: "The increment operator (++) increases the value by 1.",
difficulty: 'easy',
topic: 'Arithmetic operators'
    },
    {
        unit: 1,
        question: "Which of these is a bitwise AND operator?",
        options: ["&&", "&", "|", "^"],
        correctAnswer: 1,
        explanation: "A single ampersand (&) is used for bit-level AND operations.",
difficulty: 'easy',
topic: 'Bitwise operators'
    },
    {
        unit: 1,
        question: "Which data type would you use to store a decimal number?",
        options: ["int", "char", "float", "long"],
        correctAnswer: 2,
        explanation: "Float (or double) is used for floating-point numbers.",
difficulty: 'easy',
topic: 'Data types'
    },
    {
        unit: 1,
        question: "The 'void' data type is used for:",
        options: ["Storing integers", "Functions that do not return a value", "Storing text", "Defining constants"],
        correctAnswer: 1,
        explanation: "Void signifies an empty type, commonly used as a return type for functions that perform an action but return nothing.",
difficulty: 'easy',
topic: 'Data types'
    },
    {
        unit: 1,
        question: "Which assignment operator is equivalent to a = a + 5?",
        options: ["a =+ 5", "a += 5", "a + 5", "a == 5"],
        correctAnswer: 1,
        explanation: "+= is a shorthand assignment operator.",
difficulty: 'easy',
topic: 'Assignment and conditional operators'
    },
    {
        unit: 1,
        question: "What is a 'Constant' in C?",
        options: ["A variable that changes value frequently", "An identifier whose value cannot be altered during program execution", "A type of loop", "A function name"],
        correctAnswer: 1,
        explanation: "Constants (often defined using 'const' or '#define') are fixed values.",
difficulty: 'easy',
topic: 'Constants and variables'
    },
    {
        unit: 1,
        question: "Which of the following is a Relational operator?",
        options: ["+", "=", ">=", "!"],
        correctAnswer: 2,
        explanation: ">= checks if the left operand is greater than or equal to the right.",
difficulty: 'easy',
topic: 'Relational'
    },
    {
        unit: 1,
        question: "What is the character set of C?",
        options: ["Only letters A-Z", "Digits 0-9", "Special characters like #, $, %", "All of the above"],
        correctAnswer: 3,
        explanation: "C uses a character set including alphanumeric characters and various symbols.",
difficulty: 'easy',
topic: 'The C character set'
    },
    {
        unit: 1,
        question: "Which operator has the highest precedence in C?",
        options: ["+", "*", "()", "="],
        correctAnswer: 2,
        explanation: "Parentheses () have the highest priority in expression evaluation.",
difficulty: 'easy',
topic: 'The C character set'
    },
    {
        unit: 1,
        question: "The '&' operator when used as 'unary' (e.g. &x) returns:",
        options: ["Value of x", "Address of x", "Bitwise AND of x", "Negative of x"],
        correctAnswer: 1,
        explanation: "The unary & is the address-of operator.",
difficulty: 'easy',
topic: 'Unary'
    },
    {
        unit: 1,
        question: "Which data type is specifically used to store true/false values in modern C (C99+)?",
        options: ["bit", "bool (via <stdbool.h>)", "truth", "logic"],
        correctAnswer: 1,
        explanation: "The <stdbool.h> header introduces the 'bool' type.",
difficulty: 'medium',
topic: 'The C character set'
    },
    {
        unit: 1,
        question: "What is an 'Expression' in C?",
        options: ["A single variable", "A combination of operators and operands that evaluates to a single value", "A print statement", "A loop header"],
        correctAnswer: 1,
        explanation: "Expressions are the building blocks of computations.",
difficulty: 'easy',
topic: 'Expressions'
    },
    {
        unit: 1,
        question: "What will be the result of 5 / 2 in integer division?",
        options: ["2.5", "2", "3", "0"],
        correctAnswer: 1,
        explanation: "Integer division truncates the decimal part, so 5 / 2 equals 2.",
difficulty: 'easy',
topic: 'The C character set'
    },
    {
        unit: 1,
        question: "What is the output of 'printf(\"%d\", 5 % 2);'?",
        options: ["2.5", "2", "1", "0"],
        correctAnswer: 2,
        explanation: "5 divided by 2 is 2 with a remainder of 1.",
difficulty: 'easy',
topic: 'Data types'
    },
    {
        unit: 1,
        question: "Which of the following is used to terminate a statement in C?",
        options: [":", ";", ".", "!"],
        correctAnswer: 1,
        explanation: "Every statement in C must end with a semicolon (;).",
difficulty: 'easy',
topic: 'The C character set'
    },
    {
        unit: 1,
        question: "Which escape sequence is used for a new line in C?",
        options: ["\\n", "\\t", "\\r", "\\a"],
        correctAnswer: 0,
        explanation: "\\n is the standard newline character.",
difficulty: 'easy',
topic: 'The C character set'
    },
    {
        unit: 1,
        question: "Which of these is a keyword in C?",
        options: ["integer", "main", "switch", "value"],
        correctAnswer: 2,
        explanation: "switch is a reserved keyword; main is a function, and integer/value are identifiers.",
difficulty: 'easy',
topic: 'Identifiers and keywords'
    },
    {
        unit: 1,
        question: "What will happen if you increment a float variable?",
        options: ["Error", "Adds 1 to value", "Increments bits", "Nothing"],
        correctAnswer: 1,
        explanation: "The increment operator can be applied to float variables, increasing their value by 1.0.",
difficulty: 'medium',
topic: 'Arithmetic operators'
    },
    {
        unit: 1,
        question: "Which preprocessor directive is used to define constants?",
        options: ["#include", "#def", "#define", "#const"],
        correctAnswer: 2,
        explanation: "#define is used for macro definitions and constants.",
difficulty: 'easy',
topic: 'Constants and variables'
    },
    {
        unit: 1,
        question: "What is the result of applying % to floating-point numbers?",
        options: ["Error", "Integer remainder", "Float remainder", "Zero"],
        correctAnswer: 0,
        explanation: "The modulo operator (%) is only applicable to integer operands in C.",
difficulty: 'hard',
topic: 'Arithmetic operators'
    },
    {
        unit: 1,
        question: "Which of the following is a Bitwise XOR operator?",
        options: ["&", "|", "^", "~"],
        correctAnswer: 2,
        explanation: "^ is the XOR operator in C.",
difficulty: 'easy',
topic: 'Bitwise operators'
    },
    {
        unit: 1,
        question: "What is the result of 3 << 1?",
        options: ["3", "6", "1", "0"],
        correctAnswer: 1,
        explanation: "Left shift by 1 is equivalent to multiplying by 2. $3 \times 2 = 6$.",
difficulty: 'medium',
topic: 'Bitwise operators'
    },
    {
        unit: 1,
        question: "In C, which value represents 'True'?",
        options: ["Only 1", "Only 100", "Any non-zero value", "Any positive value"],
        correctAnswer: 2,
        explanation: "In C, zero is false, and any non-zero value (positive or negative) is true.",
difficulty: 'easy',
topic: 'Logical'
    },
    {
        unit: 1,
        question: "Which type of conversion happens in (float) x?",
        options: ["Implicit", "Explicit", "Automatic", "None"],
        correctAnswer: 1,
        explanation: "Typecasting using parentheses is explicit conversion.",
difficulty: 'medium',
topic: 'Expressions'
    },
    {
        unit: 1,
        question: "What is the size of double on a 64-bit system?",
        options: ["2", "4", "8", "16"],
        correctAnswer: 2,
        explanation: "Double usually occupies 8 bytes (64 bits).",
difficulty: 'easy',
topic: 'Data types'
    },
    {
        unit: 1,
        question: "What is the result of sizeof('A') in C?",
        options: ["1", "Usually 4 or 2 (int size)", "8", "Error"],
        correctAnswer: 1,
        explanation: "In C, character literals like 'A' are treated as integers, so sizeof('A') is the size of an int.",
difficulty: 'hard',
topic: 'Data types'
    },
    {
        unit: 1,
        question: "Which keyword is used to prevent any changes to a variable?",
        options: ["fixed", "const", "static", "volatile"],
        correctAnswer: 1,
        explanation: "const makes a variable read-only.",
difficulty: 'easy',
topic: 'Constants and variables'
    },
    {
        unit: 1,
        question: "What is the result of 5 & 3?",
        options: ["1", "5", "3", "7"],
        correctAnswer: 0,
        explanation: "101 AND 011 = 001 (binary for 1).",
difficulty: 'medium',
topic: 'Bitwise operators'
    },
    {
        unit: 1,
        question: "What is the result of 5 | 3?",
        options: ["1", "5", "3", "7"],
        correctAnswer: 3,
        explanation: "101 OR 011 = 111 (binary for 7).",
difficulty: 'medium',
topic: 'Bitwise operators'
    },
    {
        unit: 1,
        question: "Which escape sequence represents a backspace?",
        options: ["\\b", "\\a", "\\r", "\\v"],
        correctAnswer: 0,
        explanation: "\\b is backspace.",
difficulty: 'medium',
topic: 'The C character set'
    },
    {
        unit: 1,
        question: "What is the difference between prefix and postfix ++?",
        options: ["No difference", "Prefix increments then uses, postfix uses then increments", "Postfix is faster", "Prefix is only for float"],
        correctAnswer: 1,
        explanation: "++x increments before use; x++ increments after use.",
difficulty: 'medium',
topic: 'Arithmetic operators'
    },
    {
        unit: 1,
        question: "Which operator is used to get the value of a pointer?",
        options: ["&", "*", "->", "."],
        correctAnswer: 1,
        explanation: "Dereference operator * fetches the value from address.",
difficulty: 'medium',
topic: 'Unary'
    },
    {
        unit: 1,
        question: "A variable defined outside all functions is called:",
        options: ["Local", "Global", "Static", "External"],
        correctAnswer: 1,
        explanation: "Global variables are accessible by all functions in the file.",
difficulty: 'easy',
topic: 'Constants and variables'
    },
    {
        unit: 1,
        question: "Which data type has the range roughly -2 billion to 2 billion?",
        options: ["short", "int (32-bit)", "char", "float"],
        correctAnswer: 1,
        explanation: "A 32-bit signed int ranges from approx -2.1B to +2.1B.",
difficulty: 'medium',
topic: 'Data types'
    },
    {
        unit: 1,
        question: "What is the result of ~0 (bitwise NOT of 0)?",
        options: ["1", "-1 (in 2's complement)", "0", "None"],
        correctAnswer: 1,
        explanation: "NOT of all 0s is all 1s, which represents -1 in two's complement.",
difficulty: 'hard',
topic: 'Bitwise operators'
    },
    {
        unit: 1,
        question: "Which function is used for formatted input?",
        options: ["printf", "scanf", "gets", "puts"],
        correctAnswer: 1,
        explanation: "scanf scans formatted data from stdin.",
difficulty: 'easy',
topic: 'The C character set'
    },
    {
        unit: 1,
        question: "The default return type of a function in old C if not specified is:",
        options: ["void", "int", "float", "char"],
        correctAnswer: 1,
        explanation: "Implicit int was the default in early C standards.",
difficulty: 'medium',
topic: 'Data types'
    },
    {
        unit: 1,
        question: "Which operator is used for access to structure members via pointer?",
        options: [".", "->", "*", "&"],
        correctAnswer: 1,
        explanation: "The arrow operator -> is used with pointers to structs.",
difficulty: 'medium',
topic: 'The C character set'
    },
    {
        unit: 1,
        question: "Constants defined using #define are also called:",
        options: ["Variables", "Macros", "Functions", "Comments"],
        correctAnswer: 1,
        explanation: "#define creates macros.",
difficulty: 'easy',
topic: 'Constants and variables'
    },
    {
        unit: 1,
        question: "Which operator is used for 'short-circuit' evaluation?",
        options: ["&", "&&", "|", "!"],
        correctAnswer: 1,
        explanation: "&& stops evaluating if the first operand is false.",
difficulty: 'hard',
topic: 'Logical'
    },
    {
        unit: 1,
        question: "What is the binary representation of decimal 5?",
        options: ["101", "110", "111", "001"],
        correctAnswer: 0,
        explanation: "$4 \times 1 + 2 \times 0 + 1 \times 1 = 5$.",
difficulty: 'easy',
topic: 'Expressions'
    },
    {
        unit: 1,
        question: "Which keyword is used to return a value from a function?",
        options: ["back", "exit", "return", "send"],
        correctAnswer: 2,
        explanation: "return sends a value back to the caller.",
difficulty: 'easy',
topic: 'Expressions'
    },
    {
        unit: 1,
        question: "What is 'Segmentation Fault'?",
        options: ["Compiler error", "Logical error", "Memory access violation at runtime", "Syntax error"],
        correctAnswer: 2,
        explanation: "Trying to access memory not owned by the program causes a segfault.",
difficulty: 'hard',
topic: 'Unary'
    },
    {
        unit: 1,
        question: "How many keywords does C11 define?",
        options: ["32", "44", "37", "50"],
        correctAnswer: 1,
        explanation: "Newer standards added more keywords (like _Atomic, _Generic).",
difficulty: 'hard',
topic: 'Identifiers and keywords'
    },
    {
        unit: 1,
        question: "Which header is used for mathematical functions like sqrt()?",
        options: ["<stdio.h>", "<math.h>", "<stdlib.h>", "<string.h>"],
        correctAnswer: 1,
        explanation: "math.h contains sqrt, sin, cos, etc.",
difficulty: 'easy',
topic: 'Expressions'
    },
    {
        unit: 1,
        question: "What is the result of 1 / 2.0?",
        options: ["0", "0.5", "1", "Error"],
        correctAnswer: 1,
        explanation: "Since one operand is float, the result is float (0.5).",
difficulty: 'medium',
topic: 'Arithmetic operators'
    },
    {
        unit: 1,
        question: "What is the result of (int) 3.9?",
        options: ["4", "3", "0", "Error"],
        correctAnswer: 1,
        explanation: "Casting to int truncates the decimal, so 3.9 becomes 3.",
difficulty: 'medium',
topic: 'Expressions'
    },
    {
        unit: 1,
        question: "Which of these is NOT a valid escape sequence?",
        options: ["\\n", "\\t", "\\z", "\\r"],
        correctAnswer: 2,
        explanation: "\\z is not a standard C escape sequence.",
difficulty: 'medium',
topic: 'The C character set'
    },
    {
        unit: 1,
        question: "What does ASCII stand for?",
        options: ["American Standard Code for Information Interchange", "All Standard Code Interface", "Applied Standard Coding Info", "None"],
        correctAnswer: 0,
        explanation: "ASCII is the character encoding standard used by C.",
difficulty: 'easy',
topic: 'The C character set'
    },
    {
        unit: 1,
        question: "Size of 'int' on a 16-bit compiler?",
        options: ["1 byte", "2 bytes", "4 bytes", "8 bytes"],
        correctAnswer: 1,
        explanation: "Old 16-bit systems had 2-byte integers.",
difficulty: 'medium',
topic: 'Data types'
    },
    {
        unit: 1,
        question: "What is the purpose of the 'static' keyword for local variables?",
        options: ["Makes it global", "Preserves value between function calls", "Makes it constant", "None"],
        correctAnswer: 1,
        explanation: "Static locals are initialized once and keep their value throughout the program.",
difficulty: 'hard',
topic: 'Constants and variables'
    },
    {
        unit: 1,
        question: "Which library function generates a random number?",
        options: ["rand()", "random()", "generate()", "seed()"],
        correctAnswer: 0,
        explanation: "rand() from <stdlib.h> returns a pseudo-random integer.",
difficulty: 'medium',
topic: 'Expressions'
    },
    {
        unit: 1,
        question: "What is the precedence of Bitwise NOT (~)?",
        options: ["Higher than +", "Lower than +", "Same as +", "Lowest"],
        correctAnswer: 0,
        explanation: "Unary operators like ~ have very high precedence.",
difficulty: 'hard',
topic: 'Bitwise operators'
    },
    {
        unit: 1,
        question: "Which of the following is correct syntax to declare a pointer to int?",
        options: ["int p*;", "int *p;", "pointer int p;", "ptr p;"],
        correctAnswer: 1,
        explanation: "int *p; declares p as a pointer to integer.",
difficulty: 'easy',
topic: 'Unary'
    },
    {
        unit: 1,
        question: "What is a 'null pointer'?",
        options: ["Points to garbage", "Points to address 0 (nothing)", "Points to main", "Error"],
        correctAnswer: 1,
        explanation: "NULL is a macro representing an address that points nowhere.",
difficulty: 'medium',
topic: 'Unary'
    },
    {
        unit: 1,
        question: "Which operator is used to determine if two values are equal?",
        options: ["=", "==", "===", "!="],
        correctAnswer: 1,
        explanation: "= is assignment, == is equality.",
difficulty: 'easy',
topic: 'Relational'
    },
    {
        unit: 1,
        question: "Result of 5 > 3 && 2 < 1?",
        options: ["True", "False", "1", "Error"],
        correctAnswer: 1,
        explanation: "True && False results in False (0).",
difficulty: 'easy',
topic: 'Logical'
    },
    {
        unit: 1,
        question: "What is 'Floating Point Overflow'?",
        options: ["Result too small", "Result too large for type", "Divide by zero", "None"],
        correctAnswer: 1,
        explanation: "When a calculation exceeds the maximum float value.",
difficulty: 'medium',
topic: 'Arithmetic operators'
    },
    {
        unit: 1,
        question: "Which directive ensures a header file is included only once?",
        options: ["#include", "#ifndef / #define", "#once", "None"],
        correctAnswer: 1,
        explanation: "Header guards or #pragma once are used to prevent multiple inclusions.",
difficulty: 'hard',
topic: 'Constants and variables'
    },
    {
        unit: 1,
        question: "Which data type is used for 'long' integers?",
        options: ["ll", "long", "bigint", "int64"],
        correctAnswer: 1,
        explanation: "long is at least 32 bits.",
difficulty: 'easy',
topic: 'Data types'
    },
    {
        unit: 1,
        question: "What is an 'Operand'?",
        options: ["Symbols like +", "Variables/Values on which operators act", "The compiler", "The CPU"],
        correctAnswer: 1,
        explanation: "In 5 + 3, 5 and 3 are operands.",
difficulty: 'easy',
topic: 'Expressions'
    },
    {
        unit: 1,
        question: "Which operator is 'Right-to-Left' associative?",
        options: ["+", "==", "=", "/"],
        correctAnswer: 2,
        explanation: "Assignment operators associate from right to left.",
difficulty: 'hard',
topic: 'Assignment and conditional operators'
    },
    {
        unit: 1,
        question: "Does C support nested comments?",
        options: ["Yes", "No", "Depends on compiler", "Only with //"],
        correctAnswer: 1,
        explanation: "Standard C does not support nested /* ... /* ... */ ... */ comments.",
difficulty: 'hard',
topic: 'The C character set'
    },
    {
        unit: 1,
        question: "What is 'White Space' in C?",
        options: ["Blank spaces, tabs, newlines", "Empty variables", "Comments", "Memory gaps"],
        correctAnswer: 0,
        explanation: "Whitespace is used to separate tokens.",
difficulty: 'easy',
topic: 'The C character set'
    },
    {
        unit: 1,
        question: "Which data type is used to store memory addresses?",
        options: ["int", "long", "pointer", "void"],
        correctAnswer: 2,
        explanation: "Pointers are variables that store addresses.",
difficulty: 'medium',
topic: 'Unary'
    },
    {
        unit: 1,
        question: "What is the value of EOF?",
        options: ["0", "1", "Usually -1", "Null"],
        correctAnswer: 2,
        explanation: "End of File (EOF) is an integer constant, typically -1.",
difficulty: 'medium',
topic: 'The C character set'
    },
    {
        unit: 1,
        question: "Which operator has the lowest precedence overall?",
        options: ["Comma (,)", "Assignment (=)", "Logical OR (||)", "Relational (>)"],
        correctAnswer: 0,
        explanation: "The comma operator has the lowest precedence.",
difficulty: 'hard',
topic: 'Expressions'
    },
    {
        unit: 1,
        question: "Can an identifier contain a special character like $?",
        options: ["Yes", "No", "Only at start", "Only at end"],
        correctAnswer: 1,
        explanation: "Only letters, digits, and underscores are allowed.",
difficulty: 'easy',
topic: 'Identifiers and keywords'
    },
    {
        unit: 1,
        question: "The 'volatile' keyword tells the compiler:",
        options: ["Variable is constant", "Variable may change externally (don't optimize)", "Variable is fast", "Variable is local"],
        correctAnswer: 1,
        explanation: "Volatile is used for variables modified by hardware or other threads.",
difficulty: 'hard',
topic: 'Constants and variables'
    },
    {
        unit: 1,
        question: "What is the decimal value of hex 0xA?",
        options: ["10", "11", "12", "15"],
        correctAnswer: 0,
        explanation: "A=10, B=11, ..., F=15.",
difficulty: 'easy',
topic: 'The C character set'
    },
    {
        unit: 1,
        question: "What is the decimal value of octal 010?",
        options: ["10", "8", "16", "1"],
        correctAnswer: 1,
        explanation: "Octal 10 is $1 \times 8 + 0 \times 1 = 8$.",
difficulty: 'medium',
topic: 'The C character set'
    },
    {
        unit: 1,
        question: "Which operator is binary?",
        options: ["!", "++", "* (product)", "~"],
        correctAnswer: 2,
        explanation: "Product * takes two operands, others are unary.",
difficulty: 'easy',
topic: 'Arithmetic operators'
    },
    {
        unit: 1,
        question: "Result of 5 && 0?",
        options: ["5", "0", "1", "True"],
        correctAnswer: 1,
        explanation: "AND with 0 is always 0 (False).",
difficulty: 'easy',
topic: 'Logical'
    },
    {
        unit: 1,
        question: "Which function allocates memory on the heap?",
        options: ["malloc()", "scanf()", "printf()", "alloc()"],
        correctAnswer: 0,
        explanation: "malloc stands for memory allocation.",
difficulty: 'medium',
topic: 'Expressions'
    },
    {
        unit: 1,
        question: "What returns the number of characters printed by printf?",
        options: ["void", "int", "char", "None"],
        correctAnswer: 1,
        explanation: "printf returns the number of characters successfully printed.",
difficulty: 'hard',
topic: 'Expressions'
    },
    {
        unit: 1,
        question: "What is the escape sequence for single quote?",
        options: ["\\s", "\\'", "\\q", "\\\""],
        correctAnswer: 1,
        explanation: "\\' is used for single quote literals.",
difficulty: 'medium',
topic: 'The C character set'
    },
    {
        unit: 1,
        question: "Which of these is a valid integer constant?",
        options: ["1,000", "0XFF", "1.0", "1 00"],
        correctAnswer: 1,
        explanation: "0XFF is a hexadecimal integer constant.",
difficulty: 'easy',
topic: 'Constants and variables'
    },
    {
        unit: 1,
        question: "In float x = (5/2); what is x?",
        options: ["2.5", "2.0", "3.0", "Error"],
        correctAnswer: 1,
        explanation: "5/2 is integer division (2), then assigned to float (2.0).",
difficulty: 'hard',
topic: 'Expressions'
    },
    {
        unit: 1,
        question: "What is the result of 10 == 10?",
        options: ["1", "10", "True", "Nothing"],
        correctAnswer: 0,
        explanation: "Equality check returns 1 (True) in C.",
difficulty: 'easy',
topic: 'Relational'
    },
    {
        unit: 1,
        question: "Which header is used for exit() function?",
        options: ["<stdio.h>", "<stdlib.h>", "<math.h>", "<conio.h>"],
        correctAnswer: 1,
        explanation: "stdlib.h contains general utilities like exit, malloc, etc.",
difficulty: 'medium',
topic: 'Expressions'
    },
    {
        unit: 1,
        question: "What is the result of applying sizeof to a variable name?",
        options: ["Size of name string", "Size of data type in bytes", "Memory address", "Error"],
        correctAnswer: 1,
        explanation: "sizeof(variable) returns the bytes occupied by that variable.",
difficulty: 'easy',
topic: 'Arithmetic operators'
    },
    {
        unit: 1,
        question: "Smallest integer data type in C?",
        options: ["int", "long", "char", "short"],
        correctAnswer: 2,
        explanation: "Char is technically an integer type (usually 8-bit).",
difficulty: 'medium',
topic: 'Data types'
    },
    {
        unit: 1,
        question: "Which of these is a 'Literal'?",
        options: ["int", "x", "5", "main"],
        correctAnswer: 2,
        explanation: "Literals are fixed values like 5 or 'A'.",
difficulty: 'easy',
topic: 'The C character set'
    },
    {
        unit: 1,
        question: "How do you declare a constant PI using preprocessor?",
        options: ["#define PI 3.14", "float PI = 3.14;", "const PI 3.14", "#const PI 3.14"],
        correctAnswer: 0,
        explanation: "#define PI 3.14 is the correct macro syntax.",
difficulty: 'easy',
topic: 'Constants and variables'
    },
    {
        unit: 1,
        question: "Which of the following is NOT a reserved keyword in C?",
        options: ["sizeof", "typedef", "string", "struct"],
        correctAnswer: 2,
        explanation: "string is not a keyword in C (unlike C++ or Java).",
difficulty: 'medium',
topic: 'Identifiers and keywords'
    },
    {
        unit: 1,
        question: "What is the default return type of void main()?",
        options: ["int", "void", "Error", "None"],
        correctAnswer: 2,
        explanation: "Standard C requires main to return int. Some compilers allow void but it's not standard.",
difficulty: 'hard',
topic: 'Expressions'
    },
    {
        unit: 1,
        question: "What is 'Logical NOT' operator?",
        options: ["~", "!", "NOT", "None"],
        correctAnswer: 1,
        explanation: "! is logical NOT; ~ is bitwise NOT.",
difficulty: 'easy',
topic: 'Logical'
    },
    {
        unit: 1,
        question: "Is 'Total_Amount' a valid identifier?",
        options: ["Yes", "No", "Depends", "Only if it is global"],
        correctAnswer: 0,
        explanation: "It contains only letters and underscores.",
difficulty: 'easy',
topic: 'Identifiers and keywords'
    },
    {
        unit: 1,
        question: "What represents 'end of string' in C?",
        options: ["\\0", "\\n", "EOF", "NULL"],
        correctAnswer: 0,
        explanation: "The null character \\0 terminates strings.",
difficulty: 'easy',
topic: 'The C character set'
    },
    {
        unit: 1,
        question: "What is the result of double y = 7 / 2.0 + 1?",
        options: ["4.5", "4.0", "3.5", "5.0"],
        correctAnswer: 0,
        explanation: "3.5 + 1 = 4.5.",
difficulty: 'medium',
topic: 'Expressions'
    },
    {
        unit: 1,
        question: "Highest precision float type?",
        options: ["float", "double", "long double", "bigfloat"],
        correctAnswer: 2,
        explanation: "long double is highest precision.",
difficulty: 'easy',
topic: 'Data types'
    },
    {
        unit: 1,
        question: "What happens during 'linking'?",
        options: ["Checking syntax", "Merging object files and libraries", "Generating assembly", "Running the code"],
        correctAnswer: 1,
        explanation: "Linking creates the final executable.",
difficulty: 'medium',
topic: 'The C character set'
    },
    {
        unit: 1,
        question: "C language was developed at ___.",
        options: ["Microsoft", "AT&T Bell Labs", "Google", "IBM"],
        correctAnswer: 1,
        explanation: "Dennis Ritchie developed C at AT&T Bell Laboratories.",
        difficulty: 'easy',
        topic: 'Basics'
    }
];
