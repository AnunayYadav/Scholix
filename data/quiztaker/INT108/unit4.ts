import { QuizQuestion } from '../../../types.ts';

export const int108Unit4MCQs: QuizQuestion[] = [
    { id: "int108-u4-1", unit: 4, topic: 'Lists', difficulty: 'easy', question: "Which brackets are used to define a list?", options: ["[]", "()", "{ }", "<>"], correctAnswer: 0, explanation: "Square brackets are used for mutable lists." },
    { id: "int108-u4-2", unit: 4, topic: 'Lists', difficulty: 'easy', question: "Are lists mutable in Python?", options: ["Yes", "No", "Only if sorted", "None"], correctAnswer: 0, explanation: "Lists can be modified after creation." },
    { id: "int108-u4-3", unit: 4, topic: 'Lists', difficulty: 'easy', question: "Which method adds an item to the end of a list?", options: ["append()", "add()", "insert()", "push()"], correctAnswer: 0, explanation: "append() adds a single element to the tail." },
    { id: "int108-u4-4", unit: 4, topic: 'Lists', difficulty: 'medium', question: "What is the result of [1, 2] + [3, 4]?", options: ["[1, 2, 3, 4]", "[4, 6]", "[[1, 2], [3, 4]]", "Error"], correctAnswer: 0, explanation: "The + operator concatenates lists." },
    { id: "int108-u4-5", unit: 4, topic: 'Tuples', difficulty: 'easy', question: "Which brackets are used to define a tuple?", options: ["()", "[]", "{ }", "<>"], correctAnswer: 0, explanation: "Parentheses (or no brackets) define immutable tuples." },
    { id: "int108-u4-6", unit: 4, topic: 'Tuples', difficulty: 'medium', question: "Are tuples mutable?", options: ["No", "Yes", "Depends on elements", "None"], correctAnswer: 0, explanation: "Tuples cannot be changed once created." },
    { id: "int108-u4-7", unit: 4, topic: 'Tuples', difficulty: 'hard', question: "How to create a tuple with one element?", options: ["(5,)", "(5)", "[5]", "None"], correctAnswer: 0, explanation: "A trailing comma is mandatory for singleton tuples." },
    { id: "int108-u4-8", unit: 4, topic: 'Dictionaries', difficulty: 'easy', question: "Which brackets are used to define a dictionary?", options: ["{ }", "[]", "()", "<>"], correctAnswer: 0, explanation: "Curly braces define key-value pairs." },
    { id: "int108-u4-9", unit: 4, topic: 'Dictionaries', difficulty: 'medium', question: "Dictionaries are collections of ___.", options: ["Key-Value pairs", "Indices", "Sorted items", "Unique values"], correctAnswer: 0, explanation: "Maps keys to specific values." },
    { id: "int108-u4-10", unit: 4, topic: 'Dictionaries', difficulty: 'medium', question: "How to access the value of key 'a' in dict 'd'?", options: ["d['a']", "d.get('a')", "Both A and B", "d.a"], correctAnswer: 2, explanation: "Square brackets or .get() method are standard." },
    { id: "int108-u4-11", unit: 4, topic: 'Sets', difficulty: 'easy', question: "Which brackets define a set (without values)?", options: ["set()", "{ }", "[]", "()"], correctAnswer: 0, explanation: "{ } empty is a dict; set() is needed for an empty set." },
    { id: "int108-u4-12", unit: 4, topic: 'Sets', difficulty: 'medium', question: "Do sets allow duplicate elements?", options: ["No", "Yes", "Only strings", "None"], correctAnswer: 0, explanation: "Sets only store unique items." },
    { id: "int108-u4-13", unit: 4, topic: 'Sets', difficulty: 'medium', question: "Are sets ordered?", options: ["No", "Yes", "Depends on content", "None"], correctAnswer: 0, explanation: "Sets are unordered collections." },
    { id: "int108-u4-14", unit: 4, topic: 'List Methods', difficulty: 'medium', question: "Which method removes an element by value?", options: ["remove()", "pop()", "del", "clear()"], correctAnswer: 0, explanation: "remove(x) finds and deletes the first occurrence of x." },
    { id: "int108-u4-15", unit: 4, topic: 'List Methods', difficulty: 'medium', question: "Which method removes an element by index?", options: ["pop()", "remove()", "discard()", "None"], correctAnswer: 0, explanation: "pop(index) removes and returns the item." },
    { id: "int108-u4-16", unit: 4, topic: 'List Methods', difficulty: 'medium', question: "Which method reverses a list in-place?", options: ["reverse()", "reversed()", "flip()", "None"], correctAnswer: 0, explanation: "reverse() modifies the existing object." },
    { id: "int108-u4-17", unit: 4, topic: 'Slicing', difficulty: 'medium', question: "How to get a copy of the entire list 'L'?", options: ["L[:]", "L.copy()", "list(L)", "All of the above"], correctAnswer: 3, explanation: "Various methods exist for shallow copying." },
    { id: "int108-u4-18", unit: 4, topic: 'Comprehensions', difficulty: 'hard', question: "Create [0, 2, 4] using comprehension?", options: ["[x for x in range(5) if x % 2 == 0]", "[x * 2 for x in range(3)]", "Both A and B", "None"], correctAnswer: 2, explanation: "Multiple logic paths can produce the same list." },
    { id: "int108-u4-19", unit: 4, topic: 'Strings', difficulty: 'medium', question: "Which method converts a string to a list of words?", options: ["split()", "list()", "join()", "break()"], correctAnswer: 0, explanation: "split() partitions a string based on whitespace (default)." },
    { id: "int108-u4-20", unit: 4, topic: 'List Methods', difficulty: 'medium', question: "How to join ['a', 'b'] into 'a-b'?", options: ["'-'.join(['a', 'b'])", "join('-', ['a', 'b'])", "['a', 'b'].join('-')", "None"], correctAnswer: 0, explanation: "join() is a string method that accepts an iterable." },
    { id: "int108-u4-21", unit: 4, topic: 'Lists', difficulty: 'easy', question: "List indexing starts at?", options: ["0", "1", "-1", "Depends"], correctAnswer: 0, explanation: "0-based indexing." },
    { id: "int108-u4-22", unit: 4, topic: 'Lists', difficulty: 'medium', question: "Result of [1, 2] * 2?", options: ["[1, 2, 1, 2]", "[2, 4]", "Error", "None"], correctAnswer: 0, explanation: "Repeats the sequence contents." },
    { id: "int108-u4-23", unit: 4, topic: 'Dicts', difficulty: 'medium', question: "Which method returns all keys?", options: ["keys()", "allKeys()", "names()", "list()"], correctAnswer: 0, explanation: "keys() returns a view of the dictionary keys." },
    { id: "int108-u4-24", unit: 4, topic: 'Dicts', difficulty: 'medium', question: "Which method returns all values?", options: ["values()", "getValues()", "vals()", "None"], correctAnswer: 0, explanation: "values() returns a view of the values." },
    { id: "int108-u4-25", unit: 4, topic: 'Set Operations', difficulty: 'hard', question: "Which operator is used for Set Union?", options: ["|", "&", "-", "^"], correctAnswer: 0, explanation: "The pipe character combines all unique elements from both sets." },
    { id: "int108-u4-26", unit: 4, topic: 'Set Operations', difficulty: 'hard', question: "Which operator is used for Set Intersection?", options: ["&", "|", "-", "^"], correctAnswer: 0, explanation: "The ampersand find common items." },
    { id: "int108-u4-27", unit: 4, topic: 'Nested', difficulty: 'hard', question: "Access 'x' in [['a', 'x'], [1, 2]]?", options: ["obj[0][1]", "obj[1][0]", "obj[0, 1]", "None"], correctAnswer: 0, explanation: "Row index 0, Column index 1." },
    { id: "int108-u4-28", unit: 4, topic: 'Dicts', difficulty: 'medium', question: "Adding key 'brand' with value 'Ford' to dict 'car'?", options: ["car['brand'] = 'Ford'", "car.add('brand', 'Ford')", "car.update('Ford')", "None"], correctAnswer: 0, explanation: "Assignment to a new key creates the key." },
    { id: "int108-u4-29", unit: 4, topic: 'Mutability', difficulty: 'medium', question: "Can a list be a key in a dictionary?", options: ["No (Mutable type)", "Yes", "Only if short", "None"], correctAnswer: 0, explanation: "Dictionary keys must be hashable (immutable)." },
    { id: "int108-u4-30", unit: 4, topic: 'Mutability', difficulty: 'medium', question: "Can a tuple be a key in a dictionary?", options: ["Yes (Immutable type)", "No", "Only if it contains ints", "None"], correctAnswer: 0, explanation: "Tuples are hashable provided all their elements are hashable." },
    { id: "int108-u4-31", unit: 4, topic: 'List Methods', difficulty: 'medium', question: "Which method finds the index of a value?", options: ["index()", "find()", "search()", "at()"], correctAnswer: 0, explanation: "index(val) returns the position of the first occurrence." },
    { id: "int108-u4-32", unit: 4, topic: 'List Methods', difficulty: 'medium', question: "How to clear all elements from a list?", options: ["clear()", "del list", "list = []", "All of the above"], correctAnswer: 0, explanation: "clear() modifies the list object to be empty." },
    { id: "int108-u4-33", unit: 4, topic: 'Membership', difficulty: 'easy', question: "Check if 'apple' in list 'fruits'?", options: ["'apple' in fruits", "fruits.has('apple')", "exists('apple', fruits)", "None"], correctAnswer: 0, explanation: "The 'in' operator works for lists, tuples, and sets." },
    { id: "int108-u4-34", unit: 4, topic: 'Iteration', difficulty: 'easy', question: "Loop through a list 'L'?", options: ["for x in L:", "for (int i=0; i<L.len; i++)", "foreach x in L", "None"], correctAnswer: 0, explanation: "Python for loops are naturally designed for sequences." },
    { id: "int108-u4-35", unit: 4, topic: 'List Methods', difficulty: 'easy', question: "Which function gets the number of items?", options: ["len()", "count()", "size()", "cap()"], correctAnswer: 0, explanation: "len() is a universal function for collection size." },
    { id: "int108-u4-36", unit: 4, topic: 'Lists', difficulty: 'hard', question: "What is L[-1] for list L?", options: ["Last element", "First element", "Error", "None"], correctAnswer: 0, explanation: "Negative index starts from the tail." },
    { id: "int108-u4-37", unit: 4, topic: 'Sorting', difficulty: 'medium', question: "Which method sorts a list in-place?", options: ["sort()", "sorted()", "arrange()", "None"], correctAnswer: 0, explanation: "sort() modifies the original list." },
    { id: "int108-u4-38", unit: 4, topic: 'Sorting', difficulty: 'medium', question: "Which function returns a new sorted list?", options: ["sorted()", "sort()", "newSort()", "None"], correctAnswer: 0, explanation: "sorted() does not change the inputs." },
    { id: "int108-u4-39", unit: 4, topic: 'Tuples', difficulty: 'easy', question: "Tuples are commonly used for ___.", options: ["Heterogeneous data", "Homogeneous speed", "Temporary data", "None"], correctAnswer: 0, explanation: "Used for records like (name, age, city)." },
    { id: "int108-u4-40", unit: 4, topic: 'Sets', difficulty: 'medium', question: "Which method adds an item to a set?", options: ["add()", "append()", "insert()", "push()"], correctAnswer: 0, explanation: "add() is specific to sets." },
    { id: "int108-u4-41", unit: 4, topic: 'Sets', difficulty: 'medium', question: "Which method removes an item from a set (no error if missing)?", options: ["discard()", "remove()", "pop()", "clear()"], correctAnswer: 0, explanation: "discard() is safe to use; remove() raises KeyError if not found." },
    { id: "int108-u4-42", unit: 4, topic: 'Dict Methods', difficulty: 'medium', question: "Which method removes a key and returns value?", options: ["pop()", "remove()", "del", "None"], correctAnswer: 0, explanation: "pop(key) is useful for extracting data." },
    { id: "int108-u4-43", unit: 4, topic: 'Dict Methods', difficulty: 'medium', question: "Clear all key-values?", options: ["clear()", "deleteAll()", "reset()", "None"], correctAnswer: 0, explanation: "Empties the dictionary." },
    { id: "int108-u4-44", unit: 4, topic: 'Packing', difficulty: 'hard', question: "t = 1, 2, 3 creates?", options: ["A tuple", "A list", "Error", "Three variables"], correctAnswer: 0, explanation: "Implicit tuple packing." },
    { id: "int108-u4-45", unit: 4, topic: 'Unpacking', difficulty: 'hard', question: "a, b = [1, 2] logic?", options: ["a=1, b=2", "Error", "List stays same", "None"], correctAnswer: 0, explanation: "Sequence unpacking assigns elements to variables." },
    { id: "int108-u4-46", unit: 4, topic: 'Slicing', difficulty: 'medium', question: "L[2:5] takes items at index?", options: ["2, 3, 4", "2, 3, 4, 5", "3, 4, 5", "None"], correctAnswer: 0, explanation: "Starts at 2, stops *before* 5." },
    { id: "int108-u4-47", unit: 4, topic: 'Slicing', difficulty: 'medium', question: "L[::-1] does?", options: ["Reverses the list", "Sorts list", "Deletes list", "None"], correctAnswer: 0, explanation: "Slicing with -1 step." },
    { id: "int108-u4-48", unit: 4, topic: 'Set Operations', difficulty: 'hard', question: "Set difference operator?", options: ["-", "/", "\\", "^"], correctAnswer: 0, explanation: "Returns items in first set but not in second." },
    { id: "int108-u4-49", unit: 4, topic: 'Comprehensions', difficulty: 'medium', question: "Syntax for list comprehension?", options: ["[expression for item in iterable]", "{ expression for item in iterable}", "(expression for item in iterable)", "None"], correctAnswer: 0, explanation: "Square brackets denote list results." },
    { id: "int108-u4-50", unit: 4, topic: 'Comprehensions', difficulty: 'medium', question: "Syntax for dict comprehension?", options: ["{ key: value for item in iterable}", "[key: value for item in iterable]", "None", "Both work"], correctAnswer: 0, explanation: "Curly braces with colon separator." },
    { id: "int108-u4-51", unit: 4, topic: 'Mutability', difficulty: 'medium', question: "Can lists contain other lists?", options: ["Yes", "No", "Only if small", "None"], correctAnswer: 0, explanation: "Nesting is a key feature." },
    { id: "int108-u4-52", unit: 4, topic: 'Booleans', difficulty: 'medium', question: "Is [] True or False?", options: ["False", "True", "Error", "None"], correctAnswer: 0, explanation: "Empty sequences are falsy." },
    { id: "int108-u4-53", unit: 4, topic: 'Sorting', difficulty: 'hard', question: "Sort descending command?", options: ["sort(reverse=True)", "sort.down()", "sort(desc=True)", "None"], correctAnswer: 0, explanation: "The 'reverse' parameter controls direction." },
    { id: "int108-u4-54", unit: 4, topic: 'Copying', difficulty: 'hard', question: "Effect of 'B = A' for list A?", options: ["B points to same object", "B is a copy", "A is deleted", "None"], correctAnswer: 0, explanation: "Assignment creates a new reference, not a new object." },
    { id: "int108-u4-55", unit: 4, topic: 'Copying', difficulty: 'hard', question: "How to make a deep copy?", options: ["copy.deepcopy(x)", "x.copy()", "list(x)", "None"], correctAnswer: 0, explanation: "Deep copy is needed for nested structures to be truly independent." },
    { id: "int108-u4-56", unit: 4, topic: 'Built-in', difficulty: 'easy', question: "Which function sums a list of numbers?", options: ["sum()", "total()", "add()", "None"], correctAnswer: 0, explanation: "sum(iterable) returns the total." },
    { id: "int108-u4-57", unit: 4, topic: 'Built-in', difficulty: 'easy', question: "Which function finds the largest number?", options: ["max()", "large()", "high()", "None"], correctAnswer: 0, explanation: "max(iterable) returns the maximum value." },
    { id: "int108-u4-58", unit: 4, topic: 'Built-in', difficulty: 'easy', question: "Which function finds the smallest number?", options: ["min()", "small()", "low()", "None"], correctAnswer: 0, explanation: "min(iterable) returns the minimum value." },
    { id: "int108-u4-59", unit: 4, topic: 'Lists', difficulty: 'medium', question: "What is L.count(x)?", options: ["Occurrences of x", "Index of x", "Total length", "None"], correctAnswer: 0, explanation: "Returns how many times x appears in L." },
    { id: "int108-u4-60", unit: 4, topic: 'Lists', difficulty: 'medium', question: "L.extend([1, 2]) vs L.append([1, 2])?", options: ["Extend adds items; Append adds list", "Same", "Append adds items; Extend adds list", "None"], correctAnswer: 0, explanation: "Extend 'unpacks' the iterable into the list." },
    { id: "int108-u4-61", unit: 4, topic: 'Tuples', difficulty: 'medium', question: "Are tuples faster than lists?", options: ["Generally yes", "No", "Exactly same", "None"], correctAnswer: 0, explanation: "Fixed size allows minor optimization." },
    { id: "int108-u4-62", unit: 4, topic: 'Dicts', difficulty: 'medium', question: "Dictionary keys must be ___.", options: ["Unique", "Sorted", "Strings", "None"], correctAnswer: 0, explanation: "You cannot have duplicate keys." },
    { id: "int108-u4-63", unit: 4, topic: 'Dicts', difficulty: 'medium', question: "Can a value in dict be a list?", options: ["Yes", "No", "Only for nested dicts", "None"], correctAnswer: 0, explanation: "Values can be any data type." },
    { id: "int108-u4-64", unit: 4, topic: 'Set Operations', difficulty: 'hard', question: "Symmetric Difference operator?", options: ["^", "&", "|", "-"], correctAnswer: 0, explanation: "Items in either set but NOT in both." },
    { id: "int108-u4-65", unit: 4, topic: 'Range', difficulty: 'easy', question: "list(range(2)) gives?", options: ["[0, 1]", "[1, 2]", "[0, 1, 2]", "None"], correctAnswer: 0, explanation: "Length 2 starting from 0." },
    { id: "int108-u4-66", unit: 4, topic: 'Strings', difficulty: 'easy', question: "Is a string an iterable?", options: ["Yes", "No", "Only in Python 3", "None"], correctAnswer: 0, explanation: "Strings can be looped through like lists." },
    { id: "int108-u4-67", unit: 4, topic: 'Dicts', difficulty: 'medium', question: "d.get('key', 'default') does?", options: ["Returns 'default' if key missing", "Always returns 'default'", "Errors if key missing", "None"], correctAnswer: 0, explanation: "Safe way to access data with a fallback." },
    { id: "int108-u4-68", unit: 4, topic: 'Iteration', difficulty: 'medium', question: "What does list(zip([1], [2])) return?", options: ["[(1, 2)]", "[[1, 2]]", "(1, 2)", "None"], correctAnswer: 0, explanation: "Always a sequence of tuples." },
    { id: "int108-u4-69", unit: 4, topic: 'Lists', difficulty: 'medium', question: "Insert 'x' at index 1?", options: ["L.insert(1, 'x')", "L.add(1, 'x')", "L[1] = 'x'", "None"], correctAnswer: 0, explanation: "insert() shifts existing elements." },
    { id: "int108-u4-70", unit: 4, topic: 'Itertools', difficulty: 'hard', question: "Which function chains multiple lists?", options: ["itertools.chain()", "itertools.link()", "concat()", "None"], correctAnswer: 0, explanation: "Efficiently treats multiple sequences as one." },
    { id: "int108-u4-71", unit: 4, topic: 'Mapping', difficulty: 'medium', question: "What is 'any([False, True])'?", options: ["True", "False", "None", "Error"], correctAnswer: 0, explanation: "Returns True if any element is truthy." },
    { id: "int108-u4-72", unit: 4, topic: 'Mapping', difficulty: 'medium', question: "What is 'all([False, True])'?", options: ["False", "True", "None", "Error"], correctAnswer: 0, explanation: "Returns True only if all elements are truthy." },
    { id: "int108-u4-73", unit: 4, topic: 'Conversion', difficulty: 'easy', question: "Convert list to tuple?", options: ["tuple(L)", "L.toTuple()", "(L)", "None"], correctAnswer: 0, explanation: "Constructor call." },
    { id: "int108-u4-74", unit: 4, topic: 'Conversion', difficulty: 'easy', question: "Convert tuple to list?", options: ["list(T)", "T.toList()", "[T]", "None"], correctAnswer: 0, explanation: "Constructor call." },
    { id: "int108-u4-75", unit: 4, topic: 'Sets', difficulty: 'medium', question: "How to check if set A is subset of B?", options: ["A.issubset(B)", "A < B", "Both A and B", "None"], correctAnswer: 2, explanation: "Both method and operator are supported." },
    { id: "int108-u4-76", unit: 4, topic: 'Enumerate', difficulty: 'medium', question: "What does enumerate() return?", options: ["An enumerate object", "A list", "A dict", "None"], correctAnswer: 0, explanation: "It is an iterator that yields pairs." },
    { id: "int108-u4-77", unit: 4, topic: 'Reversing', difficulty: 'medium', question: "Does reversed(L) change L?", options: ["No, it returns an iterator", "Yes", "Depends", "None"], correctAnswer: 0, explanation: "Original list remains unchanged." },
    { id: "int108-u4-78", unit: 4, topic: 'Slicing', difficulty: 'hard', question: "L[2:2] = [1, 2] does?", options: ["Inserts items at index 2", "Replaces index 2", "Error", "None"], correctAnswer: 0, explanation: "Slice assignment can be used for insertion." },
    { id: "int108-u4-79", unit: 4, topic: 'Memory', difficulty: 'hard', question: "Do lists store objects directly?", options: ["No, they store references", "Yes", "Only for ints", "None"], correctAnswer: 0, explanation: "Python collections are arrays of pointers." },
    { id: "int108-u4-80", unit: 4, topic: 'Mutability', difficulty: 'medium', question: "Can you change a string's character? s[0] = 'z'?", options: ["No (Immutable)", "Yes", "Depends on OS", "None"], correctAnswer: 0, explanation: "Strings are immutable." },
    { id: "int108-u4-81", unit: 4, topic: 'Comparison', difficulty: 'medium', question: "[1] == [1.0]?", options: ["True", "False", "Error", "None"], correctAnswer: 0, explanation: "Value comparison handles float vs int." },
    { id: "int108-u4-82", unit: 4, topic: 'Identity', difficulty: 'medium', question: "[1] is [1.0]?", options: ["False", "True", "Error", "None"], correctAnswer: 0, explanation: "Different types and addresses." },
    { id: "int108-u4-83", unit: 4, topic: 'Conversion', difficulty: 'medium', question: "set([1, 1, 2, 2]) result length?", options: ["2", "4", "Error", "None"], correctAnswer: 0, explanation: "{ 1, 2}." },
    { id: "int108-u4-84", unit: 4, topic: 'Lists', difficulty: 'easy', question: "Can a list contain different types?", options: ["Yes", "No", "Only if sorted", "None"], correctAnswer: 0, explanation: "Python lists are heterogeneous." },
    { id: "int108-u4-85", unit: 4, topic: 'Tuples', difficulty: 'medium', question: "Is (1, [2]) mutable?", options: ["Partially (list inside can be changed)", "No", "Yes", "None"], correctAnswer: 0, explanation: "The tuple reference is fixed, but its contents (if mutable) can change." },
    { id: "int108-u4-86", unit: 4, topic: 'Dicts', difficulty: 'medium', question: "Result of car.popitem()?", options: ["Removes last inserted pair", "Removes first", "Removes random", "None"], correctAnswer: 0, explanation: "In Python 3.7+, it follows LIFO." },
    { id: "int108-u4-87", unit: 4, topic: 'Comprehensions', difficulty: 'hard', question: "Conditional at the end: [x for x in r if x > 5]?", options: ["Acts as a filter", "Acts as a map", "Error", "None"], correctAnswer: 0, explanation: "The 'if' clause selects which items to process." },
    { id: "int108-u4-88", unit: 4, topic: 'Comprehensions', difficulty: 'hard', question: "[x if x > 0 else 0 for x in L]?", options: ["Conditional expression (Ternary)", "Filter", "Error", "None"], correctAnswer: 0, explanation: "Ternary inside comprehension transforms items." },
    { id: "int108-u4-89", unit: 4, topic: 'Iterating', difficulty: 'medium', question: "Reverse loop logic?", options: ["reversed(L)", "L[::-1]", "Both", "None"], correctAnswer: 2, explanation: "Efficient reversal for iteration." },
    { id: "int108-u4-90", unit: 4, topic: 'Packing', difficulty: 'hard', question: "a, *b = [1, 2, 3] value of b?", options: ["[2, 3]", "2", "3", "None"], correctAnswer: 0, explanation: "Extended unpacking using *." },
    { id: "int108-u4-91", unit: 4, topic: 'Sorting', difficulty: 'hard', question: "car.sort(key=len)?", options: ["Sorts by string length", "Sorts alphabetically", "Error", "None"], correctAnswer: 0, explanation: "Custom sort key allows complex logic." },
    { id: "int108-u4-92", unit: 4, topic: 'Built-in', difficulty: 'easy', question: "Sorted copy of string 'abc'?", options: ["sorted('abc')", "sort('abc')", "None", "Both"], correctAnswer: 0, explanation: "Returns a sorted list of characters." },
    { id: "int108-u4-93", unit: 4, topic: 'Sets', difficulty: 'medium', question: "Can sets be nested (set in set)?", options: ["No (Needs frozenset)", "Yes", "Only if small", "None"], correctAnswer: 0, explanation: "Sets can only contain hashable objects; frozenset is the immutable version." },
    { id: "int108-u4-94", unit: 4, topic: 'Dicts', difficulty: 'medium', question: "How to merge two dicts in Python 3.9+?", options: ["d1 | d2", "d1 + d2", "merge(d1, d2)", "None"], correctAnswer: 0, explanation: "Union operator introduced for dicts." },
    { id: "int108-u4-95", unit: 4, topic: 'Slicing', difficulty: 'hard', question: "L[:] creates a ___ copy?", options: ["Shallow", "Deep", "Both", "None"], correctAnswer: 0, explanation: "Only copies the first level of references." },
    { id: "int108-u4-96", unit: 4, topic: 'Identity', difficulty: 'hard', question: "Small integers (-5 to 256) share memory?", options: ["Yes (Integer Caching)", "No", "Depends on OS", "None"], correctAnswer: 0, explanation: "Python caches small integers to save memory." },
    { id: "int108-u4-97", unit: 4, topic: 'Memory', difficulty: 'hard', question: "Is empty tuple () shared globally?", options: ["Yes", "No", "Depends", "None"], correctAnswer: 0, explanation: "Singletons for immutable empties." },
    { id: "int108-u4-98", unit: 4, topic: 'Strings', difficulty: 'medium', question: "ord('A') returns?", options: ["65", "A", "Error", "None"], correctAnswer: 0, explanation: "Returns Unicode point." },
    { id: "int108-u4-99", unit: 4, topic: 'Strings', difficulty: 'medium', question: "chr(65) returns?", options: ["'A'", "65", "Error", "None"], correctAnswer: 0, explanation: "Converts point back to char." },
    { id: "int108-u4-100", unit: 4, topic: 'Sets', difficulty: 'medium', question: "Is { 1, 2} sub of { 1, 2, 3}?", options: ["Yes", "No", "Error", "None"], correctAnswer: 0, explanation: "Subset logic." }
];

export const int108Unit4Coding: QuizQuestion[] = [
    {
        id: `int108-u4-coding-1`,
        unit: 4,
        topic: `List Logic`,
        difficulty: `hard`,
        type: `coding`,
        question: `Given a list of scores, find the 'runner-up' score (the second largest unique score).`,
        starterCode: `def get_runner_up(scores):
    # Your logic here

n = int(input())
scores = [int(x) for x in input().split()]
print(get_runner_up(scores))`,
        testCases: [
            { "input": "5\n2 3 6 6 5", "output": "5" },
            { "input": "4\n10 10 10 10", "output": "None" },
            { "input": "2\n1 2", "output": "1", "isHidden": true }
        ],
        explanation: `Convert the list to a set to get unique scores, sort it, and pick the second last. Handle cases with fewer than 2 unique scores.`
    },
    {
        id: `int108-u4-coding-2`,
        unit: 4,
        topic: `List Comprehension`,
        difficulty: `hard`,
        type: `coding`,
        question: `Use a single list comprehension to extract all vowels (a, e, i, o, u) from a given string, preserving their order and case.`,
        starterCode: `s = input()
vowels = # Your list comprehension here
print(vowels)`,
        testCases: [
            { "input": "Hello World", "output": "['e', 'o', 'o']" },
            { "input": "Python", "output": "['o']" },
            { "input": "AEIOU", "output": "['A', 'E', 'I', 'O', 'U']", "isHidden": true }
        ],
        explanation: `Syntax: [char for char in s if char.lower() in 'aeiou']`
    },
    {
        id: `int108-u4-coding-3`,
        unit: 4,
        topic: `String Formatting`,
        difficulty: `medium`,
        type: `coding`,
        question: `Write a function 'mask_card(card_number)' that masks all digits of a credit card except the last 4 with '*'. Assume a 16-digit card number.`,
        starterCode: `def mask_card(card):
    # Your code here

card = input()
print(mask_card(card))`,
        testCases: [
            { "input": "1234567812345678", "output": "************5678" }
        ],
        explanation: `Use string slicing and concatenation: '*' * 12 + card[12:]`
    },
    {
        id: `int108-u4-coding-4`,
        unit: 4,
        topic: `Nested Lists`,
        difficulty: `hard`,
        type: `coding`,
        question: `Given two 2x2 matrices as nested lists, return their sum as a new nested list.`,
        starterCode: `def add_matrices(m1, m2):
    # Your logic here

# Example input reading
m1 = [[1, 2], [3, 4]]
m2 = [[5, 6], [7, 8]]
print(add_matrices(m1, m2))`,
        testCases: [
            { "input": "", "output": "[[6, 8], [10, 12]]" }
        ],
        explanation: `Iterate through rows and columns to sum corresponding elements.`
    },
    {
        id: `int108-u4-coding-5`,
        unit: 4,
        topic: `Set & List Order`,
        difficulty: `hard`,
        type: `coding`,
        question: `Given a list of numbers, return a new list containing only unique elements while MAINTAINING their original order.`,
        starterCode: `def unique_ordered(items):
    # Your code here

nums = [int(x) for x in input().split()]
print(unique_ordered(nums))`,
        testCases: [
            { "input": "1 2 3 2 1 4", "output": "[1, 2, 3, 4]" },
            { "input": "5 5 5", "output": "[5]" },
            { "input": "10 20 30 10", "output": "[10, 20, 30]", "isHidden": true }
        ],
        explanation: `Use a helper set to track seen items while iterating through the list.`
    }
];
