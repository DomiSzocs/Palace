export default async function join(req, res) {
    if (req.method !== 'PUT') {
        res.status(405).json('Method Not Allowed!');
    }
    const {room, player} = req.body;

    const response = await fetch(`${process.env.NEXT_PUBLIC_GAME_SERVER}/api/lobbies/${room}`, {
        method: 'PUT',
        body: JSON.stringify({
            player
        }),
        headers: {
            'Authorization': req.headers.authorization,
            'Content-Type': 'application/json'
        }
    });

    if (response.status === 204) {
        res.status(204).end();
    } else {
        res.status(400).send(response.body);
    }
}

