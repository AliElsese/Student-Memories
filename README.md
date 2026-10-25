# Student Memories & Anonymous Messages Platform 🎓💌
*(منصة ذكريات الطلاب والرسائل المجهولة)*

A modern, responsive, and glassmorphic web application built for Front-End course graduations and commemorative activities. The platform enables students to register their details, receive a unique printable QR code for their physical commemorative card, browse their batch classmates' cards, send anonymous compliments/memories, and unlock their own secret notes with a 6-digit personal PIN.

---

## 1. Architecture Overview

The system is built as a Single Page Application (SPA) utilizing:
- **Frontend Framework**: React 19 with Vite (pure **JavaScript and JSX only**, zero TypeScript).
- **Styling**: Tailwind CSS with custom glassmorphism design tokens (frosted glass, backdrop blur, ambient color glows, soft shadows, rounded corners).
- **Client Routing**: React Router DOM (`/register`, `/cards/:studentId`, `/messages/:studentId`).
- **Form Handling & Validation**: Formik + Yup for data integrity, date validation, and photo type/size checks.
- **Backend & Database**: Supabase (PostgreSQL with Row Level Security, Storage Buckets, and PostgreSQL RPC functions).
- **QR Code Engine**: `qrcode` generating high-resolution (1200x1200px) PNG exports with error-correction Level `H` and centered personality emoji contrast badges.
- **Bilingual & Localization**: Full English (LTR) and Arabic (RTL) support with dynamic `dir="rtl"` / `dir="ltr"` switching.
- **Privacy & Lightweight Verification**: 6-digit PIN verification evaluated via server-side PostgreSQL function or local browser session caching without leaking all students' PINs or messages to public queries.

---

## 2. Project Folder Structure

```text
student-memories/
├── public/
│   ├── favicon.svg              # Graduation cap SVG favicon
│   └── ...
├── src/
│   ├── assets/                  # Static assets
│   ├── components/
│   │   ├── common/              # Reusable UI primitives
│   │   │   ├── Badge.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── Modal.jsx
│   │   ├── forms/               # Formik-integrated form controls
│   │   │   ├── EmojiPicker.jsx
│   │   │   ├── FormInput.jsx
│   │   │   └── PhotoUploader.jsx
│   │   ├── layout/              # App chrome & glass backgrounds
│   │   │   ├── AmbientBackground.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Navbar.jsx
│   │   ├── messages/            # Messaging features
│   │   │   ├── MessageCard.jsx
│   │   │   ├── MessageModal.jsx
│   │   │   └── PinVerificationModal.jsx
│   │   ├── qr/                  # QR Code rendering & download
│   │   │   ├── QrCodeViewer.jsx
│   │   │   └── QrPreviewModal.jsx
│   │   └── student/             # Student card display
│   │       ├── StudentCard.jsx
│   │       └── StudentCardSkeleton.jsx
│   ├── contexts/
│   │   └── LanguageContext.jsx  # Bilingual switcher & translations
│   ├── locales/
│   │   ├── ar.js                # Arabic translations (RTL)
│   │   └── en.js                # English translations (LTR)
│   ├── pages/
│   │   ├── GroupCardsPage.jsx   # /cards/:studentId (Scanned Group View)
│   │   ├── MessagesPage.jsx     # /messages/:studentId (Secret Notes Inbox)
│   │   └── RegisterPage.jsx     # /register (Registration & QR Generator)
│   ├── services/
│   │   ├── groupService.js      # Group lookup & validation
│   │   ├── messageService.js    # Anonymous message submission & retrieval
│   │   ├── qrService.js         # Canvas rendering, emoji overlay & PNG export
│   │   ├── studentService.js    # Student registration, photos & PIN check
│   │   └── supabaseClient.js    # Supabase connection & demo fallback
│   ├── utils/
│   │   └── constants.js         # File sizes, emojis & constraints
│   ├── App.jsx                  # Main application & routing tree
│   ├── index.css                # Tailwind imports & glassmorphism utilities
│   └── main.jsx                 # React root mounting
├── supabase/
│   └── schema.sql               # Full PostgreSQL tables, RLS & RPC functions
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore file
├── index.html                   # HTML entry point with Google Fonts
├── package.json                 # Pure JavaScript dependencies
├── vite.config.js               # Vite + Tailwind configuration
└── README.md                    # Project documentation
```

---

## 3. Setup Commands & Dependency Installation

Clone or open the repository directory:

```bash
cd "f:\Front-End Projects\React\Student Memories"
```

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

---

## 4. Supabase Setup & Database Configuration

### Step 1: Create a Supabase Project
1. Log in to [Supabase](https://supabase.com).
2. Click **New Project** and name it (e.g., `student-memories-2026`).
3. Set your database password and choose the nearest region.

### Step 2: Run the SQL Schema
1. In the Supabase Dashboard, go to **SQL Editor**.
2. Click **New Query**.
3. Copy the entire contents of [`supabase/schema.sql`](file:///f:/Front-End%20Projects/React/Student%20Memories/supabase/schema.sql) and paste it into the editor.
4. Click **Run**.

This script automatically creates:
- `groups` table with unique uppercase `group_code` index.
- `students` table with date checks and 6-digit PIN constraint.
- `messages` table with length limits (1 to 1000 characters).
- `public_students` view (omitting `pin_code` for client security).
- `verify_student_pin` PostgreSQL RPC function.
- `get_verified_messages` PostgreSQL RPC function.
- Row Level Security (RLS) policies.
- Public storage bucket `student-photos` with upload and read policies.
- Initial seed groups (`REACT2026`, `FRONTEND2026`, `PIONEERS2026`).

---

## 5. Environment Variables Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your variables:

```ini
# Supabase URL and anon key from Dashboard -> Settings -> API
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# The production base URL encoded into the printed QR codes
VITE_APP_BASE_URL=https://your-production-domain.com
```

> **Note on Demo/Offline Mode**: If `.env` is omitted or contains placeholder values, the application automatically operates in local demo mode using localStorage, allowing you to preview the complete registration, QR generation, card views, and message flows immediately.

---

## 6. Creating Groups and Group Codes

Course instructors or organizers can create batches directly through the Supabase SQL editor:

```sql
INSERT INTO public.groups (name, group_code)
VALUES ('Web Development Batch 2026', 'WEB2026');
```

When students register, they input `WEB2026` in the **Group Code** field. The application validates this code against Supabase in real time.

---

## 7. Configuring Permanent QR Base URL Before Card Printing

QR codes will be printed on physical commemorative cards. To ensure cards work permanently after printing:

1. Deploy the frontend application to your production domain (e.g. `https://memories.myacademy.com` or `https://batch2026.vercel.app`).
2. Set `VITE_APP_BASE_URL=https://your-production-domain.com` in your production environment variables.
3. When students register and download their QR code, the code encodes:
   `https://your-production-domain.com/cards/STUDENT_ID`
4. Once printed, the URL remains permanently stable.

---

## 8. Deployment Instructions (SPA Direct Navigation)

When deploying to **Vercel**, **Netlify**, or **GitHub Pages**, configure single-page rewrites so direct links like `/cards/:studentId` and `/messages/:studentId` load without 404 errors.

### Vercel (`vercel.json`)
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Netlify (`public/_redirects`)
```text
/*    /index.html   200
```

---

## 10. Super Admin Portal & Credentials

The application includes a dedicated **Super Admin Portal** for the course instructor or coordinator to inspect all student records, view secret 6-digit PINs, and preview/download QR codes for printing.

- **Login URL**: `/admin/login` (accessible via the Shield icon in the top Navbar or Footer)
- **Super Admin Email**: `ali.elsese104@gmail.com`
- **Super Admin Password**: `Ali10496`

### Super Admin Dashboard Features (`/admin/dashboard`):
- **KPI Metrics**: Total registered students, active batches, and total secret messages sent.
- **Search & Filter**: Real-time search across student names, nicknames, and batches, plus a batch filter dropdown.
- **Complete Student Records**:
  - Commemorative photo thumbnail & personality emoji.
  - Full student name and nickname.
  - Batch name and group code.
  - Course start and graduation dates.
  - **Secret 6-Digit PIN** with a show/hide toggle.
  - Number of secret notes received.
  - **Printable QR Code**: One-click preview modal and instant 1200x1200px PNG download.
  - Direct links to view the student's group cards or unlock their messages.
  - Option to delete test or spam registrations.
- **Session Management**: Secure logout button that revokes administrative access.

---

## 11. Privacy & PIN Verification Notes

- **Recreational Purpose**: This platform is designed for fun student graduation activities, not an enterprise banking system.
- **PIN Privacy**: 6-digit PINs are verified using a server-side PostgreSQL function (`verify_student_pin`). PINs are never included in the public student card queries, preventing other students from inspecting network requests to see classmate PINs.
- **Browser Verification**: Browser `localStorage` is used to remember successful verification on the student's personal phone or computer. The student can click **Lock Inbox** at any time to clear this session and require PIN re-entry.
