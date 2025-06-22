// ✅ Dana's Pilates - Fixed App with Add Lesson (Admin) and Lesson Fetch Fix
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
  const [newLesson, setNewLesson] = useState({ title: "", datetime: "", capacity: "" });

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx5UWkyJ0WxFZI_bVA8l_Bj7u8KD__20y3C_oxVxJHMdB8m1Co2QtDj8KKjekvgrncI2g/exec";
  const PROXY_URL = SCRIPT_URL;

  useEffect(() => {
    if (document.cookie.includes("admin=true")) setIsAdmin(true);
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const res = await fetch(PROXY_URL);
      const data = await res.json();

      const validData = data.map((lesson, index) => ({
        id: lesson.id || (index + 1).toString(),
        title: lesson.title || lesson["Title"] || "Untitled",
        datetime: lesson.datetime || lesson["Datetime"] || "",
        capacity: lesson.capacity || lesson["Capacity"] || "0",
        ["registrations JSON"]: lesson["registrations JSON"] || lesson["Registrations JSON"] || "[]"
      }));

      setLessons(validData);
    } catch (err) {
      alert("Couldn't load lessons. Try again.");
      setLessons([]);
    }
  };

  const handleLogin = () => {
    fetchLessons();
    if (adminPassword === "admin123") {
      document.cookie = "admin=true";
      setIsAdmin(true);
      setPage("admin");
    } else {
      alert("Incorrect password");
    }
  };

  const handleLogout = () => {
    fetchLessons();
    document.cookie = "admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    setIsAdmin(false);
    setPage("home");
  };

  const handleRegister = async (lessonId) => {
    fetchLessons();
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

  const handleAddLesson = async () => {
    if (!newLesson.title || !newLesson.datetime || !newLesson.capacity) {
      alert("Fill in all lesson fields.");
      return;
    }
    try {
      const response = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addLesson",
          title: newLesson.title,
          datetime: newLesson.datetime,
          capacity: newLesson.capacity
        })
      });
      const text = await response.text();
      if (text === "OK") {
        alert("Lesson added.");
        setNewLesson({ title: "", datetime: "", capacity: "" });
        fetchLessons();
      } else {
        alert("Error: " + text);
      }
    } catch (err) {
      alert("Add lesson error: " + err.message);
    }
  };

  const renderRegister = () => {
    if (viewingLessonId) {
      const lesson = lessons.find(l => String(l.id) === String(viewingLessonId));
      if (!lesson) return <p>Lesson not found</p>;

      let registrations = [];
      try {
        registrations = JSON.parse(lesson["registrations JSON"] || "[]");
      } catch {}

      const capacity = parseInt(lesson.capacity) || 0;
      const spotsLeft = Math.max(0, capacity - registrations.length);

      return (
        <div>
          <button onClick={() => { setViewingLessonId(null); setRegisterSuccess(false); fetchLessons(); }}>← Back</button>
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

    if (!lessons.length) return <p>Loading lessons...</p>;

    return (
      <div>
        <h2>Choose a Lesson to Register</h2>
        {lessons.map((lesson) => {
          let registrations = [];
          try {
            registrations = JSON.parse(lesson["registrations JSON"] || "[]");
          } catch {}

          const capacity = parseInt(lesson.capacity) || 0;
          return (
            <div
              key={lesson.id}
              style={{ border: "1px solid gray", padding: "8px", margin: "4px", cursor: "pointer" }}
              onClick={() => { setViewingLessonId(lesson.id); fetchLessons(); }}
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

          <h3>Add New Lesson</h3>
          <input placeholder="Title" value={newLesson.title} onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })} /><br />
          <input placeholder="Datetime" value={newLesson.datetime} onChange={(e) => setNewLesson({ ...newLesson, datetime: e.target.value })} /><br />
          <input placeholder="Capacity" value={newLesson.capacity} onChange={(e) => setNewLesson({ ...newLesson, capacity: e.target.value })} /><br />
          <button onClick={handleAddLesson}>➕ Add Lesson</button>
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
