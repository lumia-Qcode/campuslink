export const login = (email, password) => {
  // Check stored user (from signup)
  const storedUser = JSON.parse(localStorage.getItem("user"));

  if (storedUser && storedUser.email === email && storedUser.password === password) {
    return true;
  }

  // Default test user
  if (email === "student@test.com" && password === "1234") {
    const user = {
      email,
      role: "student",
      name: "Ali Ahmed",
      class: "10",
      section: "A"
    };

    localStorage.setItem("user", JSON.stringify(user));
    return true;
  }

  return false;
};

export const signup = (email, password) => {
  const user = {
    email,
    password,
    role: "student",
    name: "Student User",
    class: "1",
    section: "A"
  };

  localStorage.setItem("user", JSON.stringify(user));
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