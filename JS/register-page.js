document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const status = document.getElementById("registerStatus");

  if (!form || !status || !window.RBVAuth) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "Creating account...";

    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    try {
      await window.RBVAuth.register({ name, email, password });
      status.textContent = "Account created. Redirecting...";
      window.location.href = "/";
    } catch (error) {
      status.textContent = error.message;
    }
  });
});
