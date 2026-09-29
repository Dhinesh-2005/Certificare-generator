# Teamacy Official Internship Certificate Generator

A high-precision, web-based certificate generator built for **Teamacy** to issue official internship completion certificates for students and interns.

Designed and engineered with strict template locking to match the official Teamacy master certificate design down to the exact millimeter.

---

## Features

- **100% Fixed Master Template**: The official Teamacy layout, decorative wave gradients, border framing, diamond emblem, CEO and Trainer signatures, and QR verification elements are permanently locked.
- **Strict 4-Field Dynamic Input**:
  1. **Intern Name** (e.g. `DHINESH P`)
  2. **Domain / Program** (e.g. `Full Stack Web Development`)
  3. **Duration** (e.g. `01 June 2026 - 30 June 2026`)
  4. **Certificate Number** (e.g. `TEAMACY-INT-2026-001`)
- **Auto-Scaling Typography**: Intelligent font auto-scaling for long student names and domain titles, preventing overflow while maintaining perfect horizontal centering.
- **High-Resolution 16:9 PDF Export**: Produces crisp, publication-ready vector/raster PDFs at `1600 × 900` aspect ratio with zero page margins, zero distortion, and zero cropping.
- **Reliable Multi-Tier Download**: Features instant background caching, direct one-click download, and a fallback panel with direct download and new-tab PDF view links.
- **Zero Framework Overhead**: Built purely with standard **HTML5**, **Vanilla CSS3**, and **Vanilla JavaScript** (no Node.js, React, or backend server required).

---

## Project Structure

```
├── index.html                   # Main application portal & structure
├── style.css                    # Styling and master 1600x900 canvas layout
├── script.js                    # Position config, validation & PDF export logic
├── assets/
│   ├── certificate-background.png   # 3200x1800 master certificate artwork
│   ├── teamacy-logo.png             # Official Teamacy brand logo
│   └── fonts/                       # Embedded Times New Roman vector fonts
│       ├── times.ttf
│       └── timesbd.ttf
└── lib/
    ├── html2canvas.min.js       # Canvas rendering library
    └── jspdf.umd.min.js         # Client-side PDF generation
```

---

## Quick Start / Local Running

You can run the generator locally using any standard static web server:

### Option 1: Python HTTP Server
```bash
python -m http.server 8080
```
Then navigate to: `http://localhost:8080` in your web browser.

### Option 2: Direct File Execution
Open `index.html` directly in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

---

## Technical Specifications

- **Canvas Dimensions**: `1600px × 900px` (Exact 16:9 Landscape)
- **Primary Typeface**: `Times New Roman` (`CertificateTimes`)
- **Name Color**: `#00004a` (Deep Navy)
- **Domain Color**: `#00004a` (Harmonized with surrounding certificate text)
- **Duration / Cert No. Color**: `#000000` (Pitch Black)
- **Libraries**: `html2canvas` (v1.4.1), `jsPDF` (v2.5.1)

---

## License & Attribution

Official Internship Certification Authority &copy; 2026 Teamacy. St. Peter's College of Engineering And Technology Partnership.
