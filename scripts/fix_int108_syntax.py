import os
import json

units_content = {
    1: [
        {"q": "Write a program to print 'Hello, Python!'", "starter": "print()", "test": [{"in": "", "out": "Hello, Python!"}]},
        {"q": "Create two variables a=5 and b=10, and print their sum.", "starter": "a = 5\nb = 10\n# Your code here", "test": [{"in": "", "out": "15"}]},
        {"q": "Write a program that takes a name as input and prints 'Hello, [name]'.", "starter": "name = input()\n# Your code here", "test": [{"in": "Alice", "out": "Hello, Alice"}]},
        {"q": "Calculate the area of a rectangle with length 5 and width 3.", "starter": "l = 5\nw = 3\n# Your code here", "test": [{"in": "", "out": "15"}]},
        {"q": "Write a program to swap two variables x and y.", "starter": "x = 1\ny = 2\n# Your code here\nprint(x, y)", "test": [{"in": "", "out": "2 1"}]},
        {"q": "Check if a variable x is greater than 10. Print True or False.", "starter": "x = 15\n# Your code here", "test": [{"in": "", "out": "True"}]},
        {"q": "Find the remainder when 25 is divided by 4.", "starter": "a = 25\nb = 4\n# Your code here", "test": [{"in": "", "out": "1"}]},
        {"q": "Convert 10.5 to an integer.", "starter": "x = 10.5\n# Your code here", "test": [{"in": "", "out": "10"}]},
        {"q": "Concatenate two strings 'Python' and 'Programming'.", "starter": "s1 = 'Python'\ns2 = 'Programming'\n# Your code here", "test": [{"in": "", "out": "PythonProgramming"}]},
        {"q": "Print the type of variable x = 5.", "starter": "x = 5\n# Your code here", "test": [{"in": "", "out": "<class 'int'>"}]},
        {"q": "Find 2 raised to the power 5.", "starter": "# Your code here", "test": [{"in": "", "out": "32"}]},
        {"q": "Write a program to calculate simple interest (P=1000, R=5, T=2).", "starter": "p, r, t = 1000, 5, 2\n# Your code here", "test": [{"in": "", "out": "100.0"}]},
        {"q": "Check if a number is even by printing x % 2 == 0.", "starter": "x = 8\n# Your code here", "test": [{"in": "", "out": "True"}]},
        {"q": "Multiply a string 'Ha' 3 times.", "starter": "s = 'Ha'\n# Your code here", "test": [{"in": "", "out": "HaHaHa"}]},
        {"q": "Get the length of the string 'INT108'.", "starter": "s = 'INT108'\n# Your code here", "test": [{"in": "", "out": "6"}]},
        {"q": "Convert a string '100' to an integer.", "starter": "s = '100'\n# Your code here", "test": [{"in": "", "out": "100"}]},
        {"q": "Print the last character of string 'Nexus'.", "starter": "s = 'Nexus'\n# Your code here", "test": [{"in": "", "out": "s"}]},
        {"q": "Perform floor division of 17 by 3.", "starter": "a, b = 17, 3\n# Your code here", "test": [{"in": "", "out": "5"}]},
        {"q": "Find the square root of 64.", "starter": "import math\nx = 64\n# Your code here", "test": [{"in": "", "out": "8.0"}]},
        {"q": "Print the absolute value of -10.", "starter": "x = -10\n# Your code here", "test": [{"in": "", "out": "10"}]}
    ],
    2: [
        {"q": "Check if a number x is positive, negative or zero.", "starter": "x = -5\n# Your code here", "test": [{"in": "", "out": "negative"}]},
        {"q": "Print first 5 natural numbers using while loop.", "starter": "# Your code here", "test": [{"in": "", "out": "1\n2\n3\n4\n5"}]},
        {"q": "Print all even numbers between 1 and 10 using for loop.", "starter": "# Your code here", "test": [{"in": "", "out": "2\n4\n6\n8\n10"}]},
        {"q": "Find if x is divisible by both 3 and 5.", "starter": "x = 15\n# Your code here", "test": [{"in": "", "out": "True"}]},
        {"q": "Find the largest of three numbers a, b, c.", "starter": "a, b, c = 10, 20, 15\n# Your code here", "test": [{"in": "", "out": "20"}]},
        {"q": "Print the multiplication table of 2 up to 5.", "starter": "# Your code here", "test": [{"in": "", "out": "2\n4\n6\n8\n10"}]},
        {"q": "Find the factorial of 5.", "starter": "n = 5\n# Your code here", "test": [{"in": "", "out": "120"}]},
        {"q": "Check if a year is leap year (Year = 2024).", "starter": "year = 2024\n# Your code here", "test": [{"in": "", "out": "Leap Year"}]},
        {"q": "Print numbers from 10 down to 1.", "starter": "# Your code here", "test": [{"in": "", "out": "10\n9\n8\n7\n6\n5\n4\n3\n2\n1"}]},
        {"q": "Find the sum of all numbers from 1 to 10.", "starter": "# Your code here", "test": [{"in": "", "out": "55"}]},
        {"q": "Check if a character is a vowel.", "starter": "char = 'e'\n# Your code here", "test": [{"in": "", "out": "vowel"}]},
        {"q": "Print 'Pass' if marks >= 40 else 'Fail'.", "starter": "marks = 45\n# Your code here", "test": [{"in": "", "out": "Pass"}]},
        {"q": "Use 'break' to stop a loop at 5 (range 1 to 10).", "starter": "# Your code here", "test": [{"in": "", "out": "1\n2\n3\n4"}]},
        {"q": "Use 'continue' to skip 3 in range 1 to 5.", "starter": "# Your code here", "test": [{"in": "", "out": "1\n2\n4\n5"}]},
        {"q": "Count number of digits in 12345.", "starter": "n = 12345\n# Your code here", "test": [{"in": "", "out": "5"}]},
        {"q": "Reverse a number 123.", "starter": "n = 123\n# Your code here", "test": [{"in": "", "out": "321"}]},
        {"q": "Check if a number 7 is prime.", "starter": "n = 7\n# Your code here", "test": [{"in": "", "out": "Prime"}]},
        {"q": "Print Fibonacci series up to 5 terms.", "starter": "# Your code here", "test": [{"in": "", "out": "0\n1\n1\n2\n3"}]},
        {"q": "Find sum of digits of 123.", "starter": "n = 123\n# Your code here", "test": [{"in": "", "out": "6"}]},
        {"q": "Draw a 3x3 square of stars (*).", "starter": "# Your code here", "test": [{"in": "", "out": "***\n***\n***"}]}
    ],
    3: [
        {"q": "Define a function 'greet' that returns 'Hello'.", "starter": "# Your code here\nprint(greet())", "test": [{"in": "", "out": "Hello"}]},
        {"q": "Create a function 'add(a, b)' and print add(3, 4).", "starter": "# Your code here\nprint(add(3, 4))", "test": [{"in": "", "out": "7"}]},
        {"q": "Write a function to find the square of a number.", "starter": "# Your code here\nprint(square(5))", "test": [{"in": "", "out": "25"}]},
        {"q": "Create a function with a default argument.", "starter": "def greet(name='User'):\n    return 'Hi ' + name\n# Your code here", "test": [{"in": "", "out": "Hi User"}]},
        {"q": "Write a recursive function for factorial.", "starter": "# Your code here\nprint(fact(4))", "test": [{"in": "", "out": "24"}]},
        {"q": "Use a lambda function to add 10 to a number.", "starter": "add_ten = # Your code\nprint(add_ten(5))", "test": [{"in": "", "out": "15"}]},
        {"q": "Write a function that returns multiple values.", "starter": "# Your code here\na, b = get_min_max([1, 2, 3])\nprint(a, b)", "test": [{"in": "", "out": "1 3"}]},
        {"q": "Calculate area of circle using math.pi in a function.", "starter": "import math\n# Your code here\nprint(round(area(5), 2))", "test": [{"in": "", "out": "78.54"}]},
        {"q": "Write a function to check if a string is palindrome.", "starter": "# Your code here\nprint(is_palindrome('radar'))", "test": [{"in": "", "out": "True"}]},
        {"q": "Use *args to print all arguments passed to a function.", "starter": "# Your code here\nprint_all(1, 2, 3)", "test": [{"in": "", "out": "1\n2\n3"}]},
        {"q": "Use **kwargs to print key-value pairs.", "starter": "# Your code here\nprint_kv(name='Alice', age=20)", "test": [{"in": "", "out": "name: Alice\nage: 20"}]},
        {"q": "Write a function to find the maximum in a list.", "starter": "# Your code here\nprint(my_max([10, 50, 30]))", "test": [{"in": "", "out": "50"}]},
        {"q": "Write a function to count vowels in a string.", "starter": "# Your code here\nprint(count_vowels('hello'))", "test": [{"in": "", "out": "2"}]},
        {"q": "Apply a function to all elements in a list using map().", "starter": "nums = [1, 2, 3]\n# Your code here", "test": [{"in": "", "out": "[1, 4, 9]"}]},
        {"q": "Filter even numbers from a list using filter().", "starter": "nums = [1, 2, 3, 4]\n# Your code here", "test": [{"in": "", "out": "[2, 4]"}]},
        {"q": "Write a function to reverse a string.", "starter": "# Your code here\nprint(reverse_str('abc'))", "test": [{"in": "", "out": "cba"}]},
        {"q": "Demonstrate the use of global keyword.", "starter": "x = 10\ndef change():\n    # Your code\nchange()\nprint(x)", "test": [{"in": "", "out": "20"}]},
        {"q": "Create a generator function that yields 1, 2, 3.", "starter": "# Your code here\nfor i in my_gen():\n    print(i)", "test": [{"in": "", "out": "1\n2\n3"}]},
        {"q": "Write a function to calculate power without ** operator.", "starter": "# Your code here\nprint(power(2, 3))", "test": [{"in": "", "out": "8"}]},
        {"q": "Use an inner function to calculate square of sum.", "starter": "# Your code here\nprint(calc(2, 3))", "test": [{"in": "", "out": "25"}]}
    ],
    4: [
        {"q": "Create a list [1, 2, 3] and append 4.", "starter": "L = [1, 2, 3]\n# Your code here\nprint(L)", "test": [{"in": "", "out": "[1, 2, 3, 4]"}]},
        {"q": "Access the second element of a list.", "starter": "L = [10, 20, 30]\n# Your code here", "test": [{"in": "", "out": "20"}]},
        {"q": "Slicing: Get [2, 3] from [1, 2, 3, 4].", "starter": "L = [1, 2, 3, 4]\n# Your code here", "test": [{"in": "", "out": "[2, 3]"}]},
        {"q": "Sort a list [3, 1, 2] in ascending order.", "starter": "L = [3, 1, 2]\n# Your code here\nprint(L)", "test": [{"in": "", "out": "[1, 2, 3]"}]},
        {"q": "Create a tuple (1, 2, 3) and print its type.", "starter": "# Your code here", "test": [{"in": "", "out": "<class 'tuple'>"}]},
        {"q": "Unpack a tuple (10, 20) into a and b.", "starter": "T = (10, 20)\n# Your code here\nprint(a, b)", "test": [{"in": "", "out": "10 20"}]},
        {"q": "Create a dictionary with name='Alice' and age=25.", "starter": "# Your code here\nprint(D['name'])", "test": [{"in": "", "out": "Alice"}]},
        {"q": "Add a new key-value 'city':'Noida' to dictionary.", "starter": "D = {'id': 1}\n# Your code here\nprint(D)", "test": [{"in": "", "out": "{'id': 1, 'city': 'Noida'}"}]},
        {"q": "Iterate through dictionary and print keys.", "starter": "D = {'a': 1, 'b': 2}\n# Your code here", "test": [{"in": "", "out": "a\nb"}]},
        {"q": "Create a set {1, 2, 2, 3} and print it.", "starter": "# Your code here\nprint(S)", "test": [{"in": "", "out": "{1, 2, 3}"}]},
        {"q": "Find union of two sets {1, 2} and {2, 3}.", "starter": "s1, s2 = {1, 2}, {2, 3}\n# Your code here", "test": [{"in": "", "out": "{1, 2, 3}"}]},
        {"q": "Use list comprehension to create squares of [1, 2, 3].", "starter": "L = [1, 2, 3]\nS = # Your code here\nprint(S)", "test": [{"in": "", "out": "[1, 4, 9]"}]},
        {"q": "Remove element 20 from list [10, 20, 30].", "starter": "L = [10, 20, 30]\n# Your code here\nprint(L)", "test": [{"in": "", "out": "[10, 30]"}]},
        {"q": "Find the length of a dictionary.", "starter": "D = {'a':1, 'b':2}\n# Your code here", "test": [{"in": "", "out": "2"}]},
        {"q": "Merge two dictionaries D1 and D2.", "starter": "D1 = {'a':1} \nD2 = {'b':2}\n# Your code here\nprint(sorted(D1.items()))", "test": [{"in": "", "out": "[('a', 1), ('b', 2)]"}]},
        {"q": "Check if 'a' exists in dictionary keys.", "starter": "D = {'a':1}\n# Your code here", "test": [{"in": "", "out": "True"}]},
        {"q": "Find the intersection of two sets.", "starter": "s1 = {1, 2, 3}\ns2 = {2, 3, 4}\n# Your code\nprint(sorted(list(res)))", "test": [{"in": "", "out": "[2, 3]"}]},
        {"q": "Create a list of 5 zeros using *.", "starter": "# Your code here", "test": [{"in": "", "out": "[0, 0, 0, 0, 0]"}]},
        {"q": "Pop the last element from a list.", "starter": "L = [1, 2, 3]\n# Your code here\nprint(L)", "test": [{"in": "", "out": "[1, 2]"}]},
        {"q": "Clear all elements from a dictionary.", "starter": "D = {'a':1}\n# Your code here\nprint(D)", "test": [{"in": "", "out": "{}"}]}
    ],
    5: [
        {"q": "Write 'Hello' to a file 'test.txt'.", "starter": "# Your code here\nwith open('test.txt', 'r') as f: print(f.read())", "test": [{"in": "", "out": "Hello"}]},
        {"q": "Read all content from 'test.txt'.", "starter": "with open('test.txt', 'w') as f: f.write('Data')\n# Your code here", "test": [{"in": "", "out": "Data"}]},
        {"q": "Append '!!!' to 'test.txt'.", "starter": "with open('test.txt', 'w') as f: f.write('Hi')\n# Your code here\nwith open('test.txt', 'r') as f: print(f.read())", "test": [{"in": "", "out": "Hi!!!"}]},
        {"q": "Perform division by zero and handle with try-except.", "starter": "try:\n    # Your code\nexcept ZeroDivisionError:\n    print('Zero')", "test": [{"in": "", "out": "Zero"}]},
        {"q": "Catch multiple exceptions (Index and Value errors).", "starter": "try:\n    # Your code\nexcept (IndexError, ValueError):\n    print('Error')", "test": [{"in": "", "out": "Error"}]},
        {"q": "Use 'finally' block with try-except.", "starter": "try:\n    1/1\nfinally:\n    # Your code", "test": [{"in": "", "out": "Cleaned up"}]},
        {"q": "Raise a ValueError with message 'Wrong Value'.", "starter": "# Your code here", "test": [{"in": "", "out": "Wrong Value"}]},
        {"q": "Read file line by line using for loop.", "starter": "with open('t.txt', 'w') as f: f.write('a\\nb')\n# Your code", "test": [{"in": "", "out": "a\\nb"}]},
        {"q": "Write a list of strings to a file using writelines().", "starter": "L = ['a\\n', 'b\\n']\n# Your code\nwith open('t.txt', 'r') as f: print(f.read().strip())", "test": [{"in": "", "out": "a\\nb"}]},
        {"q": "Use 'with' block for file handling to ensure closure.", "starter": "# Your code here", "test": [{"in": "", "out": "True"}]},
        {"q": "Catch any exception using a generic 'except' block.", "starter": "try:\n    raise NameError\nexcept:\n    # Your code", "test": [{"in": "", "out": "Caught"}]},
        {"q": "Read only first 5 characters of a file.", "starter": "with open('t.txt', 'w') as f: f.write('Hello World')\n# Your code", "test": [{"in": "", "out": "Hello"}]},
        {"q": "Check if a file exists before opening.", "starter": "import os\n# Your code here", "test": [{"in": "", "out": "False"}]},
        {"q": "Rename 'old.txt' to 'new.txt' using os module.", "starter": "with open('old.txt', 'w') as f: f.write('1')\nimport os\n# Your code\nprint(os.path.exists('new.txt'))", "test": [{"in": "", "out": "True"}]},
        {"q": "Delete 'temp.txt' file.", "starter": "with open('temp.txt', 'w') as f: f.write('1')\nimport os\n# Your code\nprint(os.path.exists('temp.txt'))", "test": [{"in": "", "out": "False"}]},
        {"q": "Raise and catch a custom exception.", "starter": "class MyError(Exception): pass\n# Your code", "test": [{"in": "", "out": "Handled"}]},
        {"q": "Count number of words in a file.", "starter": "with open('f.txt', 'w') as f: f.write('One Two Three')\n# Your code", "test": [{"in": "", "out": "3"}]},
        {"q": "Use 'seek()' to move file pointer to start.", "starter": "with open('f.txt', 'w+') as f:\n    f.write('ABC')\n    # Your code\n    print(f.read())", "test": [{"in": "", "out": "ABC"}]},
        {"q": "Tell the current position of the file pointer.", "starter": "with open('f.txt', 'w') as f:\n    f.write('123')\n    # Your code", "test": [{"in": "", "out": "3"}]},
        {"q": "Handle file not found exception.", "starter": "try:\n    open('none.txt', 'r')\nexcept FileNotFoundError:\n    # Your code", "test": [{"in": "", "out": "Missing"}]}
    ],
    6: [
        {"q": "Create a class 'Student' with no methods.", "starter": "# Your code here\ns = Student()\nprint(type(s))", "test": [{"in": "", "out": "<class '__main__.Student'>"}]},
        {"q": "Add an __init__ method to set 'name'.", "starter": "# Your code here\ns = Student('Bob')\nprint(s.name)", "test": [{"in": "", "out": "Bob"}]},
        {"q": "Create a method 'say_hi' that returns 'Hi'.", "starter": "# Your code here\ns = Student()\nprint(s.say_hi())", "test": [{"in": "", "out": "Hi"}]},
        {"q": "Demonstrate inheritance: Class B(A).", "starter": "class A: pass\n# Your code here\nb = B()\nprint(isinstance(b, A))", "test": [{"in": "", "out": "True"}]},
        {"q": "Use 'super()' to call parent constructor.", "starter": "class A:\n    def __init__(self): print('A')\nclass B(A):\n    def __init__(self):\n        # Your code\nB()", "test": [{"in": "", "out": "A"}]},
        {"q": "Override a method in child class.", "starter": "class A: \n    def f(self): return 'A'\nclass B(A):\n    # Your code\nprint(B().f())", "test": [{"in": "", "out": "B"}]},
        {"q": "Create a private variable __score.", "starter": "class A:\n    def __init__(self): # Your code\na = A()\ntry: print(a.__score)\nexcept AttributeError: print('Private')", "test": [{"in": "", "out": "Private"}]},
        {"q": "Demonstrate polymorphism with two classes.", "starter": "# Your code here\nfor obj in [Dog(), Cat()]:\n    print(obj.sound())", "test": [{"in": "", "out": "Woof\nMeow"}]},
        {"q": "Count number of objects using a class variable.", "starter": "class A:\n    count = 0\n    # Your code\nA(); A(); print(A.count)", "test": [{"in": "", "out": "2"}]},
        {"q": "Create a static method using @staticmethod.", "starter": "class A:\n    # Your code\n    def info(): return 'Static'\nprint(A.info())", "test": [{"in": "", "out": "Static"}]},
        {"q": "Use __str__ method to return object description.", "starter": "class A:\n    # Your code\nprint(str(A()))", "test": [{"in": "", "out": "Object A"}]},
        {"q": "Implement multiple inheritance.", "starter": "class A: pass\nclass B: pass\n# Your code\nprint(isinstance(C(), A) and isinstance(C(), B))", "test": [{"in": "", "out": "True"}]},
        {"q": "Check if an object has an attribute using hasattr().", "starter": "class A: x=1\n# Your code", "test": [{"in": "", "out": "True"}]},
        {"q": "Delete an object attribute using delattr().", "starter": "class A: x=1\na = A()\n# Your code\nprint(hasattr(a, 'x'))", "test": [{"in": "", "out": "False"}]},
        {"q": "Get an attribute value using getattr().", "starter": "class A: x=99\na = A()\n# Your code", "test": [{"in": "", "out": "99"}]},
        {"q": "Create a property using @property decorator.", "starter": "class A:\n    # Your code\n    def x(self): return 10\nprint(A().x)", "test": [{"in": "", "out": "10"}]},
        {"q": "Demonstrate method overloading using default args.", "starter": "class A:\n    # Your code\nprint(A().sum(1), A().sum(1, 2))", "test": [{"in": "", "out": "1 3"}]},
        {"q": "Identify internal attributes of a class using __dict__.", "starter": "class A: x=1\n# Your code", "test": [{"in": "", "out": "{'x': 1}"}]},
        {"q": "Show use of __del__ (destructor).", "starter": "class A:\n    # Your code\ndel A()", "test": [{"in": "", "out": "Deleted"}]},
        {"q": "Abstract Base Class: Create a class that must implement 'run'.", "starter": "from abc import ABC, abstractmethod\n# Your code", "test": [{"in": "", "out": "Implemented"}]}
    ]
}

def escape_js(text):
    # Escape for inclusion in a backtick string
    # We want actual newlines in the TS file to make it readable
    return text.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")

for unit, questions in units_content.items():
    file_path = f"c:\\Users\\ASUS\\OneDrive\\Desktop\\Anunayy\\AntiGravity\\LPU-Nexus\\data\\quiztaker\\INT108\\unit{unit}.ts"
    if not os.path.exists(file_path):
        continue
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Remove old coding array if present
    marker = f"export const int108Unit{unit}Coding"
    if marker in content:
        content = content.split(marker)[0].strip()
    
    # Generate JS array using backticks for strings
    q_objects = []
    for i, q in enumerate(questions):
        q_id = f"int108-u{unit}-coding-{i+1}"
        # Convert in/out to input/output for consistency and to avoid reserved keywords
        clean_tests = []
        for test in q['test']:
            clean_tests.append({
                "input": test["in"],
                "output": test["out"]
            })
        test_cases_json = json.dumps(clean_tests, indent=8)
        
        # Format starterCode with proper indentation if it has multiple lines
        starter = escape_js(q['starter'])
        # No extra indentation here as it's inside backticks which preserve whitespace in JS
        
        q_obj = f"""    {{
        id: `{q_id}`,
        unit: {unit},
        topic: `Programming`,
        difficulty: `medium`,
        type: `coding`,
        question: `{escape_js(q['q'])}`,
        starterCode: `{starter}`,
        testCases: {test_cases_json},
        explanation: `Follow basic Python syntax and common practices for this unit.`
    }}"""
        q_objects.append(q_obj)
    
    new_coding_part = f"\n\nexport const int108Unit{unit}Coding: QuizQuestion[] = [\n" + ",\n".join(q_objects) + "\n];\n"
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content + new_coding_part)

print("Coding questions regenerated with safe escaping.")
