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
  tab: savedState.tab || 'general',
  view: savedState.view || 'cheatsheet',
  searchTerm: '',
  cmdTerm: savedState.cmdTerm || '',
  cmdCats: savedState.cmdCats || [],
  theme: savedState.theme || 'dark',
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
    tab: state.tab,
    view: state.view,
    cmdTerm: state.cmdTerm,
    cmdCats: state.cmdCats,
    theme: state.theme,
    collapsedCategories: state.collapsedCategories,
    collapsedExercises: state.collapsedExercises,
    collapsedDeepDives: state.collapsedDeepDives,
    collapsedRH124: state.collapsedRH124,
    collapsedBank: state.collapsedBank,
    collapsedNotes: state.collapsedNotes,
    collapsedGroups: state.collapsedGroups,
    recentViews: state.recentViews,
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
  // Paths: handle ~/ first, then absolute paths without double-wrapping or matching </span>
  s = s.replace(/(~\/[^\s<>"'|]*)/g, '<span class="path-token">$1</span>');
  s = s.replace(/(?<![~\w"'>])(\/[^\s<>"'|]*)/g, '<span class="path-token">$1</span>');
  // Flags: avoid matching inside already-created spans (starts with <)
  s = s.replace(/(\s)(-{1,2}[a-zA-Z][\w-]*)/g, '$1<span class="flag-token">$2</span>');
  return s;
}

function highlightCommandName(cmd) {
  if (!cmd) return '';
  const parts = String(cmd).split(' ');
  return `<span class="cmd-token">${escapeHtml(parts[0])}</span>` + (parts.length > 1 ? ' ' + escapeHtml(parts.slice(1).join(' ')) : '');
}

function highlightMatch(text, term) {
  if (!term || !text) return text;
  const escTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escTerm})`, 'gi');
  // Avoid injecting <mark> inside HTML tags: split by tags and only highlight outside
  if (text.includes('<')) {
    return text.split(/(<[^>]*>)/g).map(part => {
      if (part.startsWith('<')) return part;
      return part.replace(regex, '<mark>$1</mark>');
    }).join('');
  }
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
            <div class="cmd-name">${highlightMatch(highlightCommandName(cmd.command), state.searchTerm)}</div>
            <div>
              <div class="cmd-desc">${highlightMatch(escapeHtml(cmd.description), state.searchTerm)}</div>
              <div class="cmd-example">
                <code>${highlightMatch(highlightCode(escapeHtml(cmd.example)), state.searchTerm)}</code>
                <button class="copy-btn" onclick="copyText('${escapeAttr(cmd.example)}', this)" title="Copy" aria-label="Copy code">
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
                  <code>${highlightMatch(highlightCode(escapeHtml(example)), state.searchTerm)}</code>
                  <button class="copy-btn" onclick="copyText('${escapeAttr(example)}', this)" title="Copy" aria-label="Copy code">
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
    ${breadcrumbs([{label:'General Knowledge', tab:'general'}, {label:'Practical Exercises'}])}
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

// ===== RENDER RH124 NOTES (body) =====
function renderRH124Body() {
  let html = '';

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

// ===== RENDER LINKS GUIDE (body) =====
function renderLinksBody() {
  const soft = DATA.links.soft;
  const hard = DATA.links.hard;
  let html = '';

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
      return `<div class="cmd-example"><span class="code-label" aria-hidden="true">${escapeHtml(lang)}</span><code>${highlightCode(escapeHtml(code))}</code><button class="copy-btn" onclick="copyText('${escapeAttr(code)}', this)" title="Copy" aria-label="Copy code">${ICONS.copy}</button></div>`;
    }
    case 'callout': {
      const kind = b.kind || 'info';
      const klass = kind === 'warn' ? 'warning' : (kind === 'danger' ? 'danger' : (kind === 'tip' ? 'tip' : 'info'));
      const label = { info: 'INFO', tip: 'TIP', warning: 'WARNING', danger: 'DANGER' }[klass] || 'NOTE';
      return `<div class="callout callout--${klass}" data-label="${label}">${ICONS.alert}<p>${b.html}</p></div>`;
    }
    case 'arabic':
      return `<div class="arabic-note" lang="ar" dir="rtl">${escapeHtml(b.text)}</div>`;
    case 'diagram': {
      const CAP = { links: 'Symbolic vs hard links', architecture: 'Linux / RHEL system architecture', syntax: 'Command-line syntax and shell parsing' };
      return `<div class="note-diagram"><div class="diagram-card" role="img" aria-label="${CAP[b.kind] || ''}">${diagramSVG(b.kind)}</div><div class="diagram-caption">${CAP[b.kind] || ''}</div></div>`;
    }
    default:
      return '';
  }
}

// ===== RENDER MULTI-AUTHOR NOTES (body, flat long-form) =====
function renderNotesBody(authorKey) {
  const note = DATA.notes[authorKey];
  const secId = (s) => `note-sec-${authorKey}-${s}`;
  let html = breadcrumbs([{label:'NTI Linux Course', tab:'course'}, {label:'Day 1', tab:'course', view:'day1-content'}, {label: note.author + "'s Notes"}]);
  html += `<h1 class="view-title">${escapeHtml(note.author)}'s Notes</h1>`;
  html += `<p class="view-subtitle">${escapeHtml(note.subtitle)}</p>`;
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

// ===== RENDER LAB (body) =====
function renderLabBody() {
  const lab = DATA.lab;
  let html = breadcrumbs([{label:'NTI Linux Course', tab:'course'}, {label:'Day 1', tab:'course', view:'day1-content'}, {label:'Lab Task'}]);
  html += `<h1 class="view-title">${escapeHtml(lab.title || 'Lab Task')}</h1>`;
  html += `<p class="view-subtitle">${escapeHtml(lab.subtitle || 'Hands-on task for this day.')}</p>`;
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
  let html = breadcrumbs([{label:'General Knowledge', tab:'general'}, {label:'Topic Index'}]);
  html += `<h1 class="view-title">Topic Index</h1>`;
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
  // live-update progress bar without full re-render
  const lab = DATA.lab;
  if (lab) {
    const total = lab.tasks.length;
    const doneCount = lab.tasks.filter(t => state.completedLab[t.id]).length;
    const pct = total ? Math.round((doneCount / total) * 100) : 0;
    const bar = document.querySelector('.lab-progress .progress-fill');
    const countEl = document.querySelector('.lab-progress .lab-count');
    if (bar) bar.style.width = pct + '%';
    if (countEl) countEl.textContent = `${doneCount} / ${total} tasks complete`;
    if (doneCount === total) showToast('Lab complete — great work!');
  }
  saveState();
}

const TABS = [
  { id: 'general', label: 'General Knowledge', views: [
    { id: 'cheatsheet', label: 'Cheat Sheet' },
    { id: 'topicindex', label: 'Topic Index' },
    { id: 'exercises', label: 'Practical Exercises' },
    { id: 'roadmap7', label: 'Course Roadmap' }
  ]},
  { id: 'course', label: 'NTI Linux Course', views: [
    { id: 'roadmap', label: 'Roadmap (5-day)' },
    { id: 'day1', label: 'Day 1' },
    { id: 'day2', label: 'Day 2' },
    { id: 'day3', label: 'Day 3' },
    { id: 'day4', label: 'Day 4' },
    { id: 'day5', label: 'Day 5' }
  ]},
  { id: 'links', label: 'Helpful Links', views: [ { id: 'links', label: 'Helpful Links' } ] },
  { id: 'quiz', label: 'Flashcards & Quizzes', views: [ { id: 'quiz', label: 'Flashcards & Quiz' } ] }
];
const VIEW_MAP = {
  'cheatsheet': { tab: 'general', view: 'cheatsheet' },
  'commandsBank': { tab: 'general', view: 'cheatsheet' },
  'topicindex': { tab: 'general', view: 'topicindex' },
  'exercises': { tab: 'general', view: 'exercises' },
  'course': { tab: 'general', view: 'roadmap7' },
  'rh124': { tab: 'course', view: 'day1-content' },
  'links': { tab: 'course', view: 'day1-content' },
  'notes-rahma': { tab: 'course', view: 'day1-notes-rahma' },
  'notes-michael': { tab: 'course', view: 'day1-notes-michael' },
  'notes-hager': { tab: 'course', view: 'day1-notes-hager' },
  'notes-sagda': { tab: 'course', view: 'day2-notes-sagda' },
  'notes-tarek': { tab: 'course', view: 'day2-notes-tarek' },
  'lab': { tab: 'course', view: 'day1-lab' },
  'lab2': { tab: 'course', view: 'day2-lab' },
  'quiz': { tab: 'quiz', view: 'quiz' }
};

// NTI Course sub-navigation: each day splits into Content / Notes / Lab sub-pages.
// Fully replaced from NTI Course Content Resources (single source of truth)
const COURSE_NAV = [
  { id: 'roadmap', label: 'Roadmap (3-day)' },
  { id: 'day1', label: 'Day 1 — RHEL & Files', sub: [
    { id: 'day1-content', label: 'Content (Canonical)' },
    { id: 'day1-notes-rahma', label: "Rahma's Notes" },
    { id: 'day1-notes-michael', label: "Michael's Notes" },
    { id: 'day1-notes-hager', label: "Hager's Notes" },
    { id: 'day1-lab', label: 'Lab 1' }
  ]},
  { id: 'day2', label: 'Day 2 — Help & Users', sub: [
    { id: 'day2-content', label: 'Content (Canonical)' },
    { id: 'day2-notes-sagda', label: "Sagda's Notes" },
    { id: 'day2-notes-tarek', label: "Mohammed Tarek's Notes" },
    { id: 'day2-lab', label: 'Lab 2' }
  ]},
  { id: 'day3', label: 'Day 3 — Coming Soon', sub: [
    { id: 'day3-content', label: 'Coming Soon' }
  ]}
];

const COURSE_RENDER = {
  'roadmap': () => renderNTIRoadmap(),
  'day1-content': () => renderNTICanonical('day1'),
  'day1-notes-rahma': () => renderNotesBody('rahma'),
  'day1-notes-michael': () => renderNotesBody('michael'),
  'day1-notes-hager': () => renderNotesBody('hager'),
  'day1-lab': () => renderLabBodyForDay('day1'),
  'day2-content': () => renderNTICanonical('day2'),
  'day2-notes-sagda': () => renderNotesBody('sagda'),
  'day2-notes-tarek': () => renderNotesBody('tarek'),
  'day2-lab': () => renderLabBodyForDay('day2'),
  'day3-content': () => renderNTICanonical('day3')
};
function breadcrumbs(items) {
  // items: [{label, view?, tab?}]
  if (!items || !items.length) return '';
  const html = items.map((it, idx) => {
    const isLast = idx === items.length - 1;
    if (isLast || (!it.view && !it.tab)) return `<span class="crumb current" aria-current="page">${escapeHtml(it.label)}</span>`;
    let onclick = '';
    if (it.tab && it.view) onclick = `setView('${it.tab}','${it.view}')`;
    else if (it.view) onclick = `goToView('${it.view}')`;
    else if (it.tab) onclick = `switchTab('${it.tab}')`;
    return `<button class="crumb link" onclick="${onclick}">${escapeHtml(it.label)}</button>`;
  }).join('<span class="crumb-sep" aria-hidden="true">›</span>');
  return `<nav class="breadcrumbs" aria-label="Breadcrumb">${html}</nav>`;
}
function tabDefaultView(tab) { const t = TABS.find(x => x.id === tab); return t ? t.views[0].id : 'cheatsheet'; }

// ===== NTI CANONICAL RENDER (single source of truth) =====
function renderNTICanonical(dayId){
  const day = (DATA.nti && DATA.nti.days && DATA.nti.days[dayId]) || null;
  if(!day){
    // fallback to old placeholder
    return renderDayPlaceholder(dayId);
  }
  // Day3 coming soon has single section
  const isComingSoon = day.title && day.title.toLowerCase().includes('coming soon');
  let html = breadcrumbs([{label:'NTI Linux Course', tab:'course'}, {label: dayId==='day1'?'Day 1': dayId==='day2'?'Day 2':'Day 3', tab:'course', view: dayId+'-content'}, {label: isComingSoon?'Coming Soon':'Content'}]);
  // Override for day3: simpler breadcrumb
  if(dayId==='day3'){
    html = breadcrumbs([{label:'NTI Linux Course', tab:'course'}, {label:'Day 3'}]);
  } else {
    html = breadcrumbs([{label:'NTI Linux Course', tab:'course'}, {label:'Roadmap', tab:'course', view:'roadmap'}, {label: dayId==='day1'?'Day 1':'Day 2'}]);
  }
  html += `<h1 class="view-title">${escapeHtml(day.title)}</h1>`;
  if(day.subtitle) html += `<p class="view-subtitle">${escapeHtml(day.subtitle)}</p>`;
  if(isComingSoon){
    // Render its sections as is
    html += `<div class="note-page"><div class="note-layout"><aside class="note-toc" style="display:none"></aside><div class="note-content" style="border:none;padding:0">`;
    day.sections.forEach(sec=>{
      const body = sec.blocks.map(renderBlock).join('');
      html += `<section class="note-section"><h2>${escapeHtml(sec.title)}</h2>${body}</section>`;
    });
    html += `</div></div></div>`;
    html += `<div class="day-nav-foot" style="display:flex;gap:10px;flex-wrap:wrap"><button class="toggle-complete" onclick="setView('course','day2-content')">Review Day 2</button><button class="chip" onclick="setView('course','roadmap')">Back to Roadmap</button></div>`;
    return html;
  }
  // For day1/day2: render with TOC similar to notes
  const secId = (s) => `nti-sec-${dayId}-${s}`;
  html += `<div class="note-page">`;
  html += `<div class="note-miniheader"><div class="mini-avatar">${dayId==='day1'?'1':'2'}</div><div class="mini-name">${escapeHtml(day.title)}</div><select onchange="if(this.value) document.getElementById('nti-sec-${dayId}-'+this.value)?.scrollIntoView({behavior:'smooth', block:'start'})"><option value="">Jump to section…</option>${day.sections.map(s=>`<option value="${s.id}">${escapeHtml(s.title)}</option>`).join('')}</select></div>`;
  html += `<div class="note-layout"><aside class="note-toc">`;
  day.sections.forEach(s=>{ html += `<a href="#${secId(s.id)}" onclick="event.preventDefault(); document.getElementById('${secId(s.id)}')?.scrollIntoView({behavior:'smooth', block:'start'})">${escapeHtml(s.title)}</a>`; });
  html += `</aside><div class="note-content">`;
  day.sections.forEach(s=>{
    const body = s.blocks.map(renderBlock).join('');
    html += `<section class="note-section" id="${secId(s.id)}"><h2>${escapeHtml(s.title)}</h2>${body}</section>`;
  });
  html += `</div></div></div>`;
  // Cross-links
  if(dayId==='day1'){
    html += `<div class="day-nav-foot" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px"><button class="toggle-complete" onclick="setView('course','day1-lab')">Go to Lab 1 →</button><button class="chip" onclick="setView('course','day2-content')">Next: Day 2 →</button></div>`;
  } else if(dayId==='day2'){
    html += `<div class="day-nav-foot" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px"><button class="toggle-complete" onclick="setView('course','day2-lab')">Go to Lab 2 →</button><button class="chip" onclick="setView('course','day1-content')">← Back to Day 1</button><button class="chip" onclick="setView('course','day3-content')">Day 3 (Coming Soon)</button></div>`;
  }
  return html;
}

function renderLabBodyForDay(dayId){
  // Prefer nti.labs, fallback to DATA.labs or DATA.lab
  const lab = (DATA.nti && DATA.nti.labs && DATA.nti.labs[dayId]) || (DATA.labs && DATA.labs[dayId]) || (dayId==='day1' ? DATA.lab : null);
  if(!lab || !lab.tasks || !lab.tasks.length){
    // fallback to generic placeholder
    return renderCourseDayLab(dayId);
  }
  const num = dayId.replace('day','');
  let html = breadcrumbs([{label:'NTI Linux Course', tab:'course'}, {label:'Day ' + num, tab:'course', view: dayId+'-content'}, {label:'Lab ' + num}]);
  html += `<h1 class="view-title">${escapeHtml(lab.title || ('Lab ' + num))}</h1>`;
  html += `<p class="view-subtitle">${escapeHtml(lab.subtitle || 'Hands-on tasks. Tick when done.')}</p>`;
  const total = lab.tasks.length;
  const doneCount = lab.tasks.filter(t=> state.completedLab[t.id]).length;
  const pct = total ? Math.round((doneCount/total)*100):0;
  html += `<div class="lab-progress"><span class="lab-count">${doneCount} / ${total} tasks complete</span><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div></div>`;
  lab.tasks.forEach(task=>{
    const done = state.completedLab[task.id];
    html += `<div class="task-card ${done?'done':''}" id="task-${task.id}"><div class="task-header"><span class="source-badge">${escapeHtml(task.tag||'Lab')}</span><span class="task-title">${escapeHtml(task.title)}</span></div><p class="task-objective">${escapeHtml(task.objective||'')}</p><ol class="task-steps">${(task.steps||[]).map(s=>`<li>${escapeHtml(s)}</li>`).join('')}</ol><label class="task-checkbox"><input type="checkbox" ${done?'checked':''} onchange="toggleLabTask('${task.id}', this)"> Mark this task complete</label></div>`;
  });
  html += `<div class="day-nav-foot" style="display:flex;gap:10px;flex-wrap:wrap"><button class="toggle-complete" onclick="setView('course','${dayId}-content')">← Back to Content</button>${dayId==='day1'?`<button class="chip" onclick="setView('course','day2-content')">Next: Day 2 →</button>`:''}${dayId==='day2'?`<button class="chip" onclick="setView('course','day3-content')">Day 3 (Coming Soon)</button>`:''}</div>`;
  return html;
}

function goToView(view) {
  const m = VIEW_MAP[view] || { tab: 'general', view: 'cheatsheet' };
  setView(m.tab, m.view);
}

function setView(tab, view) {
  state.tab = tab;
  state.view = view;
  state.searchTerm = '';
  pushRecent(view);
  const input = document.getElementById('searchInput');
  if (input) input.value = '';
  document.querySelectorAll('.tab').forEach(t => {
    const isActive = t.dataset.tab === tab;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    t.tabIndex = isActive ? 0 : -1;
  });
  scrollActiveTabIntoView();
  renderSubNav();
  render(); saveState(); closeSidebar();
  // Move focus to content for screen readers
  const contentEl = document.getElementById('content');
  if (contentEl) contentEl.focus({preventScroll:true});
}

function scrollActiveTabIntoView() {
  const tabs = document.getElementById('tabs');
  if (!tabs) return;
  const active = tabs.querySelector('.tab.active');
  if (!active) return;
  const tabRect = active.getBoundingClientRect();
  const tabsRect = tabs.getBoundingClientRect();
  if (tabRect.left < tabsRect.left || tabRect.right > tabsRect.right) {
    tabs.scrollTo({ left: active.offsetLeft - 8, behavior: 'smooth' });
  }
}

function switchTab(tab) {
  setView(tab, tabDefaultView(tab));
}

function renderSubNav() {
  const nav = document.getElementById('subnav');
  if (!nav) return;

  if (state.tab === 'course') {
    let html = '';
    COURSE_NAV.forEach(group => {
      if (!group.sub) {
        const active = group.id === state.view;
        html += `<button class="subnav-item ${active ? 'active' : ''}" data-view="${group.id}" onclick="setView('course','${group.id}')" ${active ? 'aria-current="page"' : ''}>${escapeHtml(group.label)}</button>`;
        return;
      }
      html += `
        <div class="nav-group nav-group-day">
          <div class="nav-group-header" onclick="setView('course','${group.sub[0].id}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' ') {event.preventDefault(); setView('course','${group.sub[0].id}')}">
            <span>${escapeHtml(group.label)}</span>
            <svg class="group-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="nav-group-items">
            ${group.sub.map(s => {
              const active = s.id === state.view;
              return `<button class="subnav-item ${active ? 'active' : ''}" data-view="${s.id}" onclick="setView('course','${s.id}')" ${active ? 'aria-current="page"' : ''}>${escapeHtml(s.label)}</button>`;
            }).join('')}
          </div>
        </div>`;
    });
    nav.innerHTML = html;
    return;
  }

  const tab = TABS.find(t => t.id === state.tab);
  if (!tab) return;
  nav.innerHTML = tab.views.map(v => {
    const active = v.id === state.view;
    return `<button class="subnav-item ${active ? 'active' : ''}" data-view="${v.id}" onclick="setView('${tab.id}','${v.id}')" ${active ? 'aria-current="page"' : ''}>${escapeHtml(v.label)}</button>`;
  }).join('');
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
    ${breadcrumbs([{label:'General Knowledge', tab:'general'}, {label:'7-Module Roadmap'}])}
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
    ${breadcrumbs([{label:'Search', view:'cheatsheet'}, {label:`“${escapeHtml(t)}”`}])}
    <h1 class="view-title">Search results</h1>
    <p class="view-subtitle">Matches for "${escapeHtml(t)}" across all sections. <button class="topic-link" onclick="document.getElementById('searchInput').value=''; state.searchTerm=''; render()" style="margin-left:8px">Clear search ✕</button></p>
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
  // Search new NTI canonical days (single source of truth)
  if (DATA.nti && DATA.nti.days) {
    Object.keys(DATA.nti.days).forEach(dayId=>{
      const day = DATA.nti.days[dayId];
      if(!day || !day.sections) return;
      const dayLabel = dayId==='day1'?'NTI Day 1': dayId==='day2'?'NTI Day 2':'NTI Day 3';
      day.sections.forEach(sec=>{
        const hay = `${day.title} ${day.subtitle||''} ${sec.title} ${getNoteText(sec.blocks)}`.toLowerCase();
        if(hay.includes(term)) results.push({ section: dayLabel, title: sec.title, desc: sec.blocks.find(b=>b.t==='text')?.html?.replace(/<[^>]+>/g,'').slice(0,160) || 'See canonical content' });
      });
    });
    // labs per day
    if(DATA.nti.labs){
      Object.keys(DATA.nti.labs).forEach(labId=>{
        const lab = DATA.nti.labs[labId];
        if(!lab || !lab.tasks) return;
        lab.tasks.forEach(task=>{
          const hay = `${task.tag} ${task.title} ${task.objective} ${(task.steps||[]).join(' ')}`.toLowerCase();
          if(hay.includes(term)) results.push({ section: `Lab ${labId.replace('day','')}`, title: task.title, desc: task.objective });
        });
      });
    }
    // flashcards
    if(DATA.nti.flashcards){
      DATA.nti.flashcards.forEach(fc=>{
        const hay = `${fc.q} ${fc.a}`.toLowerCase();
        if(hay.includes(term)) results.push({ section: 'Flashcards NTI', title: fc.q.slice(0,60), desc: fc.a.slice(0,140) });
      });
    }
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
  return `<div class="cmd-row"><div class="cmd-grid"><div class="cmd-name">${highlightMatch(escapeHtml(r.title), t)}</div><div>${r.desc ? `<div class="cmd-desc">${highlightMatch(escapeHtml(r.desc), t)}</div>` : ''}${r.example ? `<div class="cmd-example"><code>${highlightMatch(highlightCode(escapeHtml(r.example)), t)}</code><button class="copy-btn" onclick="copyText('${escapeAttr(r.example)}', this)" aria-label="Copy code">${ICONS.copy}</button></div>` : ''}</div></div><span class="source-badge search-badge">${escapeHtml(r.section)}</span></div>`;
}

function escId(s) { return String(s).replace(/[^a-zA-Z0-9_-]/g, '_'); }

function toggleSearchGroup(sec) {
  const el = document.getElementById('sgex-' + sec);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

// ===== QUIZ & FLASHCARDS =====
function buildQuizDeck() {
  // Prefer NTI Day1+Day2 flashcards (single source of truth) if present; fallback to commandsBank
  const ntiCards = (DATA.nti && DATA.nti.flashcards) || DATA.flashcards;
  if (ntiCards && ntiCards.length) {
    // ntiCards are {q,a} from notes; map to flashcard shape
    return ntiCards.map(c => ({
      front: c.q || c.front,
      back: c.a || c.back,
      category: c.category || 'NTI'
    })).filter(c=> c.front && c.back);
  }
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
    ${breadcrumbs([{label:'Flashcards & Quizzes', tab:'quiz'}])}
    <h1 class="view-title">Quiz &amp; Flashcards — Day 1 & Day 2</h1>
    <p class="view-subtitle">Day 1 & Day 2 flashcards (NTI source) — flip to memorize, then take the multiple-choice quiz. Covers 98 Q&A from Rahma, Michael, Hager, Sagda & Tarek notes.</p>
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
      <button class="flashcard" onclick="this.classList.toggle('flipped')" title="Click to flip" aria-label="Flashcard ${escapeHtml(card.front)}: press to reveal" aria-pressed="false" onkeydown="if(event.key==='Enter'||event.key===' ') {event.preventDefault(); this.classList.toggle('flipped'); this.setAttribute('aria-pressed', this.classList.contains('flipped'))}" onClick="this.setAttribute('aria-pressed', this.classList.contains('flipped') ? 'true':'false')">
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
      </button>`;
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
let quizOpen = [];

function makeQuizQ(front, back, deck) {
  const others = deck.filter(d => d.back !== back).sort(() => Math.random() - 0.5).slice(0, 3).map(d => d.back);
  const options = [back, ...others].sort(() => Math.random() - 0.5);
  return { command: front, answer: back, options };
}

function startQuiz(questionsOverride) {
  const deck = buildQuizDeck();
  let questions;
  if (questionsOverride && questionsOverride.length) {
    questions = questionsOverride.map(q => makeQuizQ(q.front, q.back, deck));
  } else {
    const pool = deck.slice().sort(() => Math.random() - 0.5);
    const qCount = Math.min(10, deck.length);
    questions = [];
    for (let i = 0; i < qCount; i++) questions.push(makeQuizQ(pool[i].front, pool[i].back, deck));
  }
  quizState = { questions, score: 0, wrong: [], answered: {} };
  quizOpen = questions.map(() => true);
  renderQuizQuestions();
}

function toggleQuizAcc(i) {
  if (!quizState) return;
  quizOpen[i] = !quizOpen[i];
  renderQuizQuestions();
}

function answerQuiz(i, chosen, btn) {
  if (!quizState || quizState.answered[i]) return;
  const q = quizState.questions[i];
  const correct = chosen === q.answer;
  quizState.answered[i] = { chosen, correct };
  if (correct) quizState.score += 1;
  else quizState.wrong.push({ front: q.command, back: q.answer });
  const best = Math.max(state.quizScores.best || 0, quizState.score);
  state.quizScores.best = best;
  saveState();
  renderQuizQuestions();
}

function quizAccItem(q, i) {
  const open = quizOpen[i];
  const a = quizState.answered[i];
  let body = '';
  if (open) {
    if (!a) {
      body = `<div class="quiz-options">${q.options.map(opt => `<button class="quiz-option" onclick="answerQuiz(${i}, '${escapeAttr(opt)}', this)">${escapeHtml(opt)}</button>`).join('')}</div>`;
    } else {
      body = `<div class="quiz-feedback-inline">
        <span class="quiz-answered ${a.correct ? 'correct' : 'wrong'}">${a.correct ? ICONS.check + ' Correct' : ICONS.alert + ' Incorrect'}</span>
        ${!a.correct ? `<span class="quiz-correct-answer">Answer: ${escapeHtml(q.answer)}</span>` : ''}
      </div>`;
    }
  }
  const status = a ? (a.correct ? '✓' : '✗') : (open ? '' : ICONS.chevron);
  return `
    <div class="quiz-acc-item ${open ? 'open' : ''} ${a ? (a.correct ? 'done-correct' : 'done-wrong') : ''}">
      <div class="quiz-acc-header" onclick="toggleQuizAcc(${i})">
        <span class="quiz-acc-q">Q${i + 1}. What does <code>${escapeHtml(q.command)}</code> do?</span>
        <span class="quiz-acc-status">${status}</span>
      </div>
      <div class="quiz-acc-body">${body}</div>
    </div>`;
}

let _lastMissed = [];
function renderQuizQuestions() {
  const box = document.getElementById('quizBox');
  if (!quizState) return;
  const total = quizState.questions.length;
  const complete = (quizState.score + quizState.wrong.length) >= total;
  const missed = quizState.wrong;
  _lastMissed = missed.slice();
  box.innerHTML = `
    <div class="quiz-progress">Score: <strong>${quizState.score}</strong> / ${total}${state.quizScores.best ? ` &middot; Best: ${state.quizScores.best}` : ''}</div>
    <div class="quiz-accordion">
      ${quizState.questions.map((q, i) => quizAccItem(q, i)).join('')}
    </div>
    ${complete ? `
      <div class="no-results">
        <h3>Quiz complete!</h3>
        <p>You scored <strong>${quizState.score} / ${total}</strong>.</p>
        ${missed.length ? `<button class="toggle-complete" onclick="startQuiz(_lastMissed)">${ICONS.check} Retry ${missed.length} missed</button>` : ''}
        <button class="toggle-complete" onclick="startQuiz()">${ICONS.check} Try Again</button>
      </div>` : ''}
  `;
}

function flipCard(i, el) {
  el.classList.toggle('flipped');
}

// ===== HELPERS =====
function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function escapeAttr(s) {
  if (s == null) return '';
  return String(s).replace(/\\/g, '\\\\')
           .replace(/'/g, "\\'")
           .replace(/\r/g, '')
           .replace(/\n/g, '\\n');
}
function escapeAttrHtml(s) { return escapeHtml(s); }
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
  const onSuccess = () => {
    btn.classList.add('copied');
    const original = btn.getAttribute('aria-label') || 'Copy';
    btn.setAttribute('aria-label', 'Copied!');
    showToast('Copied to clipboard');
    setTimeout(() => { btn.classList.remove('copied'); btn.setAttribute('aria-label', original); }, 1500);
  };
  const fallback = (t) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = t;
      ta.setAttribute('readonly','');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      onSuccess();
    } catch(_e) { showToast('Copy failed'); }
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(onSuccess).catch(() => fallback(text));
  } else fallback(text);
}
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.setAttribute('role','status');
    t.setAttribute('aria-live','polite');
    Object.assign(t.style, {position:'fixed',bottom:'24px',left:'50%',transform:'translateX(-50%) translateY(20px)',background:'var(--bg-elevated)',color:'var(--text)',border:'1px solid var(--border)',padding:'10px 16px',borderRadius:'999px',fontSize:'13px',zIndex:'9999',opacity:'0',transition:'opacity 180ms, transform 180ms',pointerEvents:'none',boxShadow:'var(--shadow)'});
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(t._hide);
  t._hide = setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(10px)'; }, 1800);
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

// ===== MERGED CHEAT SHEET + COMMAND BANK =====
function deriveFlags(example, notes, brief) {
  const text = ((example || '') + ' ' + (notes || '') + ' ' + (brief || ''));
  const flags = [];
  const re = /(?:^|\s)(-{1,2}[A-Za-z][\w-]*)/g;
  let m;
  while ((m = re.exec(text))) { if (!flags.includes(m[1])) flags.push(m[1]); }
  return flags.slice(0, 6);
}

function buildCommandIndex() {
  const map = {};
  const add = (cmd) => {
    const key = cmd.command.trim();
    if (!map[key]) map[key] = { command: key, category: cmd.category, briefDescription: cmd.briefDescription, example: cmd.example || cmd.command, notes: cmd.notes || '', keywords: cmd.keywords || [], flags: [] };
    const m = map[key];
    if (cmd.notes && (!m.notes || m.notes.length < cmd.notes.length)) m.notes = cmd.notes;
    if (cmd.keywords && cmd.keywords.length) m.keywords = m.keywords.concat(cmd.keywords);
  };
  (DATA.categories || []).forEach(cat => cat.commands.forEach(c => add({ command: c.command, category: cat.title, briefDescription: c.description, example: c.example, notes: c.notes || '' })));
  (DATA.commandsBank || []).forEach(c => add({ command: c.command, category: c.category, briefDescription: c.briefDescription, example: c.command, notes: c.notes || '', keywords: c.keywords }));
  Object.values(map).forEach(c => { c.flags = deriveFlags(c.example, c.notes, c.briefDescription); });
  return Object.values(map);
}

function getCmds() {
  const term = state.cmdTerm.toLowerCase().trim();
  let cmds = buildCommandIndex();
  if (state.cmdCats.length) cmds = cmds.filter(c => state.cmdCats.includes(c.category));
  if (term) cmds = cmds.filter(c => `${c.command} ${c.category} ${c.briefDescription} ${c.notes} ${c.keywords.join(' ')}`.toLowerCase().includes(term));
  return cmds;
}

function cmdCard(c) {
  const catClass = 'cat-' + (c.category || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `
    <div class="cmd-card ${catClass}">
      <div class="cmd-card-name">${escapeHtml(c.command)}</div>
      <div class="cmd-card-desc">${escapeHtml(c.briefDescription)}</div>
      ${c.example ? `<div class="cmd-card-example"><code>${highlightCode(escapeHtml(c.example))}</code><button class="copy-btn" onclick="copyText('${escapeAttr(c.example)}', this)" title="Copy ${escapeAttr(c.command)}" aria-label="Copy ${escapeAttr(c.command)}">${ICONS.copy}</button></div>` : ''}
      ${c.flags.length ? `<div class="cmd-card-flags">${c.flags.map(f => `<span class="flag-chip">${escapeHtml(f)}</span>`).join('')}</div>` : ''}
      ${c.notes ? `<div class="cmd-card-note">${ICONS.alert}<span>${escapeHtml(c.notes)}</span></div>` : ''}
    </div>`;
}

function renderMergedCheatSheet() {
  const all = buildCommandIndex();
  const cats = Array.from(new Set(all.map(c => c.category)));
  const cmds = getCmds();
  const term = state.cmdTerm.trim();
  const grid = cmds.length
    ? `<div id="cmdResults" class="cmd-grid">${cmds.map(cmdCard).join('')}</div>`
    : `<div class="no-results">${ICONS.search}<h3>No commands match</h3><p>Try clearing the filters or search term.</p></div>`;
  return `
    ${breadcrumbs([{label:'General Knowledge', tab:'general'}, {label:'Cheat Sheet'}])}
    <h1 class="view-title">Linux Cheat Sheet &amp; Command Bank</h1>
    <p class="view-subtitle">${all.length} commands across ${cats.length} categories — cheat sheet + bank merged. <span style="color:var(--text-dim)">Press <kbd style="font-family:var(--font-mono);font-size:11px;border:1px solid var(--border);padding:1px 5px;border-radius:3px;background:var(--bg-tertiary)">/</kbd> to filter • Global search finds notes & exercises</span></p>
    <div class="cmd-filterbar">
      <div class="cmd-search-box">
        <span class="cmd-search-icon">${ICONS.search}</span>
        <input id="cmdSearch" class="cmd-search-input" type="text" placeholder="Filter commands (name, flag, description)…" value="${escapeAttr(state.cmdTerm)}" aria-label="Filter commands by name or description">
      </div>
      <div class="cmd-chips" role="toolbar" aria-label="Filter by category">
        ${cats.map(cat => `<button class="chip ${state.cmdCats.includes(cat) ? 'active' : ''}" data-cat="${escapeAttr(cat)}" onclick="toggleCmdCat('${escapeAttr(cat)}')" aria-pressed="${state.cmdCats.includes(cat) ? 'true' : 'false'}">${escapeHtml(cat)}</button>`).join('')}
      </div>
    </div>
    <div class="cmd-results-meta" role="status" aria-live="polite">${cmds.length} command${cmds.length !== 1 ? 's' : ''} shown${term ? ` for “${escapeHtml(term)}”` : ''}${state.cmdCats.length ? ` · ${state.cmdCats.length} filter${state.cmdCats.length!==1?'s':''}` : ''}</div>
    ${grid}
  `;
}

function updateCmdMeta() {
  const meta = document.querySelector('.cmd-results-meta');
  if (!meta) return;
  const cmds = getCmds();
  const term = state.cmdTerm.trim();
  meta.textContent = `${cmds.length} command${cmds.length !== 1 ? 's' : ''} shown${term ? ` for “${term}”` : ''}${state.cmdCats.length ? ` · ${state.cmdCats.length} filter${state.cmdCats.length!==1?'s':''}` : ''}`;
}
function renderCmdResults() {
  const wrap = document.getElementById('cmdResults');
  if (!wrap) return;
  const cmds = getCmds();
  const newHtml = cmds.length
    ? `<div id="cmdResults" class="cmd-grid">${cmds.map(cmdCard).join('')}</div>`
    : `<div id="cmdResults"><div class="no-results">${ICONS.search}<h3>No commands match</h3><p>Try clearing the filters or search term.</p><button class="toggle-complete" onclick="clearCmdFilters()">Clear filters</button></div></div>`;
  wrap.outerHTML = newHtml;
  updateCmdMeta();
}
function clearCmdFilters() {
  state.cmdTerm = '';
  state.cmdCats = [];
  saveState();
  const inp = document.getElementById('cmdSearch');
  if (inp) inp.value = '';
  document.querySelectorAll('.chip[data-cat]').forEach(b => b.classList.remove('active'));
  renderCmdResults();
}
function toggleCmdCat(cat) {
  const i = state.cmdCats.indexOf(cat);
  if (i >= 0) state.cmdCats.splice(i, 1); else state.cmdCats.push(cat);
  saveState();
  document.querySelectorAll('.chip[data-cat]').forEach(b => {
    const active = state.cmdCats.includes(b.dataset.cat);
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  renderCmdResults();
}

function setupCmdSearch() {
  const input = document.getElementById('cmdSearch');
  if (!input) return;
  input.value = state.cmdTerm;
  input.setAttribute('aria-label','Filter commands');
  input.addEventListener('input', (e) => {
    state.cmdTerm = e.target.value;
    saveState();
    renderCmdResults();
  });
  // clear on Escape inside this field is handled globally
}

// ===== NTI LINUX COURSE =====
function renderNTIRoadmap() {
  const days = DATA.course.days || [];
  const readySet = new Set(['day1','day2']);
  let html = `
    ${breadcrumbs([{label:'NTI Linux Course', tab:'course'}, {label:'Roadmap'}])}
    <h1 class="view-title">NTI Linux Course — Roadmap</h1>
    <p class="view-subtitle">${days.length}-day Red Hat (RH124-style) outline — Day 1 & Day 2 live, Day 3 coming soon — plus the 7-module practical track.</p>
    <h2 class="day-part-title">${days.length}-Day Course Outline</h2>
    <div class="roadmap-grid">
  `;
  days.forEach(d => {
    const label = d.id.replace('day', 'Day ');
    const isReady = readySet.has(d.id);
    html += `
      <div class="roadmap-card ${isReady ? '' : 'roadmap-card--soon'}">
        <div class="roadmap-day">${escapeHtml(label)}</div>
        <div class="roadmap-title">${escapeHtml(d.title)}</div>
        <ul class="roadmap-list">${d.topics.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
        <button class="roadmap-go" onclick="setView('course','${d.id}-content')">Open ${escapeHtml(label)} →</button>
      </div>`;
  });
  html += `</div>`;
  html += `
    <h2 class="day-part-title">7-Module Practical Track</h2>
    ${renderCourse()}
  `;
  return html;
}

function renderDayPlaceholder(view) {
  const dayNum = view.replace('day', '');
  const day = (DATA.course.days || []).find(d => d.id === view.replace('-content','').replace('-lab',''));
  const topics = day ? day.topics : [];
  return `
    ${breadcrumbs([{label:'NTI Linux Course', tab:'course'}, {label:'Roadmap', tab:'course', view:'roadmap'}, {label:'Day ' + dayNum}])}
    <h1 class="view-title">NTI Linux Course — Day ${dayNum}</h1>
    ${day ? `<p class="view-subtitle">${escapeHtml(day.title)}</p>` : ''}
    <div class="no-results">
      ${ICONS.file}
      <h3>Day ${dayNum} content coming soon</h3>
      <p>Day 1 is fully populated. Day ${dayNum} will cover:</p>
      ${topics.length ? `<ul class="topic-list" style="text-align:left;max-width:480px;margin:12px auto">${topics.map(t=>`<li>${escapeHtml(t)}</li>`).join('')}</ul>` : ''}
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px">
        <button class="toggle-complete" onclick="setView('course','day1-content')">${ICONS.chevron} Go to Day 1</button>
        <button class="chip" onclick="setView('course','roadmap')">Back to Roadmap</button>
      </div>
      <p style="font-size:12px;color:var(--text-dim);margin-top:14px">Want this sooner? Check the 7-module Practical Track in General Knowledge.</p>
    </div>`;
}

function renderDay1Content() {
  return `
    ${breadcrumbs([{label:'NTI Linux Course', tab:'course'}, {label:'Roadmap', tab:'course', view:'roadmap'}, {label:'Day 1'}])}
    <h1 class="view-title">NTI Linux Course — Day 1</h1>
    <p class="view-subtitle">RH124 summary and the soft vs hard links guide.</p>
    <div class="day-part">
      <h2 class="day-part-title">RH124 — Day 1 Summary</h2>
      ${renderRH124Body()}
    </div>
    <div class="day-part">
      <h2 class="day-part-title">Soft vs Hard Links</h2>
      ${renderLinksBody()}
    </div>
  `;
}

function renderCourseDayContent(dayId) {
  const day = (DATA.course.days || []).find(d => d.id === dayId);
  if (!day) return renderDayPlaceholder(dayId);
  const num = dayId.replace('day', '');
  let html = breadcrumbs([{label:'NTI Linux Course', tab:'course'}, {label:'Roadmap', tab:'course', view:'roadmap'}, {label:'Day ' + num}]);
  html += `<h1 class="view-title">NTI Linux Course — Day ${num}</h1>`;
  html += `<p class="view-subtitle">${escapeHtml(day.title)}</p>`;
  (day.content || []).forEach(sec => {
    html += `<div class="day-part"><h2 class="day-part-title">${escapeHtml(sec.title)}</h2>`;
    if (sec.points && sec.points.length) {
      html += '<ul class="topic-list">';
      sec.points.forEach(p => html += `<li>${escapeHtml(p)}</li>`);
      html += '</ul>';
    }
    if (sec.note) html += `<p class="section-note">${escapeHtml(sec.note)}</p>`;
    html += '</div>';
  });
  html += `<div class="day-nav-foot"><button class="toggle-complete" onclick="setView('course','${dayId}-lab')">${ICONS.chevron} Go to Lab Task</button></div>`;
  return html;
}

function renderCourseDayLab(dayId) {
  const day = (DATA.course.days || []).find(d => d.id === dayId);
  const num = dayId.replace('day', '');
  let html = breadcrumbs([{label:'NTI Linux Course', tab:'course'}, {label:'Day ' + num, tab:'course', view: dayId + '-content'}, {label:'Lab Task'}]);
  html += `<h1 class="view-title">Lab · Day ${num}</h1>`;
  html += `<p class="view-subtitle">${escapeHtml(day ? day.title : 'Practice tasks')}</p>`;
  html += `<div class="task-card"><div class="task-header"><span class="task-tag">Practice</span><span class="task-title">${escapeHtml('Hands-on tasks for ' + (day ? day.title : ('Day ' + num)))}</span></div>`;
  if (day && day.topics) {
    html += '<ul class="task-steps">';
    day.topics.forEach(t => html += `<li class="task-step">${escapeHtml(t)}</li>`);
    html += '</ul>';
  }
  html += `<p class="task-objective">Detailed step-by-step lab instructions will be added here.</p></div>`;
  html += `<div class="day-nav-foot"><button class="toggle-complete" onclick="setView('course','${dayId}-content')">${ICONS.chevron} Back to Content</button></div>`;
  return html;
}

// ===== HELPFUL LINKS (TAB 3) =====
function renderHelpfulLinks() {
  const links = DATA.helpfulLinks || [];
  let html = `
    ${breadcrumbs([{label:'Helpful Links'}])}
    <h1 class="view-title">Helpful Links</h1>
    <p class="view-subtitle">Curated resources to support the NTI Linux course.</p>
    ${!links.length ? `<div class="no-results">${ICONS.link}<h3>No links yet</h3><p>Add resources to DATA.helpfulLinks.</p></div>` : ''}
    <div class="link-card-grid">
  `;
  links.forEach(l => {
    html += `
      <a class="ext-link-card" href="${escapeAttr(l.url)}" target="_blank" rel="noopener noreferrer">
        <div class="ext-link-icon">${ICONS.link}</div>
        <div class="ext-link-body">
          <div class="ext-link-title">${escapeHtml(l.title)}</div>
          <div class="ext-link-desc">${escapeHtml(l.desc)}</div>
          <div class="ext-link-url">${escapeHtml(l.url)}</div>
        </div>
        <div class="ext-link-go">${ICONS.chevron}</div>
      </a>`;
  });
  html += `</div>`;
  return html;
}

// ===== RENDER DISPATCHER =====
function render() {
  const content = document.getElementById('content');
  let html;

  // Global search: any non-empty term searches across ALL sections.
  if (state.searchTerm.trim()) {
    html = renderSearchResults();
  } else if (state.tab === 'general') {
    if (state.view === 'cheatsheet') html = renderMergedCheatSheet();
    else if (state.view === 'topicindex') html = renderTopicIndex();
    else if (state.view === 'exercises') html = renderExercises();
    else if (state.view === 'roadmap7') html = renderCourse();
  } else if (state.tab === 'course') {
    const fn = COURSE_RENDER[state.view];
    html = fn ? fn() : renderNTIRoadmap();
  } else if (state.tab === 'links') {
    html = renderHelpfulLinks();
  } else if (state.tab === 'quiz') {
    html = renderQuiz();
  }

  content.innerHTML = html;
  content.classList.remove('fade-in');
  void content.offsetWidth;
  content.classList.add('fade-in');

  const appEl = document.querySelector('.app');
  if (appEl) appEl.classList.toggle('searching', !!state.searchTerm.trim());

  postRender();

  const sw = document.getElementById('searchWrapper');
  // The merged Cheat Sheet has its own search + filter cluster, so the
  // universal search bar is hidden there to avoid two stacked search bars.
  const onMergedCheatSheet = state.tab === 'general' && state.view === 'cheatsheet' && !state.searchTerm.trim();
  sw.style.display = onMergedCheatSheet ? 'none' : 'block';
}

function postRender() {
  setupCmdSearch();
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
(function initTabs(){
  const tabs = Array.from(document.querySelectorAll('.tab'));
  tabs.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    btn.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault();
      const idx = tabs.indexOf(btn);
      let nextIdx = idx;
      if (e.key === 'ArrowRight') nextIdx = (idx + 1) % tabs.length;
      if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') nextIdx = 0;
      if (e.key === 'End') nextIdx = tabs.length - 1;
      tabs[nextIdx].focus();
      switchTab(tabs[nextIdx].dataset.tab);
    });
  });
})();

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

// Mobile: tap the minimized search icon to expand it; collapse when empty and blurred.
(function setupMobileSearch() {
  const box = document.querySelector('.search-box');
  const input = document.getElementById('searchInput');
  const wrap = document.getElementById('searchWrapper');
  if (!box || !input || !wrap) return;
  box.addEventListener('click', (e) => {
    if (wrap.classList.contains('search-expanded')) return;
    if (e.target === input) return;
    wrap.classList.add('search-expanded');
    setTimeout(() => input.focus(), 60);
  });
  input.addEventListener('blur', () => {
    if (!input.value.trim()) wrap.classList.remove('search-expanded');
  });
})();

document.addEventListener('keydown', (e) => {
  if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
    if (document.activeElement.isContentEditable) return;
    e.preventDefault();
    const local = document.getElementById('cmdSearch');
    if (local && local.offsetParent !== null) local.focus();
    else document.getElementById('searchInput').focus();
  }
  if (e.key === 'Escape') {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('open')) {
      closeSidebar();
      document.getElementById('menuBtn')?.focus();
      return;
    }
    // close topic popover if open
    const pop = document.getElementById('topicPopover');
    if (pop && pop.dataset.open) { pop.innerHTML=''; pop.dataset.open=''; document.querySelectorAll('.topic-pill').forEach(p=>p.classList.remove('active')); return; }
    const gi = document.getElementById('searchInput');
    const ci = document.getElementById('cmdSearch');
    if (document.activeElement === gi) {
      gi.value = '';
      state.searchTerm = '';
      render();
      gi.blur();
    } else if (document.activeElement === ci) {
      ci.value = '';
      state.cmdTerm = '';
      ci.blur();
      renderCmdResults(); updateCmdMeta();
    } else if (state.searchTerm.trim()) {
      state.searchTerm = '';
      if (gi) gi.value='';
      render();
    }
  }
});

function openSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const btn = document.getElementById('menuBtn');
  if (!sidebar || !overlay) return;
  sidebar.classList.add('open');
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden','false');
  if (btn) btn.setAttribute('aria-expanded','true');
  document.body.style.overflow = 'hidden';
  // focus first item in sidebar
  const first = sidebar.querySelector('button, a, [tabindex]:not([tabindex="-1"])');
  if (first) setTimeout(()=>first.focus(), 50);
}
function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const btn = document.getElementById('menuBtn');
  if (!sidebar || !overlay) return;
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden','true');
  if (btn) btn.setAttribute('aria-expanded','false');
  document.body.style.overflow = '';
}
document.getElementById('menuBtn').addEventListener('click', openSidebar);
document.getElementById('overlay').addEventListener('click', closeSidebar);

// ===== INIT =====
(function init() {
  document.documentElement.dataset.theme = state.theme;
  document.getElementById('themeIcon').outerHTML = state.theme === 'dark'
    ? '<svg id="themeIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>'
    : '<svg id="themeIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  document.querySelectorAll('.tab').forEach(t => {
    const isActive = t.dataset.tab === state.tab;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    t.tabIndex = isActive ? 0 : -1;
  });
  renderSubNav();
  render();
  // close popover on outside click
  document.addEventListener('click', (e) => {
    const pop = document.getElementById('topicPopover');
    if (!pop || !pop.dataset.open) return;
    if (e.target.closest('.topic-pill') || e.target.closest('#topicPopover')) return;
    pop.innerHTML=''; pop.dataset.open=''; document.querySelectorAll('.topic-pill').forEach(p=>p.classList.remove('active'));
  });
  // dynamic topbar height for sticky offsets (most reasonable: measure actual rendered height)
  function updateTopbarHeight(){
    const tb = document.querySelector('.topbar');
    if(!tb) return;
    const h = Math.ceil(tb.getBoundingClientRect().height);
    if(h>0) document.documentElement.style.setProperty('--topbar-h', h + 'px');
  }
  updateTopbarHeight();
  window.addEventListener('resize', updateTopbarHeight);
  // also observe topbar size changes (tabs wrap)
  if(window.ResizeObserver){
    const tb = document.querySelector('.topbar');
    if(tb) new ResizeObserver(updateTopbarHeight).observe(tb);
  }
  // recalc after tab switch
  const _oldSetView = setView;
  setView = function(tab, view){
    const res = _oldSetView.apply(this, arguments);
    setTimeout(updateTopbarHeight, 60);
    return res;
  };
  // resize: auto-close sidebar on desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) closeSidebar();
    updateTopbarHeight();
  });
})();
