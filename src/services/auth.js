// ─── AUTH SERVICE (Updated for Role-Based Access) ───

const DEFAULT_USERS = [
  {
    email: "student@test.com",
    password: "1234",
    role: "student",
    name: "Ali Ahmed",
    class: "10",
    section: "A",
    studentId: "S-001",
  },
  {
    email: "teacher@test.com",
    password: "1234",
    role: "teacher",
    name: "Ms. Nadia Hussain",
    teacherId: "T-001",
    department: "Science & Technology",
    subjects: ["Mathematics", "Computer Science"],
    classes: ["10-A", "10-B", "9-A"],
  },
  {
    email: "admin@test.com",
    password: "1234",
    role: "admin",
    name: "Mr. Tariq Mehmood",
    adminId: "A-001",
  },
];

export const login = (email, password) => {
  // Check default demo users first
  const demo = DEFAULT_USERS.find(
    (u) => u.email === email && u.password === password
  );
  if (demo) {
    localStorage.setItem("user", JSON.stringify(demo));
    return { success: true, role: demo.role };
  }

  // Check stored signup users
  const storedUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
  const stored = storedUsers.find(
    (u) => u.email === email && u.password === password
  );
  if (stored) {
    localStorage.setItem("user", JSON.stringify(stored));
    return { success: true, role: stored.role };
  }

  return { success: false };
};

export const signup = (email, password, role = "student", name = "") => {
  const user = {
    email,
    password,
    role,
    name: name || (role === "teacher" ? "New Teacher" : role === "admin" ? "Admin User" : "Student User"),
    ...(role === "student" && { class: "1", section: "A", studentId: `S-${Date.now()}` }),
    ...(role === "teacher" && { teacherId: `T-${Date.now()}`, department: "General", subjects: [], classes: [] }),
    ...(role === "admin"   && { adminId: `A-${Date.now()}` }),
  };

  const existing = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
  existing.push(user);
  localStorage.setItem("registeredUsers", JSON.stringify(existing));
  return user;
};

export const logout = () => {
  localStorage.removeItem("user");
};

export const isAuthenticated = () => {
  return localStorage.getItem("user") !== null;
};

export const getUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

export const getUserRole = () => {
  const user = getUser();
  return user ? user.role : null;
};