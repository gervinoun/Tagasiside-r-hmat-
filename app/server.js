import express from 'express';
import mariadb from 'mariadb';
import { fileURLToPath } from 'node:url';

export function valid(data) {
  return !!data && ['eesnimi', 'perenimi', 'grupp', 'kommentaar'].every(key =>
    typeof data[key] === 'string' && data[key].length <= 255 && (key === 'kommentaar' || data[key].trim().length > 0)) &&
    Number.isInteger(data.hinne) && data.hinne >= 1 && data.hinne <= 5;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const db = mariadb.createPool({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  const app = express();
  app.use(express.json());
  app.get('/scores', async (req, res) => {
    res.json(await db.query('SELECT * FROM tagasiside ORDER BY id DESC'));
  });
  app.post('/scores', async (req, res) => {
    if (!valid(req.body)) return res.status(400).send('Täida nimi ja grupp. Hinne peab olema täisarv 1–5; tekst kuni 255 märki.');
    const { eesnimi, perenimi, grupp, hinne, kommentaar } = req.body;
    await db.query('INSERT INTO tagasiside (eesnimi, perenimi, grupp, hinne, kommentaar) VALUES (?, ?, ?, ?, ?)',
      [eesnimi, perenimi, grupp, hinne, kommentaar]);
    res.sendStatus(201);
  });
  app.get('/', (req, res) => res.redirect('/opilasevaade.html'));
  app.use(express.static(fileURLToPath(new URL('../frontend', import.meta.url))));
  app.use((error, req, res, next) => {
    console.error(error.message);
    res.status(error.status === 400 ? 400 : 500).send('Päring ebaõnnestus. Proovi uuesti.');
  });
  app.listen(process.env.PORT || 3000, '127.0.0.1');
}
