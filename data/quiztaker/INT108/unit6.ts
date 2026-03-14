import { QuizQuestion } from '../../../types.ts';

export const int108Unit6MCQs: QuizQuestion[] = [
    { id: "int108-u6-1", unit: 6, topic: 'OOP Basics', difficulty: 'easy', questionType: 'MCQ', question: "Which keyword is used to define a class?", options: ["class", "obj", "def", "struct"], correctAnswer: 0, explanation: "'class' keyword initiates the blueprint definition." },
    { id: "int108-u6-2", unit: 6, topic: 'OOP Basics', difficulty: 'easy', questionType: 'MCQ', question: "A physical manifestation of a class is called ___.", options: ["Object", "Method", "Variable", "Blueprint"], correctAnswer: 0, explanation: "Objects are instances of classes." },
    { id: "int108-u6-3", unit: 6, topic: 'Constructors', difficulty: 'easy', questionType: 'MCQ', question: "Which method is the constructor in Python?", options: ["__init__", "__main__", "__new__", "constructor"], correctAnswer: 0, explanation: "It initializes the object's state upon creation." },
    { id: "int108-u6-4", unit: 6, topic: 'Self', difficulty: 'medium', questionType: 'MCQ', question: "What is the purpose of 'self' in methods?", options: ["Refers to the current instance", "Refers to the parent class", "Refers to global scope", "None"], correctAnswer: 0, explanation: "It allows methods to access instance attributes." },
    { id: "int108-u6-5", unit: 6, topic: 'Attributes', difficulty: 'medium', questionType: 'MCQ', question: "Where are instance variables usually initialized?", options: ["__init__", "Top of class", "Inside methods", "None"], correctAnswer: 0, explanation: "Standard practice for clean object state." },
    { id: "int108-u6-6", unit: 6, topic: 'Inheritance', difficulty: 'easy', questionType: 'MCQ', question: "A class that derives from another is called a ___.", options: ["Subclass / Derived", "Parent", "Module", "None"], correctAnswer: 0, explanation: "Inheritance allows code reuse." },
    { id: "int108-u6-7", unit: 6, topic: 'Inheritance', difficulty: 'medium', questionType: 'MCQ', question: "What is the syntax for inheritance?", options: ["class Child(Parent):", "class Child extends Parent:", "class Child < Parent:", "None"], correctAnswer: 0, explanation: "Passing the parent class in parentheses." },
    { id: "int108-u6-8", unit: 6, topic: 'Inheritance', difficulty: 'hard', questionType: 'MCQ', question: "Which keyword accesses methods of the parent class?", options: ["super()", "parent()", "base()", "this"], correctAnswer: 0, explanation: "super() proxies calls to the parent's implementation." },
    { id: "int108-u6-9", unit: 6, topic: 'Multiple Inheritance', difficulty: 'hard', questionType: 'MCQ', question: "Does Python support multiple inheritance?", options: ["Yes", "No", "Only through mixins", "None"], correctAnswer: 0, explanation: "A class can inherit from multiple parent classes (e.g., class C(A, B))." },
    { id: "int108-u6-10", unit: 6, topic: 'Encapsulation', difficulty: 'medium', questionType: 'MCQ', question: "How to mark an attribute as private by convention?", options: ["Leading double underscore (__var)", "Private keyword", "Static keyword", "None"], correctAnswer: 0, explanation: "Name mangling handles double underscores." },
    { id: "int108-u6-11", unit: 6, topic: 'Polymorphism', difficulty: 'hard', questionType: 'MCQ', question: "What is method overriding?", options: ["Redefining child method with same name as parent", "Overloading parameters", "Deleting methods", "None"], correctAnswer: 0, explanation: "Child class provides specific logic for inherited method." },
    { id: "int108-u6-12", unit: 6, topic: 'Polymorphism', difficulty: 'hard', questionType: 'MCQ', question: "Does Python support method overloading by parameter count?", options: ["No (Last defined wins)", "Yes", "Depends", "None"], correctAnswer: 0, explanation: "Python doesn't distinguish methods by signature, only name." },
    { id: "int108-u6-13", unit: 6, topic: 'Attributes', difficulty: 'medium', questionType: 'MCQ', question: "What is a class variable?", options: ["Shared by all instances", "Unique to each instance", "Local to a method", "None"], correctAnswer: 0, explanation: "Defined directly in the class body." },
    { id: "int108-u6-14", unit: 6, topic: 'Dunder Methods', difficulty: 'hard', questionType: 'MCQ', question: "Which method defines the string representation?", options: ["__str__", "__repr__", "Both", "toString()"], correctAnswer: 2, explanation: "Python uses these for print() and debugging." },
    { id: "int108-u6-15", unit: 6, topic: 'Decorators', difficulty: 'hard', questionType: 'MCQ', question: "Which decorator creates a static method?", options: ["@staticmethod", "@classmethod", "@final", "None"], correctAnswer: 0, explanation: "Static methods don't receive self or cls." },
    { id: "int108-u6-16", unit: 6, topic: 'Decorators', difficulty: 'hard', questionType: 'MCQ', question: "Which decorator creates a method receiving the class?", options: ["@classmethod", "@staticmethod", "@member", "None"], correctAnswer: 0, explanation: "Starts with 'cls' parameter." },
    { id: "int108-u6-17", unit: 6, topic: 'Properties', difficulty: 'hard', questionType: 'MCQ', question: "Which decorator turns a method into a read-only attribute?", options: ["@property", "@attr", "@field", "None"], correctAnswer: 0, explanation: "Allows access without parentheses." },
    { id: "int108-u6-18", unit: 6, topic: 'Memory', difficulty: 'hard', questionType: 'MCQ', question: "Which method is called when an object is destroyed?", options: ["__del__", "__exit__", "__stop__", "None"], correctAnswer: 0, explanation: "The finalizer/destructor." },
    { id: "int108-u6-19", unit: 6, topic: 'OOP Basics', difficulty: 'easy', questionType: 'MCQ', question: "Is Python a pure OOP language?", options: ["No, it's multi-paradigm", "Yes", "Only for web", "None"], correctAnswer: 0, explanation: "Supports procedural, functional, and OOP." },
    { id: "int108-u6-20", unit: 6, topic: 'Identity', difficulty: 'medium', questionType: 'MCQ', question: "How to check if an object is an instance of a class?", options: ["isinstance(obj, Class)", "obj.type == Class", "is_a(obj, Class)", "None"], correctAnswer: 0, explanation: "Built-in type check." },
    { id: "int108-u6-21", unit: 6, topic: 'Identity', difficulty: 'medium', questionType: 'MCQ', question: "Check if class A is subclass of B?", options: ["issubclass(A, B)", "A.is(B)", "A < B", "None"], correctAnswer: 0, explanation: "Class hierarchy check." },
    { id: "int108-u6-22", unit: 6, topic: 'Attributes', difficulty: 'medium', questionType: 'MCQ', question: "How to check if object has attribute?", options: ["hasattr(obj, 'name')", "obj.has('name')", "get(obj, 'name')", "None"], correctAnswer: 0, explanation: "Reflection utility." },
    { id: "int108-u6-23", unit: 6, topic: 'Attributes', difficulty: 'medium', questionType: 'MCQ', question: "Delete attribute from object?", options: ["delattr(obj, 'name')", "obj.remove('name')", "del obj.name", "Both A and C"], correctAnswer: 3, explanation: "Multiple ways to remove properties." },
    { id: "int108-u6-24", unit: 6, topic: 'OOP', difficulty: 'easy', questionType: 'MCQ', question: "What is data abstraction?", options: ["Hiding complexity", "Exposing all variables", "Encryption", "None"], correctAnswer: 0, explanation: "Providing a simple interface to complex data." },
    { id: "int108-u6-25", unit: 6, topic: 'Internal', difficulty: 'hard', questionType: 'MCQ', question: "Attribute that stores class name?", options: ["obj.__class__.__name__", "obj.name", "obj.type", "None"], correctAnswer: 0, explanation: "Accessed via the class reference." },
    { id: "int108-u6-26", unit: 6, topic: 'Internal', difficulty: 'hard', questionType: 'MCQ', question: "What does __dict__ store?", options: ["Object attributes as a dictionary", "List of methods", "Class variables", "None"], correctAnswer: 0, explanation: "Most objects use a dict for mapping names to values." },
    { id: "int108-u6-27", unit: 6, topic: 'Composition', difficulty: 'hard', questionType: 'MCQ', question: "Relationship 'Has-A' refers to?", options: ["Composition / Association", "Inheritance", "Polymorphism", "None"], correctAnswer: 0, explanation: "Containing an object of another class." },
    { id: "int108-u6-28", unit: 6, topic: 'Inheritance', difficulty: 'hard', questionType: 'MCQ', question: "Relationship 'Is-A' refers to?", options: ["Inheritance", "Composition", "Encapsulation", "None"], correctAnswer: 0, explanation: "Specialization of a parent class." },
    { id: "int108-u6-29", unit: 6, topic: 'MRO', difficulty: 'hard', questionType: 'MCQ', question: "What is Method Resolution Order?", options: ["Order Python searches classes in hierarchy", "Naming convention", "Sorting list", "None"], correctAnswer: 0, explanation: "Crucial for multiple inheritance (C3 linearization)." },
    { id: "int108-u6-30", unit: 6, topic: 'Static', difficulty: 'medium', questionType: 'MCQ', question: "Can a static method access self?", options: ["No", "Yes", "Depends", "None"], correctAnswer: 0, explanation: "Static methods operate on parameters, not instances." },
    { id: "int108-u6-31", unit: 6, topic: 'Construction', difficulty: 'hard', questionType: 'MCQ', question: "Which method runs BEFORE __init__?", options: ["__new__", "__start__", "__alloc__", "None"], correctAnswer: 0, explanation: "It actually creates the instance object." },
    { id: "int108-u6-32", unit: 6, topic: 'Encapsulation', difficulty: 'medium', questionType: 'MCQ', question: "Protected attribute convention?", options: ["Single underscore (_var)", "Double underscore", "Capitalized", "None"], correctAnswer: 0, explanation: "Indicates it should not be accessed outside class hierarchy." },
    { id: "int108-u6-33", unit: 6, topic: 'Polymorphism', difficulty: 'medium', questionType: 'MCQ', question: "Ducking Typing principle?", options: ["If it behaves like it, it is it", "Needs strict inheritance", "Only for animals", "None"], correctAnswer: 0, explanation: "Type is determined by available methods, not explicit class." },
    { id: "int108-u6-34", unit: 6, topic: 'Operator Overloading', difficulty: 'hard', questionType: 'MCQ', question: "Method to overload '+' operator?", options: ["__add__", "__plus__", "__sum__", "None"], correctAnswer: 0, explanation: "Allows adding objects together." },
    { id: "int108-u6-35", unit: 6, topic: 'Operator Overloading', difficulty: 'hard', questionType: 'MCQ', question: "Method to overload '==' operator?", options: ["__eq__", "__same__", "__equal__", "None"], correctAnswer: 0, explanation: "Allows custom equality logic." },
    { id: "int108-u6-36", unit: 6, topic: 'Operator Overloading', difficulty: 'hard', questionType: 'MCQ', question: "Method to overload '<' operator?", options: ["__lt__", "__less__", "__small__", "None"], correctAnswer: 0, explanation: "Stands for 'less than'." },
    { id: "int108-u6-37", unit: 6, topic: 'Attributes', difficulty: 'medium', questionType: 'MCQ', question: "What is 'self' effectively?", options: ["First parameter of instance methods", "Mandatory name", "Reserved keyword", "None"], correctAnswer: 0, explanation: "It's a convention, but mandatory for the logic." },
    { id: "int108-u6-38", unit: 6, topic: 'OOP', difficulty: 'medium', questionType: 'MCQ', question: "Can a class inherit from itself?", options: ["No", "Yes", "Only in Python 2", "None"], correctAnswer: 0, explanation: "Cyclic inheritance is illegal." },
    { id: "int108-u6-39", unit: 6, topic: 'Functions vs Methods', difficulty: 'easy', questionType: 'MCQ', question: "What is a method?", options: ["Function inside a class", "Global function", "Wait list", "None"], correctAnswer: 0, explanation: "Associated with an object's behavior." },
    { id: "int108-u6-40", unit: 6, topic: 'Constructors', difficulty: 'medium', questionType: 'MCQ', question: "Can a class have multiple __init__?", options: ["No (Only last one)", "Yes", "Depends on parameters", "None"], correctAnswer: 0, explanation: "Python doesn't support constructor overloading." },
    { id: "int108-u6-41", unit: 6, topic: 'Constructors', difficulty: 'medium', questionType: 'MCQ', question: "What if child has no __init__?", options: ["Parent's __init__ is called", "Object not created", "Error", "None"], correctAnswer: 0, explanation: "Falls back through inheritance." },
    { id: "int108-u6-42", unit: 6, topic: 'Inheritance', difficulty: 'medium', questionType: 'MCQ', question: "What is 'Level' of inheritance in A -> B -> C?", options: ["Multilevel", "Hierarchical", "Multiple", "None"], correctAnswer: 0, explanation: "Chaining parents." },
    { id: "int108-u6-43", unit: 6, topic: 'Inheritance', difficulty: 'medium', questionType: 'MCQ', question: "One parent, multiple children type?", options: ["Hierarchical", "Multilevel", "Simple", "None"], correctAnswer: 0, explanation: "Tree structure." },
    { id: "int108-u6-44", unit: 6, topic: 'Abstract', difficulty: 'hard', questionType: 'MCQ', question: "Which module provides abstract base classes?", options: ["abc", "abs", "oop", "None"], correctAnswer: 0, explanation: "Use @abstractmethod to define interfaces." },
    { id: "int108-u6-45", unit: 6, topic: 'Abstract', difficulty: 'hard', questionType: 'MCQ', question: "Can an abstract class be instantiated?", options: ["No", "Yes", "Only if it has variables", "None"], correctAnswer: 0, explanation: "Its purpose is to be a template for children." },
    { id: "int108-u6-46", unit: 6, topic: 'Iterators', difficulty: 'hard', questionType: 'MCQ', question: "Method to make object iterable?", options: ["__iter__", "__next__", "Both", "None"], correctAnswer: 2, explanation: "The iterator protocol." },
    { id: "int108-u6-47", unit: 6, topic: 'Access', difficulty: 'medium', questionType: 'MCQ', question: "Dot notation 'obj.attr' is standard.", options: ["True", "False", "Only for methods", "None"], correctAnswer: 0, explanation: "Standard access." },
    { id: "int108-u6-48", unit: 6, topic: 'Identity', difficulty: 'easy', questionType: 'MCQ', question: "Each object has a unique id?", options: ["True", "False", "Only if named", "None"], correctAnswer: 0, explanation: "id() returns memory identity." },
    { id: "int108-u6-49", unit: 6, topic: 'State', difficulty: 'medium', questionType: 'MCQ', question: "Difference between class and object?", options: ["Class is plan; Object is realization", "Same", "Object is code", "None"], correctAnswer: 0, explanation: "Classic definition." },
    { id: "int108-u6-50", unit: 6, topic: 'Slots', difficulty: 'hard', questionType: 'MCQ', question: "What is __slots__ for?", options: ["Restricting attributes / Saving memory", "Naming methods", "Speeding up CPU", "None"], correctAnswer: 0, explanation: "Prevents creating __dict__ for every instance." },
    { id: "int108-u6-51", unit: 6, topic: 'Mixins', difficulty: 'hard', questionType: 'MCQ', question: "What is a Mixin?", options: ["Class providing logic but not meant for standalone", "A tool", "A method", "None"], correctAnswer: 0, explanation: "Used with multiple inheritance to add features." },
    { id: "int108-u6-52", unit: 6, topic: 'OOP', difficulty: 'easy', questionType: 'MCQ', question: "Is encapsulation about data security?", options: ["Yes (Restricting access)", "No", "Only on servers", "None"], correctAnswer: 0, explanation: "Bundling data and methods together." },
    { id: "int108-u6-53", unit: 6, topic: 'Methods', difficulty: 'medium', questionType: 'MCQ', question: "Can method name be same as variable name?", options: ["No (Shadowing/Collision)", "Yes", "Only if private", "None"], correctAnswer: 0, explanation: "Accessing it becomes ambiguous." },
    { id: "int108-u6-54", unit: 6, topic: 'Inheritance', difficulty: 'hard', questionType: 'MCQ', question: "What is 'super().__init__()'?", options: ["Calling parent constructor", "Creating object", "Deleting object", "None"], correctAnswer: 0, explanation: "Standard way to initialize inherited properties." },
    { id: "int108-u6-55", unit: 6, topic: 'Internal', difficulty: 'medium', questionType: 'MCQ', question: "Is 'self' a keyword?", options: ["No (Convention)", "Yes", "Only in classes", "None"], correctAnswer: 0, explanation: "You could name it 'this' but it's strongly discouraged." },
    { id: "int108-u6-56", unit: 6, topic: 'Constructors', difficulty: 'medium', questionType: 'MCQ', question: "Return type of __init__?", options: ["Must be None", "Int", "Object", "None"], correctAnswer: 0, explanation: "It must return None; __new__ returns the object." },
    { id: "int108-u6-57", unit: 6, topic: 'Metaclasses', difficulty: 'hard', questionType: 'MCQ', question: "A class that defines behavior of other classes?", options: ["Metaclass", "Superclass", "Root", "None"], correctAnswer: 0, explanation: "Classes are objects of metaclasses." },
    { id: "int108-u6-58", unit: 6, topic: 'Operator', difficulty: 'medium', questionType: 'MCQ', question: "Method for '+'?", options: ["__add__", "__plus__", "__sum__", "None"], correctAnswer: 0, explanation: "Magic method." },
    { id: "int108-u6-59", unit: 6, topic: 'Operator', difficulty: 'medium', questionType: 'MCQ', question: "Method for 'len()'?", options: ["__len__", "__size__", "Both", "None"], correctAnswer: 0, explanation: "Allows calling len(obj)." },
    { id: "int108-u6-60", unit: 6, topic: 'Operator', difficulty: 'medium', questionType: 'MCQ', question: "Method for '[]' indexing?", options: ["__getitem__", "__index__", "__list__", "None"], correctAnswer: 0, explanation: "Allows subscript access." },
    { id: "int108-u6-61", unit: 6, topic: 'Comparison', difficulty: 'medium', questionType: 'MCQ', question: "Method for '!='?", options: ["__ne__", "__ni__", "__not__", "None"], correctAnswer: 0, explanation: "Not Equal operator overload." },
    { id: "int108-u6-62", unit: 6, topic: 'Properties', difficulty: 'hard', questionType: 'MCQ', question: "How to define a setter for 'p'?", options: ["@p.setter", "@set_p", "@setter(p)", "None"], correctAnswer: 0, explanation: "Requires first having @property getter." },
    { id: "int108-u6-63", unit: 6, topic: 'Class vs static', difficulty: 'hard', questionType: 'MCQ', question: "Class method receives ___.", options: ["Class reference (cls)", "Instance (self)", "Nothing", "None"], correctAnswer: 0, explanation: "Commonly used for factory methods." },
    { id: "int108-u6-64", unit: 6, topic: 'Static', difficulty: 'medium', questionType: 'MCQ', question: "Static method receives ___.", options: ["Nothing specific", "self", "cls", "None"], correctAnswer: 0, explanation: "Just a function namespace inside a class." },
    { id: "int108-u6-65", unit: 6, topic: 'Garbage', difficulty: 'medium', questionType: 'MCQ', question: "Does __del__ run immediately when del obj is called?", options: ["No (When ref count is 0)", "Yes", "Depends on OS", "None"], correctAnswer: 0, explanation: "del just removes a pointer." },
    { id: "int108-u6-66", unit: 6, topic: 'Logic', difficulty: 'easy', questionType: 'MCQ', question: "Can object exist without a class?", options: ["No", "Yes", "Only in dynamic languages", "None"], correctAnswer: 0, explanation: "Classes are the genesis." },
    { id: "int108-u6-67", unit: 6, topic: 'Attributes', difficulty: 'medium', questionType: 'MCQ', question: "Can you add attribute to object later?", options: ["Yes (obj.new = 5)", "No", "Only if class allowed", "None"], correctAnswer: 0, explanation: "Python is highly dynamic." },
    { id: "int108-u6-68", unit: 6, topic: 'Internal', difficulty: 'medium', questionType: 'MCQ', question: "All classes in Python 3 inherit from ___?", options: ["object", "BaseClass", "None", "Any"], correctAnswer: 0, explanation: "Universal ancestor." },
    { id: "int108-u6-69", unit: 6, topic: 'MRO', difficulty: 'hard', questionType: 'MCQ', question: "Check MRO command?", options: ["Class.mro()", "Class.__mro__", "Both", "None"], correctAnswer: 2, explanation: "Inspection tools." },
    { id: "int108-u6-70", unit: 6, topic: 'Encapsulation', difficulty: 'hard', questionType: 'MCQ', question: "Does Python have strict 'private' access?", options: ["No (But naming mangle makes it harder)", "Yes", "Only for methods", "None"], correctAnswer: 0, explanation: "One can still access _Class__private." },
    { id: "int108-u6-71", unit: 6, topic: 'Encapsulation', difficulty: 'medium', questionType: 'MCQ', question: "Aim of getter/setter?", options: ["Control access / Validation", "Speed", "Coloring", "None"], correctAnswer: 0, explanation: "Encapsulation principle." },
    { id: "int108-u6-72", unit: 6, topic: 'Design Patterns', difficulty: 'hard', questionType: 'MCQ', question: "Which pattern uses single instance?", options: ["Singleton", "Factory", "Observer", "None"], correctAnswer: 0, explanation: "Restricts instantiation." },
    { id: "int108-u6-73", unit: 6, topic: 'Logic', difficulty: 'easy', questionType: 'MCQ', question: "Are classes objects too?", options: ["Yes", "No", "Only if instantiated", "None"], correctAnswer: 0, explanation: "Everything in Python is an object." },
    { id: "int108-u6-74", unit: 6, topic: 'Call', difficulty: 'hard', questionType: 'MCQ', question: "Method to make object callable like func?", options: ["__call__", "__exec__", "__run__", "None"], correctAnswer: 0, explanation: "obj() invokes this." },
    { id: "int108-u6-75", unit: 6, topic: 'Logic', difficulty: 'easy', questionType: 'MCQ', question: "Is __init__ called for every new object?", options: ["Yes", "No", "Only first 100", "None"], correctAnswer: 0, explanation: "Mandatory startup logic." },
    { id: "int108-u6-76", unit: 6, topic: 'Exceptions', difficulty: 'medium', questionType: 'MCQ', question: "Attributes not found error?", options: ["AttributeError", "NameError", "TypeError", "None"], correctAnswer: 0, explanation: "Common in OOP." },
    { id: "int108-u6-77", unit: 6, topic: 'Naming', difficulty: 'medium', questionType: 'MCQ', question: "Leading underscore convention means?", options: ["Internal/Private use", "Global", "Public", "None"], correctAnswer: 0, explanation: "'Keep your hands off' sign." },
    { id: "int108-u6-78", unit: 6, topic: 'OOP', difficulty: 'easy', questionType: 'MCQ', question: "DRY stands for?", options: ["Don't Repeat Yourself", "Data Real Yield", "None", "Both"], correctAnswer: 0, explanation: "Goal of functions/classes." },
    { id: "int108-u6-79", unit: 6, topic: 'Inheritance', difficulty: 'easy', questionType: 'MCQ', question: "Sibling classes?", options: ["Share same parent", "Different parents", "None", "Both"], correctAnswer: 0, explanation: "Tree terminology." },
    { id: "int108-u6-80", unit: 6, topic: 'Memory', difficulty: 'hard', questionType: 'MCQ', question: "Does 'self' use memory?", options: ["It's just a reference", "Yes", "None", "Depends"], correctAnswer: 0, explanation: "Points to existing object memory." },
    { id: "int108-u6-81", unit: 6, topic: 'Operator', difficulty: 'medium', questionType: 'MCQ', question: "Method for multiplication '*'?", options: ["__mul__", "__times__", "__star__", "None"], correctAnswer: 0, explanation: "Multiplication magic method." },
    { id: "int108-u6-82", unit: 6, topic: 'Operator', difficulty: 'medium', questionType: 'MCQ', question: "Method for division '/'?", options: ["__truediv__", "__div__", "Both", "None"], correctAnswer: 0, explanation: "Standard division." },
    { id: "int108-u6-83", unit: 6, topic: 'Operator', difficulty: 'medium', questionType: 'MCQ', question: "Method for floor division '//'?", options: ["__floordiv__", "__slash__", "None", "Both"], correctAnswer: 0, explanation: "Integer division." },
    { id: "int108-u6-84", unit: 6, topic: 'Operator', difficulty: 'medium', questionType: 'MCQ', question: "Method for 'in' checking?", options: ["__contains__", "__has__", "Both", "None"], correctAnswer: 0, explanation: "Membership overload." },
    { id: "int108-u6-85", unit: 6, topic: 'Mapping', difficulty: 'hard', questionType: 'MCQ', question: "Can a class represent a dictionary?", options: ["Yes (implement __getitem__)", "No", "Only if inherited", "None"], correctAnswer: 0, explanation: "Custom mapping types." },
    { id: "int108-u6-86", unit: 6, topic: 'Pickle', difficulty: 'hard', questionType: 'MCQ', question: "Can most objects be pickled?", options: ["Yes", "No", "Only if small", "None"], correctAnswer: 0, explanation: "Serializing state." },
    { id: "int108-u6-87", unit: 6, topic: 'Hierarchy', difficulty: 'easy', questionType: 'MCQ', question: "Is Exception a class?", options: ["Yes", "No", "Function", "None"], correctAnswer: 0, explanation: "Fundamental OOP use case." },
    { id: "int108-u6-88", unit: 6, topic: 'Keywords', difficulty: 'medium', questionType: 'MCQ', question: "Is 'this' valid in Python?", options: ["It is not a keyword (Use self!)", "Yes", "Depends", "None"], correctAnswer: 0, explanation: "Don't confuse with Java." },
    { id: "int108-u6-89", unit: 6, topic: 'Construction', difficulty: 'hard', questionType: 'MCQ', question: "What is instantiating?", options: ["Creating an object from class", "Building PC", "Deleting code", "None"], correctAnswer: 0, explanation: "Class -> Instance flow." },
    { id: "int108-u6-90", unit: 6, topic: 'Variables', difficulty: 'easy', questionType: 'MCQ', question: "Are methods required?", options: ["No (Can have data-only classes)", "Yes", "Only for 3.x", "None"], correctAnswer: 0, explanation: "Classes can be simple containers." },
    { id: "int108-u6-91", unit: 6, topic: 'Abstract', difficulty: 'hard', questionType: 'MCQ', question: "Abstract method must be?", options: ["Overridden in child", "Deleted", "Fast", "None"], correctAnswer: 0, explanation: "Provides the signature but no body." },
    { id: "int108-u6-92", unit: 6, topic: 'Context', difficulty: 'hard', questionType: 'MCQ', question: "Using object in 'with' statement needs?", options: ["__enter__ and __exit__", "__init__", "None", "Both"], correctAnswer: 0, explanation: "Context manager protocol." },
    { id: "int108-u6-93", unit: 6, topic: 'Memory', difficulty: 'hard', questionType: 'MCQ', question: "Weak references module?", options: ["weakref", "ref", "memory", "None"], correctAnswer: 0, explanation: "Allows object cleanup even if ref exists." },
    { id: "int108-u6-94", unit: 6, topic: 'Docstrings', difficulty: 'easy', questionType: 'MCQ', question: "Can classes have docstrings?", options: ["Yes", "No", "Only if 10 lines", "None"], correctAnswer: 0, explanation: "Documentation is standard." },
    { id: "int108-u6-95", unit: 6, topic: 'Reflection', difficulty: 'hard', questionType: 'MCQ', question: "Get class from obj?", options: ["type(obj)", "obj.class", "obj.__class__", "Both A and C"], correctAnswer: 3, explanation: "Inspection tools." },
    { id: "int108-u6-96", unit: 6, topic: 'Static', difficulty: 'medium', questionType: 'MCQ', question: "Do class variables save memory?", options: ["Yes (Once per class vs once per instance)", "No", "Depends", "None"], correctAnswer: 0, explanation: "Reduces data duplication." },
    { id: "int108-u6-97", unit: 6, topic: 'Internal', difficulty: 'hard', questionType: 'MCQ', question: "Is '__init__.py' a class?", options: ["No, it's a module", "Yes", "None", "Both"], correctAnswer: 0, explanation: "Part of package structure." },
    { id: "int108-u6-98", unit: 6, topic: 'Operators', difficulty: 'medium', questionType: 'MCQ', question: "Is subtraction overloaded by __sub__?", options: ["Yes", "No", "None", "Both"], correctAnswer: 0, explanation: "Standard magic name." },
    { id: "int108-u6-99", unit: 6, topic: 'Identity', difficulty: 'easy', questionType: 'MCQ', question: "Is 'obj' a pointer?", options: ["Technically yes (Memory address)", "No", "None", "Both"], correctAnswer: 0, explanation: "References are pointers under the hood." },
    { id: "int108-u6-100", unit: 6, topic: 'Coding Style', difficulty: 'medium', questionType: 'MCQ', question: "What is PascalCase?", options: ["StartingWordsWithCaps (For classes)", "underscores", "camelCase", "None"], correctAnswer: 0, explanation: "Standard for classes." }
];

export const int108Unit6Coding: QuizQuestion[] = [
    {
        id: `int108-u6-coding-1`,
        unit: 6,
        topic: `Banking System (Logic Building)`,
        difficulty: `hard`,
        type: `coding`,
        question: `Create a class 'BankAccount' with an __init__ method that sets the 'balance' (default 0). Implement methods 'deposit(amount)' and 'withdraw(amount)'. If withdrawal amount is greater than balance, print 'Insufficient Funds'. Finally, print the current balance.`,
        starterCode: `class BankAccount:
    def __init__(self, balance=0):
        self.balance = balance
    
    # Write deposit and withdraw methods here

# Test Logic
acc = BankAccount(100)
acc.deposit(int(input()))
acc.withdraw(int(input()))
print(acc.balance)`,
        testCases: [
            { "input": "50\n30", "output": "120" },
            { "input": "0\n200", "output": "Insufficient Funds\n100" },
            { "input": "1000\n500", "output": "600", "isHidden": true }
        ],
        explanation: `Encapsulate logic within the class and handle edge cases for withdrawals.`
    },
    {
        id: `int108-u6-coding-2`,
        unit: 6,
        topic: `Geometry (Inheritance)`,
        difficulty: `hard`,
        type: `coding`,
        question: `Create a base class 'Shape' with a method 'area' that returns 0. Create a child class 'Square' that inherits from 'Shape', takes 'side' as input in __init__, and overrides the 'area' method to return side*side.`,
        starterCode: `class Shape:
    def area(self): return 0

# Your Square class here

s = Square(int(input()))
print(s.area())`,
        testCases: [
            { "input": "5", "output": "25" },
            { "input": "10", "output": "100" },
            { "input": "1", "output": "1", "isHidden": true }
        ],
        explanation: `Demonstrate method overriding and inheritance principles.`
    },
    {
        id: `int108-u6-coding-3`,
        unit: 6,
        topic: `Operator Overloading`,
        difficulty: `hard`,
        type: `coding`,
        question: `Create a class 'Vector' that takes 'x' and 'y' coordinates. Overload the addition '+' operator (using __add__) so that two vectors can be added. The result of adding Vector(x1, y1) and Vector(x2, y2) should be a new Vector(x1+x2, y1+y2). Print the resulting coordinates.`,
        starterCode: `class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    # Overload + operator here

v1 = Vector(int(input()), int(input()))
v2 = Vector(int(input()), int(input()))
v3 = v1 + v2
print(f"{v3.x}, {v3.y}")`,
        testCases: [
            { "input": "1\n2\n3\n4", "output": "4, 6" },
            { "input": "0\n0\n0\n0", "output": "0, 0" },
            { "input": "-5\n10\n5\n-10", "output": "0, 0", "isHidden": true }
        ],
        explanation: `Standard use of the __add__ magic method for operator overloading.`
    },
    {
        id: `int108-u6-coding-4`,
        unit: 6,
        topic: `Class Variables`,
        difficulty: `medium`,
        type: `coding`,
        question: `Create a class 'Employee' where each instance has a 'name'. Maintain a class variable 'count' that increments every time a new Employee instance is created. Print the final count after creating two employees.`,
        starterCode: `class Employee:
    count = 0
    def __init__(self, name):
        self.name = name
        # Increment class variable here

e1 = Employee("Alice")
e2 = Employee("Bob")
print(Employee.count)`,
        testCases: [
            { "input": "", "output": "2" }
        ],
        explanation: `Class variables are shared across all instances of a class.`
    },
    {
        id: `int108-u6-coding-5`,
        unit: 6,
        topic: `Encapsulation (Getters/Setters)`,
        difficulty: `hard`,
        type: `coding`,
        question: `Create a class 'Student' with a private attribute '__grade'. Implement a property 'grade' (using @property) to get the grade and a setter to set the grade, but only if it's between 0 and 100. If invalid, keep the previous grade.`,
        starterCode: `class Student:
    def __init__(self):
        self.__grade = 0
    
    # Implementation here

s = Student()
s.grade = int(input())
s.grade = 500 # Should be ignored
print(s.grade)`,
        testCases: [
            { "input": "85", "output": "85" },
            { "input": "-10", "output": "0" },
            { "input": "100", "output": "100", "isHidden": true }
        ],
        explanation: `Use @property and @grade.setter for controlled attribute access.`
    }
];
