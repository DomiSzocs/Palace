import express from 'express';
import {getUsers} from "../firebase/usersDAO.js";

const router = express.Router();

router.get('/api/users', async (req, res) => {
    try {
        const data = await getUsers();
        res.status(200).send(JSON.stringify(data));
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong!');
    }
});

export default router;
