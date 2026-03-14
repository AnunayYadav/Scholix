import { QuizQuestion } from '../../../types.ts';

export const int108Unit2MCQs: QuizQuestion[] = [
    { id: "int108-u2-1", unit: 2, topic: 'If Statements', difficulty: 'easy', questionType: 'MCQ', question: "Which keyword is used for conditional statements?", options: ["if", "when", "show", "case"], correctAnswer: 0, explanation: "'if' is the primary conditional keyword in Python." },
    { id: "int108-u2-2", unit: 2, topic: 'If Statements', difficulty: 'easy', questionType: 'MCQ', question: "What is the correct syntax for an 'if' statement?", options: ["if x > 5:", "if (x > 5) { ", "if x > 5 then", "if x > 5 do"], correctAnswer: 0, explanation: "Python 'if' statements end with a colon and require indentation." },
    { id: "int108-u2-3", unit: 2, topic: 'Elif', difficulty: 'easy', questionType: 'MCQ', question: "Which keyword is a combination of 'else' and 'if'?", options: ["elif", "else if", "elseif", "elsif"], correctAnswer: 0, explanation: "'elif' is unique to Python for multiple conditions." },
    { id: "int108-u2-4", unit: 2, topic: 'Else', difficulty: 'easy', questionType: 'MCQ', question: "When does the 'else' block execute?", options: ["When 'if' is True", "When 'if' and all 'elif' are False", "Always", "Never"], correctAnswer: 1, explanation: "The 'else' block handles the default case when no conditions match." },
    { id: "int108-u2-5", unit: 2, topic: 'Indentation', difficulty: 'medium', questionType: 'MCQ', question: "What happens if you miss indentation after an 'if'?", options: ["IndentationError", "SyntaxError", "LogicError", "No error"], correctAnswer: 0, explanation: "Indentation is mandatory for defining block scope in Python." },
    { id: "int108-u2-6", unit: 2, topic: 'Loops', difficulty: 'easy', questionType: 'MCQ', question: "Which loop is used when the number of iterations is known?", options: ["for", "while", "do-while", "until"], correctAnswer: 0, explanation: "'for' loops are typically used for iterating over a sequence." },
    { id: "int108-u2-7", unit: 2, topic: 'While Loop', difficulty: 'easy', questionType: 'MCQ', question: "Which loop runs as long as a condition is True?", options: ["for", "while", "repeat", "foreach"], correctAnswer: 1, explanation: "'while' loops check the condition before each execution." },
    { id: "int108-u2-8", unit: 2, topic: 'Range', difficulty: 'medium', questionType: 'MCQ', question: "What is the output of 'range(5)'?", options: ["0 to 4", "1 to 5", "0 to 5", "1 to 4"], correctAnswer: 0, explanation: "range(n) generates numbers from 0 up to n-1." },
    { id: "int108-u2-9", unit: 2, topic: 'Range', difficulty: 'medium', questionType: 'MCQ', question: "What are the arguments for 'range(start, stop, step)'?", options: ["start, end, increment", "begin, finish, skip", "val, limit, jump", "None"], correctAnswer: 0, explanation: "Range accepts an optional start, a mandatory stop, and an optional step." },
    { id: "int108-u2-10", unit: 2, topic: 'Break', difficulty: 'medium', questionType: 'MCQ', question: "Which keyword exits the current loop immediately?", options: ["break", "exit", "stop", "return"], correctAnswer: 0, explanation: "'break' terminates the loop containing it." },
    { id: "int108-u2-11", unit: 2, topic: 'Continue', difficulty: 'medium', questionType: 'MCQ', question: "Which keyword skips the current iteration and goes to the next?", options: ["continue", "skip", "pass", "next"], correctAnswer: 0, explanation: "'continue' stops the current cycle and begins the next loop cycle." },
    { id: "int108-u2-12", unit: 2, topic: 'Pass', difficulty: 'hard', questionType: 'MCQ', question: "What does the 'pass' statement do?", options: ["Nothing (Placeholder)", "Exits the loop", "Restarts the loop", "Error"], correctAnswer: 0, explanation: "'pass' is a null statement used where syntax requires code but no action is needed." },
    { id: "int108-u2-13", unit: 2, topic: 'Nested Loops', difficulty: 'hard', questionType: 'MCQ', question: "What is a loop inside another loop called?", options: ["Nested loop", "Multi-loop", "Inner loop", "Circle"], correctAnswer: 0, explanation: "Nesting allows complex iterations like matrix processing." },
    { id: "int108-u2-14", unit: 2, topic: 'For Loop', difficulty: 'medium', questionType: 'MCQ', question: "Can you iterate over a string with a 'for' loop?", options: ["Yes", "No", "Only if it consists of numbers", "None"], correctAnswer: 0, explanation: "Strings are iterable sequences in Python." },
    { id: "int108-u2-15", unit: 2, topic: 'While Loop', difficulty: 'hard', questionType: 'MCQ', question: "What is an infinite loop?", options: ["A loop that never ends", "A loop that runs once", "A loop that fasts", "None"], correctAnswer: 0, explanation: "Infinite loops occur if the condition never becomes False." },
    { id: "int108-u2-16", unit: 2, topic: 'Iteration', difficulty: 'medium', questionType: 'MCQ', question: "Which function gives both index and value in a loop?", options: ["enumerate()", "items()", "values()", "indexes()"], correctAnswer: 0, explanation: "enumerate() is very useful for getting counters in loops." },
    { id: "int108-u2-17", unit: 2, topic: 'Loop Else', difficulty: 'hard', questionType: 'MCQ', question: "Can a 'for' loop have an 'else' block?", options: ["Yes", "No", "Only while loops", "None"], correctAnswer: 0, explanation: "The 'else' block runs if the loop finished naturally (without break)." },
    { id: "int108-u2-18", unit: 2, topic: 'Arithmetic Logic', difficulty: 'medium', questionType: 'MCQ', question: "What is the output of 'if 0:'?", options: ["It skips the block", "It executes the block", "Error", "None"], correctAnswer: 0, explanation: "In Python, 0 is evaluated as False." },
    { id: "int108-u2-19", unit: 2, topic: 'Arithmetic Logic', difficulty: 'medium', questionType: 'MCQ', question: "What is the output of 'if 1:'?", options: ["Executes block", "Skips block", "Error", "None"], correctAnswer: 0, explanation: "In Python, any non-zero number is evaluated as True." },
    { id: "int108-u2-20", unit: 2, topic: 'Conditionals', difficulty: 'easy', questionType: 'MCQ', question: "Which is the 'not equal' operator?", options: ["!=", "<>", "/=", "not =="], correctAnswer: 0, explanation: "!= is the standard inequality operator." },
    { id: "int108-u2-21", unit: 2, topic: 'Iterables', difficulty: 'easy', questionType: 'MCQ', question: "Which of these can be used in a for loop?", options: ["List", "Tuple", "Dictionary", "All of the above"], correctAnswer: 3, explanation: "Lists, tuples, and dictionaries are all iterable types." },
    { id: "int108-u2-22", unit: 2, topic: 'Dictionary Loop', difficulty: 'medium', questionType: 'MCQ', question: "How to iterate over keys and values of a dict?", options: ["dict.items()", "dict.keys()", "dict.vals()", "dict.all()"], correctAnswer: 0, explanation: ".items() returns key-value pairs as tuples." },
    { id: "int108-u2-23", unit: 2, topic: 'Conditionals', difficulty: 'medium', questionType: 'MCQ', question: "Which has higher priority: 'and' or 'or'?", options: ["and", "or", "Same", "None"], correctAnswer: 0, explanation: "'and' is evaluated before 'or' in logic precedence." },
    { id: "int108-u2-24", unit: 2, topic: 'Loops', difficulty: 'hard', questionType: 'MCQ', question: "How to exit a nested loop completely?", options: ["Use a flag or exception", "break twice", "exit()", "None"], correctAnswer: 0, explanation: "'break' only exits the innermost loop; flags are needed for multiple levels." },
    { id: "int108-u2-25", unit: 2, topic: 'Syntax', difficulty: 'medium', questionType: 'MCQ', question: "Can an 'if' statement be written on one line?", options: ["Yes (if x: print(x))", "No", "Only if it is short", "None"], correctAnswer: 0, explanation: "Single statements can follow the colon on the same line." },
    { id: "int108-u2-26", unit: 2, topic: 'Comparison', difficulty: 'medium', questionType: 'MCQ', question: "What is '5 < 10 < 15' in Python?", options: ["True", "False", "Error", "None"], correctAnswer: 0, explanation: "Python supports chained comparison (equivalent to 5<10 and 10<15)." },
    { id: "int108-u2-27", unit: 2, topic: 'Range', difficulty: 'hard', questionType: 'MCQ', question: "Output of 'list(range(5, 0, -1))'?", options: ["[5, 4, 3, 2, 1]", "[5, 4, 3, 2, 1, 0]", "[0, 1, 2, 3, 4, 5]", "Error"], correctAnswer: 0, explanation: "A negative step allows counting downwards." },
    { id: "int108-u2-28", unit: 2, topic: 'Range', difficulty: 'medium', questionType: 'MCQ', question: "Output of 'range(10, 20, 2)'?", options: ["10, 12, 14, 16, 18", "10, 12, 14, 16, 18, 20", "12, 14...20", "None"], correctAnswer: 0, explanation: "Range stops before the end value." },
    { id: "int108-u2-29", unit: 2, topic: 'Iterators', difficulty: 'hard', questionType: 'MCQ', question: "Which method moves an iterator to the next value?", options: ["next()", "iter()", "move()", "advance()"], correctAnswer: 0, explanation: "next() retrieves the next element from an iterator." },
    { id: "int108-u2-30", unit: 2, topic: 'Iterators', difficulty: 'hard', questionType: 'MCQ', question: "What exception is raised when an iterator ends?", options: ["StopIteration", "IndexError", "EndError", "ValueError"], correctAnswer: 0, explanation: "StopIteration signals that no more items are available." },
    { id: "int108-u2-31", unit: 2, topic: 'While Loop', difficulty: 'medium', questionType: 'MCQ', question: "Does Python have a 'do-while' loop?", options: ["No", "Yes", "Only in Python 2", "None"], correctAnswer: 0, explanation: "Python does not have a native do-while construct." },
    { id: "int108-u2-32", unit: 2, topic: 'While Loop', difficulty: 'medium', questionType: 'MCQ', question: "How to simulate a 'do-while' in Python?", options: ["while True + if break", "repeat loop", "for loop", "None"], correctAnswer: 0, explanation: "Using 'while True' with a break condition at the end is the standard way." },
    { id: "int108-u2-33", unit: 2, topic: 'Logical', difficulty: 'medium', questionType: 'MCQ', question: "Output of 'if [1]:'?", options: ["True (Executes)", "False (Skips)", "Error", "None"], correctAnswer: 0, explanation: "Non-empty lists are considered truthy." },
    { id: "int108-u2-34", unit: 2, topic: 'Logical', difficulty: 'medium', questionType: 'MCQ', question: "Output of 'if []:'?", options: ["False (Skips)", "True (Executes)", "Error", "None"], correctAnswer: 0, explanation: "Empty lists are considered falsy." },
    { id: "int108-u2-35", unit: 2, topic: 'Zip', difficulty: 'hard', questionType: 'MCQ', question: "Which function joins two iterables item-by-item?", options: ["zip()", "join()", "merge()", "link()"], correctAnswer: 0, explanation: "zip() creates pairs from two or more sequences." },
    { id: "int108-u2-36", unit: 2, topic: 'Loops', difficulty: 'medium', questionType: 'MCQ', question: "What is 'Short-circuiting' in loops?", options: ["Using break/continue", "Stop logic immediately", "Logic error", "None"], correctAnswer: 0, explanation: "Exiting early to save processing time." },
    { id: "int108-u2-37", unit: 2, topic: 'Syntax', difficulty: 'medium', questionType: 'MCQ', question: "What precedes a block of code in a loop?", options: [":", ";", "{ ", "->"], correctAnswer: 0, explanation: "Colon marks the start of an indented block." },
    { id: "int108-u2-38", unit: 2, topic: 'Conditionals', difficulty: 'medium', questionType: 'MCQ', question: "Ternary operator syntax in Python?", options: ["x if condition else y", "condition ? x : y", "if x : y", "None"], correctAnswer: 0, explanation: "Python's ternary follows an English-like structure." },
    { id: "int108-u2-39", unit: 2, topic: 'Indentation', difficulty: 'easy', questionType: 'MCQ', question: "Is indentation required for a single line if body?", options: ["No, if it's on the same line", "Yes, always", "Only for loops", "None"], correctAnswer: 0, explanation: "As long as it follows the colon on the same line, it's valid." },
    { id: "int108-u2-40", unit: 2, topic: 'Loop Control', difficulty: 'hard', questionType: 'MCQ', question: "Which statement skips everything below it in the loop?", options: ["continue", "pass", "break", "next"], correctAnswer: 0, explanation: "Continue jumps back to the loop header immediately." },
    { id: "int108-u2-41", unit: 2, topic: 'Iterables', difficulty: 'medium', questionType: 'MCQ', question: "How to check if key exists in dict?", options: ["'key' in dict", "dict.has('key')", "dict.exists('key')", "None"], correctAnswer: 0, explanation: "The 'in' operator is the standard check for dictionary keys." },
    { id: "int108-u2-42", unit: 2, topic: 'Membership', difficulty: 'hard', questionType: 'MCQ', question: "Is 'in' case sensitive for strings?", options: ["Yes", "No", "Depends on OS", "None"], correctAnswer: 0, explanation: "String membership is case-sensitive." },
    { id: "int108-u2-43", unit: 2, topic: 'While Loop', difficulty: 'easy', questionType: 'MCQ', question: "What starts a while loop?", options: ["while condition:", "while (condition) do", "while do condition", "None"], correctAnswer: 0, explanation: "while followed by condition and colon." },
    { id: "int108-u2-44", unit: 2, topic: 'Ranges', difficulty: 'medium', questionType: 'MCQ', question: "Output of 'range(2, 2)'?", options: ["Empty", "2", "0", "None"], correctAnswer: 0, explanation: "Since start is equal to stop, it generates nothing." },
    { id: "int108-u2-45", unit: 2, topic: 'Conditionals', difficulty: 'easy', questionType: 'MCQ', question: "Can you have multiple 'else' in one 'if' statement?", options: ["No", "Yes", "Only in functions", "None"], correctAnswer: 0, explanation: "An 'if' block can have only one 'else'." },
    { id: "int108-u2-46", unit: 2, topic: 'Conditionals', difficulty: 'easy', questionType: 'MCQ', question: "Can you have multiple 'elif'?", options: ["Yes", "No", "Only 2", "None"], correctAnswer: 0, explanation: "You can chain as many 'elif' as needed." },
    { id: "int108-u2-47", unit: 2, topic: 'Boolean logic', difficulty: 'medium', questionType: 'MCQ', question: "Output of 'True or 1/0'?", options: ["True", "Error", "False", "None"], correctAnswer: 0, explanation: "Due to short-circuiting, the second part (error) is never evaluated." },
    { id: "int108-u2-48", unit: 2, topic: 'Boolean logic', difficulty: 'medium', questionType: 'MCQ', question: "Output of 'False and 1/0'?", options: ["False", "Error", "True", "None"], correctAnswer: 0, explanation: "Short-circuiting prevents the division by zero error." },
    { id: "int108-u2-49", unit: 2, topic: 'Indentation', difficulty: 'medium', questionType: 'MCQ', question: "Mixing tabs and spaces causes error?", options: ["Yes", "No", "Only in Python 2", "None"], correctAnswer: 0, explanation: "Python 3 prohibits mixing tabs and spaces for indentation." },
    { id: "int108-u2-50", unit: 2, topic: 'Break', difficulty: 'hard', questionType: 'MCQ', question: "Does 'break' exit all nested loops?", options: ["No, only the current one", "Yes, all", "Only if specified", "None"], correctAnswer: 0, explanation: "Break only breaks out of the immediate surrounding loop." },
    { id: "int108-u2-51", unit: 2, topic: 'Conditionals', difficulty: 'medium', questionType: 'MCQ', question: "What is 'not True'?", options: ["False", "True", "None", "Error"], correctAnswer: 0, explanation: "Logical NOT." },
    { id: "int108-u2-52", unit: 2, topic: 'Conditionals', difficulty: 'medium', questionType: 'MCQ', question: "Result of '5 == \"5\"'?", options: ["False", "True", "Error", "None"], correctAnswer: 0, explanation: "Python does not do implicit type casting for equality between int and str." },
    { id: "int108-u2-53", unit: 2, topic: 'While Loop', difficulty: 'easy', questionType: 'MCQ', question: "Standard for boolean True in Python?", options: ["True", "true", "1", "TRUE"], correctAnswer: 0, explanation: "Boolean keywords are capitalized." },
    { id: "int108-u2-54", unit: 2, topic: 'While Loop', difficulty: 'easy', questionType: 'MCQ', question: "Standard for boolean False in Python?", options: ["False", "false", "0", "FALSE"], correctAnswer: 0, explanation: "Boolean keywords are capitalized." },
    { id: "int108-u2-55", unit: 2, topic: 'Comparison', difficulty: 'easy', questionType: 'MCQ', question: "Is 5 >= 5?", options: ["True", "False", "None", "Error"], correctAnswer: 0, explanation: "Greater than or equal to." },
    { id: "int108-u2-56", unit: 2, topic: 'Iterating', difficulty: 'medium', questionType: 'MCQ', question: "What is 'reverse' a list in for loop?", options: ["for x in reversed(list):", "for x in list.reverse():", "for x in list[::-1]:", "Both A and C"], correctAnswer: 3, explanation: "Both reversed() and slicing can be used." },
    { id: "int108-u2-57", unit: 2, topic: 'Infinite Loop', difficulty: 'medium', questionType: 'MCQ', question: "Common command to stop an infinite loop in terminal?", options: ["Ctrl+C", "Ctrl+Z", "Ctrl+X", "None"], correctAnswer: 0, explanation: "Keyboard interrupt signal." },
    { id: "int108-u2-58", unit: 2, topic: 'Syntax', difficulty: 'hard', questionType: 'MCQ', question: "Which came in Python 3.10 for pattern matching?", options: ["match-case", "switch-case", "select-case", "None"], correctAnswer: 0, explanation: "Match-case was introduced as a powerful switch-like structure." },
    { id: "int108-u2-59", unit: 2, topic: 'Syntax', difficulty: 'hard', questionType: 'MCQ', question: "Does Python have a 'goto' statement?", options: ["No", "Yes", "Only in scripts", "None"], correctAnswer: 0, explanation: "Python stays away from 'goto' for cleaner code flow." },
    { id: "int108-u2-60", unit: 2, topic: 'Conditionals', difficulty: 'medium', questionType: 'MCQ', question: "Will 'if None:' execute?", options: ["No", "Yes", "Error", "None"], correctAnswer: 0, explanation: "None is falsy." },
    { id: "int108-u2-61", unit: 2, topic: 'Looping', difficulty: 'easy', questionType: 'MCQ', question: "Which keyword iterates?", options: ["for", "if", "while", "Both for and while"], correctAnswer: 3, explanation: "Both are loop constructs." },
    { id: "int108-u2-62", unit: 2, topic: 'Control', difficulty: 'medium', questionType: 'MCQ', question: "Looping through dict keys?", options: ["for k in d:", "for k in d.keys():", "Both work", "None"], correctAnswer: 2, explanation: "Default iteration of a dict is over its keys." },
    { id: "int108-u2-63", unit: 2, topic: 'Range', difficulty: 'easy', questionType: 'MCQ', question: "range(5) counts ___ numbers?", options: ["5", "6", "4", "Infinite"], correctAnswer: 0, explanation: "0, 1, 2, 3, 4." },
    { id: "int108-u2-64", unit: 2, topic: 'Range', difficulty: 'medium', questionType: 'MCQ', question: "Is range an iterator in Python 3?", options: ["No, it is a sequence-like object", "Yes", "Only if cast", "None"], correctAnswer: 0, explanation: "Range object is a lazy sequence, but not an iterator itself (you need iter())." },
    { id: "int108-u2-65", unit: 2, topic: 'Conditionals', difficulty: 'medium', questionType: 'MCQ', question: "Can a loop contain an if statement?", options: ["Yes", "No", "Only if short", "None"], correctAnswer: 0, explanation: "Control structures can be nested freely." },
    { id: "int108-u2-66", unit: 2, topic: 'Conditionals', difficulty: 'medium', questionType: 'MCQ', question: "Can an if statement contain a loop?", options: ["Yes", "No", "Only for lists", "None"], correctAnswer: 0, explanation: "Nesting is supported." },
    { id: "int108-u2-67", unit: 2, topic: 'Syntax', difficulty: 'easy', questionType: 'MCQ', question: "Is 'else' required for every 'if'?", options: ["No", "Yes", "Only for loops", "None"], correctAnswer: 0, explanation: "Else is optional." },
    { id: "int108-u2-68", unit: 2, topic: 'Syntax', difficulty: 'easy', questionType: 'MCQ', question: "Is 'elif' required after 'if'?", options: ["No", "Yes", "Only for 3 conditions", "None"], correctAnswer: 0, explanation: "Elif is optional." },
    { id: "int108-u2-69", unit: 2, topic: 'Logic', difficulty: 'medium', questionType: 'MCQ', question: "True or False and False?", options: ["True", "False", "None", "Error"], correctAnswer: 0, explanation: "And has precedence: True or (False and False) = True or False = True." },
    { id: "int108-u2-70", unit: 2, topic: 'Logic', difficulty: 'medium', questionType: 'MCQ', question: "(True or False) and False?", options: ["False", "True", "None", "Error"], correctAnswer: 0, explanation: "Parentheses go first: (True) and False = False." },
    { id: "int108-u2-71", unit: 2, topic: 'Looping', difficulty: 'medium', questionType: 'MCQ', question: "What is the result of 'for i in []: print(i)'?", options: ["Nothing happens", "Error", "Prints None", "None"], correctAnswer: 0, explanation: "Loop over empty list exits immediately." },
    { id: "int108-u2-72", unit: 2, topic: 'While Loop', difficulty: 'medium', questionType: 'MCQ', question: "Infinite while loop syntax?", options: ["while True:", "while 1:", "while (1):", "All of the above"], correctAnswer: 3, explanation: "Any truthy value works." },
    { id: "int108-u2-73", unit: 2, topic: 'Continue', difficulty: 'medium', questionType: 'MCQ', question: "Will a 'while' loop condition be checked after 'continue'?", options: ["Yes", "No", "Depends", "None"], correctAnswer: 0, explanation: "Continue goes back to the top of the loop to re-evaluate the condition." },
    { id: "int108-u2-74", unit: 2, topic: 'Break', difficulty: 'medium', questionType: 'MCQ', question: "Will code after 'break' run?", options: ["No", "Yes", "Only if in else", "None"], correctAnswer: 0, explanation: "Break immediately exits the loop block." },
    { id: "int108-u2-75", unit: 2, topic: 'Elif', difficulty: 'easy', questionType: 'MCQ', question: "How many elifs are allowed?", options: ["Unlimited", "10", "1", "None"], correctAnswer: 0, explanation: "There's no fixed limit to elif chaining." },
    { id: "int108-u2-76", unit: 2, topic: 'Syntax', difficulty: 'easy', questionType: 'MCQ', question: "Correct syntax for while?", options: ["while x < 5:", "while x < 5 { ", "while (x < 5):", "Both A and C"], correctAnswer: 3, explanation: "Parentheses are optional but valid." },
    { id: "int108-u2-77", unit: 2, topic: 'Range', difficulty: 'medium', questionType: 'MCQ', question: "range(1, 10, 3) gives?", options: ["1, 4, 7", "1, 4, 7, 10", "4, 7, 10", "None"], correctAnswer: 0, explanation: "Stops before 10." },
    { id: "int108-u2-78", unit: 2, topic: 'Iterating', difficulty: 'medium', questionType: 'MCQ', question: "Looping through a file lines?", options: ["for line in file:", "file.readLines()", "Both", "None"], correctAnswer: 0, explanation: "File objects are iterators over lines." },
    { id: "int108-u2-79", unit: 2, topic: 'Boolean', difficulty: 'easy', questionType: 'MCQ', question: "What is 'not 0'?", options: ["True", "False", "1", "None"], correctAnswer: 0, explanation: "Zero is false, not false is true." },
    { id: "int108-u2-80", unit: 2, topic: 'Boolean', difficulty: 'easy', questionType: 'MCQ', question: "What is 'not 1'?", options: ["False", "True", "0", "None"], correctAnswer: 0, explanation: "One is true, not true is false." },
    { id: "int108-u2-81", unit: 2, topic: 'Loop Else', difficulty: 'hard', questionType: 'MCQ', question: "When does 'else' skip in for loop?", options: ["If 'break' happened", "If loop was empty", "Never", "None"], correctAnswer: 0, explanation: "The 'else' block is specifically skipped if the loop for was broken." },
    { id: "int108-u2-82", unit: 2, topic: 'Range', difficulty: 'easy', questionType: 'MCQ', question: "Type of range(5)?", options: ["<class 'range'>", "list", "tuple", "iterator"], correctAnswer: 0, explanation: "Range has its own specific type." },
    { id: "int108-u2-83", unit: 2, topic: 'Syntax', difficulty: 'easy', questionType: 'MCQ', question: "Which is the 'at least one' operator?", options: ["or", "and", "not", "xor"], correctAnswer: 0, explanation: "OR returns true if any operand is true." },
    { id: "int108-u2-84", unit: 2, topic: 'Syntax', difficulty: 'easy', questionType: 'MCQ', question: "Which is the 'both mandatory' operator?", options: ["and", "or", "not", "xor"], correctAnswer: 0, explanation: "AND returns true only if all operands are true." },
    { id: "int108-u2-85", unit: 2, topic: 'Nesting', difficulty: 'medium', questionType: 'MCQ', question: "Nesting level limit in Python?", options: ["No fixed limit (System memory)", "10", "20", "5"], correctAnswer: 0, explanation: "You can nest as much as depth allows." },
    { id: "int108-u2-86", unit: 2, topic: 'Keywords', difficulty: 'easy', questionType: 'MCQ', question: "Is 'in' used with 'for' loops?", options: ["Yes", "No", "Only for lists", "None"], correctAnswer: 0, explanation: "Syntax is 'for element in sequence:'." },
    { id: "int108-u2-87", unit: 2, topic: 'Membership', difficulty: 'medium', questionType: 'MCQ', question: "Output of '1 in [1, 2, 3]'?", options: ["True", "False", "Error", "None"], correctAnswer: 0, explanation: "1 exists in the list." },
    { id: "int108-u2-88", unit: 2, topic: 'Comparison', difficulty: 'easy', questionType: 'MCQ', question: "Result of '3 < 2'?", options: ["False", "True", "None", "Error"], correctAnswer: 0, explanation: "3 is not less than 2." },
    { id: "int108-u2-89", unit: 2, topic: 'Identity', difficulty: 'hard', questionType: 'MCQ', question: "Result of '[] is []'?", options: ["False", "True", "Error", "None"], correctAnswer: 0, explanation: "Two new lists are different objects in memory." },
    { id: "int108-u2-90", unit: 2, topic: 'Equality', difficulty: 'hard', questionType: 'MCQ', question: "Result of '[] == []'?", options: ["True", "False", "Error", "None"], correctAnswer: 0, explanation: "They contain the same items (empty), so they are equal in value." },
    { id: "int108-u2-91", unit: 2, topic: 'Loop Control', difficulty: 'medium', questionType: 'MCQ', question: "Can you have break in a while loop?", options: ["Yes", "No", "Depends", "None"], correctAnswer: 0, explanation: "Break is valid in for and while." },
    { id: "int108-u2-92", unit: 2, topic: 'Enumeration', difficulty: 'medium', questionType: 'MCQ', question: "enumerate(['a'], 5) start index?", options: ["5", "0", "1", "None"], correctAnswer: 0, explanation: "Second argument sets the starting counter." },
    { id: "int108-u2-93", unit: 2, topic: 'Loops', difficulty: 'medium', questionType: 'MCQ', question: "Can a loop be used with strings?", options: ["Yes", "No", "Only for ints", "None"], correctAnswer: 0, explanation: "Strings are sequences." },
    { id: "int108-u2-94", unit: 2, topic: 'Keywords', difficulty: 'medium', questionType: 'MCQ', question: "Which exits the entire program from a loop?", options: ["sys.exit()", "break", "continue", "return"], correctAnswer: 0, explanation: "sys.exit() closes the interpreter." },
    { id: "int108-u2-95", unit: 2, topic: 'Keywords', difficulty: 'medium', questionType: 'MCQ', question: "Which leaves a function and loop inside it?", options: ["return", "break", "continue", "pass"], correctAnswer: 0, explanation: "Return halts the entire function execution." },
    { id: "int108-u2-96", unit: 2, topic: 'Conditions', difficulty: 'easy', questionType: 'MCQ', question: "What if there is no else in if statement?", options: ["It just continues", "Error", "Stops", "None"], correctAnswer: 0, explanation: "Optional." },
    { id: "int108-u2-97", unit: 2, topic: 'Print', difficulty: 'medium', questionType: 'MCQ', question: "print(1, 2, 3) separator?", options: ["Space", "Comma", "Newline", "None"], correctAnswer: 0, explanation: "Default sep is a single space." },
    { id: "int108-u2-98", unit: 2, topic: 'While', difficulty: 'medium', questionType: 'MCQ', question: "while count < 5: count += 1 runs how many times if count=0?", options: ["5", "4", "6", "Infinite"], correctAnswer: 0, explanation: "0, 1, 2, 3, 4 indices (5 iterations)." },
    { id: "int108-u2-99", unit: 2, topic: 'Iterators', difficulty: 'hard', questionType: 'MCQ', question: "What does iter(list) do?", options: ["Returns iterator object", "Reverses list", "Deletes list", "None"], correctAnswer: 0, explanation: "converts sequence into an iterator." },
    { id: "int108-u2-100", unit: 2, topic: 'Bitwise', difficulty: 'hard', questionType: 'MCQ', question: ">> bits shift?", options: ["Right", "Left", "None", "Random"], correctAnswer: 0, explanation: "Binary Right Shift." }
];

export const int108Unit2Coding: QuizQuestion[] = [
    {
        id: `int108-u2-coding-1`,
        unit: 2,
        topic: `Prime Number Checker`,
        difficulty: `hard`,
        type: `coding`,
        question: `Write a program that takes an integer N and prints "Prime" if it is a prime number, otherwise prints "Not Prime". (A prime number is only divisible by 1 and itself).`,
        starterCode: `n = int(input())
# Your logic here`,
        testCases: [
            { "input": "7", "output": "Prime" },
            { "input": "10", "output": "Not Prime" },
            { "input": "2", "output": "Prime", "isHidden": true },
            { "input": "1", "output": "Not Prime", "isHidden": true }
        ],
        explanation: `Iterate from 2 up to sqrt(n) and check for divisibility.`
    },
    {
        id: `int108-u2-coding-2`,
        unit: 2,
        topic: `FizzBuzz Logic`,
        difficulty: `medium`,
        type: `coding`,
        question: `Take an integer N. For all numbers from 1 to N (inclusive), print:
- "Fizz" if divisible by 3
- "Buzz" if divisible by 5
- "FizzBuzz" if divisible by both 3 and 5
- The number itself if none of the above.`,
        starterCode: `n = int(input())
# Your loop here`,
        testCases: [
            { "input": "5", "output": "1\n2\nFizz\n4\nBuzz" },
            { "input": "3", "output": "1\n2\nFizz" },
            { "input": "15", "output": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz", "isHidden": true }
        ],
        explanation: `Use modulo operator (%) and careful if-elif-else ordering.`
    },
    {
        id: `int108-u2-coding-3`,
        unit: 2,
        topic: `Number Reversal (Math)`,
        difficulty: `hard`,
        type: `coding`,
        question: `Reverse an integer N mathematically (using // and %) and print the result. Do NOT use string slicing [::-1].`,
        starterCode: `n = int(input())
rev = 0
# Your logic here
print(rev)`,
        testCases: [
            { "input": "123", "output": "321" },
            { "input": "400", "output": "4" },
            { "input": "9876", "output": "6789", "isHidden": true }
        ],
        explanation: `Use 'rev = rev * 10 + (n % 10)' in a while loop.`
    },
    {
        id: `int108-u2-coding-4`,
        unit: 2,
        topic: `Nested Conditionals (Leap Year)`,
        difficulty: `medium`,
        type: `coding`,
        question: `Determine if a year is a Leap Year. A year is leap if:
1. It is divisible by 4.
2. But if it is divisible by 100, it must also be divisible by 400.
Print "Leap" or "Not Leap".`,
        starterCode: `year = int(input())
# Your logic here`,
        testCases: [
            { "input": "2024", "output": "Leap" },
            { "input": "1900", "output": "Not Leap" },
            { "input": "2000", "output": "Leap", "isHidden": true }
        ],
        explanation: `Combine logic with AND/OR or nested if statements.`
    },
    {
        id: `int108-u2-coding-5`,
        unit: 2,
        topic: `Loop Control (Break/Continue)`,
        difficulty: `hard`,
        type: `coding`,
        question: `Sum of first N odd numbers. Take N as input. Calculate the sum of the first N positive odd integers (1, 3, 5, ...) using a loop.`,
        starterCode: `n = int(input())
total = 0
# Your code here
print(total)`,
        testCases: [
            { "input": "3", "output": "9" },
            { "input": "5", "output": "25" },
            { "input": "1", "output": "1", "isHidden": true }
        ],
        explanation: `The sum of the first N odd numbers is always N^2, but solve it with a loop.`
    }
];
