# RealEstateHub (AzureConnect)

RealEstateHub (codenamed **AzureConnect**) is a comprehensive real estate management platform built to streamline the property listing, discovery, and management process. It serves three primary types of users—**Admins**, **Agents**, and **Regular Users**—providing each with a tailored dashboard and feature set to handle real estate operations efficiently.

## 🌟 Key Features

### 👤 Role-Based Access Control
The platform heavily utilizes role-based protected routes to deliver specific functionalities based on the user's role:
- **Administrators**: Full platform oversight, including user management, listing approvals, administrative reports, and admin profile management.
- **Real Estate Agents**: Tools to create and manage property listings, view agent-specific reports, communicate via a built-in messenger, and alter their agent profiles.
- **Users (Clients)**: Capabilities to browse properties, save favorites, submit property maintenance requests, and manage personal profiles.

### 🏡 Core Modules
- **Landing Page & Discovery**: A beautiful, conversion-optimized landing page featuring search functionality, services section, and "Why Choose Us" components.
- **Authentication**: Secure login, registration, and password reset workflows powered by Supabase.
- **Communication Flow**: Integrated floating messenger system for seamless client-to-agent communication.
- **Maintenance & Alerts**: Features like maintenance mode modals and automatic patch notes (Patch Fix Modal) display on login.
- **Favorites & Bookmarks**: Allows users to curate their own collection of properties for easy comparison and later viewing.

## 🛠 Tech Stack

This project is built using modern web development tools for optimal performance and developer experience:

- **Frontend Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/) (Lazy loaded for code splitting and performance optimization)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `tailwindcss-animate`
- **UI Components**: 
  - [Radix UI](https://www.radix-ui.com/)
  - [Material UI (MUI)](https://mui.com/)
  - [Lucide React](https://lucide.dev/) (For iconography)
- **Backend & Auth**: [Supabase](https://supabase.com/)

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository** and ensure you pull or create your assigned branch (do not push directly to `main`).
   ```bash
   git clone <repository-url>
   cd RealEstateHub/AzureConnect
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   *(Check `package.json` for the complete list of dependencies).*

3. **Environment Setup**:
   Create a `.env` file in the root directory (using the `.env.example` if available) and configure your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:5173`.

### Building for Production

To create a production build setup:
```bash
npm run build
```
You can view the production build locally by running:
```bash
npm run preview
```

## 📁 Project Structure

```
AzureConnect/
├── public/                 # Static assets
├── src/                    # Application source code
│   ├── app/                # App configuration entries
│   ├── backend/            # Backend logic / functions
│   ├── components/         # Reusable UI components
│   │   ├── admin/          # Admin-specific components & views
│   │   ├── Agent/          # Agent-specific components & views
│   │   ├── landing/        # Landing page sections
│   │   ├── login/          # Auth components
│   │   ├── messaging/      # Chat and message components
│   │   ├── ui/             # Generic UI elements (Loaders, Modals)
│   │   └── User/           # Regular user components
│   ├── contexts/           # React Context providers (Auth, Bookmark)
│   ├── hooks/              # Custom React Hooks
│   ├── lib/                # Utility functions and library helpers
│   └── services/           # External API configurations (Supabase, etc.)
├── package.json            # Project dependencies and scripts
└── vite.config.ts          # Vite configuration
```

## 📜 Development Guidelines

- **Branching Strategy**: Please **do not push into main**. Always create a new branch for your features or bug fixes, and submit a Pull Request.
- **Linting**: Run `npm run lint` before committing your code to ensure code hygiene.
