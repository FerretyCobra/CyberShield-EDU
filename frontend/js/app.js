// --- Modern App Logic & Redesign Support ---

(function() {
    // Theme Loading
    const mode = localStorage.getItem('themeMode') || 'dark';
    document.body.className = `mode-${mode}`;
})();

// --- Theme Management ---
window.toggleTheme = function() {
    const isDark = document.body.classList.contains('mode-dark');
    const newMode = isDark ? 'light' : 'dark';
    
    document.body.className = `mode-${newMode}`;
    localStorage.setItem('themeMode', newMode);
    
    // Update switch UI if needed
    updateThemeUI(newMode);
};

function updateThemeUI(mode) {
    const slider = document.querySelector('.theme-switch .slider');
    if (!slider) return;
    
    // The icon switching logic can go here if we were using separate icons
    // For now, the CSS transform handles the physical slider movement
}

// --- Scroll & Entrance Animations ---
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animateOnScroll').forEach(el => observer.observe(el));
}

// --- Unified Tab System ---
window.switchTab = function(tabId) {
    // Content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    // Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const activeTab = document.getElementById(tabId);
    if (activeTab) activeTab.classList.add('active');
    
    // Clear and hide results when switching tabs
    const resultContainer = document.getElementById('result-container');
    if (resultContainer) {
        resultContainer.innerHTML = '';
        resultContainer.classList.remove('show');
    }

    // Find the button that was clicked and activate it
    const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.getAttribute('onclick').includes(tabId));
    if (activeBtn) activeBtn.classList.add('active');
};

// --- API Helper & Loading State ---
function setLoadingState(button, isLoading, text = "Processing...") {
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                ${text}
            </div>
        `;
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || "Run Analysis";
    }
}

// --- Results Rendering (Premium) ---
function renderScanResult(result, container) {
    const isScam = result.prediction === 'scam';
    const confidence = result.confidence; // decimal 0-1
    const reasoning = result.reasoning || ["Pattern analysis complete.", "Linguistic validation successful."];
    
    // Generate detailed insights with icons
    const insights = reasoning.map(r => {
        let icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z"/></svg>';
        
        if (r.toLowerCase().includes('qr code')) {
            icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>';
        } else if (r.toLowerCase().includes('link') || r.toLowerCase().includes('url')) {
            icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
        }

        return `
            <div class="insight-item" style="display: flex; gap: 12px; font-size: 0.9rem; color: var(--text-secondary); padding: 8px 0;">
                <div style="color: ${isScam ? '#f87171' : '#4ade80'}; flex-shrink: 0; padding-top: 2px;">${icon}</div>
                <div>${r}</div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="glass-card animate-on-scroll animated" style="padding: 2.5rem; border-color: ${isScam ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'};">
            <div class="result-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div class="status-indicator ${isScam ? 'status-scam' : 'status-safe'}" style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 0.8rem; letter-spacing: 0.1em;">
                    <div class="status-dot" style="width: 8px; height: 8px; border-radius: 50%; background: currentColor; box-shadow: 0 0 10px currentColor;"></div>
                    <span>${isScam ? 'THREAT DETECTED' : 'SECURE SCAN'}</span>
                </div>
                <div class="confidence-badge" style="background: rgba(255,255,255,0.05); padding: 4px 12px; border-radius: 2rem; font-size: 0.8rem; font-weight: 600;">
                    ${(confidence * 100).toFixed(1)}% Match
                </div>
            </div>

            <div class="result-body">
                <h3 style="font-size: 1.75rem; color: white; margin-bottom: 1rem;">
                    ${isScam ? 'Suspected Scam found' : 'No Threats Detected'}
                </h3>
                <p style="color: var(--text-secondary); margin-bottom: 2rem; line-height: 1.6;">
                    Our AI model processed the input through multiple detection layers and identified ${isScam ? 'sophisticated fraud patterns' : 'no immediate security risks'}.
                </p>
                
                <div class="confidence-meter-container" style="margin-bottom: 2.5rem;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; color: white; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;">
                        <span>AI Confidence</span>
                        <span>${(confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden;">
                        <div class="meter-fill" style="height: 100%; width: 0%; background: ${isScam ? 'var(--accent-primary)' : '#4ade80'}; box-shadow: 0 0 15px currentColor; transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);"></div>
                    </div>
                </div>

                <div class="insights-container" style="background: rgba(0,0,0,0.2); border-radius: 1rem; padding: 1.5rem;">
                    <div style="font-size: 0.75rem; font-weight: 800; color: white; letter-spacing: 0.1em; margin-bottom: 1rem;">DETECTION INSIGHTS</div>
                    <div class="insights-list">${insights}</div>
                </div>
            </div>

            <div class="result-footer" style="margin-top: 2.5rem;">
                <button class="btn-primary" onclick="window.location.hash = '#detector'; window.location.reload();" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:1.25rem; height:1.25rem;"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"/><path d="M12 8v4l3 3"/></svg>
                    New Security Audit
                </button>
            </div>
        </div>
    `;

    // Initialize Meter Animation
    setTimeout(() => {
        const fill = container.querySelector('.meter-fill');
        if (fill) fill.style.width = `${confidence * 100}%`;
    }, 100);

    container.classList.add('show');
    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initAnimations();
    
    // Global result container
    const resultContainer = document.getElementById('result-container');

    // --- Text Scan ---
    const textBtn = document.getElementById('btn-text-scan');
    if (textBtn) {
        textBtn.addEventListener('click', async () => {
            const text = document.getElementById('textScanInput').value.trim();
            if (!text) return alert("Please enter text to analyze.");

            setLoadingState(textBtn, true, "Analyzing message...");
            try {
                const result = await window.api.detection.analyzeText(text);
                renderScanResult(result, resultContainer);
            } catch (err) {
                alert("Analysis failed. Backend might be offline.");
            } finally {
                setLoadingState(textBtn, false);
            }
        });
    }

    // --- URL Scan ---
    const urlBtn = document.getElementById('btn-url-scan');
    if (urlBtn) {
        urlBtn.addEventListener('click', async () => {
            const url = document.getElementById('urlScanInput').value.trim();
            if (!url) return alert("Please enter a URL.");

            setLoadingState(urlBtn, true, "Analyzing URL...");
            try {
                const result = await window.api.detection.analyzeUrl(url);
                renderScanResult(result, resultContainer);
            } catch (err) {
                alert("Scan failed.");
            } finally {
                setLoadingState(urlBtn, false);
            }
        });
    }

    // --- PDF Scan ---
    const pdfBtn = document.getElementById('btn-pdf-scan');
    const pdfInput = document.getElementById('pdfInput');
    if (pdfBtn && pdfInput) {
        pdfBtn.addEventListener('click', async () => {
            const file = pdfInput.files[0];
            if (!file) return alert("Please select a PDF file.");

            setLoadingState(pdfBtn, true, "Analyzing PDF...");
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await window.api.detection.analyzePdf(formData);
                if (response.task_id) {
                    const result = await window.api.tasks.pollUntilFinished(response.task_id);
                    renderScanResult(result, resultContainer);
                }
            } catch (err) {
                alert("PDF Scan failed.");
            } finally {
                setLoadingState(pdfBtn, false);
            }
        });
    }

    // --- Image Scan ---
    const imgBtn = document.getElementById('btn-image-scan');
    const imgInput = document.getElementById('imageInput');
    if (imgBtn && imgInput) {
        imgBtn.addEventListener('click', async () => {
            const file = imgInput.files[0];
            if (!file) return alert("Please select an image.");

            setLoadingState(imgBtn, true, "Analyzing Image...");
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await window.api.detection.analyzeImage(formData);
                if (response.task_id) {
                    const result = await window.api.tasks.pollUntilFinished(response.task_id);
                    renderScanResult(result, resultContainer);
                }
            } catch (err) {
                alert("Image Scan failed.");
            } finally {
                setLoadingState(imgBtn, false);
            }
    // --- Scam Report ---
    const reportForm = document.getElementById('scamReportForm');
    if (reportForm) {
        reportForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('btn-submit-report');
            const successEl = document.getElementById('report-success');
            
            const formData = new FormData(reportForm);
            
            setLoadingState(submitBtn, true, "Submitting Report...");
            
            try {
                // Using a relative path which will work if the JS is served from the same origin as API
                // or window.api.base_url if defined in api.js
                const baseUrl = window.api && window.api.base_url ? window.api.base_url : 'http://localhost:8000/v1';
                const response = await fetch(`${baseUrl}/report/reports`, {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    reportForm.style.display = 'none';
                    successEl.style.display = 'block';
                    // Scroll to success message
                    successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    alert("Submission failed: " + (data.detail || "Unknown error"));
                }
            } catch (err) {
                console.error("Report submission failed:", err);
                alert("Failed to connect to the reporting server.");
            } finally {
                setLoadingState(submitBtn, false);
            }
        });
    }
});
