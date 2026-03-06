document.addEventListener("DOMContentLoaded", async () => {
  if (!window.RBVAuth) {
    return;
  }

  const desktopNav = document.getElementById("navLinks");
  const mobileNav = document.getElementById("mobileMenu");
  const desktopSlot = document.getElementById("authDesktopSlot");
  const mobileSlot = document.getElementById("authMobileSlot");
  if (!desktopNav || !mobileNav) {
    return;
  }

  const user = await window.RBVAuth.getCurrentUser();

  const desktopWrapper = document.createElement("div");
  desktopWrapper.className = "flex items-center gap-4";

  const mobileWrapper = document.createElement("div");
  mobileWrapper.className = "flex flex-col items-center justify-center gap-4 text-xl";

  if (!user) {
    desktopWrapper.innerHTML = `
      <a href="login.html" class="px-5 py-2.5 rounded-full border border-orange-500/50 text-slate-700 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-500/10 transition">Login</a>
      <a href="register.html" class="px-5 py-2.5 rounded-full border border-orange-500/50 text-slate-700 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-500/10 transition">Register</a>
    `;
    mobileWrapper.innerHTML = `
      <a href="login.html" onclick="toggleMobileMenu()" class="w-56 text-center text-orange-100 border border-orange-500/60 rounded-full px-5 py-3 hover:border-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition">Login</a>
      <a href="register.html" onclick="toggleMobileMenu()" class="w-56 text-center text-orange-100 border border-orange-500/60 rounded-full px-5 py-3 hover:border-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition">Register</a>
    `;
  } else {
    const desktopAdminLink =
      user.role === "admin"
        ? `<a href="admin.html" class="hover:text-orange-600 transition">Admin</a>`
        : "";
    const mobileAdminLink =
      user.role === "admin"
        ? `<a href="admin.html" onclick="toggleMobileMenu()" class="hover:text-orange-500 transition">Admin</a>`
        : "";

    desktopWrapper.innerHTML = `
      <span class="text-slate-600 text-sm">Hi, ${user.name}</span>
      ${desktopAdminLink}
      <button id="logoutButton" type="button" class="hover:text-orange-600 transition">Logout</button>
    `;
    mobileWrapper.innerHTML = `
      <span class="text-slate-300 text-base">Hi, ${user.name}</span>
      ${mobileAdminLink}
      <button id="mobileLogoutButton" type="button" class="hover:text-orange-500 transition">Logout</button>
    `;
  }

  if (desktopSlot) {
    desktopSlot.innerHTML = desktopWrapper.innerHTML;
  } else {
    desktopNav.appendChild(desktopWrapper);
  }

  if (mobileSlot) {
    mobileSlot.innerHTML = mobileWrapper.innerHTML;
  } else {
    mobileNav.appendChild(mobileWrapper);
  }

  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      await window.RBVAuth.logout();
      window.location.reload();
    });
  }

  const mobileLogoutButton = document.getElementById("mobileLogoutButton");
  if (mobileLogoutButton) {
    mobileLogoutButton.addEventListener("click", async () => {
      await window.RBVAuth.logout();
      window.location.href = "/";
    });
  }
});
