export default function join(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json('Method Not Allowed!');
    }
    const code = req.body.code;

    res.status(201).json({resp: code});
}

//TODO add auth and send to game server
