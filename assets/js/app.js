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
  collapsedNotes: savedState.collapsedNotes || {},
  collapsedGroups: savedState.collapsedGroups || {},
  recentViews: savedState.recentViews || [],
  completedLab: savedState.completedLab || {},
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
    collapsedNotes: state.collapsedNotes,
    completedLab: state.completedLab,
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

// ===== DIAGRAMS =====
function linkDiagramSVG() {
  return `<svg width="560" height="280" viewBox="0 0 560 280" xmlns="http://www.w3.org/2000/svg">
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
      <marker id="arrowSoft" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)"/></marker>
      <marker id="arrowHard" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)"/></marker>
    </defs>
  </svg>`;
}

function architectureSVG() {
  return `<svg viewBox="0 0 760 130" xmlns="http://www.w3.org/2000/svg">
    <defs><marker id="ar" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="var(--accent)"/></marker></defs>
    <rect x="10" y="35" width="120" height="50" rx="6" fill="var(--bg-tertiary)" stroke="var(--border)"/><text x="70" y="65" text-anchor="middle" fill="var(--text)" font-family="var(--font-mono)" font-size="12">CLI / Terminal</text>
    <line x1="130" y1="60" x2="170" y2="60" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar)"/>
    <rect x="175" y="35" width="120" height="50" rx="6" fill="var(--bg-tertiary)" stroke="var(--border)"/><text x="235" y="65" text-anchor="middle" fill="var(--text)" font-family="var(--font-mono)" font-size="12">Shell (bash)</text>
    <line x1="295" y1="60" x2="335" y2="60" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar)"/>
    <rect x="340" y="35" width="120" height="50" rx="6" fill="var(--bg-tertiary)" stroke="var(--border)"/><text x="400" y="65" text-anchor="middle" fill="var(--text)" font-family="var(--font-mono)" font-size="12">Applications</text>
    <line x1="460" y1="60" x2="500" y2="60" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar)"/>
    <rect x="505" y="35" width="120" height="50" rx="6" fill="var(--bg-tertiary)" stroke="var(--border)"/><text x="565" y="65" text-anchor="middle" fill="var(--text)" font-family="var(--font-mono)" font-size="12">Kernel</text>
    <line x1="625" y1="60" x2="665" y2="60" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar)"/>
    <rect x="670" y="35" width="80" height="50" rx="6" fill="var(--accent-dim)" stroke="var(--accent)"/><text x="710" y="65" text-anchor="middle" fill="var(--accent)" font-family="var(--font-mono)" font-size="12">Hardware</text>
    <text x="390" y="112" text-anchor="middle" fill="var(--text-dim)" font-family="var(--font-sans)" font-size="11">User types a command → Shell interprets → Kernel talks to Hardware</text>
  </svg>`;
}

function syntaxSVG() {
  return `<svg viewBox="0 0 600 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="30" width="140" height="40" rx="6" fill="var(--accent-dim)" stroke="var(--accent)"/><text x="90" y="55" text-anchor="middle" fill="var(--accent)" font-family="var(--font-mono)" font-size="13">command</text>
    <text x="172" y="55" fill="var(--text-dim)" font-family="var(--font-mono)" font-size="16">[</text>
    <rect x="186" y="30" width="150" height="40" rx="6" fill="var(--bg-tertiary)" stroke="var(--border)"/><text x="261" y="55" text-anchor="middle" fill="var(--text)" font-family="var(--font-mono)" font-size="12">options -l -a</text>
    <text x="340" y="55" fill="var(--text-dim)" font-family="var(--font-mono)" font-size="16">]</text>
    <text x="362" y="55" fill="var(--text-dim)" font-family="var(--font-mono)" font-size="16">[</text>
    <rect x="376" y="30" width="160" height="40" rx="6" fill="var(--bg-tertiary)" stroke="var(--border)"/><text x="456" y="55" text-anchor="middle" fill="var(--text)" font-family="var(--font-mono)" font-size="12">arguments /path</text>
    <text x="540" y="55" fill="var(--text-dim)" font-family="var(--font-mono)" font-size="16">]</text>
  </svg>`;
}

function diagramSVG(kind) {
  if (kind === 'links') return linkDiagramSVG();
  if (kind === 'architecture') return architectureSVG();
  if (kind === 'syntax') return syntaxSVG();
  return '';
}

// ===== RENDER NOTE BLOCKS =====
function renderBlock(b) {
  switch (b.t) {
    case 'text':
      return `<div class="note-intro">${b.html}</div>`;
    case 'list':
      return `<ul class="note-list">${b.items.map(i => `<li>${i}</li>`).join('')}</ul>`;
    case 'steps':
      return `<ul class="note-list">${b.items.map(i => `<li>${i}</li>`).join('')}</ul>`;
    case 'table':
      return `<table class="comparison-table"><thead><tr>${b.head.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map(r => `<tr>${r.map(c => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    case 'code': {
      const code = b.code;
      const lang = b.lang || 'bash';
      return `<div class="cmd-example"><span class="code-label">${escapeHtml(lang)}</span><code>${highlightCode(escapeHtml(code))}</code><button class="copy-btn" onclick="copyText('${escapeAttr(code)}', this)" title="Copy">${ICONS.copy}</button></div>`;
    }
    case 'callout': {
      const kind = b.kind || 'info';
      const klass = kind === 'warn' ? 'warning' : (kind === 'danger' ? 'danger' : (kind === 'tip' ? 'tip' : 'info'));
      const label = { info: 'INFO', tip: 'TIP', warning: 'WARNING', danger: 'DANGER' }[klass] || 'NOTE';
      return `<div class="callout callout--${klass}" data-label="${label}">${ICONS.alert}<p>${b.html}</p></div>`;
    }
    case 'arabic':
      return `<div class="arabic-note">${escapeHtml(b.text)}</div>`;
    case 'diagram': {
      const CAP = { links: 'Symbolic vs hard links', architecture: 'Linux / RHEL system architecture', syntax: 'Command-line syntax and shell parsing' };
      return `<div class="note-diagram"><div class="diagram-card">${diagramSVG(b.kind)}</div><div class="diagram-caption">${CAP[b.kind] || ''}</div></div>`;
    }
    default:
      return '';
  }
}

// ===== RENDER MULTI-AUTHOR NOTES (flat long-form) =====
function renderNotes(authorKey) {
  const note = DATA.notes[authorKey];
  const secId = (s) => `note-sec-${authorKey}-${s}`;
  let html = `<h1 class="view-title">${note.author}'s Notes <span class="day-pill">Day ${note.day}</span></h1>`;
  html += `<div class="note-page">`;
  html += `
    <div class="note-miniheader">
      <div class="mini-avatar">${note.avatar}</div>
      <div class="mini-name">${note.author}</div>
      <select onchange="if(this.value) goToNoteSection('${authorKey}', this.value)">
        <option value="">Jump to section…</option>
        ${note.sections.map(s => `<option value="${s.id}">${escapeHtml(s.title)}</option>`).join('')}
      </select>
    </div>`;
  html += `<div class="note-layout"><aside class="note-toc">`;
  note.sections.forEach(s => {
    html += `<a href="#${secId(s.id)}" onclick="event.preventDefault(); goToNoteSection('${authorKey}','${s.id}')">${escapeHtml(s.title)}</a>`;
  });
  html += `</aside><div class="note-content">`;
  note.sections.forEach(s => {
    const body = s.blocks.map(renderBlock).join('');
    html += `<section class="note-section" id="${secId(s.id)}"><h2>${escapeHtml(s.title)} <span class="note-source">Source: ${note.author}</span></h2>${body}</section>`;
  });
  html += `</div></div></div>`;
  return html;
}

function goToNoteSection(authorKey, secId) {
  const el = document.getElementById(`note-sec-${authorKey}-${secId}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== RENDER LAB =====
function renderLab() {
  const lab = DATA.lab;
  let html = `<h1 class="view-title">${lab.title} <span class="day-pill">Day ${lab.day}</span></h1>`;
  html += `<p class="lab-intro">${lab.intro}</p>`;
  const total = lab.tasks.length;
  const doneCount = lab.tasks.filter(t => state.completedLab[t.id]).length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  html += `<div class="lab-progress"><span class="lab-count">${doneCount} / ${total} tasks complete</span><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div></div>`;
  lab.tasks.forEach(task => {
    const done = state.completedLab[task.id];
    html += `
      <div class="task-card ${done ? 'done' : ''}" id="task-${task.id}">
        <div class="task-header"><span class="source-badge">${task.tag}</span><span class="task-title">${task.title}</span></div>
        <p class="task-objective">${task.objective}</p>
        <ol class="task-steps">${task.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>
        <label class="task-checkbox"><input type="checkbox" ${done ? 'checked' : ''} onchange="toggleLabTask('${task.id}', this)"> Mark this task complete</label>
      </div>`;
  });
  return html;
}

// ===== RENDER TOPIC INDEX (pill cloud + popover) =====
function renderTopicIndex() {
  let html = `<h1 class="view-title">Topic Index</h1>`;
  html += `<p class="view-subtitle">Overlapping topics across all Day 1 contributors. Click a topic to see where it lives.</p>`;
  html += `<div class="topic-cloud">`;
  DATA.topicIndex.forEach((t, i) => {
    const size = t.links.length >= 4 ? 'lg' : (t.links.length <= 1 ? 'sm' : '');
    html += `<button class="topic-pill" data-size="${size}" onclick="toggleTopicPopover(${i}, this)">${escapeHtml(t.title)}</button>`;
  });
  html += `</div><div id="topicPopover"></div>`;
  return html;
}

function toggleTopicPopover(i, btn) {
  const box = document.getElementById('topicPopover');
  if (!box) return;
  if (box.dataset.open === String(i)) {
    box.innerHTML = '';
    box.dataset.open = '';
    btn.classList.remove('active');
    return;
  }
  const t = DATA.topicIndex[i];
  btn.parentElement.querySelectorAll('.topic-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  box.dataset.open = String(i);
  box.innerHTML = `<div class="topic-popover"><h4>${escapeHtml(t.title)}</h4><div class="topic-desc" style="font-size:12.5px;color:var(--text-dim);margin-bottom:8px">${escapeHtml(t.desc)}</div><div class="topic-links">${t.links.map(l => `<button class="topic-link" onclick="goToView('${l.view}')">${escapeHtml(l.label)}</button>`).join('')}</div></div>`;
}

// ===== TOGGLES & NAV HELPERS =====
function toggleNoteSection(author, id) {
  const key = author + ':' + id;
  state.collapsedNotes[key] = state.collapsedNotes[key] === false ? true : false;
  render(); saveState();
}

function toggleLabTask(id, el) {
  state.completedLab[id] = el.checked;
  const card = document.getElementById('task-' + id);
  if (card) card.classList.toggle('done', el.checked);
  saveState();
}

function goToView(view) {
  state.view = view;
  state.searchTerm = '';
  pushRecent(view);
  const input = document.getElementById('searchInput');
  if (input) input.value = '';
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  ensureGroupOpen(view);
  render(); saveState(); closeSidebar();
}

const VIEW_GROUP = {
  cheatsheet: 'cheatsheet',
  commandsBank: 'course', exercises: 'course', rh124: 'course', links: 'course',
  course: 'practice', quiz: 'practice',
  'notes-rahma': 'day1', 'notes-michael': 'day1', 'notes-hager': 'day1', lab: 'day1', topicindex: 'day1'
};
function groupForView(view) { return VIEW_GROUP[view] || 'cheatsheet'; }
function ensureGroupOpen(view) {
  const el = document.querySelector(`.nav-group[data-group="${groupForView(view)}"]`);
  if (el) el.classList.remove('collapsed');
}
function toggleNavGroup(group) {
  const el = document.querySelector(`.nav-group[data-group="${group}"]`);
  if (!el) return;
  const collapsed = el.classList.toggle('collapsed');
  state.collapsedGroups[group] = collapsed;
  saveState();
}
function pushRecent(view) {
  if (!view) return;
  state.recentViews = [view, ...state.recentViews.filter(v => v !== view)].slice(0, 10);
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

  if (DATA.notes) {
    Object.keys(DATA.notes).forEach(authorKey => {
      const note = DATA.notes[authorKey];
      note.sections.forEach(sec => {
        const hay = `${note.author} ${note.subtitle} ${sec.title} ${getNoteText(sec.blocks)}`.toLowerCase();
        if (hay.includes(term)) results.push({ section: `${note.author}'s Notes`, title: sec.title, desc: 'See the ' + note.author + ' Notes section for details.' });
      });
    });
  }
  if (DATA.lab) {
    DATA.lab.tasks.forEach(task => {
      const hay = `${task.tag} ${task.title} ${task.objective} ${task.steps.join(' ')}`.toLowerCase();
      if (hay.includes(term)) results.push({ section: 'Lab 1', title: task.title, desc: task.objective });
    });
  }

  (typeof RH124_SECTIONS !== 'undefined' ? RH124_SECTIONS : []).forEach(sec => {
    const hay = `${sec.title} ${sec.content}`.toLowerCase();
    if (hay.includes(term)) results.push({ section: 'RH124 Notes', title: sec.title, desc: 'See the RH124 Day 1 Notes section for details.' });
  });

  if (results.length === 0) {
    const popular = ['ls', 'cd', 'grep', 'chmod', 'rm'];
    const pops = popular.map(p => {
      const c = DATA.commandsBank.find(x => x.command === p);
      if (!c) return '';
      return `<div class="cmd-row"><div class="cmd-grid"><div class="cmd-name">${escapeHtml(c.command)}</div><div><div class="cmd-desc">${escapeHtml(c.briefDescription)}</div><div class="cmd-example"><code>${highlightCode(escapeHtml(c.command))}</code><button class="copy-btn" onclick="copyText('${escapeAttr(c.command)}', this)">${ICONS.copy}</button></div></div></div></div>`;
    }).join('');
    const recent = state.recentViews.length
      ? `<div class="links-section"><h3>Recently viewed</h3><div class="topic-links">${state.recentViews.slice(0, 5).map(v => `<button class="topic-link" onclick="goToView('${v}')">${escapeHtml(v.replace('notes-', ''))}</button>`).join('')}</div></div>`
      : '';
    return html + `<div class="no-results">${ICONS.search}<h3>No matches found</h3><p>Try a different search term or synonym.</p></div><div class="links-section"><h3>Popular commands</h3>${pops}</div>${recent}`;
  }

  const grouped = {};
  results.forEach(r => { (grouped[r.section] = grouped[r.section] || []).push(r); });

  Object.keys(grouped).forEach(sec => {
    const items = grouped[sec];
    const shown = items.slice(0, 4);
    const extra = items.slice(4);
    const extraHtml = extra.length
      ? `<div class="search-group-extra" id="sgex-${escId(sec)}" style="display:none">${extra.map(r => searchRow(r, t)).join('')}</div><button class="topic-link" style="margin-top:8px" onclick="toggleSearchGroup('${escId(sec)}')">See all ${items.length} results</button>`
      : '';
    html += `
      <div class="category">
        <div class="category-header" style="cursor:default">
          <div class="category-icon">${ICONS.search}</div>
          <div class="category-title">${sec}</div>
          <div class="category-count">${items.length}</div>
        </div>
        <div class="category-body">${shown.map(r => searchRow(r, t)).join('')}${extraHtml}</div>
      </div>`;
  });

  return html;
}

function searchRow(r, t) {
  return `<div class="cmd-row"><div class="cmd-grid"><div class="cmd-name">${highlightMatch(escapeHtml(r.title), t)}</div><div>${r.desc ? `<div class="cmd-desc">${highlightMatch(escapeHtml(r.desc), t)}</div>` : ''}${r.example ? `<div class="cmd-example"><code>${highlightCode(highlightMatch(escapeHtml(r.example), t))}</code><button class="copy-btn" onclick="copyText('${escapeAttr(r.example)}', this)">${ICONS.copy}</button></div>` : ''}</div></div><span class="source-badge search-badge">${escapeHtml(r.section)}</span></div>`;
}

function escId(s) { return String(s).replace(/[^a-zA-Z0-9_-]/g, '_'); }

function toggleSearchGroup(sec) {
  const el = document.getElementById('sgex-' + sec);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
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
let quizMissed = [];

function startQuiz(questionsOverride) {
  const deck = buildQuizDeck();
  let questions;
  if (questionsOverride && questionsOverride.length) {
    questions = questionsOverride.map(q => {
      const others = deck.filter(d => d.back !== q.back).sort(() => Math.random() - 0.5).slice(0, 3).map(d => d.back);
      return { command: q.front, answer: q.back, options: [q.back, ...others].sort(() => Math.random() - 0.5) };
    });
  } else {
    const total = deck.length;
    const qCount = Math.min(10, total);
    const pool = deck.slice().sort(() => Math.random() - 0.5);
    questions = [];
    for (let i = 0; i < qCount; i++) {
      const q = pool[i];
      const others = deck.filter(d => d.back !== q.back).sort(() => Math.random() - 0.5).slice(0, 3).map(d => d.back);
      const options = [q.back, ...others].sort(() => Math.random() - 0.5);
      questions.push({ command: q.front, answer: q.back, options });
    }
  }
  quizState = { questions, current: 0, score: 0, wrong: [] };
  showQuizQuestion();
}

function showQuizQuestion() {
  const box = document.getElementById('quizBox');
  if (!quizState) return;
  if (quizState.current >= quizState.questions.length) {
    const isBest = quizState.score > (state.quizScores.best || 0);
    if (isBest) { state.quizScores.best = quizState.score; saveState(); }
    const missed = quizState.wrong.length;
    quizMissed = quizState.wrong;
    box.innerHTML = `
      <div class="no-results">
        ${ICONS.check}
        <h3>Quiz complete!</h3>
        <p>You scored <strong>${quizState.score} / ${quizState.questions.length}</strong>.</p>
        ${isBest ? '<p class="quiz-correct">New best score!</p>' : ''}
        ${missed ? `<button class="toggle-complete" onclick="startQuiz(quizMissed)">${ICONS.check} Retry ${missed} missed</button>` : ''}
        <button class="toggle-complete" onclick="startQuiz()">${ICONS.check} Try Again</button>
      </div>`;
    render();
    return;
  }
  const q = quizState.questions[quizState.current];
  const dots = quizState.questions.map((_, i) => `<span class="quiz-dot ${i < quizState.current ? 'done' : ''} ${i === quizState.current ? 'current' : ''}"></span>`).join('');
  box.innerHTML = `
    <div class="quiz-dots">${dots}</div>
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
    quizState.wrong.push({ front: q.command, back: q.answer });
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
function escapeAttr(s) {
  return s.replace(/\\/g, '\\\\')
          .replace(/'/g, "\\'")
          .replace(/"/g, '&quot;')
          .replace(/\r/g, '')
          .replace(/\n/g, '\\n');
}
function stripHtml(s) { return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
function getNoteText(blocks) {
  return blocks.map(b => {
    if (b.t === 'text' || b.t === 'callout') return stripHtml(b.html || '');
    if (b.t === 'arabic') return b.text || '';
    if (b.t === 'code') return b.code || '';
    if (b.t === 'table') return (b.head || []).concat(...(b.rows || [])).join(' ');
    if (b.t === 'list' || b.t === 'steps') return (b.items || []).join(' ');
    return '';
  }).join(' ').toLowerCase();
}

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
  else if (state.view === 'notes-rahma') html = renderNotes('rahma');
  else if (state.view === 'notes-michael') html = renderNotes('michael');
  else if (state.view === 'notes-hager') html = renderNotes('hager');
  else if (state.view === 'lab') html = renderLab();
  else if (state.view === 'topicindex') html = renderTopicIndex();
  else if (state.view === 'course') html = renderCourse();
  else if (state.view === 'quiz') html = renderQuiz();

  content.innerHTML = html;
  content.classList.remove('fade-in');
  void content.offsetWidth;
  content.classList.add('fade-in');

  const appEl = document.querySelector('.app');
  if (appEl) appEl.classList.toggle('searching', !!state.searchTerm.trim());

  postRender();

  const sw = document.getElementById('searchWrapper');
  // Search bar is always visible (it drives global search).
  sw.style.display = 'block';
}

function postRender() {
  const toc = document.querySelector('.note-toc');
  if (!toc || !('IntersectionObserver' in window)) return;
  const links = Array.from(toc.querySelectorAll('a'));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const a = toc.querySelector('a[href="#' + e.target.id + '"]');
        if (a) a.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  document.querySelectorAll('.note-section').forEach(s => obs.observe(s));
}

// ===== EVENT LISTENERS =====
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    state.view = btn.dataset.view;
    pushRecent(btn.dataset.view);
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ensureGroupOpen(btn.dataset.view);
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
  Object.keys(state.collapsedGroups).forEach(g => {
    if (state.collapsedGroups[g]) {
      const el = document.querySelector(`.nav-group[data-group="${g}"]`);
      if (el) el.classList.add('collapsed');
    }
  });
  ensureGroupOpen(state.view);
  render();
})();
