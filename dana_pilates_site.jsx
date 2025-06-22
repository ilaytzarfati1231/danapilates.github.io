// Dana's Pilates Website - Fixed renderNav undefined error, added renderNav function

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DanaPilatesApp() {
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
    link.setAttribute("download", `${lesson.title.replace(/\s+/g, "_")}_registrations.csv`);
    link.click();
  };

  const renderRegister = () => {
    if (viewingLessonId !== null) {
      const lesson = lessons.find(l => l.id === viewingLessonId);
      const spotsLeft = lesson.capacity - lesson.registrations.length;
      return (
        <div>
          <Button className="mb-4" onClick={() => {
            setViewingLessonId(null);
            setRegisterSuccess(false);
          }}>← Back to all lessons</Button>
          <h2 className="text-xl font-semibold mb-2">Register for: {lesson.title}</h2>
          <p className="text-gray-600 mb-2">{lesson.datetime}</p>
          <p className="text-sm mb-4">Spots left: {spotsLeft}</p>
          {registerSuccess && <p className="text-green-600 font-semibold mb-2">✔️ Registered successfully!</p>}
          <div className="grid gap-2 mb-4">
            <Input
              placeholder="Your name"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
            <Input
              placeholder="Phone number"
              value={user.phone}
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
            />
          </div>
          <Button onClick={() => handleRegister(lesson.id)}>Register & Pay</Button>
        </div>
      );
    }

    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Choose a Lesson to Register</h2>
        {lessons.map((lesson) => (
          <Card key={lesson.id} className="mb-2 cursor-pointer">
            <CardContent className="p-4" onClick={() => setViewingLessonId(lesson.id)}>
              <div className="font-bold">{lesson.title}</div>
              <div className="text-sm text-gray-600">{lesson.datetime}</div>
              <div className="text-sm">Capacity: {lesson.capacity}, Registered: {lesson.registrations.length}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderNav = () => (
    <div className="flex gap-4 mb-6">
      <Button variant={page === "home" ? "default" : "outline"} onClick={() => setPage("home")}>Home</Button>
      <Button variant={page === "register" ? "default" : "outline"} onClick={() => setPage("register")}>Register</Button>
      <Button variant={page === "admin" ? "default" : "outline"} onClick={() => setPage("admin")}>Admin</Button>
    </div>
  );

  const renderHome = () => (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-2">Welcome to Dana's Pilates</h1>
      <p className="text-lg text-gray-600">Sign up for upcoming classes and stay in shape with Dana!</p>
    </div>
  );

  const renderAdmin = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Admin Panel</h2>
      {!isAdmin ? (
        <div className="mb-4">
          <Input
            placeholder="Admin Password"
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
          />
          <Button className="mt-2" onClick={handleLogin}>Login</Button>
        </div>
      ) : (
        <div>
          <div className="grid gap-2 mb-4">
            <Input
              placeholder="Lesson title"
              value={newLessonData.title}
              onChange={(e) => setNewLessonData({ ...newLessonData, title: e.target.value })}
            />
            <Input
              placeholder="Date (YYYY-MM-DD)"
              value={newLessonData.date}
              onChange={(e) => setNewLessonData({ ...newLessonData, date: e.target.value })}
            />
            <Input
              placeholder="Time (HH:MM)"
              value={newLessonData.time}
              onChange={(e) => setNewLessonData({ ...newLessonData, time: e.target.value })}
            />
            <Input
              placeholder="Capacity"
              value={newLessonData.capacity}
              type="number"
              onChange={(e) => setNewLessonData({ ...newLessonData, capacity: e.target.value })}
            />
            <Button onClick={addLesson}>Add Lesson</Button>
          </div>
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="mb-4">
              <CardContent className="p-4">
                <div className="font-bold mb-1">{lesson.title}</div>
                <div className="text-sm text-gray-600 mb-1">{lesson.datetime}</div>
                <div className="text-sm mb-2">Capacity: {lesson.capacity}, Registered: {lesson.registrations.length}</div>
                <Button className="mb-2" onClick={() => exportCSV(lesson)}>Export CSV</Button>
                <Button variant="destructive" onClick={() => removeLesson(lesson.id)} className="ml-2">Remove</Button>
                <div className="mt-2">
                  <h4 className="font-semibold mb-1">Registrations:</h4>
                  {lesson.registrations.map((r, i) => (
                    <div key={i} className="text-sm cursor-pointer" onClick={() => togglePaymentStatus(lesson.id, i)}>
                      {r.name} ({r.phone}) - <span className={r.paid ? "text-green-600" : "text-red-600"}>{r.paid ? "Paid" : "Unpaid"}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {renderNav()}
      {page === "home" && renderHome()}
      {page === "register" && renderRegister()}
      {page === "admin" && renderAdmin()}
    </div>
  );
} 
