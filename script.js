/**
 * ============================================================================
 * TEAMACY OFFICIAL INTERNSHIP CERTIFICATE GENERATOR
 * Final Locked Master Implementation
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
        y: '324px',            // Vertical baseline above college text
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

document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------------------------------------------
    // DOM Element References
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

    // State
    let isCertificateGenerated = false;
    let currentCertificateData = null;
    let cachedPdfBlob = null;
    let cachedPdfUrl = null;
    let cachedFilename = '';

    // Apply configuration positions and styles to DOM elements
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
    // Validation Helper
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
    // Background High-Resolution PDF Builder
    // ------------------------------------------------------------------------
    async function buildPdfDocument() {
        if (!currentCertificateData) return null;
        if (typeof window.html2canvas !== 'function') return null;

        const jsPDFClass = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
        if (!jsPDFClass) return null;

        try {
            // Render unscaled master certificate DOM at scale: 2 (3200 x 1800 resolution)
            const canvas = await window.html2canvas(certificate, {
                scale: 2,
                useCORS: true,
                allowTaint: false,
                logging: false,
                backgroundColor: '#ffffff',
                width: CERTIFICATE_POSITIONS.canvas.width,
                height: CERTIFICATE_POSITIONS.canvas.height,
                onclone: (clonedDoc) => {
                    const clonedScaler = clonedDoc.getElementById('certificateScaler');
                    if (clonedScaler) clonedScaler.style.transform = 'none';
                    const clonedStage = clonedDoc.getElementById('stageWrapper');
                    if (clonedStage) {
                        clonedStage.style.width = `${CERTIFICATE_POSITIONS.canvas.width}px`;
                        clonedStage.style.height = `${CERTIFICATE_POSITIONS.canvas.height}px`;
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDFClass({
                orientation: 'landscape',
                unit: 'px',
                format: [CERTIFICATE_POSITIONS.canvas.width, CERTIFICATE_POSITIONS.canvas.height],
                hotfixes: ['px_scaling'],
                compress: true
            });

            pdf.addImage(imgData, 'PNG', 0, 0, CERTIFICATE_POSITIONS.canvas.width, CERTIFICATE_POSITIONS.canvas.height, undefined, 'FAST');

            const sanitizedName = currentCertificateData.name.replace(/[^a-zA-Z0-9_-]/g, '_');
            const sanitizedCertNo = currentCertificateData.certNo.replace(/[^a-zA-Z0-9_-]/g, '_');
            const filename = `Teamacy_Certificate_${sanitizedName}_${sanitizedCertNo}.pdf`;
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
    // Certificate Generation
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
    // High-Resolution PDF Download (Direct click + Fallback notice)
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
    // Reset Button
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

    // ------------------------------------------------------------------------
    // Fill Demo Data Helper
    // ------------------------------------------------------------------------
    btnFillDemo.addEventListener('click', () => {
        clearAlert();
        inputInternName.value = 'DHINESH P';
        inputDomainProgram.value = 'Full Stack Web Development';
        inputDuration.value = '01 June 2026 - 30 June 2026';
        inputCertNumber.value = 'TEAMACY-INT-2026-001';

        generateCertificate();
    });
});
