import { QuizQuestion } from "../../../types.ts";

export const cse121Unit1MCQs: QuizQuestion[] = [
    {
        unit: 1,
        question: "What is the primary goal of Data Science?",
        options: ["To store as much data as possible", "To extract meaningful insights and knowledge from structured and unstructured data", "To write complex SQL queries only", "To build faster computers"],
        correctAnswer: 1,
        explanation: "Data science combines domain expertise, programming skills, and knowledge of mathematics and statistics to extract meaningful insights.",
difficulty: 'easy',
topic: 'Job roles and skillset for Data science and Big data'
    },
    {
        unit: 1,
        question: "The '3 Vs' of Big Data typically represent:",
        options: ["Variety, Velocity, and Volume", "Validity, Veracity, and Value", "Vision, Venture, and Volume", "Velocity, Virus, and Volume"],
        correctAnswer: 0,
        explanation: "Volume (amount of data), Velocity (speed of data), and Variety (types of data) are the fundamental characteristics of Big Data.",
difficulty: 'easy',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "Which of the following describes 'Velocity' in Big Data?",
        options: ["The total size of the dataset", "The rate at which data is generated and processed", "The diversity of data formats", "The accuracy of the data collected"],
        correctAnswer: 1,
        explanation: "Velocity refers to the high speed at which data is being generated and the need to process it quickly.",
difficulty: 'easy',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "Which tool is commonly used for data visualization in Data Science?",
        options: ["Apache Hadoop", "Tableau", "Notepad", "Wireshark"],
        correctAnswer: 1,
        explanation: "Tableau is a powerful data visualization tool used to create interactive charts and dashboards.",
difficulty: 'easy',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "An open-source framework that allows for the distributed processing of large data sets across clusters of computers is:",
        options: ["Microsoft Word", "Apache Hadoop", "Adobe Photoshop", "VLC Player"],
        correctAnswer: 1,
        explanation: "Hadoop uses the MapReduce programming model to process vast amounts of data in parallel.",
difficulty: 'medium',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "In the Data Science lifecycle, 'Data Cleaning' involves:",
        options: ["Deleting all the data", "Removing or correcting inaccurate, incomplete, or incorrectly formatted data", "Buying new hard drives", "Printing the data for physical review"],
        correctAnswer: 1,
        explanation: "Data cleaning (or scrubbing) is a critical step to ensure the quality and reliability of the analysis results.",
difficulty: 'easy',
topic: 'Data science Lifecycle with use case'
    },
    {
        unit: 1,
        question: "What does 'Veracity' refer to in the context of Big Data?",
        options: ["The speed of data generation", "The uncertainty or quality/trustworthiness of the data", "The cost of data storage", "The color coding of data points"],
        correctAnswer: 1,
        explanation: "Veracity deals with the inconsistencies and biases in data, which can affect the accuracy of insights.",
difficulty: 'easy',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "Which of the following is a programming language widely used for statistical computing and graphics in Data Science?",
        options: ["C++", "R", "Assembly", "HTML"],
        correctAnswer: 1,
        explanation: "R is a language and environment specifically designed for statistical analysis and data visualization.",
difficulty: 'medium',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "What is 'Big Data on the Cloud'?",
        options: ["Data stored on weather satellites", "Leveraging cloud computing platforms (like AWS or Azure) to store and process large datasets", "Data that can only be accessed on rainy days", "The physical weight of data centers"],
        correctAnswer: 1,
        explanation: "Cloud platforms provide scalable storage and compute power necessary for handling Big Data without physical infrastructure constraints.",
difficulty: 'easy',
topic: 'Big Data on the Cloud'
    },
    {
        unit: 1,
        question: "Which role is primarily responsible for building and maintaining the infrastructure for data collection and processing?",
        options: ["Data Scientist", "Data Engineer", "Graphic Designer", "Marketing Manager"],
        correctAnswer: 1,
        explanation: "Data Engineers focus on the architecture and pipelines that make data available for scientists to analyze.",
difficulty: 'medium',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "Which of the following is an application of Big Data in healthcare?",
        options: ["Predictive analytics for disease outbreaks", "Streaming music", "Online gaming", "Designing office furniture"],
        correctAnswer: 0,
        explanation: "Big Data helps identify patterns in health records to predict and manage outbreaks or patient risks.",
difficulty: 'easy',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "The 'Variety' dimension of Big Data refers to:",
        options: ["Data from a single source only", "The different formats of data (structured, semi-structured, and unstructured)", "The price of different data sets", "The number of users accessing the data"],
        correctAnswer: 1,
        explanation: "Variety encompasses diverse data sources like text, images, videos, and sensor data.",
difficulty: 'easy',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "What is a 'Data Set' in the context of Data Science?",
        options: ["A collection of related data", "A piece of hardware", "A type of internet connection", "A software license"],
        correctAnswer: 0,
        explanation: "A dataset is the fundamental unit of data analyzed by data scientists.",
difficulty: 'easy',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "Which skill is essential for a Data Scientist?",
        options: ["Public speaking for politicians", "Proficiency in mathematics and statistics", "Advanced cooking skills", "Playing musical instruments"],
        correctAnswer: 1,
        explanation: "Math and stats are the core foundations for building predictive models and interpreting data.",
difficulty: 'easy',
topic: 'Skill needed for Big data'
    },
    {
        unit: 1,
        question: "What is the 'MapReduce' model in Hadoop used for?",
        options: ["Creating maps and directions", "Processing large amounts of data in parallel across many servers", "Reducing the physical size of servers", "Encrypting emails"],
        correctAnswer: 1,
        explanation: "MapReduce splits big tasks into smaller ones (Map) and then collects the results (Reduce).",
difficulty: 'easy',
topic: 'Tools usage like Apache Hadoop'
    },
    {
        unit: 1,
        question: "Unstructured data refers to:",
        options: ["Data in neat tables and rows", "Data without a pre-defined data model, like videos and social media posts", "Corrupted data that cannot be read", "Data that is only stored in RAM"],
        correctAnswer: 1,
        explanation: "Most big data is unstructured, requiring specialized tools for analysis unlike traditional SQL databases.",
difficulty: 'easy',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "Which of the following is a challenge of Big Data?",
        options: ["Data Privacy and Security", "Storage Costs", "Complexity in processing", "All of the above"],
        correctAnswer: 3,
        explanation: "Handling vast amounts of data brings significant overhead in security, cost, and technical complexity.",
difficulty: 'easy',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "What does 'Value' refer to in Big Data (sometimes called the 5th V)?",
        options: ["The cost of purchasing the data", "The actual benefit or insight derived from the data analysis", "The stock price of the data provider", "The number of bits in the file"],
        correctAnswer: 1,
        explanation: "Big data is useless unless it provides actionable insights that add value to an organization.",
difficulty: 'easy',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "Which tool is commonly used for basic data manipulation and analysis in small to medium datasets?",
        options: ["Adobe Reader", "Microsoft Excel", "Steam", "Discord"],
        correctAnswer: 1,
        explanation: "Excel remains a foundational tool for data preparation and quick statistical analysis.",
difficulty: 'medium',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "The role of a 'Data Analyst' is primarily to:",
        options: ["Design the server hardware", "Analyze data and create reports to help make decisions", "Write the front-end code for the website", "Manage the company's social media accounts"],
        correctAnswer: 1,
        explanation: "Analyst roles focus on interpreting current data trends to provide business insights.",
difficulty: 'easy',
topic: 'Job roles and skillset for Data science and Big data'
    },
    {
        unit: 1,
        question: "Which of the following is an example of Unstructured Data?",
        options: ["An Excel spreadsheet with names and ages", "A SQL database of customer transactions", "A collection of random social media videos and images", "A CSV file of temperatures"],
        correctAnswer: 2,
        explanation: "Unstructured data doesn't follow a fixed format, making it harder to analyze with traditional tools.",
difficulty: 'easy',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "What does 'Data Mining' involve?",
        options: ["Physically digging for computer parts", "Discovering hidden patterns and relationships in large datasets", "Deleting duplicated files", "Writing data to a CD"],
        correctAnswer: 1,
        explanation: "Data mining uses algorithms to find non-obvious patterns within data.",
difficulty: 'easy',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "Which of the following is a key phase in the 'Data Science Life Cycle'?",
        options: ["Business Understanding", "Data Preparation", "Modeling", "All of the above"],
        correctAnswer: 3,
        explanation: "The lifecycle (often called CRISP-DM) involves understanding the goal, preparing the data, and building models.",
difficulty: 'medium',
topic: 'Data science Lifecycle with use case'
    },
    {
        unit: 1,
        question: "What is 'Exploratory Data Analysis' (EDA)?",
        options: ["The process of cleaning data only", "Analyzing datasets to summarize their main characteristics, often with visual methods", "Building a neural network", "Searching for data on Google"],
        correctAnswer: 1,
        explanation: "EDA helps understand what the data looks like before formal modeling.",
difficulty: 'easy',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "Which role focuses on presenting data insights to business leaders in a non-technical way?",
        options: ["Data Designer", "Data Storyteller / Analyst", "Server Administrator", "Network Engineer"],
        correctAnswer: 1,
        explanation: "Data storytelling involves communicating the 'so what' of the data effectively.",
difficulty: 'medium',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "Which of the following is NOT a 'Big Data' tool?",
        options: ["Apache Spark", "Hadoop", "Microsoft Paint", "NoSQL Databases"],
        correctAnswer: 2,
        explanation: "Paint is an image editor, not a data processing framework.",
difficulty: 'easy',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "The term 'Data Lake' refers to:",
        options: ["A physical lake where servers are kept cool", "A repository of data stored in its natural/raw format", "A type of water cooling system", "A very large data center"],
        correctAnswer: 1,
        explanation: "Data lakes hold massive amounts of raw data until it's needed for analysis.",
difficulty: 'easy',
topic: 'Skill needed for Big data'
    },
    {
        unit: 1,
        question: "What is 'Veracity' in Big Data?",
        options: ["The speed of data flow", "The volume of data", "The quality and accuracy of the data", "The cost of the data"],
        correctAnswer: 2,
        explanation: "Veracity measures how much we can trust the source and accuracy of the data.",
difficulty: 'easy',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "Which tool is primarily used for 'Predictive Analytics'?",
        options: ["Machine Learning algorithms", "Notepad", "Calculator", "Word Processor"],
        correctAnswer: 0,
        explanation: "Machine learning models predict future outcomes based on historical data.",
difficulty: 'easy',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "The term 'ETL' in data processing stands for:",
        options: ["Energy, Time, Logic", "Extract, Transform, Load", "Execute, Transfer, List", "Enter, Test, Log"],
        correctAnswer: 1,
        explanation: "ETL is the process of pulling data from sources, cleaning it, and putting it into a warehouse.",
difficulty: 'easy',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "Which of the following is a characteristic of 'Structured Data'?",
        options: ["Stored in tables with rows and columns", "Can be social media text", "Is always encrypted", "Only contains images"],
        correctAnswer: 0,
        explanation: "Structured data follows a rigid schema, making it easily searchable by SQL.",
difficulty: 'easy',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "What is the primary language used for querying data in relational databases?",
        options: ["HTML", "Python", "SQL", "Javascript"],
        correctAnswer: 2,
        explanation: "Structured Query Language (SQL) is the standard for managing data in databases.",
difficulty: 'medium',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "Which dimension of Big Data relates to the growth in number of data sources?",
        options: ["Volume", "Velocity", "Variety", "Veracity"],
        correctAnswer: 2,
        explanation: "Variety increases as data comes from more diverse places like IoT, mobile, and social media.",
difficulty: 'medium',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "What is a 'Data Warehouse'?",
        options: ["A physical building for computers", "A system used for reporting and data analysis, containing structured data only", "A cloud storage for personal photos", "A room where hard drives are sold"],
        correctAnswer: 1,
        explanation: "Data warehouses store processed and structured data specifically for business intelligence.",
difficulty: 'easy',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "Which of the following is a tool for big data processing that is faster than MapReduce?",
        options: ["Apache Spark", "Old Excel", "Pen and Paper", "Binary Search"],
        correctAnswer: 0,
        explanation: "Spark processes data in-memory, making it significantly faster than the disk-based MapReduce.",
difficulty: 'medium',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "What is 'Data Governance'?",
        options: ["The government controlling all data", "Rules and policies to ensure data is handled securely and correctly within an organization", "A type of software firewall", "The cost of data management"],
        correctAnswer: 1,
        explanation: "Governance ensures data quality, security, and compliant usage.",
difficulty: 'easy',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "The role of a 'Business Intelligence (BI) Developer' is to:",
        options: ["Write the company's annual report", "Build tools and dashboards that turn data into insights for business users", "Repair faulty hardware", "Create ads for the product"],
        correctAnswer: 1,
        explanation: "BI developers bridge the gap between complex data and business decision-making.",
difficulty: 'easy',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "Which of the following is an application of Big Data in 'Smart Cities'?",
        options: ["Traffic management optimization", "Personal web browsing", "Playing video games", "Sending private emails"],
        correctAnswer: 0,
        explanation: "Sensors and data analysis help optimize traffic light timing and public transport.",
difficulty: 'medium',
topic: 'Applications of data science/Big data'
    },
    {
        unit: 1,
        question: "What is 'Real-time Processing'?",
        options: ["Processing data after a week", "Processing data almost instantly as it is generated", "Processing data only on weekends", "Doing calculations by hand"],
        correctAnswer: 1,
        explanation: "Real-time processing is crucial for things like fraud detection in banking.",
difficulty: 'easy',
topic: 'Tools usage like Apache Hadoop'
    },
    {
        unit: 1,
        question: "Why is 'Domain Expertise' important for a Data Scientist?",
        options: ["To buy the best computers", "To understand the business context and ask the right questions about the data", "To win at trivia games", "To become a manager"],
        correctAnswer: 1,
        explanation: "Without understanding the field (e.g. medicine or finance), a scientist can't interpret the data correctly.",
difficulty: 'easy',
topic: 'Applications of data science/Big data'
    }
];
