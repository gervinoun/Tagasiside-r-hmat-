# Tagasiside

A simple feedback app. Students enter their name, group, a score from 1 to 5, and an optional comment. The teacher page shows all submitted feedback.

The app runs on Node.js and stores feedback in MariaDB. There is no login, so anyone who can access the app can see the feedback.

## Run it again

If you have already set up the project, open Docker Desktop and run these commands from the project folder:

```sh
docker start tagasiside-db
docker exec tagasiside-db healthcheck.sh --connect --innodb_initialized
npm start
```

If the health check fails, wait a few seconds and run it again before starting the app.

- **Submit feedback:** http://localhost:3000
- **View feedback:** http://localhost:3000/opetajavaade.html

Keep the terminal open while using the app. To stop it, press **Ctrl+C**, then run:

```sh
docker stop tagasiside-db
```

Your feedback stays saved between restarts. Keep your existing `.env` file; it contains the database settings for your local setup.

## First-time setup

You need **Node.js 20.6 or newer** (which includes npm) and **Docker Desktop**. Open Docker Desktop before continuing. Run all commands below from the project folder.

### 1. Install the app's dependencies

```sh
npm ci
```

### 2. Create the database container

Run this once for a new database:

```sh
docker run -d --name tagasiside-db \
  -e MARIADB_ROOT_PASSWORD=change-me \
  -e MARIADB_DATABASE=tagasiside \
  -p 127.0.0.1:3307:3306 \
  -v tagasiside-data:/var/lib/mysql \
  mariadb:11
```

The app connects to port **3307** on your computer. MariaDB uses port 3306 inside the container.

Wait for the database to be ready:

```sh
docker exec tagasiside-db healthcheck.sh --connect --innodb_initialized
```

If it fails, wait a few seconds and try the health check again. No output and a successful exit mean it is ready.

### 3. Create the feedback table

For a new database only:

```sh
docker exec -i tagasiside-db mariadb -uroot -pchange-me tagasiside < database/schema.sql
```

**Do not run this import on a database with feedback you want to keep.** The schema replaces the table and deletes its existing records.

### 4. Set the connection details

If `.env` does not exist yet, create it from the example:

```sh
cp -n .env.example .env
```

For the new database created above, edit `.env` to contain:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=root
DB_PASSWORD=change-me
DB_NAME=tagasiside
PORT=3000
```

The example file uses port 3306, so **change `DB_PORT` to `3307` for this Docker setup**. If you already have a working `.env`, keep its username and password rather than replacing them with these example values.

`change-me` is an example password for local development. If you choose another password when creating a new database, use it in the import command and `.env` too. Keep `.env` private; Git ignores it.

### 5. Start the app

```sh
npm start
```

Open http://localhost:3000. For later starts, follow **Run it again** above.

## If something goes wrong

| What you see | What to check |
| --- | --- |
| `Cannot find package 'express'` | Run `npm ci` from the project folder, then `npm start`. |
| Docker cannot connect to its daemon | Open Docker Desktop and wait for it to start. |
| Container name `tagasiside-db` is already in use | The container already exists. Use `docker start tagasiside-db`. |
| Saving or loading feedback fails with HTTP 500 | Check the database health, `.env` port, username and password. The app terminal shows the database error. |
| Connection refused or a pool connection timeout | Make sure MariaDB is running and `DB_PORT=3307` for this Docker setup. |
| `Access denied` | The database rejected the username or password. Use the credentials that were set when this database was first created. |
| The `tagasiside` table does not exist | The initial table import was missed. For an empty database, follow step 3. |
| `EADDRINUSE` | Another process uses port 3000. Set another `PORT` in `.env`, restart the app, and open that port in your browser. |

The `tagasiside-data` Docker volume keeps the database and its credentials. Changing `MARIADB_ROOT_PASSWORD` when recreating a container **does not change the password in an existing volume**. Keep that volume if you want to keep your feedback; use the existing credentials or recover access before making changes.

Restart the app after editing `.env` so it loads the new settings.

## Check the app

```sh
npm test
```

This checks input validation. To check the complete flow, submit feedback in the browser and open the teacher page to confirm it appears.

First name, surname and group are required. Scores must be whole numbers from 1 to 5. Comments are optional, and each text field allows up to 255 characters.

## Using MariaDB without Docker

If MariaDB is already installed on your computer, you can use it directly. Create a database named `tagasiside`, import `database/schema.sql` once into the new database, and set `.env` to its host, port and credentials. Then run `npm ci` and `npm start`.
