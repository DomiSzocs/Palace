import {doc, getDoc, setDoc, updateDoc} from "firebase/firestore";
import {firestore} from "./fireBaseConfig.js";


export async function updateUserPoints(user) {
    const userRef = doc(firestore, 'users', user.uid);
    const userData = await getDoc(userRef);

    let totalPoints = user.points;
    if (!userData.exists()) {
        await setDoc(userRef, {points: totalPoints, name: user.name})
        return
    }

    totalPoints += userData.data().points;
    await updateDoc(userRef, {points: totalPoints, name: user.name});
}

export async function updateUsersPoints(userPoints) {
    console.log(userPoints)
    userPoints.forEach((user) => {
       updateUserPoints(user);
    });
}
