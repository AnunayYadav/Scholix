import { QuizQuestion } from "../../../types.ts";

export const cse101Unit1MCQs: QuizQuestion[] = [
    {
        unit: 1,
        question: "Who developed the C programming language?",
        options: ["Dennis Ritchie", "Bjarne Stroustrup", "Guido van Rossum", "James Gosling"],
        correctAnswer: 0,
        explanation: "Dennis Ritchie developed C in the early 1970s at Bell Labs."
    },
    {
        unit: 1,
        question: "Which of the following is an invalid identifier in C?",
        options: ["my_variable", "_temp", "2ndVar", "totalSales"],
        correctAnswer: 2,
        explanation: "Identifiers cannot start with a digit. They must start with a letter or an underscore."
    },
    {
        unit: 1,
        question: "How many keywords are there in the standard C89/C90 library?",
        options: ["24", "32", "48", "64"],
        correctAnswer: 1,
        explanation: "The original C standard defines 32 reserved keywords (like int, if, while)."
    },
    {
        unit: 1,
        question: "What is the size of the 'char' data type in C?",
        options: ["1 byte", "2 bytes", "4 bytes", "8 bytes"],
        correctAnswer: 0,
        explanation: "A char typically occupies 1 byte (8 bits) in memory."
    },
    {
        unit: 1,
        question: "Which operator is used to find the remainder of a division?",
        options: ["/", "%", "&", "#"],
        correctAnswer: 1,
        explanation: "The modulo operator (%) returns the remainder of an integer division."
    },
    {
        unit: 1,
        question: "What is the output of the expression 10 + 5 * 2?",
        options: ["30", "20", "25", "15"],
        correctAnswer: 1,
        explanation: "Due to operator precedence, multiplication is performed first: 10 + (5 * 2) = 20."
    },
    {
        unit: 1,
        question: "Which of the following is a logical operator?",
        options: ["&", "==", "&&", "|"],
        correctAnswer: 2,
        explanation: "&& is the logical AND operator, used for boolean logic."
    },
    {
        unit: 1,
        question: "What is the value of 'x' if int x = 5; x++;?",
        options: ["4", "5", "6", "0"],
        correctAnswer: 2,
        explanation: "The increment operator (++) increases the value by 1."
    },
    {
        unit: 1,
        question: "Which of these is a bitwise AND operator?",
        options: ["&&", "&", "|", "^"],
        correctAnswer: 1,
        explanation: "A single ampersand (&) is used for bit-level AND operations."
    },
    {
        unit: 1,
        question: "Which data type would you use to store a decimal number?",
        options: ["int", "char", "float", "long"],
        correctAnswer: 2,
        explanation: "Float (or double) is used for floating-point numbers."
    },
    {
        unit: 1,
        question: "The 'void' data type is used for:",
        options: ["Storing integers", "Functions that do not return a value", "Storing text", "Defining constants"],
        correctAnswer: 1,
        explanation: "Void signifies an empty type, commonly used as a return type for functions that perform an action but return nothing."
    },
    {
        unit: 1,
        question: "Which assignment operator is equivalent to a = a + 5?",
        options: ["a =+ 5", "a += 5", "a + 5", "a == 5"],
        correctAnswer: 1,
        explanation: "+= is a shorthand assignment operator."
    },
    {
        unit: 1,
        question: "What is a 'Constant' in C?",
        options: ["A variable that changes value frequently", "An identifier whose value cannot be altered during program execution", "A type of loop", "A function name"],
        correctAnswer: 1,
        explanation: "Constants (often defined using 'const' or '#define') are fixed values."
    },
    {
        unit: 1,
        question: "Which of the following is a Relational operator?",
        options: ["+", "=", ">=", "!"],
        correctAnswer: 2,
        explanation: ">= checks if the left operand is greater than or equal to the right."
    },
    {
        unit: 1,
        question: "What is the character set of C?",
        options: ["Only letters A-Z", "Digits 0-9", "Special characters like #, $, %", "All of the above"],
        correctAnswer: 3,
        explanation: "C uses a character set including alphanumeric characters and various symbols."
    },
    {
        unit: 1,
        question: "Which operator has the highest precedence in C?",
        options: ["+", "*", "()", "="],
        correctAnswer: 2,
        explanation: "Parentheses () have the highest priority in expression evaluation."
    },
    {
        unit: 1,
        question: "The '&' operator when used as 'unary' (e.g. &x) returns:",
        options: ["Value of x", "Address of x", "Bitwise AND of x", "Negative of x"],
        correctAnswer: 1,
        explanation: "The unary & is the address-of operator."
    },
    {
        unit: 1,
        question: "Which data type is specifically used to store true/false values in modern C (C99+)?",
        options: ["bit", "bool (via <stdbool.h>)", "truth", "logic"],
        correctAnswer: 1,
        explanation: "The <stdbool.h> header introduces the 'bool' type."
    },
    {
        unit: 1,
        question: "What is an 'Expression' in C?",
        options: ["A single variable", "A combination of operators and operands that evaluates to a single value", "A print statement", "A loop header"],
        correctAnswer: 1,
        explanation: "Expressions are the building blocks of computations."
    },
    {
        unit: 1,
        question: "What will be the result of 5 / 2 in integer division?",
        options: ["2.5", "2", "3", "0"],
        correctAnswer: 1,
        explanation: "Integer division truncates the decimal part, so 5 / 2 equals 2."
    },
    {
        unit: 1,
        question: "What is the output of 'printf(\"%d\", 5 % 2);'?",
        options: ["2.5", "2", "1", "0"],
        correctAnswer: 2,
        explanation: "5 divided by 2 is 2 with a remainder of 1."
    },
    {
        unit: 1,
        question: "Which of the following is used to terminate a statement in C?",
        options: [":", ";", ".", "!"],
        correctAnswer: 1,
        explanation: "Every statement in C must end with a semicolon (;)."
    },
    {
        unit: 1,
        question: "Which escape sequence is used for a new line in C?",
        options: ["\\n", "\\t", "\\r", "\\a"],
        correctAnswer: 0,
        explanation: "\\n is the standard newline character."
    },
    {
        unit: 1,
        question: "What is the default value of an uninitialized local variable in C?",
        options: ["0", "1", "Garbage value", "Null"],
        correctAnswer: 2,
        explanation: "Local variables (automatic storage) contain unpredictable 'garbage' values until initialized."
    },
    {
        unit: 1,
        question: "The '#' symbol at the start of a line signifies:",
        options: ["A comment", "A preprocessor directive", "A pointer", "A constant"],
        correctAnswer: 1,
        explanation: "Lines starting with # are processed by the preprocessor before actual compilation."
    },
    {
        unit: 1,
        question: "How do you represent a single line comment in C?",
        options: ["/* */", "//", "#", "<!-- -->"],
        correctAnswer: 1,
        explanation: "// is used for single-line comments in modern C."
    },
    {
        unit: 1,
        question: "Which of the following is a ternary operator in C?",
        options: ["&&", "||", "? :", "!"],
        correctAnswer: 2,
        explanation: "The conditional operator ? : is the only ternary operator (takes three operands)."
    },
    {
        unit: 1,
        question: "What is the result of !0 in C?",
        options: ["0", "1", "Error", "Null"],
        correctAnswer: 1,
        explanation: "In C, 0 is false. Not false (!0) is true, which is represented as 1."
    },
    {
        unit: 1,
        question: "Which of the following is NOT a fundamental data type in C?",
        options: ["int", "float", "array", "double"],
        correctAnswer: 2,
        explanation: "An array is a derived data type, not a fundamental/primitive one."
    },
    {
        unit: 1,
        question: "Which operator is used to access the value at an address (dereferencing)?",
        options: ["&", "*", "->", "."],
        correctAnswer: 1,
        explanation: "The unary * operator returns the value stored at the address pointed to."
    },
    {
        unit: 1,
        question: "The range of 'signed char' is typically:",
        options: ["0 to 255", "-128 to 127", "-32768 to 32767", "0 to 65535"],
        correctAnswer: 1,
        explanation: "A signed 8-bit char ranges from -2^7 to (2^7)-1."
    },
    {
        unit: 1,
        question: "What does 'int main()' return to the operating system upon successful completion?",
        options: ["1", "0", "-1", "Nothing"],
        correctAnswer: 1,
        explanation: "Returning 0 from main() indicates the program finished successfully."
    },
    {
        unit: 1,
        question: "Which header file is needed for the 'printf' function?",
        options: ["<math.h>", "<conio.h>", "<stdio.h>", "<stdlib.h>"],
        correctAnswer: 2,
        explanation: "stdio.h (Standard Input/Output) defines printf and scanf."
    },
    {
        unit: 1,
        question: "What is 'CamelCase' commonly used for?",
        options: ["Loops", "Identifiers/Naming conventions", "File extensions", "Hardware ports"],
        correctAnswer: 1,
        explanation: "CamelCase (e.g. myVariableName) is a common style for naming identifiers."
    },
    {
        unit: 1,
        question: "Which operator has the lowest precedence among these?",
        options: ["*", "+", "=", "&&"],
        correctAnswer: 2,
        explanation: "Assignment operators (=, +=, etc.) have very low precedence."
    },
    {
        unit: 1,
        question: "What is 'Code Readability'?",
        options: ["How fast the code runs", "How easy it is for an engineer to understand the logic", "The font size used in the editor", "The number of lines in the file"],
        correctAnswer: 1,
        explanation: "Readability is enhanced by good naming, comments, and consistent indentation."
    },
    {
        unit: 1,
        question: "Which of the following is a valid character constant?",
        options: ["'A'", "A", "\"A\"", "'ABC'"],
        correctAnswer: 0,
        explanation: "Single characters are enclosed in single quotes (' ')."
    },
    {
        unit: 1,
        question: "What is an 'Identifier'?",
        options: ["A keyword", "A name given to variables, functions, or arrays", "A type of loop", "A compiler error"],
        correctAnswer: 1,
        explanation: "Identifiers are user-defined names."
    },
    {
        unit: 1,
        question: "What is the purpose of the 'sizeof' operator?",
        options: ["To find the number of lines", "To find the memory size of a data type or variable in bytes", "To resize the window", "To count the number of variables"],
        correctAnswer: 1,
        explanation: "sizeof returns the bytes occupied by the operand."
    },
    {
        unit: 1,
        question: "Which data type has the largest storage capacity among these?",
        options: ["long long int", "int", "short int", "char"],
        correctAnswer: 0,
        explanation: "long long int is at least 64 bits (8 bytes)."
    }
];
