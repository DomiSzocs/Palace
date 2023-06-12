import express from 'express';
import {addPlayerToLobby, createLobby, getAllPublicLobbies, getLobbyById} from '../firebase/LobbiesDTO.js';
import randomstring from 'randomstring';

const router = express.Router();

router.post('/api/lobbies', async (req, res) => {
    const host = req.body.host.host;
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

    try {
        const data = await getLobbyById(room);
        res.status(200).send(JSON.stringify(data));
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong!');
    }
});

router.get('/api/lobbies', async (req, res) => {

    try {
        const data = await getAllPublicLobbies();
        res.status(200).send(JSON.stringify({lobbies: data}));
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong!');
    }
});

export default router;
