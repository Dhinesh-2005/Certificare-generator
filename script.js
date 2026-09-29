/**
 * ============================================================================
 * TEAMACY OFFICIAL INTERNSHIP CERTIFICATE GENERATOR
 * Final Locked Master Implementation with Single & Bulk Generation Modes
 * ============================================================================
 * Master Canvas: 1600px x 900px (16:9 Landscape Aspect Ratio)
 * All fixed elements (Logo, Heading, Borders, Wording, Signatures, QR Code)
 * are permanently locked in assets/certificate-background.png.
 * 
 * Only the four dynamic fields are overlaid:
 * 1. INTERN NAME
 * 2. DOMAIN / PROGRAM
 * 3. DURATION
 * 4. CERTIFICATE NUMBER
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// SINGLE MASTER CONFIGURATION OBJECT
// All future position adjustments must be made ONLY in this configuration.
// ----------------------------------------------------------------------------
const CERTIFICATE_POSITIONS = {
    canvas: {
        width: 1600,
        height: 900,
        aspectRatio: 16 / 9
    },
    name: {
        x: '50%',              // Centered horizontally
        y: '324px',            // Vertical baseline above college text & pink ribbon
        maxWidth: 1000,        // Max width before auto-scaling
        baseFontSize: 47,      // 47px at 1600x900
        minFontSize: 28,
        color: '#00004a',
        fontWeight: 'normal'
    },
    domain: {
        x: '50%',              // Centered horizontally
        y: '480px',            // Between "for successfully completing..." and "at Teamacy."
        maxWidth: 1000,        // Max width before auto-scaling
        baseFontSize: 33,      // 33px at 1600x900
        minFontSize: 20,
        color: '#00004a',      // Same color as surrounding certificate sentence
        fontWeight: 'normal'
    },
    duration: {
        x: '426px',            // Centered with DURATION heading section
        y: '668px',            // Directly below DURATION label
        maxWidth: 450,         // Max width before auto-scaling
        baseFontSize: 23,      // 23px at 1600x900
        minFontSize: 16,
        color: '#000000',
        fontWeight: 'normal'
    },
    certificateNumber: {
        x: '1130px',           // Centered with CERTIFICATE NO. heading section
        y: '664px',            // Directly below CERTIFICATE NO. label
        maxWidth: 450,         // Max width before auto-scaling
        baseFontSize: 23,      // 23px at 1600x900
        minFontSize: 16,
        color: '#000000',
        fontWeight: 'normal'
    }
};

/**
 * Standardize student certificate filename:
 * - Prefix: Teamacy-
 * - Student Name (e.g. Teamacy-Dhinesh.pdf, Teamacy-DHINESH-P.pdf)
 * - Spaces converted to hyphens
 * - Clean safe characters
 * - Suffix -2, -3 for duplicates
 */
function formatStudentFilename(rawName, existingFilenames = new Set()) {
    let clean = (rawName || 'Student')
        .trim()
        .replace(/[^a-zA-Z0-9\s_-]/g, '')
        .replace(/\s+/g, '-');

    if (!clean) clean = 'Student';

    let base = `Teamacy-${clean}`;
    let filename = `${base}.pdf`;
    let counter = 2;
    while (existingFilenames.has(filename)) {
        filename = `${base}-${counter}.pdf`;
        counter++;
    }
    existingFilenames.add(filename);
    return filename;
}

document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------------------------------------------
    // Tabs Navigation Elements
    // ------------------------------------------------------------------------
    const tabBtnSingle = document.getElementById('tabBtnSingle');
    const tabBtnBulk = document.getElementById('tabBtnBulk');
    const singleModeSection = document.getElementById('singleModeSection');
    const bulkModeSection = document.getElementById('bulkModeSection');

    // ------------------------------------------------------------------------
    // Single Mode Form References
    // ------------------------------------------------------------------------
    const form = document.getElementById('certificateForm');
    const inputInternName = document.getElementById('internName');
    const inputDomainProgram = document.getElementById('domainProgram');
    const inputDuration = document.getElementById('duration');
    const inputCertNumber = document.getElementById('certificateNumber');

    const btnGenerate = document.getElementById('btnGenerate');
    const btnDownload = document.getElementById('btnDownload');
    const btnReset = document.getElementById('btnReset');
    const btnFillDemo = document.getElementById('btnFillDemo');
    const downloadBtnText = document.getElementById('downloadBtnText');

    const alertBox = document.getElementById('alertBox');
    const alertMessage = document.getElementById('alertMessage');

    const downloadNotice = document.getElementById('downloadNotice');
    const directDownloadLink = document.getElementById('directDownloadLink');
    const viewPdfLink = document.getElementById('viewPdfLink');

    const previewSection = document.getElementById('previewSection');
    const emptyPreviewPlaceholder = document.getElementById('emptyPreviewPlaceholder');
    const stageWrapper = document.getElementById('stageWrapper');
    const certificateScaler = document.getElementById('certificateScaler');
    const certificate = document.getElementById('certificate');
    const statusLabel = document.getElementById('statusLabel');

    const certInternName = document.getElementById('certInternName');
    const certDomain = document.getElementById('certDomain');
    const certDuration = document.getElementById('certDuration');
    const certNumber = document.getElementById('certNumber');

    // Dedicated Off-Screen Master Certificate Rendering Stage Elements
    const renderCertificate = document.getElementById('renderCertificate');
    const renderInternName = document.getElementById('renderInternName');
    const renderDomain = document.getElementById('renderDomain');
    const renderDuration = document.getElementById('renderDuration');
    const renderNumber = document.getElementById('renderNumber');

    // Apply zero-taint Base64 background if available (guarantees file:/// compatibility)
    if (window.CERTIFICATE_BACKGROUND_BASE64) {
        if (certificate) certificate.style.backgroundImage = `url("${window.CERTIFICATE_BACKGROUND_BASE64}")`;
        if (renderCertificate) renderCertificate.style.backgroundImage = `url("${window.CERTIFICATE_BACKGROUND_BASE64}")`;
    }

    // Single Mode State
    let isCertificateGenerated = false;
    let currentCertificateData = null;
    let cachedPdfBlob = null;
    let cachedPdfUrl = null;
    let cachedFilename = '';

    // ------------------------------------------------------------------------
    // Bulk Mode References
    // ------------------------------------------------------------------------
    const btnDownloadTemplate = document.getElementById('btnDownloadTemplate');
    const bulkDropZone = document.getElementById('bulkDropZone');
    const excelFileInput = document.getElementById('excelFileInput');
    const btnChooseFile = document.getElementById('btnChooseFile');
    const bulkFileChip = document.getElementById('bulkFileChip');
    const bulkFileName = document.getElementById('bulkFileName');
    const bulkFileMeta = document.getElementById('bulkFileMeta');
    const btnRemoveFile = document.getElementById('btnRemoveFile');

    const bulkAlertBox = document.getElementById('bulkAlertBox');
    const bulkAlertMessage = document.getElementById('bulkAlertMessage');

    const bulkPreviewCard = document.getElementById('bulkPreviewCard');
    const statTotalStudents = document.getElementById('statTotalStudents');
    const statValidCertificates = document.getElementById('statValidCertificates');
    const statErrorRows = document.getElementById('statErrorRows');

    const bulkProgressSection = document.getElementById('bulkProgressSection');
    const progressStatusText = document.getElementById('progressStatusText');
    const progressPercentText = document.getElementById('progressPercentText');
    const progressBarFill = document.getElementById('progressBarFill');

    const tableRecordCount = document.getElementById('tableRecordCount');
    const btnGenerateAll = document.getElementById('btnGenerateAll');
    const generateAllBtnText = document.getElementById('generateAllBtnText');
    const btnDownloadAllZip = document.getElementById('btnDownloadAllZip');
    const btnClearBatch = document.getElementById('btnClearBatch');
    const bulkStudentTableBody = document.getElementById('bulkStudentTableBody');

    // Modal References
    const previewModal = document.getElementById('previewModal');
    const modalStudentTitle = document.getElementById('modalStudentTitle');
    const modalStudentSubtitle = document.getElementById('modalStudentSubtitle');
    const modalPreviewImg = document.getElementById('modalPreviewImg');
    const btnModalClose = document.getElementById('btnModalClose');
    const btnModalClose2 = document.getElementById('btnModalClose2');
    const btnModalDownload = document.getElementById('btnModalDownload');

    // Bulk Mode State
    let parsedStudents = [];
    let isBulkGenerating = false;

    // ------------------------------------------------------------------------
    // Tab Switching
    // ------------------------------------------------------------------------
    function switchTab(mode) {
        if (mode === 'single') {
            tabBtnSingle.classList.add('active');
            tabBtnSingle.setAttribute('aria-selected', 'true');
            tabBtnBulk.classList.remove('active');
            tabBtnBulk.setAttribute('aria-selected', 'false');
            singleModeSection.style.display = 'flex';
            bulkModeSection.style.display = 'none';
            updateCertificateScale();
        } else {
            tabBtnBulk.classList.add('active');
            tabBtnBulk.setAttribute('aria-selected', 'true');
            tabBtnSingle.classList.remove('active');
            tabBtnSingle.setAttribute('aria-selected', 'false');
            bulkModeSection.style.display = 'flex';
            singleModeSection.style.display = 'none';
        }
    }

    tabBtnSingle.addEventListener('click', () => switchTab('single'));
    tabBtnBulk.addEventListener('click', () => switchTab('bulk'));

    // ------------------------------------------------------------------------
    // Apply configuration positions and styles to master certificate DOM
    // ------------------------------------------------------------------------
    function applyLockedPositions() {
        // Name
        certInternName.style.left = CERTIFICATE_POSITIONS.name.x;
        certInternName.style.top = CERTIFICATE_POSITIONS.name.y;
        certInternName.style.transform = 'translateX(-50%)';
        certInternName.style.color = CERTIFICATE_POSITIONS.name.color;
        certInternName.style.fontWeight = CERTIFICATE_POSITIONS.name.fontWeight;

        // Domain
        certDomain.style.left = CERTIFICATE_POSITIONS.domain.x;
        certDomain.style.top = CERTIFICATE_POSITIONS.domain.y;
        certDomain.style.transform = 'translateX(-50%)';
        certDomain.style.color = CERTIFICATE_POSITIONS.domain.color;
        certDomain.style.fontWeight = CERTIFICATE_POSITIONS.domain.fontWeight;

        // Duration
        certDuration.style.left = CERTIFICATE_POSITIONS.duration.x;
        certDuration.style.top = CERTIFICATE_POSITIONS.duration.y;
        certDuration.style.transform = 'translateX(-50%)';
        certDuration.style.color = CERTIFICATE_POSITIONS.duration.color;
        certDuration.style.fontWeight = CERTIFICATE_POSITIONS.duration.fontWeight;

        // Certificate Number
        certNumber.style.left = CERTIFICATE_POSITIONS.certificateNumber.x;
        certNumber.style.top = CERTIFICATE_POSITIONS.certificateNumber.y;
        certNumber.style.transform = 'translateX(-50%)';
        certNumber.style.color = CERTIFICATE_POSITIONS.certificateNumber.color;
        certNumber.style.fontWeight = CERTIFICATE_POSITIONS.certificateNumber.fontWeight;
    }
    applyLockedPositions();

    // ------------------------------------------------------------------------
    // Responsive Preview Scaling (1600x900 Fixed Canvas)
    // ------------------------------------------------------------------------
    function updateCertificateScale() {
        if (!stageWrapper || stageWrapper.style.display === 'none') return;
        
        const parent = stageWrapper.parentElement;
        if (!parent) return;
        const computed = window.getComputedStyle(parent);
        const paddingLeft = parseFloat(computed.paddingLeft) || 0;
        const paddingRight = parseFloat(computed.paddingRight) || 0;
        const availableWidth = parent.clientWidth - paddingLeft - paddingRight;
        const targetWidth = Math.max(280, Math.min(availableWidth, CERTIFICATE_POSITIONS.canvas.width));
        const scale = targetWidth / CERTIFICATE_POSITIONS.canvas.width;

        certificateScaler.style.transform = `scale(${scale})`;
        stageWrapper.style.width = `${targetWidth}px`;
        stageWrapper.style.height = `${Math.round(CERTIFICATE_POSITIONS.canvas.height * scale)}px`;
    }

    window.addEventListener('resize', updateCertificateScale);

    // ------------------------------------------------------------------------
    // Dynamic Font Sizing for Long Names and Domains
    // ------------------------------------------------------------------------
    function fitTextElement(element, baseFontSize, minFontSize, maxWidthPx) {
        element.style.fontSize = `${baseFontSize}px`;
        let currentSize = baseFontSize;

        while (element.scrollWidth > maxWidthPx && currentSize > minFontSize) {
            currentSize -= 0.5;
            element.style.fontSize = `${currentSize}px`;
        }
    }

    // ------------------------------------------------------------------------
    // Validation Helper (Single Mode)
    // ------------------------------------------------------------------------
    function clearAlert() {
        alertBox.style.display = 'none';
        [inputInternName, inputDomainProgram, inputDuration, inputCertNumber].forEach(input => {
            input.classList.remove('input-error');
        });
    }

    function showAlert(message) {
        alertMessage.textContent = message;
        alertBox.style.display = 'flex';
        alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    [inputInternName, inputDomainProgram, inputDuration, inputCertNumber].forEach(input => {
        input.addEventListener('input', () => {
            if (input.classList.contains('input-error')) {
                input.classList.remove('input-error');
            }
            if (alertBox.style.display !== 'none') {
                clearAlert();
            }
        });
    });

    // ------------------------------------------------------------------------
    // Direct Canvas Fallback Renderer (Zero-Taint Guaranteed)
    // ------------------------------------------------------------------------
    async function renderCertificateDirectCanvas(data) {
        const scale = 3; // 4800x2700 Ultra-HD 300+ DPI
        const width = CERTIFICATE_POSITIONS.canvas.width;
        const height = CERTIFICATE_POSITIONS.canvas.height;
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d', { alpha: false });

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.scale(scale, scale);

        if (document.fonts && document.fonts.ready) {
            try { await document.fonts.ready; } catch(e) {}
        }

        const bgImg = new Image();
        bgImg.src = window.CERTIFICATE_BACKGROUND_BASE64 || 'assets/certificate-background.png';
        if (!bgImg.complete) {
            await new Promise((resolve, reject) => {
                bgImg.onload = resolve;
                bgImg.onerror = reject;
            });
        }
        ctx.drawImage(bgImg, 0, 0, width, height);

        function drawFittedText({ text, x, y, maxWidth, baseSize, minSize, color, align = 'center' }) {
            ctx.fillStyle = color;
            ctx.textAlign = align;
            ctx.textBaseline = 'alphabetic';

            let size = baseSize;
            while (size > minSize) {
                ctx.font = `${size}px "CertificateTimes", "Times New Roman", Times, serif`;
                if (ctx.measureText(text).width <= maxWidth) break;
                size--;
            }
            ctx.font = `${size}px "CertificateTimes", "Times New Roman", Times, serif`;
            ctx.fillText(text, x, y);
        }

        drawFittedText({
            text: data.name || '',
            x: 800,
            y: 362,
            maxWidth: CERTIFICATE_POSITIONS.name.maxWidth,
            baseSize: CERTIFICATE_POSITIONS.name.baseFontSize,
            minSize: CERTIFICATE_POSITIONS.name.minFontSize,
            color: CERTIFICATE_POSITIONS.name.color
        });

        drawFittedText({
            text: data.domain || '',
            x: 800,
            y: 508,
            maxWidth: CERTIFICATE_POSITIONS.domain.maxWidth,
            baseSize: CERTIFICATE_POSITIONS.domain.baseFontSize,
            minSize: CERTIFICATE_POSITIONS.domain.minFontSize,
            color: CERTIFICATE_POSITIONS.domain.color
        });

        drawFittedText({
            text: data.duration || '',
            x: 426,
            y: 686,
            maxWidth: CERTIFICATE_POSITIONS.duration.maxWidth,
            baseSize: CERTIFICATE_POSITIONS.duration.baseFontSize,
            minSize: CERTIFICATE_POSITIONS.duration.minFontSize,
            color: CERTIFICATE_POSITIONS.duration.color
        });

        drawFittedText({
            text: data.certNo || data.certificateNumber || '',
            x: 1130,
            y: 682,
            maxWidth: CERTIFICATE_POSITIONS.certificateNumber.maxWidth,
            baseSize: CERTIFICATE_POSITIONS.certificateNumber.baseFontSize,
            minSize: CERTIFICATE_POSITIONS.certificateNumber.minFontSize,
            color: CERTIFICATE_POSITIONS.certificateNumber.color
        });

        return canvas;
    }

    /**
     * Master Certificate Image Renderer
     * Uses #renderCertificate in the dedicated off-screen stage (#masterRenderStage).
     * Guaranteed 1600x900 resolution in all tabs (Single & Bulk modes).
     * Automatic check ensures no empty/blank image is ever produced.
     */
    async function captureCertificateImage(data) {
        let imgData = null;

        try {
            if (renderCertificate && typeof window.html2canvas === 'function') {
                renderInternName.textContent = data.name || '';
                renderDomain.textContent = data.domain || '';
                renderDuration.textContent = data.duration || '';
                renderNumber.textContent = data.certNo || data.certificateNumber || '';

                fitTextElement(
                    renderInternName,
                    CERTIFICATE_POSITIONS.name.baseFontSize,
                    CERTIFICATE_POSITIONS.name.minFontSize,
                    CERTIFICATE_POSITIONS.name.maxWidth
                );
                fitTextElement(
                    renderDomain,
                    CERTIFICATE_POSITIONS.domain.baseFontSize,
                    CERTIFICATE_POSITIONS.domain.minFontSize,
                    CERTIFICATE_POSITIONS.domain.maxWidth
                );
                fitTextElement(
                    renderDuration,
                    CERTIFICATE_POSITIONS.duration.baseFontSize,
                    CERTIFICATE_POSITIONS.duration.minFontSize,
                    CERTIFICATE_POSITIONS.duration.maxWidth
                );
                fitTextElement(
                    renderNumber,
                    CERTIFICATE_POSITIONS.certificateNumber.baseFontSize,
                    CERTIFICATE_POSITIONS.certificateNumber.minFontSize,
                    CERTIFICATE_POSITIONS.certificateNumber.maxWidth
                );

                // Small tick to ensure reflow
                await new Promise(r => setTimeout(r, 10));

                const canvas = await window.html2canvas(renderCertificate, {
                    scale: 3, // 4800x2700 Ultra-HD 300+ DPI
                    useCORS: true,
                    allowTaint: false,
                    logging: false,
                    backgroundColor: '#ffffff',
                    width: CERTIFICATE_POSITIONS.canvas.width,
                    height: CERTIFICATE_POSITIONS.canvas.height,
                    windowWidth: CERTIFICATE_POSITIONS.canvas.width,
                    windowHeight: CERTIFICATE_POSITIONS.canvas.height,
                    imageTimeout: 0
                });

                imgData = canvas.toDataURL('image/png', 1.0);
            }
        } catch (err) {
            console.warn('html2canvas rendering notice:', err);
        }

        // Failsafe: if html2canvas threw or produced an empty/blank image (< 50,000 bytes)
        if (!imgData || imgData.length < 50000) {
            console.warn('html2canvas output empty or invalid, applying high-res direct canvas renderer');
            const fallbackCanvas = await renderCertificateDirectCanvas(data);
            imgData = fallbackCanvas.toDataURL('image/png', 1.0);
        }

        return imgData;
    }

    // ------------------------------------------------------------------------
    // Background High-Resolution PDF Builder (Single Mode)
    // ------------------------------------------------------------------------
    async function buildPdfDocument() {
        if (!currentCertificateData) return null;

        const jsPDFClass = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
        if (!jsPDFClass) return null;

        try {
            const imgData = await captureCertificateImage(currentCertificateData);
            if (!imgData) throw new Error('Unable to capture certificate image');

            const pdf = new jsPDFClass({
                orientation: 'landscape',
                unit: 'px',
                format: [CERTIFICATE_POSITIONS.canvas.width, CERTIFICATE_POSITIONS.canvas.height],
                hotfixes: ['px_scaling'],
                compress: true
            });

            // Lossless Slow Deflate compression for maximum vector/raster clarity
            pdf.addImage(imgData, 'PNG', 0, 0, CERTIFICATE_POSITIONS.canvas.width, CERTIFICATE_POSITIONS.canvas.height, undefined, 'SLOW');

            const filename = formatStudentFilename(currentCertificateData.name);
            const blob = pdf.output('blob');

            if (cachedPdfUrl) {
                URL.revokeObjectURL(cachedPdfUrl);
            }
            cachedPdfBlob = blob;
            cachedPdfUrl = URL.createObjectURL(blob);
            cachedFilename = filename;

            if (directDownloadLink && viewPdfLink) {
                directDownloadLink.href = cachedPdfUrl;
                directDownloadLink.download = cachedFilename;
                viewPdfLink.href = cachedPdfUrl;
            }

            return { pdf, blob, filename, url: cachedPdfUrl };
        } catch (err) {
            console.error('Error constructing PDF:', err);
            return null;
        }
    }

    // ------------------------------------------------------------------------
    // Certificate Generation (Single Mode)
    // ------------------------------------------------------------------------
    function generateCertificate() {
        clearAlert();

        const name = inputInternName.value.trim();
        const domain = inputDomainProgram.value.trim();
        const duration = inputDuration.value.trim();
        let certNo = inputCertNumber.value.trim().replace(/\s+/g, ' ');

        let hasError = false;
        if (!name) {
            inputInternName.classList.add('input-error');
            hasError = true;
        }
        if (!domain) {
            inputDomainProgram.classList.add('input-error');
            hasError = true;
        }
        if (!duration) {
            inputDuration.classList.add('input-error');
            hasError = true;
        }
        if (!certNo) {
            inputCertNumber.classList.add('input-error');
            hasError = true;
        }

        if (hasError) {
            showAlert('Please fill in all certificate details.');
            return false;
        }

        // Show stage first so layout dimensions are measurable
        emptyPreviewPlaceholder.style.display = 'none';
        stageWrapper.style.display = 'block';
        updateCertificateScale();

        // Apply dynamic field values
        certInternName.textContent = name;
        certDomain.textContent = domain;
        certDuration.textContent = duration;
        certNumber.textContent = certNo;

        // Auto-scale fonts according to CERTIFICATE_POSITIONS configuration
        fitTextElement(
            certInternName,
            CERTIFICATE_POSITIONS.name.baseFontSize,
            CERTIFICATE_POSITIONS.name.minFontSize,
            CERTIFICATE_POSITIONS.name.maxWidth
        );
        fitTextElement(
            certDomain,
            CERTIFICATE_POSITIONS.domain.baseFontSize,
            CERTIFICATE_POSITIONS.domain.minFontSize,
            CERTIFICATE_POSITIONS.domain.maxWidth
        );
        fitTextElement(
            certDuration,
            CERTIFICATE_POSITIONS.duration.baseFontSize,
            CERTIFICATE_POSITIONS.duration.minFontSize,
            CERTIFICATE_POSITIONS.duration.maxWidth
        );
        fitTextElement(
            certNumber,
            CERTIFICATE_POSITIONS.certificateNumber.baseFontSize,
            CERTIFICATE_POSITIONS.certificateNumber.minFontSize,
            CERTIFICATE_POSITIONS.certificateNumber.maxWidth
        );

        // Enable download button
        btnDownload.disabled = false;
        isCertificateGenerated = true;
        currentCertificateData = { name, domain, duration, certNo };

        statusLabel.textContent = 'Preview Ready';
        statusLabel.parentElement.querySelector('.status-indicator').className = 'status-indicator ready';

        // Pre-build PDF document in background so downloading is immediate
        setTimeout(() => {
            buildPdfDocument();
        }, 120);

        previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
    }

    btnGenerate.addEventListener('click', generateCertificate);

    form.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            generateCertificate();
        }
    });

    // ------------------------------------------------------------------------
    // High-Resolution PDF Download (Single Mode)
    // ------------------------------------------------------------------------
    async function downloadCertificatePDF() {
        clearAlert();

        const name = inputInternName.value.trim();
        const domain = inputDomainProgram.value.trim();
        const duration = inputDuration.value.trim();
        const certNo = inputCertNumber.value.trim().replace(/\s+/g, ' ');

        const dataChanged = !currentCertificateData ||
            currentCertificateData.name !== name ||
            currentCertificateData.domain !== domain ||
            currentCertificateData.duration !== duration ||
            currentCertificateData.certNo !== certNo;

        // If not yet generated or values changed, generate first
        if (!isCertificateGenerated || dataChanged) {
            const ok = generateCertificate();
            if (!ok) return;
        }

        const jsPDFClass = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
        if (typeof window.html2canvas !== 'function' || !jsPDFClass) {
            showAlert('PDF Generation engine is initializing. Please wait a moment and try again.');
            return;
        }

        btnDownload.disabled = true;
        const originalText = downloadBtnText.textContent;
        downloadBtnText.textContent = 'Downloading PDF...';
        statusLabel.textContent = 'Preparing PDF...';
        statusLabel.parentElement.querySelector('.status-indicator').className = 'status-indicator generating';

        try {
            let pdfData = null;
            if (cachedPdfBlob && cachedPdfUrl && cachedFilename && !dataChanged) {
                pdfData = { blob: cachedPdfBlob, filename: cachedFilename, url: cachedPdfUrl };
            } else {
                pdfData = await buildPdfDocument();
            }

            if (!pdfData) {
                throw new Error('Unable to construct PDF file.');
            }

            const { filename, url } = pdfData;

            // Trigger immediate synchronous download
            const downloadLink = document.createElement('a');
            downloadLink.style.display = 'none';
            downloadLink.href = url;
            downloadLink.download = filename;
            downloadLink.rel = 'noopener';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            setTimeout(() => {
                if (downloadLink.parentNode) {
                    downloadLink.parentNode.removeChild(downloadLink);
                }
            }, 1000);

            // Display success and fallback action notice
            if (downloadNotice) {
                downloadNotice.style.display = 'flex';
                if (directDownloadLink) {
                    directDownloadLink.href = url;
                    directDownloadLink.download = filename;
                }
                if (viewPdfLink) {
                    viewPdfLink.href = url;
                }
            }

            statusLabel.textContent = 'Downloaded Successfully';
            statusLabel.parentElement.querySelector('.status-indicator').className = 'status-indicator ready';
        } catch (error) {
            console.error('PDF Generation Error:', error);
            showAlert('An error occurred during PDF generation. Please try again.');
            statusLabel.textContent = 'Generation Failed';
        } finally {
            btnDownload.disabled = false;
            downloadBtnText.textContent = originalText;
        }
    }

    btnDownload.addEventListener('click', downloadCertificatePDF);

    // ------------------------------------------------------------------------
    // Reset Button (Single Mode)
    // ------------------------------------------------------------------------
    function resetForm() {
        form.reset();
        clearAlert();

        certInternName.textContent = '';
        certDomain.textContent = '';
        certDuration.textContent = '';
        certNumber.textContent = '';

        stageWrapper.style.display = 'none';
        emptyPreviewPlaceholder.style.display = 'flex';

        if (downloadNotice) {
            downloadNotice.style.display = 'none';
        }

        if (cachedPdfUrl) {
            URL.revokeObjectURL(cachedPdfUrl);
            cachedPdfUrl = null;
        }
        cachedPdfBlob = null;
        cachedFilename = '';

        btnDownload.disabled = false;
        isCertificateGenerated = false;
        currentCertificateData = null;

        statusLabel.textContent = 'Awaiting Generation';
        statusLabel.parentElement.querySelector('.status-indicator').className = 'status-indicator';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    btnReset.addEventListener('click', resetForm);

    // Fill Demo Data Helper
    btnFillDemo.addEventListener('click', () => {
        clearAlert();
        inputInternName.value = 'DHINESH P';
        inputDomainProgram.value = 'Full Stack Web Development';
        inputDuration.value = '01 June 2026 - 30 June 2026';
        inputCertNumber.value = 'TEAMACY-INT-2026-001';

        generateCertificate();
    });

    // ========================================================================
    // BULK CERTIFICATE GENERATION LOGIC (EXCEL AUTOMATION)
    // ========================================================================

    // ------------------------------------------------------------------------
    // Download Sample Excel Template
    // ------------------------------------------------------------------------
    function downloadExcelTemplate() {
        if (typeof window.XLSX === 'undefined') {
            showAlert('Excel engine is still loading. Please try again in a moment.');
            return;
        }

        const templateData = [
            ['Name', 'Domain', 'Duration', 'Certificate Number'],
            ['DHINESH P', 'Full Stack Web Development', '01 June 2026 - 30 June 2026', 'TEAMACY-INT-2026-001'],
            ['ARUN KUMAR', 'Python Development', '01 June 2026 - 30 June 2026', 'TEAMACY-INT-2026-002'],
            ['PRIYA S', 'UI/UX Design', '01 June 2026 - 30 June 2026', 'TEAMACY-INT-2026-003']
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(templateData);
        worksheet['!cols'] = [
            { wch: 20 },
            { wch: 32 },
            { wch: 32 },
            { wch: 25 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Teamacy_Interns');
        XLSX.writeFile(workbook, 'Teamacy_Internship_Template.xlsx');
    }

    btnDownloadTemplate.addEventListener('click', downloadExcelTemplate);

    // ------------------------------------------------------------------------
    // Drag & Drop / File Input Handling
    // ------------------------------------------------------------------------
    btnChooseFile.addEventListener('click', (e) => {
        e.stopPropagation();
        excelFileInput.click();
    });

    bulkDropZone.addEventListener('click', () => {
        excelFileInput.click();
    });

    bulkDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        bulkDropZone.classList.add('drag-active');
    });

    bulkDropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        bulkDropZone.classList.remove('drag-active');
    });

    bulkDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        bulkDropZone.classList.remove('drag-active');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleUploadedFile(e.dataTransfer.files[0]);
        }
    });

    excelFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleUploadedFile(e.target.files[0]);
        }
    });

    btnRemoveFile.addEventListener('click', () => {
        clearBulkBatch();
    });

    function showBulkAlert(message, isHtml = false) {
        if (isHtml) {
            bulkAlertMessage.innerHTML = message;
        } else {
            bulkAlertMessage.textContent = message;
        }
        bulkAlertBox.style.display = 'flex';
        bulkAlertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function clearBulkAlert() {
        bulkAlertBox.style.display = 'none';
        bulkAlertMessage.innerHTML = '';
    }

    // ------------------------------------------------------------------------
    // Excel Validation & Parsing
    // ------------------------------------------------------------------------
    function handleUploadedFile(file) {
        clearBulkAlert();

        const ext = file.name.split('.').pop().toLowerCase();
        if (!['xlsx', 'xls', 'csv'].includes(ext)) {
            showBulkAlert('Unsupported file format. Please upload an Excel (.xlsx, .xls) or CSV file.');
            return;
        }

        if (typeof window.XLSX === 'undefined') {
            showBulkAlert('Excel processing engine is initializing. Please wait a few seconds and try again.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                    showBulkAlert('The uploaded spreadsheet contains no sheets.');
                    return;
                }

                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

                if (!rawRows || rawRows.length < 2) {
                    showBulkAlert('The uploaded spreadsheet contains no student data rows.');
                    return;
                }

                // 1. Locate header row (first non-empty row)
                let headerRowIndex = 0;
                while (headerRowIndex < rawRows.length && rawRows[headerRowIndex].every(c => !String(c).trim())) {
                    headerRowIndex++;
                }

                if (headerRowIndex >= rawRows.length) {
                    showBulkAlert('Could not find header row in the uploaded spreadsheet.');
                    return;
                }

                const headerRow = rawRows[headerRowIndex].map(h => String(h || '').trim());

                // 2. Identify required columns (case-insensitive & trimmed)
                let nameCol = -1, domainCol = -1, durationCol = -1, certNoCol = -1;
                headerRow.forEach((col, idx) => {
                    const norm = col.toLowerCase().replace(/[^a-z0-9]/g, '');
                    if (norm === 'name' || norm === 'internname' || norm === 'studentname') nameCol = idx;
                    else if (norm === 'domain' || norm === 'program' || norm === 'domainprogram' || norm === 'internshipdomain') domainCol = idx;
                    else if (norm === 'duration' || norm === 'period' || norm === 'dates' || norm === 'startdateenddate') durationCol = idx;
                    else if (norm === 'certificatenumber' || norm === 'certificateno' || norm === 'certnumber' || norm === 'certno') certNoCol = idx;
                });

                // 3. Strict Header Validation
                if (nameCol === -1 || domainCol === -1 || durationCol === -1 || certNoCol === -1) {
                    showBulkAlert('Invalid Excel format. Required columns are:\nName, Domain, Duration, Certificate Number');
                    return;
                }

                // 4. Parse Student Data Rows
                parsedStudents = [];
                const existingFilenames = new Set();
                const rowErrors = [];

                for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
                    const row = rawRows[i];
                    if (!row || row.every(cell => !String(cell).trim())) {
                        continue; // Ignore completely empty rows
                    }

                    const actualRowNum = i + 1;
                    const name = String(row[nameCol] || '').trim();
                    const domain = String(row[domainCol] || '').trim();
                    const duration = String(row[durationCol] || '').trim();
                    const certNo = String(row[certNoCol] || '').trim();

                    const missing = [];
                    if (!name) missing.push('Name');
                    if (!domain) missing.push('Domain');
                    if (!duration) missing.push('Duration');
                    if (!certNo) missing.push('Certificate Number');

                    const filename = name ? formatStudentFilename(name, existingFilenames) : '';

                    const student = {
                        id: parsedStudents.length + 1,
                        rowNum: actualRowNum,
                        name,
                        domain,
                        duration,
                        certNo,
                        filename,
                        status: missing.length === 0 ? 'ready' : 'error',
                        errorMsg: missing.length > 0 ? `Row ${actualRowNum}: Missing ${missing.join(', ')}` : '',
                        pdfBlob: null,
                        pdfUrl: null,
                        previewDataUrl: null
                    };

                    if (missing.length > 0) {
                        rowErrors.push(student.errorMsg);
                    }

                    parsedStudents.push(student);
                }

                if (parsedStudents.length === 0) {
                    showBulkAlert('No student data rows found in the uploaded file.');
                    return;
                }

                // Update File Chip UI
                bulkFileName.textContent = file.name;
                bulkFileMeta.textContent = `${(file.size / 1024).toFixed(1)} KB • ${parsedStudents.length} rows detected`;
                bulkFileChip.style.display = 'flex';
                bulkDropZone.style.display = 'none';

                // Display row-level errors if any exist without crashing
                if (rowErrors.length > 0) {
                    const errorSummary = `
                        <strong>Some rows have missing information:</strong>
                        ${rowErrors.slice(0, 5).map(err => `<div class="alert-row-error">• ${err}</div>`).join('')}
                        ${rowErrors.length > 5 ? `<div class="alert-row-error">...and ${rowErrors.length - 5} more error rows.</div>` : ''}
                    `;
                    showBulkAlert(errorSummary, true);
                }

                // Render Preview Table and Stats
                renderBulkTable();
                bulkPreviewCard.style.display = 'block';
                updateBulkStats();

            } catch (err) {
                console.error('Excel parse error:', err);
                showBulkAlert('Error parsing Excel file. Please ensure it is a valid .xlsx, .xls, or .csv document.');
            }
        };

        reader.readAsArrayBuffer(file);
    }

    // ------------------------------------------------------------------------
    // Render Bulk Student Table
    // ------------------------------------------------------------------------
    function renderBulkTable() {
        bulkStudentTableBody.innerHTML = '';
        tableRecordCount.textContent = parsedStudents.length;

        parsedStudents.forEach((student, index) => {
            const tr = document.createElement('tr');
            tr.id = `bulk-row-${student.id}`;

            let statusPill = '';
            if (student.status === 'ready') {
                statusPill = `<span class="status-pill ready">Ready</span>`;
            } else if (student.status === 'processing') {
                statusPill = `<span class="status-pill processing">Processing...</span>`;
            } else if (student.status === 'generated') {
                statusPill = `<span class="status-pill generated">Generated</span>`;
            } else {
                statusPill = `<span class="status-pill error" title="${student.errorMsg}">${student.errorMsg ? student.errorMsg : 'Error'}</span>`;
            }

            let actionHtml = '';
            if (student.status === 'generated') {
                actionHtml = `
                    <div class="table-action-group">
                        <button type="button" class="btn-row-action" onclick="window.previewBulkStudent(${student.id})" title="Preview certificate">
                            Preview
                        </button>
                        <button type="button" class="btn-row-action btn-row-download" onclick="window.downloadBulkStudent(${student.id})" title="Download ${student.filename}">
                            Download
                        </button>
                    </div>
                `;
            } else if (student.status === 'error') {
                actionHtml = `
                    <div class="table-action-group">
                        <span style="font-size: 0.8rem; color: #dc2626;">Invalid row</span>
                    </div>
                `;
            } else {
                actionHtml = `
                    <div class="table-action-group">
                        <span style="font-size: 0.8rem; color: #64748b;">Awaiting generation</span>
                    </div>
                `;
            }

            tr.innerHTML = `
                <td><strong>${index + 1}</strong></td>
                <td><strong>${escapeHtml(student.name || '—')}</strong></td>
                <td>${escapeHtml(student.domain || '—')}</td>
                <td>${escapeHtml(student.duration || '—')}</td>
                <td><code>${escapeHtml(student.certNo || '—')}</code></td>
                <td>${statusPill}</td>
                <td style="text-align: right;">${actionHtml}</td>
            `;

            bulkStudentTableBody.appendChild(tr);
        });
    }

    function updateBulkStats() {
        const total = parsedStudents.length;
        const valid = parsedStudents.filter(s => s.status === 'ready' || s.status === 'generated').length;
        const errors = parsedStudents.filter(s => s.status === 'error').length;

        statTotalStudents.textContent = total;
        statValidCertificates.textContent = valid;
        statErrorRows.textContent = errors;

        btnGenerateAll.disabled = valid === 0 || isBulkGenerating;
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function updateRowStatus(studentId, newStatus, pillText) {
        const student = parsedStudents.find(s => s.id === studentId);
        if (!student) return;
        student.status = newStatus;

        const tr = document.getElementById(`bulk-row-${studentId}`);
        if (!tr) return;

        const statusTd = tr.children[5];
        const actionTd = tr.children[6];

        if (statusTd) {
            statusTd.innerHTML = `<span class="status-pill ${newStatus}">${pillText}</span>`;
        }

        if (actionTd) {
            if (newStatus === 'generated') {
                actionTd.innerHTML = `
                    <div class="table-action-group">
                        <button type="button" class="btn-row-action" onclick="window.previewBulkStudent(${student.id})" title="Preview certificate">
                            Preview
                        </button>
                        <button type="button" class="btn-row-action btn-row-download" onclick="window.downloadBulkStudent(${student.id})" title="Download ${student.filename}">
                            Download
                        </button>
                    </div>
                `;
            } else if (newStatus === 'error') {
                actionTd.innerHTML = `
                    <div class="table-action-group">
                        <button type="button" class="btn-row-action btn-row-retry" onclick="window.retryBulkStudent(${student.id})">
                            Retry
                        </button>
                    </div>
                `;
            } else if (newStatus === 'processing') {
                actionTd.innerHTML = `<span style="font-size:0.8rem; color:#2563eb;">Generating...</span>`;
            }
        }
    }

    // ------------------------------------------------------------------------
    // Generate All Certificates (Sequential & Memory-Safe)
    // ------------------------------------------------------------------------
    async function generateAllCertificates() {
        if (!parsedStudents || parsedStudents.length === 0 || isBulkGenerating) return;

        const studentsToProcess = parsedStudents.filter(s => s.status === 'ready' || s.status === 'error_retry');
        if (studentsToProcess.length === 0) {
            showBulkAlert('No valid students available to generate certificates for.');
            return;
        }

        isBulkGenerating = true;
        btnGenerateAll.disabled = true;
        generateAllBtnText.textContent = 'Generating Certificates...';
        bulkProgressSection.style.display = 'flex';
        btnDownloadAllZip.style.display = 'none';

        let completed = 0;
        let failed = 0;
        const total = studentsToProcess.length;

        // Ensure master certificate element is available in DOM for rendering
        const originalStageDisplay = stageWrapper.style.display;
        stageWrapper.style.display = 'block';

        const jsPDFClass = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;

        for (let i = 0; i < parsedStudents.length; i++) {
            const student = parsedStudents[i];
            if (student.status !== 'ready' && student.status !== 'error_retry') {
                continue;
            }

            // Update Progress Bar
            const percent = Math.round((completed / total) * 100);
            progressPercentText.textContent = `${percent}%`;
            progressBarFill.style.width = `${percent}%`;
            progressStatusText.textContent = `Generating certificates... ${completed} / ${total} completed`;

            updateRowStatus(student.id, 'processing', 'Generating...');

            try {
                // Render unscaled certificate using dedicated off-screen container + failsafe
                const imgData = await captureCertificateImage(student);
                if (!imgData) throw new Error('Unable to capture certificate image');

                // 4. Construct jsPDF instance (16:9 Landscape, zero margins)
                const pdf = new jsPDFClass({
                    orientation: 'landscape',
                    unit: 'px',
                    format: [CERTIFICATE_POSITIONS.canvas.width, CERTIFICATE_POSITIONS.canvas.height],
                    hotfixes: ['px_scaling'],
                    compress: true
                });

                // Lossless Slow Deflate compression for maximum vector/raster clarity
                pdf.addImage(imgData, 'PNG', 0, 0, CERTIFICATE_POSITIONS.canvas.width, CERTIFICATE_POSITIONS.canvas.height, undefined, 'SLOW');
                const blob = pdf.output('blob');

                // 5. Store generated PDF blob & cached preview image
                if (student.pdfUrl) {
                    URL.revokeObjectURL(student.pdfUrl);
                }
                student.pdfBlob = blob;
                student.pdfUrl = URL.createObjectURL(blob);
                student.previewDataUrl = imgData;

                completed++;
                updateRowStatus(student.id, 'generated', 'Generated');

            } catch (err) {
                console.error(`Error generating certificate for row ${student.rowNum} (${student.name}):`, err);
                student.errorMsg = err.message || 'Generation failed';
                failed++;
                updateRowStatus(student.id, 'error', 'Failed');
            }

            // Yield control to keep browser completely responsive
            await new Promise(r => setTimeout(r, 15));
        }

        // Restore master stage display
        stageWrapper.style.display = originalStageDisplay;

        // Completion state
        const finalPercent = 100;
        progressPercentText.textContent = `${finalPercent}%`;
        progressBarFill.style.width = '100%';
        progressStatusText.textContent = `${completed} certificate${completed === 1 ? '' : 's'} generated successfully.${failed > 0 ? ` (${failed} failed)` : ''}`;

        isBulkGenerating = false;
        btnGenerateAll.disabled = false;
        generateAllBtnText.textContent = 'Re-generate All Certificates';

        if (completed > 0) {
            btnDownloadAllZip.style.display = 'inline-flex';
        }

        updateBulkStats();
    }

    btnGenerateAll.addEventListener('click', generateAllCertificates);

    // ------------------------------------------------------------------------
    // Individual Bulk Download & Preview Window Actions
    // ------------------------------------------------------------------------
    window.downloadBulkStudent = function(studentId) {
        const student = parsedStudents.find(s => s.id === studentId);
        if (!student || !student.pdfBlob || !student.pdfUrl) return;

        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = student.pdfUrl;
        link.download = student.filename;
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            if (link.parentNode) link.parentNode.removeChild(link);
        }, 1000);
    };

    window.previewBulkStudent = function(studentId) {
        const student = parsedStudents.find(s => s.id === studentId);
        if (!student || !student.previewDataUrl) return;

        modalStudentTitle.textContent = `Certificate Preview — ${student.name}`;
        modalStudentSubtitle.textContent = `${student.domain} • ${student.certNo} • ${student.filename}`;
        modalPreviewImg.src = student.previewDataUrl;

        btnModalDownload.onclick = () => {
            window.downloadBulkStudent(student.id);
        };

        previewModal.style.display = 'flex';
    };

    window.retryBulkStudent = async function(studentId) {
        const student = parsedStudents.find(s => s.id === studentId);
        if (!student) return;
        student.status = 'error_retry';
        await generateAllCertificates();
    };

    // Modal Close
    btnModalClose.addEventListener('click', () => { previewModal.style.display = 'none'; });
    btnModalClose2.addEventListener('click', () => { previewModal.style.display = 'none'; });
    previewModal.addEventListener('click', (e) => {
        if (e.target === previewModal) previewModal.style.display = 'none';
    });

    // ------------------------------------------------------------------------
    // Download All as ZIP (JSZip)
    // ------------------------------------------------------------------------
    async function downloadAllCertificatesZip() {
        if (typeof window.JSZip === 'undefined') {
            showBulkAlert('ZIP archiving engine is loading. Please wait a moment and try again.');
            return;
        }

        const readyCertificates = parsedStudents.filter(s => s.status === 'generated' && s.pdfBlob);
        if (readyCertificates.length === 0) {
            showBulkAlert('No generated certificates available to package.');
            return;
        }

        btnDownloadAllZip.disabled = true;
        const originalBtnText = btnDownloadAllZip.innerHTML;
        btnDownloadAllZip.innerHTML = '<span>Packaging ZIP Archive...</span>';

        try {
            const zip = new JSZip();
            const folder = zip.folder('certificates');

            readyCertificates.forEach(student => {
                folder.file(student.filename, student.pdfBlob);
            });

            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            });

            const zipUrl = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = zipUrl;
            link.download = 'Teamacy_Internship_Certificates.zip';
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                if (link.parentNode) link.parentNode.removeChild(link);
                URL.revokeObjectURL(zipUrl);
            }, 10000);

        } catch (err) {
            console.error('ZIP generation error:', err);
            showBulkAlert('Failed to generate ZIP file: ' + err.message);
        } finally {
            btnDownloadAllZip.disabled = false;
            btnDownloadAllZip.innerHTML = originalBtnText;
        }
    }

    btnDownloadAllZip.addEventListener('click', downloadAllCertificatesZip);

    // ------------------------------------------------------------------------
    // Clear / Start New Batch
    // ------------------------------------------------------------------------
    function clearBulkBatch() {
        if (parsedStudents) {
            parsedStudents.forEach(s => {
                if (s.pdfUrl) URL.revokeObjectURL(s.pdfUrl);
            });
        }
        parsedStudents = [];
        excelFileInput.value = '';
        bulkFileChip.style.display = 'none';
        bulkDropZone.style.display = 'block';
        bulkPreviewCard.style.display = 'none';
        bulkProgressSection.style.display = 'none';
        btnDownloadAllZip.style.display = 'none';
        clearBulkAlert();

        statTotalStudents.textContent = '0';
        statValidCertificates.textContent = '0';
        statErrorRows.textContent = '0';
        bulkStudentTableBody.innerHTML = '';
        generateAllBtnText.textContent = 'Generate All Certificates';
    }

    btnClearBatch.addEventListener('click', clearBulkBatch);
});
