import {firestore} from "./firebaseAdmin.js"


export async function updateUserPoints(user) {
    const userRef = firestore.collection('users').doc(user.uid);
    const userData = await userRef.get();

    let totalPoints = user.points;
    if (userData.exists) {
        totalPoints += userData.data().points;
    }

    await userRef.set({points: totalPoints, name: user.name})
}

export async function updateUsersPoints(userPoints) {
    userPoints.forEach((user) => {
        updateUserPoints(user);
    });
}

export async function getUsers() {
    const usersRef = firestore.collection('users');
    const usersData = await usersRef.get();
    const returnValue = []
    usersData.forEach((document) => {
        returnValue.push(
            {
                uid: document.id,
                name: document.data().name,
                points: document.data().points
            });
    });

    return {users: returnValue};
}
