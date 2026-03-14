import { QuizQuestion } from '../../../types.ts';

export const int108Unit3MCQs: QuizQuestion[] = [
    { id: "int108-u3-1", unit: 3, topic: 'Functions', difficulty: 'easy', questionType: 'MCQ', question: "Which keyword is used to create a function?", options: ["def", "func", "function", "lambda"], correctAnswer: 0, explanation: "'def' stands for define function." },
    { id: "int108-u3-2", unit: 3, topic: 'Functions', difficulty: 'easy', questionType: 'MCQ', question: "What follows the function name in a definition?", options: ["Parentheses ()", "Brackets []", "Braces { }", "Quotes"], correctAnswer: 0, explanation: "Parentheses are required, even if there are no parameters." },
    { id: "int108-u3-3", unit: 3, topic: 'Return', difficulty: 'easy', questionType: 'MCQ', question: "Which statement sends a value back to the caller?", options: ["return", "send", "give", "result"], correctAnswer: 0, explanation: "return exits a function and optionally passes data back." },
    { id: "int108-u3-4", unit: 3, topic: 'Arguments', difficulty: 'easy', questionType: 'MCQ', question: "Information passed into a function is called ___.", options: ["Arguments", "Variables", "Data", "Logic"], correctAnswer: 0, explanation: "Arguments/parameters provide input for functions." },
    { id: "int108-u3-5", unit: 3, topic: 'Functions', difficulty: 'medium', questionType: 'MCQ', question: "How to call a function named 'my_func'?", options: ["my_func()", "call my_func", "exec my_func", "my_func.run()"], correctAnswer: 0, explanation: "Use the name followed by parentheses to invoke a function." },
    { id: "int108-u3-6", unit: 3, topic: 'Default Arguments', difficulty: 'medium', questionType: 'MCQ', question: "What is a default parameter?", options: ["A value used if none is provided", "The first parameter", "A required parameter", "None"], correctAnswer: 0, explanation: "Default values are assigned in the function signature (e.g., x=5)." },
    { id: "int108-u3-7", unit: 3, topic: 'Return', difficulty: 'medium', questionType: 'MCQ', question: "What does a function return if no return is specified?", options: ["None", "0", "False", "Error"], correctAnswer: 0, explanation: "Implicitly, every Python function returns None if it doesn't hit a return statement." },
    { id: "int108-u3-8", unit: 3, topic: 'Scope', difficulty: 'hard', questionType: 'MCQ', question: "A variable created inside a function is ___.", options: ["Local", "Global", "Static", "Shared"], correctAnswer: 0, explanation: "Its scope is limited to that function's execution." },
    { id: "int108-u3-9", unit: 3, topic: 'Global', difficulty: 'hard', questionType: 'MCQ', question: "How to use a global variable inside a function for modification?", options: ["global keyword", "import", "def", "static"], correctAnswer: 0, explanation: "'global varname' tells Python to use the outer scope variable." },
    { id: "int108-u3-10", unit: 3, topic: 'Lambda', difficulty: 'hard', questionType: 'MCQ', question: "What is a lambda function?", options: ["An anonymous, single-line function", "A recursive function", "A library", "None"], correctAnswer: 0, explanation: "Lambdas are used for small, one-off logic pieces." },
    { id: "int108-u3-11", unit: 3, topic: 'Recursion', difficulty: 'hard', questionType: 'MCQ', question: "What is a function calling itself called?", options: ["Recursion", "Nesting", "Repeating", "Looping"], correctAnswer: 0, explanation: "Recursion is a common technique for solving mathematical problems." },
    { id: "int108-u3-12", unit: 3, topic: 'Docstrings', difficulty: 'medium', questionType: 'MCQ', question: "Where is a docstring placed in a function?", options: ["First line after definition", "At the end", "Before definition", "In a comment"], correctAnswer: 0, explanation: "The first statement after the header is the documentation string." },
    { id: "int108-u3-13", unit: 3, topic: 'Modules', difficulty: 'easy', questionType: 'MCQ', question: "Which keyword loads code from another file?", options: ["import", "load", "include", "use"], correctAnswer: 0, explanation: "'import' is the standard way to access modules." },
    { id: "int108-u3-14", unit: 3, topic: 'Import', difficulty: 'medium', questionType: 'MCQ', question: "How to import a specific function 'f' from module 'm'?", options: ["from m import f", "import f from m", "import m(f)", "None"], correctAnswer: 0, explanation: "'from ... import' allows selective loading." },
    { id: "int108-u3-15", unit: 3, topic: 'Import', difficulty: 'medium', questionType: 'MCQ', question: "What does 'import math as m' do?", options: ["Renames math to m locally", "Copies math", "Errors", "None"], correctAnswer: 0, explanation: "Aliasing allows shorter references to modules." },
    { id: "int108-u3-16", unit: 3, topic: 'Arguments', difficulty: 'hard', questionType: 'MCQ', question: "What is '*args' used for?", options: ["Variable length non-keyword arguments", "Keyword arguments", "Printing", "None"], correctAnswer: 0, explanation: "It collects extra positional arguments into a tuple." },
    { id: "int108-u3-17", unit: 3, topic: 'Arguments', difficulty: 'hard', questionType: 'MCQ', question: "What is '**kwargs' used for?", options: ["Variable length keyword arguments", "Positional arguments", "Lists", "None"], correctAnswer: 0, explanation: "It collects extra named arguments into a dictionary." },
    { id: "int108-u3-18", unit: 3, topic: 'Search Path', difficulty: 'hard', questionType: 'MCQ', question: "Which module contains the Python search path?", options: ["sys", "os", "path", "python"], correctAnswer: 0, explanation: "sys.path is a list of directories where modules are searched." },
    { id: "int108-u3-19", unit: 3, topic: 'Built-in', difficulty: 'easy', questionType: 'MCQ', question: "Which function gives a list of all names in a module?", options: ["dir()", "list()", "help()", "info()"], correctAnswer: 0, explanation: "dir() displays the attributes of an object or module." },
    { id: "int108-u3-20", unit: 3, topic: 'Packages', difficulty: 'hard', questionType: 'MCQ', question: "What file makes a folder a Python package?", options: ["__init__.py", "__main__.py", "setup.py", "pkg.py"], correctAnswer: 0, explanation: "Traditionally, __init__.py is required to mark directories as packages." },
    { id: "int108-u3-21", unit: 3, topic: 'Math Module', difficulty: 'easy', questionType: 'MCQ', question: "Which module provides 'pi' and 'sqrt'?", options: ["math", "random", "os", "statistics"], correctAnswer: 0, explanation: "The math module handles basic mathematical constants and functions." },
    { id: "int108-u3-22", unit: 3, topic: 'Built-in', difficulty: 'medium', questionType: 'MCQ', question: "What does 'help()' do?", options: ["Displays documentation", "Fixes code", "Stops errors", "None"], correctAnswer: 0, explanation: "The interactive help utility." },
    { id: "int108-u3-23", unit: 3, topic: 'Functions', difficulty: 'medium', questionType: 'MCQ', question: "Are function names case-sensitive?", options: ["Yes", "No", "Depends on OS", "None"], correctAnswer: 0, explanation: "Like all identifiers in Python, function names must match case." },
    { id: "int108-u3-24", unit: 3, topic: 'Lambda', difficulty: 'hard', questionType: 'MCQ', question: "Syntax of a lambda adding two numbers?", options: ["lambda a, b: a + b", "lambda(a, b) = a+b", "f(a,b) => a+b", "None"], correctAnswer: 0, explanation: "lambda parameters: expression." },
    { id: "int108-u3-25", unit: 3, topic: 'Type Hinting', difficulty: 'hard', questionType: 'MCQ', question: "How to hint an integer argument 'x'?", options: ["x: int", "int x", "x(int)", "None"], correctAnswer: 0, explanation: "Type hints (PEP 484) use the colon syntax." },
    { id: "int108-u3-26", unit: 3, topic: 'Arbitrary Argument', difficulty: 'medium', questionType: 'MCQ', question: "Correct definition for variable arguments?", options: ["def f(*x):", "def f(x...):", "def f([]x):", "None"], correctAnswer: 0, explanation: "Leading asterisk for positional expansion." },
    { id: "int108-u3-27", unit: 3, topic: 'Modules', difficulty: 'easy', questionType: 'MCQ', question: "What is a module?", options: ["A file containing Python code", "A hardware component", "A loop", "None"], correctAnswer: 0, explanation: "Modules encapsulate functions, classes, and variables." },
    { id: "int108-u3-28", unit: 3, topic: 'Importing', difficulty: 'medium', questionType: 'MCQ', question: "What does 'from math import *' do?", options: ["Imports everything except hidden", "Imports only constants", "Error", "None"], correctAnswer: 0, explanation: "Star imports load all public members of a module into current namespace." },
    { id: "int108-u3-29", unit: 3, topic: 'Random', difficulty: 'easy', questionType: 'MCQ', question: "Which function returns a random integer?", options: ["randint(a, b)", "random()", "choice()", "None"], correctAnswer: 0, explanation: "random.randint(start, end) includes both endpoints." },
    { id: "int108-u3-30", unit: 3, topic: 'Random', difficulty: 'medium', questionType: 'MCQ', question: "Which function picks a random item from a list?", options: ["choice()", "sample()", "pick()", "shuffle()"], correctAnswer: 0, explanation: "random.choice(sequence) returns a random element." },
    { id: "int108-u3-31", unit: 3, topic: 'Time Module', difficulty: 'medium', questionType: 'MCQ', question: "Which function pauses execution for n seconds?", options: ["time.sleep(n)", "time.wait(n)", "pause(n)", "None"], correctAnswer: 0, explanation: "sleep() is standard for delays." },
    { id: "int108-u3-32", unit: 3, topic: 'OS Module', difficulty: 'hard', questionType: 'MCQ', question: "Which function gets the current working directory?", options: ["os.getcwd()", "os.path()", "os.dir()", "None"], correctAnswer: 0, explanation: "Get Current Working Directory." },
    { id: "int108-u3-33", unit: 3, topic: 'Functions', difficulty: 'medium', questionType: 'MCQ', question: "Can a function return multiple values?", options: ["Yes (as a tuple)", "No", "Only if same type", "None"], correctAnswer: 0, explanation: "You can separate return items with commas." },
    { id: "int108-u3-34", unit: 3, topic: 'Recursion', difficulty: 'hard', questionType: 'MCQ', question: "Risk of recursion without base case?", options: ["RecursionError (Stack Overflow)", "Nothing", "Infinite loop", "None"], correctAnswer: 0, explanation: "Python has a max recursion depth to prevent crashes." },
    { id: "int108-u3-35", unit: 3, topic: 'Arguments', difficulty: 'medium', questionType: 'MCQ', question: "Keyword arguments use which syntax?", options: ["name=value", "name: value", "name -> value", "None"], correctAnswer: 0, explanation: "You can specify which parameter a value belongs to by name." },
    { id: "int108-u3-36", unit: 3, topic: 'Nested Functions', difficulty: 'hard', questionType: 'MCQ', question: "Defining function inside function?", options: ["Inner/Nested function", "Sub-routine", "Module", "None"], correctAnswer: 0, explanation: "Inner functions can access variables from outer scope (Closure)." },
    { id: "int108-u3-37", unit: 3, topic: 'Functional', difficulty: 'hard', questionType: 'MCQ', question: "Which built-in applies a function to an iterable?", options: ["map()", "filter()", "reduce()", "None"], correctAnswer: 0, explanation: "map(func, sequence) transforms all items." },
    { id: "int108-u3-38", unit: 3, topic: 'Functional', difficulty: 'hard', questionType: 'MCQ', question: "Which built-in selects items based on a condition?", options: ["filter()", "map()", "scan()", "None"], correctAnswer: 0, explanation: "filter(func, sequence) keeps items that return True." },
    { id: "int108-u3-39", unit: 3, topic: 'Lambda', difficulty: 'medium', questionType: 'MCQ', question: "Are lambdas good for multi-line logic?", options: ["No", "Yes", "Depends", "None"], correctAnswer: 0, explanation: "Lambdas are restricted to single expressions." },
    { id: "int108-u3-40", unit: 3, topic: 'Module Path', difficulty: 'hard', questionType: 'MCQ', question: "How to see where a module file is?", options: ["module.__file__", "module.path", "module.loc", "None"], correctAnswer: 0, explanation: "The __file__ attribute points to the source location." },
    { id: "int108-u3-41", unit: 3, topic: 'Main Code', difficulty: 'hard', questionType: 'MCQ', question: "Standard 'main' block condition?", options: ["if __name__ == '__main__':", "if main:", "if start:", "None"], correctAnswer: 0, explanation: "Checks if script is run directly vs imported." },
    { id: "int108-u3-42", unit: 3, topic: 'Documentation', difficulty: 'easy', questionType: 'MCQ', question: "How to read a function's docstring?", options: ["function.__doc__", "function.doc", "function.text", "None"], correctAnswer: 0, explanation: "The __doc__ attribute stores that string." },
    { id: "int108-u3-43", unit: 3, topic: 'Closures', difficulty: 'hard', questionType: 'MCQ', question: "What is a closure?", options: ["Nested function remembering state", "Closing a file", "End of program", "None"], correctAnswer: 0, explanation: "A function object that has a reference to variables in a non-local scope." },
    { id: "int108-u3-44", unit: 3, topic: 'Attributes', difficulty: 'hard', questionType: 'MCQ', question: "Can functions have custom attributes?", options: ["Yes", "No", "Only classes", "None"], correctAnswer: 0, explanation: "Function objects in Python allow setting arbitrary properties." },
    { id: "int108-u3-45", unit: 3, topic: 'Yield', difficulty: 'hard', questionType: 'MCQ', question: "What does 'yield' do?", options: ["Makes a generator", "Returns a value", "Ends loop", "None"], correctAnswer: 0, explanation: "Yield pauses the function and returns a value, maintaining state for next call." },
    { id: "int108-u3-46", unit: 3, topic: 'Global', difficulty: 'medium', questionType: 'MCQ', question: "Are global variables generally recommended?", options: ["No (Avoid when possible)", "Yes", "Always", "None"], correctAnswer: 0, explanation: "Glocal state can make debugging difficult." },
    { id: "int108-u3-47", unit: 3, topic: 'Standard Library', difficulty: 'easy', questionType: 'MCQ', question: "What is the Python standard library?", options: ["Included collection of modules", "Online docs", "Third party tools", "None"], correctAnswer: 0, explanation: "Python's 'Batteries Included' philosophy." },
    { id: "int108-u3-48", unit: 3, topic: 'Statistics', difficulty: 'medium', questionType: 'MCQ', question: "Module for mean/median?", options: ["statistics", "math", "random", "csv"], correctAnswer: 0, explanation: "The statistics module is for descriptive stats." },
    { id: "int108-u3-49", unit: 3, topic: 'JSON', difficulty: 'medium', questionType: 'MCQ', question: "Module to handle JSON data?", options: ["json", "dict", "web", "api"], correctAnswer: 0, explanation: "The json module parses and stringifies JSON." },
    { id: "int108-u3-50", unit: 3, topic: 'Arguments', difficulty: 'medium', questionType: 'MCQ', question: "Can a function have 0 arguments?", options: ["Yes", "No", "Needs at least 1", "None"], correctAnswer: 0, explanation: "Functions like print() or those with no logic often have 0 params." },
    { id: "int108-u3-51", unit: 3, topic: 'Importing', difficulty: 'hard', questionType: 'MCQ', question: "What does the '__pycache__' folder store?", options: ["Compiled bytecode (.pyc)", "Backups", "Temp images", "None"], correctAnswer: 0, explanation: "Stores intermediate compiled code for faster subsequent loads." },
    { id: "int108-u3-52", unit: 3, topic: 'Name Clash', difficulty: 'medium', questionType: 'MCQ', question: "What happens if local and global names match?", options: ["Local hides global", "Error", "Global hides local", "Both used"], correctAnswer: 0, explanation: "Local scope is searched first (Shadowing)." },
    { id: "int108-u3-53", unit: 3, topic: 'Parameters', difficulty: 'easy', questionType: 'MCQ', question: "Required vs Optional?", options: ["Default values make them optional", "All are required", "All are optional", "None"], correctAnswer: 0, explanation: "Positionals without defaults must be provided." },
    { id: "int108-u3-54", unit: 3, topic: 'Nonlocal', difficulty: 'hard', questionType: 'MCQ', question: "Keyword for variables in enclosing (parent) scope?", options: ["nonlocal", "global", "parent", "super"], correctAnswer: 0, explanation: "nonlocal allows modifying variables in the nearest enclosing scope that is not global." },
    { id: "int108-u3-55", unit: 3, topic: 'Decorators', difficulty: 'hard', questionType: 'MCQ', question: "What uses the @ symbol?", options: ["Decorators", "Classes", "Lambdas", "Modules"], correctAnswer: 0, explanation: "Decorators wrap functions to modify behavior." },
    { id: "int108-u3-56", unit: 3, topic: 'Return', difficulty: 'easy', questionType: 'MCQ', question: "What is 'return None'?", options: ["Same as 'return'", "Error", "Stops file", "None"], correctAnswer: 0, explanation: "Equal to empty return." },
    { id: "int108-u3-57", unit: 3, topic: 'Calling', difficulty: 'easy', questionType: 'MCQ', question: "Arguments order matter?", options: ["Yes for positional, No for keyword", "Always", "Never", "None"], correctAnswer: 0, explanation: "Position determines which value goes to which param unless named." },
    { id: "int108-u3-58", unit: 3, topic: 'Lambda', difficulty: 'medium', questionType: 'MCQ', question: "Can lambdas handle print()?", options: ["Yes (as an expression)", "No", "Only strings", "None"], correctAnswer: 0, explanation: "Works because print() returns None." },
    { id: "int108-u3-59", unit: 3, topic: 'Importing', difficulty: 'medium', questionType: 'MCQ', question: "Does 'import math' load constants like e?", options: ["Yes (math.e)", "No", "Only if specified", "None"], correctAnswer: 0, explanation: "Everything in the file is loaded." },
    { id: "int108-u3-60", unit: 3, topic: 'Recursion', difficulty: 'medium', questionType: 'MCQ', question: "Factorial(n) logic?", options: ["n * factorial(n-1)", "n + factorial(n-1)", "None", "n / factorial"], correctAnswer: 0, explanation: "Classic recursion example." },
    { id: "int108-u3-61", unit: 3, topic: 'Naming', difficulty: 'easy', questionType: 'MCQ', question: "Can function start with number?", options: ["No", "Yes", "Only in Python 2", "None"], correctAnswer: 0, explanation: "Standard identifier rules apply." },
    { id: "int108-u3-62", unit: 3, topic: 'Internal', difficulty: 'hard', questionType: 'MCQ', question: "What is 'locals()' function?", options: ["Dict of local symbols", "List of files", "None", "Both"], correctAnswer: 0, explanation: "Returns a dictionary representing current local symbol table." },
    { id: "int108-u3-63", unit: 3, topic: 'Internal', difficulty: 'hard', questionType: 'MCQ', question: "What is 'globals()' function?", options: ["Dict of global symbols", "Global OS commands", "None", "Both"], correctAnswer: 0, explanation: "Returns dictionary of current global symbol table." },
    { id: "int108-u3-64", unit: 3, topic: 'Arguments', difficulty: 'medium', questionType: 'MCQ', question: "What is 'pass-by-object-reference'?", options: ["References are passed by value", "Deep copy always", "None", "Memory addresses only"], correctAnswer: 0, explanation: "Objects are shared but bindings are local." },
    { id: "int108-u3-65", unit: 3, topic: 'Mutability', difficulty: 'hard', questionType: 'MCQ', question: "Mutable default arguments (like []) are?", options: ["Dangerous / Persistent", "Standard", "Safe", "None"], correctAnswer: 0, explanation: "They share state between calls, which can cause bugs." },
    { id: "int108-u3-66", unit: 3, topic: 'Help', difficulty: 'easy', questionType: 'MCQ', question: "Help output source?", options: ["Docstrings", "Module names", "Both", "None"], correctAnswer: 2, explanation: "Docstrings are primary." },
    { id: "int108-u3-67", unit: 3, topic: 'Print', difficulty: 'easy', questionType: 'MCQ', question: "Is print a function in Python 3?", options: ["Yes", "No (Statement)", "Both", "None"], correctAnswer: 0, explanation: "It moved from statement in v2 to function in v3." },
    { id: "int108-u3-68", unit: 3, topic: 'Composition', difficulty: 'hard', questionType: 'MCQ', question: "Function as Argument?", options: ["Supported (First-class citizens)", "Not supported", "Only in modules", "None"], correctAnswer: 0, explanation: "Functions can be passed and returned like any object." },
    { id: "int108-u3-69", unit: 3, topic: 'Refactoring', difficulty: 'medium', questionType: 'MCQ', question: "Benefit of creating functions?", options: ["Code Reusability", "Slows down code", "None", "Both"], correctAnswer: 0, explanation: "Avoids DRY (Don't Repeat Yourself) violations." },
    { id: "int108-u3-70", unit: 3, topic: 'Refactoring', difficulty: 'medium', questionType: 'MCQ', question: "Benefit of modules?", options: ["Organization", "Confusion", "None", "Both"], correctAnswer: 0, explanation: "Separation of concerns." },
    { id: "int108-u3-71", unit: 3, topic: 'Modules', difficulty: 'medium', questionType: 'MCQ', question: "Built-in module for file paths?", options: ["os.path / pathlib", "file", "disk", "None"], correctAnswer: 0, explanation: "Provides cross-platform path handling." },
    { id: "int108-u3-72", unit: 3, topic: 'Strings', difficulty: 'easy', questionType: 'MCQ', question: "Is 'format()' a function or method?", options: ["String Method", "Global function", "Both", "None"], correctAnswer: 0, explanation: "Called on a string instance." },
    { id: "int108-u3-73", unit: 3, topic: 'Itertools', difficulty: 'hard', questionType: 'MCQ', question: "Module for advanced iteration?", options: ["itertools", "looptools", "sequence", "None"], correctAnswer: 0, explanation: "Fast, memory-efficient tools for looping." },
    { id: "int108-u3-74", unit: 3, topic: 'Functools', difficulty: 'hard', questionType: 'MCQ', question: "Module for higher-order functions?", options: ["functools", "logictools", "math", "None"], correctAnswer: 0, explanation: "Provides tools like 'partial' and 'lru_cache'." },
    { id: "int108-u3-75", unit: 3, topic: 'Built-in', difficulty: 'easy', questionType: 'MCQ', question: "Input from user function?", options: ["input()", "read()", "getUser()", "None"], correctAnswer: 0, explanation: "Standard CLI input." },
    { id: "int108-u3-76", unit: 3, topic: 'Return', difficulty: 'medium', questionType: 'MCQ', question: "Can return be used outside function?", options: ["No (SyntaxError)", "Yes", "Only in if", "None"], correctAnswer: 0, explanation: "It belongs strictly to function scope." },
    { id: "int108-u3-77", unit: 3, topic: 'Main', difficulty: 'medium', questionType: 'MCQ', question: "Effect of 'import' on code execution?", options: ["Runs all top-level code", "Only loads names", "None", "Both"], correctAnswer: 0, explanation: "Top level code in module executes on first import." },
    { id: "int108-u3-78", unit: 3, topic: 'Re-importing', difficulty: 'hard', questionType: 'MCQ', question: "How to reload a module during execution?", options: ["importlib.reload()", "re-import", "None", "Both"], correctAnswer: 0, explanation: "Standard re-importing doesn't refresh existing code." },
    { id: "int108-u3-79", unit: 3, topic: 'Naming', difficulty: 'medium', questionType: 'MCQ', question: "Is '__name__' a special variable?", options: ["Yes", "No", "Only for classes", "None"], correctAnswer: 0, explanation: "Stores the name of the module." },
    { id: "int108-u3-80", unit: 3, topic: 'Naming', difficulty: 'medium', questionType: 'MCQ', question: "Value of __name__ in main script?", options: ["'__main__'", "FileName", "None", "Error"], correctAnswer: 0, explanation: "It indicates direct execution." },
    { id: "int108-u3-81", unit: 3, topic: 'Arguments', difficulty: 'easy', questionType: 'MCQ', question: "Comma separator needed for params?", options: ["Yes", "No", "Only for 2+", "None"], correctAnswer: 0, explanation: "Mandatory separator." },
    { id: "int108-u3-82", unit: 3, topic: 'Call stack', difficulty: 'hard', questionType: 'MCQ', question: "Where are local variables stored?", options: ["Stack", "Heap", "Disk", "None"], correctAnswer: 0, explanation: "Temporary storage in call stack." },
    { id: "int108-u3-83", unit: 3, topic: 'Closure', difficulty: 'hard', questionType: 'MCQ', question: "Can inner function modify outer variable without 'nonlocal'?", options: ["No", "Yes", "Depends", "None"], correctAnswer: 0, explanation: "Modification requires declaration; reading doesn't." },
    { id: "int108-u3-84", unit: 3, topic: 'Keyword', difficulty: 'medium', questionType: 'MCQ', question: "Is 'def' mandatory?", options: ["Yes (for named functions)", "No", "Optional", "None"], correctAnswer: 0, explanation: "Required syntax component." },
    { id: "int108-u3-85", unit: 3, topic: 'Yield', difficulty: 'hard', questionType: 'MCQ', question: "Difference between return and yield?", options: ["Yield preserves state, return wipes it", "Same", "Yield is faster", "None"], correctAnswer: 0, explanation: "Yield makes functions resumeable." },
    { id: "int108-u3-86", unit: 3, topic: 'Generators', difficulty: 'hard', questionType: 'MCQ', question: "Functions using yield return ___?", options: ["Generators", "Lists", "Values", "None"], correctAnswer: 0, explanation: "Generator objects produce items one by one." },
    { id: "int108-u3-87", unit: 3, topic: 'Mapping', difficulty: 'medium', questionType: 'MCQ', question: "map(str, [1, 2]) result?", options: ["['1', '2']", "[1, 2]", "Error", "None"], correctAnswer: 0, explanation: "Converts each item to string." },
    { id: "int108-u3-88", unit: 3, topic: 'Filtering', difficulty: 'medium', questionType: 'MCQ', question: "filter(None, [0, 1]) result?", options: ["[1]", "[0, 1]", "Error", "None"], correctAnswer: 0, explanation: "Removes falsy value (0)." },
    { id: "int108-u3-89", unit: 3, topic: 'Zip', difficulty: 'medium', questionType: 'MCQ', question: "zip([1], [2]) result?", options: ["[(1, 2)]", "[1, 2]", "Error", "None"], correctAnswer: 0, explanation: "Creates list of tuples." },
    { id: "int108-u3-90", unit: 3, topic: 'Slicing', difficulty: 'easy', questionType: 'MCQ', question: "[:3] takes?", options: ["First 3 elements", "Last 3", "Only 3rd", "None"], correctAnswer: 0, explanation: "Starts from 0 up to 3." },
    { id: "int108-u3-91", unit: 3, topic: 'Recursion', difficulty: 'hard', questionType: 'MCQ', question: "Base case role?", options: ["Stops recursion", "Starts recursion", "Error handling", "None"], correctAnswer: 0, explanation: "Condition to end self-calls." },
    { id: "int108-u3-92", unit: 3, topic: 'Attributes', difficulty: 'hard', questionType: 'MCQ', question: "What is __annotations__?", options: ["Dict of type hints", "All comments", "List of names", "None"], correctAnswer: 0, explanation: "Stores type information defined in signature." },
    { id: "int108-u3-93", unit: 3, topic: 'Arguments', difficulty: 'medium', questionType: 'MCQ', question: "Can you pass a dictionary as arguments?", options: ["Yes (using **)", "No", "Only if short", "None"], correctAnswer: 0, explanation: "Unpacking using double asterisk." },
    { id: "int108-u3-94", unit: 3, topic: 'Arguments', difficulty: 'medium', questionType: 'MCQ', question: "Can you pass a list as arguments?", options: ["Yes (using *)", "No", "Only if short", "None"], correctAnswer: 0, explanation: "Unpacking using single asterisk." },
    { id: "int108-u3-95", unit: 3, topic: 'Arguments', difficulty: 'easy', questionType: 'MCQ', question: "Multiple returns return which type?", options: ["Tuple", "List", "Set", "None"], correctAnswer: 0, explanation: "Default behavior." },
    { id: "int108-u3-96", unit: 3, topic: 'Static', difficulty: 'hard', questionType: 'MCQ', question: "Does Python have static local variables?", options: ["No (But can use attributes/globals)", "Yes", "Only in functions", "None"], correctAnswer: 0, explanation: "Local scope is cleared after return." },
    { id: "int108-u3-97", unit: 3, topic: 'Indentation', difficulty: 'easy', questionType: 'MCQ', question: "Function body must be indented?", options: ["Yes", "No", "Optional", "None"], correctAnswer: 0, explanation: "Defines the block." },
    { id: "int108-u3-98", unit: 3, topic: 'Style', difficulty: 'medium', questionType: 'MCQ', question: "PEP 8 recommendation for function names?", options: ["lowercase_with_underscores", "camelCase", "PascalCase", "ALL_CAPS"], correctAnswer: 0, explanation: "Industry standard for readability." },
    { id: "int108-u3-99", unit: 3, topic: 'Importing', difficulty: 'easy', questionType: 'MCQ', question: "Import statement location?", options: ["Top of file (Recommended)", "Bottom", "Inside function", "Both A and C"], correctAnswer: 3, explanation: "Usually top, but can be local." },
    { id: "int108-u3-100", unit: 3, topic: 'Math', difficulty: 'easy', questionType: 'MCQ', question: "How to use sin(x)?", options: ["math.sin(x)", "sin(x)", "math(sin, x)", "None"], correctAnswer: 0, explanation: "Requires module prefix." }
];

export const int108Unit3Coding: QuizQuestion[] = [
    {
        id: `int108-u3-coding-1`,
        unit: 3,
        topic: `Recursion`,
        difficulty: `hard`,
        type: `coding`,
        question: `Write a recursive function 'fibonacci(n)' that returns the Nth Fibonacci number. (0th = 0, 1st = 1, 2nd = 1, 3rd = 2, ...)`,
        starterCode: `def fibonacci(n):
    # Your recursive logic here

n = int(input())
print(fibonacci(n))`,
        testCases: [
            { "input": "0", "output": "0" },
            { "input": "1", "output": "1" },
            { "input": "6", "output": "8" },
            { "input": "10", "output": "55", "isHidden": true }
        ],
        explanation: `Base cases: n=0 return 0, n=1 return 1. Recursive step: fib(n-1) + fib(n-2).`
    },
    {
        id: `int108-u3-coding-2`,
        unit: 3,
        topic: `Variable Arguments (*args)`,
        difficulty: `hard`,
        type: `coding`,
        question: `Define a function 'sum_all(*args)' that takes any number of integer arguments and returns their sum. If no arguments are passed, return 0.`,
        starterCode: `def sum_all(*args):
    # Your code here

# Test calls
print(sum_all(1, 2, 3))
print(sum_all())
print(sum_all(10, -5, 15))`,
        testCases: [
            { "input": "", "output": "6\n0\n20" }
        ],
        explanation: `Iterate through the 'args' tuple and accumulate the sum.`
    },
    {
        id: `int108-u3-coding-3`,
        unit: 3,
        topic: `Modular Calculator`,
        difficulty: `medium`,
        type: `coding`,
        question: `Create a function 'calculate(a, b, op)' where 'op' is a string ('+', '-', '*', '/'). Return the result of the operation. If 'op' is invalid, return 'Invalid'.`,
        starterCode: `def calculate(a, b, op):
    # Your logic here

a = int(input())
b = int(input())
op = input()
print(calculate(a, b, op))`,
        testCases: [
            { "input": "10\n5\n+", "output": "15" },
            { "input": "10\n2\n/", "output": "5.0" },
            { "input": "4\n3\n*", "output": "12" },
            { "input": "5\n5\n%", "output": "Invalid", "isHidden": true }
        ],
        explanation: `Use simple if-elif conditions to handle the four operations.`
    },
    {
        id: `int108-u3-coding-4`,
        unit: 3,
        topic: `Multiple Returns`,
        difficulty: `medium`,
        type: `coding`,
        question: `Write a function 'get_stats(numbers)' that takes a list of numbers and returns a TUPLE containing the (min, max, length) of the list.`,
        starterCode: `def get_stats(nums):
    # Your code here

nums = [int(x) for x in input().split()]
stats = get_stats(nums)
print(f"Min: {stats[0]}, Max: {stats[1]}, Len: {stats[2]}")`,
        testCases: [
            { "input": "10 20 5 40 30", "output": "Min: 5, Max: 40, Len: 5" },
            { "input": "1 1 1", "output": "Min: 1, Max: 1, Len: 3" },
            { "input": "-5 0 5", "output": "Min: -5, Max: 5, Len: 3", "isHidden": true }
        ],
        explanation: `Use min(), max(), and len() functions and return them as a comma-separated tuple.`
    },
    {
        id: `int108-u3-coding-5`,
        unit: 3,
        topic: `Local vs Global Scope`,
        difficulty: `hard`,
        type: `coding`,
        question: `Observe the global variable 'count'. Create a function 'increment()' that uses the 'global' keyword to increase 'count' by 1 every time it's called.`,
        starterCode: `count = 0
def increment():
    # Your code here

increment()
increment()
print(count)`,
        testCases: [
            { "input": "", "output": "2" }
        ],
        explanation: `Declare 'global count' inside the function to modify the variable in the global scope.`
    }
];
