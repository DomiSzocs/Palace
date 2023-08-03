import admin from "../firebase/firebaseAdmin.js"

export const verifyToken = async (req, resp, next) => {

    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedValue = await admin.auth().verifyIdToken(token);
        if (decodedValue) {
            return next();
        }
        resp.status(401).send("Invalid token");
    } catch (error) {
        resp.status(401).send("Invalid token");
    }
}
