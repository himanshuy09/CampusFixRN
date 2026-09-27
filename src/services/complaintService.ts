import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  writeBatch,
  setDoc,
  addDoc,
} from '@react-native-firebase/firestore';

import {auth, firestore} from '../firebase/config';

export const complaintCategories = [
  'Electricity',
  'Water Supply',
  'Cleanliness',
  'Classroom',
  'Furniture',
  'Internet / Wi-Fi',
  'Washroom',
  'Security',
  'Other',
];

export const complaintPriorities = [
  'Low',
  'Medium',
  'High',
];

type SubmitComplaintParams = {
  mobileNumber: string;
  category: string;
  location: string;
  priority: string;
  description: string;
};

export const submitComplaint = async ({
  mobileNumber,
  category,
  location,
  priority,
  description,
}: SubmitComplaintParams) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User is not logged in.');
  }

  // ---------------------------------------------------------
  // Get logged-in student's profile
  // ---------------------------------------------------------
  const userRef = doc(firestore, 'users', user.uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    throw new Error('Student profile not found.');
  }

  const userData = userSnapshot.data();

  const name = userData?.name ?? '';
  const email = userData?.email ?? user.email ?? '';
  const rollNumber = userData?.rollNumber ?? '';
  const collegeId = userData?.collegeId ?? '';

  // ---------------------------------------------------------
  // Create complaint document reference
  // ---------------------------------------------------------
  const complaintRef = doc(
    collection(firestore, 'complaints'),
  );

  // Same format as Flutter:
  // CF-2026-XXXXXX
  const year = new Date().getFullYear();

  const complaintId = `CF-${year}-${complaintRef.id
    .substring(0, 6)
    .toUpperCase()}`;

  // ---------------------------------------------------------
  // Create complaint
  // ---------------------------------------------------------
  await setDoc(complaintRef, {
    complaintId,

    // Student details
    userId: user.uid,
    name,
    email,
    rollNumber,
    mobileNumber: mobileNumber.trim(),
    collegeId,

    // Complaint details
    category,
    location: location.trim(),
    description: description.trim(),
    priority,

    // Complaint status
    status: 'Submitted',
    department: '',

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // ---------------------------------------------------------
  // Student notification
  // ---------------------------------------------------------
  await addDoc(collection(firestore, 'notifications'), {
    userId: user.uid,
    complaintId,

    title: 'Complaint Submitted',

    message: `Your complaint ${complaintId} has been submitted successfully.`,

    type: 'submitted',

    isRead: false,

    createdAt: serverTimestamp(),
  });

  // ---------------------------------------------------------
  // Find admins belonging to same college
  // ---------------------------------------------------------
  const adminsQuery = query(
    collection(firestore, 'users'),
    where('collegeId', '==', collegeId),
  );

  const adminSnapshot = await getDocs(adminsQuery);

  // ---------------------------------------------------------
  // Create admin notifications in batch
  // ---------------------------------------------------------
  const batch = writeBatch(firestore);

  adminSnapshot.forEach(adminDoc => {
    const adminData = adminDoc.data();

    if (adminData?.role !== 'admin') {
      return;
    }

    const notificationRef = doc(
      collection(firestore, 'admin_notifications'),
    );

    batch.set(notificationRef, {
      adminId: adminDoc.id,
      collegeId,
      complaintId,

      title: 'New Complaint Received',

      message: `${name} submitted a new ${
        category || 'campus'
      } complaint.`,

      type: 'new_complaint',

      isRead: false,

      createdAt: serverTimestamp(),
    });
  });

  await batch.commit();

  return {
    complaintId,
  };
};