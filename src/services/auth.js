// Mock user database
let users = [
  { email: "student@test.com", password: "123456" }
];


export function signup(email, password) {
  const userExists = users.find(user => user.email === email);
  
  if (userExists) {
    return { success: false, message: "User already exists" };
  }

  users.push({ email, password });
  return { success: true };
}

export function login(email, password) {
  const user = users.find(
    user => user.email === email && user.password === password
  );

  if (user) {
    return { success: true };
  } else {
    return { success: false, message: "Invalid credentials" };
  }
}