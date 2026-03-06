document.addEventListener("DOMContentLoaded", async () => {
  const status = document.getElementById("adminStatus");
  const statsEl = document.getElementById("adminStats");
  const usersEl = document.getElementById("adminUsers");
  const logoutButton = document.getElementById("adminLogout");

  if (!status || !statsEl || !usersEl || !window.RBVAuth) {
    return;
  }

  const user = await window.RBVAuth.getCurrentUser();
  if (!user) {
    window.location.href = "/login.html";
    return;
  }

  if (user.role !== "admin") {
    status.textContent = "You are logged in, but not allowed to view this admin page.";
    return;
  }

  status.textContent = `Signed in as ${user.name} (${user.email})`;

  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      await window.RBVAuth.logout();
      window.location.href = "/";
    });
  }

  try {
    const stats = await window.RBVAuth.apiRequest("/api/admin/stats", { method: "GET" });
    statsEl.innerHTML = `
      <li>Total users: ${stats.totalUsers}</li>
      <li>Admins: ${stats.adminUsers}</li>
      <li>Regular users: ${stats.regularUsers}</li>
    `;

    const userData = await window.RBVAuth.apiRequest("/api/admin/users", { method: "GET" });
    usersEl.innerHTML = userData.users
      .map(
        (item) =>
          `<tr class="border-b border-slate-700">
            <td class="py-2 px-3">${item.name}</td>
            <td class="py-2 px-3">${item.email}</td>
            <td class="py-2 px-3">${item.role}</td>
            <td class="py-2 px-3">${new Date(item.createdAt).toLocaleString()}</td>
          </tr>`
      )
      .join("");
  } catch (error) {
    status.textContent = error.message;
  }
});
