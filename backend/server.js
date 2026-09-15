const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database
const db = new Database("talkpro.db");

db.prepare(`
    CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        language TEXT NOT NULL,
        level TEXT NOT NULL,
        course_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

// Add course_id to old databases
try {
    db.prepare(`
        ALTER TABLE registrations
        ADD COLUMN course_id INTEGER
    `).run();

    console.log("Course field added to registrations.");
} catch (error) {
    // Column already exists
}

console.log("TalkPro database is ready.");
// ================================
// COURSES DATABASE
// ================================

db.prepare(`
    CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        language TEXT NOT NULL,
        level TEXT NOT NULL,
        price REAL NOT NULL,
        duration TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

console.log("TalkPro courses database is ready.");

// Home API
app.get("/", (req, res) => {
    res.json({
        message: "TalkPro Backend is running!",
        status: "success"
    });
});

// Registration API
// ===============================
// ADMIN LOGIN
// ===============================

app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    const ADMIN_USERNAME = "admin";
    const ADMIN_PASSWORD = "TalkPro123";

    if (
        username === ADMIN_USERNAME &&
        password === ADMIN_PASSWORD
    ) {
        return res.json({
            success: true,
            message: "Login successful!",
            token: "talkpro-admin-access"
        });
    }

    res.status(401).json({
        success: false,
        message: "Invalid username or password."
    });
});
app.post("/api/register", (req, res) => {
    try {
       const {
    name,
    phone,
    language,
    level,
    course
} = req.body;

        if (!name || !phone || !language || !level || !course) {
            return res.status(400).json({
                success: false,
                message: "Please complete all fields."
            });
        }

       const statement = db.prepare(`
    INSERT INTO registrations
    (name, phone, language, level, course_id)
    VALUES (?, ?, ?, ?, ?)
`);

      const result = statement.run(
    name.trim(),
    phone.trim(),
    language,
    level,
    Number(course)
);

        res.json({
            success: true,
            message: "Registration successful!",
            registrationId: result.lastInsertRowid
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});
// ===============================
// EDIT STUDENT
app.put("/api/registrations/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, phone, language, level } = req.body;

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID."
            });
        }

        if (!name || !phone || !language || !level) {
            return res.status(400).json({
                success: false,
                message: "Please complete all fields."
            });
        }

        const result = db.prepare(`
            UPDATE registrations
            SET name = ?, phone = ?, language = ?, level = ?
            WHERE id = ?
        `).run(
            name.trim(),
            phone.trim(),
            language,
            level,
            id
        );

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        res.json({
            success: true,
            message: "Student updated successfully."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not update student."
        });
    }
});
// DELETE STUDENT
// ===============================

app.delete("/api/registrations/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID."
            });
        }

        const result = db.prepare(`
            DELETE FROM registrations
            WHERE id = ?
        `).run(id);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        res.json({
            success: true,
            message: "Student deleted successfully."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not delete student."
        });
    }
});

// Get registrations
app.get("/api/registrations", (req, res) => {
    try {
       const registrations = db.prepare(`
    SELECT
        registrations.*,
        courses.name AS course_name,
        courses.price AS course_price,
        courses.duration AS course_duration
    FROM registrations
    LEFT JOIN courses
        ON registrations.course_id = courses.id
    ORDER BY registrations.id DESC
`).all();

        res.json(registrations);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not load registrations."
        });
    }
});

// ================================
// ADD COURSE API
// ================================

app.post("/api/courses", (req, res) => {
    try {
        const {
            name,
            language,
            level,
            price,
            duration
        } = req.body;

        if (
            !name ||
            !language ||
            !level ||
            price === undefined ||
            !duration
        ) {
            return res.status(400).json({
                success: false,
                message: "Please complete all course fields."
            });
        }

        const statement = db.prepare(`
            INSERT INTO courses
            (name, language, level, price, duration)
            VALUES (?, ?, ?, ?, ?)
        `);

        const result = statement.run(
            name.trim(),
            language,
            level,
            Number(price),
            duration.trim()
        );

        res.json({
            success: true,
            message: "Course added successfully!",
            courseId: result.lastInsertRowid
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not add course."
        });
    }
});

// ================================
// EDIT COURSE API
// ================================

app.put("/api/courses/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        const {
            name,
            language,
            level,
            price,
            duration
        } = req.body;

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID."
            });
        }

        if (
            !name ||
            !language ||
            !level ||
            price === undefined ||
            !duration
        ) {
            return res.status(400).json({
                success: false,
                message: "Please complete all course fields."
            });
        }

        const result = db.prepare(`
            UPDATE courses
            SET name = ?,
                language = ?,
                level = ?,
                price = ?,
                duration = ?
            WHERE id = ?
        `).run(
            name.trim(),
            language,
            level,
            Number(price),
            duration.trim(),
            id
        );

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Course not found."
            });
        }

        res.json({
            success: true,
            message: "Course updated successfully."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not update course."
        });
    }
});
// ================================
// DELETE COURSE API
// ================================

app.delete("/api/courses/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID."
            });
        }

        const result = db.prepare(`
            DELETE FROM courses
            WHERE id = ?
        `).run(id);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Course not found."
            });
        }

        res.json({
            success: true,
            message: "Course deleted successfully."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not delete course."
        });
    }
});
// ================================
// GET COURSES API
// ================================

app.get("/api/courses", (req, res) => {
    try {
        const courses = db.prepare(`
            SELECT *
            FROM courses
            ORDER BY id DESC
        `).all();

        res.json(courses);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not load courses."
        });
    }
});
// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`TalkPro server is running on port ${PORT}`);
});