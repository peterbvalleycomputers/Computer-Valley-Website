document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const status = document.getElementById("loginStatus");

  if (!form || !status || !window.RBVAuth) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "Signing in...";

    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    try {
      const user = await window.RBVAuth.login({ email, password });
      status.textContent = `Welcome back, ${user.name}. Redirecting...`;
      window.location.href = user.role === "admin" ? "/admin.html" : "/";
    } catch (error) {
      status.textContent = error.message;
    }
  });
});
