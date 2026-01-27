/**
 * Projection Profile - Horizontal projection analysis and system detection
 * Uses hybrid approach: left margin for detection, full width for boundary refinement
 */

export class ProjectionAnalyzer {
    constructor() {
        this.threshold = 5; // Percentage threshold for dark pixels
        this.minGap = 30; // Minimum gap between systems in pixels
        this.leftMarginRatio = 0.12; // Analyze 12% of left side for system detection
    }

    /**
     * Set detection parameters
     * @param {Object} params
     */
    setParams({ threshold, minGap, leftMarginRatio }) {
        if (threshold !== undefined) this.threshold = threshold;
        if (minGap !== undefined) this.minGap = minGap;
        if (leftMarginRatio !== undefined) this.leftMarginRatio = leftMarginRatio;
    }

    /**
     * Calculate horizontal projection profile for LEFT MARGIN only
     * This is where system braces/brackets are located - more reliable for detection
     * @param {ImageData} imageData
     * @returns {number[]} Array of pixel counts per row (left margin only)
     */
    calculateLeftMarginProjection(imageData) {
        const { data, width, height } = imageData;
        const marginWidth = Math.floor(width * this.leftMarginRatio);
        const projection = new Array(height).fill(0);

        for (let y = 0; y < height; y++) {
            let darkCount = 0;
            // Only scan the left margin
            for (let x = 0; x < marginWidth; x++) {
                const idx = (y * width + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];

                const gray = (r + g + b) / 3;
                if (gray < 128) {
                    darkCount++;
                }
            }
            projection[y] = darkCount;
        }

        return { projection, marginWidth };
    }

    /**
     * Calculate horizontal projection profile (full width)
     * Used for boundary refinement
     * @param {ImageData} imageData
     * @returns {number[]} Array of pixel counts per row
     */
    calculateProjection(imageData) {
        const { data, width, height } = imageData;
        const projection = new Array(height).fill(0);

        for (let y = 0; y < height; y++) {
            let darkCount = 0;
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];

                const gray = (r + g + b) / 3;
                if (gray < 128) {
                    darkCount++;
                }
            }
            projection[y] = darkCount;
        }

        return projection;
    }

    /**
     * Normalize projection to percentage of reference width
     * @param {number[]} projection
     * @param {number} width - Reference width for normalization
     * @returns {number[]} Normalized projection (0-100)
     */
    normalizeProjection(projection, width) {
        return projection.map(count => (count / width) * 100);
    }

    /**
     * Detect systems using left margin (where braces/brackets are)
     * @param {number[]} marginProjection - Left margin projection profile
     * @param {number} marginWidth - Width of the analyzed margin
     * @returns {Array<{start: number, end: number}>} Array of system boundaries
     */
    detectSystemsFromMargin(marginProjection, marginWidth) {
        // Use a higher threshold for margin since braces are dense
        const marginThreshold = this.threshold * 1.5;
        const normalized = this.normalizeProjection(marginProjection, marginWidth);
        const systems = [];
        let inSystem = false;
        let systemStart = 0;

        for (let y = 0; y < normalized.length; y++) {
            const isContent = normalized[y] >= marginThreshold;

            if (isContent && !inSystem) {
                inSystem = true;
                systemStart = y;
            } else if (!isContent && inSystem) {
                // Look ahead for gap
                let gapEnd = y;
                while (gapEnd < normalized.length &&
                       this.normalizeProjection([marginProjection[gapEnd]], marginWidth)[0] < marginThreshold) {
                    gapEnd++;
                }
                const gapSize = gapEnd - y;

                if (gapSize >= this.minGap || gapEnd >= normalized.length) {
                    systems.push({
                        start: systemStart,
                        end: y - 1
                    });
                    inSystem = false;
                }
            }
        }

        if (inSystem) {
            systems.push({
                start: systemStart,
                end: normalized.length - 1
            });
        }

        const minSystemHeight = 50;
        return systems.filter(s => (s.end - s.start) >= minSystemHeight);
    }

    /**
     * Detect systems from full projection profile (fallback/legacy method)
     * @param {number[]} projection - Raw projection profile
     * @param {number} width - Image width
     * @returns {Array<{start: number, end: number}>} Array of system boundaries
     */
    detectSystems(projection, width) {
        const normalized = this.normalizeProjection(projection, width);
        const systems = [];
        let inSystem = false;
        let systemStart = 0;

        for (let y = 0; y < normalized.length; y++) {
            const isContent = normalized[y] >= this.threshold;

            if (isContent && !inSystem) {
                inSystem = true;
                systemStart = y;
            } else if (!isContent && inSystem) {
                let gapEnd = y;
                while (gapEnd < normalized.length && normalized[gapEnd] < this.threshold) {
                    gapEnd++;
                }
                const gapSize = gapEnd - y;

                if (gapSize >= this.minGap || gapEnd >= normalized.length) {
                    systems.push({
                        start: systemStart,
                        end: y - 1
                    });
                    inSystem = false;
                }
            }
        }

        if (inSystem) {
            systems.push({
                start: systemStart,
                end: normalized.length - 1
            });
        }

        const minSystemHeight = 50;
        return systems.filter(s => (s.end - s.start) >= minSystemHeight);
    }

    /**
     * Refine system boundaries using full-width projection
     * Expands boundaries to include all content in the detected region
     * @param {Array<{start: number, end: number}>} systems - Systems detected from margin
     * @param {number[]} fullProjection - Full-width projection profile
     * @param {number} margin - Extra margin to add (pixels)
     * @returns {Array<{start: number, end: number}>}
     */
    refineBoundaries(systems, fullProjection, margin = 5) {
        return systems.map(system => {
            let start = system.start;
            let end = system.end;

            // Expand upward to include any nearby content
            while (start > 0 && fullProjection[start - 1] > 0) {
                start--;
            }

            // Expand downward to include any nearby content
            while (end < fullProjection.length - 1 && fullProjection[end + 1] > 0) {
                end++;
            }

            // Add safety margin
            start = Math.max(0, start - margin);
            end = Math.min(fullProjection.length - 1, end + margin);

            return { start, end };
        });
    }

    /**
     * HYBRID analysis pipeline
     * 1. Use left margin to detect system starts (braces/brackets)
     * 2. Use full projection to refine exact boundaries
     * @param {ImageData} imageData
     * @returns {{projection: number[], systems: Array<{start: number, end: number}>}}
     */
    analyze(imageData) {
        // Step 1: Detect systems from left margin (more reliable)
        const { projection: marginProjection, marginWidth } = this.calculateLeftMarginProjection(imageData);
        let systems = this.detectSystemsFromMargin(marginProjection, marginWidth);

        // Step 2: Calculate full projection for boundary refinement
        const fullProjection = this.calculateProjection(imageData);

        // Step 3: If margin detection failed, fall back to full projection
        if (systems.length === 0) {
            systems = this.detectSystems(fullProjection, imageData.width);
        }

        // Step 4: Refine boundaries using full projection
        systems = this.refineBoundaries(systems, fullProjection);

        return {
            projection: fullProjection,
            marginProjection: marginProjection,
            normalizedProjection: this.normalizeProjection(fullProjection, imageData.width),
            normalizedMarginProjection: this.normalizeProjection(marginProjection, marginWidth),
            systems
        };
    }

    /**
     * Draw projection profile on canvas
     * Shows both margin projection (cyan) and full projection (green)
     * @param {HTMLCanvasElement} canvas
     * @param {number[]} normalizedProjection
     * @param {Array<{start: number, end: number}>} systems
     * @param {number[]} normalizedMarginProjection - Optional margin projection to show
     */
    drawProjectionGraph(canvas, normalizedProjection, systems, normalizedMarginProjection = null) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.fillStyle = '#0f3460';
        ctx.fillRect(0, 0, width, height);

        if (normalizedProjection.length === 0) return;

        // Calculate scale
        const xScale = width / normalizedProjection.length;
        const maxVal = Math.max(...normalizedProjection, 1);
        const yScale = (height - 20) / maxVal;

        // Draw system regions
        ctx.fillStyle = 'rgba(233, 69, 96, 0.3)';
        for (const system of systems) {
            const x1 = system.start * xScale;
            const x2 = system.end * xScale;
            ctx.fillRect(x1, 0, x2 - x1, height);
        }

        // Draw threshold line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        const thresholdY = height - this.threshold * yScale;
        ctx.moveTo(0, thresholdY);
        ctx.lineTo(width, thresholdY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw margin projection (cyan) if available
        if (normalizedMarginProjection && normalizedMarginProjection.length > 0) {
            const marginMaxVal = Math.max(...normalizedMarginProjection, 1);
            const marginYScale = (height - 20) / marginMaxVal;

            ctx.strokeStyle = '#22d3ee'; // Cyan for margin
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let i = 0; i < normalizedMarginProjection.length; i++) {
                const x = i * xScale;
                const y = height - normalizedMarginProjection[i] * marginYScale;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }

        // Draw full projection line (green)
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < normalizedProjection.length; i++) {
            const x = i * xScale;
            const y = height - normalizedProjection[i] * yScale;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Draw axis labels
        ctx.fillStyle = '#a0a0a0';
        ctx.font = '10px sans-serif';
        ctx.fillText(`Umbral: ${this.threshold}%`, 5, 12);
        ctx.fillText(`Sistemas: ${systems.length}`, width - 80, 12);

        // Legend
        ctx.fillStyle = '#22d3ee';
        ctx.fillText('Margen izq.', 5, height - 5);
        ctx.fillStyle = '#4ade80';
        ctx.fillText('Completo', 80, height - 5);
    }
}
