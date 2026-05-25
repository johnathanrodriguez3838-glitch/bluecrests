import express from "express";
import path from "path";
import cors from "cors";
import pg from "pg";
import { createServer as createViteServer } from "vite";

// Fallback user data
const DEFAULT_USER = {
  surname: "Barbara",
  middleName: "",
  lastName: "Brockman",
  username: "Barbara98",
  email: "brockmanbarbara8@gmail.com",
  pin: "1975",
  dob: "1975",
  phone: "252 203 3663",
  country: "United States of America",
  state: "NC",
  city: "Cary",
  balance: 3800000,
  gender: "Female",
  occupation: "",
  address: "105 Woodland Ridg Court Cary NC",
  account_number: "****9995",
  branch_code: "RBSUS002",
  password: "Personal@444",
  transfer_count: 0
};

const DEFAULT_TRANSACTIONS = [
  {
    id: "TXN-204881",
    name: "TechNova Ltd",
    date: "2020-01-14",
    time: "09:00",
    amount: 4850.00,
    type: 'credit',
    status: 'Completed',
    category: 'Salary'
  },
  {
    id: "TXN-204997",
    name: "Amazon Marketplace",
    date: "2020-02-03",
    time: "14:25",
    amount: 129.99,
    type: 'debit',
    status: 'Completed',
    category: 'Purchase'
  },
  {
    id: "TXN-205114",
    name: "International Wire",
    date: "2020-03-11",
    time: "11:15",
    amount: 2300.00,
    type: 'debit',
    status: 'Completed',
    category: 'Transfer'
  },
  {
    id: "TXN-205332",
    name: "Electricity Utility",
    date: "2020-04-06",
    time: "16:40",
    amount: 215.40,
    type: 'debit',
    status: 'Completed',
    category: 'Payment'
  },
  {
    id: "TXN-205781",
    name: "ATM Cash Withdrawal",
    date: "2020-05-19",
    time: "20:10",
    amount: 500.00,
    type: 'debit',
    status: 'Completed',
    category: 'Withdrawal'
  },
  {
    id: "TXN-206143",
    name: "Apple Services",
    date: "2020-06-27",
    time: "10:30",
    amount: 89.99,
    type: 'credit',
    status: 'Completed',
    category: 'Refund'
  },
  {
    id: "TXN-206544",
    name: "Vehicle Insurance",
    date: "2020-08-08",
    time: "13:45",
    amount: 740.00,
    type: 'debit',
    status: 'Completed',
    category: 'Payment'
  },
  {
    id: "TXN-206901",
    name: "Business Client",
    date: "2020-09-16",
    time: "08:20",
    amount: 6200.00,
    type: 'credit',
    status: 'Completed',
    category: 'Transfer'
  },
  {
    id: "TXN-207334",
    name: "Hilton Hotel",
    date: "2020-10-21",
    time: "19:50",
    amount: 1120.50,
    type: 'debit',
    status: 'Completed',
    category: 'Travel'
  },
  {
    id: "TXN-207998",
    name: "Year-End Bonus",
    date: "2020-12-12",
    time: "12:00",
    amount: 3500.00,
    type: 'credit',
    status: 'Completed',
    category: 'Bonus'
  }
];

// In-memory fallback database
let fallbackUser = { ...DEFAULT_USER };
let fallbackTransactions = [...DEFAULT_TRANSACTIONS];

// PostgreSQL pool initialization (safeguarded)
let pool: pg.Pool | null = null;
const dbUrl = process.env.DATABASE_URL;

if (dbUrl) {
  console.log("Initializing Postgres pool with database URL...");
  pool = new pg.Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false } // Crucial for cloud databases like Neon Postgres
  });
} else {
  console.log("DATABASE_URL env var not detected. Running with in-memory fallback state.");
}

// Function to initialize tables inside DB
async function runMigrations() {
  if (!pool) return;
  try {
    const client = await pool.connect();
    console.log("Running migrations...");
    try {
      // 1. Users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          email VARCHAR(255) PRIMARY KEY,
          surname VARCHAR(255),
          middle_name VARCHAR(255),
          last_name VARCHAR(255),
          username VARCHAR(255),
          pin VARCHAR(255),
          dob VARCHAR(255),
          phone VARCHAR(255),
          country VARCHAR(255),
          state VARCHAR(255),
          city VARCHAR(255),
          balance NUMERIC DEFAULT 3800000,
          gender VARCHAR(100),
          occupation VARCHAR(255),
          address TEXT,
          account_number VARCHAR(255),
          branch_code VARCHAR(255),
          password VARCHAR(255),
          transfer_count INT DEFAULT 0
        );
      `);

      // 2. Transactions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id VARCHAR(255) PRIMARY KEY,
          user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
          name VARCHAR(255),
          date VARCHAR(255),
          time VARCHAR(255),
          amount NUMERIC,
          type VARCHAR(100),
          status VARCHAR(100),
          category VARCHAR(255)
        );
      `);

      // 3. Check and seed default user
      const userRes = await client.query("SELECT * FROM users WHERE email = $1", [DEFAULT_USER.email]);
      if (userRes.rows.length === 0) {
        console.log("Seeding default user into PG...");
        await client.query(`
          INSERT INTO users (
            email, surname, middle_name, last_name, username, pin, dob, phone,
            country, state, city, balance, gender, occupation, address,
            account_number, branch_code, password, transfer_count
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        `, [
          DEFAULT_USER.email, DEFAULT_USER.surname, DEFAULT_USER.middleName, DEFAULT_USER.lastName,
          DEFAULT_USER.username, DEFAULT_USER.pin, DEFAULT_USER.dob, DEFAULT_USER.phone,
          DEFAULT_USER.country, DEFAULT_USER.state, DEFAULT_USER.city, DEFAULT_USER.balance,
          DEFAULT_USER.gender, DEFAULT_USER.occupation, DEFAULT_USER.address,
          DEFAULT_USER.account_number, DEFAULT_USER.branch_code, DEFAULT_USER.password, DEFAULT_USER.transfer_count
        ]);
      }

      // 4. Check and seed default transactions
      const txnRes = await client.query("SELECT * FROM transactions LIMIT 1");
      if (txnRes.rows.length === 0) {
        console.log("Seeding default transactions into PG...");
        for (const t of DEFAULT_TRANSACTIONS) {
          await client.query(`
            INSERT INTO transactions (id, user_email, name, date, time, amount, type, status, category)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [t.id, DEFAULT_USER.email, t.name, t.date, t.time, t.amount, t.type, t.status, t.category]);
        }
      }

      console.log("Migrations and Seeding complete!");
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Failed to run migrations. Connection error:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(cors());
  app.use(express.json());

  // Run migrations safely
  await runMigrations();

  // API Routes:
  // 1. Clear database state (fresh state function for "go freshly on every browser")
  app.post("/api/reset", async (req, res) => {
    console.log("Resetting database to default/fresh states...");
    if (pool) {
      try {
        await pool.query("DELETE FROM transactions");
        await pool.query("DELETE FROM users");
        // re-run migrations to seed again
        await runMigrations();
        return res.json({ status: "success", message: "Database reset to original clean state successfully!" });
      } catch (err: any) {
        console.error("DB Reset error:", err);
        return res.status(500).json({ error: err.message });
      }
    } else {
      fallbackUser = { ...DEFAULT_USER };
      fallbackTransactions = [...DEFAULT_TRANSACTIONS];
      return res.json({ status: "success", message: "Fallback in-memory database reset successfully!" });
    }
  });

  // 2. Fetch User Profile
  app.get("/api/user", async (req, res) => {
    const email = (req.query.email as string || DEFAULT_USER.email).toLowerCase();
    if (pool) {
      try {
        const { rows } = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1", [email]);
        if (rows.length > 0) {
          const user = rows[0];
          // Map snake_case database fields back to camelCase properties matching UserProfile type in React
          return res.json({
            surname: user.surname,
            middleName: user.middle_name || "",
            lastName: user.last_name,
            username: user.username,
            email: user.email,
            pin: user.pin,
            dob: user.dob,
            phone: user.phone,
            country: user.country,
            state: user.state,
            city: user.city,
            balance: Number(user.balance),
            gender: user.gender,
            occupation: user.occupation || "",
            address: user.address,
            accountNumber: user.account_number,
            branchCode: user.branch_code,
            transfer_count: Number(user.transfer_count)
          });
        } else {
          return res.status(404).json({ error: "User not found" });
        }
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    } else {
      return res.json(fallbackUser);
    }
  });

  // 3. Fetch Transactions
  app.get("/api/transactions", async (req, res) => {
    const email = (req.query.email as string || DEFAULT_USER.email).toLowerCase();
    if (pool) {
      try {
        const { rows } = await pool.query(
          "SELECT * FROM transactions WHERE LOWER(user_email) = $1 ORDER BY date DESC, time DESC",
          [email]
        );
        const formattedTxns = rows.map(t => ({
          id: t.id,
          name: t.name,
          date: t.date,
          time: t.time,
          amount: Number(t.amount),
          type: t.type,
          status: t.status,
          category: t.category
        }));
        return res.json(formattedTxns);
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    } else {
      return res.json(fallbackTransactions);
    }
  });

  // 4. Create Transaction
  app.post("/api/transfers", async (req, res) => {
    const {
      user_email,
      recipient_name,
      amount,
      category,
      type,
      status, // 'Pending' or 'Completed'
      id, // optionally supplied txnId
    } = req.body;

    const email = (user_email || DEFAULT_USER.email).toLowerCase();
    const txnId = id || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const dateStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    if (pool) {
      try {
        const client = await pool.connect();
        try {
          await client.query("BEGIN");

          // Insert transaction log
          await client.query(`
            INSERT INTO transactions (id, user_email, name, date, time, amount, type, status, category)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [txnId, email, recipient_name, dateStr, timeStr, amount, type, status || 'Pending', category || 'Fund Transfer']);

          await client.query("COMMIT");
          return res.json({
            id: txnId,
            name: recipient_name,
            date: dateStr,
            time: timeStr,
            amount: Number(amount),
            type: type || 'debit',
            status: status || 'Pending',
            category: category || 'Fund Transfer'
          });
        } catch (err) {
          await client.query("ROLLBACK");
          throw err;
        } finally {
          client.release();
        }
      } catch (err: any) {
        console.error("DB error in transfers:", err);
        return res.status(500).json({ error: err.message });
      }
    } else {
      const newTxn = {
        id: txnId,
        name: recipient_name,
        date: dateStr,
        time: timeStr,
        amount: Number(amount),
        type: type || 'debit',
        status: status || 'Pending',
        category: category || 'Fund Transfer'
      };
      fallbackTransactions = [newTxn, ...fallbackTransactions];
      return res.json(newTxn);
    }
  });

  // 5. Complete or Update Pending Transaction
  app.post("/api/transfers/complete", async (req, res) => {
    const { txnId, amount, user_email } = req.body;
    const email = (user_email || DEFAULT_USER.email).toLowerCase();

    if (pool) {
      try {
        const client = await pool.connect();
        try {
          await client.query("BEGIN");

          // Update transaction status in DB to Pending or Completed
          await client.query(
            "UPDATE transactions SET status = 'Pending' WHERE id = $1 AND LOWER(user_email) = $2",
            [txnId, email]
          );

          // Deduct from standard balance and increment count of completed transfers
          await client.query(
            "UPDATE users SET balance = GREATEST(0, balance - $1), transfer_count = transfer_count + 1 WHERE LOWER(email) = $2",
            [amount, email]
          );

          await client.query("COMMIT");
          return res.json({ success: true });
        } catch (err) {
          await client.query("ROLLBACK");
          throw err;
        } finally {
          client.release();
        }
      } catch (err: any) {
        console.error("DB error completing transfer:", err);
        return res.status(500).json({ error: err.message });
      }
    } else {
      // Fallback in-memory
      fallbackUser.balance = Math.max(0, fallbackUser.balance - amount);
      fallbackUser.transfer_count += 1;
      fallbackTransactions = fallbackTransactions.map(t =>
        t.id === txnId ? { ...t, status: 'Pending' as const } : t
      );
      return res.json({ success: true });
    }
  });

  // Serve static assets/Vite HMR
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
