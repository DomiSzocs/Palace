import express from 'express';
import {addPlayerToLobby, createLobby, getLobbyById} from '../firebase/LobbiesDTO.js';
import randomstring from 'randomstring';

const router = express.Router();

router.post('/api/lobbies', async (req, res) => {
    const host = req.body.host.host
    console.log(host);
    const token = req.headers.authorization;
    const room = randomstring.generate({
        length: 6,
        charset: 'alphanumeric',
        capitalization: 'uppercase'
    });

    try {
        await createLobby(room, host);
        res.status(200).send(JSON.stringify({room}));
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong!');
    }
});

router.put('/api/lobbies/:room', async (req, res) => {
    const room = req.params.room;
    const { player } = req.body;
    const token = req.headers.authorization;

    try {
        await addPlayerToLobby(room, player);
        res.status(204).end();
    } catch (error) {
        console.error(error);
        res.status(500).send({error: error.message});
    }
});

router.get('/api/lobbies/:room', async (req, res) => {
    const room = req.params.room;
    const { player } = req.body;
    const token = req.headers.authorization;

    try {
        const data = await getLobbyById(room);
        res.status(200).send(JSON.stringify(data));
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong!');
    }
});

export default router;
