// Dana's Pilates Website - Fully Free Version using Google Sheets + Apps Script

const { useState, useEffect } = React;

function App() {
  const [page, setPage] = useState("home");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [viewingLessonId, setViewingLessonId] = useState(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [newLessonData, setNewLessonData] = useState({ title: "", date: "", time: "", capacity: "" });
  const [user, setUser] = useState({ name: "", phone: "" });

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzOcGX4vvFcteuF4IrwXd-v1K7BsWCNuU2KQ0bFYLRSoQMZmgmBgRyVIoNOw3lp0wDerA/exec";

  useEffect(() => {
    if (document.cookie.includes("admin=true")) setIsAdmin(true);
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    const res = await fetch(SCRIPT_URL);
    const data = await res.json();
    setLessons(data);
  };

  const handleLogin = () => {
    if (adminPassword === "admin123") {
      document.cookie = "admin=true";
      setIsAdmin(true);
      setPage("admin");
    } else {
      alert("Incorrect password");
    }
  };

  const handleLogout = () => {
    document.cookie = "admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    setIsAdmin(false);
    setPage("home");
  };

  const handleRegister = async (lessonId) => {
    if (!user.name || !user.phone) {
      alert("Please enter name and phone.");
      return;
    }

    await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, name: user.name, phone: user.phone })
    });
    setRegisterSuccess(true);
    alert("Redirected to payment app. (Simulated)");
  };

  const renderRegister = () => {
    if (viewingLessonId) {
      const lesson = lessons.find(l => l.id == viewingLessonId);
      const spotsLeft = lesson.capacity - JSON.parse(lesson["registrations JSON"]).length;
      return (
        <div>
          <button onClick={() => { setViewingLessonId(null); setRegisterSuccess(false); }}>← Back</button>
          <h2>Register for: {lesson.title}</h2>
          <p>{lesson.datetime}</p>
          <p>Spots left: {spotsLeft}</p>
          {registerSuccess && <p style={{ color: "green" }}>✔️ Registered successfully!</p>}
          <input placeholder="Your name" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} /><br/>
          <input placeholder="Phone number" value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} /><br/>
          <button onClick={() => handleRegister(lesson.id)}>Register & Pay</button>
        </div>
      );
    }

    return (
      <div>
        <h2>Choose a Lesson to Register</h2>
        {lessons.map((lesson) => (
          <div key={lesson.id} style={{ border: "1px solid gray", padding: "8px", margin: "4px" }} onClick={() => setViewingLessonId(lesson.id)}>
            <div><strong>{lesson.title}</strong></div>
            <div>{lesson.datetime}</div>
            <div>Capacity: {lesson.capacity}, Registered: {JSON.parse(lesson["registrations JSON"]).length}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderNav = () => (
    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
      <button onClick={() => setPage("home")}>Home</button>
      <button onClick={() => setPage("register")}>Register</button>
      <button onClick={() => setPage("admin")}>Admin</button>
      {isAdmin && <button onClick={handleLogout}>Logout</button>}
    </div>
  );

  const renderHome = () => (
    <div>
      <h1>Welcome to Dana's Pilates</h1>
      <p>Sign up for upcoming classes and stay in shape with Dana!</p>
    </div>
  );

  const renderAdmin = () => (
    <div>
      <h2>Admin Panel</h2>
      {!isAdmin ? (
        <div>
          <input type="password" placeholder="Admin Password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} /><br/>
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <p>All lesson data managed via Google Sheets backend.</p>
          <p>To update lessons, use your Google Sheet manually or extend the script.</p>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: "20px" }}>
      {renderNav()}
      {page === "home" && renderHome()}
      {page === "register" && renderRegister()}
      {page === "admin" && renderAdmin()}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);
