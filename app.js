<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SafeCampus — Security Dashboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --ink:#101A2B;
    --ink-2:#1C2A3F;
    --paper:#F7F5F0;
    --paper-dim:#EFEBE2;
    --slate:#28394F;
    --slate-soft:#5B6B80;
    --line:#D8D3C6;
    --amber:#E0A23D;
    --rust:#C24C3D;
    --moss:#4E8F63;
    --white:#FFFFFF;
  }
  *{box-sizing:border-box;}
  body{
    margin:0;background:var(--paper);color:var(--slate);
    font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;
  }
  h1,h2,h3{font-family:'Source Serif 4',serif;color:var(--ink);margin:0;}
  button{font-family:inherit;cursor:pointer;}
  a{color:inherit;text-decoration:none;}

  .nav{
    display:flex;align-items:center;justify-content:space-between;
    padding:18px 40px;background:var(--ink);
  }
  .brand{display:flex;align-items:center;gap:10px;}
  .brand-mark{
    width:32px;height:32px;background:var(--amber);border-radius:3px;
    display:flex;align-items:center;justify-content:center;
    color:var(--ink);font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:14px;
  }
  .brand-name{font-family:'Source Serif 4',serif;font-weight:700;font-size:18px;color:var(--paper);}
  .nav-tag{
    font-family:'IBM Plex Mono',monospace;font-size:11px;color:#8FA0B8;
    letter-spacing:0.08em;text-transform:uppercase;border-left:1px solid #33445D;
    padding-left:12px;margin-left:2px;
  }
  .nav-right{display:flex;align-items:center;gap:18px;}
  .user-chip{
    display:flex;align-items:center;gap:8px;
    font-family:'IBM Plex Mono',monospace;font-size:12px;color:#A9B4C4;
  }
  .avatar{
    width:26px;height:26px;border-radius:50%;background:var(--amber);
    display:flex;align-items:center;justify-content:center;
    font-size:11px;font-weight:700;color:var(--ink);
  }
  .logout-link{color:#A9B4C4;font-size:13px;font-weight:500;}

  .page{max-width:1320px;margin:0 auto;padding:36px 40px 80px;}

  .page-header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:28px;flex-wrap:wrap;gap:16px;}
  .eyebrow{
    font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.1em;
    text-transform:uppercase;color:var(--slate-soft);margin-bottom:8px;
  }
  .page-header h1{font-size:28px;}

  /* ===== STATS STRIP ===== */
  .stats-strip{
    display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px;
  }
  .stat-card{
    background:var(--white);border:1px solid var(--line);border-radius:4px;
    padding:18px 20px;position:relative;overflow:hidden;
  }
  .stat-card::before{
    content:"";position:absolute;left:0;top:0;bottom:0;width:4px;
  }
  .stat-card.total::before{background:var(--ink);}
  .stat-card.open::before{background:var(--rust);}
  .stat-card.progress::before{background:var(--amber);}
  .stat-card.resolved::before{background:var(--moss);}
  .stat-card .label{
    font-family:'IBM Plex Mono',monospace;font-size:11px;text-transform:uppercase;
    letter-spacing:0.05em;color:var(--slate-soft);margin-bottom:8px;
  }
  .stat-card .value{font-family:'Source Serif 4',serif;font-size:30px;font-weight:600;color:var(--ink);}

  /* ===== TOOLBAR ===== */
  .toolbar{
    display:flex;justify-content:space-between;align-items:center;
    margin-bottom:14px;flex-wrap:wrap;gap:12px;
  }
  .filter-tabs{display:flex;gap:6px;flex-wrap:wrap;}
  .filter-tab{
    font-family:'IBM Plex Mono',monospace;font-size:11px;text-transform:uppercase;
    letter-spacing:0.04em;padding:7px 12px;border-radius:2px;border:1px solid var(--line);
    background:var(--white);color:var(--slate-soft);
  }
  .filter-tab.active{background:var(--ink);color:var(--paper);border-color:var(--ink);}
  .search-box{
    padding:9px 14px;border:1px solid var(--line);border-radius:2px;
    font-size:13px;width:240px;background:var(--white);font-family:'Inter',sans-serif;
  }
  .search-box:focus{outline:2px solid var(--ink);outline-offset:1px;}

  /* ===== LOG TABLE ===== */
  .log-table{
    background:var(--white);border:1px solid var(--line);border-radius:4px;overflow:hidden;
  }
  .log-row{
    display:grid;
    grid-template-columns:90px 1fr 130px 160px 120px 140px;
    gap:14px;
    padding:14px 20px;
    border-bottom:1px solid var(--line);
    align-items:center;
    font-size:13px;
  }
  .log-row.head{
    font-family:'IBM Plex Mono',monospace;font-size:10.5px;text-transform:uppercase;
    letter-spacing:0.06em;color:var(--slate-soft);background:var(--paper-dim);
  }
  .log-row:last-child{border-bottom:none;}
  .log-row:not(.head):hover{background:rgba(16,26,43,0.02);}
  .log-id{font-family:'IBM Plex Mono',monospace;font-size:11.5px;color:var(--slate-soft);}
  .log-title{font-weight:600;color:var(--ink);}
  .log-desc{font-size:12px;color:var(--slate-soft);margin-top:2px;font-weight:400;}
  .log-photo{font-size:11px;color:var(--slate-soft);margin-top:3px;}
  .badge{
    font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:600;
    letter-spacing:0.06em;text-transform:uppercase;padding:5px 10px;border-radius:2px;
    display:inline-block;width:fit-content;
  }
  .badge.open{background:rgba(194,76,61,0.12);color:var(--rust);}
  .badge.progress{background:rgba(224,162,61,0.15);color:#9C6C1F;}
  .badge.resolved{background:rgba(78,143,99,0.13);color:var(--moss);}
  .log-meta{font-size:12px;color:var(--slate-soft);}

  select.status-select{
    font-family:'IBM Plex Mono',monospace;font-size:11px;text-transform:uppercase;
    padding:7px 8px;border-radius:2px;border:1px solid var(--line);background:var(--paper);
    color:var(--slate);
  }
  select.status-select:focus{outline:2px solid var(--ink);}

  .empty-state{
    text-align:center;padding:50px 20px;color:var(--slate-soft);font-size:13px;
  }

  .changed-flash{
    animation:flash 1.1s ease;
  }
  @keyframes flash{
    0%{background:rgba(224,162,61,0.25);}
    100%{background:transparent;}
  }

  @media (max-width:1000px){
    .stats-strip{grid-template-columns:1fr 1fr;}
    .log-row{grid-template-columns:1fr;gap:6px;}
    .log-row.head{display:none;}
    .page{padding:26px 20px 60px;}
    .nav{padding:16px 20px;}
  }

  .log-row:not(.head){cursor:pointer;}

  /* ===== DETAIL / AUDIT TRAIL MODAL ===== */
  .detail-backdrop{
    position:fixed;inset:0;background:rgba(16,26,43,0.6);
    display:none;align-items:flex-start;justify-content:center;
    z-index:60;padding:60px 20px;overflow-y:auto;
  }
  .detail-backdrop.show{display:flex;}
  .detail-panel{
    background:var(--paper);border-radius:5px;width:100%;max-width:640px;
    border:1px solid var(--line);overflow:hidden;
  }
  .detail-head{
    background:var(--ink);padding:24px 28px;position:relative;
  }
  .detail-close{
    position:absolute;top:18px;right:20px;background:none;border:none;
    color:#A9B4C4;font-size:18px;
  }
  .detail-id{
    font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--amber);
    text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;
  }
  .detail-title{color:var(--paper);font-size:21px;margin-bottom:10px;padding-right:30px;}
  .detail-badges{display:flex;gap:8px;align-items:center;}
  .detail-body{padding:26px 28px;}
  .detail-grid{
    display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:22px;
    padding-bottom:22px;border-bottom:1px solid var(--line);
  }
  .detail-field .k{
    font-family:'IBM Plex Mono',monospace;font-size:10.5px;text-transform:uppercase;
    letter-spacing:0.06em;color:var(--slate-soft);margin-bottom:4px;
  }
  .detail-field .v{font-size:13.5px;color:var(--ink);font-weight:500;}
  .detail-desc-label{
    font-family:'IBM Plex Mono',monospace;font-size:10.5px;text-transform:uppercase;
    letter-spacing:0.06em;color:var(--slate-soft);margin-bottom:6px;
  }
  .detail-desc{font-size:14px;line-height:1.6;color:var(--slate);margin-bottom:22px;}
  .detail-photo{
    display:flex;align-items:center;gap:10px;padding:12px 14px;
    background:var(--white);border:1px solid var(--line);border-radius:3px;
    font-size:12.5px;color:var(--slate-soft);margin-bottom:22px;
    font-family:'IBM Plex Mono',monospace;
  }

  .trail-label{
    font-family:'IBM Plex Mono',monospace;font-size:11px;text-transform:uppercase;
    letter-spacing:0.08em;color:var(--ink);margin-bottom:16px;
    display:flex;align-items:center;gap:8px;
  }
  .trail-label::after{content:"";flex:1;height:1px;background:var(--line);}
  .timeline{position:relative;padding-left:6px;}
  .timeline-item{
    position:relative;padding:0 0 20px 26px;border-left:1.5px solid var(--line);
  }
  .timeline-item:last-child{border-left:1.5px solid transparent;padding-bottom:0;}
  .timeline-dot{
    position:absolute;left:-6.5px;top:1px;width:12px;height:12px;border-radius:50%;
    background:var(--white);border:2.5px solid var(--ink);
  }
  .timeline-item.st-open .timeline-dot{border-color:var(--rust);}
  .timeline-item.st-progress .timeline-dot{border-color:var(--amber);}
  .timeline-item.st-resolved .timeline-dot{border-color:var(--moss);}
  .timeline-event{font-size:13.5px;font-weight:600;color:var(--ink);margin-bottom:3px;}
  .timeline-meta{
    font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--slate-soft);
  }

  @media (prefers-reduced-motion: reduce){
    *{animation:none !important;transition:none !important;}
  }
</style>
</head>
<body>

<nav class="nav">
  <div class="brand">
    <div class="brand-mark">SC</div>
    <div class="brand-name">SafeCampus</div>
    <div class="nav-tag">Security Dashboard</div>
  </div>
  <div class="nav-right">
    <div class="user-chip">
      <div class="avatar">OD</div>
      <span>Officer Danso</span>
    </div>
    <a class="logout-link" href="index.html">Log Out</a>
  </div>
</nav>

<div class="page">
  <div class="page-header">
    <div>
      <div class="eyebrow">Campus Security · Incident Log</div>
      <h1>All Reports</h1>
    </div>
  </div>

  <div class="stats-strip">
    <div class="stat-card total">
      <div class="label">Total Reports</div>
      <div class="value" id="statTotal">0</div>
    </div>
    <div class="stat-card open">
      <div class="label">Open</div>
      <div class="value" id="statOpen">0</div>
    </div>
    <div class="stat-card progress">
      <div class="label">In Progress</div>
      <div class="value" id="statProgress">0</div>
    </div>
    <div class="stat-card resolved">
      <div class="label">Resolved</div>
      <div class="value" id="statResolved">0</div>
    </div>
  </div>

  <div class="toolbar">
    <div class="filter-tabs" id="filterTabs">
      <button class="filter-tab active" data-filter="all">All</button>
      <button class="filter-tab" data-filter="open">Open</button>
      <button class="filter-tab" data-filter="progress">In Progress</button>
      <button class="filter-tab" data-filter="resolved">Resolved</button>
    </div>
    <input type="text" class="search-box" id="searchBox" placeholder="Search by title, location, or ID…" oninput="renderTable()">
  </div>

  <div class="log-table">
    <div class="log-row head">
      <div>Ticket</div>
      <div>Incident</div>
      <div>Category</div>
      <div>Reported</div>
      <div>Status</div>
      <div>Update</div>
    </div>
    <div id="tableBody"></div>
  </div>
</div>

<div class="detail-backdrop" id="detailBackdrop">
  <div class="detail-panel">
    <div class="detail-head">
      <button class="detail-close" onclick="closeDetail()">✕</button>
      <div class="detail-id" id="dId"></div>
      <div class="detail-title" id="dTitle"></div>
      <div class="detail-badges" id="dBadges"></div>
    </div>
    <div class="detail-body">
      <div class="detail-grid">
        <div class="detail-field">
          <div class="k">Category</div>
          <div class="v" id="dCategory"></div>
        </div>
        <div class="detail-field">
          <div class="k">Location</div>
          <div class="v" id="dLocation"></div>
        </div>
        <div class="detail-field">
          <div class="k">Reported By</div>
          <div class="v" id="dReporter"></div>
        </div>
        <div class="detail-field">
          <div class="k">Reported</div>
          <div class="v" id="dCreatedAt"></div>
        </div>
      </div>

      <div class="detail-desc-label">Description</div>
      <div class="detail-desc" id="dDescription"></div>

      <div class="detail-photo" id="dPhoto" style="display:none;">📎 Photo evidence attached — stored in Amazon S3</div>

      <div class="trail-label">Audit Trail</div>
      <div class="timeline" id="dTimeline"></div>
    </div>
  </div>
</div>

<script>
  // ===== MOCK DATA (in-memory — replace with GET /reports from backend) =====
  // "history" mirrors the StatusHistory table: every entry is a row that would be
  // INSERTed whenever a report is created or its status changes — this is the audit trail.
  let reports = [
    { id:"SC-1042", title:"Broken lighting — Lot C stairwell", description:"West-side stairwell lights out for 3 nights.", category:"Hazard", location:"Parking Lot C", status:"open", hasPhoto:false, reporter:"jane.doe@campus.edu", createdAt:"12 min ago",
      history:[ {status:"open", by:"jane.doe@campus.edu", at:"12 min ago", note:"Report submitted"} ] },
    { id:"SC-1039", title:"Suspicious activity — Library east entrance", description:"Someone pulling on locked doors after hours.", category:"Suspicious Activity", location:"Library, east entrance", status:"progress", hasPhoto:true, reporter:"m.owusu@campus.edu", createdAt:"40 min ago",
      history:[ {status:"open", by:"m.owusu@campus.edu", at:"40 min ago", note:"Report submitted"}, {status:"progress", by:"Officer Danso", at:"22 min ago", note:"Assigned and investigating"} ] },
    { id:"SC-1038", title:"Harassment reported — Student Union", description:"Verbal harassment reported near the food court.", category:"Harassment", location:"Student Union", status:"open", hasPhoto:false, reporter:"a.mensah@campus.edu", createdAt:"1h ago",
      history:[ {status:"open", by:"a.mensah@campus.edu", at:"1h ago", note:"Report submitted"} ] },
    { id:"SC-1035", title:"Broken lock — Dorm C, room 214", description:"Exterior door lock not latching properly.", category:"Hazard", location:"Dorm C", status:"progress", hasPhoto:true, reporter:"k.appiah@campus.edu", createdAt:"3h ago",
      history:[ {status:"open", by:"k.appiah@campus.edu", at:"3h ago", note:"Report submitted"}, {status:"progress", by:"Officer Danso", at:"2h 10m ago", note:"Maintenance ticket filed"} ] },
    { id:"SC-1031", title:"Theft report — Bike rack, North Hall", description:"Bike lock cut, bike taken from rack.", category:"Theft", location:"North Hall", status:"resolved", hasPhoto:true, reporter:"jane.doe@campus.edu", createdAt:"yesterday",
      history:[ {status:"open", by:"jane.doe@campus.edu", at:"yesterday, 8:02 AM", note:"Report submitted"}, {status:"progress", by:"Officer Danso", at:"yesterday, 8:15 AM", note:"Reviewing camera footage"}, {status:"resolved", by:"Officer Danso", at:"yesterday, 10:12 AM", note:"Bike recovered, case closed"} ] },
    { id:"SC-1028", title:"Suspicious vehicle — Lot A", description:"Unmarked vehicle circling lot for 20+ minutes.", category:"Suspicious Activity", location:"Parking Lot A", status:"resolved", hasPhoto:false, reporter:"security-tip@campus.edu", createdAt:"2 days ago",
      history:[ {status:"open", by:"security-tip@campus.edu", at:"2 days ago", note:"Report submitted"}, {status:"progress", by:"Officer Danso", at:"2 days ago", note:"Patrol dispatched"}, {status:"resolved", by:"Officer Danso", at:"2 days ago", note:"Vehicle identified as visitor, no threat"} ] },
    { id:"SC-1022", title:"Theft — Laptop from library carrel", description:"Laptop taken from unattended desk on 3rd floor.", category:"Theft", location:"Library, 3rd floor", status:"resolved", hasPhoto:false, reporter:"f.boateng@campus.edu", createdAt:"3 days ago",
      history:[ {status:"open", by:"f.boateng@campus.edu", at:"3 days ago", note:"Report submitted"}, {status:"progress", by:"Officer Danso", at:"3 days ago", note:"Reviewing library check-in logs"}, {status:"resolved", by:"Officer Danso", at:"3 days ago", note:"Item returned, student notified"} ] }
  ];

  let activeFilter = 'all';

  function statusLabel(status){
    if(status === 'open') return 'Open';
    if(status === 'progress') return 'In Progress';
    return 'Resolved';
  }

  function updateStats(){
    document.getElementById('statTotal').textContent = reports.length;
    document.getElementById('statOpen').textContent = reports.filter(r => r.status === 'open').length;
    document.getElementById('statProgress').textContent = reports.filter(r => r.status === 'progress').length;
    document.getElementById('statResolved').textContent = reports.filter(r => r.status === 'resolved').length;
  }

  function changeStatus(id, newStatus){
    const report = reports.find(r => r.id === id);
    if(report && report.status !== newStatus){
      report.status = newStatus;
      // In the real app: PATCH /reports/{id} { status: newStatus }
      // which the backend turns into an INSERT on StatusHistory — exactly what we're
      // simulating here by pushing to report.history.
      report.history = report.history || [];
      report.history.push({
        status: newStatus,
        by: "Officer Danso",
        at: "just now",
        note: "Status updated to " + statusLabel(newStatus)
      });
    }
    updateStats();
    renderTable();
    requestAnimationFrame(() => {
      const row = document.getElementById('row-' + id);
      if(row) row.classList.add('changed-flash');
    });
  }

  function renderTable(){
    const body = document.getElementById('tableBody');
    const search = document.getElementById('searchBox').value.toLowerCase();

    let filtered = activeFilter === 'all' ? reports : reports.filter(r => r.status === activeFilter);
    if(search){
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(search) ||
        r.location.toLowerCase().includes(search) ||
        r.id.toLowerCase().includes(search)
      );
    }

    if(filtered.length === 0){
      body.innerHTML = '<div class="empty-state">No reports match this filter.</div>';
      return;
    }

    body.innerHTML = filtered.map(r => `
      <div class="log-row" id="row-${r.id}" onclick="openDetail('${r.id}')">
        <div class="log-id">#${r.id}</div>
        <div>
          <div class="log-title">${r.title}</div>
          <div class="log-desc">${r.location} · reported by ${r.reporter}</div>
          ${r.hasPhoto ? '<div class="log-photo">📎 Photo evidence attached</div>' : ''}
        </div>
        <div class="log-meta">${r.category}</div>
        <div class="log-meta">${r.createdAt}</div>
        <div><span class="badge ${r.status}">${statusLabel(r.status)}</span></div>
        <div onclick="event.stopPropagation()">
          <select class="status-select" onchange="changeStatus('${r.id}', this.value)">
            <option value="open" ${r.status === 'open' ? 'selected' : ''}>Open</option>
            <option value="progress" ${r.status === 'progress' ? 'selected' : ''}>In Progress</option>
            <option value="resolved" ${r.status === 'resolved' ? 'selected' : ''}>Resolved</option>
          </select>
        </div>
      </div>
    `).join('');
  }

  // ===== DETAIL / AUDIT TRAIL MODAL =====
  function openDetail(id){
    const r = reports.find(rep => rep.id === id);
    if(!r) return;

    document.getElementById('dId').textContent = '#' + r.id;
    document.getElementById('dTitle').textContent = r.title;
    document.getElementById('dBadges').innerHTML = `<span class="badge ${r.status}">${statusLabel(r.status)}</span>`;
    document.getElementById('dCategory').textContent = r.category;
    document.getElementById('dLocation').textContent = r.location;
    document.getElementById('dReporter').textContent = r.reporter;
    document.getElementById('dCreatedAt').textContent = r.createdAt;
    document.getElementById('dDescription').textContent = r.description;
    document.getElementById('dPhoto').style.display = r.hasPhoto ? 'flex' : 'none';

    const timeline = document.getElementById('dTimeline');
    const events = r.history || [];
    timeline.innerHTML = events.map(ev => `
      <div class="timeline-item st-${ev.status}">
        <div class="timeline-dot"></div>
        <div class="timeline-event">${statusLabel(ev.status)} — ${ev.note}</div>
        <div class="timeline-meta">${ev.at} · by ${ev.by}</div>
      </div>
    `).join('');

    document.getElementById('detailBackdrop').classList.add('show');
  }

  function closeDetail(){
    document.getElementById('detailBackdrop').classList.remove('show');
  }

  document.getElementById('detailBackdrop').addEventListener('click', function(e){
    if(e.target === this) closeDetail();
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeDetail();
  });

  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.dataset.filter;
      renderTable();
    });
  });

  updateStats();
  renderTable();
</script>

</body>
</html>