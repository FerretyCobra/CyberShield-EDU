// Session Guard & Theme Init
(function() {
    // Theme Loading
    const mode = localStorage.getItem('themeMode') || 'dark';
    const accent = localStorage.getItem('themeAccent') || 'classic';
    document.body.classList.add(`mode-${mode}`);
    document.body.classList.add(`accent-${accent}`);

    const publicPages = ['login.html', 'signup.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (!window.api.auth.isLoggedIn() && !publicPages.includes(currentPage)) {
        window.location.href = 'login.html';
    }
})();

function setThemeMode(mode) {
    document.body.classList.remove('mode-light', 'mode-dark');
    document.body.classList.add(`mode-${mode}`);
    localStorage.setItem('themeMode', mode);
}

function setThemeAccent(accent) {
    document.body.classList.remove('accent-classic', 'accent-emerald', 'accent-crimson');
    document.body.classList.add(`accent-${accent}`);
    localStorage.setItem('themeAccent', accent);
}

// User Profile & Sidebar Logic
async function initSidebar() {
    const footer = document.querySelector('.sidebar-footer');
    
        const currentMode = localStorage.getItem('themeMode') || 'dark';
        const currentAccent = localStorage.getItem('themeAccent') || 'classic';

        footer.innerHTML = `
            <div class="user-profile-gamified">
                <!-- Theme Settings -->
                <div class="theme-settings">
                    <div class="theme-mode-toggle">
                        <span class="settings-label">Appearance</span>
                        <div class="mode-buttons">
                            <button class="mode-btn ${currentMode === 'light' ? 'active' : ''}" onclick="setThemeMode('light'); this.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active')); this.classList.add('active');" title="Light Mode">☀️</button>
                            <button class="mode-btn ${currentMode === 'dark' ? 'active' : ''}" onclick="setThemeMode('dark'); this.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active')); this.classList.add('active');" title="Dark Mode">🌙</button>
                        </div>
                    </div>
                    <div class="theme-accent-picker">
                        <span class="settings-label">Accent Color</span>
                        <div class="accent-dots">
                            <button class="accent-dot dot-classic ${currentAccent === 'classic' ? 'active' : ''}" onclick="setThemeAccent('classic'); this.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active')); this.classList.add('active');" title="Classic Indigo"></button>
                            <button class="accent-dot dot-emerald ${currentAccent === 'emerald' ? 'active' : ''}" onclick="setThemeAccent('emerald'); this.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active')); this.classList.add('active');" title="Emerald Green"></button>
                            <button class="accent-dot dot-crimson ${currentAccent === 'crimson' ? 'active' : ''}" onclick="setThemeAccent('crimson'); this.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active')); this.classList.add('active');" title="Crimson Rose"></button>
                        </div>
                    </div>
                </div>

                <div class="user-main">
                    <div class="avatar-glow">${initials}</div>
                    <div class="user-details">
                        <span class="username">${user.username}</span>
                        <div class="level-badge">LVL ${user.level}</div>
                    </div>
                </div>
                <div class="xp-container">
                    <div class="xp-header">
                        <span>Progression</span>
                        <span>${xpProgress}/100 XP</span>
                    </div>
                    <div class="xp-bar-bg">
                        <div class="xp-bar-fill" style="width: ${xpProgress}%"></div>
                    </div>
                </div>
                <button id="btn-logout" class="btn-logout-minimal">
                    <svg style="width: 1.25rem; height: 1.25rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    Logout
                </button>
            </div>
        `;
        
        document.getElementById('btn-logout').addEventListener('click', () => {
            window.api.auth.logout();
        });
    } catch (err) {
        console.error("Sidebar init failed:", err);
        // Fallback to local storage if API fails
        const user = window.api.auth.getCurrentUser();
        if (user && footer) {
            footer.innerHTML = `<button id="btn-logout" class="btn-logout">Logout ${user.username}</button>`;
            document.getElementById('btn-logout').addEventListener('click', () => window.api.auth.logout());
        }
    }
}


// --- Text Scan Logic ---
const textScanBtn = document.getElementById('btn-text-scan');
const textScanInput = document.getElementById('textScanInput');
const textResultContainer = document.getElementById('text-result-container');

function setLoadingState(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');

    if (isLoading) {
        button.disabled = true;
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
    } else {
        button.disabled = false;
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    }
}

function renderScanResult(result, containerElement) {
    const isScam = result.prediction === 'scam';
    const bgColorClass = isScam ? 'bg-rose-950/30' : 'bg-emerald-950/30';
    const borderColorClass = isScam ? 'border-rose-500/30' : 'border-emerald-500/30';
    const titleColorClass = isScam ? 'text-rose-400' : 'text-emerald-400';
    const titleText = isScam ? 'High Risk: Scam Detected' : 'Low Risk: Message Safe';
    const iconColorClass = isScam ? 'text-rose-400' : 'text-emerald-400';
    const progressGradient = isScam ? 'linear-gradient(90deg, #e11d48, #fb7185)' : 'linear-gradient(90deg, #059669, #34d399)';
    const confidencePercent = (result.confidence * 100).toFixed(1);

    // Build the reasoning HTML string
    let reasoningHtml = '';
    if (result.reasoning && result.reasoning.length > 0) {
        const listItems = result.reasoning.map(r => `
            <div style="display: flex; gap: 0.75rem; padding: 0.75rem; background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(51, 65, 85, 0.5); border-radius: 0.5rem;">
                <div style="width: 6px; height: 6px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; background-color: ${isScam ? '#f43f5e' : '#10b981'};"></div>
                <span style="color: #cbd5e1; font-size: 0.9375rem; text-transform: none;">${r}</span>
            </div>
        `).join('');

        reasoningHtml = `
            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(51, 65, 85, 0.5);">
                <h4 style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.1em; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    AI Reasoning Feed
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 0.75rem;">
                    ${listItems}
                </div>
            </div>
        `;
    }

    // --- Advanced Features (Quishing, Platform, Links) ---
    let advancedHtml = '';

    // 1. Platform Detection Badge (Image Scanner)
    if (result.platform && result.platform !== "Unknown") {
        advancedHtml += `
            <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 2rem; margin-top: 1rem; margin-right: 0.5rem;">
                <svg style="width: 1.25rem; height: 1.25rem; color: #60a5fa;" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
                <span style="color: #93c5fd; font-size: 0.875rem; font-weight: 600;">Platform: ${result.platform}</span>
            </div>
        `;
    }

    // 2. Encrypted PDF Warning
    if (result.metadata && result.metadata.is_encrypted) {
        advancedHtml += `
            <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 2rem; margin-top: 1rem; margin-right: 0.5rem;">
                <svg style="width: 1.25rem; height: 1.25rem; color: #fbbf24;" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <span style="color: #fcd34d; font-size: 0.875rem; font-weight: 600;">Encrypted PDF</span>
            </div>
        `;
    }

    // 3. QR Code Detection (Quishing)
    if (result.findings && result.findings.qr_code) {
        advancedHtml += `
            <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 0.5rem;">
                <h4 style="font-size: 0.875rem; font-weight: 600; color: #c4b5fd; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <svg style="width: 1.25rem; height: 1.25rem;" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 19.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                    </svg>
                    QR Code Extracted (Quishing Warning)
                </h4>
                <p style="color: #e2e8f0; font-family: monospace; font-size: 0.875rem; word-break: break-all;">${result.findings.qr_code}</p>
            </div>
        `;
    }

    // 4. Embedded Links (from PDF or Image)
    const links = result.url_analysis || (result.findings ? result.findings.urls : []) || [];
    if (links.length > 0) {
        const linkItems = links.map(link => {
            const isMalicious = link.prediction === 'scam';
            return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; background: rgba(15, 23, 42, 0.4); border-radius: 0.375rem; margin-top: 0.5rem;">
                    <span style="color: #cbd5e1; font-family: monospace; font-size: 0.8125rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;">${link.url}</span>
                    <span style="font-size: 0.75rem; font-weight: 700; padding: 0.125rem 0.5rem; border-radius: 1rem; ${isMalicious ? 'background: rgba(225, 29, 72, 0.2); color: #fb7185;' : 'background: rgba(5, 150, 105, 0.2); color: #34d399;'}">
                        ${isMalicious ? 'MALICIOUS' : 'SAFE'}
                    </span>
                </div>
            `;
        }).join('');

        advancedHtml += `
            <div style="margin-top: 1.5rem; padding: 1rem; border: 1px solid rgba(51, 65, 85, 0.5); border-radius: 0.5rem; background: rgba(30, 41, 59, 0.2);">
                <h4 style="font-size: 0.875rem; font-weight: 600; color: #94a3b8; display: flex; align-items: center; gap: 0.5rem;">
                    <svg style="width: 1.25rem; height: 1.25rem;" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                    Embedded Links Found (${links.length})
                </h4>
                ${linkItems}
            </div>
        `;
    }

    const html = `
        <div class="glass-card" style="margin-top: 2.5rem; padding: 1.75rem; border: 1px solid rgba(${isScam ? '244,63,94' : '16,185,129'}, 0.3); background: rgba(${isScam ? '225,29,72' : '5,150,105'}, 0.05); position: relative; overflow: hidden;">
            
            <!-- Decorative Glow Background -->
            <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; border-radius: 50%; filter: blur(60px); opacity: 0.2; pointer-events: none; background-color: ${isScam ? '#f43f5e' : '#10b981'};"></div>

            <div style="display: flex; align-items: flex-start; gap: 1.25rem; position: relative; z-index: 10;">
                
                <!-- Status Icon -->
                <div style="padding: 0.75rem; border-radius: 1rem; flex-shrink: 0; background: rgba(${isScam ? '244,63,94' : '16,185,129'}, 0.1); border: 1px solid rgba(${isScam ? '244,63,94' : '16,185,129'}, 0.2);">
                    ${isScam ? `
                        <svg style="width: 2rem; height: 2rem; color: #fb7185;" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" />
                        </svg>
                    ` : `
                        <svg style="width: 2rem; height: 2rem; color: #34d399;" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    `}
                </div>

                <!-- Main Result Detail -->
                <div style="width: 100%;">
                    <h3 style="font-size: 1.5rem; font-weight: 700; color: ${isScam ? '#fb7185' : '#34d399'}; letter-spacing: -0.02em; text-transform: none;">
                        ${titleText}
                    </h3>

                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-top: 0.75rem;">
                        <div style="width: 15rem; height: 0.5rem; background: #1e293b; border-radius: 1rem; overflow: hidden; border: 1px solid rgba(51, 65, 85, 0.5);">
                            <div style="height: 100%; width: ${confidencePercent}%; background: ${progressGradient}; border-radius: 1rem; transition: width 1s ease-out;"></div>
                        </div>
                        <span style="font-size: 0.875rem; font-weight: 600; color: #cbd5e1;">${confidencePercent}% Confidence</span>
                    </div>
                    
                    <!-- Inject Advanced Badges Here -->
                    ${advancedHtml}
                </div>
            </div>

            ${reasoningHtml}
            
        </div>
    `;

    containerElement.innerHTML = html;
    containerElement.classList.remove('hidden');
    containerElement.style.animation = 'fadeIn 0.5s ease-out forwards';
}

if (textScanBtn && textScanInput && textResultContainer) {
    textScanBtn.addEventListener('click', async () => {
        const text = textScanInput.value.trim();
        if (!text) return;

        // Hide previous results
        textResultContainer.classList.add('hidden');
        textResultContainer.innerHTML = '';

        setLoadingState(textScanBtn, true);

        try {
            // Note: window.api is defined in api.js
            const resultWrapper = await window.api.detection.analyzeText(text);

            renderScanResult(resultWrapper, textResultContainer);
            setLoadingState(textScanBtn, false);

        } catch (error) {
            console.error("Scan Error:", error);
            alert("Analysis failed. Ensure the FastAPI backend is running.");
            setLoadingState(textScanBtn, false);
        }
    });

    // Initializing state
    textScanInput.addEventListener('input', () => {
        textScanBtn.disabled = textScanInput.value.trim() === '';
    });
    textScanBtn.disabled = true; // Disabled initially
}

// --- URL Scan Logic ---
const urlScanBtn = document.getElementById('btn-url-scan');
const urlScanInput = document.getElementById('urlScanInput');
const urlResultContainer = document.getElementById('url-result-container');

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

if (urlScanBtn && urlScanInput && urlResultContainer) {
    urlScanBtn.addEventListener('click', async () => {
        const url = urlScanInput.value.trim();
        if (!url || !isValidUrl(url)) {
            alert("Please enter a valid URL (e.g., https://example.com)");
            return;
        }

        // Hide previous results
        urlResultContainer.classList.add('hidden');
        urlResultContainer.innerHTML = '';

        setLoadingState(urlScanBtn, true);

        try {
            const resultWrapper = await window.api.detection.analyzeUrl(url);

            renderScanResult(resultWrapper, urlResultContainer);
            setLoadingState(urlScanBtn, false);

        } catch (error) {
            console.error("URL Scan Error:", error);
            alert("Analysis failed. Ensure the FastAPI backend is running.");
            setLoadingState(urlScanBtn, false);
        }
    });

}

// --- Shared File Upload Logic ---
function setupFileUploader({ dropZoneId, fileInputId, btnId, nameDisplayId, resultContainerId, apiCall, allowedTypes }) {
    const dropZone = document.getElementById(dropZoneId);
    const fileInput = document.getElementById(fileInputId);
    const scanBtn = document.getElementById(btnId);
    const nameDisplay = document.getElementById(nameDisplayId);
    const resultContainer = document.getElementById(resultContainerId);

    if (!dropZone || !fileInput || !scanBtn || !nameDisplay || !resultContainer) return;

    let selectedFile = null;

    function handleFile(file) {
        if (!file) return;

        // Basic type validation
        if (allowedTypes && !allowedTypes.includes(file.type) && !allowedTypes.some(t => file.type.startsWith(t.replace('*', '')))) {
            alert(`Invalid file type. Please upload: ${allowedTypes.join(', ')}`);
            return;
        }

        // Size validation (Max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert("File is too large. Maximum size is 10MB.");
            return;
        }

        selectedFile = file;
        nameDisplay.querySelector('span').textContent = file.name;
        nameDisplay.style.display = 'block';
        scanBtn.disabled = false;
        dropZone.style.borderColor = 'rgba(16, 185, 129, 0.5)'; // Greenish border on success
    }

    // Click to upload
    fileInput.addEventListener('change', (e) => {
        handleFile(e.target.files[0]);
    });

    // Drag and Drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            fileInput.files = files; // Sync input
            handleFile(files[0]);
        }
    });

    // Scan Button Logic
    scanBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        // Hide previous results
        resultContainer.classList.add('hidden');
        resultContainer.innerHTML = '';

        setLoadingState(scanBtn, true);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await apiCall(formData);

            if (response.task_id) {
                // Asynchronous flow
                nameDisplay.querySelector('span').textContent = "Processing on server...";
                const resultWrapper = await window.api.tasks.pollUntilFinished(response.task_id);
                renderScanResult(resultWrapper, resultContainer);
            } else {
                // Synchronous flow (Text/URL)
                renderScanResult(response, resultContainer);
            }
            
            setLoadingState(scanBtn, false);
            nameDisplay.querySelector('span').textContent = selectedFile.name;

        } catch (error) {
            console.error("File Scan Error:", error);
            alert(error.message || "Analysis failed. Ensure the server is running.");
            setLoadingState(scanBtn, false);
        }
    });

    // Initial state
    scanBtn.disabled = true;
}

// Initialize PDF Scanner
setupFileUploader({
    dropZoneId: 'pdfDropZone',
    fileInputId: 'pdfFileInput',
    btnId: 'btn-pdf-scan',
    nameDisplayId: 'pdfFileNameDisplay',
    resultContainerId: 'pdf-result-container',
    apiCall: window.api.detection.analyzePdf,
    allowedTypes: ['application/pdf']
});

// Initialize Image Scanner
setupFileUploader({
    dropZoneId: 'imageDropZone',
    fileInputId: 'imageFileInput',
    btnId: 'btn-image-scan',
    nameDisplayId: 'imageFileNameDisplay',
    resultContainerId: 'image-result-container',
    apiCall: window.api.detection.analyzeImage,
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/*']
});

// --- Education Center Logic ---
async function initEducationCenter() {
    const grid = document.getElementById('educationGrid');
    if (!grid) return; // Only run on education.html

    try {
        const data = await window.api.awareness.getContent();
        if (!data || data.length === 0) {
            grid.innerHTML = '<p class="text-white" style="grid-column: 1/-1; text-align: center;">No educational content available.</p>';
            return;
        }

        const cardsHtml = data.map(item => {
            const isAdvanced = item.difficulty === 'Advanced';
            const badgeColor = isAdvanced ? 'color: #fb7185; background: rgba(225, 29, 72, 0.2);' : 'color: #34d399; background: rgba(5, 150, 105, 0.2);';

            const examplesHtml = item.examples ? `
                <div class="edu-examples">
                    <h5>Real World Examples</h5>
                    <ul>
                        ${item.examples.map(ex => `<li>${ex}</li>`).join('')}
                    </ul>
                </div>
            ` : '';

            return `
                <div class="edu-card">
                    <div class="edu-card-header">
                        <span class="category-badge">${item.category}</span>
                        <span class="difficulty-badge" style="${badgeColor}">${item.difficulty}</span>
                    </div>
                    <h3 class="edu-title">${item.title}</h3>
                    <p class="edu-desc">${item.description}</p>
                    ${examplesHtml}
                    <a href="${item.link}" target="_blank" class="read-more-btn mt-auto">
                        Read Deep Dive
                        <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </a>
                </div>
            `;
        }).join('');

        grid.innerHTML = cardsHtml;
        // Add staggered fade in animation
        const cards = grid.querySelectorAll('.edu-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1}s`;
        });

    } catch (error) {
        console.error('Error loading awareness content:', error);
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: #fb7185; padding: 2rem; background: rgba(225, 29, 72, 0.1); border-radius: 1rem; border: 1px solid rgba(225, 29, 72, 0.3);">
                Failed to load curriculum from the server. Ensure the backend is running.
            </div>
        `;
    }
}

// --- Admin Dashboard Logic ---
function initAdminDashboard() {
    const adminView = document.getElementById('admin-view');
    if (!adminView) return; // Only run on admin.html

    const passwordGate = document.getElementById('password-gate');
    const adminContent = document.getElementById('admin-content');
    const passwordInput = document.getElementById('adminPasswordInput');
    const loginBtn = document.getElementById('btn-admin-login');

    const totalScansEl = document.getElementById('stat-total-scans');
    const scamsDetectedEl = document.getElementById('stat-scams-detected');
    const activeModelsEl = document.getElementById('stat-active-models');

    const keywordGrid = document.getElementById('keywordGrid');
    const keywordCountEl = document.getElementById('keyword-count');
    const addKeywordForm = document.getElementById('addKeywordForm');
    const newKeywordInput = document.getElementById('newKeywordInput');

    // 1. Authentication Check
    const user = window.api.auth.getCurrentUser();
    if (user && user.role === 'admin') {
        passwordGate.style.display = 'none';
        adminContent.style.display = 'block';
        loadAdminData();
    }

    loginBtn.addEventListener('click', async () => {
        const password = passwordInput.value;
        const username = 'admin'; // For standard admin login via dashboard gate
        
        loginBtn.disabled = true;
        loginBtn.textContent = 'Verifying...';

        try {
            await window.api.auth.login(username, password);
            window.location.reload(); // Refresh to trigger the role check above
        } catch (err) {
            alert('Invalid admin credentials.');
            passwordInput.value = '';
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Enter Dashboard';
        }
    });

    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loginBtn.click();
    });

    // 2. Load Data from Backend
    async function loadAdminData() {
        try {
            // Fetch Stats
            const stats = await window.api.admin.getStats();
            animateCounter(totalScansEl, stats.total_scans);
            animateCounter(scamsDetectedEl, stats.scams_detected);
            animateCounter(activeModelsEl, stats.active_models);

            // Fetch Keywords
            await loadKeywords();

        } catch (error) {
            console.error('Failed to load admin data:', error);
            keywordGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; color: #fb7185; padding: 1rem; background: rgba(225, 29, 72, 0.1); border-radius: 0.5rem; border: 1px solid rgba(225, 29, 72, 0.3);">
                    Failed to connect to backend.
                </div>
            `;
        }
    }

    function renderCharts(trends, distribution) {
        const trendsCtx = document.getElementById('trendsChart').getContext('2d');
        const distCtx = document.getElementById('distributionChart').getContext('2d');

        // Trends Chart (Line)
        new Chart(trendsCtx, {
            type: 'line',
            data: {
                labels: trends.map(t => t.date),
                datasets: [{
                    label: 'Scans',
                    data: trends.map(t => t.count),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });

        // Distribution Chart (Doughnut)
        new Chart(distCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(distribution),
                datasets: [{
                    data: Object.values(distribution),
                    backgroundColor: ['#38bdf8', '#f59e0b', '#f43f5e', '#10b981'],
                    borderWidth: 0
                }]
            },
            options: {
                plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } },
                cutout: '70%'
            }
        });
    }

    // 3. Render Keywords
    async function loadKeywords() {
        try {
            const data = await window.api.admin.getKeywords();
            keywordCountEl.textContent = `${data.total_keywords} Keywords`;

            const html = data.keywords.map(kw => `
                <div class="keyword-chip" title="${kw}">${kw}</div>
            `).join('');

            keywordGrid.innerHTML = html;
        } catch (error) {
            console.error('Failed to load keywords:', error);
        }
    }

    // 4. Add New Keyword
    addKeywordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const keyword = newKeywordInput.value.trim();
        if (!keyword) return;

        const btn = document.getElementById('btn-add-keyword');
        const originalText = btn.textContent;
        btn.textContent = 'Adding...';
        btn.disabled = true;

        try {
            await window.api.admin.addKeyword(keyword);
            newKeywordInput.value = '';
            await loadKeywords(); // Refresh the list
        } catch (error) {
            alert('Failed to add keyword. Ensure it is unique and the server is running.');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });

    // Utility: Number Counter Animation
    function animateCounter(element, target) {
        let current = 0;
        const duration = 1500; // ms
        const steps = 60;
        const increment = target / steps;
        const stepTime = Math.abs(Math.floor(duration / steps));

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                clearInterval(timer);
                element.textContent = target.toLocaleString();
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, stepTime);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initMobileMenu();
    initEducationCenter();
    initAdminDashboard();
});

// Mobile Toggle Logic
function initMobileMenu() {
    const toggle = document.getElementById('mobile-toggle');
    const sidebar = document.getElementById('sidebar');
    
    if (toggle && sidebar) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
}
