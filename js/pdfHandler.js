/**
 * PDF Handler - Load and render PDF pages to canvas
 */

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export class PDFHandler {
    constructor() {
        this.pdfDoc = null;
        this.pdfBytes = null;
        this.pageCount = 0;
        this.pageCache = new Map(); // Cache rendered pages
    }

    /**
     * Load a PDF from a File object
     * @param {File} file - PDF file to load
     * @returns {Promise<number>} - Number of pages
     */
    async loadFile(file) {
        const arrayBuffer = await file.arrayBuffer();
        this.pdfBytes = new Uint8Array(arrayBuffer);

        const loadingTask = pdfjsLib.getDocument({ data: this.pdfBytes });
        this.pdfDoc = await loadingTask.promise;
        this.pageCount = this.pdfDoc.numPages;
        this.pageCache.clear();

        return this.pageCount;
    }

    /**
     * Get the original PDF bytes
     * @returns {Uint8Array}
     */
    getPdfBytes() {
        return this.pdfBytes;
    }

    /**
     * Render a page to canvas and return image data
     * @param {number} pageNum - Page number (1-indexed)
     * @param {number} scale - Render scale (default 2 for good quality)
     * @returns {Promise<{canvas: HTMLCanvasElement, width: number, height: number}>}
     */
    async renderPage(pageNum, scale = 2) {
        if (!this.pdfDoc) {
            throw new Error('No PDF loaded');
        }

        const cacheKey = `${pageNum}-${scale}`;
        if (this.pageCache.has(cacheKey)) {
            return this.pageCache.get(cacheKey);
        }

        const page = await this.pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
            canvasContext: ctx,
            viewport: viewport
        }).promise;

        const result = {
            canvas,
            width: viewport.width,
            height: viewport.height,
            originalWidth: viewport.width / scale,
            originalHeight: viewport.height / scale
        };

        this.pageCache.set(cacheKey, result);
        return result;
    }

    /**
     * Get image data from a rendered page
     * @param {number} pageNum - Page number (1-indexed)
     * @param {number} scale - Render scale
     * @returns {Promise<ImageData>}
     */
    async getPageImageData(pageNum, scale = 2) {
        const { canvas } = await this.renderPage(pageNum, scale);
        const ctx = canvas.getContext('2d');
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    /**
     * Clear the page cache
     */
    clearCache() {
        this.pageCache.clear();
    }

    /**
     * Get total page count
     * @returns {number}
     */
    getPageCount() {
        return this.pageCount;
    }
}
