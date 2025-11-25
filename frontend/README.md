# Online Counseling Platform

A full-stack MERN web application that connects clients with counselors for online counseling sessions.  
Features include user authentication, role-based dashboards, counselor browsing, appointment booking, real-time chat, video calls, and a demo payment flow.

---

## 🚀 Live Links

- **Frontend (Client App)**: https://alvin-online-counseling-platform.netlify.app  
- **Backend (API)**: https://online-counseling-platform-api.onrender.com  

> The backend root URL responds with a JSON status message to confirm that the API is running.

---

## 👤 Demo Credentials

Use these accounts so reviewers can test quickly:

### Client (Book sessions)
- **Email:** `test@test.com`  
- **Password:** `test123`

### Counselor (Manage sessions)
- **Email:** `alvinsam0704@gmail.com`  
- **Password:** `pass1234`

---

## ✨ Key Features

- **Authentication & Authorization**
  - JWT-based login/register.
  - Role-based access: `client` and `counselor`.
  - Protected routes on both frontend and backend.

- **Counselor Browsing**
  - Clients can browse available counselors with specialization, rate, license number, and email.
  - Clean, responsive cards that work on both desktop and mobile.

- **Appointment Management**
  - Clients can book appointments by selecting counselor, date, time, session type, and notes.
  - Counselors define availability and manage bookings.
  - Status flow: `pending` → `confirmed` / `rejected` → `completed` / `cancelled`.
  - Separate dashboards:
    - Client: “My Appointments”
    - Counselor: “Counselor Appointments” and client records.

- **Real-time Chat**
  - Client–counselor chat per appointment.
  - Built on WebSockets (Socket.io-style architecture) for live messaging.

- **Video Calls (Jitsi)**
  - One-click video calls using Jitsi Meet rooms.
  - Secure access: only the client and counselor of that appointment can start/join the call (checked via an authorization endpoint before opening Jitsi).

- **Demo Payment Flow (Mock)**
  - A payment step is included in the booking flow for demonstration.
  - Payment is simulated as successful; no real money is charged.
  - The appointment’s payment status is updated so the complete flow can be tested without real Razorpay keys.
  - The code is structured so Razorpay or another gateway can be plugged in later with real credentials.

- **Responsive UI**
  - Fully responsive, works on laptops and mobile phones.
  - Modern, card-based dashboards and pages using utility CSS classes.

---

## 🧱 Tech Stack

**Frontend**
- React
- React Router
- Context API for auth state
- Axios for HTTP calls
- Tailwind-style utility classes for styling

**Backend**
- Node.js
- Express
- MongoDB & Mongoose
- JWT for authentication
- Role-based middleware for protected routes

**Other**
- Jitsi Meet (hosted at `https://meet.jitsi.net`) for video calls
- Deployed on:
  - **Netlify** (frontend)
  - **Render** (backend/API)
- Environment variables for configuration

---

## 📁 Project Structure (High Level)

