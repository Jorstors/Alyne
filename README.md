# Alyne
**Effortless Team Scheduling & Event Planning**

Alyne is a modern web application designed to solve the "when are we free?" problem for teams and groups. By combining intuitive availability grids with smart profile defaults, it eliminates the back-and-forth of scheduling meetings.

<img src="/frontend/public/image.png"/>

## Key Features

*   **Interactive Availability Grids**: specific "paint-to-select" interface allows users to intuitively mark their free time on a calendar grid.
*   **Smart Auto-Fill**: Users can define their "General Availability" (e.g., 9-5 Mon-Fri) in their settings and auto-fill it into any event with a single click, saving repetitive entry time.
*   **Team Management**: Create teams, invite members, and organize events within specific groups to keep schedules aligned.
*   **Flexible Event Types**: Supports both **Specific Date** events (e.g., "Project Launch on Oct 12") and **Recurring Weekly** patterns (e.g., "Mondays and Wednesdays").
*   **Real-Time Data**: Seamless synchronization ensures everyone sees the latest availability and event details.

## Technology Stack

This project was built to demonstrate full-stack proficiency using a modern, type-safe ecosystem.

### Frontend
*   **React 19**: Leveraging the latest features for performant component rendering and state management.
*   **TypeScript**: providing strict type safety across the entire application to prevent runtime errors.
*   **Vite**: Next-generation frontend tooling for ultra-fast builds and hot searching.
*   **Tailwind CSS v4**: A highly customizable, utility-first CSS framework used for a responsive and unique design system.
*   **Radix UI**: Headless, accessible UI primitives for building robust interactive components (Dialogs, Dropdowns, etc.).
*   **Lucide React**: Clean, consistent SVG iconography.

### Backend & Infrastructure
*   **Node.js & Express**: A lightweight, robust REST API that handles business logic, route protection, and data aggregation.
*   **Supabase**: utilized for Authentication (Auth) and Database (PostgreSQL).
*   **PostgreSQL**: Relational database handling complex schemas for users, teams, events, and JSON-based availability data.

## Engineering Highlights
*   **Complex State Management**: Handling the interactive grid state (row/col mapping to time slots) and merging "General Availability" with specific event overrides.
*   **Component Reusability**: The core `InteractiveGrid` is reused across different contexts (Settings vs. Events) with adaptable props.
*   **Robust Error Handling**: Comprehensive fail-safes for API connections and data fetching (e.g. graceful fallbacks for missing environment variables).

