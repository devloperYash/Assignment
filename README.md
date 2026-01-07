# Store Rating System

A comprehensive web application that allows users to register, browse stores, and submit ratings. The system supports three distinct roles: System Administrator, Store Owner, and Normal User.

## Features

### System Administrator
*   **Manage Users:** Add and view normal users and admin users.
*   **Manage Stores:** Add and view registered stores.
*   **Dashboard:** Monitor system-wide statistics (total users, stores, and ratings).
*   **Filters:** Apply filters on listings based on name, email, address, and role.

### Normal User
*   **Sign Up & Login:** Secure registration and authentication system.
*   **Store Discovery:** Browse and search for stores by name and address.
*   **Ratings:** Submit ratings (1 to 5) for individual stores and modify them later.
*   **Profile Management:** Update password after logging in.

### Store Owner
*   **Store Insights:** View the average rating of their store.
*   **User Feedback:** See a list of users who have submitted ratings for their store.
*   **Profile Management:** Update password after logging in.

## Tech Stack

*   **Frontend:** React.js with Tailwind CSS and Shadcn UI.
*   **Backend:** Node.js with Express.
*   **Database:** PostgreSQL with Drizzle ORM.
*   **Authentication:** Passport.js with session-based storage.

## Validation Rules

*   **Name:** 20 - 60 characters.
*   **Address:** Maximum 400 characters.
*   **Password:** 8 - 16 characters, must include at least one uppercase letter and one special character.
*   **Email:** Standard email format validation.

## Getting Started

1.  **Installation:** Run `npm install` to install dependencies.
2.  **Database Setup:** Ensure PostgreSQL is running and the `DATABASE_URL` environment variable is set.
3.  **Run Migrations:** Execute `npm run db:push` to sync the database schema.
4.  **Start Application:** Run `npm run dev` to start the development server.


