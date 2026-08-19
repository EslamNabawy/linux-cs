// ===== STATE =====
const STORAGE_KEY = 'linuxcs_state_v1';

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === 'object') return saved;
  } catch (e) { /* ignore */ }
  return {};
}

const savedState = loadState();

const state = {
  view: savedState.view || 'cheatsheet',
  theme: savedState.theme || 'dark',
  searchTerm: '',
  collapsedCategories: savedState.collapsedCategories || {},
  collapsedExercises: savedState.collapsedExercises || {},
  collapsedDeepDives: savedState.collapsedDeepDives || {},
  collapsedRH124: savedState.collapsedRH124 || {},
  collapsedBank: savedState.collapsedBank || {},
  completedModules: savedState.completedModules || {},
  expandedModules: savedState.expandedModules || {},
  quizScores: savedState.quizScores || {}
};

function saveState() {
  const persist = {
    view: state.view,
    theme: state.theme,
    collapsedCategories: state.collapsedCategories,
    collapsedExercises: state.collapsedExercises,
    collapsedDeepDives: state.collapsedDeepDives,
    collapsedRH124: state.collapsedRH124,
    collapsedBank: state.collapsedBank,
    completedModules: state.completedModules,
    expandedModules: state.expandedModules,
    quizScores: state.quizScores
  };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(persist)); } catch (e) { /* ignore */ }
}

// ===== SYNTAX HIGHLIGHTING =====
function highlightCode(code) {
  let s = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  s = s.replace(/(#.*$)/gm, '<span class="comment-token">$1</span>');
  s = s.replace(/"([^"]*)"/g, '<span class="str-token">"$1"</span>');
  s = s.replace(/(~\/[^\s|>]*)/g, '<span class="path-token">$1</span>');
  s = s.replace(/(\/[^\s|>]*)/g, '<span class="path-token">$1</span>');
  s = s.replace(/(\s)(-{1,2}[a-zA-Z]+)/g, '$1<span class="flag-token">$2</span>');
  return s;
}

function highlightCommandName(cmd) {
  const parts = cmd.split(' ');
  return `<span class="cmd-token">${parts[0]}</span>` + (parts.length > 1 ? ' ' + parts.slice(1).join(' ') : '');
}

function highlightMatch(text, term) {
  if (!term) return text;
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// ===== RENDER CHEAT SHEET =====
function renderCheatSheet() {
  const term = state.searchTerm.toLowerCase();
  let html = `
    <h1 class="view-title">Cheat Sheet</h1>
    <p class="view-subtitle">Essential Linux commands — search, copy, and learn.</p>
  `;

  let totalShown = 0;
  let categoriesHtml = '';

  DATA.categories.forEach(cat => {
    let cmdsHtml = '';
    let matchCount = 0;

    cat.commands.forEach(cmd => {
      const matches = !term ||
        cmd.command.toLowerCase().includes(term) ||
        cmd.description.toLowerCase().includes(term) ||
        cmd.example.toLowerCase().includes(term) ||
        (cmd.notes && cmd.notes.toLowerCase().includes(term));

      if (!matches) return;
      matchCount++;
      totalShown++;

      cmdsHtml += `
        <div class="cmd-row">
          <div class="cmd-grid">
            <div class="cmd-name">${highlightMatch(highlightCommandName(escapeHtml(cmd.command)), state.searchTerm)}</div>
            <div>
              <div class="cmd-desc">${highlightMatch(escapeHtml(cmd.description), state.searchTerm)}</div>
              <div class="cmd-example">
                <code>${highlightCode(highlightMatch(escapeHtml(cmd.example), state.searchTerm))}</code>
                <button class="copy-btn" onclick="copyText('${escapeAttr(cmd.example)}', this)" title="Copy">
                  ${ICONS.copy}
                </button>
              </div>
              ${cmd.notes ? `
                <div class="cmd-note">
                  ${ICONS.alert}
                  <span>${highlightMatch(escapeHtml(cmd.notes), state.searchTerm)}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    });

    if (matchCount === 0) return;
    const isCollapsed = state.collapsedCategories[cat.id] !== false && !term;

    categoriesHtml += `
      <div class="category ${isCollapsed ? 'collapsed' : ''}" data-cat-id="${cat.id}">
        <div class="category-header" onclick="toggleCategory('${cat.id}')">
          <div class="category-icon">${ICONS[cat.icon] || ICONS.file}</div>
          <div class="category-title">${cat.title}</div>
          <div class="category-count">${matchCount}</div>
          <div class="chevron">${ICONS.chevron}</div>
        </div>
        <div class="category-body">
          ${cmdsHtml}
        </div>
      </div>
    `;
  });

  if (totalShown === 0) {
    html += `
      <div class="no-results">
        ${ICONS.search}
        <h3>No commands found</h3>
        <p>Try a different search term.</p>
      </div>
    `;
  } else {
    html += categoriesHtml;
  }

  return html;
}

// ===== RENDER COMMANDS BANK =====
function renderCommandsBank() {
  const term = state.searchTerm.toLowerCase().trim();
  let html = `
    <h1 class="view-title">The Linux Commands Bank</h1>
    <p class="view-subtitle">A searchable reference of essential Linux commands.</p>
  `;

  // Filter logic including hidden keywords
  const filteredCommands = DATA.commandsBank.filter(cmd => {
    if (!term) return true;
    const visibleText = `${cmd.command} ${cmd.category} ${cmd.briefDescription}`.toLowerCase();
    const hiddenKeywords = cmd.keywords.join(' ').toLowerCase();
    return visibleText.includes(term) || hiddenKeywords.includes(term);
  });

  if (filteredCommands.length === 0) {
    html += `
      <div class="no-results">
        ${ICONS.search}
        <h3>No commands found</h3>
        <p>Try a different search term or synonym.</p>
      </div>
    `;
  } else {
    // Group by category for cleaner display
    const grouped = {};
    filteredCommands.forEach(cmd => {
      if (!grouped[cmd.category]) grouped[cmd.category] = [];
      grouped[cmd.category].push(cmd);
    });

    Object.keys(grouped).forEach(catName => {
      let cmdsHtml = '';
      grouped[catName].forEach(cmd => {
        const example = cmd.command; // Render the command itself as the code snippet
        cmdsHtml += `
          <div class="cmd-row">
            <div class="cmd-grid">
              <div class="cmd-name">${highlightMatch(escapeHtml(cmd.command), state.searchTerm)}</div>
              <div>
                <div class="cmd-desc">${highlightMatch(escapeHtml(cmd.briefDescription), state.searchTerm)}</div>
                <div class="cmd-example">
                  <code>${highlightCode(escapeHtml(example))}</code>
                  <button class="copy-btn" onclick="copyText('${escapeAttr(example)}', this)" title="Copy">
                    ${ICONS.copy}
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      });

      const isCollapsed = state.collapsedBank[catName] !== false && !term;
      html += `
        <div class="category ${isCollapsed ? 'collapsed' : ''}" data-cat-id="${catName}">
          <div class="category-header" onclick="toggleBankCategory('${catName}')">
            <div class="category-icon">${ICONS.database}</div>
            <div class="category-title">${catName}</div>
            <div class="category-count">${grouped[catName].length}</div>
            <div class="chevron">${ICONS.chevron}</div>
          </div>
          <div class="category-body">
            ${cmdsHtml}
          </div>
        </div>
      `;
    });
  }

  return html;
}

// ===== RENDER EXERCISES =====
function renderExercises() {
  let html = `
    <h1 class="view-title">Practical Exercises - Part 1</h1>
    <p class="view-subtitle">Common Linux tasks with deep-dive explanations and context.</p>
  `;

  DATA.exercises.forEach(ex => {
    const isCollapsed = state.collapsedExercises[ex.id] !== false;
    let bodyHtml = `<p class="exercise-text">${ex.text}</p>`;
    
    if (ex.code) {
      ex.code.forEach(c => {
        bodyHtml += `
          <div class="exercise-code">
            <code>${highlightCode(escapeHtml(c))}</code>
            <button class="copy-btn" onclick="copyText('${escapeAttr(c)}', this)">${ICONS.copy}</button>
          </div>
        `;
      });
    }

    if (ex.steps) {
      ex.steps.forEach(step => {
        bodyHtml += `
          <div class="exercise-step">
            <h6>${step.subtitle}</h6>
            <p class="exercise-text">${step.text}</p>
            ${step.code.map(c => `
              <div class="exercise-code">
                <code>${highlightCode(escapeHtml(c))}</code>
                <button class="copy-btn" onclick="copyText('${escapeAttr(c)}', this)">${ICONS.copy}</button>
              </div>
            `).join('')}
          </div>
        `;
      });
    }

    if (ex.deepDive) {
      const isDeepDiveExpanded = state.collapsedDeepDives[ex.id] === true;
      bodyHtml += `
        <div class="deep-dive-container ${isDeepDiveExpanded ? 'expanded' : ''}">
          <div class="deep-dive-header" onclick="toggleDeepDive(${ex.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            <span>Deeper Explanation</span>
          </div>
          <div class="deep-dive-body">
            ${ex.deepDive.map(p => `<p>${p}</p>`).join('')}
          </div>
        </div>
      `;
    }

    html += `
      <div class="exercise-card ${isCollapsed ? 'collapsed' : ''}">
        <div class="exercise-header" onclick="toggleExercise(${ex.id})">
          <div class="exercise-icon">${ICONS.clipboard}</div>
          <div class="exercise-title">${ex.id}. ${ex.title}</div>
          <div class="chevron">${ICONS.chevron}</div>
        </div>
        <div class="exercise-body">
          ${bodyHtml}
        </div>
      </div>
    `;
  });

  return html;
}


// ===== RH124 SECTIONS (shared for search) =====
const RH124_SECTIONS = [
    {
      id: "outline",
      title: "Course Outlines",
      icon: "file",
      content: `
        <table class="comparison-table">
          <thead><tr><th>Day</th><th>Content</th></tr></thead>
          <tbody>
            <tr><td><strong>Day 1</strong></td><td>Get Started with RHEL<br>Access the Command Line<br>Manage Files from the Command Line</td></tr>
            <tr><td><strong>Day 2</strong></td><td>Get Help in RHEL<br>Create, View, and Edit Text Files<br>Manage Local Users and Groups</td></tr>
            <tr><td><strong>Day 3</strong></td><td>Control Access to Files<br>Manage Linux Processes<br>Monitor Control Services and Daemons</td></tr>
            <tr><td><strong>Day 4</strong></td><td>Configure and Secure SSH<br>Analyzing and Storing Logs<br>Manage Networking</td></tr>
            <tr><td><strong>Day 5</strong></td><td>Archiving and Transferring Files<br>Install and Update Software Packages<br>Access Linux File Systems</td></tr>
          </tbody>
        </table>
      `
    },
    {
      id: "basics",
      title: "Linux Basics & Distributions",
      icon: "folder",
      content: `
        <div class="rh124-content">
          <p><strong>Goal:</strong> Define open source, Linux, Linux distributions, and Red Hat Enterprise Linux.</p>
          <h6>Why Linux?</h6>
          <ul>
            <li>Community support & High Security</li>
            <li>High Stability & Ease of Maintenance</li>
            <li>Runs on Any hardware</li>
            <li>It is Free & Open Source</li>
            <li>Ease of Use, flexibility, and Customization</li>
          </ul>
          <h6>History</h6>
          <p>Timeline: AT&T UNIX (1969) -> BSD -> GNU -> Minix -> Linux (1991 by Linus Torvalds).</p>
          <h6>Distributions</h6>
          <p>Linux branches into families like Debian (Ubuntu, Mint), Fedora (RHEL, CentOS), and SUSE (SLES, OpenSUSE).</p>
        </div>
      `
    },
    {
      id: "components",
      title: "Linux Components",
      icon: "cpu",
      content: `
        <div class="rh124-content">
          <h6>Kernel</h6>
          <ul>
            <li>Is the core of the operating system.</li>
            <li>Contains components like device drivers.</li>
            <li>It loads into RAM when the machine boots and stays resident in RAM until the machine powers off.</li>
          </ul>
          <h6>Shell</h6>
          <ul>
            <li>C shell, ksh, Bash</li>
            <li>Provides an interface by which the user can communicate with the kernel.</li>
            <li>"bash" is the most commonly used shell on Linux.</li>
            <li>The shell parses commands entered by the user and translates them into logical segments to be executed by the kernel or other utilities.</li>
          </ul>
        </div>
      `
    },
    {
      id: "requirements",
      title: "Minimum Requirements for RHEL 9",
      icon: "alert",
      content: `
        <div class="rh124-content">
          <ul>
            <li><strong>Network:</strong> Working network connection</li>
            <li><strong>Media:</strong> Installation media</li>
            <li><strong>Disk Partitions:</strong> 10 GB for root (/) | 1 GB for Swap | 4 GB for /home | 512M for /boot</li>
            <li><strong>RAM:</strong> 2 GB of RAM or more</li>
            <li><strong>Storage:</strong> 20 GB of disk space or more</li>
            <li><strong>CPU:</strong> Dual or quad-core processor</li>
          </ul>
        </div>
      `
    },
    {
      id: "cmdline",
      title: "Access the Command Line & Syntax",
      icon: "eye",
      content: `
        <div class="rh124-content">
          <p><strong>Goal:</strong> Log in to a Linux system and run simple commands from the shell.</p>
          <p>Commands have the following syntax: <code>command [options] [arguments]</code></p>
          <p>Each item is separated by a space. Options modify the command's behavior. Arguments are file names or other information needed by the command. Separate commands with a semicolon (<code>;</code>).</p>
          <h6>Right Examples:</h6>
          <div class="exercise-code"><code># Right:<br>ls -l /dev<br>ls -a /dev<br>mail -s test root<br>who -u<br>ls -ld</code></div>
          <h6>Wrong Examples:</h6>
          <div class="exercise-code"><code># Wrong:<br>ls - l /dev<br>ls-a /dev<br>mail test root -s<br>-u who<br>ls-ld</code></div>
        </div>
      `
    },
    {
      id: "shortcuts",
      title: "Shell Shortcuts",
      icon: "network",
      content: `
        <div class="rh124-content">
          <table class="comparison-table">
            <thead><tr><th>Shortcut</th><th>Action</th></tr></thead>
            <tbody>
              <tr><td><code>Ctrl+A</code></td><td>Jump to the beginning of the command line.</td></tr>
              <tr><td><code>Ctrl+E</code></td><td>Jump to the end of the command line.</td></tr>
              <tr><td><code>Ctrl+U</code></td><td>Clear from the cursor to the beginning of the command line.</td></tr>
              <tr><td><code>Ctrl+K</code></td><td>Clear from the cursor to the end of the command line.</td></tr>
              <tr><td><code>Ctrl+LeftArrow</code></td><td>Jump to the beginning of the previous word on the command line.</td></tr>
              <tr><td><code>Ctrl+RightArrow</code></td><td>Jump to the end of the next word on the command line.</td></tr>
              <tr><td><code>Ctrl+R</code></td><td>Search the history list of commands for a pattern.</td></tr>
            </tbody>
          </table>
        </div>
      `
    },
    {
      id: "files",
      title: "Manage Files from the Command Line",
      icon: "folder",
      content: `
        <div class="rh124-content">
          <p><strong>Goal:</strong> Copy, move, create, delete, and organize files from the Bash shell.</p>
          <h6>Objectives:</h6>
          <ul>
            <li>Describe how Linux organizes files, and the purposes of various directories in the file-system hierarchy.</li>
            <li>Specify the absolute location and relative location of files to the current working directory, determine and change the working directory, and list the contents of directories.</li>
            <li>Create, copy, move, and remove files and directories.</li>
            <li>Create multiple file name references to the same file with hard links and symbolic (or "soft") links.</li>
            <li>Efficiently run commands that affect many files by using pattern-matching features of the Bash shell.</li>
          </ul>
        </div>
      `
    }
  ];

// ===== RENDER RH124 NOTES =====
function renderRH124() {
  let html = `
    <h1 class="view-title">RH124 - Day 1 Notes</h1>
    <p class="view-subtitle">Red Hat Enterprise Linux basics, command line, and file management.</p>
  `;

  const sections = RH124_SECTIONS;

  sections.forEach(sec => {
    const isCollapsed = state.collapsedRH124[sec.id] !== false;
    html += `
      <div class="rh124-card ${isCollapsed ? 'collapsed' : ''}">
        <div class="rh124-header" onclick="toggleRH124('${sec.id}')">
          <div class="rh124-icon">${ICONS[sec.icon] || ICONS.file}</div>
          <div class="rh124-title">${sec.title}</div>
          <div class="chevron">${ICONS.chevron}</div>
        </div>
        <div class="rh124-body">
          ${sec.content}
        </div>
      </div>
    `;
  });

  return html;
}

// ===== RENDER LINKS GUIDE =====
function renderLinksGuide() {
  const soft = DATA.links.soft;
  const hard = DATA.links.hard;
  let html = `
    <h1 class="view-title">Links Guide</h1>
    <p class="view-subtitle">Deep dive into soft (symbolic) vs. hard links in Linux.</p>
  `;

  html += `
    <div class="links-diagram">
      <svg width="560" height="280" viewBox="0 0 560 280" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="220" height="240" rx="8" fill="var(--bg-tertiary)" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="6,4"/>
        <text x="130" y="45" text-anchor="middle" fill="var(--accent)" font-family="var(--font-mono)" font-size="13" font-weight="600">Soft Link (symlink)</text>
        <rect x="50" y="70" width="160" height="40" rx="6" fill="var(--bg-secondary)" stroke="var(--border)"/>
        <text x="130" y="88" text-anchor="middle" fill="var(--text)" font-family="var(--font-mono)" font-size="12">config_link</text>
        <text x="130" y="103" text-anchor="middle" fill="var(--text-dim)" font-family="var(--font-mono)" font-size="10">→ /var/www/.../config.yaml</text>
        <path d="M 130 115 L 130 155" stroke="var(--accent)" stroke-width="2" marker-end="url(#arrowSoft)"/>
        <text x="145" y="140" fill="var(--text-dim)" font-family="var(--font-mono)" font-size="10">path</text>
        <rect x="50" y="165" width="160" height="50" rx="6" fill="var(--bg-secondary)" stroke="var(--border)"/>
        <text x="130" y="185" text-anchor="middle" fill="var(--text)" font-family="var(--font-mono)" font-size="12">config.yaml</text>
        <text x="130" y="202" text-anchor="middle" fill="var(--text-dim)" font-family="var(--font-mono)" font-size="10">inode: 98765</text>
        <text x="130" y="245" text-anchor="middle" fill="var(--danger)" font-family="var(--font-sans)" font-size="11">If deleted → link breaks ✗</text>

        <rect x="320" y="20" width="220" height="240" rx="8" fill="var(--bg-tertiary)" stroke="var(--accent)" stroke-width="1.5"/>
        <text x="430" y="45" text-anchor="middle" fill="var(--accent)" font-family="var(--font-mono)" font-size="13" font-weight="600">Hard Link</text>
        <rect x="350" y="70" width="160" height="40" rx="6" fill="var(--bg-secondary)" stroke="var(--border)"/>
        <text x="430" y="88" text-anchor="middle" fill="var(--text)" font-family="var(--font-mono)" font-size="12">app_log_backup</text>
        <text x="430" y="103" text-anchor="middle" fill="var(--text-dim)" font-family="var(--font-mono)" font-size="10">inode: 12345</text>
        <path d="M 400 115 L 400 155" stroke="var(--accent)" stroke-width="2" marker-end="url(#arrowHard)"/>
        <path d="M 460 115 L 460 155" stroke="var(--accent)" stroke-width="2" marker-end="url(#arrowHard)"/>
        <text x="490" y="140" fill="var(--text-dim)" font-family="var(--font-mono)" font-size="10">inode</text>
        <rect x="350" y="165" width="160" height="50" rx="6" fill="var(--accent-dim)" stroke="var(--accent)"/>
        <text x="430" y="185" text-anchor="middle" fill="var(--accent)" font-family="var(--font-mono)" font-size="12">inode: 12345</text>
        <text x="430" y="202" text-anchor="middle" fill="var(--text-dim)" font-family="var(--font-mono)" font-size="10">disk data</text>
        <text x="430" y="245" text-anchor="middle" fill="var(--accent)" font-family="var(--font-sans)" font-size="11">If deleted → link works ✓</text>

        <defs>
          <marker id="arrowSoft" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)"/>
          </marker>
          <marker id="arrowHard" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)"/>
          </marker>
        </defs>
      </svg>
    </div>
  `;

  html += `
    <div class="links-section">
      <h3>Soft Links <span class="badge">ln -s</span></h3>
      <div class="link-card">
        <p>${soft.definition}</p>
        <ul>${soft.properties.map(p => `<li>${p}</li>`).join('')}</ul>
        <div class="link-code"><code>${highlightCode(escapeHtml(soft.syntax))}</code><button class="copy-btn" onclick="copyText('${escapeAttr(soft.syntax)}', this)">${ICONS.copy}</button></div>
        <div class="link-code"><code>${highlightCode(escapeHtml(soft.example))}</code><button class="copy-btn" onclick="copyText('${escapeAttr(soft.example)}', this)">${ICONS.copy}</button></div>
      </div>
    </div>
  `;

  html += `
    <div class="links-section">
      <h3>Hard Links <span class="badge">ln</span></h3>
      <div class="link-card">
        <p>${hard.definition}</p>
        <ul>${hard.properties.map(p => `<li>${p}</li>`).join('')}</ul>
        <div class="link-code"><code>${highlightCode(escapeHtml(hard.syntax))}</code><button class="copy-btn" onclick="copyText('${escapeAttr(hard.syntax)}', this)">${ICONS.copy}</button></div>
        <div class="link-code"><code>${highlightCode(escapeHtml(hard.example))}</code><button class="copy-btn" onclick="copyText('${escapeAttr(hard.example)}', this)">${ICONS.copy}</button></div>
      </div>
    </div>
  `;

  html += `
    <div class="links-section">
      <h3>Quick Comparison</h3>
      <table class="comparison-table">
        <thead><tr><th>Feature</th><th>Soft Link (ln -s)</th><th>Hard Link (ln)</th></tr></thead>
        <tbody>
          ${DATA.links.comparison.map(row => `<tr><td>${row.feature}</td><td>${escapeHtml(row.soft)}</td><td>${escapeHtml(row.hard)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;

  html += `
    <div class="warning-callout">
      ${ICONS.alert}
      <p><strong>Important:</strong> Always use an <strong>absolute path</strong> for the target when creating a symlink you'll reference from other locations (<code>ln -s /full/path/...</code>) — a relative target is resolved relative to the <em>link's</em> location, not your current directory, and is a common source of "broken link" confusion.</p>
    </div>
  `;

  return html;
}

// ===== RENDER COURSE =====
function renderCourse() {
  const modules = DATA.course.modules;
  const completedCount = Object.values(state.completedModules).filter(Boolean).length;
  const progress = Math.round((completedCount / modules.length) * 100);

  let html = `
    <h1 class="view-title">Course Roadmap</h1>
    <p class="view-subtitle">7 modules from Linux beginner to confident power user.</p>
    <div class="progress-bar">
      <div class="progress-bar-header">
        <span>Your Progress</span>
        <span class="progress-count">${completedCount} / ${modules.length} modules</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
    </div>
    <div class="roadmap">
  `;

  modules.forEach(mod => {
    const isCompleted = state.completedModules[mod.number];
    const isExpanded = state.expandedModules[mod.number];
    html += `
      <div class="module ${isCompleted ? 'completed' : ''} ${isExpanded ? 'expanded' : ''}">
        <div class="module-dot">
          ${isCompleted ? ICONS.check : `<span style="font-size:11px;font-family:var(--font-mono);color:var(--text-dim);">${mod.number}</span>`}
        </div>
        <div class="module-card">
          <div class="module-header" onclick="toggleModule(${mod.number})">
            <span class="module-number">M${mod.number}</span>
            <span class="module-title">${mod.title}</span>
            <span class="module-chevron">${ICONS.chevron}</span>
          </div>
          <div class="module-body">
            <div class="module-section">
              <h5>Concepts</h5>
              <ul>${mod.concepts.map(c => `<li>${c}</li>`).join('')}</ul>
            </div>
            <div class="module-section">
              <h5>Skills</h5>
              <ul>${mod.skills.map(s => `<li>${s}</li>`).join('')}</ul>
            </div>
            <div class="project-box">
              <h5>Project</h5>
              <p>${mod.project}</p>
            </div>
            <div class="module-actions">
              <button class="toggle-complete" onclick="toggleComplete(${mod.number})">
                ${ICONS.check}
                ${isCompleted ? 'Completed' : 'Mark as Complete'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  html += '</div>';
  return html;
}

// ===== GLOBAL SEARCH RESULTS =====
function renderSearchResults() {
  const term = state.searchTerm.toLowerCase();
  const t = state.searchTerm;
  let html = `
    <h1 class="view-title">Search results</h1>
    <p class="view-subtitle">Matches for "${escapeHtml(t)}" across all sections.</p>
  `;

  const results = [];

  DATA.categories.forEach(cat => {
    cat.commands.forEach(cmd => {
      const hay = `${cmd.command} ${cmd.description} ${cmd.example} ${cmd.notes || ''}`.toLowerCase();
      if (hay.includes(term)) results.push({ section: 'Cheat Sheet', title: cmd.command, desc: cmd.description, example: cmd.example });
    });
  });

  DATA.commandsBank.forEach(cmd => {
    const hay = `${cmd.command} ${cmd.category} ${cmd.briefDescription} ${cmd.keywords.join(' ')}`.toLowerCase();
    if (hay.includes(term)) results.push({ section: 'Commands Bank', title: cmd.command, desc: cmd.briefDescription, example: cmd.command });
  });

  DATA.exercises.forEach(ex => {
    const hay = `${ex.title} ${ex.text} ${(ex.deepDive || []).join(' ')}`.toLowerCase();
    if (hay.includes(term)) results.push({ section: 'Exercises', title: `${ex.id}. ${ex.title}`, desc: ex.text.replace(/<[^>]+>/g, '').slice(0, 180) });
  });

  const linkText = `${DATA.links.soft.definition} ${DATA.links.soft.properties.join(' ')} ${DATA.links.hard.definition} ${DATA.links.hard.properties.join(' ')} ${DATA.links.comparison.map(r => r.feature + r.soft + r.hard).join(' ')}`.toLowerCase();
  if (linkText.includes(term)) results.push({ section: 'Links Guide', title: 'Soft vs Hard Links', desc: 'Soft (symbolic) and hard link definitions, properties, and comparison.' });

  DATA.course.modules.forEach(mod => {
    const hay = `${mod.title} ${mod.concepts.join(' ')} ${mod.skills.join(' ')} ${mod.project}`.toLowerCase();
    if (hay.includes(term)) results.push({ section: 'Course', title: `M${mod.number}: ${mod.title}`, desc: mod.project });
  });

  (typeof RH124_SECTIONS !== 'undefined' ? RH124_SECTIONS : []).forEach(sec => {
    const hay = `${sec.title} ${sec.content}`.toLowerCase();
    if (hay.includes(term)) results.push({ section: 'RH124 Notes', title: sec.title, desc: 'See the RH124 Day 1 Notes section for details.' });
  });

  if (results.length === 0) {
    return html + `<div class="no-results">${ICONS.search}<h3>No matches found</h3><p>Try a different search term or synonym.</p></div>`;
  }

  const grouped = {};
  results.forEach(r => { (grouped[r.section] = grouped[r.section] || []).push(r); });

  Object.keys(grouped).forEach(sec => {
    let rows = '';
    grouped[sec].forEach(r => {
      rows += `
        <div class="cmd-row">
          <div class="cmd-grid">
            <div class="cmd-name">${highlightMatch(escapeHtml(r.title), t)}</div>
            <div>
              ${r.desc ? `<div class="cmd-desc">${highlightMatch(escapeHtml(r.desc), t)}</div>` : ''}
              ${r.example ? `<div class="cmd-example"><code>${highlightCode(highlightMatch(escapeHtml(r.example), t))}</code><button class="copy-btn" onclick="copyText('${escapeAttr(r.example)}', this)">${ICONS.copy}</button></div>` : ''}
            </div>
          </div>
        </div>`;
    });
    html += `
      <div class="category">
        <div class="category-header" style="cursor:default">
          <div class="category-icon">${ICONS.search}</div>
          <div class="category-title">${sec}</div>
          <div class="category-count">${grouped[sec].length}</div>
        </div>
        <div class="category-body">${rows}</div>
      </div>`;
  });

  return html;
}

// ===== QUIZ & FLASHCARDS =====
function buildQuizDeck() {
  // Flashcards from the commands bank: front = command, back = description.
  return DATA.commandsBank.map(c => ({
    front: c.command,
    back: c.briefDescription,
    category: c.category
  }));
}

function renderQuiz() {
  const deck = buildQuizDeck();
  const best = state.quizScores.best || 0;
  const total = deck.length;
  let html = `
    <h1 class="view-title">Quiz &amp; Flashcards</h1>
    <p class="view-subtitle">Flip the cards to memorize commands, then take the multiple-choice quiz.</p>
    <div class="progress-bar">
      <div class="progress-bar-header">
        <span>Best Quiz Score</span>
        <span class="progress-count">${best} / ${total}</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${total ? Math.round((best / total) * 100) : 0}%"></div></div>
    </div>
  `;

  // Flashcards
  html += `<div class="links-section"><h3>Flashcards <span class="badge">${total} cards</span></h3><div class="flashcard-grid">`;
  deck.forEach((card, i) => {
    html += `
      <div class="flashcard" onclick="this.classList.toggle('flipped')" title="Click to flip">
        <div class="flashcard-inner">
          <div class="flashcard-front">
            <span class="flashcard-cat">${escapeHtml(card.category)}</span>
            <code>${escapeHtml(card.front)}</code>
            <span class="flashcard-hint">click to reveal</span>
          </div>
          <div class="flashcard-back">
            <span class="flashcard-cat">${escapeHtml(card.category)}</span>
            <p>${escapeHtml(card.back)}</p>
          </div>
        </div>
      </div>`;
  });
  html += `</div></div>`;

  // Multiple-choice quiz
  html += `
    <div class="links-section">
      <h3>Multiple Choice Quiz</h3>
      <div class="quiz-box" id="quizBox">
        <button class="toggle-complete" onclick="startQuiz()">${ICONS.check} Start Quiz</button>
      </div>
    </div>
  `;

  return html;
}

let quizState = null;

function startQuiz() {
  const deck = buildQuizDeck();
  const total = deck.length;
  const qCount = Math.min(10, total);
  const pool = deck.slice().sort(() => Math.random() - 0.5);
  const questions = [];
  for (let i = 0; i < qCount; i++) {
    const q = pool[i];
    const others = deck.filter(d => d.back !== q.back).sort(() => Math.random() - 0.5).slice(0, 3).map(d => d.back);
    const options = [q.back, ...others].sort(() => Math.random() - 0.5);
    questions.push({ command: q.front, answer: q.back, options });
  }
  quizState = { questions, current: 0, score: 0 };
  showQuizQuestion();
}

function showQuizQuestion() {
  const box = document.getElementById('quizBox');
  if (!quizState) return;
  if (quizState.current >= quizState.questions.length) {
    if (quizState.score > (state.quizScores.best || 0)) { state.quizScores.best = quizState.score; saveState(); render(); }
    box.innerHTML = `
      <div class="no-results">
        ${ICONS.check}
        <h3>Quiz complete!</h3>
        <p>You scored <strong>${quizState.score} / ${quizState.questions.length}</strong>.</p>
        <button class="toggle-complete" onclick="startQuiz()">${ICONS.check} Try Again</button>
      </div>`;
    return;
  }
  const q = quizState.questions[quizState.current];
  box.innerHTML = `
    <div class="quiz-progress">Question ${quizState.current + 1} of ${quizState.questions.length} &middot; Score: ${quizState.score}</div>
    <div class="quiz-question">What does <code>${escapeHtml(q.command)}</code> do?</div>
    <div class="quiz-options">
      ${q.options.map((opt, oi) => `<button class="quiz-option" onclick="answerQuiz(${oi}, this)">${escapeHtml(opt)}</button>`).join('')}
    </div>
    <div class="quiz-feedback" id="quizFeedback"></div>
  `;
}

function answerQuiz(oi, btn) {
  if (!quizState) return;
  const q = quizState.questions[quizState.current];
  const chosen = q.options[oi];
  const correct = q.answer;
  const feedback = document.getElementById('quizFeedback');
  document.querySelectorAll('.quiz-option').forEach(b => b.disabled = true);
  if (chosen === correct) {
    quizState.score += 1;
    btn.classList.add('correct');
    feedback.innerHTML = '<span class="quiz-correct">Correct!</span>';
  } else {
    btn.classList.add('wrong');
    feedback.innerHTML = `<span class="quiz-wrong">Incorrect.</span> Correct answer: ${escapeHtml(correct)}`;
    document.querySelectorAll('.quiz-option').forEach(b => { if (b.textContent.trim() === correct) b.classList.add('correct'); });
  }
  quizState.current += 1;
  const next = document.createElement('button');
  next.className = 'toggle-complete';
  next.innerHTML = (quizState.current >= quizState.questions.length ? ICONS.check + ' See Results' : 'Next ' + ICONS.chevron);
  next.onclick = showQuizQuestion;
  feedback.appendChild(next);
}

// ===== HELPERS =====
function escapeHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function escapeAttr(s) { return s.replace(/'/g, "\\'").replace(/"/g, '&quot;'); }

function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    setTimeout(() => btn.classList.remove('copied'), 1500);
  });
}

// ===== FIXED TOGGLE FUNCTIONS =====
function toggleCategory(id) {
  state.collapsedCategories[id] = state.collapsedCategories[id] === false ? true : false;
  render(); saveState();
}
function toggleBankCategory(id) {
  state.collapsedBank[id] = state.collapsedBank[id] === false ? true : false;
  render(); saveState();
}
function toggleExercise(id) {
  state.collapsedExercises[id] = state.collapsedExercises[id] === false ? true : false;
  render(); saveState();
}
function toggleDeepDive(id) {
  state.collapsedDeepDives[id] = state.collapsedDeepDives[id] === true ? false : true;
  render(); saveState();
}
function toggleRH124(id) {
  state.collapsedRH124[id] = state.collapsedRH124[id] === false ? true : false;
  render(); saveState();
}
function toggleModule(num) {
  state.expandedModules[num] = !state.expandedModules[num];
  render(); saveState();
}
function toggleComplete(num) {
  state.completedModules[num] = !state.completedModules[num];
  render(); saveState();
}

// ===== RENDER DISPATCHER =====
function render() {
  const content = document.getElementById('content');
  let html;

  // Global search: any non-empty term searches across ALL sections.
  if (state.searchTerm.trim()) {
    html = renderSearchResults();
  } else if (state.view === 'cheatsheet') html = renderCheatSheet();
  else if (state.view === 'commandsBank') html = renderCommandsBank();
  else if (state.view === 'exercises') html = renderExercises();
  else if (state.view === 'rh124') html = renderRH124();
  else if (state.view === 'links') html = renderLinksGuide();
  else if (state.view === 'course') html = renderCourse();
  else if (state.view === 'quiz') html = renderQuiz();

  content.innerHTML = html;
  content.classList.remove('fade-in');
  void content.offsetWidth;
  content.classList.add('fade-in');

  const sw = document.getElementById('searchWrapper');
  // Search bar is always visible (it drives global search).
  sw.style.display = 'block';
}

// ===== EVENT LISTENERS =====
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    state.view = btn.dataset.view;
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
    saveState();
    closeSidebar();
  });
});

document.getElementById('themeToggle').addEventListener('click', () => {
  const next = state.theme === 'dark' ? 'light' : 'dark';
  state.theme = next;
  document.documentElement.dataset.theme = next;
  document.getElementById('themeIcon').outerHTML = next === 'dark'
    ? '<svg id="themeIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>'
    : '<svg id="themeIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  saveState();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  window.print();
});

document.getElementById('searchInput').addEventListener('input', (e) => {
  state.searchTerm = e.target.value;
  render();
});

document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    document.getElementById('searchInput').focus();
  }
  if (e.key === 'Escape') {
    const input = document.getElementById('searchInput');
    if (document.activeElement === input) {
      input.value = '';
      state.searchTerm = '';
      render();
      input.blur();
    }
  }
});

document.getElementById('menuBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('overlay').classList.add('show');
});

document.getElementById('overlay').addEventListener('click', closeSidebar);

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}

// ===== INIT =====
(function init() {
  document.documentElement.dataset.theme = state.theme;
  document.getElementById('themeIcon').outerHTML = state.theme === 'dark'
    ? '<svg id="themeIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>'
    : '<svg id="themeIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  const active = document.querySelector(`.nav-item[data-view="${state.view}"]`);
  if (active) {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    active.classList.add('active');
  }
  render();
})();
