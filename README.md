📱 CampusFix

Campus Complaint Management System

CampusFix is a React Native + Firebase mobile application for digital campus complaint management. Students can submit and track complaints, while administrators can review complaints, assign departments, update status, delete complaints, and send notifications.

✨ Features

Student

Sign In / Sign Up

College/Campus selection

Forgot Password

Report Complaint

Category, location, priority and description

My Complaints and Complaint Details

Notifications

Profile management

Password reset

Delete account

Admin

Admin Login

Dashboard and complaint statistics

College-wise complaint management

Search and status filters

Complaint Details

Department assignment

Status updates

Complaint deletion

Admin notifications

Admin Profile

Password reset

🛠️ Tech Stack

React Native

TypeScript

Firebase Authentication

Cloud Firestore

React Native Firebase

Android / Gradle

Metro

🏗️ Project Structure

CampusFixRN/
├── android/
├── src/
│   ├── components/
│   ├── constants/
│   ├── firebase/
│   ├── screens/
│   │   ├── auth/
│   │   ├── student/
│   │   └── admin/
│   ├── services/
│   ├── types/
│   └── utils/
├── App.tsx
├── package.json
├── tsconfig.json
└── README.md

🔥 Firebase Collections

users
colleges
complaints
notifications
admin_notifications

Complaint Flow

Student
   ↓
Report Complaint
   ↓
complaints
   ↓
Admin Notification
   ↓
Admin Reviews Complaint
   ↓
Assign Department
   ↓
Update Status
   ↓
Student Notification

Complaint Status

Submitted

Assigned

In Progress

Resolved

Complaint Categories

Electricity

Water Supply

Cleanliness

Classroom

Furniture

Internet / Wi-Fi

Washroom

Security

Other

Priority

Low

Medium

High

🏫 Current Colleges

College

College ID

ABC College

001

XYZ College

002

Inmantec Institutions

0845

🚀 Installation

Clone the repository:

git clone https://github.com/YOUR_USERNAME/CampusFixRN.git
cd CampusFixRN

Install dependencies:

npm install

Add the Firebase Android configuration:

android/app/google-services.json

Start Metro:

npx react-native start

Run Android:

npx react-native run-android

🧪 TypeScript Check

npx tsc --noEmit

📦 Release APK

cd android
.\gradlew assembleRelease

APK:

android/app/build/outputs/apk/release/app-release.apk

🔐 Security

The app uses Firebase Authentication and Firestore Security Rules.

Important rules include:

Users can create/update their own profile.

Students can delete only their own submitted complaints.

Admins can delete complaints belonging to their college.

Students can access their own notifications.

Admins can access their own admin notifications.

College data is read-only.

Do not commit private service-account credentials, passwords, API secrets, or Android signing keys.

🎨 Branding

The application uses the CampusFix logo, launcher icon and animated startup screen.

CampusFix
Campus Complaint Management System

🎯 Objective

CampusFix provides a centralized digital platform for reporting, tracking and managing campus complaints, reducing dependency on manual complaint registers and informal communication.

🔮 Future Enhancements

Push notifications

Complaint image/document attachments

Analytics and reports

Complaint escalation

Email notifications

Web-based admin panel

Multi-college deployment

Dark mode

👨‍💻 Developer

Himanshu Yadav
BCA Student • Developer • Tech Enthusiast

📄 License

This project was developed as an academic/college project.