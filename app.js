
// Dana's Pilates Website - Full functionality in plain React

const { useState } = React;

function App() {
  const [page, setPage] = useState("home");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [viewingLessonId, setViewingLessonId] = useState(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const [lessons, setLessons] = useState([]);
  const [newLessonData, setNewLessonData] = useState({ title: "", date: "", time: "", capacity: "" });
  const [user, setUser] = useState({ name: "", phone: "" });

  const handleLogin = () => {
    if (adminPassword === "admin123") {
      setIsAdmin(true);
      setPage("admin");
    } else {
      alert("Incorrect password");
    }
  };

  const addLesson = () => {
    if (newLessonData.title && newLessonData.date && newLessonData.time && newLessonData.capacity) {
      setLessons([
        ...lessons,
        {
          id: Date.now(),
          title: newLessonData.title,
          datetime: `${newLessonData.date} ${newLessonData.time}`,
          capacity: parseInt(newLessonData.capacity),
          registrations: []
        }
      ]);
      setNewLessonData({ title: "", date: "", time: "", capacity: "" });
    }
  };

  const removeLesson = (id) => {
    setLessons(lessons.filter((l) => l.id !== id));
  };

  const handleRegister = (lessonId) => {
    if (user.name && user.phone) {
      let alreadyRegistered = false;
      const updatedLessons = lessons.map((lesson) => {
        if (lesson.id === lessonId) {
          if (lesson.registrations.length >= lesson.capacity) {
            alert("This class is full.");
            return lesson;
          }

          alreadyRegistered = lesson.registrations.some(
            (r) => r.name === user.name && r.phone === user.phone
          );

          if (alreadyRegistered) {
            alert("You have already registered for this lesson.");
            return lesson;
          }

          const updated = {
            ...lesson,
            registrations: [...lesson.registrations, { name: user.name, phone: user.phone, paid: false }],
          };

          setRegisterSuccess(true);
          return updated;
        }
        return lesson;
      });

      if (!alreadyRegistered) {
        setLessons(updatedLessons);
        alert("Redirected to payment. (Simulated)");
      }
    } else {
      alert("Please enter name and phone number.");
    }
  };

  const togglePaymentStatus = (lessonId, index) => {
    const updatedLessons = lessons.map((lesson) => {
      if (lesson.id === lessonId) {
        const updatedRegistrations = [...lesson.registrations];
        updatedRegistrations[index].paid = !updatedRegistrations[index].paid;
        return { ...lesson, registrations: updatedRegistrations };
      }
      return lesson;
    });
    setLessons(updatedLessons);
  };

  const exportCSV = (lesson) => {
    const csvContent = [
      ["Name", "Phone", "Payment Status"],
      ...lesson.registrations.map((r) => [r.name, r.phone, r.paid ? "Paid" : "Unpaid"]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", lesson.title.replace(/\s+/g, "_") + "_registrations.csv");
    link.click();
  };

  const renderRegister = () => {
    if (viewingLessonId !== null) {
      const lesson = lessons.find(l => l.id === viewingLessonId);
      const spotsLeft = lesson.capacity - lesson.registrations.length;
      return (
        <div>
          <button onClick={() => { setViewingLessonId(null); setRegisterSuccess(false); }}>← Back</button>
          <h2>Register for: {lesson.title}</h2>
          <p>{lesson.datetime}</p>
          <p>Spots left: {spotsLeft}</p>
          {registerSuccess && <p className="success">✔️ Registered successfully!</p>}
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
          <div key={lesson.id} className="card" onClick={() => setViewingLessonId(lesson.id)}>
            <div><strong>{lesson.title}</strong></div>
            <div>{lesson.datetime}</div>
            <div>Capacity: {lesson.capacity}, Registered: {lesson.registrations.length}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderNav = () => (
    <div className="flex">
      <button onClick={() => setPage("home")}>Home</button>
      <button onClick={() => setPage("register")}>Register</button>
      <button onClick={() => setPage("admin")}>Admin</button>
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
          <input placeholder="Lesson title" value={newLessonData.title} onChange={(e) => setNewLessonData({ ...newLessonData, title: e.target.value })} /><br/>
          <input placeholder="Date (YYYY-MM-DD)" value={newLessonData.date} onChange={(e) => setNewLessonData({ ...newLessonData, date: e.target.value })} /><br/>
          <input placeholder="Time (HH:MM)" value={newLessonData.time} onChange={(e) => setNewLessonData({ ...newLessonData, time: e.target.value })} /><br/>
          <input placeholder="Capacity" type="number" value={newLessonData.capacity} onChange={(e) => setNewLessonData({ ...newLessonData, capacity: e.target.value })} /><br/>
          <button onClick={addLesson}>Add Lesson</button>

          {lessons.map((lesson) => (
            <div key={lesson.id} className="card">
              <div><strong>{lesson.title}</strong></div>
              <div>{lesson.datetime}</div>
              <div>Capacity: {lesson.capacity}, Registered: {lesson.registrations.length}</div>
              <button onClick={() => exportCSV(lesson)}>Export CSV</button>
              <button onClick={() => removeLesson(lesson.id)}>Remove</button>
              <div>
                <h4>Registrations:</h4>
                {lesson.registrations.map((r, i) => (
                  <div key={i} onClick={() => togglePaymentStatus(lesson.id, i)}>
                    {r.name} ({r.phone}) - <span className={r.paid ? "paid" : "unpaid"}>{r.paid ? "Paid" : "Unpaid"}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      {renderNav()}
      {page === "home" && renderHome()}
      {page === "register" && renderRegister()}
      {page === "admin" && renderAdmin()}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);
