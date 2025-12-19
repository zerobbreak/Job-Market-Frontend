# Job Market Agent - Frontend

The frontend user interface for the Job Market Agent, built with modern web technologies to provide a seamless job search and application management experience.

## 🚀 Features

- **Dashboard**: Overview of job applications and market insights.
- **Job Search**: Advanced search functionality to find relevant opportunities.
- **Applications Tracking**: Manage and track the status of your job applications.
- **Profile Management**: Update user profile and preferences.
- **Landing Page**: Introduction to the platform (Landing, How It Works, FAQ).
- **Pricing**: Subscription plans and features.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide React](https://lucide.dev/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Backend/Auth**: [Appwrite](https://appwrite.io/)

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

1.  Clone the repository:
    ```bash
    git clone git@github.com:zerobbreak/Job-Market-Frontend.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd frontend
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Ensure you configure your **Appwrite** endpoint and project ID.

### Running the App

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or similar).

### Building for Production

To create a production build:

```bash
npm run build
```

The output will be in the `dist/` directory.

## 📜 Scripts

- `npm run dev`: Start development server.
- `npm run build`: Type-check and build for production.
- `npm run preview`: Preview the production build locally.
