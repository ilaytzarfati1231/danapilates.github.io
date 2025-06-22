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
  const [registerError, setRegisterError] = useState("");

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzOcGX4vvFcteuF4IrwXd-v1K7BsWCNuU2KQ0bFYLRSoQMZmgmBgRyVIoNOw3lp0wDerA/exec";

  useEffect(() => {
    if (document.cookie.includes("admin=true")) setIsAdmin(true);
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const res = await fetch(SCRIPT_URL);
      const data = await res.json();
      setLessons(data);
    } catch (err) {
      console.error("Failed to fetch lessons:", err);
    }
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
    console.log("Attempting to register for lesson ID:", lessonId);
    setRegisterError("");

    if (!user.name || !user.phone) {
      alert("Please enter name and phone.");
      return;
    }

    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, name: user.name, phone: user.phone })
      });
      const text = await response.text();
      console.log("Response from script:", text);

      if (text === "ALREADY_REGISTERED") {
        alert("You are already registered for this lesson.");
      } else if (text === "OK") {
        setRegisterSuccess(true);
        alert("Redirected to payment app. (Simulated)");
        fetchLessons();
      } else {
        setRegisterError("Unexpected server response: " + text);
        alert("Unexpected server response: " + text);
      }
    } catch (err) {
      console.error("Registration failed:", err);
      setRegisterError("Registration failed: " + err.message);
      alert("An error occurred: " + err.message);
    }
  };

  const renderRegister = () => {
    if (viewingLessonId) {
      const lesson = lessons.find(l => l.id == viewingLessonId);
      if (!lesson) return <p>Lesson not found</p>;

      const registrations = JSON.parse(lesson["registrations JSON"] || "[]");
      const spotsLeft = lesson.capacity - registrations.length;
      return (
        <div>
          <button onClick={() => { setViewingLessonId(null); setRegisterSuccess(false); }}>← Back</button>
          <h2>Register for: {lesson.title}</h2>
          <p>{lesson.datetime}</p>
          <p>Spots left: {spotsLeft}</p>
          {registerSuccess && <p style={{ color: "green" }}>✔️ Registered successfully!</p>}
          {registerError && <p style={{ color: "red" }}>{registerError}</p>}
          <input placeholder="Your name" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} /><br/>
          <input placeholder="Phone number" value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} /><br/>
          <button onClick={() => handleRegister(lesson.id)}>Register & Pay</button>
        </div>
      );
    }

    return (
      <div>
        <h2>Choose a Lesson to Register</h2>
        {lessons.map((lesson) => {
          const registrations = JSON.parse(lesson["registrations JSON"] || "[]");
          return (
            <div key={lesson.id} style={{ border: "1px solid gray", padding: "8px", margin: "4px" }} onClick={() => setViewingLessonId(lesson.id)}>
              <div><strong>{lesson.title}</strong></div>
              <div>{lesson.datetime}</div>
              <div>Capacity: {lesson.capacity}, Registered: {registrations.length}</div>
            </div>
          );
        })}
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
