
export interface ChatOption {
  id: string;
  text: string;
  nextId?: string;
  response?: string;
  action?: 'email' | 'feedback' | 'link';
  link?: string;
}

export interface ChatNode {
  id: string;
  message: string;
  options: ChatOption[];
}

export const SUPPORT_CHAT_TREE: Record<string, ChatNode> = {
  start: {
    id: 'start',
    message: "Welcome to Scholix Support! I can help you with almost anything on the platform. What's on your mind?",
    options: [
      { id: '1', text: 'Academic Tools', nextId: 'academics' },
      { id: '2', text: 'Campus & Marketplace', nextId: 'campus' },
      { id: '4', text: 'Account & Settings', nextId: 'account_settings' },
      { id: '5', text: 'Bug / Feedback', action: 'feedback' },
      { id: '6', text: 'Human Support', nextId: 'human_direct' }
    ]
  },

  // ACADEMICS SECTION
  academics: {
    id: 'academics',
    message: "Academics can be tough! Which tool do you need help with?",
    options: [
      { id: 'a1', text: 'Attendance Tracker', nextId: 'attendance_help' },
      { id: 'a2', text: 'Quiz Taker / Prep', nextId: 'quiz_help' },
      { id: 'a3', text: 'CGPA Calculator', nextId: 'cgpa_help' },
      { id: 'a4', text: 'Content Library (PYQs)', nextId: 'library_help' },
      { id: 'a5', text: 'Back to start', nextId: 'start' }
    ]
  },
  attendance_help: {
    id: 'attendance_help',
    message: "Tracking those percentages? Here is how I can help:",
    options: [
      { id: 'att1', text: 'How "Safe to Skip" works?', response: 'It calculates how many lectures you can miss WHILE STAYING above your target (e.g., 75%). If it shows 0, it means you are on the edge!' },
      { id: 'att2', text: 'Data not updating?', response: 'Attendance is stored locally on your device for privacy. If you clear browser cache, you might need to re-enter your subjects.' },
      { id: 'att3', text: 'Academic Menu', nextId: 'academics' }
    ]
  },
  quiz_help: {
    id: 'quiz_help',
    message: "Preparing for tests? Scholix Quiz Taker is your best bet.",
    options: [
      { id: 'q1', text: 'Can I add my own questions?', response: 'Currently, the database is curated by Admins. You can contribute via the "Library" upload section to get your notes added!' },
      { id: 'q2', text: 'Timer too fast?', response: 'Exam Mode mimics real conditions. If you want to practice without pressure, use the "Learn" tab instead of "Test".' },
      { id: 'q3', text: 'Academic Menu', nextId: 'academics' }
    ]
  },
  cgpa_help: {
    id: 'cgpa_help',
    message: "Calculating your future?",
    options: [
      { id: 'c1', text: 'Relative Grading support?', response: 'Relative grading is batch-dependent. Scholix uses absolute grading as a "Worst Case Scenario" - if you score this here, you are safe regardless of the curve.' },
      { id: 'c2', text: 'Incorrect calculation?', response: 'Ensure you select the correct credits for each subject. Credit-weighted average is used for the final GPA.' },
      { id: 'c3', text: 'Academic Menu', nextId: 'academics' }
    ]
  },
  library_help: {
    id: 'library_help',
    message: "The Library is crowdsourced!",
    options: [
      { id: 'l1', text: 'Where are the PYQs?', response: 'Navigate to Content Library -> Previous Year Questions. Use the search to find specific subject codes.' },
      { id: 'l2', text: 'How to contribute?', response: 'Go to Library -> Contribute. Uploaded files are reviewed by Vertos/Admins and go live within 24 hours.' },
      { id: 'l3', text: 'Academic Menu', nextId: 'academics' }
    ]
  },

  // CAMPUS SECTION
  campus: {
    id: 'campus',
    message: "Campus Life is better together! What are you looking for?",
    options: [
      { id: 'cp1', text: 'Marketplace (Buy/Sell)', nextId: 'market_help' },
      { id: 'cp2', text: 'Roommate Finder', nextId: 'roommate_help' },
      { id: 'cp3', text: 'Rescue Line / Emergency', nextId: 'rescue_help' },
      { id: 'cp4', text: 'Back to start', nextId: 'start' }
    ]
  },
  market_help: {
    id: 'market_help',
    message: "Buy/Sell used books, gadgets, and more.",
    options: [
      { id: 'm1', text: 'Safety during exchange?', response: 'Always meet in daylight at a public campus spot (like Uni-Mall) for the exchange. Never pay online before seeing the item.' },
      { id: 'm2', text: 'Delete my listing?', response: 'Go to Market -> My Listings to mark items as sold or delete them.' },
      { id: 'm3', text: 'Campus Menu', nextId: 'campus' }
    ]
  },
  roommate_help: {
    id: 'roommate_help',
    message: "Looking for a stay?",
    options: [
      { id: 'r1', text: 'How to find matches?', response: 'Post your requirements (Rent, AC/Non-AC, etc.) in the Roommate tab. You will see matches from other students immediately.' },
      { id: 'r2', text: 'Privacy of my number?', response: 'Your contact details are only visible to verified students. You can choose to hide your number anytime.' },
      { id: 'r3', text: 'Campus Menu', nextId: 'campus' }
    ]
  },
  rescue_help: {
    id: 'rescue_help',
    message: "Rescue Line provides instant contact for emergencies.",
    options: [
      { id: 're1', text: 'Hostel Wardens', response: 'The Rescue Line has updated numbers for all hostel wardens (BHR/GHR). Check the "Hostels" category.' },
      { id: 're2', text: 'Medical Emergency', response: 'Immediately use the "Health Center" button in Rescue Line for the 24/7 campus ambulance.' },
      { id: 're3', text: 'Campus Menu', nextId: 'campus' }
    ]
  },



  // ACCOUNT SECTION
  account_settings: {
    id: 'account_settings',
    message: "Need help with your profile or preferences?",
    options: [
      { id: 'ac1', text: 'Change University', response: 'Settings -> Change University. Note: Some tools are university-specific (like Attendance) and data may not transfer.' },
      { id: 'ac2', text: 'Email Verification', response: 'We use OTP-based login. Ensure you have access to your registered student/personal email.' },
      { id: 'ac3', text: 'Dark/Light Mode', response: 'You can toggle the theme using the moon/sun icon in the top header or in Settings.' },
      { id: 'ac4', text: 'Back to start', nextId: 'start' }
    ]
  },

  // HUMAN SUPPORT
  human_direct: {
    id: 'human_direct',
    message: "Still stuck? I can connect you to our support humans.",
    options: [
      { id: 'hd1', text: 'Email Anunay (Lead Dev)', action: 'email' },
      { id: 'hd2', text: 'Instagram Support', action: 'link', link: 'https://www.instagram.com/anunay07' },
      { id: 'hd3', text: 'LinkedIn Official', action: 'link', link: 'https://www.linkedin.com/in/anunayyadav/' },
      { id: 'hd4', text: 'Back to start', nextId: 'start' }
    ]
  }
};
