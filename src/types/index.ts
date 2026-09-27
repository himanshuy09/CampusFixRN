// --------------------------------------------------
// SCREEN
// --------------------------------------------------

export type Screen =
  | 'welcome'
  | 'signin'
  | 'signup'
  | 'admin'
  | 'forgot';

// --------------------------------------------------
// COLLEGE
// --------------------------------------------------

export interface College {
  name: string;
  id: string;
}

// --------------------------------------------------
// USER
// --------------------------------------------------

export interface User {
  userId: string;
  name: string;
  email: string;
  rollNumber?: string;
  collegeId: string;
  role: 'student' | 'admin';
  createdAt?: any;
}

// --------------------------------------------------
// COMPLAINT
// --------------------------------------------------

export interface Complaint {
  id: string;
  userId: string;
  collegeId: string;

  studentName?: string;
  rollNumber?: string;
  email?: string;
  mobileNumber?: string;

  category?: string;
  description?: string;

  status?: string;

  createdAt?: any;
  updatedAt?: any;
}

// --------------------------------------------------
// NOTIFICATION
// --------------------------------------------------

export interface Notification {
  id: string;

  userId?: string;
  adminId?: string;

  title?: string;
  message?: string;

  complaintId?: string;

  isRead?: boolean;

  createdAt?: any;
}

// --------------------------------------------------
// AUTH USER
// --------------------------------------------------

export interface AuthUser {
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  collegeId: string;
}
