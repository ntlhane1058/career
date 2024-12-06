import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import multer from 'multer'; 
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(bodyParser.json()); 

// Setup Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    // Ensure the uploads directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "_" + file.originalname.replace(/\s+/g, '_'); // Remove spaces in filenames
    cb(null, uniqueSuffix); 
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/; 
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
  }
});

// MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "letelemokapela0602", // Update as needed
  database: "career",
  port: '3306'
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Promisify the query function for async/await support
const query = promisify(db.query).bind(db);

// Middleware for error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Fetch users from the database
app.get('/users', async (req, res) => {
  try {
    const sql = "SELECT * FROM users";
    const data = await query(sql);
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error while fetching users." });
  }
});
// Function to get the institution ID by name
async function getInstitutionId(name) {
  const sqlSelect = "SELECT id FROM institutions WHERE name = ?";
  const [result] = await query(sqlSelect, [name]);
  if (result.length > 0) {
    return result[0].id; // Return the first (and probably only) result
  } else {
    throw new Error('Institution not found');
  }
}
// Fetch institutions from the database
app.get('/institutions', async (req, res) => {
  try {
    const sql = "SELECT * FROM institutions";
    const data = await query(sql);
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error while fetching institutions." });
  }
});

// User Registration
app.post('/register', upload.single('profilePicture'), async (req, res) => {
  const { name, email, password, user_type } = req.body;

  if (!name || !email || !password || !user_type || !req.file) {
    return res.status(400).json({ error: "Please provide name, email, password, user_type, and a profile picture." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const sqlCheckEmail = "SELECT * FROM users WHERE email = ?";
  const sqlInsert = "INSERT INTO users (name, email, password, user_type, profile_picture) VALUES (?, ?, ?, ?, ?)";

  try {
    // Check if the email already exists
    const existingUser = await query(sqlCheckEmail, [email]);
    
    if (existingUser.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    // Save the full path to the uploaded file in the database
    const profilePicturePath = req.file.path; // This is the path of the file saved in uploads directory
    console.log("SQL Query:", sqlInsert);
    console.log("Parameters:", [name, email, hashedPassword, user_type, profilePicturePath]);
    
    await query(sqlInsert, [name, email, hashedPassword, user_type, profilePicturePath]);
    
    return res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error('Error during registration:', err);
    return res.status(500).json({ error: "Database error during registration." });
  }
});
// User Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please provide both email and password." });
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  try {
    const data = await query(sql, [email]);
    if (data.length > 0) {
      const user = data[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        return res.status(200).json({
          message: "Login successful",
          user: {
            id: user.id,
            user_type: user.user_type, 
            name: user.name,
            email: user.email,
            profile_picture: user.profile_picture 
          }
        });
      } else {
        return res.status(401).json({ error: "Invalid email or password." });
      }
    } else {
      return res.status(401).json({ error: "Invalid email or password." });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database query error." });
  }
});

// Add a new institution
app.post('/institutions', upload.single('logo'), async (req, res) => {
  const { name, number_of_students, number_of_departments, number_of_courses } = req.body;

  // Validation check
  if (!name || !number_of_students || !number_of_departments || !number_of_courses || !req.file) {
    return res.status(400).json({ error: "Please provide all required fields and a logo." });
  }

  const sql = "INSERT INTO institutions (name, number_of_students, number_of_departments, number_of_courses, logo) VALUES (?, ?, ?, ?, ?)";

  try {
    const result = await query(sql, [name, number_of_students, number_of_departments, number_of_courses, req.file.path]);

    if (result.affectedRows > 0) {
      return res.status(201).json({
        message: "Institution added successfully.",
        institution: {
          id: result.insertId,
          name: name,
          number_of_students: number_of_students,
          number_of_departments: number_of_departments,
          number_of_courses: number_of_courses,
          logo: req.file.path
        }
      });
    } else {
      return res.status(500).json({ error: "Failed to add institution." });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error during adding institution." });
  }
});

// Fetch universities
app.get('/universities', async (req, res) => {
  const sql = "SELECT id, name, number_of_students, number_of_departments, number_of_courses, logo FROM institutions";
  try {
    const results = await query(sql);
    res.json(results);
  } catch (err) {
    console.error('Error fetching universities:', err);
    return res.status(500).json({ error: "Database error while fetching universities." });
  }
});

// Add a new faculty
app.post('/faculties', (req, res) => {
  const { facultyName, institutionId } = req.body;

  // Ensure that the facultyName and institutionId are present
  if (!facultyName || !institutionId) {
      return res.status(400).json({ message: 'Faculty name and institution ID are required.' });
  }

  // Insert into the database (assuming you're using MySQL)
  const query = 'INSERT INTO faculties (name, institution_id) VALUES (?, ?)';
  db.query(query, [facultyName, institutionId], (err, result) => {
      if (err) {
          console.error('Error adding faculty:', err);
          return res.status(500).json({ message: 'Failed to add faculty. Please try again.' });
      }
      res.status(200).json({ message: 'Faculty added successfully' });
  });
});

// Add a new course
app.post('/courses', async (req, res) => {
  const { name, faculty, institution } = req.body;

  if (!name || !faculty || !institution) {
    return res.status(400).json({ error: "Please provide name, faculty, and institution." });
  }

  const sql = "INSERT INTO courses (name, faculty_id, institution_id) VALUES (?, ?, ?)";

  try {
    await query(sql, [name, faculty, institution]);
    return res.status(201).json({ message: "Course added successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error during adding course." });
  }
});

// Fetch courses from the database
app.get('/courses', async (req, res) => {
  try {
    const sql = `
      SELECT 
        c.id, 
        c.name, 
        c.faculty_id, 
        i.name AS university, 
        'High School Diploma, Pass in relevant subjects' AS requirements
      FROM courses c
      JOIN institutions i ON c.institution_id = i.id;
    `;
    const data = await query(sql);
    return res.json(data);
  } catch (err) {
    console.error('Error fetching courses:', err);
    return res.status(500).json({ error: "Database error while fetching courses." });
  }
});

// Fetch faculties from the database
app.get('/faculties', async (req, res) => {
  const sql = "SELECT id, name, institution_id FROM faculties";
  try {
    const results = await query(sql);
    res.json(results);
  } catch (err) {
    console.error('Error fetching faculties:', err);
    return res.status(500).json({ error: "Database error while fetching faculties." });
  }
});

// Delete an institution
app.delete('/institutions/:id', async (req, res) => {
  const institutionId = req.params.id;

  const sql = "DELETE FROM institutions WHERE id = ?";

  try {
    const result = await query(sql, [institutionId]);
    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Institution deleted successfully." });
    } else {
      return res.status(404).json({ error: "Institution not found." });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error during deleting institution." });
  }
});

// Making applications
app.post('/applications', async (req, res) => {
  const { 
      studentName, 
      phoneNumber, 
      student_id, 
      university, 
      course_id, 
      faculty, 
      majorSubject, 
      grades 
  } = req.body;

  // Prepare the grades to insert into the database
  const gradeFields = {};
  grades.forEach((grade, index) => {
      // Ensure we do not exceed the maximum subjects allowed
      if (index < 8) {
          gradeFields[`subject${index + 1}`] = grade.subject || '';
          gradeFields[`grade${index + 1}`] = grade.grade || '';
      }
  });

  // Construct the SQL query with all fields, including grades
  const sqlQuery = `
      INSERT INTO applications (
          student_name, 
          phone_number, 
          student_id, 
          university, 
          course_id, 
          faculty, 
          major_subject, 
          subject1, grade1, 
          subject2, grade2, 
          subject3, grade3, 
          subject4, grade4, 
          subject5, grade5, 
          subject6, grade6, 
          subject7, grade7, 
          subject8, grade8
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
      studentName, 
      phoneNumber, 
      student_id, 
      university, 
      course_id, 
      faculty, 
      majorSubject,
      gradeFields.subject1,
      gradeFields.grade1,
      gradeFields.subject2,
      gradeFields.grade2,
      gradeFields.subject3,
      gradeFields.grade3,
      gradeFields.subject4,
      gradeFields.grade4,
      gradeFields.subject5,
      gradeFields.grade5,
      gradeFields.subject6,
      gradeFields.grade6,
      gradeFields.subject7,
      gradeFields.grade7,
      gradeFields.subject8,
      gradeFields.grade8,
  ];

  try {
      const result = await query(sqlQuery, params);
      res.status(201).json({ message: 'Application submitted successfully', applicationId: result.insertId });
  } catch (err) {
      console.error('Error submitting application:', err);
      res.status(500).json({ error: 'Database error during application submission.' });
  }
});

// Default route to check server status
app.get('/', (req, res) => {
  return res.json('Server is running.');
});

// Start the server
const PORT = process.env.PORT || 8081; 
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
