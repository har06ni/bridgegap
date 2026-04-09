const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure Multer for File Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json());

// Global Data Variables
let users = [];
let jobs = [];
let applications = [];
let projects = [];

// Persistence Helpers
const loadData = () => {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      users = data.users || [];
      jobs = data.jobs || [];
      applications = data.applications || [];
      projects = data.projects || [];

      // Auto-deduplicate users by email on load
      const seenEmails = new Set();
      users = users.filter(u => {
        const key = u.email.toLowerCase().trim();
        if (seenEmails.has(key)) return false;
        seenEmails.add(key);
        return true;
      });

      // Auto-deduplicate applications by studentEmail+jobId
      const seenApps = new Set();
      applications = applications.filter(a => {
        const key = `${a.studentEmail}_${a.jobId}`;
        if (seenApps.has(key)) return false;
        seenApps.add(key);
        return true;
      });

      console.log('Data loaded from persistent store.');
    } catch (err) {
      console.error('Error loading database:', err);
      seedInitialData();
    }
  } else {
    seedInitialData();
  }
};

const saveData = () => {
  try {
    const data = { users, jobs, applications, projects };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    // console.log('Data saved to disk.');
  } catch (err) {
    console.error('Error saving database:', err);
  }
};

const seedInitialData = () => {
  console.log('Seeding initial data...');
  users = [
    {
      email: 'student@test.com', password: 'password123', name: 'Test Student', role: 'Student',
      skills: ['React', 'Node.js'], interests: 'AI and Web Development',
      courses: ['Full Stack Dev (Coursera)', 'Modern React (Udemy)']
    },
    { email: 'recruiter@test.com', password: 'password123', name: 'Test Recruiter', role: 'Recruiter', company: 'TechCorp' },
    { email: 'jane.smith@example.com', name: 'Jane Smith', role: 'Student', skills: ['React', 'JavaScript', 'TypeScript', 'CSS'], courses: ['Advanced React Patterns', 'Modern CSS'] }
  ];

  jobs = Array(8).fill(0).map((_, i) => ({
    id: i + 1,
    title: ['Frontend Developer', 'Backend Engineer', 'Full Stack Web Developer', 'Python Data Analyst', 'DevOps Engineer', 'UI/UX Design Intern', 'Software Engineer Intern', 'Digital Marketing Intern'][i],
    company: ['TechCorp', 'Innovate Solutions', 'WebWorks', 'Data Analytics Inc', 'Cloud Systems', 'Creative Studio', 'Global Tech', 'Growth Hub'][i],
    skills: [['React', 'JavaScript', 'Tailwind CSS'], ['Node.js', 'Express', 'JavaScript', 'MongoDB', 'SQL'], ['React', 'Node.js', 'Express', 'Tailwind CSS'], ['Python', 'SQL', 'Pandas'], ['Docker', 'Kubernetes', 'AWS', 'Linux'], ['Figma', 'UI Design', 'Prototyping'], ['Java', 'C++', 'Data Structures'], ['SEO', 'Content Writing', 'Social Media']][i],
    type: i < 5 ? 'Job' : 'Internship',
    location: 'Remote',
    salary: '$80,000 - $120,000'
  }));

  applications = [];
  saveData();
};

// Initial load
loadData();

// --- Auth Endpoints ---
app.post('/api/register', (req, res) => {
  const { name, email, password, role, skills, interests, company } = req.body;
  // Normalize email to prevent case-sensitivity duplicates
  const normalizedEmail = (email || '').toLowerCase().trim();
  if (!normalizedEmail) return res.status(400).json({ error: 'Email is required' });
  if (users.find(u => u.email.toLowerCase().trim() === normalizedEmail)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  const newUser = { name, email: normalizedEmail, password, role };
  if (role === 'Student') {
    newUser.skills = typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(s => s.length > 0) : (skills || []);
    newUser.interests = interests || '';
    newUser.courses = typeof req.body.courses === 'string' ? req.body.courses.split(',').map(c => c.trim()).filter(c => c.length > 0) : (req.body.courses || []);
  } else {
    newUser.company = company || '';
  }
  users.push(newUser);
  saveData();
  res.json({ message: 'Registration successful', user: { name, email: normalizedEmail, role } });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  res.json({ message: 'Login successful', user: { ...user } });
});

app.get('/api/profile', (req, res) => {
  const user = users.find(u => u.email === req.query.email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.post('/api/profile', (req, res) => {
  const { email, name, skills, interests, links } = req.body;
  const userIndex = users.findIndex(u => u.email === email);
  if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
  if (name !== undefined) users[userIndex].name = name;
  if (skills !== undefined) users[userIndex].skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
  if (interests !== undefined) users[userIndex].interests = interests;
  if (req.body.courses !== undefined) users[userIndex].courses = Array.isArray(req.body.courses) ? req.body.courses : req.body.courses.split(',').map(c => c.trim()).filter(c => c.length > 0);
  if (links !== undefined) {
    // Accept newline-separated or array
    users[userIndex].links = Array.isArray(links)
      ? links.filter(l => l.trim())
      : links.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  }
  saveData();
  res.json({ message: 'Profile updated successfully', profile: users[userIndex] });
});

// --- Job Endpoints ---
app.get('/api/jobs', (req, res) => {
  const jobsWithCounts = jobs.map(job => ({ ...job, applicantCount: applications.filter(a => a.jobId === job.id).length }));
  res.json(jobsWithCounts);
});

app.post('/api/jobs', (req, res) => {
  const { title, company, type, skills, description, location, salary } = req.body;
  if (!title || !type || !skills) return res.status(400).json({ error: 'Missing required fields' });
  const newJob = { id: Date.now(), title, company, type, description, location, salary, skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(s => s !== '') };
  jobs.unshift(newJob);
  saveData();
  res.json(newJob);
});

app.put('/api/jobs/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const jobIdx = jobs.findIndex(j => j.id === id);
  if (jobIdx === -1) return res.status(404).json({ error: 'Job not found' });
  jobs[jobIdx] = { ...jobs[jobIdx], ...req.body, skills: Array.isArray(req.body.skills) ? req.body.skills : (req.body.skills ? req.body.skills.split(',').map(s => s.trim()).filter(s => s !== '') : jobs[jobIdx].skills) };
  saveData();
  res.json(jobs[jobIdx]);
});

app.delete('/api/jobs/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const jobIdx = jobs.findIndex(j => j.id === id);
  if (jobIdx === -1) return res.status(404).json({ error: 'Job not found' });
  jobs.splice(jobIdx, 1);
  saveData();
  res.json({ message: 'Deleted successfully', id });
});

// --- Application Endpoints ---
app.get('/api/applications/student', (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const studentApps = applications.filter(a => a.studentEmail === email).map(app => {
    const job = jobs.find(j => j.id === app.jobId);
    return { ...app, jobTitle: app.jobTitle || job?.title, company: job?.company, location: job?.location, salary: job?.salary };
  });
  res.json(studentApps);
});

app.post('/api/apply', (req, res) => {
  const { jobId, jobTitle, studentEmail, studentName, matchPercentage, coverMessage, qualification, experience, courses } = req.body;

  // Duplicate guard: one application per student per job
  const alreadyApplied = applications.some(
    a => a.studentEmail === studentEmail && a.jobId === jobId
  );
  if (alreadyApplied) {
    return res.status(409).json({ error: 'You have already applied for this opportunity.' });
  }

  const newApp = { id: Date.now(), jobId, jobTitle, studentEmail, studentName, matchPercentage, coverMessage, status: 'Applied', qualification, experience, courses, appliedAt: new Date().toISOString() };
  applications.push(newApp);
  saveData();
  res.json(newApp);
});

app.get('/api/applications/:jobId', (req, res) => {
  const jobId = parseInt(req.params.jobId);
  const jobApps = applications.filter(app => app.jobId === jobId).map(app => {
    const student = users.find(u => u.email === app.studentEmail);
    return { ...app, studentName: student ? student.name : app.studentName, studentSkills: student ? student.skills : [], studentCourses: student ? student.courses : app.courses };
  });
  res.json(jobApps);
});

app.put('/api/applications/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const appIdx = applications.findIndex(a => a.id === id);
  if (appIdx === -1) return res.status(404).json({ error: 'Not found' });
  applications[appIdx].status = req.body.status;
  // Save rejection remark if provided
  if (req.body.rejectionRemark !== undefined) {
    applications[appIdx].rejectionRemark = req.body.rejectionRemark;
  } else if (req.body.status !== 'Rejected') {
    // Clear remark if moving away from Rejected
    delete applications[appIdx].rejectionRemark;
  }
  saveData();
  res.json(applications[appIdx]);
});

// --- Candidate & Analytics Enpoints ---
app.get('/api/candidates', (req, res) => {
  res.json(users.filter(u => u.role === 'Student').map(u => ({ name: u.name, email: u.email, skills: u.skills, courses: u.courses || [] })));
});

app.post('/api/match/:jobId', (req, res) => {
  const job = jobs.find(j => j.id === parseInt(req.params.jobId));
  const user = users.find(u => u.email === req.body.email);
  if (!job || !user) return res.status(404).json({ error: 'Not found' });
  const matchedSkills = job.skills.filter(s => (user.skills || []).map(us => us.toLowerCase()).includes(s.toLowerCase()));
  const matchPercentage = job.skills.length > 0 ? Math.round((matchedSkills.length / job.skills.length) * 100) : 0;
  res.json({ jobId: job.id, matchPercentage, matchedSkills, missingSkills: job.skills.filter(s => !matchedSkills.includes(s)), courses: user.courses || [] });
});

// --- Project Showcase & Proof Submission ---
app.get('/api/projects', (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  res.json(projects.filter(p => p.studentEmail === email));
});

app.post('/api/projects/upload', upload.array('files'), (req, res) => {
  const { email, title } = req.body;
  if (!email || !title) return res.status(400).json({ error: 'Email and title are required' });
  
  const files = req.files.map(f => ({
    name: f.originalname,
    path: `/uploads/${f.filename}`,
    size: f.size,
    uploadedAt: new Date().toISOString()
  }));

  const newProject = {
    id: Date.now(),
    studentEmail: email,
    title,
    files,
    createdAt: new Date().toISOString()
  };

  projects.push(newProject);
  saveData();
  res.json(newProject);
});

app.delete('/api/projects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Project not found' });
  
  // Cleanup files from disk (optional but recommended)
  projects[idx].files.forEach(f => {
    const fullPath = path.join(__dirname, f.path);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  });

  projects.splice(idx, 1);
  saveData();
  res.json({ message: 'Project deleted successfully' });
});

// --- Static Serving ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// SPA Catch-all
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
