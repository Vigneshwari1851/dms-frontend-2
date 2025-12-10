// Auth token storage and retrieval
const TOKEN_KEY = "auth_token";
const HARDCODED_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJlbWFpbCI6InZpZ25lc2h3YXJpMTg1MUBnbWFpbC5jb20iLCJyb2xlIjoiTWFrZXIiLCJpYXQiOjE3NjUzNDEwNjgsImV4cCI6MTc2NTQyNzQ2OH0.leckKxMYIHENaaabltcb40GLSs5KxBc-JrmYLMHeWJ4";

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const getAuthToken = () => {
  return HARDCODED_TOKEN;
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
