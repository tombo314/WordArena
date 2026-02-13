import sqlite3 from "sqlite3";
import path from "node:path";
import { Socket } from "socket.io";

const dbPath = path.join(__dirname, "../../data/users.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )`
  );
});

interface User {
  username: string;
  password: string;
}

function isNameExist(users: User[], username: string): boolean {
  return users.some((u) => u.username === username);
}

function isNamePassExist(users: User[], username: string, password: string): boolean {
  return users.some((u) => u.username === username && u.password === password);
}

export function signup(username: string, password: string, socket: Socket): void {
  db.all<User>(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, rows) => {
      if (err) {
        socket.emit("signup", { value: false });
        return;
      }
      if (isNameExist(rows, username)) {
        socket.emit("signup", { value: false });
        return;
      }
      db.run(
        "INSERT INTO users(username, password) VALUES(?, ?)",
        [username, password],
        (insertErr) => {
          socket.emit("signup", { value: insertErr == null });
        }
      );
    }
  );
}

export function login(username: string, password: string, socket: Socket): void {
  db.all<User>(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, rows) => {
      if (err) {
        socket.emit("login", { value: false });
        return;
      }
      socket.emit("login", { value: isNamePassExist(rows, username, password) });
    }
  );
}
