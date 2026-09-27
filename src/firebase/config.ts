import {getAuth} from '@react-native-firebase/auth';
import {getFirestore} from '@react-native-firebase/firestore';

export const auth = getAuth();
export const firestore = getFirestore();