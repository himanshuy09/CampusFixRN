# 📱 CampusFix

<div align="center">

<img src="https://img.shields.io/badge/CampusFix-Campus%20Complaint%20Management-2563EB?style=for-the-badge&logo=google-scholar&logoColor=white" />

### 🎓 Campus Complaint Management System

**A modern digital platform for reporting, tracking and managing campus complaints.**

<p>
  <img src="https://img.shields.io/badge/React%20Native-0.87.1-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-Authentication%20%26%20Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Platform-Android-3DDC84?style=flat-square&logo=android&logoColor=white" />
</p>

<br/>

### 🚀 Report. Track. Resolve.

</div>

---

## ✨ About CampusFix

**CampusFix** is a React Native + Firebase mobile application designed to digitize the campus complaint management process.

Instead of depending on manual complaint registers or informal communication, students can submit complaints digitally and track their progress, while administrators can review, manage, assign and resolve complaints from a centralized system.

> 🎯 **Goal:** Make campus complaint management faster, more transparent and organized.

---

# 🎬 How CampusFix Works

```text
                    🎓 STUDENT
                        │
                        ▼
                📝 Report Complaint
                        │
                        ▼
                 ☁️ Firestore
                        │
                        ▼
                🔔 Admin Notification
                        │
                        ▼
                  👨‍💼 ADMIN
                        │
                        ▼
               🏢 Assign Department
                        │
                        ▼
                 🔄 Update Status
                        │
                        ▼
                🔔 Student Notification

                        │
                        ▼
                 ✅ Complaint Resolved

🌟 Key Features
👨‍🎓 Student Portal
Feature	Description
🔐 Sign In / Sign Up	Secure Firebase Authentication
🏫 College Selection	Select campus during registration
🔑 Forgot Password	Reset password through Firebase
📝 Report Complaint	Submit campus issues digitally
📊 Track Complaints	View complaint status and details
🔔 Notifications	Receive complaint updates
👤 Profile	Manage student account
🔄 Password Reset	Change account password
🗑️ Delete Account	Permanently delete student account
👨‍💼 Admin Portal
Feature	Description
🔐 Admin Login	Dedicated administrator authentication
📊 Dashboard	Complaint statistics and overview
🏫 College Management	College-wise complaint access
🔎 Search	Search complaints quickly
🎯 Status Filters	Filter by complaint status
📄 Complaint Details	View complete complaint information
🏢 Department Assignment	Assign complaints to departments
🔄 Status Updates	Update complaint progress
🗑️ Complaint Deletion	Delete complaints when required
🔔 Notifications	Receive new complaint alerts
👤 Admin Profile	Manage administrator account
🔑 Password Reset	Reset administrator password
🎨 UI Highlights

CampusFix uses a modern mobile-first interface with:

✨ Animated startup screen
🎨 Clean and modern UI
📱 Responsive React Native layouts
🔵 CampusFix branding
🧭 Simple navigation
🔔 Notification indicators
📊 Dashboard statistics
🃏 Modern complaint cards
🔽 Interactive dropdowns
🔄 Loading and refresh states
⚡ Smooth user experience
🛠️ Tech Stack
<div align="center">
Technology	Purpose
⚛️ React Native	Mobile application framework
🔷 TypeScript	Type-safe development
🔥 Firebase Authentication	User authentication
☁️ Cloud Firestore	Database
🔥 React Native Firebase	Firebase integration
🤖 Android	Mobile platform
⚙️ Gradle	Android build system
🚇 Metro	JavaScript bundler
</div>
🏗️ Project Architecture
CampusFixRN/
│
├── 📱 android/
│
├── 📂 src/
│   │
│   ├── 🧩 components/
│   │
│   ├── 📌 constants/
│   │
│   ├── 🔥 firebase/
│   │
│   ├── 🖥️ screens/
│   │   ├── 🔐 auth/
│   │   ├── 👨‍🎓 student/
│   │   └── 👨‍💼 admin/
│   │
│   ├── ⚙️ services/
│   │
│   ├── 📦 types/
│   │
│   └── 🛠️ utils/
│
├── 📄 App.tsx
├── 📦 package.json
├── 🔷 tsconfig.json
├── 📖 README.md
└── 🚫 .gitignore
🔥 Firebase Architecture

CampusFix uses Firebase Authentication + Cloud Firestore.

📚 Firestore Collections
🔥 Firebase
│
├── 👤 users
│
├── 🏫 colleges
│
├── 📝 complaints
│
├── 🔔 notifications
│
└── 👨‍💼 admin_notifications
🔄 Complaint Lifecycle
📝 Submitted
      ↓
📨 Admin Notified
      ↓
👀 Admin Reviews
      ↓
🏢 Department Assigned
      ↓
🔄 In Progress
      ↓
✅ Resolved
      ↓
🔔 Student Notified
📊 Complaint Status
🟡 Submitted
🔵 Assigned
🟠 In Progress
🟢 Resolved
🗂️ Complaint Categories
⚡ Electricity
💧 Water Supply
🧹 Cleanliness
🏫 Classroom
🪑 Furniture
🌐 Internet / Wi-Fi
🚻 Washroom
🛡️ Security
📌 Other
🚦 Priority Levels
Priority	Meaning
🟢 Low	Normal issue
🟡 Medium	Requires attention
🔴 High	Requires urgent attention
🏫 Supported Colleges
College	College ID
🏫 ABC College	001
🏫 XYZ College	002
🏫 Inmantec Institutions	0845
🚀 Installation
1️⃣ Clone Repository
git clone https://github.com/YOUR_USERNAME/CampusFixRN.git
cd CampusFixRN
2️⃣ Install Dependencies
npm install
3️⃣ Firebase Configuration

Add your Firebase Android configuration file:

android/app/google-services.json

🔐 Security: google-services.json should not be committed to a public repository.

4️⃣ Start Metro
npx react-native start
5️⃣ Run Android

Open another terminal:

npx react-native run-android
🧪 TypeScript Check

Run the following command to check TypeScript errors:

npx tsc --noEmit
📦 Build Release APK
cd android
.\gradlew assembleRelease

APK will be generated at:

android/app/build/outputs/apk/release/app-release.apk
🔐 Security

CampusFix uses:

🔥 Firebase Authentication
☁️ Cloud Firestore
🛡️ Firestore Security Rules
🔒 User-specific access control
👨‍💼 College-based admin access
Important Security Rules
👤 Users
   └── Users can create/update their own profile

🎓 Students
   └── Can delete only their own submitted complaints

👨‍💼 Admins
   └── Can manage complaints belonging to their college

🔔 Notifications
   └── Students can access their own notifications

📨 Admin Notifications
   └── Admins can access their own notifications

🏫 Colleges
   └── College data is read-only

⚠️ Never commit passwords, private service-account credentials, API secrets, or Android signing keys.

🎨 Branding

CampusFix uses a dedicated visual identity:

       🎓
    CampusFix

Campus Complaint
Management System
UI Elements
🔵 CampusFix logo
✨ Animated startup screen
📱 Custom Android launcher icon
🎨 Consistent application branding
🧭 Modern navigation experience
🎯 Project Objective

CampusFix aims to provide a centralized digital platform for reporting, tracking and managing campus complaints.

The system reduces dependency on:

❌ Manual Complaint Registers
❌ Paper-Based Tracking
❌ Informal Communication
❌ Unorganized Follow-ups

and provides:

✅ Digital Complaint Submission
✅ Real-Time Complaint Tracking
✅ Centralized Management
✅ Department Assignment
✅ Status Updates
✅ Notifications
🔮 Future Enhancements

The project can be extended with:

🔔 Push Notifications
📎 Complaint Image / Document Attachments
📊 Advanced Analytics & Reports
🚨 Complaint Escalation
📧 Email Notifications
🌐 Web-Based Admin Panel
🏫 Multi-College Deployment
🌙 Dark Mode
👨‍💻 Developer
<div align="center">
Himanshu Yadav

BCA Student • Developer • Tech Enthusiast

💻 Building practical applications
🚀 Exploring modern technologies
🎓 Academic Project — CampusFix

</div>
📄 License

This project was developed as an academic / college project.

<div align="center">
📱 CampusFix

Campus Complaint Management System

Report it. Track it. Resolve it.

<br/>

⭐ If you find this project useful, consider giving the repository a star!

</div> ```
