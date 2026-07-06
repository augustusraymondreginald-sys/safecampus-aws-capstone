const API_BASE = '/api';

document.addEventListener("DOMContentLoaded", () => {
  checkAuthState();
});

function checkAuthState() {
  const token = localStorage.getItem("safeToken");
  const user = JSON.parse(localStorage.getItem("safeUser") || "{}");
  
  const authBox = document.getElementById("authBox");
  const appContent = document.getElementById("appContent");
  const authNavBtn = document.getElementById("authNavBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userGreeting = document.getElementById("userGreeting");
  const adminLink = document.getElementById("adminLink");

  if (token && user.email) {
    if (authBox) authBox.style.display = "none";
    if (appContent) appContent.style.display = "block";
    if (authNavBtn) authNavBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (userGreeting) userGreeting.innerText = `Logged in as: ${user.full_name} (${user.role})`;
    
    if (user.role === "ADMIN" && adminLink) {
      adminLink.style.display = "inline-block";
    }
    
    if (document.getElementById("myIncidentsList")) {
      loadMyIncidents();
    }
  }
}

function switchTab(tab) {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const buttons = document.querySelectorAll(".tab-buttons button");
  
  if (tab === 'login') {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    buttons[0].classList.add("active");
    buttons[1].classList.remove("active");
  } else {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    buttons[0].classList.remove("active");
    buttons[1].classList.add("active");
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    localStorage.setItem("safeToken", data.token);
    localStorage.setItem("safeUser", JSON.stringify(data.user));
    location.reload();
  } catch (err) {
    alert(err.message);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const full_name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const role = document.getElementById("regRole").value;

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name, email, password, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");

    alert("Account created successfully! Please login.");
    switchTab('login');
  } catch (err) {
    alert(err.message);
  }
}

function logout() {
  localStorage.removeItem("safeToken");
  localStorage.removeItem("safeUser");
  window.location.href = "index.html";
}

async function submitIncident(e) {
  e.preventDefault();
  const token = localStorage.getItem("safeToken");
  
  const formData = new FormData();
  formData.append("title", document.getElementById("incTitle").value);
  formData.append("category", document.getElementById("incCategory").value);
  formData.append("priority", document.getElementById("incPriority").value);
  formData.append("location", document.getElementById("incLocation").value);
  formData.append("description", document.getElementById("incDescription").value);
  
  const fileInput = document.getElementById("incImage");
  if (fileInput.files[0]) {
    formData.append("image", fileInput.files[0]);
  }

  try {
    const res = await fetch(`${API_BASE}/incidents`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to submit report");

    alert("Incident report submitted successfully!");
    document.getElementById("reportForm").reset();
    loadMyIncidents();
  } catch (err) {
    alert(err.message);
  }
}

async function loadMyIncidents() {
  const token = localStorage.getItem("safeToken");
  const container = document.getElementById("myIncidentsList");
  
  try {
    const res = await fetch(`${API_BASE}/incidents/my`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const incidents = await res.json();

    if (incidents.length === 0) {
      container.innerHTML = "<p>No incident reports submitted yet.</p>";
      return;
    }

    container.innerHTML = incidents.map(inc => `
      <div class="incident-card">
        <span class="badge badge-${inc.status}">${inc.status}</span>
        <h3>${inc.title}</h3>
        <p><strong>Category:</strong> ${inc.category} | <strong>Priority:</strong> ${inc.priority}</p>
        <p><strong>Location:</strong> ${inc.location}</p>
        <p>${inc.description}</p>
        ${inc.image_url ? `<p><a href="${inc.image_url}" target="_blank">🖼️ View Evidence Photo (S3)</a></p>` : ''}
        <small>Submitted on: ${new Date(inc.created_at).toLocaleString()}</small>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = "<p>Error loading reports.</p>";
  }
}

async function loadAllIncidents() {
  const token = localStorage.getItem("safeToken");
  const tbody = document.getElementById("adminIncidentTable");

  try {
    const res = await fetch(`${API_BASE}/incidents/all`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    window.allIncidentsData = await res.json();
    renderAdminTable(window.allIncidentsData);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8">Error fetching incident records.</td></tr>`;
  }
}

function renderAdminTable(data) {
  const tbody = document.getElementById("adminIncidentTable");
  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8">No incidents recorded.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(inc => `
    <tr>
      <td>#${inc.id}</td>
      <td><strong>${inc.title}</strong><br/><small>${inc.category}</small></td>
      <td>${inc.location}</td>
      <td>${inc.reporter_name}<br/><small>${inc.reporter_email}</small></td>
      <td>
        ${inc.image_url ? `<a href="${inc.image_url}" target="_blank"><img src="${inc.image_url}" class="evidence-thumb" alt="S3 Evidence" /></a>` : 'None'}
      </td>
      <td><strong>${inc.priority}</strong></td>
      <td><span class="badge badge-${inc.status}">${inc.status}</span></td>
      <td>
        <select onchange="updateStatus(${inc.id}, this.value)">
          <option value="">-- Change Status --</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="DISMISSED">DISMISSED</option>
        </select>
      </td>
    </tr>
  `).join('');
}

async function updateStatus(incidentId, newStatus) {
  if (!newStatus) return;
  const token = localStorage.getItem("safeToken");
  const note = prompt(`Optional resolution note for marking #${incidentId} as ${newStatus}:`);

  try {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus, note })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update status");

    alert(`Incident #${incidentId} status updated to ${newStatus}`);
    loadAllIncidents();
  } catch (err) {
    alert(err.message);
  }
}

function filterIncidents() {
  const filterVal = document.getElementById("statusFilter").value;
  if (filterVal === "ALL") {
    renderAdminTable(window.allIncidentsData);
  } else {
    const filtered = window.allIncidentsData.filter(i => i.status === filterVal);
    renderAdminTable(filtered);
  }
}