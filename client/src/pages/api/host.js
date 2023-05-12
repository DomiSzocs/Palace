export default async function createLobbyApi(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json('Method Not Allowed!');
    }

    const host = req.body;
    const response = await fetch(`${process.env.NEXT_PUBLIC_GAME_SERVER}/api/lobbies`, {
        method: 'POST',
        body: JSON.stringify({
            host: host
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const {room} = await response.json();

    if (response.status === 200) {
        res.status(200).send(JSON.stringify(room));
    } else {
        res.status(400).send(null);
    }
}
