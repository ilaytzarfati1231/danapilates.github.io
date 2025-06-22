const { useState, useEffect } = React;

function App() {
  const [page, setPage] = useState("home");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [viewingLessonId, setViewingLessonId] = useState(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [user, setUser] = useState({ name: "", phone: "" });
  const [registerError, setRegisterError] = useState("");

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzOcGX4vvFcteuF4IrwXd-v1K7BsWCNuU2KQ0bFYLRSoQMZmgmBgRyVIoNOw3lp0wDerA/exec";
  const PROXY_URL = "https://corsproxy.io/?" + encodeURIComponent(SCRIPT_URL);

  useEffect(() => {
    if (document.cookie.includes("admin=true")) setIsAdmin(true);
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      console.log("Fetching lessons...");
      const res = await fetch(PROXY_URL);
      const data = await res.json();
      console.log("Lessons fetched:", data);
      setLessons(data);
    } catch (err) {
      console.error("Failed to fetch lessons:", err);
      alert("Couldn't load lessons. Please try again.");
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
    console.log("Registering to lesson ID:", lessonId);
    setRegisterError("");

    if (!user.name || !user.phone) {
      alert("Please enter your name and phone.");
      return;
    }

    try {
      const response = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, name: user.name, phone: user.phone })
      });

      const text = await response.text();
      console.log("Server response:", text);

      if (text === "ALREADY_REGISTERED") {
        alert("You are already registered.");
      } else if (text === "OK") {
        setRegisterSuccess(true);
        alert("Registered! Redirecting to payment app... (simulated)");
        fetchLessons();
      } else {
        alert("Error: " + text);
      }
    } catch (err) {
      alert("Network error: " + err.message);
    }
  };

  const renderRegister = () => {
    if (viewingLessonId) {
      const lesson = lessons.find(l => String(l.id) === String(viewingLessonId));
      if (!lesson) return <p>Lesson not found</p>;

      let registrations = [];
      try {
        registrations = JSON.parse(lesson["registrations JSON"] || "[]");
      } catch {
        registrations = [];
      }

      const capacity = parseInt(lesson.capacity) || 0;
      const spotsLeft = Math.max(0, capacity - registrations.length);

      return (
        <div>
          <button onClick={() => { setViewingLessonId(null); setRegisterSuccess(false); }}>← Back</button>
          <h2>Register for: {lesson.title}</h2>
          <p>{lesson.datetime}</p>
          <p>Spots left: {spotsLeft} / {capacity}</p>
          {registerSuccess && <p style={{ color: "green" }}>✔️ Registered successfully!</p>}
          {registerError && <p style={{ color: "red" }}>{registerError}</p>}
          <input placeholder="Your name" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} /><br />
          <input placeholder="Phone number" value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} /><br />
          <button onClick={() => handleRegister(lesson.id)}>Register & Pay</button>
        </div>
      );
    }

    return (
      <div>
        <h2>Choose a Lesson to Register</h2>
        {lessons.map((lesson) => {
          let registrations = [];
          try {
            registrations = JSON.parse(lesson["registrations JSON"] || "[]");
          } catch {
            registrations = [];
          }

          const capacity = parseInt(lesson.capacity) || 0;
          return (
            <div
              key={lesson.id}
              style={{ border: "1px solid gray", padding: "8px", margin: "4px", cursor: "pointer" }}
              onClick={() => setViewingLessonId(lesson.id)}
            >
              <div><strong>{lesson.title}</strong></div>
              <div>{lesson.datetime}</div>
              <div>Capacity: {capacity}, Registered: {registrations.length}</div>
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
          <input type="password" placeholder="Admin Password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} /><br />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <p>Lesson data is managed in Google Sheets.</p>
          <button onClick={fetchLessons}>🔄 Reload Lessons</button>
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
