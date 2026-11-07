# Full-Stack Calculator

A three-part calculator project:
- `frontend/` — React + Vite user interface
- `backend/` — Spring Boot REST API
- `database/` — PostgreSQL schema and setup notes

The calculator performs addition, subtraction, multiplication, and division. Each calculation is sent to the backend and saved in PostgreSQL as history.

## Requirements
- Node.js LTS and npm
- Java 17 or newer
- Maven (or use the included Maven wrapper if you add one)
- PostgreSQL

## 1. Create the database
Create a PostgreSQL database named `calculator_db`.

Example in `psql`:
```sql
CREATE DATABASE calculator_db;
```
The optional reference schema is in `database/schema.sql`. Spring Boot is configured to create/update the table automatically with `ddl-auto=update`.

## 2. Start the backend
Open a terminal in `backend/`.

Set environment variables for your PostgreSQL connection. Example values:
```text
DB_URL=jdbc:postgresql://localhost:5432/calculator_db
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Windows PowerShell example:
```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/calculator_db"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_postgres_password"
$env:CORS_ALLOWED_ORIGINS="http://localhost:5173"
mvn spring-boot:run
```

The API runs at `http://localhost:8080`.

## 3. Start the frontend
Open another terminal in `frontend/`:
```bash
npm install
npm run dev
```
Open the Vite URL shown in the terminal (usually `http://localhost:5173`).

The frontend's development API URL is configured in `frontend/.env.development`.

## API endpoints
- `POST /api/calculations` — calculate and save a result
  ```json
  {"firstNumber":12,"secondNumber":3,"operator":"DIVIDE"}
  ```
- `GET /api/calculations` — list calculation history
- `DELETE /api/calculations` — clear history

Supported operators: `ADD`, `SUBTRACT`, `MULTIPLY`, `DIVIDE`.

## Deploying
Deploy the Spring Boot backend and PostgreSQL database first. Set these backend environment variables:
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `CORS_ALLOWED_ORIGINS` — your exact Netlify site origin, such as `https://your-site.netlify.app`

Then set `VITE_API_URL` in the frontend's Netlify environment variables to:
`https://your-backend-host/api/calculations`

Build the frontend with `npm run build` and publish the `frontend/dist` directory.

Note: CORS is configured for the exact origins in `CORS_ALLOWED_ORIGINS`. Update that variable to include your deployed frontend domain. The backend needs a reachable PostgreSQL database; a database is not bundled in the ZIP.
