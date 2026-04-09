🔥 SkillBridge AI

A full-stack AI-powered education-to-industry bridge platform that connects students, recruiters, and real job/internship opportunities through skill-based matching, learning guidance, and application tracking.

📌 Problem Statement

There is a major disconnect between academic learning and industry requirements. Students struggle to identify relevant skills, real-world opportunities, and career paths, while recruiters face difficulty finding job-ready candidates with validated skills and experience.

Existing platforms operate in silos (learning, jobs, networking), but there is no unified system that connects learning → skill validation → opportunity matching → hiring in one ecosystem.

🚀 Features
Feature	Description
🧠 Skill Matching Engine	Matches student skills with job/internship requirements and generates match percentage
📊 Skill Gap Analysis	Identifies missing skills and shows what students need to improve
📚 Learning Recommendations	Suggests courses based on missing skills
🏢 Opportunities Portal	Students can browse and apply for jobs and internships
📥 Application System	Tracks all student applications with real-time status updates
👨‍💼 Recruiter Dashboard	Recruiters can post jobs/internships and manage applicants
📄 Job Details System	Recruiters can add job title, description, skills, salary, and location
📂 Profile & Resume System	Students can upload skills, projects, and proof submissions
📑 Application Tracking	Students can view applied jobs with status (Applied / Selected / Rejected)
🔍 Search System	Search jobs/internships by title, skills, or company
🔐 Role-Based Access	Separate Student and Recruiter portals

🏗️ Tech Stack
Frontend
⚛️ React.js — UI framework
🎨 TailwindCSS — Styling
🔗 Axios — API calls
🧭 React Router — Navigation
Backend
🟢 Node.js — Runtime
🚀 Express.js — Backend framework
📦 JSON / In-memory DB (hackathon MVP)
🔐 JWT / LocalStorage — Authentication handling
📂 Project Structure

SkillBridge-AI/
├── backend/
│   ├── routes/
│   │   ├── authRoutes.js          # Login/Register APIs
│   │   ├── jobRoutes.js           # Job & Internship APIs
│   │   ├── applicationRoutes.js   # Application handling
│   │   └── userRoutes.js          # Student & recruiter data
│   ├── models/
│   │   ├── userModel.js
│   │   ├── jobModel.js
│   │   └── applicationModel.js
│   ├── server.js                  # Express server entry point
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── StudentDashboard.js
│   │   │   ├── RecruiterDashboard.js
│   │   │   ├── Opportunities.js
│   │   │   ├── MyApplications.js
│   │   │   ├── ManageOpportunities.js
│   │   │   └── LoginRegister.js
│   │   ├── components/
│   │   │   ├── JobCard.js
│   │   │   ├── ApplicationCard.js
│   │   │   └── Navbar.js
│   │   ├── App.js
│   │   └── index.js
│
└── README.md

⚙️ Installation & Setup
Prerequisites
Node.js 16+
npm or yarn
1. Clone Repository
git clone https://github.com/har06ni/bridgegap
cd SkillBridge-AI
2. Backend Setup
cd backend
npm install
node server.js

Backend runs at:

http://localhost:5000
3. Frontend Setup
cd frontend
npm install
npm start

Frontend runs at:

http://localhost:3000
🧠 How It Works
🎯 Skill Matching Flow
Student enters skills in profile
Job/internship contains required skills
System calculates match percentage
Shows eligibility (>=75% required to apply)
📥 Application Flow
Student applies for job/internship
Application is stored in backend
Appears in:
My Applications (Student)
Manage Opportunities (Recruiter)
Recruiter updates status:
Selected / Rejected
Status reflects back in student portal
🏢 Recruiter Flow
Recruiter posts jobs/internships
Adds:
Title
Description
Skills
Salary
Location
Views applicants per job
Shortlists candidates
📈 Scalability
Backend can be upgraded to PostgreSQL/MongoDB for production-scale storage
Matching engine can be enhanced with ML-based recommendation systems
Recruiter dashboard can be extended into enterprise hiring system
Can integrate real APIs (LinkedIn, Coursera, etc.)
💡 Feasibility

SkillBridge AI is built using widely adopted technologies (React, Node.js, Express) and uses a modular architecture. It is lightweight for hackathons but scalable for production-level deployment. The system is designed to evolve into a full-fledged edtech + hiring ecosystem.

🌟 Novelty

Unlike existing platforms:

LinkedIn → networking only
Coursera → learning only
Internshala → internships only

👉 SkillBridge AI combines all three into a single workflow:

Learn → Match → Apply → Track → Get Hired

It introduces skill-based eligibility gating (75% rule) and real-time recruiter feedback loop, making hiring more transparent and structured.

🔧 Key Highlights
Real-time skill matching engine
Application tracking system
Recruiter-controlled hiring workflow
Learning path suggestions based on skill gaps
Dual portal system (Student + Recruiter)
End-to-end hiring lifecycle
⚠️ Disclaimer

This project is built for educational and hackathon purposes only. It simulates hiring workflows and should not be used as a production hiring platform without additional security, validation, and compliance measures.

📜 License

Licensed under the MIT License.

🤝 Contributing
Fork the repository
Create a feature branch
Commit changes
Push and create PR
🧩 Author

Your Name Here
📧 harini19082006@gmail.com

🔗 GitHub: https://github.com/har06ni/bridgegap
