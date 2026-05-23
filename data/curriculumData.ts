export interface SubjectMetadata {
  code: string;
  title: string;
  l: number;
  t: number;
  p: number;
  credits: number;
  type: string;    // e.g. CR, CE, LE, EM, OM, PW, TE, DE, APE
  nature: string;  // e.g. BSC, DSC, ESC, LCS, OEM, PRJ, PRC, EEA, PWE, SMN, TCS, TCF
  description?: string;
}

export interface ElectiveBasket {
  name: string;
  type: string;
  nature: string;
  subjects: SubjectMetadata[];
}

export interface TermDefinition {
  termNumber: number;
  termName: string;
  coreSubjects: SubjectMetadata[];
  electiveBaskets: ElectiveBasket[];
}

export interface ProgramCurriculum {
  programCode: string;
  programName: string;
  admissionYear: number;
  terms: TermDefinition[];
}

// B.Tech CSE 2025 Curriculum Schema
export const BTECH_CSE_2025: ProgramCurriculum = {
  programCode: "P132",
  programName: "BTech CSE",
  admissionYear: 2025,
  terms: [
    {
      termNumber: 1,
      termName: "Semester 1",
      coreSubjects: [
        { code: "CSE111", title: "Orientation to Computing-I", l: 2, t: 0, p: 0, credits: 2.0, type: "CR", nature: "DSC" },
        { code: "CSE326", title: "Internet Programming Laboratory", l: 0, t: 0, p: 3, credits: 2.0, type: "CR", nature: "DSC" },
        { code: "INT108", title: "Python Programming", l: 3, t: 0, p: 2, credits: 4.0, type: "CR", nature: "DSC" },
        { code: "MTH165", title: "Mathematics for Engineers", l: 3, t: 1, p: 0, credits: 4.0, type: "CR", nature: "BSC" }
      ],
      electiveBaskets: [
        {
          name: "Core Elective 1 Basket",
          type: "CE",
          nature: "BSC",
          subjects: [
            { code: "ECE249", title: "Basic Electrical and Electronics Engineering", l: 3, t: 0, p: 0, credits: 3.0, type: "CE", nature: "BSC" },
            { code: "MEC136", title: "Engineering Drawing with AutoCAD", l: 2, t: 2, p: 0, credits: 4.0, type: "CE", nature: "BSC" }
          ]
        },
        {
          name: "Core Elective 2 Basket",
          type: "CE",
          nature: "BSC",
          subjects: [
            { code: "CHE110", title: "Environmental Studies", l: 2, t: 0, p: 0, credits: 2.0, type: "CE", nature: "BSC" },
            { code: "PHY110", title: "Engineering Physics", l: 3, t: 0, p: 0, credits: 3.0, type: "CE", nature: "BSC" }
          ]
        },
        {
          name: "Core Elective 3 Basket",
          type: "CE",
          nature: "BSC",
          subjects: [
            { code: "ECE279", title: "Basic Electrical and Electronics Engineering Laboratory", l: 0, t: 0, p: 2, credits: 1.0, type: "CE", nature: "BSC" }
          ]
        }
      ]
    },
    {
      termNumber: 2,
      termName: "Semester 2",
      coreSubjects: [
        { code: "CSE101", title: "Computer Programming", l: 3, t: 0, p: 2, credits: 4.0, type: "CR", nature: "DSC" },
        { code: "CSE121", title: "Orientation to Computing-II", l: 2, t: 0, p: 0, credits: 2.0, type: "CR", nature: "DSC" },
        { code: "CSE320", title: "Software Engineering", l: 3, t: 0, p: 0, credits: 3.0, type: "CR", nature: "DSC" },
        { code: "INT306", title: "Database Management Systems", l: 3, t: 0, p: 2, credits: 4.0, type: "CR", nature: "DSC" },
        { code: "MTH166", title: "Differential Equations and Vector Calculus", l: 3, t: 1, p: 0, credits: 4.0, type: "CR", nature: "BSC" }
      ],
      electiveBaskets: [
        {
          name: "Core Elective 1 Basket",
          type: "CE",
          nature: "ESC",
          subjects: [
            { code: "ECE249", title: "Basic Electrical and Electronics Engineering", l: 3, t: 0, p: 0, credits: 3.0, type: "CE", nature: "ESC" },
            { code: "MEC136", title: "Engineering Drawing with AutoCAD", l: 2, t: 2, p: 0, credits: 4.0, type: "CE", nature: "ESC" }
          ]
        },
        {
          name: "Core Elective 2 Basket",
          type: "CE",
          nature: "BSC",
          subjects: [
            { code: "CHE110", title: "Environmental Studies", l: 2, t: 0, p: 0, credits: 2.0, type: "CE", nature: "BSC" },
            { code: "PHY110", title: "Engineering Physics", l: 3, t: 0, p: 0, credits: 3.0, type: "CE", nature: "BSC" }
          ]
        },
        {
          name: "Core Elective 3 Basket",
          type: "CE",
          nature: "BSC",
          subjects: [
            { code: "ECE279", title: "Basic Electrical and Electronics Engineering Laboratory", l: 0, t: 0, p: 2, credits: 1.0, type: "CE", nature: "BSC" }
          ]
        },
        {
          name: "Language Elective 1 Basket",
          type: "LE",
          nature: "LCS",
          subjects: [
            { code: "FRN601", title: "French Language Skills I", l: 1, t: 0, p: 3, credits: 3.0, type: "LE", nature: "LCS" },
            { code: "GER601", title: "German Language Skills I", l: 1, t: 0, p: 3, credits: 3.0, type: "LE", nature: "LCS" },
            { code: "JAP601", title: "Japanese Language Skills I", l: 1, t: 0, p: 3, credits: 3.0, type: "LE", nature: "LCS" },
            { code: "PEL121", title: "Communication Skills-I", l: 1, t: 0, p: 3, credits: 3.0, type: "LE", nature: "LCS" },
            { code: "PEL125", title: "Upper Intermediate Communication Skills-I", l: 1, t: 0, p: 3, credits: 3.0, type: "LE", nature: "LCS" },
            { code: "PEL130", title: "Advanced Communication Skills-I", l: 1, t: 0, p: 3, credits: 3.0, type: "LE", nature: "LCS" },
            { code: "SPA601", title: "Spanish Language Skills I", l: 1, t: 0, p: 3, credits: 3.0, type: "LE", nature: "LCS" }
          ]
        }
      ]
    },
    {
      termNumber: 3,
      termName: "Semester 3",
      coreSubjects: [
        { code: "CSE202", title: "Object Oriented Programming", l: 3, t: 0, p: 2, credits: 4.0, type: "CR", nature: "DSC" },
        { code: "CSE205", title: "Data Structures and Algorithms", l: 3, t: 0, p: 2, credits: 4.0, type: "CR1", nature: "DSC" },
        { code: "CSE306", title: "Computer Networks", l: 3, t: 0, p: 0, credits: 3.0, type: "CR1", nature: "DSC" },
        { code: "CSE307", title: "Internetworking Essentials", l: 0, t: 0, p: 2, credits: 1.0, type: "CR1", nature: "DSC" },
        { code: "CSE423", title: "Virtualization and Cloud Computing", l: 3, t: 0, p: 0, credits: 3.0, type: "CR", nature: "DSC" },
        { code: "GEN231", title: "Community Development Project", l: 0, t: 0, p: 4, credits: 2.0, type: "CR3", nature: "PRC" },
        { code: "INT335", title: "Design Thinking", l: 3, t: 0, p: 0, credits: 3.0, type: "CR", nature: "DSC" },
        { code: "MTH401", title: "Discrete Mathematics", l: 3, t: 1, p: 0, credits: 4.0, type: "CR", nature: "BSC" }
      ],
      electiveBaskets: [
        {
          name: "Language Elective 2 Basket",
          type: "LE",
          nature: "LCS",
          subjects: [
            { code: "FRN602", title: "French Language Skills II", l: 1, t: 0, p: 3, credits: 3.0, type: "LE", nature: "LCS" },
            { code: "GER602", title: "German Language Skills II", l: 1, t: 0, p: 3, credits: 3.0, type: "LE", nature: "LCS" },
            { code: "JAP602", title: "Japanese Language Skills II", l: 1, t: 0, p: 3, credits: 3.0, type: "LE", nature: "LCS" },
            { code: "PEL132", title: "Communication Skills-II", l: 1, t: 0, p: 3, credits: 3.0, type: "LE", nature: "LCS" },
            { code: "PEL134", title: "Upper Intermediate Communication Skills-II", l: 1, t: 0, p: 3, credits: 3.0, type: "LE", nature: "LCS" },
            { code: "PEL136", title: "Advanced Communication Skills-II", l: 1, t: 0, p: 3, credits: 3.0, type: "LE", nature: "LCS" },
            { code: "SPA602", title: "Spanish Language Skills II", l: 1, t: 0, p: 3, credits: 3.0, type: "LE", nature: "LCS" }
          ]
        }
      ]
    },
    {
      termNumber: 4,
      termName: "Semester 4",
      coreSubjects: [
        { code: "CSE211", title: "Computer Organization and Design", l: 3, t: 1, p: 0, credits: 4.0, type: "CR", nature: "ESC" },
        { code: "CSE310", title: "Programming in Java", l: 3, t: 0, p: 2, credits: 4.0, type: "CR", nature: "DSC" },
        { code: "CSE316", title: "Operating Systems", l: 3, t: 0, p: 0, credits: 3.0, type: "CR", nature: "DSC" },
        { code: "CSE325", title: "Operating Systems Laboratory", l: 0, t: 0, p: 2, credits: 1.0, type: "CR", nature: "DSC" },
        { code: "INT428", title: "Artificial Intelligence Essentials", l: 3, t: 0, p: 1, credits: 4.0, type: "CR", nature: "DSC" },
        { code: "MTH302", title: "Probability and Statistics", l: 3, t: 1, p: 0, credits: 4.0, type: "CR", nature: "BSC" }
      ],
      electiveBaskets: [
        {
          name: "Aptitude Elective 1 Basket",
          type: "APE",
          nature: "EEA",
          subjects: [
            { code: "PEA305", title: "Analytical Skills-I", l: 2, t: 1, p: 0, credits: 3.0, type: "APE", nature: "EEA" },
            { code: "PEA307", title: "Advanced Analytical Skills-I", l: 2, t: 1, p: 0, credits: 3.0, type: "APE", nature: "EEA" }
          ]
        },
        {
          name: "Engineering Minor Elective 1 Basket",
          type: "EM",
          nature: "DSC",
          subjects: [
            { code: "INT330", title: "Managing Cloud Solutions (Cloud)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "INT242", title: "Cyber Security Essentials (Cyber)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "INT217", title: "Introduction to Data Management (Data Science)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "INT219", title: "Front End Web Developer (Full Stack)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "ECE217", title: "Introduction to Internet of Things (IOT)", l: 3, t: 0, p: 0, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "CSE273", title: "Foundations of Machine Learning (ML)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "CSE374", title: "Advance Software Engineering (Quality Eng)", l: 3, t: 0, p: 0, credits: 3.0, type: "EM", nature: "DSC" }
          ]
        }
      ]
    },
    {
      termNumber: 5,
      termName: "Semester 5",
      coreSubjects: [
        { code: "CSE332", title: "Industry Ethics and Legal Issues", l: 2, t: 0, p: 0, credits: 2.0, type: "CR", nature: "DSC" },
        { code: "CSE408", title: "Design and Analysis of Algorithms", l: 3, t: 0, p: 2, credits: 4.0, type: "CR", nature: "DSC" }
      ],
      electiveBaskets: [
        {
          name: "Engineering Minor Elective 2 Basket",
          type: "EM",
          nature: "DSC",
          subjects: [
            { code: "INT362", title: "Cloud Architecture and Implementation-I (Cloud)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "INT249", title: "System Administration (Cyber)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "INT232", title: "Data Science Toolbox : R Programming (Data Science)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "INT222", title: "Advanced Web Development (Full Stack)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "ECE341", title: "Programming IOT (IOT)", l: 1, t: 0, p: 3, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "CSE274", title: "Applied Machine Learning (ML)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "CSE375", title: "Software Testing (Quality Eng)", l: 3, t: 0, p: 0, credits: 3.0, type: "EM", nature: "DSC" }
          ]
        },
        {
          name: "Engineering Minor Elective 3 Basket",
          type: "EM",
          nature: "DSC",
          subjects: [
            { code: "INT363", title: "Cloud Microservices (Cloud)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "INT250", title: "Digital Evidence Analysis (Cyber)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "INT374", title: "Data Analytics with Power BI (Data Science)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "INT252", title: "Web App Development with ReactJS (Full Stack)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "ECE128", title: "Introduction to IOT Networking Protocols (IOT)", l: 3, t: 0, p: 0, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "CSE471", title: "Deep Learning for Computer Vision (ML)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "CSE376", title: "Automated Testing (Quality Eng)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" }
          ]
        },
        {
          name: "Open Minor 1 Basket",
          type: "OM",
          nature: "OEM",
          subjects: [
            { code: "INT301", title: "Open Minor 1", l: 3, t: 0, p: 0, credits: 3.0, type: "OM", nature: "OEM" }
          ]
        },
        {
          name: "Pathway Elective 1 Basket",
          type: "PW",
          nature: "PWE",
          subjects: [
            { code: "PEA306", title: "Analytical Skills-II (Govt Jobs)", l: 2, t: 1, p: 0, credits: 3.0, type: "PW", nature: "PWE" },
            { code: "PEA308", title: "Advanced Analytical Skills-II (Govt Jobs / Higher Studies / Service Based)", l: 2, t: 1, p: 0, credits: 3.0, type: "PW", nature: "PWE" },
            { code: "CSE329", title: "Prelude to Competitive Coding (Product Based)", l: 2, t: 0, p: 1, credits: 3.0, type: "PW", nature: "PWE" }
          ]
        },
        {
          name: "Pathway Elective 2 Basket",
          type: "PW",
          nature: "PWE",
          subjects: [
            { code: "CSE333", title: "Combinatorial Studies-I (Govt Jobs)", l: 2, t: 0, p: 2, credits: 3.0, type: "PW", nature: "PWE" },
            { code: "CSE330", title: "Competitive Coding Approaches-Techniques (Product Based)", l: 2, t: 0, p: 1, credits: 3.0, type: "PW", nature: "PWE" },
            { code: "FRN603", title: "French Language Skills III (Service Based)", l: 2, t: 2, p: 0, credits: 3.0, type: "PW", nature: "PWE" },
            { code: "GER603", title: "German Language Skills III (Service Based)", l: 2, t: 2, p: 0, credits: 3.0, type: "PW", nature: "PWE" },
            { code: "JAP603", title: "Japanese Language Skills III (Service Based)", l: 2, t: 2, p: 0, credits: 3.0, type: "PW", nature: "PWE" },
            { code: "PEV301", title: "Verbal Ability (Service Based)", l: 2, t: 2, p: 0, credits: 4.0, type: "PW", nature: "PWE" },
            { code: "SPA603", title: "Spanish Language Skills III (Service Based)", l: 2, t: 2, p: 0, credits: 3.0, type: "PW", nature: "PWE" }
          ]
        },
        {
          name: "Training Elective 1 Basket",
          type: "TE",
          nature: "TCS",
          subjects: [
            { code: "CSE343", title: "Training in Programming", l: 0, t: 0, p: 6, credits: 3.0, type: "TE", nature: "TCS" },
            { code: "CSE443", title: "Seminar on Summer Training", l: 0, t: 0, p: 6, credits: 3.0, type: "TE", nature: "TCS" }
          ]
        }
      ]
    },
    {
      termNumber: 6,
      termName: "Semester 6",
      coreSubjects: [
        { code: "CSE322", title: "Formal Languages and Automation Theory", l: 3, t: 0, p: 0, credits: 3.0, type: "CR", nature: "DSC" }
      ],
      electiveBaskets: [
        {
          name: "Engineering Minor Elective 4 Basket",
          type: "EM",
          nature: "DSC",
          subjects: [
            { code: "INT364", title: "Cloud Architecture and Implementation-II (Cloud)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "INT244", title: "Securing Computing Systems (Cyber)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "INT234", title: "Predictive Analytics (Data Science)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "INT220", title: "Server Side Scripting (Full Stack)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "ECE237", title: "Architecting Smart IOT Devices (IOT)", l: 1, t: 0, p: 3, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "CSE472", title: "Deep Learning for Natural Language Processing (ML)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "CSE377", title: "Advance Testing Technologies (Quality Eng)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" }
          ]
        },
        {
          name: "Engineering Minor Elective 5 Basket",
          type: "EM",
          nature: "DSC",
          subjects: [
            { code: "INT327", title: "Cloud Infrastructure and Resource Management (Cloud)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "INT245", title: "Penetration Testing (Cyber)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "INT312", title: "Big Data Fundamentals (Data Science)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "INT221", title: "MVC Programming (Full Stack)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "ECE129", title: "IOT for Digital Society (IOT)", l: 3, t: 0, p: 0, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "CSE473", title: "Large Language Models and Agentic AI (ML)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "CSE378", title: "Web Services API Automation Testing (Quality Eng)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" }
          ]
        },
        {
          name: "Open Minor 2 Basket",
          type: "OM",
          nature: "OEM",
          subjects: [
            { code: "INT302", title: "Open Minor 2", l: 3, t: 0, p: 0, credits: 3.0, type: "OM", nature: "OEM" }
          ]
        },
        {
          name: "Pathway Elective 3 Basket",
          type: "PW",
          nature: "PWE",
          subjects: [
            { code: "CSE334", title: "Combinatorial Studies-II (Govt Jobs / Higher Studies)", l: 2, t: 0, p: 2, credits: 3.0, type: "PW", nature: "PWE" },
            { code: "CSE331", title: "Coding Pearls (Product Based)", l: 2, t: 0, p: 1, credits: 3.0, type: "PW", nature: "PWE" },
            { code: "CSE357", title: "Combinatorial Studies (Service Based)", l: 2, t: 0, p: 2, credits: 3.0, type: "PW", nature: "PWE" }
          ]
        },
        {
          name: "Pathway Elective 4 Basket",
          type: "PW",
          nature: "PWE",
          subjects: [
            { code: "PES390", title: "Soft Skills (Product Based)", l: 2, t: 2, p: 0, credits: 4.0, type: "PW", nature: "PWE" }
          ]
        }
      ]
    },
    {
      termNumber: 7,
      termName: "Semester 7",
      coreSubjects: [
        { code: "CSE339", title: "Capstone Project-I", l: 0, t: 0, p: 4, credits: 2.0, type: "CR", nature: "PRJ" },
        { code: "CSE393", title: "Online Academic Course", l: 3, t: 0, p: 0, credits: 3.0, type: "CR", nature: "DSC" },
        { code: "CSE496", title: "Foundations of Indian Knowledge Systems", l: 2, t: 0, p: 0, credits: 2.0, type: "CR", nature: "DSC" }
      ],
      electiveBaskets: [
        {
          name: "Engineering Minor Elective 6 Basket",
          type: "EM",
          nature: "DSC",
          subjects: [
            { code: "INT328", title: "Network Virtualization and Cloud Security (Cloud)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "INT251", title: "Malware Analysis and Cyber Defence (Cyber)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "INT315", title: "Cluster Computing (Data Science)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "INT253", title: "Web Development in Python using Django (Full Stack)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "ECE140", title: "Workshop on IOT for Digital Society (IOT)", l: 1, t: 0, p: 3, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "CSE470", title: "Applied Artificial Intelligence Systems (ML)", l: 2, t: 0, p: 2, credits: 3.0, type: "EM", nature: "DSC" },
            { code: "CSE379", title: "Mobile Automated Testing (Quality Eng)", l: 0, t: 0, p: 4, credits: 3.0, type: "EM", nature: "DSC" }
          ]
        },
        {
          name: "Open Minor 3 Basket",
          type: "OM",
          nature: "OEM",
          subjects: [
            { code: "INT303", title: "Open Minor 3", l: 3, t: 0, p: 0, credits: 0.0, type: "OM", nature: "OEM" }
          ]
        },
        {
          name: "Industrial Internship (Alt Track)",
          type: "CR",
          nature: "TCF",
          subjects: [
            { code: "CSE447", title: "Industry Co-op Project-I", l: 0, t: 0, p: 32, credits: 16.0, type: "CR", nature: "TCF" }
          ]
        }
      ]
    },
    {
      termNumber: 8,
      termName: "Semester 8",
      coreSubjects: [
        { code: "CSE435", title: "Comprehensive Seminar", l: 0, t: 0, p: 2, credits: 1.0, type: "CR", nature: "SMN" },
        { code: "CSE439", title: "Capstone Project-II", l: 0, t: 0, p: 16, credits: 8.0, type: "CR", nature: "PRJ" }
      ],
      electiveBaskets: [
        {
          name: "Department Elective 1 Basket",
          type: "DE",
          nature: "DSC",
          subjects: [
            { code: "INT411", title: "Software Project Management", l: 3, t: 0, p: 0, credits: 3.0, type: "DE", nature: "DSC" },
            { code: "INT402", title: "Modern Web Programming Tools and Techniques", l: 3, t: 0, p: 2, credits: 4.0, type: "DE", nature: "DSC" },
            { code: "CSE504", title: "Storage Technology Foundation", l: 3, t: 0, p: 0, credits: 3.0, type: "DE", nature: "DSC" },
            { code: "CSE493", title: "Linux System Administration", l: 3, t: 0, p: 2, credits: 4.0, type: "DE", nature: "DSC" },
            { code: "CSE436", title: "Blockchain", l: 3, t: 0, p: 2, credits: 4.0, type: "DE", nature: "DSC" },
            { code: "CSE434", title: "Game Development in 3D", l: 3, t: 0, p: 2, credits: 4.0, type: "DE", nature: "DSC" },
            { code: "CSE406", title: "Advanced Java Programming", l: 3, t: 0, p: 2, credits: 4.0, type: "DE", nature: "DSC" },
            { code: "CSE403", title: "Network Security and Cryptography", l: 3, t: 0, p: 2, credits: 4.0, type: "DE", nature: "DSC" },
            { code: "CSE327", title: "Simulation and Modelling", l: 3, t: 0, p: 0, credits: 3.0, type: "DE", nature: "DSC" },
            { code: "CSE304", title: "Computer Graphics and Visualization", l: 3, t: 1, p: 0, credits: 4.0, type: "DE", nature: "DSC" }
          ]
        },
        {
          name: "Department Elective 1 Lab Basket",
          type: "DE",
          nature: "DSC",
          subjects: [
            { code: "INT416", title: "Software Project Management Laboratory", l: 0, t: 0, p: 3, credits: 2.0, type: "DE", nature: "DSC" }
          ]
        },
        {
          name: "Open Minor 4 Basket",
          type: "OM",
          nature: "OEM",
          subjects: [
            { code: "INT304", title: "Open Minor 4", l: 3, t: 0, p: 0, credits: 3.0, type: "OM", nature: "OEM" }
          ]
        },
        {
          name: "Industrial Internship (Alt Track)",
          type: "TE",
          nature: "TCF",
          subjects: [
            { code: "CSE441", title: "Industry Internship Project", l: 0, t: 0, p: 32, credits: 16.0, type: "TE", nature: "TCF" },
            { code: "CSE448", title: "Industry Co-op Project-II", l: 0, t: 0, p: 32, credits: 16.0, type: "TE", nature: "TCF" }
          ]
        }
      ]
    }
  ]
};

// Main entry Registry Map
export const CURRICULUM_REGISTRY: Record<string, ProgramCurriculum> = {
  "btech-cse": BTECH_CSE_2025
};

export const getProgramCurriculum = (programSlug: string): ProgramCurriculum | null => {
  const normalized = programSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (normalized === 'btechcse' || normalized === 'btechcomputerscienceandengineering') {
    return BTECH_CSE_2025;
  }
  return CURRICULUM_REGISTRY[normalized] || null;
};

export const findSubjectMetadata = (programSlug: string, subjectKey: string): SubjectMetadata | null => {
  const curriculum = getProgramCurriculum(programSlug);
  if (!curriculum) return null;

  // Extract code (e.g. "ECE249")
  const codeMatch = subjectKey.match(/[A-Z]{2,4}\d{3}/i);
  const code = codeMatch ? codeMatch[0].toUpperCase() : subjectKey.toUpperCase().trim();

  for (const term of curriculum.terms) {
    for (const core of term.coreSubjects) {
      if (core.code === code) return core;
    }
    for (const basket of term.electiveBaskets) {
      for (const subj of basket.subjects) {
        if (subj.code === code) return subj;
      }
    }
  }
  return null;
};
