# Employee Management & Leave Management System

A web app for managing employees, departments, leave requests, and attendance — built with React (frontend), Django REST Framework (backend), and MySQL (database).

## What it does

**Admins can:**
- Add, edit, delete, and search employees
- Manage departments
- Approve or reject leave requests
- View attendance records
- See dashboard stats and charts

**Employees can:**
- Log in and view their dashboard
- Update their own profile (phone, address, photo, etc.)
- Apply for leave and check leave history
- Check in / check out for attendance

## Tech Stack

- **Frontend:** React, Bootstrap
- **Backend:** Django, Django REST Framework
- **Database:** MySQL
- **Auth:** JWT (JSON Web Tokens)

## How to run it locally

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# fill in SECRET_KEY and DB_PASSWORD in .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

## Login roles

- **Admin** — created with `createsuperuser`, manages everything
- **Employee** — registers through the app, manages their own profile and leave

## Features Built

- ✅ Login / Register / Forgot Password
- ✅ Role-based access (Admin vs Employee)
- ✅ Employee & Department management
- ✅ Leave requests (apply, approve, reject, cancel)
- ✅ Attendance (check-in/out + admin tracking)
- ✅ Dashboards with charts
- ✅ Profile page with photo upload
