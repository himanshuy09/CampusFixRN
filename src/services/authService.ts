import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
} from '@react-native-firebase/firestore';

import {auth, firestore} from '../firebase/config';
import {College} from '../constants/colleges';

export const studentSignIn = async (
  loginId: string,
  password: string,
) => {
  let loginEmail = loginId.trim().toLowerCase();

  // Roll number login
  if (!loginEmail.includes('@')) {
    const rollNumber = loginId.trim().toUpperCase();

    const usersQuery = query(
      collection(firestore, 'users'),
      where('rollNumber', '==', rollNumber),
      limit(1),
    );

    const snapshot = await getDocs(usersQuery);

    if (snapshot.empty) {
      throw new Error(
        'No student account found with this roll number.',
      );
    }

    const userData = snapshot.docs[0].data();

    if (!userData?.email) {
      throw new Error(
        'Email address is not available for this account.',
      );
    }

    loginEmail = userData.email.toString().toLowerCase();
  }

  const credential =
    await signInWithEmailAndPassword(
      auth,
      loginEmail,
      password,
    );

  const uid = credential.user.uid;

  const userRef = doc(firestore, 'users', uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await signOut(auth);
    throw new Error('Student profile not found.');
  }

  const userData = userDoc.data();

  const role = userData?.role?.toString() || '';
  const name =
    userData?.name?.toString() || 'Student';
  const collegeId =
    userData?.collegeId?.toString() || '';
  const userEmail =
    userData?.email?.toString() || loginEmail;

  if (role.toLowerCase() !== 'student') {
    await signOut(auth);
    throw new Error(
      'This account is not registered as a student.',
    );
  }

  return {
    uid,
    role,
    name,
    collegeId,
    email: userEmail,

    // Compatibility with existing split screens
    userRole: role,
    userName: name,
    userCollegeId: collegeId,
  };
};

export const studentSignUp = async (
  name: string,
  rollNumber: string,
  email: string,
  password: string,
  selectedCollege: College,
) => {
  const cleanName = name.trim();
  const cleanRoll = rollNumber.trim().toUpperCase();
  const cleanEmail = email.trim().toLowerCase();

  // Check duplicate roll number
  const rollQuery = query(
    collection(firestore, 'users'),
    where('rollNumber', '==', cleanRoll),
    limit(1),
  );

  const rollSnapshot = await getDocs(rollQuery);

  if (!rollSnapshot.empty) {
    throw new Error(
      'An account already exists with this roll number.',
    );
  }

  // Firebase Authentication account
  const credential =
    await createUserWithEmailAndPassword(
      auth,
      cleanEmail,
      password,
    );

  const uid = credential.user.uid;

  // Firestore user profile
  await setDoc(doc(firestore, 'users', uid), {
    userId: uid,
    name: cleanName,
    email: cleanEmail,
    rollNumber: cleanRoll,
    collegeId: selectedCollege.id,
    role: 'student',
    createdAt: new Date(),
  });

  await signOut(auth);

  return {
    uid,
    name: cleanName,
    email: cleanEmail,
    rollNumber: cleanRoll,
    collegeId: selectedCollege.id,
  };
};

export const adminLogin = async (
  email: string,
  password: string,
  selectedCollege: College,
) => {
  const cleanEmail = email.trim().toLowerCase();

  const credential =
    await signInWithEmailAndPassword(
      auth,
      cleanEmail,
      password,
    );

  const uid = credential.user.uid;

  const userRef = doc(firestore, 'users', uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await signOut(auth);
    throw new Error('Admin profile not found.');
  }

  const userData = userDoc.data();

  const role = userData?.role?.toString() || '';
  const collegeId =
    userData?.collegeId?.toString() || '';
  const name =
    userData?.name?.toString() || 'Administrator';
  const userEmail =
    userData?.email?.toString() || cleanEmail;

  if (role.toLowerCase() !== 'admin') {
    await signOut(auth);
    throw new Error(
      'This account is not registered as an administrator.',
    );
  }

  if (collegeId !== selectedCollege.id) {
    await signOut(auth);
    throw new Error(
      'This admin account does not belong to the selected college.',
    );
  }

  return {
    uid,
    role,
    name,
    collegeId,
    email: userEmail,

    // Compatibility with existing split screens
    userRole: role,
    userName: name,
    userCollegeId: collegeId,
  };
};

export const forgotPassword = async (
  email: string,
) => {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error(
      'Please enter a valid email address.',
    );
  }

  await sendPasswordResetEmail(
    auth,
    cleanEmail,
  );

  // Return the normalized email so the Forgot Password screen
  // can use it after the reset request succeeds.
  return cleanEmail;
};

// Compatibility alias used by the split Forgot Password screen
export const sendResetLink = forgotPassword;

export const logoutUser = async () => {
  await signOut(auth);
};
