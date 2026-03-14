import { QuizQuestion } from '../../../types.ts';

export const int108Unit5MCQs: QuizQuestion[] = [
    { id: "int108-u5-1", unit: 5, topic: 'Exception Handling', difficulty: 'easy', questionType: 'MCQ', question: "Which keyword starts an exception handling block?", options: ["try", "except", "catch", "else"], correctAnswer: 0, explanation: "'try' code is tested for errors." },
    { id: "int108-u5-2", unit: 5, topic: 'Exception Handling', difficulty: 'easy', questionType: 'MCQ', question: "Which block handles the error if one occurs?", options: ["except", "finally", "catch", "then"], correctAnswer: 0, explanation: "'except' catches specific or general errors." },
    { id: "int108-u5-3", unit: 5, topic: 'Exception Handling', difficulty: 'easy', questionType: 'MCQ', question: "Which block executes regardless of an error?", options: ["finally", "else", "end", "always"], correctAnswer: 0, explanation: "'finally' is used for cleanup (like closing files)." },
    { id: "int108-u5-4", unit: 5, topic: 'Exception Handling', difficulty: 'medium', questionType: 'MCQ', question: "Which block runs if NO exception occurs?", options: ["else", "try", "finally", "except"], correctAnswer: 0, explanation: "the 'else' block follows except blocks." },
    { id: "int108-u5-5", unit: 5, topic: 'Error Types', difficulty: 'medium', questionType: 'MCQ', question: "What error occurs if you divide by zero?", options: ["ZeroDivisionError", "ArithmeticError", "MathError", "None"], correctAnswer: 0, explanation: "Specific built-in exception for division by zero." },
    { id: "int108-u5-6", unit: 5, topic: 'Error Types', difficulty: 'medium', questionType: 'MCQ', question: "What error occurs if a variable is not defined?", options: ["NameError", "ValueError", "TypeError", "SyntaxError"], correctAnswer: 0, explanation: "Raised when a local or global name is not found." },
    { id: "int108-u5-7", unit: 5, topic: 'Error Types', difficulty: 'medium', questionType: 'MCQ', question: "What error occurs for wrong data types in operation?", options: ["TypeError", "ValueError", "LogicError", "DataError"], correctAnswer: 0, explanation: "Raised when an operation is applied to an object of inappropriate type." },
    { id: "int108-u5-8", unit: 5, topic: 'Error Types', difficulty: 'medium', questionType: 'MCQ', question: "What error occurs for invalid values (like int('abc'))?", options: ["ValueError", "TypeError", "FormatError", "None"], correctAnswer: 0, explanation: "Raised when a function receives an argument of right type but wrong value." },
    { id: "int108-u5-9", unit: 5, topic: 'Raising', difficulty: 'hard', questionType: 'MCQ', question: "Which keyword is used to trigger an exception manually?", options: ["raise", "throw", "trigger", "exit"], correctAnswer: 0, explanation: "'raise' is used to interrupt program flow with an error." },
    { id: "int108-u5-10", unit: 5, topic: 'Assertions', difficulty: 'hard', questionType: 'MCQ', question: "Which keyword tests a condition and raises error if False?", options: ["assert", "test", "check", "verify"], correctAnswer: 0, explanation: "Used primarily for debugging and sanity checks." },
    { id: "int108-u5-11", unit: 5, topic: 'File Handling', difficulty: 'easy', questionType: 'MCQ', question: "Which function is used to open a file?", options: ["open()", "file()", "read()", "load()"], correctAnswer: 0, explanation: "open(filename, mode) returns a file object." },
    { id: "int108-u5-12", unit: 5, topic: 'File Modes', difficulty: 'easy', questionType: 'MCQ', question: "Which mode is for reading (default)?", options: ["'r'", "'w'", "'a'", "'x'"], correctAnswer: 0, explanation: "Opens file for reading; error if not exists." },
    { id: "int108-u5-13", unit: 5, topic: 'File Modes', difficulty: 'easy', questionType: 'MCQ', question: "Which mode is for writing (overwrites)?", options: ["'w'", "'a'", "'r+'", "'b'"], correctAnswer: 0, explanation: "Creates or overwrites file." },
    { id: "int108-u5-14", unit: 5, topic: 'File Modes', difficulty: 'easy', questionType: 'MCQ', question: "Which mode is for appending?", options: ["'a'", "'w'", "'w+'", "'r'"], correctAnswer: 0, explanation: "Adds data to the end of the file." },
    { id: "int108-u5-15", unit: 5, topic: 'File Handling', difficulty: 'medium', questionType: 'MCQ', question: "Which function reads the entire file content?", options: ["read()", "readLine()", "readAll()", "None"], correctAnswer: 0, explanation: "Returns the whole file as a single string." },
    { id: "int108-u5-16", unit: 5, topic: 'File Handling', difficulty: 'medium', questionType: 'MCQ', question: "Which function reads one line at a time?", options: ["readline()", "readlines()", "read(1)", "None"], correctAnswer: 0, explanation: "Reads until the next newline character." },
    { id: "int108-u5-17", unit: 5, topic: 'File Handling', difficulty: 'medium', questionType: 'MCQ', question: "Which function returns a list of all lines?", options: ["readlines()", "readline()", "all()", "None"], correctAnswer: 0, explanation: "Returns a JSON-like array/list of strings." },
    { id: "int108-u5-18", unit: 5, topic: 'Cleanup', difficulty: 'medium', questionType: 'MCQ', question: "Which method closes a file?", options: ["close()", "stop()", "exit()", "None"], correctAnswer: 0, explanation: "Frees system resources." },
    { id: "int108-u5-19", unit: 5, topic: 'Context Managers', difficulty: 'hard', questionType: 'MCQ', question: "Which keyword ensures a file is closed automatically?", options: ["with", "try", "open", "auto"], correctAnswer: 0, explanation: "'with' statement handles setup and teardown." },
    { id: "int108-u5-20", unit: 5, topic: 'Binary Files', difficulty: 'hard', questionType: 'MCQ', question: "Which mode suffix is for binary files?", options: ["'b'", "'t'", "'bin'", "None"], correctAnswer: 0, explanation: "Used for images, PDFs, etc. (e.g., 'rb', 'wb')." },
    { id: "int108-u5-21", unit: 5, topic: 'File Modes', difficulty: 'medium', questionType: 'MCQ', question: "What does 'x' mode do?", options: ["Exclusive creation (Error if exists)", "Delete file", "Execute file", "None"], correctAnswer: 0, explanation: "Safe way to ensure you don't overwrite." },
    { id: "int108-u5-22", unit: 5, topic: 'File Handling', difficulty: 'medium', questionType: 'MCQ', question: "Where does 'write()' put the data?", options: ["At the cursor position", "At start", "At end", "None"], correctAnswer: 0, explanation: "Depends on the mode ('w' vs 'a') and seek position." },
    { id: "int108-u5-23", unit: 5, topic: 'File Pointer', difficulty: 'hard', questionType: 'MCQ', question: "Which method moves the file cursor?", options: ["seek()", "tell()", "move()", "go()"], correctAnswer: 0, explanation: "Changes the current reading/writing position." },
    { id: "int108-u5-24", unit: 5, topic: 'File Pointer', difficulty: 'hard', questionType: 'MCQ', question: "Which method gets the current cursor position?", options: ["tell()", "seek()", "where()", "None"], correctAnswer: 0, explanation: "Returns the byte offset from the start." },
    { id: "int108-u5-25", unit: 5, topic: 'Directory', difficulty: 'medium', questionType: 'MCQ', question: "Which module handles file/directory operations?", options: ["os", "math", "sys", "random"], correctAnswer: 0, explanation: "provides functions for interacting with OS." },
    { id: "int108-u5-26", unit: 5, topic: 'OS Module', difficulty: 'medium', questionType: 'MCQ', question: "How to delete a file?", options: ["os.remove()", "os.delete()", "del file", "None"], correctAnswer: 0, explanation: "Permanently removes a file." },
    { id: "int108-u5-27", unit: 5, topic: 'OS Module', difficulty: 'medium', questionType: 'MCQ', question: "How to check if path exists?", options: ["os.path.exists()", "os.is()", "check()", "None"], correctAnswer: 0, explanation: "Checks if a file or folder exists at a path." },
    { id: "int108-u5-28", unit: 5, topic: 'Exceptions', difficulty: 'medium', questionType: 'MCQ', question: "Can a 'try' have multiple 'except'?", options: ["Yes", "No", "Only 2", "None"], correctAnswer: 0, explanation: "To handle different error types specifically." },
    { id: "int108-u5-29", unit: 5, topic: 'Excpetions', difficulty: 'medium', questionType: 'MCQ', question: "Catching all errors syntax?", options: ["except:", "except Exception:", "Both work", "except Any:"], correctAnswer: 2, explanation: "Bare except is discouraged but valid; Exception is preferred." },
    { id: "int108-u5-30", unit: 5, topic: 'Raising', difficulty: 'hard', questionType: 'MCQ', question: "Syntax for raising a ValueError?", options: ["raise ValueError()", "ValueError.raise()", "throw ValueError", "None"], correctAnswer: 0, explanation: "Instantiation + raise keyword." },
    { id: "int108-u5-31", unit: 5, topic: 'Custom', difficulty: 'hard', questionType: 'MCQ', question: "How to create a custom exception?", options: ["Class inheriting from Exception", "function", "variable", "None"], correctAnswer: 0, explanation: "Exceptions are classes in Python." },
    { id: "int108-u5-32", unit: 5, topic: 'Assertions', difficulty: 'medium', questionType: 'MCQ', question: "When are assertions ignored?", options: ["When optimized with -O flag", "Always", "In loops", "None"], correctAnswer: 0, explanation: "Python optimizations can skip assert checks." },
    { id: "int108-u5-33", unit: 5, topic: 'File Handling', difficulty: 'medium', questionType: 'MCQ', question: "What is the default encoding for open()?", options: ["Platform dependent (UTF-8 common)", "ASCII", "Binary", "None"], correctAnswer: 0, explanation: "Varies by system locale." },
    { id: "int108-u5-34", unit: 5, topic: 'CSV', difficulty: 'medium', questionType: 'MCQ', question: "Which module handles comma separated values?", options: ["csv", "json", "excel", "table"], correctAnswer: 0, explanation: "Standard module for CSV parsing." },
    { id: "int108-u5-35", unit: 5, topic: 'Exceptions', difficulty: 'medium', questionType: 'MCQ', question: "What is 'IndexError'?", options: ["Accessing index out of range", "Wrong name", "Wrong type", "None"], correctAnswer: 0, explanation: "Common when working with lists/tuples." },
    { id: "int108-u5-36", unit: 5, topic: 'Exceptions', difficulty: 'medium', questionType: 'MCQ', question: "What is 'KeyError'?", options: ["Missing dictionary key", "Missing list item", "Wrong key length", "None"], correctAnswer: 0, explanation: "Specific to dictionary lookups." },
    { id: "int108-u5-37", unit: 5, topic: 'Hierarchy', difficulty: 'hard', questionType: 'MCQ', question: "Root class for all exceptions?", options: ["BaseException", "Exception", "Error", "Object"], correctAnswer: 0, explanation: "Everything else inherits from BaseException." },
    { id: "int108-u5-38", unit: 5, topic: 'File Handling', difficulty: 'medium', questionType: 'MCQ', question: "Buffering parameter in open()?", options: ["Controls line/block buffering", "Speeds up CPU", "None", "Both"], correctAnswer: 0, explanation: "Optimizes disk I/O performance." },
    { id: "int108-u5-39", unit: 5, topic: 'File Attributes', difficulty: 'medium', questionType: 'MCQ', question: "Check if file is closed?", options: ["file.closed", "file.is_closed()", "file.status", "None"], correctAnswer: 0, explanation: "Boolean attribute." },
    { id: "int108-u5-40", unit: 5, topic: 'File Attributes', difficulty: 'medium', questionType: 'MCQ', question: "Get file mode used?", options: ["file.mode", "file.type", "file.encoding", "None"], correctAnswer: 0, explanation: "Returns the string used at open." },
    { id: "int108-u5-41", unit: 5, topic: 'Context', difficulty: 'hard', questionType: 'MCQ', question: "What happens if an error occurs inside 'with'?", options: ["File is still closed", "File stays open", "Program freezes", "None"], correctAnswer: 0, explanation: "Context managers guarantee termination logic." },
    { id: "int108-u5-42", unit: 5, topic: 'Iteration', difficulty: 'medium', questionType: 'MCQ', question: "Iterating over file object gives?", options: ["Lines (one by one)", "Characters", "Bytes", "None"], correctAnswer: 0, explanation: "Memory efficient way to read large files." },
    { id: "int108-u5-43", unit: 5, topic: 'OS Module', difficulty: 'medium', questionType: 'MCQ', question: "Rename file command?", options: ["os.rename(old, new)", "os.move()", "os.change()", "None"], correctAnswer: 0, explanation: "Changes file name or move it." },
    { id: "int108-u5-44", unit: 5, topic: 'OS Module', difficulty: 'medium', questionType: 'MCQ', question: "Create directory command?", options: ["os.mkdir()", "os.create()", "os.folder()", "None"], correctAnswer: 0, explanation: "Make directory." },
    { id: "int108-u5-45", unit: 5, topic: 'OS Module', difficulty: 'medium', questionType: 'MCQ', question: "Current file position unit?", options: ["Bytes", "Bits", "Lines", "None"], correctAnswer: 0, explanation: "offset is always in bytes." },
    { id: "int108-u5-46", unit: 5, topic: 'Exceptions', difficulty: 'medium', questionType: 'MCQ', question: "Syntax for catching multiple specific types?", options: ["except (Error1, Error2):", "except Error1, Error2:", "except Error1 or Error2:", "None"], correctAnswer: 0, explanation: "Pass a tuple of classes." },
    { id: "int108-u5-47", unit: 5, topic: 'Exceptions', difficulty: 'medium', questionType: 'MCQ', question: "How to access the error message object?", options: ["except Error as e:", "except Error(e):", "except Error: msg=e", "None"], correctAnswer: 0, explanation: "Aliasing the exception instance." },
    { id: "int108-u5-48", unit: 5, topic: 'Traceback', difficulty: 'hard', questionType: 'MCQ', question: "Module to print a detailed error stack?", options: ["traceback", "sys", "report", "error"], correctAnswer: 0, explanation: "Provides standard formatting for stack traces." },
    { id: "int108-u5-49", unit: 5, topic: 'Input', difficulty: 'easy', questionType: 'MCQ', question: "What is 'EOF'?", options: ["End Of File", "Error Of Format", "End Of Field", "None"], correctAnswer: 0, explanation: "Signal that data source has ended." },
    { id: "int108-u5-50", unit: 5, topic: 'Exceptions', difficulty: 'medium', questionType: 'MCQ', question: "Is 'SyntaxError' catchable in try-except?", options: ["Only if in imported code", "Yes, always", "No", "None"], correctAnswer: 0, explanation: "If the current file has syntax error, it won't even run to hit the try block." },
    { id: "int108-u5-51", unit: 5, topic: 'Import', difficulty: 'medium', questionType: 'MCQ', question: "Error when module not found?", options: ["ImportError / ModuleNotFoundError", "FileNotExists", "KeyError", "None"], correctAnswer: 0, explanation: "Specific import exceptions." },
    { id: "int108-u5-52", unit: 5, topic: 'Files', difficulty: 'easy', questionType: 'MCQ', question: "File 'w+' mode?", options: ["Read and Write (Overwrite)", "Write only", "Append with read", "None"], correctAnswer: 0, explanation: "Opens for both; truncates existing." },
    { id: "int108-u5-53", unit: 5, topic: 'Files', difficulty: 'easy', questionType: 'MCQ', question: "File 'r+' mode?", options: ["Read and Write (Update)", "Read only", "Write only", "None"], correctAnswer: 0, explanation: "Opens for both; cursor at start." },
    { id: "int108-u5-54", unit: 5, topic: 'Files', difficulty: 'easy', questionType: 'MCQ', question: "File 'a+' mode?", options: ["Append and Read", "Append only", "Read only", "None"], correctAnswer: 0, explanation: "Opens for both; cursor at end." },
    { id: "int108-u5-55", unit: 5, topic: 'Buffers', difficulty: 'hard', questionType: 'MCQ', question: "What does 'flush()' do?", options: ["Writes browser/buffer to disk", "Deletes file", "Reads data", "None"], correctAnswer: 0, explanation: "Forces writing of buffered interactions." },
    { id: "int108-u5-56", unit: 5, topic: 'Permissions', difficulty: 'medium', questionType: 'MCQ', question: "Error when no access to file?", options: ["PermissionError", "OSerror", "FileExistsError", "None"], correctAnswer: 0, explanation: "OS-level permission denial." },
    { id: "int108-u5-57", unit: 5, topic: 'Memory', difficulty: 'medium', questionType: 'MCQ', question: "What is MemoryError?", options: ["RAM exhausted", "Disk full", "CPU high", "None"], correctAnswer: 0, explanation: "Out of memory." },
    { id: "int108-u5-58", unit: 5, topic: 'Arithmetic', difficulty: 'medium', questionType: 'MCQ', question: "What is OverflowError?", options: ["Number too big for calculation", "List too long", "None", "Both"], correctAnswer: 0, explanation: "Result exceeds range of type." },
    { id: "int108-u5-59", unit: 5, topic: 'Encodings', difficulty: 'hard', questionType: 'MCQ', question: "Error when bytes cannot be decoded?", options: ["UnicodeDecodeError", "ValueError", "TypeError", "None"], correctAnswer: 0, explanation: "Specific type of ValueError." },
    { id: "int108-u5-60", unit: 5, topic: 'Nesting', difficulty: 'medium', questionType: 'MCQ', question: "Can you nest try-except?", options: ["Yes", "No", "Only in loops", "None"], correctAnswer: 0, explanation: "Supported depth." },
    { id: "int108-u5-61", unit: 5, topic: 'Flow', difficulty: 'easy', questionType: 'MCQ', question: "Does code after 'finally' run if try succeeded?", options: ["Yes", "No", "Only if finally is empty", "None"], correctAnswer: 0, explanation: "Always executes." },
    { id: "int108-u5-62", unit: 5, topic: 'Flow', difficulty: 'easy', questionType: 'MCQ', question: "Does code after 'finally' run if try failed?", options: ["Yes", "No", "If caught", "None"], correctAnswer: 0, explanation: "Always executes." },
    { id: "int108-u5-63", unit: 5, topic: 'Keywords', difficulty: 'medium', questionType: 'MCQ', question: "Is 'pass' useful in except?", options: ["Yes, to ignore an error", "No", "Mandatory", "None"], correctAnswer: 0, explanation: "Silent failure." },
    { id: "int108-u5-64", unit: 5, topic: 'Cleanup', difficulty: 'hard', questionType: 'MCQ', question: "Context manager protocol methods?", options: ["__enter__ and __exit__", "__init__ and __del__", "open and close", "None"], correctAnswer: 0, explanation: "Dunder methods for 'with' support." },
    { id: "int108-u5-65", unit: 5, topic: 'Directories', difficulty: 'medium', questionType: 'MCQ', question: "List files in directory command?", options: ["os.listdir()", "os.files()", "os.scan()", "None"], correctAnswer: 0, explanation: "Returns list of filenames." },
    { id: "int108-u5-66", unit: 5, topic: 'Pathlib', difficulty: 'hard', questionType: 'MCQ', question: "Modern module for path handling?", options: ["pathlib", "os.path", "url", "None"], correctAnswer: 0, explanation: "Object-oriented filesystem paths (Python 3.4+)." },
    { id: "int108-u5-67", unit: 5, topic: 'Open', difficulty: 'easy', questionType: 'MCQ', question: "Default mode for open if omitted?", options: ["'r'", "'w'", "'a'", "None"], correctAnswer: 0, explanation: "Read mode." },
    { id: "int108-u5-68", unit: 5, topic: 'Write', difficulty: 'medium', questionType: 'MCQ', question: "write() returns?", options: ["Number of characters written", "None", "True", "File object"], correctAnswer: 0, explanation: "Integrity check." },
    { id: "int108-u5-69", unit: 5, topic: 'Read', difficulty: 'medium', questionType: 'MCQ', question: "read(10) reads?", options: ["10 characters/bytes", "10 lines", "10 words", "None"], correctAnswer: 0, explanation: "Specifies how much data to fetch." },
    { id: "int108-u5-70", unit: 5, topic: 'Exceptions', difficulty: 'medium', questionType: 'MCQ', question: "What is 'AttributeError'?", options: ["Non-existent property access", "Missing variable", "Wrong type", "None"], correctAnswer: 0, explanation: "Obj.invalid_attr." },
    { id: "int108-u5-71", unit: 5, topic: 'Exceptions', difficulty: 'medium', questionType: 'MCQ', question: "What is 'StopIteration'?", options: ["Raised by next() at sequence end", "Error in loop", "None", "Both"], correctAnswer: 0, explanation: "Iterator protocol signal." },
    { id: "int108-u5-72", unit: 5, topic: 'Safety', difficulty: 'medium', questionType: 'MCQ', question: "Why close files?", options: ["Prevents resource leak / Data loss", "Security", "Faster code", "None"], correctAnswer: 0, explanation: "Operating systems have limits on open handles." },
    { id: "int108-u5-73", unit: 5, topic: 'Exceptions', difficulty: 'medium', questionType: 'MCQ', question: "Which is a 'catch-all' base class?", options: ["Exception", "Error", "Throwable", "None"], correctAnswer: 0, explanation: "Matches most system and user errors." },
    { id: "int108-u5-74", unit: 5, topic: 'Logging', difficulty: 'hard', questionType: 'MCQ', question: "Recommended module for error reporting?", options: ["logging", "print", "sys.err", "None"], correctAnswer: 0, explanation: "Supports levels like DEBUG, INFO, ERROR." },
    { id: "int108-u5-75", unit: 5, topic: 'OS Module', difficulty: 'easy', questionType: 'MCQ', question: "Delete directory command?", options: ["os.rmdir()", "os.delete()", "os.drop()", "None"], correctAnswer: 0, explanation: "Remove directory (usually must be empty)." },
    { id: "int108-u5-76", unit: 5, topic: 'Files', difficulty: 'hard', questionType: 'MCQ', question: "How to tell if file is readable?", options: ["file.readable()", "file.is_r", "file.check()", "None"], correctAnswer: 0, explanation: "Boolean check." },
    { id: "int108-u5-77", unit: 5, topic: 'Files', difficulty: 'hard', questionType: 'MCQ', question: "How to tell if file is seekable?", options: ["file.seekable()", "file.is_s", "None", "Both"], correctAnswer: 0, explanation: "Not all streams support seeking (like pipes)." },
    { id: "int108-u5-78", unit: 5, topic: 'Pickle', difficulty: 'hard', questionType: 'MCQ', question: "Module to serialize Python objects?", options: ["pickle", "json", "marshal", "All work"], correctAnswer: 3, explanation: "Pickle is Python-specific and powerful." },
    { id: "int108-u5-79", unit: 5, topic: 'Serialization', difficulty: 'medium', questionType: 'MCQ', question: "Advantage of JSON over Pickle?", options: ["Cross-language support", "Faster", "Compatible with sets", "None"], correctAnswer: 0, explanation: "Standard web format." },
    { id: "int108-u5-80", unit: 5, topic: 'Environment', difficulty: 'medium', questionType: 'MCQ', question: "Get env variables?", options: ["os.environ", "sys.env", "os.getenv()", "Both A and C"], correctAnswer: 3, explanation: "Map of system environment." },
    { id: "int108-u5-81", unit: 5, topic: 'Files', difficulty: 'medium', questionType: 'MCQ', question: "Does 'w' preserve previous content?", options: ["No", "Yes", "Only for 30s", "None"], correctAnswer: 0, explanation: "Wipes file on open." },
    { id: "int108-u5-82", unit: 5, topic: 'Files', difficulty: 'medium', questionType: 'MCQ', question: "Does 'a' preserve previous content?", options: ["Yes", "No", "Depends", "None"], correctAnswer: 0, explanation: "Appends to end." },
    { id: "int108-u5-83", unit: 5, topic: 'Path', difficulty: 'medium', questionType: 'MCQ', question: "Character for current directory?", options: ["'.'", "'..'", "'/'", "'~'"], correctAnswer: 0, explanation: "Single dot represents current." },
    { id: "int108-u5-84", unit: 5, topic: 'Path', difficulty: 'medium', questionType: 'MCQ', question: "Character for parent directory?", options: ["'..'", "'.'", "'/'", "'~'"], correctAnswer: 0, explanation: "Double dot represents one level up." },
    { id: "int108-u5-85", unit: 5, topic: 'Shell', difficulty: 'hard', questionType: 'MCQ', question: "Module for high-level file utilities (copy/move folder)?", options: ["shutil", "os", "file", "None"], correctAnswer: 0, explanation: "Shell Utilities module." },
    { id: "int108-u5-86", unit: 5, topic: 'Exceptions', difficulty: 'medium', questionType: 'MCQ', question: "What is 'NotImplementedError'?", options: ["Placeholder for abstract method", "System error", "Coding error", "None"], correctAnswer: 0, explanation: "Raised when an inherited method must be overridden." },
    { id: "int108-u5-87", unit: 5, topic: 'Files', difficulty: 'easy', questionType: 'MCQ', question: "readline() vs readlines()?", options: ["readline is string; readlines is list", "Same", "Reverse", "None"], correctAnswer: 0, explanation: "One line vs all lines." },
    { id: "int108-u5-88", unit: 5, topic: 'Buffers', difficulty: 'hard', questionType: 'MCQ', question: "Text mode vs Binary mode conversion?", options: ["Text handles newlines (\\n to OS specific)", "None", "Binary is faster", "Both"], correctAnswer: 0, explanation: "Newline translation is specific to text mode." },
    { id: "int108-u5-89", unit: 5, topic: 'Encodings', difficulty: 'medium', questionType: 'MCQ', question: "ASCII max value?", options: ["127", "255", "65535", "None"], correctAnswer: 0, explanation: "Standard 7-bit encoding." },
    { id: "int108-u5-90", unit: 5, topic: 'Iterators', difficulty: 'medium', questionType: 'MCQ', question: "Can a file be closed while iterating?", options: ["No (Raises ValueError on next)", "Yes", "Depends", "None"], correctAnswer: 0, explanation: "Ongoing I/O requires open state." },
    { id: "int108-u5-91", unit: 5, topic: 'Exceptions', difficulty: 'medium', questionType: 'MCQ', question: "Can a function catch an error inside its caller?", options: ["No, it bubbles up", "Yes", "Only in threads", "None"], correctAnswer: 0, explanation: "Exceptions travel from callee to caller until caught." },
    { id: "int108-u5-92", unit: 5, topic: 'Built-in', difficulty: 'medium', questionType: 'MCQ', question: "Global check for exception type?", options: ["isinstance(e, Type)", "type(e) == Type", "Both", "None"], correctAnswer: 2, explanation: "Standard type checking." },
    { id: "int108-u5-93", unit: 5, topic: 'Memory', difficulty: 'hard', questionType: 'MCQ', question: "What is a 'Zero-copy' read?", options: ["Direct access without buffer copy", "Reading zero bytes", "Deleting data", "None"], correctAnswer: 0, explanation: "Advanced I/O optimization." },
    { id: "int108-u5-94", unit: 5, topic: 'Strings', difficulty: 'easy', questionType: 'MCQ', question: "Is '\\n' one character or two?", options: ["One (Control char)", "Two", "Zero", "Depends"], correctAnswer: 0, explanation: "Escape sequences count as single characters." },
    { id: "int108-u5-95", unit: 5, topic: 'Exceptions', difficulty: 'medium', questionType: 'MCQ', question: "Difference between 'raise' and 'raise e' after catching?", options: ["'raise' preserves full traceback", "'raise e' resets it", "Same", "Both A and B"], correctAnswer: 3, explanation: "Bare raise is better inside except blocks for re-raising." },
    { id: "int108-u5-96", unit: 5, topic: 'Files', difficulty: 'easy', questionType: 'MCQ', question: "How to write a list of strings to file?", options: ["writelines(list)", "write(list)", "appendAll(list)", "None"], correctAnswer: 0, explanation: "Bulk line writing." },
    { id: "int108-u5-97", unit: 5, topic: 'Cleanup', difficulty: 'medium', questionType: 'MCQ', question: "Is __del__ always reliable for closing files?", options: ["No (GC timing is unpredictable)", "Yes", "Only in scripts", "None"], correctAnswer: 0, explanation: "Prefer context managers." },
    { id: "int108-u5-98", unit: 5, topic: 'Standard Library', difficulty: 'medium', questionType: 'MCQ', question: "Which module handles temporal (time/date) data?", options: ["datetime", "time", "calendar", "All of them"], correctAnswer: 3, explanation: "Rich ecosystem for time." },
    { id: "int108-u5-99", unit: 5, topic: 'Exceptions', difficulty: 'medium', questionType: 'MCQ', question: "What is KeyboardInterrupt?", options: ["Ctrl+C pressed", "Unplugged keyboard", "None", "Both"], correctAnswer: 0, explanation: "User signal to stop." },
    { id: "int108-u5-100", unit: 5, topic: 'Logic', difficulty: 'easy', questionType: 'MCQ', question: "Is an empty string True or False?", options: ["False", "True", "None", "Error"], correctAnswer: 0, explanation: "Falsy." }
];

export const int108Unit5Coding: QuizQuestion[] = [
    {
        id: `int108-u5-coding-1`,
        unit: 5,
        topic: `Word Counter`,
        difficulty: `hard`,
        type: `coding`,
        question: `Write a function 'count_word(filename, target_word)' that counts the number of occurrences of 'target_word' in a file. Assume the file contains multiple lines.`,
        starterCode: `def count_word(filename, target):
    # Your logic here
    # Use: open(filename, 'r')

# Simulation setup
with open('data.txt', 'w') as f:
    f.write("apple banana apple\\ncherry apple\\nbanana")

print(count_word('data.txt', 'apple'))`,
        testCases: [
            { "input": "", "output": "3" }
        ],
        explanation: `Read the file, split into words, and count matches.`
    },
    {
        id: `int108-u5-coding-2`,
        unit: 5,
        topic: `Robust Division`,
        difficulty: `hard`,
        type: `coding`,
        question: `Write a function 'safe_divide()' that reads TWO inputs from 'input()'. Handle 'ZeroDivisionError' by printing 'Zero' and 'ValueError' (invalid literal) by printing 'Invalid'. If successful, print the result.`,
        starterCode: `def safe_divide():
    try:
        # Your code here
    except ZeroDivisionError:
        print("Zero")
    except ValueError:
        print("Invalid")

safe_divide()`,
        testCases: [
            { "input": "10\n2", "output": "5.0" },
            { "input": "10\n0", "output": "Zero" },
            { "input": "10\nabc", "output": "Invalid", "isHidden": true }
        ],
        explanation: `Use a try block with multiple except clauses to catch different error types.`
    },
    {
        id: `int108-u5-coding-3`,
        unit: 5,
        topic: `File Pointer`,
        difficulty: `hard`,
        type: `coding`,
        question: `Open 'story.txt' for writing, write 'Python is cool', then use 'seek()' and 'write()' to change 'cool' to 'king'. Finally, read and print the content.`,
        starterCode: `def update_file():
    # Your pointer logic here

update_file()`,
        testCases: [
            { "input": "", "output": "Python is king" }
        ],
        explanation: `Write original text, calculate the position of 'cool' (index 10), seek to index 10, write 'king', seek back to 0, and read.`
    },
    {
        id: `int108-u5-coding-4`,
        unit: 5,
        topic: `Substring Search`,
        difficulty: `hard`,
        type: `coding`,
        question: `Write a function 'find_line(filename, search_str)' that prints the line number (1-indexed) of any line containing 'search_str'. If not found, print nothing.`,
        starterCode: `def find_line(filename, search_str):
    # Your code here

# Simulation
with open('log.txt', 'w') as f:
    f.write("error: stack overflow\\nstatus: ok\\nerror: memory low")

find_line('log.txt', 'error')`,
        testCases: [
            { "input": "", "output": "1\n3" }
        ],
        explanation: `Use enumerate(file_object, start=1) to get line numbers while iterating.`
    },
    {
        id: `int108-u5-coding-5`,
        unit: 5,
        topic: `Cleanup Log`,
        difficulty: `medium`,
        type: `coding`,
        question: `Use a 'finally' block to print 'Safe exit' regardless of whether an exception occurred during a division.`,
        starterCode: `try:
    n = int(input())
    print(10/n)
except:
    print("Error")
# Add finally block here`,
        testCases: [
            { "input": "2", "output": "5.0\nSafe exit" },
            { "input": "0", "output": "Error\nSafe exit" }
        ],
        explanation: `The 'finally' block always executes after try/except.`
    }
];
