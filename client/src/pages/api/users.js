export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.status(405).json('Method Not Allowed!');
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_GAME_SERVER}/api/users/`);

    if (response.status === 200) {
        const {users} = await response.json();
        res.status(200).send(JSON.stringify(users));
    } else {
        res.status(500).send('Something went wrong!');
    }
}
