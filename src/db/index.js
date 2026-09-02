import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

export function createDatabase(dbPath = null) {
  const isMemory = dbPath === ':memory:';
  
  if (!isMemory) {
    const targetPath = dbPath || path.join(process.cwd(), 'data', 'momentum.db');
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    dbPath = targetPath;
  }

  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  
  if (!isMemory) {
    db.pragma('journal_mode = WAL');
  }

  // Initialize schema
  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schemaSql);

  return db;
}

let defaultDbInstance = null;

export function getDatabase() {
  if (!defaultDbInstance) {
    defaultDbInstance = createDatabase();
  }
  return defaultDbInstance;
}
