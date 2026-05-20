# 🚀 Scholix

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)
![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-blue)
![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-Proprietary-red)

**Scholix** is a comprehensive, AI-powered student utility platform designed to empower students across multiple universities. Originally built as LPU-Nexus, it has evolved into a multi-tenant ecosystem starting with Lovely Professional University, providing a seamless and smart experience for students to manage their academic and campus life.

---

## ✨ Features

- **🎓 Attendance Tracker:** Keep track of your daily attendance effortlessly.
- **📅 Timetable Hub:** Sync your timetable and view your daily schedule seamlessly.
- **📊 CGPA Calculator:** Plan your grades and predict your GPA.
- **🗺️ Campus Navigator:** Interactive campus maps to find buildings and facilities.
- **📚 Content Library:** Access and manage study materials, notes, and resources.
- **📝 Quiz Taker:** Practice with AI-generated quizzes to prepare for your exams.
- **💼 Placement Prefect:** Get AI feedback on your resume and prepare for placements.
- **🤝 Roommate Finder:** Connect with other students to find your perfect roommate.
- **🛒 Marketplace:** Buy and sell student gear and books within the campus community.
- **🆘 Emergency Contacts:** Quick access to essential campus emergency numbers.
- **🎒 Freshers Kit:** A comprehensive guide for new students joining the university.

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 19 with Vite
- **Styling:** Tailwind CSS & Framer Motion for smooth animations
- **State Management:** Zustand
- **Backend & Database:** Supabase
- **AI Integration:** Google Gemini API (`@google/genai`)
- **Other Utilities:** Tesseract.js (OCR), PDF-Lib, Cheerio, Recharts

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn or pnpm
- A Supabase account for backend services

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/scholix.git
   cd scholix
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add the necessary environment variables (e.g., Supabase URL, Anon Key, Gemini API Key, etc.).

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## ⚙️ Database Setup (Supabase)

Run these scripts in your **Supabase SQL Editor** to enable all features:

### 1. Core & Library Tables
Configure your core tables including user profiles, folders, and documents as required by the application structure.

### 2. Question Bank Registry (For Quiz Taker Optimization)
```sql
CREATE TABLE IF NOT EXISTS public.question_banks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_name TEXT NOT NULL,
    unit_number INTEGER NOT NULL,
    questions JSONB NOT NULL, -- Array of QuizQuestion objects
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(subject_name, unit_number)
);

ALTER TABLE public.question_banks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view question banks" ON public.question_banks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can contribute to banks" ON public.question_banks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

### 3. User History & Records
Ensure you set up tracking for user history, quiz attempts, and marketplace listings in accordance with the backend schemas.

---

## 📂 Project Structure

- `/components`: Reusable UI components and feature hubs (e.g., TimetableHub, QuizTaker, Dashboard).
- `/services`: Core business logic and API integrations (Supabase, Gemini AI, OCR).
- `/stores`: Zustand stores for global state management.
- `/hooks`: Custom React hooks for specific functionalities.
- `/data`: Static configurations and data used across the app.

---

## 🤝 Contributing

We welcome suggestions, issues, and contributions through pull requests.

Before making major changes, please open an issue to discuss the proposed improvements. This helps maintain consistency and avoids duplicate work.

Steps to contribute:

1. Fork the repository

2. Create your feature branch

```bash
git checkout -b feature/amazing-feature
```

3. Commit your changes

```bash
git commit -m "Add amazing feature"
```

4. Push to the branch

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request

Please ensure your code follows project structure and coding standards.

---

## 📄 License

This project is proprietary and confidential unless stated otherwise.
