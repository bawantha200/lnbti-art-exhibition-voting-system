# LNBTI Japanese Club – Art Exhibition & Competition Voting System

A web-based voting platform developed for the **LNBTI Japanese Club** to manage the Student Art Exhibition & Competition. The system allows eligible students to explore submitted artworks and securely cast their votes online.

## Features

- **Student Authentication:** Institutional email verification using six-digit OTP authentication.
- **Artwork Exhibition:** Browse submitted artworks and view their details.
- **Online Voting:** Secure voting with duplicate submission prevention.
- **Live Leaderboard:** View artwork rankings and voting results.
- **Admin Dashboard:** Monitor student participation, artwork information, competition statistics, and voting status.
- **Security:** JWT-based authentication, HTTP-only cookies, and server-side validation.

## Technology Stack

- React.js
- Vite
- React Router
- Node.js
- Express.js
- PostgreSQL (Neon)
- JWT Authentication
- Brevo API
- Cloudinary
- Playwright

## System Architecture

The application follows a client-server architecture. The React frontend communicates with the backend through REST APIs. PostgreSQL stores application data, while Brevo handles OTP email delivery and Cloudinary provides artwork image hosting.

## Live Application

[Open the Voting System](https://lnbti-art-exhibition-voting-system-eight.vercel.app)

## Developer & Attribution

**Originally Conceptualized, Designed & Developed by Bawantha Madubhashana.**

Developed for the **LNBTI Japanese Club**.

© 2026 Bawantha Madubhashana.