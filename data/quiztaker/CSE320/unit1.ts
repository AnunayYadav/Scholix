import { QuizQuestion } from "../../../types.ts";

export const cse320Unit1MCQs: QuizQuestion[] = [
    {
        unit: 1,
        question: "What is the primary goal of Software Engineering?",
        options: ["Writing code as fast as possible", "Creating high-quality software in a systematic, disciplined, and quantifiable manner", "Learning new programming languages", "Fixing bugs in existing software"],
        correctAnswer: 1,
        explanation: "Software Engineering is about applying engineering principles to software development to ensure quality, reliability, and maintainability."
    },
    {
        unit: 1,
        question: "Which of the following is NOT a phase of the Software Development Life Cycle (SDLC)?",
        options: ["Requirement Gathering", "System Design", "Hardware Manufacturing", "Testing and Integration"],
        correctAnswer: 2,
        explanation: "Hardware manufacturing is part of hardware engineering, not the standard software development life cycle."
    },
    {
        unit: 1,
        question: "The 'Waterfall Model' is best described as:",
        options: ["A model where phases overlap continuously", "A sequential, linear approach to software development", "A model used only for small AI projects", "An iterative model with multiple cycles"],
        correctAnswer: 1,
        explanation: "Waterfall follows a strictly linear progression where each phase must be completed before the next begins."
    },
    {
        unit: 1,
        question: "What is the main advantage of the 'Prototyping Model'?",
        options: ["It is the cheapest model", "It allows for early user feedback and helps in identifying missing requirements", "It requires no documentation", "It is faster than any other model"],
        correctAnswer: 1,
        explanation: "Creating a prototype helps stakeholders visualize the product and clarify requirements early on."
    },
    {
        unit: 1,
        question: "The 'Spiral Model' is uniquely known for its focus on:",
        options: ["Rapid coding", "Risk Analysis and Management", "Minimizing documentation", "Using only one team member"],
        correctAnswer: 1,
        explanation: "The Spiral model is an evolutionary model that incorporates risk assessment at every iteration."
    },
    {
        unit: 1,
        question: "In Agile methodology, a 'Sprint' usually lasts for:",
        options: ["1 day", "2 to 4 weeks", "6 months", "1 year"],
        correctAnswer: 1,
        explanation: "Sprints are short-duration iterations (typically 2-4 weeks) used to deliver incremental features."
    },
    {
        unit: 1,
        question: "Which model is represented by the 'V-shape' where testing is planned alongside development phases?",
        options: ["Waterfall", "Spiral", "V-Model (Verification and Validation Model)", "Agile"],
        correctAnswer: 2,
        explanation: "The V-Model maps each development stage directly to a corresponding testing stage."
    },
    {
        unit: 1,
        question: "What does SRS stand for in Software Engineering?",
        options: ["Software Requirement Specification", "System Repair Schedule", "Standardised Requirement Solution", "Software Routine Sequence"],
        correctAnswer: 0,
        explanation: "SRS is the foundational document that describes exactly what the software should do."
    },
    {
        unit: 1,
        question: "Which of the following is a 'Non-functional Requirement'?",
        options: ["The system must allow users to reset passwords", "The system should load a page within 2 seconds", "The system must generate a monthly report", "The system should allow users to add items to a cart"],
        correctAnswer: 1,
        explanation: "Performance, security, and usability are non-functional (how it performs), while features are functional (what it does)."
    },
    {
        unit: 1,
        question: "The 'Agile Manifesto' prioritizes which of the following?",
        options: ["Processes and tools over individuals", "Comprehensive documentation over working software", "Responding to change over following a plan", "Contract negotiation over customer collaboration"],
        correctAnswer: 2,
        explanation: "One of the four core values of Agile is 'Responding to change over following a plan'."
    },
    {
        unit: 1,
        question: "What is the primary purpose of 'Requirement Gathering'?",
        options: ["To start coding immediately", "To understand the needs and constraints of stakeholders", "To decide the budget of the project", "To hire the right developers"],
        correctAnswer: 1,
        explanation: "Requirement gathering aims to bridge the gap between user needs and technical specifications."
    },
    {
        unit: 1,
        question: "In Scrum, who is responsible for maintaining the Product Backlog?",
        options: ["Scrum Master", "Development Team", "Product Owner", "Stakeholders"],
        correctAnswer: 2,
        explanation: "The Product Owner is responsible for defining and prioritizing items in the Product Backlog."
    },
    {
        unit: 1,
        question: "What is 'DevOps' in the context of the software lifecycle?",
        options: ["A specific programming language", "A culture or practice that unifies software development (Dev) and software operation (Ops)", "A type of database", "A testing tool"],
        correctAnswer: 1,
        explanation: "DevOps aims to shorten the development life cycle and provide continuous delivery with high quality."
    },
    {
        unit: 1,
        question: "Which of these is a characteristic of a 'Good Requirement'?",
        options: ["Ambiguous", "Testable", "Incomplete", "Complex"],
        correctAnswer: 1,
        explanation: "Requirements must be testable to verify that the implementation meets the specification."
    },
    {
        unit: 1,
        question: "The 'Waterfall Model' is most suitable for projects where:",
        options: ["Requirements are constantly changing", "Requirements are well-defined and stable", "The project is very large and risky", "Fast release is the only goal"],
        correctAnswer: 1,
        explanation: "Waterfall works best when the scope is fixed and unlikely to change during development."
    },
    {
        unit: 1,
        question: "What is 'Feasibility Study' in the requirement engineering process?",
        options: ["Writing the entire code", "Determining if the project should be undertaken based on cost, time, and tech constraints", "Testing the final product", "Selling the product to users"],
        correctAnswer: 1,
        explanation: "It assesses whether the project is worth the investment before committing resources."
    },
    {
        unit: 1,
        question: "Which of the following is a characteristic of Agile development?",
        options: ["Big Design Up Front (BDUF)", "Incremental and Iterative development", "Heavy documentation", "Long cycles between releases"],
        correctAnswer: 1,
        explanation: "Agile focuses on delivering small pieces of working software frequently."
    },
    {
        unit: 1,
        question: "In the 'V-Model', which testing phase is performed last?",
        options: ["Unit Testing", "Integration Testing", "System Testing", "Acceptance Testing"],
        correctAnswer: 3,
        explanation: "Acceptance testing is the final phase where the customer verifies if the system meets their business needs."
    },
    {
        unit: 1,
        question: "What is the 'IEEE standard' often used for writing SRS?",
        options: ["IEEE 802.11", "IEEE 830", "IEEE 754", "IEEE 1394"],
        correctAnswer: 1,
        explanation: "IEEE 830 is a widely recognized standard for preparing Software Requirement Specifications."
    },
    {
        unit: 1,
        question: "Which of the following is a type of 'Requirement Validation' technique?",
        options: ["Coding", "Requirement Review/Inspection", "Unit Testing", "Deployment"],
        correctAnswer: 1,
        explanation: "Reviews and inspections help ensure that the requirements are correct, consistent, and complete."
    },
    {
        unit: 1,
        question: "Which document defines the scope of the project and serves as a contract between the developer and the customer?",
        options: ["Source code", "SRS (Software Requirement Specification)", "Testing plan", "User Manual"],
        correctAnswer: 1,
        explanation: "The SRS contains all functional and non-functional requirements and acts as a baseline."
    },
    {
        unit: 1,
        question: "In the 'Waterfall Model', when is testing started?",
        options: ["Alongside coding", "Before requirement gathering", "After the implementation/coding phase is complete", "It is never done"],
        correctAnswer: 2,
        explanation: "In Waterfall, testing only begins after the previous development phase (Implementation) is finished."
    },
    {
        unit: 1,
        question: "What is 'Requirement Elicitation'?",
        options: ["Deleting old requirements", "The process of gathering requirements from stakeholders", "Writing the code", "Designing the database"],
        correctAnswer: 1,
        explanation: "Elicitation is the first step of requirement engineering where we 'extract' needs from users."
    },
    {
        unit: 1,
        question: "Which model is also known as the 'Linear Sequential Model'?",
        options: ["Agile", "Spiral", "Waterfall", "Iterative"],
        correctAnswer: 2,
        explanation: "Waterfall is linear and sequential by nature."
    },
    {
        unit: 1,
        question: "Which phase of SDLC involves creating the 'High-Level Design' (HLD)?",
        options: ["Requirements", "Design", "Implementation", "Maintenance"],
        correctAnswer: 1,
        explanation: "The Design phase transforms requirements into a technical blueprint, including architecture."
    },
    {
        unit: 1,
        question: "In Agile, what is a 'User Story'?",
        options: ["A long novel about software", "A short, simple description of a feature told from the perspective of the user", "A bug report", "A developer's daily log"],
        correctAnswer: 1,
        explanation: "User stories follow the format: 'As a [user], I want [goal] so that [reason]'."
    },
    {
        unit: 1,
        question: "Which of the following describes 'Verification'?",
        options: ["Are we building the right product?", "Are we building the product right?", "Does the user like the product?", "Is the product affordable?"],
        correctAnswer: 1,
        explanation: "Verification checks if the software conforms to specifications (Are we building it right?)."
    },
    {
        unit: 1,
        question: "Which of the following describes 'Validation'?",
        options: ["Are we building the right product?", "Are we building the product right?", "Are there any bugs?", "Is the code efficient?"],
        correctAnswer: 0,
        explanation: "Validation ensures the software meets user needs (Are we building the right product?)."
    },
    {
        unit: 1,
        question: "What is the 'Scrum Master' responsible for?",
        options: ["Writing all the code", "Managing the product backlog", "Facilitating the scrum process and removing impediments", "Deciding the project budget"],
        correctAnswer: 2,
        explanation: "The Scrum Master is a coach for the team, ensuring Scrum practices are followed."
    },
    {
        unit: 1,
        question: "The 'Waterfall Model' is highly criticized for its 'Blocked State'. What does this mean?",
        options: ["The computer stops working", "The developer cannot start the next phase until the previous one is fully finished", "The code is encrypted", "The user cannot access the website"],
        correctAnswer: 1,
        explanation: "The rigid sequence means delays in one phase block all future work."
    },
    {
        unit: 1,
        question: "Which SDLC model is used when the requirements are not very clear at the start?",
        options: ["Waterfall", "Prototyping", "Strict Sequential", "V-Model"],
        correctAnswer: 1,
        explanation: "Prototyping helps clarify requirements through early iteration."
    },
    {
        unit: 1,
        question: "What is an 'Iterative' model?",
        options: ["A model that finishes everything in one go", "A model that develops a system through repeated cycles (iterations)", "A model that uses only one developer", "A model that doesn't use any testing"],
        correctAnswer: 1,
        explanation: "Iteration allows the software to evolve and improve over time."
    },
    {
        unit: 1,
        question: "Which of these is a 'Functional Requirement'?",
        options: ["The system should be secure", "The system must allow a user to register with an email", "The system should be reliable", "The system must have high availability"],
        correctAnswer: 1,
        explanation: "Registration is a specific behavior/task the system must perform."
    },
    {
        unit: 1,
        question: "Which model uses 'Quadrants' to represent activities like planning, risk analysis, engineering, and evaluation?",
        options: ["Waterfall", "V-Model", "Spiral", "Prototyping"],
        correctAnswer: 2,
        explanation: "The Spiral model visits these four quadrants in every loop."
    },
    {
        unit: 1,
        question: "What is the primary drawback of the 'Spiral Model'?",
        options: ["It is too fast", "It can be expensive and requires expert risk assessment", "It has no documentation", "It is for small projects only"],
        correctAnswer: 1,
        explanation: "Because of the frequent risk analysis and iterations, it is costly and complex to manage."
    },
    {
        unit: 1,
        question: "Which document contains the 'Traceability Matrix'?",
        options: ["Source code", "SRS", "Unit Test cases", "Project Plan"],
        correctAnswer: 1,
        explanation: "A Traceability Matrix maps requirements to design and test cases to ensure all needs are covered."
    },
    {
        unit: 1,
        question: "What is 'Software Evolution'?",
        options: ["The process of software changing over time to fix bugs and meet new requirements", "The history of the first computer", "The process of hardware becoming faster", "Deleting old versions of software"],
        correctAnswer: 0,
        explanation: "Lehman's laws describe how software must adapt or become progressive less useful."
    },
    {
        unit: 1,
        question: "In Scrum, what happens during the 'Daily Stand-up'?",
        options: ["Developers sleep", "Developers discuss what they did yesterday, what they will do today, and any blockers", "The client gives new requirements", "The project is officially finished"],
        correctAnswer: 1,
        explanation: "It's a synchronization meeting to keep the sprint on track."
    },
    {
        unit: 1,
        question: "Which model is best for a project with many high-risk features?",
        options: ["Waterfall", "Spiral", "V-Model", "Simple Iterative"],
        correctAnswer: 1,
        explanation: "Spiral's core strength is risk identification and management."
    },
    {
        unit: 1,
        question: "What is 'Requirement Negotiation'?",
        options: ["Buying software from a vendor", "Resolving conflicts between stakeholders regarding conflicting needs", "Paying developers extra", "Skipping requirements to save time"],
        correctAnswer: 1,
        explanation: "It's the process of reaching an agreement when stakeholders have different priorities."
    }
];
