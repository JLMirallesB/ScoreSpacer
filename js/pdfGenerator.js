/**
 * PDF Generator - Create new PDF with spacing between systems on A4 pages
 */

const { PDFDocument, rgb, StandardFonts } = PDFLib;

export class PDFGenerator {
    constructor() {
        this.spacing = 150; // Default spacing in pixels (at render scale)

        // DIN A4 dimensions in PDF points (72 points per inch)
        // 210mm x 297mm = 595.28 x 841.89 points
        this.pageWidth = 595.28;
        this.pageHeight = 841.89;

        // Margins in points
        this.marginTop = 40;
        this.marginBottom = 40;
        this.marginLeft = 40;
        this.marginRight = 40;

        // Usable area
        this.contentWidth = this.pageWidth - this.marginLeft - this.marginRight;
        this.contentHeight = this.pageHeight - this.marginTop - this.marginBottom;

        // Watermark settings
        this.showWatermark = true;
        this.watermarkText = 'ScoreSpacer (www.jlmirall.es)';
    }

    /**
     * Set watermark visibility
     * @param {boolean} show - Whether to show watermark
     */
    setWatermark(show) {
        this.showWatermark = show;
    }

    /**
     * Set spacing amount
     * @param {number} spacing - Spacing in pixels (at render scale)
     */
    setSpacing(spacing) {
        this.spacing = spacing;
    }

    /**
     * Set margins
     * @param {Object} margins - {top, bottom, left, right} in points
     */
    setMargins(margins) {
        if (margins.top !== undefined) this.marginTop = margins.top;
        if (margins.bottom !== undefined) this.marginBottom = margins.bottom;
        if (margins.left !== undefined) this.marginLeft = margins.left;
        if (margins.right !== undefined) this.marginRight = margins.right;

        this.contentWidth = this.pageWidth - this.marginLeft - this.marginRight;
        this.contentHeight = this.pageHeight - this.marginTop - this.marginBottom;
    }

    /**
     * Generate PDF with systems distributed across A4 pages
     * Systems are never cut between pages
     * @param {Array<{pageNum: number, systems: Array<{start: number, end: number}>, canvas: HTMLCanvasElement, scale: number}>} pageAnalysis
     * @param {Function} progressCallback - Progress callback (0-100)
     * @returns {Promise<Uint8Array>} - PDF bytes
     */
    async generateA4(pageAnalysis, progressCallback = () => {}) {
        const pdfDoc = await PDFDocument.create();

        // Embed font for watermark
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Collect all systems from all pages with their images
        const allSystems = [];
        const totalOriginalPages = pageAnalysis.length;

        for (let i = 0; i < pageAnalysis.length; i++) {
            const { systems, canvas, scale, skipped } = pageAnalysis[i];
            progressCallback(Math.round((i / totalOriginalPages) * 40));

            if (skipped || systems.length === 0) {
                // For skipped pages or pages with no systems, add as full page
                // Scale to fit A4 width
                const sourceWidth = canvas.width;
                const sourceHeight = canvas.height;
                const fitScale = this.contentWidth / (sourceWidth / scale);
                const fittedHeight = (sourceHeight / scale) * fitScale;

                allSystems.push({
                    type: 'fullpage',
                    canvas: canvas,
                    scale: scale,
                    fittedHeight: fittedHeight,
                    originalPageNum: i + 1
                });
                continue;
            }

            // Calculate scale factor to fit content width
            const sourceWidth = canvas.width / scale; // Original width in points
            const fitScale = this.contentWidth / sourceWidth;

            // Extract each system
            for (let j = 0; j < systems.length; j++) {
                const system = systems[j];
                const systemCanvas = this.extractSystemFromCanvas(canvas, system.start, system.end);
                const systemHeightOriginal = (system.end - system.start) / scale;
                const fittedHeight = systemHeightOriginal * fitScale;

                allSystems.push({
                    type: 'system',
                    canvas: systemCanvas,
                    scale: scale,
                    fittedHeight: fittedHeight,
                    fitScale: fitScale,
                    originalPageNum: i + 1,
                    systemIndex: j
                });
            }
        }

        // Calculate spacing in points (convert from render pixels)
        // Assuming render scale of 2, spacing is specified in screen pixels
        const avgScale = pageAnalysis.length > 0 ? pageAnalysis[0].scale : 2;
        const sourceWidth = pageAnalysis.length > 0 ? pageAnalysis[0].canvas.width / avgScale : this.contentWidth;
        const fitScale = this.contentWidth / sourceWidth;
        const spacingPoints = (this.spacing / avgScale) * fitScale;

        // Distribute systems across A4 pages
        let currentPage = null;
        let currentY = this.pageHeight - this.marginTop; // Start from top
        let systemsOnCurrentPage = 0;

        for (let i = 0; i < allSystems.length; i++) {
            const item = allSystems[i];
            progressCallback(40 + Math.round((i / allSystems.length) * 50));

            if (item.type === 'fullpage') {
                // Full pages (skipped or no systems) go on their own page
                if (currentPage && systemsOnCurrentPage > 0) {
                    // Finish current page first
                }

                // Create new page and add the full image
                const page = pdfDoc.addPage([this.pageWidth, this.pageHeight]);
                const pngData = await this.canvasToArrayBuffer(item.canvas);
                const pngImage = await pdfDoc.embedPng(pngData);

                // Scale to fit width, center vertically if needed
                const imgAspect = pngImage.height / pngImage.width;
                const drawWidth = this.contentWidth;
                const drawHeight = drawWidth * imgAspect;

                const x = this.marginLeft;
                const y = this.pageHeight - this.marginTop - drawHeight;

                page.drawImage(pngImage, {
                    x: x,
                    y: Math.max(y, this.marginBottom),
                    width: drawWidth,
                    height: Math.min(drawHeight, this.contentHeight)
                });

                // Reset for next content
                currentPage = null;
                currentY = this.pageHeight - this.marginTop;
                systemsOnCurrentPage = 0;
                continue;
            }

            // Regular system
            const neededHeight = item.fittedHeight + (systemsOnCurrentPage > 0 ? spacingPoints : 0);
            const availableHeight = currentY - this.marginBottom;

            // Check if system fits on current page
            if (currentPage === null || neededHeight > availableHeight) {
                // Need a new page
                currentPage = pdfDoc.addPage([this.pageWidth, this.pageHeight]);
                currentY = this.pageHeight - this.marginTop;
                systemsOnCurrentPage = 0;

                // Fill page with white
                currentPage.drawRectangle({
                    x: 0,
                    y: 0,
                    width: this.pageWidth,
                    height: this.pageHeight,
                    color: rgb(1, 1, 1)
                });
            }

            // Add spacing if not first system on page
            if (systemsOnCurrentPage > 0) {
                currentY -= spacingPoints;
            }

            // Draw the system
            const pngData = await this.canvasToArrayBuffer(item.canvas);
            const pngImage = await pdfDoc.embedPng(pngData);

            currentY -= item.fittedHeight;

            currentPage.drawImage(pngImage, {
                x: this.marginLeft,
                y: currentY,
                width: this.contentWidth,
                height: item.fittedHeight
            });

            systemsOnCurrentPage++;
        }

        // Add watermark to all pages with systems (pages without full-page images)
        const pages = pdfDoc.getPages();
        for (const page of pages) {
            this.addWatermarkToPage(page, helveticaFont);
        }

        progressCallback(100);
        return await pdfDoc.save();
    }

    /**
     * Main generation method - uses A4 pagination
     */
    async generateWithCanvasMethod(pageAnalysis, progressCallback = () => {}) {
        return this.generateA4(pageAnalysis, progressCallback);
    }

    /**
     * Extract a horizontal strip from canvas
     * @param {HTMLCanvasElement} sourceCanvas
     * @param {number} startY
     * @param {number} endY
     * @returns {HTMLCanvasElement}
     */
    extractSystemFromCanvas(sourceCanvas, startY, endY) {
        const height = endY - startY;
        const canvas = document.createElement('canvas');
        canvas.width = sourceCanvas.width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Fill with white first (in case of any transparency)
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, height);

        ctx.drawImage(sourceCanvas,
            0, startY, sourceCanvas.width, height, // Source rectangle
            0, 0, sourceCanvas.width, height       // Destination rectangle
        );

        return canvas;
    }

    /**
     * Convert canvas to PNG ArrayBuffer
     * @param {HTMLCanvasElement} canvas
     * @returns {Promise<ArrayBuffer>}
     */
    canvasToArrayBuffer(canvas) {
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                blob.arrayBuffer().then(resolve);
            }, 'image/png');
        });
    }

    /**
     * Add a canvas as a full page image (legacy method)
     * @param {PDFDocument} pdfDoc
     * @param {HTMLCanvasElement} canvas
     */
    async addPageAsImage(pdfDoc, canvas) {
        const pngData = await this.canvasToArrayBuffer(canvas);
        const pngImage = await pdfDoc.embedPng(pngData);

        const page = pdfDoc.addPage([this.pageWidth, this.pageHeight]);

        // Scale to fit A4 width
        const imgAspect = pngImage.height / pngImage.width;
        const drawWidth = this.contentWidth;
        const drawHeight = drawWidth * imgAspect;

        page.drawImage(pngImage, {
            x: this.marginLeft,
            y: this.pageHeight - this.marginTop - Math.min(drawHeight, this.contentHeight),
            width: drawWidth,
            height: Math.min(drawHeight, this.contentHeight)
        });
    }

    /**
     * Add watermark to a page
     * @param {PDFPage} page
     * @param {PDFFont} font
     */
    addWatermarkToPage(page, font) {
        if (!this.showWatermark) return;

        const fontSize = 7;
        const textWidth = font.widthOfTextAtSize(this.watermarkText, fontSize);
        const x = this.pageWidth - this.marginRight - textWidth;

        page.drawText(this.watermarkText, {
            x: x,
            y: 12,
            size: fontSize,
            font: font,
            color: rgb(0.65, 0.65, 0.65),
            opacity: 0.7
        });
    }

    /**
     * Download PDF bytes as file
     * @param {Uint8Array} pdfBytes
     * @param {string} filename
     */
    downloadPdf(pdfBytes, filename = 'spaced_score.pdf') {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
