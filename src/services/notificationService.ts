import {
  collection,
  doc,
  getDocs,
  query,
  where,
} from '@react-native-firebase/firestore';

import {firestore} from '../firebase/config';


// --------------------------------------------------
// STUDENT NOTIFICATIONS
// --------------------------------------------------

export const getStudentNotifications = async (
  userId: string,
) => {
  const notificationsQuery = query(
    collection(
      firestore,
      'notifications',
    ),
    where('userId', '==', userId),
  );

  const snapshot = await getDocs(
    notificationsQuery,
  );

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data(),
  }));
};


// --------------------------------------------------
// ADMIN NOTIFICATIONS
// --------------------------------------------------

export const getAdminNotifications = async (
  adminId: string,
) => {
  const notificationsQuery = query(
    collection(
      firestore,
      'admin_notifications',
    ),
    where('adminId', '==', adminId),
  );

  const snapshot = await getDocs(
    notificationsQuery,
  );

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data(),
  }));
};