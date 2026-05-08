import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

// ─── Fake Data ────────────────────────────────────────────────
const USERS = {
  "student@college.edu": {
    password: "student123",
    role: "student",
    name: "Akil Kumar",
    id: "STU-2024-001",
    department: "Computer Science",
    year: "3rd Year",
  },
  "admin@college.edu": {
    password: "admin123",
    role: "admin",
    name: "Dr. Priya Sharma",
    id: "ADM-001",
    department: "Administration",
    designation: "Dean of Students",
  },
};

const TODAY_EVENTS = [
  {
    id: 1,
    name: "1st Period — Data Structures",
    time: "09:00 AM - 09:50 AM",
    location: "Room 301, Block A",
    faculty: "Prof. Ramesh",
    status: "ongoing",
    icon: "📘",
  },
  {
    id: 2,
    name: "2nd Period — Operating Systems",
    time: "10:00 AM - 10:50 AM",
    location: "Room 204, Block B",
    faculty: "Dr. Meena",
    status: "upcoming",
    icon: "💻",
  },
  {
    id: 3,
    name: "3rd Period — Computer Networks",
    time: "11:00 AM - 11:50 AM",
    location: "Room 105, Block A",
    faculty: "Prof. Suresh",
    status: "upcoming",
    icon: "🌐",
  },
  {
    id: 4,
    name: "Lunch Break",
    time: "12:00 PM - 01:00 PM",
    location: "Cafeteria",
    faculty: "",
    status: "break",
    icon: "🍽️",
  },
  {
    id: 5,
    name: "4th Period — DBMS Lab",
    time: "01:00 PM - 02:50 PM",
    location: "Lab 3, Block C",
    faculty: "Dr. Kavitha",
    status: "upcoming",
    icon: "🗄️",
  },
  {
    id: 6,
    name: "Guest Seminar — AI in Healthcare",
    time: "03:00 PM - 04:30 PM",
    location: "Auditorium",
    faculty: "Dr. Anand (Guest)",
    status: "upcoming",
    icon: "🎤",
  },
  {
    id: 7,
    name: "Sports / Extracurricular",
    time: "04:30 PM - 05:30 PM",
    location: "Ground / Gym",
    faculty: "Coach Vijay",
    status: "upcoming",
    icon: "⚽",
  },
];

const FAKE_STUDENTS = [
  { name: "Akil Kumar", id: "STU-2024-001", dept: "CSE" },
  { name: "Divya R.", id: "STU-2024-012", dept: "CSE" },
  { name: "Rahul M.", id: "STU-2024-023", dept: "CSE" },
  { name: "Sneha P.", id: "STU-2024-034", dept: "ECE" },
  { name: "Karthik S.", id: "STU-2024-045", dept: "ECE" },
  { name: "Preethi V.", id: "STU-2024-056", dept: "MECH" },
  { name: "Arun D.", id: "STU-2024-067", dept: "CSE" },
  { name: "Lakshmi N.", id: "STU-2024-078", dept: "IT" },
  { name: "Vijay K.", id: "STU-2024-089", dept: "CSE" },
  { name: "Meera S.", id: "STU-2024-090", dept: "IT" },
  { name: "Suresh R.", id: "STU-2024-091", dept: "ECE" },
  { name: "Anitha B.", id: "STU-2024-092", dept: "MECH" },
];

const INITIAL_ASSIGNMENTS = [
  {
    id: 1,
    title: "Stack & Queue Implementation",
    subject: "Data Structures",
    faculty: "Prof. Ramesh",
    description:
      "Implement Stack and Queue using linked list in C++. Include push, pop, enqueue, dequeue operations with proper error handling.",
    dueDate: "2026-04-14",
    maxMarks: 25,
    icon: "📘",
    submissions: [
      {
        studentId: "STU-2024-012",
        studentName: "Divya R.",
        dept: "CSE",
        submittedAt: "2026-04-10 09:30 AM",
        fileName: "stack_queue.cpp",
        grade: 22,
        graded: true,
        feedback: "Excellent implementation!",
      },
      {
        studentId: "STU-2024-023",
        studentName: "Rahul M.",
        dept: "CSE",
        submittedAt: "2026-04-10 02:15 PM",
        fileName: "ds_assignment.cpp",
        grade: 18,
        graded: true,
        feedback: "Good work, but missing error handling.",
      },
      {
        studentId: "STU-2024-067",
        studentName: "Arun D.",
        dept: "CSE",
        submittedAt: "2026-04-11 08:45 AM",
        fileName: "assignment1.cpp",
        grade: null,
        graded: false,
        feedback: "",
      },
      {
        studentId: "STU-2024-089",
        studentName: "Vijay K.",
        dept: "CSE",
        submittedAt: "2026-04-11 10:00 AM",
        fileName: "stacks.cpp",
        grade: null,
        graded: false,
        feedback: "",
      },
    ],
  },
  {
    id: 2,
    title: "Process Scheduling Simulator",
    subject: "Operating Systems",
    faculty: "Dr. Meena",
    description:
      "Build a simulator for FCFS, SJF, and Round Robin scheduling algorithms. Compare their performance with Gantt charts.",
    dueDate: "2026-04-15",
    maxMarks: 30,
    icon: "💻",
    submissions: [
      {
        studentId: "STU-2024-012",
        studentName: "Divya R.",
        dept: "CSE",
        submittedAt: "2026-04-09 11:00 AM",
        fileName: "scheduler.py",
        grade: 28,
        graded: true,
        feedback: "Outstanding work with clear charts.",
      },
      {
        studentId: "STU-2024-023",
        studentName: "Rahul M.",
        dept: "CSE",
        submittedAt: "2026-04-11 01:00 PM",
        fileName: "os_sim.py",
        grade: null,
        graded: false,
        feedback: "",
      },
    ],
  },
  {
    id: 3,
    title: "TCP/IP Socket Programming",
    subject: "Computer Networks",
    faculty: "Prof. Suresh",
    description:
      "Create a client-server chat application using TCP sockets in Python. Implement multi-client support.",
    dueDate: "2026-04-18",
    maxMarks: 20,
    icon: "🌐",
    submissions: [
      {
        studentId: "STU-2024-045",
        studentName: "Karthik S.",
        dept: "ECE",
        submittedAt: "2026-04-10 04:30 PM",
        fileName: "chat_app.py",
        grade: 17,
        graded: true,
        feedback: "Works well. Add error handling for disconnections.",
      },
    ],
  },
  {
    id: 4,
    title: "ER Diagram & Normalization",
    subject: "DBMS",
    faculty: "Dr. Kavitha",
    description:
      "Design an ER diagram for a library management system. Normalize tables up to 3NF and write SQL DDL statements.",
    dueDate: "2026-04-20",
    maxMarks: 20,
    icon: "🗄️",
    submissions: [],
  },
  {
    id: 5,
    title: "AI Ethics Essay",
    subject: "Seminar",
    faculty: "Dr. Anand",
    description:
      "Write a 1500-word essay on ethical implications of AI in healthcare. Include at least 5 academic references.",
    dueDate: "2026-04-22",
    maxMarks: 15,
    icon: "🎤",
    submissions: [],
  },
];

const generateFakeAttendance = () => {
  const records = [];
  FAKE_STUDENTS.forEach((student) => {
    TODAY_EVENTS.filter((e) => e.status !== "break").forEach((event) => {
      const rand = Math.random();
      if (rand > 0.25) {
        records.push({
          studentName: student.name,
          studentId: student.id,
          dept: student.dept,
          eventId: event.id,
          eventName: event.name,
          time: event.time,
          location: event.location,
          verified: rand > 0.35,
          geoMatch: rand > 0.3,
          photoTime: new Date().toLocaleTimeString(),
          confidence: Math.floor(75 + Math.random() * 25),
        });
      }
    });
  });
  return records;
};

// ─── App Component ────────────────────────────────────────────
function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState(() =>
    generateFakeAttendance(),
  );
  const [myAttendance, setMyAttendance] = useState({});
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [mySubmissions, setMySubmissions] = useState({});

  const handleLogin = (email, password) => {
    const u = USERS[email];
    if (u && u.password === password) {
      setUser({ ...u, email });
      setPage(u.role === "student" ? "student" : "admin");
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setUser(null);
    setPage("login");
  };

  const markAttendance = (eventId, verified) => {
    setMyAttendance((prev) => ({
      ...prev,
      [eventId]: { verified, time: new Date().toLocaleTimeString() },
    }));
    if (verified) {
      const event = TODAY_EVENTS.find((e) => e.id === eventId);
      setAttendanceRecords((prev) => [
        ...prev,
        {
          studentName: user.name,
          studentId: user.id,
          dept: "CSE",
          eventId: event.id,
          eventName: event.name,
          time: event.time,
          location: event.location,
          verified: true,
          geoMatch: true,
          photoTime: new Date().toLocaleTimeString(),
          confidence: Math.floor(88 + Math.random() * 12),
        },
      ]);
    }
  };

  const submitAssignment = (assignmentId, fileName, fileData, fileType) => {
    setMySubmissions((prev) => ({
      ...prev,
      [assignmentId]: {
        fileName,
        fileData,
        fileType,
        submittedAt: new Date().toLocaleString(),
        grade: null,
        graded: false,
        feedback: "",
      },
    }));
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === assignmentId) {
          return {
            ...a,
            submissions: [
              ...a.submissions,
              {
                studentId: user.id,
                studentName: user.name,
                dept: "CSE",
                submittedAt: new Date().toLocaleString(),
                fileName,
                fileData,
                fileType,
                grade: null,
                graded: false,
                feedback: "",
              },
            ],
          };
        }
        return a;
      }),
    );
  };

  const gradeSubmission = (assignmentId, studentId, grade, feedback) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === assignmentId) {
          return {
            ...a,
            submissions: a.submissions.map((s) => {
              if (s.studentId === studentId) {
                return { ...s, grade: parseInt(grade), graded: true, feedback };
              }
              return s;
            }),
          };
        }
        return a;
      }),
    );
  };

  const addAssignment = (newAssignment) => {
    setAssignments((prev) => [
      ...prev,
      { ...newAssignment, id: prev.length + 1, submissions: [] },
    ]);
  };

  return (
    <div className="app">
      {page === "login" && <LoginPage onLogin={handleLogin} />}
      {page === "student" && (
        <StudentDashboard
          user={user}
          onLogout={handleLogout}
          events={TODAY_EVENTS}
          myAttendance={myAttendance}
          onMarkAttendance={markAttendance}
          assignments={assignments}
          mySubmissions={mySubmissions}
          onSubmitAssignment={submitAssignment}
        />
      )}
      {page === "admin" && (
        <AdminDashboard
          user={user}
          onLogout={handleLogout}
          records={attendanceRecords}
          events={TODAY_EVENTS}
          assignments={assignments}
          onGradeSubmission={gradeSubmission}
          onAddAssignment={addAssignment}
        />
      )}
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const success = onLogin(email, password);
    if (!success) {
      setError(
        "Invalid credentials. Try student@college.edu / student123 or admin@college.edu / admin123",
      );
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-bg-orb login-bg-orb-1"></div>
      <div className="login-bg-orb login-bg-orb-2"></div>
      <div className="login-bg-orb login-bg-orb-3"></div>

      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <span className="logo-icon">📍</span>
            <span className="logo-text">SCAAP</span>
          </div>
          <p className="login-subtitle">
            AI-Powered Geo-Tagged Attendance & Assignment System
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="spinner"></span>
            ) : (
              <>
                Sign In<span className="btn-arrow">→</span>
              </>
            )}
          </button>
        </form>

        <div className="login-hints">
          <p className="hint-title">Demo Credentials</p>
          <div className="hint-cards">
            <button
              className="hint-card"
              onClick={() => {
                setEmail("student@college.edu");
                setPassword("student123");
              }}
            >
              <span className="hint-icon">🎓</span>
              <div>
                <strong>Student</strong>
                <small>student@college.edu</small>
              </div>
            </button>
            <button
              className="hint-card"
              onClick={() => {
                setEmail("admin@college.edu");
                setPassword("admin123");
              }}
            >
              <span className="hint-icon">👔</span>
              <div>
                <strong>Management</strong>
                <small>admin@college.edu</small>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Student Dashboard ───────────────────────────────────────
function StudentDashboard({
  user,
  onLogout,
  events,
  myAttendance,
  onMarkAttendance,
  assignments,
  mySubmissions,
  onSubmitAssignment,
}) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [activeTab, setActiveTab] = useState("attendance");
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const attendedCount = Object.values(myAttendance).filter(
    (a) => a.verified,
  ).length;
  const totalEvents = events.filter((e) => e.status !== "break").length;
  const pendingAssignments = assignments.filter(
    (a) => !mySubmissions[a.id],
  ).length;

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-header-left">
          <span className="logo-icon-sm">📍</span>
          <span className="logo-text-sm">SCAAP</span>
        </div>
        <div className="dash-header-right">
          <div className="user-pill">
            <span className="user-avatar">🎓</span>
            <span className="user-name">{user.name}</span>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="tab-nav">
        <button
          className={`tab-btn ${activeTab === "attendance" ? "active" : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          📋 Attendance
        </button>
        <button
          className={`tab-btn ${activeTab === "assignments" ? "active" : ""}`}
          onClick={() => setActiveTab("assignments")}
        >
          📝 Assignments
          {pendingAssignments > 0 && (
            <span className="tab-badge">{pendingAssignments}</span>
          )}
        </button>
      </div>

      <main className="dash-main">
        <div className="welcome-section">
          <h1>
            Good{" "}
            {new Date().getHours() < 12
              ? "Morning"
              : new Date().getHours() < 17
                ? "Afternoon"
                : "Evening"}
            , {user.name.split(" ")[0]}! 👋
          </h1>
          <p className="welcome-sub">
            {user.department} • {user.year} • {user.id}
          </p>
        </div>

        {activeTab === "attendance" && (
          <>
            <div className="stats-row">
              <div className="stat-card stat-primary">
                <div className="stat-number">{attendedCount}</div>
                <div className="stat-label">Attended</div>
              </div>
              <div className="stat-card stat-accent">
                <div className="stat-number">{totalEvents}</div>
                <div className="stat-label">Total Events</div>
              </div>
              <div className="stat-card stat-success">
                <div className="stat-number">
                  {totalEvents > 0
                    ? Math.round((attendedCount / totalEvents) * 100)
                    : 0}
                  %
                </div>
                <div className="stat-label">Today's Rate</div>
              </div>
            </div>

            <div className="section-header">
              <h2>📅 Today's Schedule</h2>
              <span className="date-badge">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="events-list">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`event-card ${event.status} ${myAttendance[event.id] ? "attended" : ""}`}
                  onClick={() => {
                    if (event.status !== "break" && !myAttendance[event.id]) {
                      setSelectedEvent(event);
                      setShowUpload(true);
                    }
                  }}
                >
                  <div className="event-icon">{event.icon}</div>
                  <div className="event-info">
                    <h3 className="event-name">{event.name}</h3>
                    <p className="event-time">🕐 {event.time}</p>
                    <p className="event-location">📍 {event.location}</p>
                    {event.faculty && (
                      <p className="event-faculty">👤 {event.faculty}</p>
                    )}
                  </div>
                  <div className="event-action">
                    {event.status === "break" ? (
                      <span className="badge badge-break">Break</span>
                    ) : myAttendance[event.id] ? (
                      <span className="badge badge-done">✅ Done</span>
                    ) : event.status === "ongoing" ? (
                      <span className="badge badge-live pulse">● LIVE</span>
                    ) : (
                      <span className="badge badge-mark">Mark →</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "assignments" && (
          <>
            <div className="stats-row">
              <div className="stat-card stat-primary">
                <div className="stat-number">{assignments.length}</div>
                <div className="stat-label">Total</div>
              </div>
              <div className="stat-card stat-warning">
                <div className="stat-number">{pendingAssignments}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-card stat-success">
                <div className="stat-number">
                  {Object.keys(mySubmissions).length}
                </div>
                <div className="stat-label">Submitted</div>
              </div>
            </div>

            <div className="section-header">
              <h2>📝 Your Assignments</h2>
            </div>

            <div className="assignments-list">
              {assignments.map((assignment) => {
                const submitted = mySubmissions[assignment.id];
                const dueDate = new Date(assignment.dueDate);
                const isOverdue = dueDate < new Date() && !submitted;
                const daysLeft = Math.ceil(
                  (dueDate - new Date()) / (1000 * 60 * 60 * 24),
                );

                return (
                  <div
                    key={assignment.id}
                    className={`assignment-card ${submitted ? "submitted" : ""} ${isOverdue ? "overdue" : ""}`}
                    onClick={() =>
                      !submitted && setSelectedAssignment(assignment)
                    }
                  >
                    <div className="assignment-icon">{assignment.icon}</div>
                    <div className="assignment-info">
                      <h3 className="assignment-title">{assignment.title}</h3>
                      <p className="assignment-subject">
                        {assignment.subject} • {assignment.faculty}
                      </p>
                      <p className="assignment-desc">
                        {assignment.description}
                      </p>
                      <div className="assignment-meta">
                        <span className="assignment-due">
                          📅 Due:{" "}
                          {dueDate.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                          {!submitted && !isOverdue && daysLeft > 0 && (
                            <span className="days-left">
                              {" "}
                              ({daysLeft}d left)
                            </span>
                          )}
                        </span>
                        <span className="assignment-marks">
                          🏆 {assignment.maxMarks} marks
                        </span>
                      </div>
                    </div>
                    <div className="assignment-action">
                      {submitted ? (
                        submitted.graded ? (
                          <div className="grade-display">
                            <span className="grade-score">
                              {submitted.grade}/{assignment.maxMarks}
                            </span>
                            <span className="badge badge-done">Graded ✅</span>
                          </div>
                        ) : (
                          <span className="badge badge-pending">
                            Submitted 📤
                          </span>
                        )
                      ) : isOverdue ? (
                        <span className="badge badge-overdue">Overdue ⚠️</span>
                      ) : (
                        <span className="badge badge-mark">Upload →</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {showUpload && selectedEvent && (
        <PhotoUploadModal
          event={selectedEvent}
          onClose={() => {
            setShowUpload(false);
            setSelectedEvent(null);
          }}
          onVerified={(verified) => {
            onMarkAttendance(selectedEvent.id, verified);
            setShowUpload(false);
            setSelectedEvent(null);
          }}
        />
      )}

      {selectedAssignment && (
        <AssignmentUploadModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onSubmit={(fileName, fileData, fileType) => {
            onSubmitAssignment(
              selectedAssignment.id,
              fileName,
              fileData,
              fileType,
            );
            setSelectedAssignment(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Assignment Upload Modal (Student) ───────────────────────
function AssignmentUploadModal({ assignment, onClose, onSubmit }) {
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState(null);
  const [fileType, setFileType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setFileType(file.type);
      const reader = new FileReader();
      reader.onload = (ev) => setFileData(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setUploading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setUploading(false);
    setUploaded(true);
    await new Promise((r) => setTimeout(r, 1000));
    onSubmit(fileName, fileData, fileType);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-header">
          <h2>
            {assignment.icon} {assignment.title}
          </h2>
          <p>
            {assignment.subject} • {assignment.faculty} • 🏆{" "}
            {assignment.maxMarks} marks
          </p>
        </div>

        <div className="assignment-detail-desc">
          <h4>📋 Description</h4>
          <p>{assignment.description}</p>
        </div>

        <div className="assignment-detail-due">
          <span>
            📅 Due Date:{" "}
            <strong>
              {new Date(assignment.dueDate).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </strong>
          </span>
        </div>

        {!uploaded ? (
          <div className="upload-section">
            {fileName ? (
              <div className="file-selected">
                <span className="file-icon">📄</span>
                <div className="file-info">
                  <strong>{fileName}</strong>
                  <small>Ready to submit</small>
                </div>
                <button
                  className="file-remove"
                  onClick={() => {
                    setFileName("");
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                className="upload-drop"
                onClick={() => fileRef.current?.click()}
              >
                <span className="upload-plus">📁</span>
                <p>Tap to select your assignment file</p>
                <small>PDF, DOCX, ZIP, CPP, PY, etc.</small>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              onChange={handleFile}
              style={{ display: "none" }}
            />

            <div className="upload-actions">
              {!fileName && (
                <button
                  className="btn btn-outline"
                  onClick={() => fileRef.current?.click()}
                >
                  📎 Choose File
                </button>
              )}
              {fileName && (
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={uploading}
                >
                  {uploading ? (
                    <span className="spinner"></span>
                  ) : (
                    "📤 Submit Assignment"
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="result-section">
            <div className="result-badge verified">
              <span className="result-icon">✅</span>
              <h3>Assignment Submitted!</h3>
            </div>
            <div className="result-details">
              <div className="result-row">
                <span>File</span>
                <strong>{fileName}</strong>
              </div>
              <div className="result-row">
                <span>Status</span>
                <strong className="text-success">Awaiting Review</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Photo Upload Modal ──────────────────────────────────────
function PhotoUploadModal({ event, onClose, onVerified }) {
  const [stage, setStage] = useState("upload");
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    setStage("analyzing");
    await new Promise((r) => setTimeout(r, 1500));
    await new Promise((r) => setTimeout(r, 1000));
    setStage("result");
  };

  const confidenceScore = Math.floor(91 + Math.random() * 9);
  const isVerified = true;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <div className="modal-header">
          <h2>
            {event.icon} {event.name}
          </h2>
          <p>
            📍 {event.location} • 🕐 {event.time}
          </p>
        </div>

        {stage === "upload" && (
          <div className="upload-section">
            <div className="upload-instructions">
              <div className="upload-icon-big">📸</div>
              <h3>Take a Geo-Tagged Photo</h3>
              <p>
                Capture a photo from the venue. Make sure location services are
                enabled for geo-tag verification.
              </p>
            </div>
            {preview ? (
              <div className="preview-container">
                <img src={preview} alt="Preview" className="photo-preview" />
                <div className="geo-tag-info">
                  <span className="geo-badge">📍 Geo-tag detected</span>
                  <small>Lat: 13.0827°N, Lng: 80.2707°E</small>
                </div>
              </div>
            ) : (
              <div
                className="upload-drop"
                onClick={() => fileRef.current?.click()}
              >
                <span className="upload-plus">+</span>
                <p>Tap to capture or upload photo</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFile}
              style={{ display: "none" }}
            />
            <div className="upload-actions">
              {!preview && (
                <button
                  className="btn btn-outline"
                  onClick={() => fileRef.current?.click()}
                >
                  📷 Choose Photo
                </button>
              )}
              {preview && (
                <button className="btn btn-primary" onClick={handleAnalyze}>
                  🤖 Verify with AI
                </button>
              )}
            </div>
          </div>
        )}

        {stage === "analyzing" && (
          <div className="analyzing-section">
            <div className="ai-animation">
              <div className="ai-ring"></div>
              <div className="ai-ring delay-1"></div>
              <div className="ai-ring delay-2"></div>
              <span className="ai-icon">🤖</span>
            </div>
            <h3>AI Verification in Progress...</h3>
            <div className="analysis-steps">
              <AnalysisStep label="Extracting EXIF & geo-tag data" delay={0} />
              <AnalysisStep
                label="Matching GPS coordinates with venue"
                delay={600}
              />
              <AnalysisStep label="Analyzing image authenticity" delay={1200} />
              <AnalysisStep label="Cross-referencing timestamp" delay={1800} />
              <AnalysisStep
                label="Generating verification report"
                delay={2200}
              />
            </div>
          </div>
        )}

        {stage === "result" && (
          <div className="result-section">
            <div
              className={`result-badge ${isVerified ? "verified" : "rejected"}`}
            >
              <span className="result-icon">{isVerified ? "✅" : "❌"}</span>
              <h3>
                {isVerified ? "Attendance Verified!" : "Verification Failed"}
              </h3>
            </div>
            <div className="result-details">
              <div className="result-row">
                <span>AI Confidence</span>
                <div className="confidence-bar">
                  <div
                    className="confidence-fill"
                    style={{ width: `${confidenceScore}%` }}
                  ></div>
                </div>
                <strong>{confidenceScore}%</strong>
              </div>
              <div className="result-row">
                <span>Geo-Tag Match</span>
                <strong className="text-success">✓ Matched</strong>
              </div>
            </div>
            <button
              className="btn btn-primary btn-full"
              onClick={() => onVerified(isVerified)}
            >
              ✓ Confirm & Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AnalysisStep({ label, delay }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), delay + 800);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div className={`analysis-step ${done ? "done" : ""}`}>
      <span className="step-indicator">
        {done ? "✅" : <span className="mini-spinner"></span>}
      </span>
      <span>{label}</span>
    </div>
  );
}

// ─── Admin Dashboard ─────────────────────────────────────────
function AdminDashboard({
  user,
  onLogout,
  records,
  events,
  assignments,
  onGradeSubmission,
  onAddAssignment,
}) {
  const [activeTab, setActiveTab] = useState("attendance");
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [gradingModal, setGradingModal] = useState(null);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);

  const activeEvents = events.filter((e) => e.status !== "break");

  const filteredRecords = records.filter((r) => {
    const matchEvent =
      selectedEvent === "all" || r.eventId === parseInt(selectedEvent);
    const matchSearch =
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchEvent && matchSearch;
  });

  const totalStudents = FAKE_STUDENTS.length;
  const getEventStats = (eventId) => {
    const eventRecords = records.filter((r) => r.eventId === eventId);
    const verified = eventRecords.filter((r) => r.verified).length;
    return {
      total: eventRecords.length,
      verified,
      rate: Math.round((verified / totalStudents) * 100),
    };
  };

  const overallRate = Math.round(
    (records.filter((r) => r.verified).length /
      (totalStudents * activeEvents.length)) *
      100,
  );
  const totalSubmissions = assignments.reduce(
    (sum, a) => sum + a.submissions.length,
    0,
  );
  const ungradedCount = assignments.reduce(
    (sum, a) => sum + a.submissions.filter((s) => !s.graded).length,
    0,
  );

  return (
    <div className="dashboard admin-dashboard">
      <header className="dash-header">
        <div className="dash-header-left">
          <span className="logo-icon-sm">📍</span>
          <span className="logo-text-sm">SCAAP</span>
          <span className="admin-badge">ADMIN</span>
        </div>
        <div className="dash-header-right">
          <div className="user-pill">
            <span className="user-avatar">👔</span>
            <span className="user-name">{user.name}</span>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="tab-nav">
        <button
          className={`tab-btn ${activeTab === "attendance" ? "active" : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          📊 Attendance
        </button>
        <button
          className={`tab-btn ${activeTab === "assignments" ? "active" : ""}`}
          onClick={() => setActiveTab("assignments")}
        >
          📝 Assignments
          {ungradedCount > 0 && (
            <span className="tab-badge">{ungradedCount}</span>
          )}
        </button>
      </div>

      <main className="dash-main">
        <div className="welcome-section">
          <h1>
            {activeTab === "attendance"
              ? "Attendance Dashboard 📊"
              : "Assignment Management 📝"}
          </h1>
          <p className="welcome-sub">
            {user.designation} •{" "}
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        {activeTab === "attendance" && (
          <>
            <div className="stats-row admin-stats">
              <div className="stat-card stat-primary">
                <div className="stat-number">{totalStudents}</div>
                <div className="stat-label">Total Students</div>
              </div>
              <div className="stat-card stat-accent">
                <div className="stat-number">
                  {records.filter((r) => r.verified).length}
                </div>
                <div className="stat-label">Verified Check-ins</div>
              </div>
              <div className="stat-card stat-success">
                <div className="stat-number">{overallRate}%</div>
                <div className="stat-label">Overall Rate</div>
              </div>
              <div className="stat-card stat-warning">
                <div className="stat-number">
                  {records.filter((r) => !r.verified).length}
                </div>
                <div className="stat-label">Flagged</div>
              </div>
            </div>

            <div className="section-header">
              <h2>📋 Event-wise Breakdown</h2>
            </div>

            <div className="event-stats-grid">
              {activeEvents.map((event) => {
                const stats = getEventStats(event.id);
                return (
                  <div
                    key={event.id}
                    className="event-stat-card"
                    onClick={() => setSelectedEvent(String(event.id))}
                  >
                    <div className="event-stat-header">
                      <span className="event-stat-icon">{event.icon}</span>
                      <span className="event-stat-name">
                        {event.name.split("—")[0].trim()}
                      </span>
                    </div>
                    <div className="event-stat-bar">
                      <div
                        className="event-stat-fill"
                        style={{ width: `${stats.rate}%` }}
                      ></div>
                    </div>
                    <div className="event-stat-footer">
                      <span>
                        {stats.verified}/{totalStudents} verified
                      </span>
                      <strong>{stats.rate}%</strong>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="section-header">
              <h2>📃 Attendance Records</h2>
              <div className="filter-row">
                <select
                  className="filter-select"
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                >
                  <option value="all">All Events</option>
                  {activeEvents.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name.split("—")[0].trim()}
                    </option>
                  ))}
                </select>
                <div className="search-wrapper">
                  <span className="search-icon">🔍</span>
                  <input
                    className="search-input"
                    type="text"
                    placeholder="Search student..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="records-table-wrapper">
              <table className="records-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>ID</th>
                    <th>Dept</th>
                    <th>Event</th>
                    <th>Geo-Match</th>
                    <th>Confidence</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record, i) => (
                    <tr
                      key={i}
                      className={record.verified ? "" : "flagged-row"}
                    >
                      <td className="td-student">
                        <span className="student-avatar">
                          {record.studentName[0]}
                        </span>
                        {record.studentName}
                      </td>
                      <td className="td-mono">{record.studentId}</td>
                      <td>
                        <span className="dept-badge">{record.dept}</span>
                      </td>
                      <td className="td-event">
                        {record.eventName.split("—")[0].trim()}
                      </td>
                      <td>
                        {record.geoMatch ? (
                          <span className="text-success">✓ Match</span>
                        ) : (
                          <span className="text-danger">✗ Mismatch</span>
                        )}
                      </td>
                      <td>
                        <div className="mini-confidence">
                          <div className="mini-conf-bar">
                            <div
                              className="mini-conf-fill"
                              style={{
                                width: `${record.confidence}%`,
                                background:
                                  record.confidence > 85
                                    ? "var(--success)"
                                    : "var(--warning)",
                              }}
                            ></div>
                          </div>
                          <span>{record.confidence}%</span>
                        </div>
                      </td>
                      <td>
                        {record.verified ? (
                          <span className="status-badge status-verified">
                            Verified
                          </span>
                        ) : (
                          <span className="status-badge status-flagged">
                            Flagged
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRecords.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">📭</span>
                <p>No records found</p>
              </div>
            )}

            <div className="records-cards-mobile">
              {filteredRecords.map((record, i) => (
                <div
                  key={i}
                  className={`record-card-mobile ${record.verified ? "" : "flagged"}`}
                >
                  <div className="record-card-top">
                    <div className="record-student-info">
                      <span className="student-avatar">
                        {record.studentName[0]}
                      </span>
                      <div>
                        <strong>{record.studentName}</strong>
                        <small>
                          {record.studentId} • {record.dept}
                        </small>
                      </div>
                    </div>
                    {record.verified ? (
                      <span className="status-badge status-verified">
                        Verified
                      </span>
                    ) : (
                      <span className="status-badge status-flagged">
                        Flagged
                      </span>
                    )}
                  </div>
                  <div className="record-card-bottom">
                    <span>📚 {record.eventName.split("—")[0].trim()}</span>
                    <span>
                      {record.geoMatch ? "📍 Matched" : "⚠️ Mismatch"}
                    </span>
                    <span>🤖 {record.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "assignments" && (
          <>
            <div className="stats-row admin-stats">
              <div className="stat-card stat-primary">
                <div className="stat-number">{assignments.length}</div>
                <div className="stat-label">Assignments</div>
              </div>
              <div className="stat-card stat-accent">
                <div className="stat-number">{totalSubmissions}</div>
                <div className="stat-label">Submissions</div>
              </div>
              <div className="stat-card stat-success">
                <div className="stat-number">
                  {totalSubmissions - ungradedCount}
                </div>
                <div className="stat-label">Graded</div>
              </div>
              <div className="stat-card stat-warning">
                <div className="stat-number">{ungradedCount}</div>
                <div className="stat-label">Pending Review</div>
              </div>
            </div>

            <div className="section-header">
              <h2>📚 All Assignments</h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowCreateAssignment(true)}
              >
                + New Assignment
              </button>
            </div>

            <div className="admin-assignments-list">
              {assignments.map((assignment) => {
                const gradedCount = assignment.submissions.filter(
                  (s) => s.graded,
                ).length;
                const avgGrade =
                  assignment.submissions.filter((s) => s.graded).length > 0
                    ? Math.round(
                        assignment.submissions
                          .filter((s) => s.graded)
                          .reduce((sum, s) => sum + s.grade, 0) / gradedCount,
                      )
                    : "-";

                return (
                  <div key={assignment.id} className="admin-assignment-card">
                    <div className="admin-assignment-header">
                      <div className="admin-assignment-title-row">
                        <span className="assignment-icon-lg">
                          {assignment.icon}
                        </span>
                        <div>
                          <h3>{assignment.title}</h3>
                          <p>
                            {assignment.subject} • {assignment.faculty} • Due:{" "}
                            {new Date(assignment.dueDate).toLocaleDateString(
                              "en-IN",
                              { day: "numeric", month: "short" },
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="admin-assignment-stats">
                        <span className="mini-stat">
                          📤 {assignment.submissions.length} submissions
                        </span>
                        <span className="mini-stat">
                          ✅ {gradedCount} graded
                        </span>
                        <span className="mini-stat">
                          🏆 Avg: {avgGrade}/{assignment.maxMarks}
                        </span>
                      </div>
                    </div>

                    {assignment.submissions.length > 0 ? (
                      <div className="submissions-list">
                        {assignment.submissions.map((sub, i) => (
                          <div
                            key={i}
                            className={`submission-row ${sub.graded ? "graded" : "ungraded"}`}
                          >
                            <div className="submission-student">
                              <span className="student-avatar">
                                {sub.studentName[0]}
                              </span>
                              <div>
                                <strong>{sub.studentName}</strong>
                                <small>
                                  {sub.studentId} • {sub.dept}
                                </small>
                              </div>
                            </div>
                            <div className="submission-file">
                              <span className="file-chip">
                                📄 {sub.fileName}
                              </span>
                              <small>{sub.submittedAt}</small>
                              {sub.fileData && (
                                <button
                                  className="view-file-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const w = window.open();
                                    w.document.write(
                                      `<html><head><title>${sub.fileName}</title></head><body style="margin:0;background:#1a1a2e;display:flex;align-items:center;justify-content:center;min-height:100vh"><embed src="${sub.fileData}" type="${sub.fileType}" style="width:100%;height:100vh" /></body></html>`,
                                    );
                                  }}
                                >
                                  👁 View File
                                </button>
                              )}
                            </div>
                            <div className="submission-grade-area">
                              {sub.graded ? (
                                <div className="graded-info">
                                  <span className="grade-pill">
                                    {sub.grade}/{assignment.maxMarks}
                                  </span>
                                  <small className="grade-feedback">
                                    {sub.feedback}
                                  </small>
                                </div>
                              ) : (
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() =>
                                    setGradingModal({
                                      assignment,
                                      submission: sub,
                                    })
                                  }
                                >
                                  ✏️ Grade
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-submissions">
                        <span>📭</span> No submissions yet
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {gradingModal && (
        <GradingModal
          assignment={gradingModal.assignment}
          submission={gradingModal.submission}
          onClose={() => setGradingModal(null)}
          onGrade={(grade, feedback) => {
            onGradeSubmission(
              gradingModal.assignment.id,
              gradingModal.submission.studentId,
              grade,
              feedback,
            );
            setGradingModal(null);
          }}
        />
      )}

      {showCreateAssignment && (
        <CreateAssignmentModal
          onClose={() => setShowCreateAssignment(false)}
          onCreate={(data) => {
            onAddAssignment(data);
            setShowCreateAssignment(false);
          }}
        />
      )}
    </div>
  );
}

// ─── Grading Modal ───────────────────────────────────────────
function GradingModal({ assignment, submission, onClose, onGrade }) {
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!grade) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    onGrade(grade, feedback);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <div className="modal-header">
          <h2>✏️ Grade Submission</h2>
          <p>
            {assignment.title} • {submission.studentName}
          </p>
        </div>

        <div className="grading-info">
          <div className="grading-student-card">
            <span className="student-avatar">{submission.studentName[0]}</span>
            <div>
              <strong>{submission.studentName}</strong>
              <small>
                {submission.studentId} • {submission.dept}
              </small>
            </div>
          </div>
          <div className="grading-file">
            <span className="file-chip">📄 {submission.fileName}</span>
            <small>Submitted: {submission.submittedAt}</small>
          </div>
        </div>

        <div className="grading-form">
          <div className="form-group">
            <label>Grade (out of {assignment.maxMarks})</label>
            <div className="input-wrapper">
              <span className="input-icon">🏆</span>
              <input
                type="number"
                min="0"
                max={assignment.maxMarks}
                placeholder={`0 - ${assignment.maxMarks}`}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Feedback (optional)</label>
            <textarea
              className="feedback-textarea"
              placeholder="Write feedback for the student..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            ></textarea>
          </div>
          <button
            className="btn btn-primary btn-full"
            onClick={handleSave}
            disabled={!grade || saving}
          >
            {saving ? <span className="spinner"></span> : "✅ Save Grade"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Assignment Modal ─────────────────────────────────
function CreateAssignmentModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxMarks, setMaxMarks] = useState("");
  const [creating, setCreating] = useState(false);

  const icons = ["📘", "💻", "🌐", "🗄️", "🎤", "📊", "🔬", "📐"];
  const [selectedIcon, setSelectedIcon] = useState("📘");

  const handleCreate = async () => {
    if (!title || !subject || !dueDate || !maxMarks) return;
    setCreating(true);
    await new Promise((r) => setTimeout(r, 800));
    onCreate({
      title,
      subject,
      faculty: "Dr. Priya Sharma",
      description,
      dueDate,
      maxMarks: parseInt(maxMarks),
      icon: selectedIcon,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <div className="modal-header">
          <h2>📝 Create New Assignment</h2>
          <p>Assign work to students</p>
        </div>

        <div className="create-form">
          <div className="form-group">
            <label>Icon</label>
            <div className="icon-picker">
              {icons.map((ic) => (
                <button
                  key={ic}
                  className={`icon-option ${selectedIcon === ic ? "selected" : ""}`}
                  onClick={() => setSelectedIcon(ic)}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Title *</label>
            <div className="input-wrapper">
              <span className="input-icon">📌</span>
              <input
                type="text"
                placeholder="Assignment title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label>Subject *</label>
              <div className="input-wrapper">
                <span className="input-icon">📚</span>
                <input
                  type="text"
                  placeholder="Subject name"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Max Marks *</label>
              <div className="input-wrapper">
                <span className="input-icon">🏆</span>
                <input
                  type="number"
                  placeholder="e.g. 25"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>Due Date *</label>
            <div className="input-wrapper">
              <span className="input-icon">📅</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              className="feedback-textarea"
              placeholder="Describe the assignment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            ></textarea>
          </div>
          <button
            className="btn btn-primary btn-full"
            onClick={handleCreate}
            disabled={!title || !subject || !dueDate || !maxMarks || creating}
          >
            {creating ? (
              <span className="spinner"></span>
            ) : (
              "✅ Create Assignment"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
