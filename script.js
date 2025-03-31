document.addEventListener('DOMContentLoaded', function() {
    // Initialize feather icons
    feather.replace();
    
    // Elements
    const startAnalysisBtn = document.getElementById('startAnalysisBtn');
    const aboutStartBtn = document.getElementById('about-start-btn');
    const analysisForm = document.getElementById('analysis-form');
    const repositoryForm = document.getElementById('repository-form');
    const analysisProgress = document.getElementById('analysis-progress');
    const analysisResults = document.getElementById('analysis-results');
    const progressBar = document.getElementById('analysis-progress-bar');
    const analysisStatus = document.getElementById('analysis-status');
    const analysisLogs = document.getElementById('analysis-logs');
    const generateFixesBtn = document.getElementById('generate-fixes');
    const fixRecommendations = document.getElementById('fix-recommendations');
    const backToResultsBtn = document.getElementById('back-to-results');
    const downloadReportBtn = document.getElementById('download-report');
    const downloadFixesBtn = document.getElementById('download-fixes');
    
    // Show analysis form when start button is clicked
    startAnalysisBtn.addEventListener('click', function() {
        analysisForm.classList.remove('d-none');
        analysisForm.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Also show analysis form when start button in about section is clicked
    if (aboutStartBtn) {
        aboutStartBtn.addEventListener('click', function() {
            analysisForm.classList.remove('d-none');
            analysisForm.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Handle form submission
    repositoryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const repoUrl = document.getElementById('repository-url').value.trim();
        const branchName = document.getElementById('branch-name').value.trim() || 'main';
        
        // Get analysis options
        const options = {
            performance: document.getElementById('analyze-performance').checked,
            code: document.getElementById('analyze-code').checked,
            seo: document.getElementById('analyze-seo').checked,
            accessibility: document.getElementById('analyze-accessibility').checked,
            security: document.getElementById('analyze-security').checked
        };
        
        // Hide form, show progress
        analysisForm.classList.add('d-none');
        analysisProgress.classList.remove('d-none');
        analysisProgress.scrollIntoView({ behavior: 'smooth' });
        
        // Start the analysis
        startAnalysis(repoUrl, branchName, options);
    });
    
    // Generate fixes button
    if (generateFixesBtn) {
        generateFixesBtn.addEventListener('click', function() {
            analysisResults.classList.add('d-none');
            fixRecommendations.classList.remove('d-none');
            generateFixRecommendations();
        });
    }
    
    // Back to results button
    if (backToResultsBtn) {
        backToResultsBtn.addEventListener('click', function() {
            fixRecommendations.classList.add('d-none');
            analysisResults.classList.remove('d-none');
        });
    }
    
    // Download report button
    if (downloadReportBtn) {
        downloadReportBtn.addEventListener('click', function() {
            downloadReport();
        });
    }
    
    // Download fixes button
    if (downloadFixesBtn) {
        downloadFixesBtn.addEventListener('click', function() {
            downloadFixes();
        });
    }
    
    // Simulated analysis function
    function startAnalysis(repoUrl, branchName, options) {
        let progress = 0;
        updateProgress(progress, 'Initializing analysis...');
        
        // Add initial log
        addLog(`Starting analysis of ${repoUrl} (${branchName} branch)`);
        addLog(`Selected options: ${Object.entries(options).filter(([_, val]) => val).map(([key]) => key).join(', ')}`);
        
        // Simulate the analysis process with a series of steps
        const steps = [
            { duration: 2000, message: 'Cloning repository...' },
            { duration: 1500, message: 'Analyzing file structure...' },
            { duration: 2500, message: 'Examining HTML files...' },
            { duration: 2000, message: 'Checking CSS files...' },
            { duration: 2000, message: 'Analyzing JavaScript...' },
            { duration: 1500, message: 'Running performance tests...' },
            { duration: 1800, message: 'Checking SEO factors...' },
            { duration: 1500, message: 'Evaluating accessibility...' },
            { duration: 1700, message: 'Scanning for security issues...' },
            { duration: 2000, message: 'Generating report...' }
        ];
        
        let currentStep = 0;
        const totalSteps = steps.length;
        
        const processStep = function() {
            if (currentStep < totalSteps) {
                const step = steps[currentStep];
                progress = Math.floor((currentStep / totalSteps) * 100);
                
                updateProgress(progress, step.message);
                addLog(step.message);
                
                setTimeout(function() {
                    currentStep++;
                    processStep();
                }, step.duration);
            } else {
                // Analysis complete
                updateProgress(100, 'Analysis complete!');
                addLog('Analysis completed successfully!');
                
                setTimeout(function() {
                    analysisProgress.classList.add('d-none');
                    analysisResults.classList.remove('d-none');
                    displayResults(repoUrl, branchName, options);
                    analysisResults.scrollIntoView({ behavior: 'smooth' });
                }, 1000);
            }
        };
        
        // Start processing steps
        setTimeout(processStep, 1000);
    }
    
    // Update progress bar and status
    function updateProgress(percent, message) {
        progressBar.style.width = `${percent}%`;
        progressBar.setAttribute('aria-valuenow', percent);
        analysisStatus.textContent = message;
    }
    
    // Add log message
    function addLog(message) {
        const logEntry = document.createElement('div');
        const timestamp = new Date().toLocaleTimeString();
        logEntry.innerHTML = `<span class="text-muted">[${timestamp}]</span> ${message}`;
        analysisLogs.appendChild(logEntry);
        analysisLogs.scrollTop = analysisLogs.scrollHeight;
    }
    
    // Display analysis results
    function displayResults(repoUrl, branchName, options) {
        // Extract repository owner and name from URL
        let repoOwner = 'unknown';
        let repoName = 'unknown';
        
        try {
            const urlParts = repoUrl.split('/');
            if (urlParts.length >= 2) {
                repoName = urlParts[urlParts.length - 1] || 'unknown';
                repoOwner = urlParts[urlParts.length - 2] || 'unknown';
            }
        } catch (e) {
            console.error('Error parsing repo URL:', e);
        }
        
        // Repository info
        const repoInfo = document.getElementById('repo-info');
        repoInfo.innerHTML = `
            <div class="mb-3">
                <strong>Repository:</strong> ${repoOwner}/${repoName}
            </div>
            <div class="mb-3">
                <strong>Branch:</strong> ${branchName}
            </div>
            <div class="mb-3">
                <strong>Analysis Date:</strong> ${new Date().toLocaleDateString()}
            </div>
            <div>
                <strong>Repository URL:</strong> <a href="${repoUrl}" target="_blank">${repoUrl}</a>
            </div>
        `;
        
        // Generate random scores for demonstration
        const performanceScore = Math.floor(Math.random() * 31) + 60; // 60-90
        const codeScore = Math.floor(Math.random() * 31) + 50; // 50-80
        const seoScore = Math.floor(Math.random() * 21) + 70; // 70-90
        const accessibilityScore = Math.floor(Math.random() * 41) + 50; // 50-90
        const securityScore = Math.floor(Math.random() * 31) + 60; // 60-90
        
        // Calculate overall score
        const overallScore = Math.floor(
            (performanceScore + codeScore + seoScore + accessibilityScore + securityScore) / 5
        );
        
        // Update overall score
        const overallScoreElement = document.getElementById('overall-score');
        overallScoreElement.textContent = overallScore;
        
        // Animate the progress circle
        const progressCircular = document.querySelector('.progress-circular');
        progressCircular.style.background = `conic-gradient(var(--primary-color) ${overallScore}%, var(--light-color) 0%)`;
        
        // Score breakdown
        const scoreBreakdown = document.getElementById('score-breakdown');
        scoreBreakdown.innerHTML = `
            <div class="row">
                <div class="col-6">
                    <div class="d-flex justify-content-between mb-2">
                        <span>Performance:</span>
                        <span class="${getScoreClass(performanceScore)}">${performanceScore}%</span>
                    </div>
                    <div class="progress mb-3">
                        <div class="progress-bar ${getProgressBarClass(performanceScore)}" role="progressbar" style="width: ${performanceScore}%"></div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="d-flex justify-content-between mb-2">
                        <span>Code Quality:</span>
                        <span class="${getScoreClass(codeScore)}">${codeScore}%</span>
                    </div>
                    <div class="progress mb-3">
                        <div class="progress-bar ${getProgressBarClass(codeScore)}" role="progressbar" style="width: ${codeScore}%"></div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-6">
                    <div class="d-flex justify-content-between mb-2">
                        <span>SEO:</span>
                        <span class="${getScoreClass(seoScore)}">${seoScore}%</span>
                    </div>
                    <div class="progress mb-3">
                        <div class="progress-bar ${getProgressBarClass(seoScore)}" role="progressbar" style="width: ${seoScore}%"></div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="d-flex justify-content-between mb-2">
                        <span>Accessibility:</span>
                        <span class="${getScoreClass(accessibilityScore)}">${accessibilityScore}%</span>
                    </div>
                    <div class="progress mb-3">
                        <div class="progress-bar ${getProgressBarClass(accessibilityScore)}" role="progressbar" style="width: ${accessibilityScore}%"></div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-6">
                    <div class="d-flex justify-content-between mb-2">
                        <span>Security:</span>
                        <span class="${getScoreClass(securityScore)}">${securityScore}%</span>
                    </div>
                    <div class="progress mb-3">
                        <div class="progress-bar ${getProgressBarClass(securityScore)}" role="progressbar" style="width: ${securityScore}%"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Key findings
        const keyFindings = document.getElementById('key-findings');
        keyFindings.innerHTML = generateKeyFindings(performanceScore, codeScore, seoScore, accessibilityScore, securityScore);
        
        // Fill in detailed results for each tab
        document.getElementById('performance-results').innerHTML = generatePerformanceResults(performanceScore);
        document.getElementById('code-results').innerHTML = generateCodeResults(codeScore);
        document.getElementById('seo-results').innerHTML = generateSeoResults(seoScore);
        document.getElementById('accessibility-results').innerHTML = generateAccessibilityResults(accessibilityScore);
        document.getElementById('security-results').innerHTML = generateSecurityResults(securityScore);
        document.getElementById('recommendations-results').innerHTML = generateRecommendations();
    }
    
    // Helper function to get score class
    function getScoreClass(score) {
        if (score < 60) return 'text-danger';
        if (score < 80) return 'text-warning';
        return 'text-success';
    }
    
    // Helper function to get progress bar class
    function getProgressBarClass(score) {
        if (score < 60) return 'bg-danger';
        if (score < 80) return 'bg-warning';
        return 'bg-success';
    }
    
    // Generate key findings based on scores
    function generateKeyFindings(performanceScore, codeScore, seoScore, accessibilityScore, securityScore) {
        let findings = '<ul class="list-group">';
        
        // Add findings based on scores
        if (performanceScore < 70) {
            findings += `
                <li class="list-group-item list-group-item-warning">
                    <i data-feather="alert-triangle" class="feather-small"></i> 
                    Performance issues detected that may be slowing down your website
                </li>
            `;
        }
        
        if (codeScore < 65) {
            findings += `
                <li class="list-group-item list-group-item-warning">
                    <i data-feather="alert-triangle" class="feather-small"></i> 
                    Code quality issues could impact maintainability and future development
                </li>
            `;
        }
        
        if (seoScore < 75) {
            findings += `
                <li class="list-group-item list-group-item-warning">
                    <i data-feather="alert-triangle" class="feather-small"></i> 
                    SEO improvements needed to improve search engine rankings
                </li>
            `;
        }
        
        if (accessibilityScore < 70) {
            findings += `
                <li class="list-group-item list-group-item-warning">
                    <i data-feather="alert-triangle" class="feather-small"></i> 
                    Accessibility issues may prevent some users from using your website effectively
                </li>
            `;
        }
        
        if (securityScore < 75) {
            findings += `
                <li class="list-group-item list-group-item-danger">
                    <i data-feather="alert-circle" class="feather-small"></i> 
                    Security vulnerabilities detected that require immediate attention
                </li>
            `;
        }
        
        // Add positive findings for high scores
        if (performanceScore >= 85) {
            findings += `
                <li class="list-group-item list-group-item-success">
                    <i data-feather="check-circle" class="feather-small"></i> 
                    Excellent website performance, loading times are optimal
                </li>
            `;
        }
        
        if (seoScore >= 85) {
            findings += `
                <li class="list-group-item list-group-item-success">
                    <i data-feather="check-circle" class="feather-small"></i> 
                    Strong SEO implementation, good potential for search engine visibility
                </li>
            `;
        }
        
        findings += '</ul>';
        
        // Replace all feather icons
        setTimeout(() => {
            feather.replace();
        }, 0);
        
        return findings;
    }
    
    // Generate performance results
    function generatePerformanceResults(score) {
        const issues = [];
        
        if (score < 85) {
            issues.push({
                severity: 'medium',
                title: 'Large JavaScript bundle size',
                description: 'Your main JavaScript bundle exceeds recommended size limits',
                filePath: 'js/main.bundle.js',
                recommendations: [
                    'Implement code splitting to reduce initial bundle size',
                    'Remove unused dependencies',
                    'Consider lazy loading for non-critical components'
                ]
            });
        }
        
        if (score < 80) {
            issues.push({
                severity: 'high',
                title: 'Unoptimized images',
                description: 'Multiple uncompressed or large images found',
                filePath: 'assets/images/',
                recommendations: [
                    'Compress images using modern formats (WebP)',
                    'Implement responsive images with srcset',
                    'Lazy load images below the fold'
                ]
            });
        }
        
        if (score < 75) {
            issues.push({
                severity: 'medium',
                title: 'Render-blocking resources',
                description: 'CSS and JavaScript resources are blocking page rendering',
                filePath: 'index.html',
                recommendations: [
                    'Move critical CSS inline',
                    'Use async or defer for non-critical scripts',
                    'Optimize the critical rendering path'
                ]
            });
        }
        
        if (score < 70) {
            issues.push({
                severity: 'medium',
                title: 'No caching policy',
                description: 'Static assets lack proper cache headers',
                filePath: 'server/config/nginx.conf',
                recommendations: [
                    'Implement appropriate cache-control headers',
                    'Set up browser caching for static assets',
                    'Use versioning for cache busting when content changes'
                ]
            });
        }
        
        return generateIssuesList(issues);
    }
    
    // Generate code quality results
    function generateCodeResults(score) {
        const issues = [];
        
        if (score < 85) {
            issues.push({
                severity: 'low',
                title: 'Inconsistent code formatting',
                description: 'Code formatting varies across the codebase',
                filePath: 'Multiple files',
                recommendations: [
                    'Implement a code formatter like Prettier',
                    'Add linting rules with ESLint/StyleLint',
                    'Setup pre-commit hooks to enforce formatting'
                ]
            });
        }
        
        if (score < 75) {
            issues.push({
                severity: 'medium',
                title: 'Complex component structure',
                description: 'Components have too many responsibilities and are difficult to maintain',
                filePath: 'src/components/Dashboard/Dashboard.js',
                recommendations: [
                    'Break down large components into smaller, focused ones',
                    'Separate business logic from presentation',
                    'Use composition over inheritance for component reuse'
                ]
            });
        }
        
        if (score < 70) {
            issues.push({
                severity: 'medium',
                title: 'Duplicate code patterns',
                description: 'Similar code patterns repeated across multiple files',
                filePath: 'src/utils/',
                recommendations: [
                    'Extract common functionality into utility functions',
                    'Create shared hooks or higher-order components',
                    'Implement the DRY (Don\'t Repeat Yourself) principle'
                ]
            });
        }
        
        if (score < 65) {
            issues.push({
                severity: 'high',
                title: 'Outdated dependencies',
                description: 'Multiple dependencies are significantly outdated with potential security issues',
                filePath: 'package.json',
                codeSnippet: `{
  "dependencies": {
    "react": "16.8.0",
    "lodash": "4.15.0",
    "axios": "0.18.0",
    "jquery": "3.3.1"
  }
}`,
                recommendations: [
                    'Update dependencies to their latest stable versions',
                    'Implement dependency scanning in CI/CD pipeline',
                    'Set up regular dependency audits'
                ]
            });
        }
        
        return generateIssuesList(issues);
    }
    
    // Generate SEO results
    function generateSeoResults(score) {
        const issues = [];
        
        if (score < 90) {
            issues.push({
                severity: 'low',
                title: 'Missing meta descriptions',
                description: 'Some pages lack unique meta descriptions',
                filePath: 'Various HTML files',
                recommendations: [
                    'Add unique, descriptive meta descriptions to all pages',
                    'Keep meta descriptions between 120-158 characters',
                    'Include relevant keywords naturally in descriptions'
                ]
            });
        }
        
        if (score < 80) {
            issues.push({
                severity: 'medium',
                title: 'Improper heading structure',
                description: 'Headings are not properly hierarchical (H1 → H2 → H3)',
                filePath: 'src/pages/Services.js',
                codeSnippet: `<div className="services-page">
  <h3>Our Services</h3>
  <h2>Web Development</h2>
  <p>...</p>
  <h1>Mobile Development</h1>
  <p>...</p>
</div>`,
                recommendations: [
                    'Ensure each page has exactly one H1 tag',
                    'Follow proper heading hierarchy (H1 → H2 → H3)',
                    'Use headings to create a logical document outline'
                ]
            });
        }
        
        if (score < 75) {
            issues.push({
                severity: 'medium',
                title: 'Missing image alt text',
                description: 'Multiple images lack alt text attributes',
                filePath: 'Multiple files',
                codeSnippet: `<img src="/images/services/web-dev.jpg" />
<img src="/images/services/mobile-dev.jpg" />`,
                recommendations: [
                    'Add descriptive alt text to all images',
                    'Keep alt text concise but descriptive',
                    'Use empty alt text for decorative images'
                ]
            });
        }
        
        if (score < 70) {
            issues.push({
                severity: 'high',
                title: 'No structured data',
                description: 'Website lacks structured data/schema markup',
                filePath: 'Various HTML files',
                recommendations: [
                    'Implement schema.org markup for appropriate content types',
                    'Add Organization, LocalBusiness, and Service schema',
                    'Use BreadcrumbList schema for navigation paths'
                ]
            });
        }
        
        return generateIssuesList(issues);
    }
    
    // Generate accessibility results
    function generateAccessibilityResults(score) {
        const issues = [];
        
        if (score < 90) {
            issues.push({
                severity: 'low',
                title: 'Missing form labels',
                description: 'Some form fields lack associated labels',
                filePath: 'src/components/ContactForm.js',
                codeSnippet: `<div className="form-group">
  <input type="email" placeholder="Your Email" />
</div>`,
                recommendations: [
                    'Add explicit labels for all form inputs',
                    'Use the "for" attribute to associate labels with inputs',
                    'Avoid using placeholder as the only form of labeling'
                ]
            });
        }
        
        if (score < 80) {
            issues.push({
                severity: 'medium',
                title: 'Low color contrast',
                description: 'Text color does not have sufficient contrast with background',
                filePath: 'src/styles/global.css',
                codeSnippet: `.secondary-text {
  color: #999999;
  background-color: #f7f7f7;
}`,
                recommendations: [
                    'Ensure text meets WCAG AA contrast requirements (4.5:1 for normal text)',
                    'Use tools like WebAIM Contrast Checker during design',
                    'Test with color blindness simulators'
                ]
            });
        }
        
        if (score < 70) {
            issues.push({
                severity: 'high',
                title: 'Non-accessible interactive elements',
                description: 'Interactive elements lack keyboard accessibility',
                filePath: 'src/components/Navigation.js',
                codeSnippet: `<div onClick={handleClick} className="menu-item">
  Services
</div>`,
                recommendations: [
                    'Use semantic HTML elements (buttons for actions, links for navigation)',
                    'Add keyboard support for custom interactive elements',
                    'Ensure all interactive elements have focus states'
                ]
            });
        }
        
        if (score < 65) {
            issues.push({
                severity: 'high',
                title: 'Missing ARIA attributes',
                description: 'Custom UI components lack proper ARIA roles and attributes',
                filePath: 'src/components/Tabs.js',
                codeSnippet: `<div className="tabs">
  <div className="tab-headers">
    {tabs.map(tab => (
      <div 
        className={activeTab === tab.id ? 'active' : ''} 
        onClick={() => setActiveTab(tab.id)}
      >
        {tab.title}
      </div>
    ))}
  </div>
  <div className="tab-content">
    {activeTabContent}
  </div>
</div>`,
                recommendations: [
                    'Add appropriate ARIA roles, states, and properties',
                    'Use role="tablist", role="tab", and role="tabpanel"',
                    'Include aria-selected, aria-controls, and other required attributes'
                ]
            });
        }
        
        return generateIssuesList(issues);
    }
    
    // Generate security results
    function generateSecurityResults(score) {
        const issues = [];
        
        if (score < 90) {
            issues.push({
                severity: 'low',
                title: 'Missing content security policy',
                description: 'No Content-Security-Policy header is set',
                filePath: 'server configuration',
                recommendations: [
                    'Implement a Content Security Policy',
                    'Restrict sources for scripts, styles, and other resources',
                    'Use nonce-based or hash-based CSP for inline scripts'
                ]
            });
        }
        
        if (score < 80) {
            issues.push({
                severity: 'medium',
                title: 'Insecure cookie settings',
                description: 'Cookies lack secure and httpOnly flags',
                filePath: 'server/auth/config.js',
                codeSnippet: `app.use(session({
  secret: 'SESSION_SECRET',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 }
}));`,
                recommendations: [
                    'Set secure flag to ensure cookies are only sent over HTTPS',
                    'Set httpOnly flag to prevent JavaScript access to cookies',
                    'Use SameSite attribute to prevent CSRF attacks'
                ]
            });
        }
        
        if (score < 70) {
            issues.push({
                severity: 'high',
                title: 'Potential XSS vulnerabilities',
                description: 'User input is rendered directly without sanitization',
                filePath: 'src/components/Comments.js',
                codeSnippet: `function Comment({ comment }) {
  return (
    <div className="comment">
      <h4>{comment.author}</h4>
      <div dangerouslySetInnerHTML={{ __html: comment.text }} />
    </div>
  );
}`,
                recommendations: [
                    'Sanitize user input before rendering',
                    'Use DOMPurify or similar libraries for HTML sanitization',
                    'Avoid using dangerouslySetInnerHTML when possible'
                ]
            });
        }
        
        if (score < 65) {
            issues.push({
                severity: 'high',
                title: 'Insecure API requests',
                description: 'API keys are exposed in client-side code',
                filePath: 'src/services/api.js',
                codeSnippet: `const API_KEY = 'your-api-key-123456';

export function fetchData() {
  return fetch(\`https://api.example.com/data?key=\${API_KEY}\`);
}`,
                recommendations: [
                    'Move API calls to server-side code',
                    'Use environment variables for API keys',
                    'Implement proper authentication for API endpoints'
                ]
            });
        }
        
        return generateIssuesList(issues);
    }
    
    // Generate recommendations
    function generateRecommendations() {
        return `
            <div class="alert alert-info mb-4">
                <h4 class="alert-heading"><i data-feather="info" class="feather-small"></i> Improvement Strategy</h4>
                <p>Based on our analysis, here's a prioritized list of improvements to maximize impact on your digital solutions business website.</p>
            </div>
            
            <h4>High Priority (Address within 1-2 weeks)</h4>
            <ol class="mb-4">
                <li>
                    <strong>Fix security vulnerabilities</strong>
                    <p>Address all high-severity security issues, including potential XSS vulnerabilities and exposed API keys.</p>
                </li>
                <li>
                    <strong>Optimize critical performance issues</strong>
                    <p>Compress and optimize images, implement browser caching, and minimize render-blocking resources.</p>
                </li>
                <li>
                    <strong>Fix major accessibility issues</strong>
                    <p>Ensure keyboard accessibility for all interactive elements and add proper ARIA attributes.</p>
                </li>
            </ol>
            
            <h4>Medium Priority (Address within 1 month)</h4>
            <ol class="mb-4">
                <li>
                    <strong>Implement proper SEO best practices</strong>
                    <p>Add missing meta descriptions, fix heading structure, and implement structured data.</p>
                </li>
                <li>
                    <strong>Improve code quality and maintainability</strong>
                    <p>Break down complex components, reduce duplication, and implement consistent formatting.</p>
                </li>
                <li>
                    <strong>Update outdated dependencies</strong>
                    <p>Update all dependencies to their latest stable versions to fix security and performance issues.</p>
                </li>
            </ol>
            
            <h4>Lower Priority (Address within 2-3 months)</h4>
            <ol class="mb-4">
                <li>
                    <strong>Enhance UI/UX for improved conversion</strong>
                    <p>Optimize user flows, improve call-to-action visibility, and streamline navigation.</p>
                </li>
                <li>
                    <strong>Implement monitoring and analytics</strong>
                    <p>Set up performance monitoring, error tracking, and user behavior analytics.</p>
                </li>
                <li>
                    <strong>Develop content strategy improvements</strong>
                    <p>Enhance content quality, engagement, and search visibility based on user needs.</p>
                </li>
            </ol>
            
            <div class="alert alert-success">
                <h4 class="alert-heading"><i data-feather="check-circle" class="feather-small"></i> Expected Outcomes</h4>
                <p>By implementing these recommendations, you can expect:</p>
                <ul class="mb-0">
                    <li>Improved website performance and user experience</li>
                    <li>Better search engine rankings and organic traffic</li>
                    <li>Increased accessibility for all users</li>
                    <li>Enhanced security and reduced vulnerability risks</li>
                    <li>More maintainable codebase for future development</li>
                    <li>Higher conversion rates and business growth</li>
                </ul>
            </div>
        `;
    }
    
    // Generate issues list
    function generateIssuesList(issues) {
        if (issues.length === 0) {
            return '<div class="alert alert-success">No issues detected!</div>';
        }
        
        let html = '';
        
        issues.forEach(issue => {
            html += `
                <div class="issue-card ${issue.severity}">
                    <div class="issue-header">
                        <h4>
                            <span class="badge ${issue.severity === 'high' ? 'bg-danger' : issue.severity === 'medium' ? 'bg-warning' : 'bg-info'}">
                                ${issue.severity.toUpperCase()}
                            </span>
                            ${issue.title}
                        </h4>
                    </div>
                    <p>${issue.description}</p>
                    <p><strong>Location:</strong> <span class="file-path">${issue.filePath}</span></p>
                    
                    ${issue.codeSnippet ? `
                    <div class="code-snippet mb-3">${issue.codeSnippet}</div>
                    ` : ''}
                    
                    <h5>Recommendations:</h5>
                    <ul>
                        ${issue.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            `;
        });
        
        return html;
    }
    
    // Generate fix recommendations for display in the fixes section
    function generateFixRecommendations() {
        const fixList = document.getElementById('fix-list');
        
        const fixes = [
            {
                id: 'fix-1',
                title: 'Optimize Images',
                severity: 'high',
                description: 'Compress and optimize large image files to improve load times.',
                filePath: 'assets/images/',
                before: `<img src="large-image.jpg" width="800" height="600">`,
                after: `<picture>
  <source srcset="large-image.webp" type="image/webp">
  <source srcset="large-image.jpg" type="image/jpeg">
  <img src="large-image.jpg" width="800" height="600" loading="lazy" alt="Project showcase">
</picture>`
            },
            {
                id: 'fix-2',
                title: 'Fix XSS Vulnerability',
                severity: 'high',
                description: 'Sanitize user input before rendering in HTML.',
                filePath: 'src/components/Comments.js',
                before: `function Comment({ comment }) {
  return (
    <div className="comment">
      <h4>{comment.author}</h4>
      <div dangerouslySetInnerHTML={{ __html: comment.text }} />
    </div>
  );
}`,
                after: `import DOMPurify from 'dompurify';

function Comment({ comment }) {
  return (
    <div className="comment">
      <h4>{sanitizeText(comment.author)}</h4>
      {comment.html ? (
        <div dangerouslySetInnerHTML={{ 
          __html: DOMPurify.sanitize(comment.text) 
        }} />
      ) : (
        <p>{comment.text}</p>
      )}
    </div>
  );
}

// Helper function for simple text sanitization
function sanitizeText(text) {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}`
            },
            {
                id: 'fix-3',
                title: 'Implement Proper SEO Meta Tags',
                severity: 'medium',
                description: 'Add proper meta tags to improve search engine visibility.',
                filePath: 'src/pages/Services.js',
                before: `export default function ServicesPage() {
  return (
    <div className="services-page">
      <h1>Our Services</h1>
      {/* Page content */}
    </div>
  );
}`,
                after: `import { Helmet } from 'react-helmet';

export default function ServicesPage() {
  return (
    <div className="services-page">
      <Helmet>
        <title>Digital Solutions Services - Web & Mobile Development | Company Name</title>
        <meta name="description" content="Our comprehensive digital solutions include web development, mobile app creation, cloud services, and UX/UI design to transform your business." />
        <meta name="keywords" content="digital solutions, web development, mobile apps, cloud services" />
        <meta property="og:title" content="Digital Solutions Services | Company Name" />
        <meta property="og:description" content="Comprehensive digital solutions for modern businesses." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <h1>Our Services</h1>
      {/* Page content */}
    </div>
  );
}`
            },
            {
                id: 'fix-4',
                title: 'Fix Accessibility Issues in Navigation',
                severity: 'medium',
                description: 'Make navigation elements properly accessible with keyboard support.',
                filePath: 'src/components/Navigation.js',
                before: `<div className="nav-items">
  {navItems.map(item => (
    <div key={item.id} onClick={() => navigate(item.url)} className="nav-item">
      {item.label}
    </div>
  ))}
</div>`,
                after: `<nav aria-label="Main navigation">
  <ul className="nav-items">
    {navItems.map(item => (
      <li key={item.id}>
        <a 
          href={item.url}
          className="nav-item"
          onClick={(e) => {
            e.preventDefault();
            navigate(item.url);
          }}
        >
          {item.label}
        </a>
      </li>
    ))}
  </ul>
</nav>`
            },
            {
                id: 'fix-5',
                title: 'Add Content Security Policy',
                severity: 'medium',
                description: 'Implement a Content Security Policy to enhance security.',
                filePath: 'server/index.js',
                before: `const express = require('express');
const app = express();

// Other middleware
app.use(express.json());

// Routes setup
app.use('/api', apiRoutes);`,
                after: `const express = require('express');
const helmet = require('helmet');
const app = express();

// Security middleware
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", 'trusted-cdn.com'],
    styleSrc: ["'self'", "'unsafe-inline'", 'trusted-cdn.com'],
    imgSrc: ["'self'", 'data:', 'trusted-cdn.com'],
    connectSrc: ["'self'", 'api.example.com'],
    fontSrc: ["'self'", 'trusted-cdn.com'],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  },
}));

// Other middleware
app.use(express.json());

// Routes setup
app.use('/api', apiRoutes);`
            }
        ];
        
        let html = `
            <div class="alert alert-info mb-4">
                <h4 class="alert-heading"><i data-feather="tool" class="feather-small"></i> Fix Recommendations</h4>
                <p>Below are code-level fix recommendations for issues found during analysis. These fixes address the most critical issues first.</p>
            </div>
        `;
        
        fixes.forEach(fix => {
            html += `
                <div class="fix-item" id="${fix.id}">
                    <div class="fix-header">
                        <h4>
                            <span class="badge ${fix.severity === 'high' ? 'bg-danger' : fix.severity === 'medium' ? 'bg-warning' : 'bg-info'}">
                                ${fix.severity.toUpperCase()}
                            </span>
                            ${fix.title}
                        </h4>
                    </div>
                    <p>${fix.description}</p>
                    <p><strong>File:</strong> <span class="file-path">${fix.filePath}</span></p>
                    
                    <div class="fix-content">
                        <div class="before-after">
                            <div>
                                <h5>Current Code:</h5>
                                <div class="diff-display">
                                    ${fix.before.split('\n').map(line => `<div class="deletion">- ${line}</div>`).join('')}
                                </div>
                            </div>
                            <div>
                                <h5>Recommended Fix:</h5>
                                <div class="diff-display">
                                    ${fix.after.split('\n').map(line => `<div class="addition">+ ${line}</div>`).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        fixList.innerHTML = html;
        
        // Replace feather icons
        setTimeout(() => {
            feather.replace();
        }, 0);
    }
    
    // Download report function
    function downloadReport() {
        alert('Generating PDF report... This would download a comprehensive report in a real implementation.');
        // In a real implementation, this would generate a PDF with all analysis results
    }
    
    // Download fixes function
    function downloadFixes() {
        alert('Preparing fix patches... This would download patch files in a real implementation.');
        // In a real implementation, this would generate patch files or a zip with fixed files
    }
});
