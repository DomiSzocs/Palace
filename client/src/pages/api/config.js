import fs from 'fs'
import path from 'path';

export default async function handler(req, res) {
    const configPath = path.join('src', 'util', 'cardLayout.json')
    await fs.readFile(configPath, 'utf-8', (err, data) => {
        res.status(200).send({config:data});
    });
}
