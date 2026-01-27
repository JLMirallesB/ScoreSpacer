/**
 * Main - Application entry point and UI logic
 */

import { PDFHandler } from './pdfHandler.js';
import { ProjectionAnalyzer } from './projection.js';
import { PDFGenerator } from './pdfGenerator.js';
import { i18n } from './i18n.js';

class ScoreSpacer {
    constructor() {
        this.pdfHandler = new PDFHandler();
        this.analyzer = new ProjectionAnalyzer();
        this.generator = new PDFGenerator();

        this.currentPage = 1;
        this.pageAnalysis = []; // Store analysis results for all pages
        this.pageSettings = []; // Per-page settings: {detect: bool, export: bool}
        this.isAnalyzed = false;

        // For interactive editing
        this.isDragging = false;
        this.dragTarget = null;
        this.dragStartY = 0;
        this.dragSystemIndex = -1;
        this.dragEdge = null; // 'top' or 'bottom'
        this.previewScale = 1;

        // For rotation
        this.isRotationMode = false;
        this.currentRotation = 0;
        this.originalCanvas = null; // Store original for preview

        // For crop
        this.isCropMode = false;
        this.cropValues = { top: 0, bottom: 0, left: 0, right: 0 };
        this.isCropDragging = false;
        this.cropDragEdge = null; // 'top', 'bottom', 'left', 'right', 'tl', 'tr', 'bl', 'br'
        this.cropDragStartPos = { x: 0, y: 0 };

        this.initElements();
        this.initEventListeners();
        this.syncParams();
    }

    initElements() {
        // Sections
        this.uploadSection = document.getElementById('uploadSection');
        this.pageSelectionSection = document.getElementById('pageSelectionSection');
        this.processingSection = document.getElementById('processingSection');

        // Upload
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.selectFileBtn = document.getElementById('selectFileBtn');

        // File info
        this.fileName = document.getElementById('fileName');
        this.removeFileBtn = document.getElementById('removeFileBtn');

        // Page selection
        this.pageThumbnails = document.getElementById('pageThumbnails');
        this.selectAllDetect = document.getElementById('selectAllDetect');
        this.selectNoneDetect = document.getElementById('selectNoneDetect');
        this.selectAllExport = document.getElementById('selectAllExport');
        this.continueToProcessBtn = document.getElementById('continueToProcessBtn');
        this.backToSelectionBtn = document.getElementById('backToSelectionBtn');

        // Parameters
        this.spacingSlider = document.getElementById('spacingSlider');
        this.spacingInput = document.getElementById('spacingInput');
        this.thresholdSlider = document.getElementById('thresholdSlider');
        this.thresholdInput = document.getElementById('thresholdInput');
        this.minGapSlider = document.getElementById('minGapSlider');
        this.minGapInput = document.getElementById('minGapInput');

        // Preview
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.pageNav = document.getElementById('pageNav');
        this.prevPageBtn = document.getElementById('prevPageBtn');
        this.nextPageBtn = document.getElementById('nextPageBtn');
        this.pageIndicator = document.getElementById('pageIndicator');
        this.previewContainer = document.getElementById('previewContainer');
        this.projectionContainer = document.getElementById('projectionContainer');
        this.projectionCanvas = document.getElementById('projectionCanvas');

        // Generate
        this.generateBtn = document.getElementById('generateBtn');
        this.progressBar = document.getElementById('progressBar');
        this.filenameGroup = document.getElementById('filenameGroup');
        this.outputFilename = document.getElementById('outputFilename');

        // Rotation
        this.rotateBtn = document.getElementById('rotateBtn');
        this.rotationPanel = document.getElementById('rotationPanel');
        this.rotationSlider = document.getElementById('rotationSlider');
        this.rotationInput = document.getElementById('rotationInput');
        this.rotationAutoDetectBtn = document.getElementById('rotationAutoDetect');
        this.rotationResetBtn = document.getElementById('rotationReset');
        this.cancelRotationBtn = document.getElementById('cancelRotationBtn');
        this.applyRotationBtn = document.getElementById('applyRotationBtn');

        // Crop
        this.cropBtn = document.getElementById('cropBtn');
        this.cropPanel = document.getElementById('cropPanel');
        this.cropTopInput = document.getElementById('cropTop');
        this.cropBottomInput = document.getElementById('cropBottom');
        this.cropLeftInput = document.getElementById('cropLeft');
        this.cropRightInput = document.getElementById('cropRight');
        this.cropAutoDetectBtn = document.getElementById('cropAutoDetect');
        this.cropResetBtn = document.getElementById('cropReset');
        this.cancelCropBtn = document.getElementById('cancelCropBtn');
        this.applyCropBtn = document.getElementById('applyCropBtn');

        // Watermark and donation modal
        this.disableWatermarkCheckbox = document.getElementById('disableWatermark');
        this.donationModal = document.getElementById('donationModal');
        this.closeDonationModalBtn = document.getElementById('closeDonationModal');
        this.skipDonationBtn = document.getElementById('skipDonation');

        // Help modal
        this.helpBtn = document.getElementById('helpBtn');
        this.helpModal = document.getElementById('helpModal');
        this.closeHelpModalBtn = document.getElementById('closeHelpModal');

        // Language selector
        this.languageSelect = document.getElementById('languageSelect');
    }

    initEventListeners() {
        // File selection
        this.selectFileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.fileInput.click();
        });

        this.dropZone.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('drag-over');
        });

        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('drag-over');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'application/pdf') {
                this.loadFile(file);
            }
        });

        // Remove file
        this.removeFileBtn.addEventListener('click', () => this.reset());

        // Page selection actions
        this.selectAllDetect.addEventListener('click', () => this.setAllPages('detect', true));
        this.selectNoneDetect.addEventListener('click', () => this.setAllPages('detect', false));
        this.selectAllExport.addEventListener('click', () => this.setAllPages('export', true));

        // Navigation between sections
        this.continueToProcessBtn.addEventListener('click', () => this.showProcessingSection());
        this.backToSelectionBtn.addEventListener('click', () => this.showPageSelectionSection());

        // Parameter sliders sync
        this.setupSliderSync(this.spacingSlider, this.spacingInput);
        this.setupSliderSync(this.thresholdSlider, this.thresholdInput);
        this.setupSliderSync(this.minGapSlider, this.minGapInput);

        // Parameter changes trigger re-analysis
        [this.thresholdInput, this.minGapInput].forEach(input => {
            input.addEventListener('change', () => {
                if (this.isAnalyzed) {
                    this.analyzeCurrentPage();
                }
            });
        });

        // Analyze button
        this.analyzeBtn.addEventListener('click', () => this.analyzeAllPages());

        // Page navigation
        this.prevPageBtn.addEventListener('click', () => this.changePage(-1));
        this.nextPageBtn.addEventListener('click', () => this.changePage(1));

        // Generate button
        this.generateBtn.addEventListener('click', () => this.generatePdf());

        // Rotation controls
        this.rotateBtn.addEventListener('click', () => this.enterRotationMode());
        this.cancelRotationBtn.addEventListener('click', () => this.exitRotationMode());
        this.applyRotationBtn.addEventListener('click', () => this.applyRotation());

        // Rotation slider/input sync
        this.rotationSlider.addEventListener('input', () => {
            this.rotationInput.value = this.rotationSlider.value;
            this.previewRotation(parseFloat(this.rotationSlider.value));
        });

        this.rotationInput.addEventListener('change', () => {
            const value = Math.min(Math.max(parseFloat(this.rotationInput.value) || 0, -5), 5);
            this.rotationInput.value = value;
            this.rotationSlider.value = value;
            this.previewRotation(value);
        });

        // Rotation preset buttons
        document.querySelectorAll('.rotation-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const angle = parseFloat(btn.dataset.angle);
                const currentValue = parseFloat(this.rotationSlider.value) || 0;
                const newValue = Math.min(Math.max(currentValue + angle, -5), 5);
                this.rotationSlider.value = newValue;
                this.rotationInput.value = newValue;
                this.previewRotation(newValue);
            });
        });

        // Rotation auto-detect and reset
        this.rotationAutoDetectBtn.addEventListener('click', () => this.autoDetectRotation());
        this.rotationResetBtn.addEventListener('click', () => {
            this.rotationSlider.value = 0;
            this.rotationInput.value = 0;
            this.currentRotation = 0;
            this.previewRotation(0);
        });

        // Crop controls
        this.cropBtn.addEventListener('click', () => this.enterCropMode());
        this.cancelCropBtn.addEventListener('click', () => this.exitCropMode());
        this.applyCropBtn.addEventListener('click', () => this.applyCrop());
        this.cropAutoDetectBtn.addEventListener('click', () => this.autoDetectMargins());
        this.cropResetBtn.addEventListener('click', () => this.resetCropValues());

        // Crop input changes
        [this.cropTopInput, this.cropBottomInput, this.cropLeftInput, this.cropRightInput].forEach(input => {
            input.addEventListener('change', () => this.previewCrop());
            input.addEventListener('input', () => this.previewCrop());
        });

        // Crop preset buttons
        document.querySelectorAll('.crop-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const side = btn.dataset.side;
                const value = parseInt(btn.dataset.value);
                const inputMap = {
                    top: this.cropTopInput,
                    bottom: this.cropBottomInput,
                    left: this.cropLeftInput,
                    right: this.cropRightInput
                };
                const input = inputMap[side];
                if (input) {
                    input.value = parseInt(input.value || 0) + value;
                    this.previewCrop();
                }
            });
        });

        // Watermark checkbox - show donation modal when checked
        this.disableWatermarkCheckbox.addEventListener('change', () => {
            if (this.disableWatermarkCheckbox.checked) {
                this.showDonationModal();
            }
        });

        // Donation modal controls
        this.closeDonationModalBtn.addEventListener('click', () => this.hideDonationModal(false));
        this.skipDonationBtn.addEventListener('click', () => this.hideDonationModal(true));

        // Close modal on overlay click
        this.donationModal.addEventListener('click', (e) => {
            if (e.target === this.donationModal) {
                this.hideDonationModal(false);
            }
        });

        // Help modal controls
        this.helpBtn.addEventListener('click', () => this.showHelpModal());
        this.closeHelpModalBtn.addEventListener('click', () => this.hideHelpModal());
        this.helpModal.addEventListener('click', (e) => {
            if (e.target === this.helpModal) {
                this.hideHelpModal();
            }
        });

        // Global mouse events for dragging (systems and crop)
        document.addEventListener('mousemove', (e) => {
            this.handleDragMove(e);
            this.handleCropDragMove(e);
        });
        document.addEventListener('mouseup', (e) => {
            this.handleDragEnd(e);
            this.handleCropDragEnd(e);
        });

        // Language selector
        this.languageSelect.value = i18n.getLanguage();
        this.languageSelect.addEventListener('change', () => {
            i18n.setLanguage(this.languageSelect.value);
        });

        // Update dynamic content when language changes
        i18n.onLanguageChange(() => {
            if (this.isAnalyzed) {
                this.showPageAnalysis(this.currentPage);
            }
            this.updatePageIndicator();
        });
    }

    setupSliderSync(slider, input) {
        slider.addEventListener('input', () => {
            input.value = slider.value;
        });

        input.addEventListener('change', () => {
            const value = Math.min(Math.max(input.value, input.min), input.max);
            input.value = value;
            slider.value = value;
        });
    }

    syncParams() {
        this.analyzer.setParams({
            threshold: parseFloat(this.thresholdInput.value),
            minGap: parseInt(this.minGapInput.value)
        });

        this.generator.setSpacing(parseInt(this.spacingInput.value));
        this.generator.setWatermark(!this.disableWatermarkCheckbox.checked);
    }

    showDonationModal() {
        this.donationModal.classList.remove('hidden');
    }

    hideDonationModal(keepChecked) {
        this.donationModal.classList.add('hidden');
        if (!keepChecked) {
            this.disableWatermarkCheckbox.checked = false;
        }
    }

    showHelpModal() {
        this.helpModal.classList.remove('hidden');
    }

    hideHelpModal() {
        this.helpModal.classList.add('hidden');
    }

    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            await this.loadFile(file);
        }
    }

    async loadFile(file) {
        try {
            this.fileName.textContent = file.name;

            const pageCount = await this.pdfHandler.loadFile(file);

            // Initialize page settings - by default: detect all, export all
            this.pageSettings = Array.from({ length: pageCount }, () => ({
                detect: true,
                export: true
            }));

            // Reset analysis
            this.isAnalyzed = false;
            this.pageAnalysis = [];
            this.generateBtn.disabled = true;

            // Show page selection
            this.uploadSection.classList.add('hidden');
            this.pageSelectionSection.classList.remove('hidden');
            this.processingSection.classList.add('hidden');

            // Generate thumbnails
            await this.generateThumbnails();

        } catch (error) {
            console.error('Error loading PDF:', error);
            alert(i18n.t('error.loadPdf') + ' ' + error.message);
            this.reset();
        }
    }

    async generateThumbnails() {
        this.pageThumbnails.innerHTML = `<p style="color: var(--text-secondary);">${i18n.t('thumbnail.generating')}</p>`;

        const pageCount = this.pdfHandler.getPageCount();
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < pageCount; i++) {
            const pageNum = i + 1;

            // Render at low scale for thumbnail
            const { canvas } = await this.pdfHandler.renderPage(pageNum, 0.3);

            const thumbnail = this.createThumbnailElement(canvas, pageNum, i);
            fragment.appendChild(thumbnail);
        }

        this.pageThumbnails.innerHTML = '';
        this.pageThumbnails.appendChild(fragment);
    }

    createThumbnailElement(canvas, pageNum, index) {
        const settings = this.pageSettings[index];

        const div = document.createElement('div');
        div.className = 'page-thumbnail';
        div.dataset.index = index;
        this.updateThumbnailClass(div, settings);

        // Image
        const img = document.createElement('img');
        img.className = 'page-thumbnail-image';
        img.src = canvas.toDataURL('image/jpeg', 0.7);
        img.alt = i18n.t('thumbnail.page', { num: pageNum });
        div.appendChild(img);

        // Overlay with controls (visible on hover)
        const overlay = document.createElement('div');
        overlay.className = 'page-thumbnail-overlay';

        const controls = document.createElement('div');
        controls.className = 'page-thumbnail-controls';

        // Detect button
        const detectBtn = document.createElement('button');
        detectBtn.className = `page-thumbnail-btn ${settings.detect ? 'active' : ''}`;
        detectBtn.textContent = settings.detect ? i18n.t('thumbnail.detectActive') : i18n.t('thumbnail.detect');
        detectBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePageSetting(index, 'detect');
        });
        controls.appendChild(detectBtn);

        // Export button
        const exportBtn = document.createElement('button');
        exportBtn.className = `page-thumbnail-btn ${settings.export ? 'active' : ''}`;
        exportBtn.textContent = settings.export ? i18n.t('thumbnail.exportActive') : i18n.t('thumbnail.export');
        exportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePageSetting(index, 'export');
        });
        controls.appendChild(exportBtn);

        overlay.appendChild(controls);
        div.appendChild(overlay);

        // Info bar at bottom
        const info = document.createElement('div');
        info.className = 'page-thumbnail-info';

        const number = document.createElement('span');
        number.className = 'page-thumbnail-number';
        number.textContent = pageNum;
        info.appendChild(number);

        const badges = document.createElement('div');
        badges.className = 'page-thumbnail-badges';

        if (settings.detect) {
            const detectBadge = document.createElement('span');
            detectBadge.className = 'page-badge detect';
            detectBadge.textContent = 'D';
            detectBadge.title = i18n.t('thumbnail.badgeDetect');
            badges.appendChild(detectBadge);
        }

        if (settings.export) {
            const exportBadge = document.createElement('span');
            exportBadge.className = 'page-badge export';
            exportBadge.textContent = 'E';
            exportBadge.title = i18n.t('thumbnail.badgeExport');
            badges.appendChild(exportBadge);
        }

        info.appendChild(badges);
        div.appendChild(info);

        // Click on thumbnail cycles through states
        div.addEventListener('click', () => this.cyclePageState(index));

        return div;
    }

    updateThumbnailClass(element, settings) {
        element.classList.remove('detect', 'export-only', 'skip');
        if (settings.detect) {
            element.classList.add('detect');
        } else if (settings.export) {
            element.classList.add('export-only');
        } else {
            element.classList.add('skip');
        }
    }

    togglePageSetting(index, setting) {
        this.pageSettings[index][setting] = !this.pageSettings[index][setting];
        this.updateThumbnailUI(index);
    }

    cyclePageState(index) {
        const settings = this.pageSettings[index];
        // Cycle: detect+export -> export-only -> skip -> detect+export
        if (settings.detect && settings.export) {
            settings.detect = false;
            settings.export = true;
        } else if (!settings.detect && settings.export) {
            settings.detect = false;
            settings.export = false;
        } else {
            settings.detect = true;
            settings.export = true;
        }
        this.updateThumbnailUI(index);
    }

    updateThumbnailUI(index) {
        const thumbnail = this.pageThumbnails.querySelector(`[data-index="${index}"]`);
        if (!thumbnail) return;

        const settings = this.pageSettings[index];

        // Update class
        this.updateThumbnailClass(thumbnail, settings);

        // Update buttons
        const buttons = thumbnail.querySelectorAll('.page-thumbnail-btn');
        buttons[0].className = `page-thumbnail-btn ${settings.detect ? 'active' : ''}`;
        buttons[0].textContent = settings.detect ? i18n.t('thumbnail.detectActive') : i18n.t('thumbnail.detect');
        buttons[1].className = `page-thumbnail-btn ${settings.export ? 'active' : ''}`;
        buttons[1].textContent = settings.export ? i18n.t('thumbnail.exportActive') : i18n.t('thumbnail.export');

        // Update badges
        const badges = thumbnail.querySelector('.page-thumbnail-badges');
        badges.innerHTML = '';

        if (settings.detect) {
            const detectBadge = document.createElement('span');
            detectBadge.className = 'page-badge detect';
            detectBadge.textContent = 'D';
            detectBadge.title = i18n.t('thumbnail.badgeDetect');
            badges.appendChild(detectBadge);
        }

        if (settings.export) {
            const exportBadge = document.createElement('span');
            exportBadge.className = 'page-badge export';
            exportBadge.textContent = 'E';
            exportBadge.title = i18n.t('thumbnail.badgeExport');
            badges.appendChild(exportBadge);
        }
    }

    setAllPages(setting, value) {
        this.pageSettings.forEach((s, i) => {
            s[setting] = value;
            this.updateThumbnailUI(i);
        });
    }

    showProcessingSection() {
        this.pageSelectionSection.classList.add('hidden');
        this.processingSection.classList.remove('hidden');

        // Reset analysis state when coming back
        this.isAnalyzed = false;
        this.pageAnalysis = [];
        this.currentPage = 1;
        this.generateBtn.disabled = true;

        // Hide rotation and crop controls
        this.rotateBtn.classList.add('hidden');
        this.rotationPanel.classList.add('hidden');
        this.isRotationMode = false;
        this.cropBtn.classList.add('hidden');
        this.cropPanel.classList.add('hidden');
        this.isCropMode = false;

        // Update page navigation to show only pages with detect or export enabled
        this.updatePageNav();

        this.previewContainer.innerHTML = `
            <div class="preview-placeholder">
                <p>${i18n.t('preview.placeholder')}</p>
            </div>
        `;
    }

    showPageSelectionSection() {
        this.processingSection.classList.add('hidden');
        this.pageSelectionSection.classList.remove('hidden');
    }

    updatePageNav() {
        const pageCount = this.pdfHandler.getPageCount();
        if (pageCount > 1) {
            this.pageNav.classList.remove('hidden');
        } else {
            this.pageNav.classList.add('hidden');
        }
        this.updatePageIndicator();
    }

    updatePageIndicator() {
        const total = this.pdfHandler.getPageCount();
        const settings = this.pageSettings[this.currentPage - 1];
        let status = '';
        if (settings) {
            if (settings.detect) {
                status = ' ' + i18n.t('preview.statusDetect');
            } else if (settings.export) {
                status = ' ' + i18n.t('preview.statusExportOnly');
            } else {
                status = ' ' + i18n.t('preview.statusSkip');
            }
        }
        this.pageIndicator.textContent = i18n.t('preview.pageIndicator', { current: this.currentPage, total: total }) + status;
        this.prevPageBtn.disabled = this.currentPage <= 1;
        this.nextPageBtn.disabled = this.currentPage >= total;
    }

    changePage(delta) {
        const newPage = this.currentPage + delta;
        const total = this.pdfHandler.getPageCount();

        if (newPage >= 1 && newPage <= total) {
            this.currentPage = newPage;
            this.updatePageIndicator();
            if (this.isAnalyzed) {
                this.showPageAnalysis(this.currentPage);
            }
        }
    }

    async analyzeAllPages() {
        this.syncParams();
        this.analyzeBtn.disabled = true;
        this.analyzeBtn.innerHTML = `<span class="loading"></span>${i18n.t('preview.analyzing')}`;

        try {
            const pageCount = this.pdfHandler.getPageCount();
            this.pageAnalysis = [];

            for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
                const settings = this.pageSettings[pageNum - 1];
                const skipDetection = !settings.detect;

                // Render page at full resolution
                const { canvas, width, height } = await this.pdfHandler.renderPage(pageNum, 2);
                const ctx = canvas.getContext('2d');
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                let analysis;
                if (skipDetection) {
                    analysis = {
                        projection: [],
                        normalizedProjection: [],
                        normalizedMarginProjection: [],
                        systems: []
                    };
                } else {
                    analysis = this.analyzer.analyze(imageData);
                }

                this.pageAnalysis.push({
                    pageNum,
                    ...analysis,
                    canvas,
                    scale: 2,
                    skipped: skipDetection,
                    exportEnabled: settings.export
                });
            }

            this.isAnalyzed = true;
            this.generateBtn.disabled = false;
            this.rotateBtn.classList.remove('hidden');
            this.cropBtn.classList.remove('hidden');
            this.showPageAnalysis(this.currentPage);
            this.pageNav.classList.remove('hidden');

            // Show filename input with default value
            this.filenameGroup.classList.remove('hidden');
            const originalName = this.fileName.textContent.replace('.pdf', '');
            this.outputFilename.value = `${originalName}_spaced`;

        } catch (error) {
            console.error('Error analyzing PDF:', error);
            alert(i18n.t('error.analyze') + ' ' + error.message);
        } finally {
            this.analyzeBtn.disabled = false;
            this.analyzeBtn.textContent = i18n.t('preview.analyze');
        }
    }

    async analyzeCurrentPage() {
        if (!this.isAnalyzed) return;

        this.syncParams();
        const pageData = this.pageAnalysis[this.currentPage - 1];

        if (pageData.skipped) return;

        const ctx = pageData.canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, pageData.canvas.width, pageData.canvas.height);

        const analysis = this.analyzer.analyze(imageData);
        Object.assign(pageData, analysis);

        this.showPageAnalysis(this.currentPage);
    }

    showPageAnalysis(pageNum) {
        const pageData = this.pageAnalysis[pageNum - 1];
        if (!pageData) return;

        // Update indicator
        this.updatePageIndicator();

        // Show preview with system overlays
        this.renderPreview(pageData);

        // Show projection graph and rotation/crop buttons only for non-skipped pages
        if (!pageData.skipped) {
            this.projectionContainer.classList.remove('hidden');
            this.renderProjectionGraph(pageData);
            // Show rotation and crop buttons if analyzed
            if (this.isAnalyzed) {
                this.rotateBtn.classList.remove('hidden');
                this.cropBtn.classList.remove('hidden');
            }
        } else {
            this.projectionContainer.classList.add('hidden');
            this.rotateBtn.classList.add('hidden');
            this.cropBtn.classList.add('hidden');
        }

        // Exit rotation/crop mode when changing pages
        if (this.isRotationMode) {
            this.exitRotationMode();
        }
        if (this.isCropMode) {
            this.exitCropMode();
        }
    }

    renderPreview(pageData) {
        const { canvas, systems, skipped, exportEnabled } = pageData;
        const settings = this.pageSettings[pageData.pageNum - 1];

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'preview-canvas-wrapper';

        // Create preview canvas (scaled down for display)
        const previewCanvas = document.createElement('canvas');
        previewCanvas.className = 'preview-canvas';

        const maxWidth = this.previewContainer.clientWidth - 40;
        this.previewScale = Math.min(1, maxWidth / canvas.width);

        previewCanvas.width = canvas.width * this.previewScale;
        previewCanvas.height = canvas.height * this.previewScale;

        const ctx = previewCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0, previewCanvas.width, previewCanvas.height);

        wrapper.appendChild(previewCanvas);

        // Add system overlays (interactive)
        if (!skipped) {
            systems.forEach((system, index) => {
                const overlay = this.createSystemOverlay(system, index, canvas.height);
                wrapper.appendChild(overlay);
            });

            // Add "Add System" button
            const addBtn = document.createElement('button');
            addBtn.className = 'btn-add-system';
            addBtn.innerHTML = i18n.t('system.add');
            addBtn.title = i18n.t('system.addTitle');
            addBtn.addEventListener('click', () => this.addNewSystem());
            wrapper.appendChild(addBtn);
        }

        // Update container
        this.previewContainer.innerHTML = '';
        this.previewContainer.appendChild(wrapper);

        // Add info
        const info = document.createElement('p');
        info.style.cssText = 'text-align: center; color: var(--text-secondary); margin-top: 1rem;';

        if (skipped && !settings.export) {
            info.textContent = i18n.t('preview.pageSkipped');
        } else if (skipped && settings.export) {
            info.textContent = i18n.t('preview.pageExportOnly');
        } else {
            const plural = systems.length !== 1 ? 's' : '';
            info.innerHTML = `${i18n.t('preview.systemsDetected', { count: systems.length, plural: plural })} - <span style="color: var(--accent);">${i18n.t('preview.dragToAdjust')}</span>`;
        }
        this.previewContainer.appendChild(info);
    }

    createSystemOverlay(system, index, canvasHeight) {
        const overlay = document.createElement('div');
        overlay.className = 'system-overlay';
        overlay.dataset.index = index;
        overlay.style.top = `${system.start * this.previewScale}px`;
        overlay.style.height = `${(system.end - system.start) * this.previewScale}px`;

        // Label
        const label = document.createElement('span');
        label.className = 'system-label';
        label.textContent = index + 1;
        overlay.appendChild(label);

        // Top drag handle
        const topHandle = document.createElement('div');
        topHandle.className = 'system-handle system-handle-top';
        topHandle.addEventListener('mousedown', (e) => this.handleDragStart(e, index, 'top'));
        overlay.appendChild(topHandle);

        // Bottom drag handle
        const bottomHandle = document.createElement('div');
        bottomHandle.className = 'system-handle system-handle-bottom';
        bottomHandle.addEventListener('mousedown', (e) => this.handleDragStart(e, index, 'bottom'));
        overlay.appendChild(bottomHandle);

        // Action buttons container
        const actions = document.createElement('div');
        actions.className = 'system-actions';

        // Split button
        const splitBtn = document.createElement('button');
        splitBtn.className = 'system-action-btn';
        splitBtn.innerHTML = '✂';
        splitBtn.title = i18n.t('system.split');
        splitBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.splitSystem(index);
        });
        actions.appendChild(splitBtn);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'system-action-btn system-action-delete';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = i18n.t('system.delete');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteSystem(index);
        });
        actions.appendChild(deleteBtn);

        overlay.appendChild(actions);

        return overlay;
    }

    handleDragStart(e, systemIndex, edge) {
        e.preventDefault();
        e.stopPropagation();

        this.isDragging = true;
        this.dragSystemIndex = systemIndex;
        this.dragEdge = edge;
        this.dragStartY = e.clientY;
        this.dragTarget = e.target.parentElement;

        document.body.style.cursor = 'ns-resize';
        this.dragTarget.classList.add('dragging');
    }

    handleDragMove(e) {
        if (!this.isDragging) return;

        const pageData = this.pageAnalysis[this.currentPage - 1];
        if (!pageData) return;

        const system = pageData.systems[this.dragSystemIndex];
        if (!system) return;

        const deltaY = e.clientY - this.dragStartY;
        const deltaCanvas = deltaY / this.previewScale;

        if (this.dragEdge === 'top') {
            const newStart = Math.max(0, system.start + deltaCanvas);
            const minHeight = 20; // Minimum system height
            if (newStart < system.end - minHeight) {
                system.start = Math.round(newStart);
                this.dragStartY = e.clientY;
            }
        } else {
            const newEnd = Math.min(pageData.canvas.height, system.end + deltaCanvas);
            const minHeight = 20;
            if (newEnd > system.start + minHeight) {
                system.end = Math.round(newEnd);
                this.dragStartY = e.clientY;
            }
        }

        // Update visual
        this.updateOverlayPosition(this.dragTarget, system);
        this.renderProjectionGraph(pageData);
    }

    handleDragEnd(e) {
        if (!this.isDragging) return;

        this.isDragging = false;
        document.body.style.cursor = '';

        if (this.dragTarget) {
            this.dragTarget.classList.remove('dragging');
        }

        this.dragTarget = null;
        this.dragSystemIndex = -1;
        this.dragEdge = null;

        // Re-sort systems by position
        const pageData = this.pageAnalysis[this.currentPage - 1];
        if (pageData) {
            pageData.systems.sort((a, b) => a.start - b.start);
            this.showPageAnalysis(this.currentPage);
        }
    }

    updateOverlayPosition(overlay, system) {
        overlay.style.top = `${system.start * this.previewScale}px`;
        overlay.style.height = `${(system.end - system.start) * this.previewScale}px`;
    }

    deleteSystem(index) {
        const pageData = this.pageAnalysis[this.currentPage - 1];
        if (!pageData || index < 0 || index >= pageData.systems.length) return;

        pageData.systems.splice(index, 1);
        this.showPageAnalysis(this.currentPage);
    }

    splitSystem(index) {
        const pageData = this.pageAnalysis[this.currentPage - 1];
        if (!pageData || index < 0 || index >= pageData.systems.length) return;

        const system = pageData.systems[index];
        const midPoint = Math.round((system.start + system.end) / 2);

        // Create two systems from the original
        const system1 = { start: system.start, end: midPoint - 10 };
        const system2 = { start: midPoint + 10, end: system.end };

        // Replace original with two new ones
        pageData.systems.splice(index, 1, system1, system2);
        this.showPageAnalysis(this.currentPage);
    }

    addNewSystem() {
        const pageData = this.pageAnalysis[this.currentPage - 1];
        if (!pageData) return;

        const canvasHeight = pageData.canvas.height;

        // Find a gap to place the new system
        let newStart = 100;
        let newEnd = 200;

        if (pageData.systems.length > 0) {
            // Place after last system
            const lastSystem = pageData.systems[pageData.systems.length - 1];
            newStart = lastSystem.end + 50;
            newEnd = Math.min(newStart + 150, canvasHeight - 50);

            // If no room at bottom, place at top
            if (newEnd <= newStart + 50) {
                const firstSystem = pageData.systems[0];
                newEnd = firstSystem.start - 50;
                newStart = Math.max(newEnd - 150, 50);
            }
        }

        pageData.systems.push({ start: newStart, end: newEnd });
        pageData.systems.sort((a, b) => a.start - b.start);
        this.showPageAnalysis(this.currentPage);
    }

    renderProjectionGraph(pageData) {
        const canvas = this.projectionCanvas;
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width - 32; // Account for padding
        canvas.height = 150;

        this.analyzer.drawProjectionGraph(
            canvas,
            pageData.normalizedProjection,
            pageData.systems,
            pageData.normalizedMarginProjection // Hybrid: show left margin projection
        );
    }

    // --- Rotation Methods ---

    enterRotationMode() {
        if (!this.isAnalyzed) return;

        const pageData = this.pageAnalysis[this.currentPage - 1];
        if (!pageData || pageData.skipped) return;

        this.isRotationMode = true;
        this.currentRotation = 0;

        // Store original canvas for preview
        this.originalCanvas = document.createElement('canvas');
        this.originalCanvas.width = pageData.canvas.width;
        this.originalCanvas.height = pageData.canvas.height;
        const ctx = this.originalCanvas.getContext('2d');
        ctx.drawImage(pageData.canvas, 0, 0);

        // Reset rotation controls
        this.rotationSlider.value = 0;
        this.rotationInput.value = 0;

        // Show rotation panel, hide rotation button
        this.rotateBtn.classList.add('hidden');
        this.rotationPanel.classList.remove('hidden');

        // Add rotation mode class to preview
        const wrapper = this.previewContainer.querySelector('.preview-canvas-wrapper');
        if (wrapper) {
            wrapper.classList.add('rotation-mode');
        }
    }

    exitRotationMode() {
        this.isRotationMode = false;
        this.currentRotation = 0;
        this.originalCanvas = null;

        // Hide rotation panel, show rotation button
        this.rotationPanel.classList.add('hidden');
        this.rotateBtn.classList.remove('hidden');

        // Remove rotation mode class
        const wrapper = this.previewContainer.querySelector('.preview-canvas-wrapper');
        if (wrapper) {
            wrapper.classList.remove('rotation-mode');
        }

        // Restore original preview
        this.showPageAnalysis(this.currentPage);
    }

    previewRotation(angleDegrees) {
        if (!this.isRotationMode || !this.originalCanvas) return;

        const pageData = this.pageAnalysis[this.currentPage - 1];
        if (!pageData) return;

        this.currentRotation = angleDegrees;

        // Create rotated preview canvas
        const rotatedCanvas = this.rotateCanvas(this.originalCanvas, angleDegrees);

        // Update the preview display
        const previewCanvas = this.previewContainer.querySelector('.preview-canvas');
        if (previewCanvas) {
            const ctx = previewCanvas.getContext('2d');
            // Calculate new dimensions for preview
            const maxWidth = this.previewContainer.clientWidth - 40;
            const newScale = Math.min(1, maxWidth / rotatedCanvas.width);

            previewCanvas.width = rotatedCanvas.width * newScale;
            previewCanvas.height = rotatedCanvas.height * newScale;

            ctx.drawImage(rotatedCanvas, 0, 0, previewCanvas.width, previewCanvas.height);

            // Update wrapper to show rotation mode
            const wrapper = previewCanvas.parentElement;
            if (wrapper) {
                wrapper.classList.add('rotation-mode');

                // Update system overlays positions (they will shift with rotation)
                // For preview, we just show the image without overlays
                const overlays = wrapper.querySelectorAll('.system-overlay');
                overlays.forEach(o => o.style.opacity = '0.3');
            }
        }
    }

    rotateCanvas(sourceCanvas, angleDegrees) {
        const angleRadians = (angleDegrees * Math.PI) / 180;

        // Calculate new canvas size to fit rotated image
        const cos = Math.abs(Math.cos(angleRadians));
        const sin = Math.abs(Math.sin(angleRadians));
        const newWidth = Math.ceil(sourceCanvas.width * cos + sourceCanvas.height * sin);
        const newHeight = Math.ceil(sourceCanvas.width * sin + sourceCanvas.height * cos);

        const rotatedCanvas = document.createElement('canvas');
        rotatedCanvas.width = newWidth;
        rotatedCanvas.height = newHeight;

        const ctx = rotatedCanvas.getContext('2d');

        // Fill with white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, newWidth, newHeight);

        // Translate to center, rotate, then draw
        ctx.translate(newWidth / 2, newHeight / 2);
        ctx.rotate(angleRadians);
        ctx.drawImage(
            sourceCanvas,
            -sourceCanvas.width / 2,
            -sourceCanvas.height / 2
        );

        return rotatedCanvas;
    }

    /**
     * Auto-detect the optimal rotation angle by finding the angle that
     * maximizes the variance of horizontal projection (staff lines create
     * strong peaks when perfectly horizontal)
     */
    autoDetectRotation() {
        if (!this.isRotationMode || !this.originalCanvas) return;

        this.rotationAutoDetectBtn.disabled = true;
        this.rotationAutoDetectBtn.textContent = i18n.t('rotation.detecting');

        // Use setTimeout to allow UI to update
        setTimeout(() => {
            try {
                const canvas = this.originalCanvas;

                // Scale down for faster processing
                const scale = Math.min(1, 800 / Math.max(canvas.width, canvas.height));
                const sampleCanvas = document.createElement('canvas');
                sampleCanvas.width = Math.floor(canvas.width * scale);
                sampleCanvas.height = Math.floor(canvas.height * scale);
                const sampleCtx = sampleCanvas.getContext('2d');
                sampleCtx.drawImage(canvas, 0, 0, sampleCanvas.width, sampleCanvas.height);

                // Convert to grayscale array for faster processing
                const imageData = sampleCtx.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height);
                const data = imageData.data;
                const width = sampleCanvas.width;
                const height = sampleCanvas.height;

                let bestAngle = 0;
                let bestVariance = 0;

                // Test angles from -3 to 3 degrees in 0.1 degree steps
                for (let angle = -3; angle <= 3; angle += 0.1) {
                    const variance = this.calculateProjectionVariance(data, width, height, angle);
                    if (variance > bestVariance) {
                        bestVariance = variance;
                        bestAngle = angle;
                    }
                }

                // Fine-tune around best angle with 0.05 degree steps
                const fineStart = bestAngle - 0.2;
                const fineEnd = bestAngle + 0.2;
                for (let angle = fineStart; angle <= fineEnd; angle += 0.05) {
                    const variance = this.calculateProjectionVariance(data, width, height, angle);
                    if (variance > bestVariance) {
                        bestVariance = variance;
                        bestAngle = angle;
                    }
                }

                // Round to 1 decimal place
                bestAngle = Math.round(bestAngle * 10) / 10;

                // Apply the detected angle
                this.currentRotation = bestAngle;
                this.rotationSlider.value = bestAngle;
                this.rotationInput.value = bestAngle;
                this.previewRotation(bestAngle);

            } catch (error) {
                console.error('Error auto-detecting rotation:', error);
            } finally {
                this.rotationAutoDetectBtn.disabled = false;
                this.rotationAutoDetectBtn.textContent = i18n.t('rotation.autoDetect');
            }
        }, 50);
    }

    /**
     * Calculate the variance of horizontal projection for a given rotation angle
     * Higher variance means better alignment of horizontal lines
     */
    calculateProjectionVariance(data, width, height, angleDegrees) {
        const angleRadians = (angleDegrees * Math.PI) / 180;
        const cos = Math.cos(angleRadians);
        const sin = Math.sin(angleRadians);

        // Center of the image
        const cx = width / 2;
        const cy = height / 2;

        // Create projection array
        const projection = new Array(height).fill(0);
        const counts = new Array(height).fill(0);

        // Sample pixels (skip some for speed)
        const step = 2;
        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                // Rotate point around center
                const rx = (x - cx) * cos - (y - cy) * sin + cx;
                const ry = (x - cx) * sin + (y - cy) * cos + cy;

                // Get original pixel
                const idx = (y * width + x) * 4;
                const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

                // Invert (dark pixels = high value)
                const darkness = 255 - gray;

                // Add to projection at rotated Y position
                const projY = Math.floor(ry);
                if (projY >= 0 && projY < height) {
                    projection[projY] += darkness;
                    counts[projY]++;
                }
            }
        }

        // Normalize projection
        for (let i = 0; i < height; i++) {
            if (counts[i] > 0) {
                projection[i] /= counts[i];
            }
        }

        // Calculate variance
        let sum = 0;
        let count = 0;
        for (let i = 0; i < height; i++) {
            if (counts[i] > 0) {
                sum += projection[i];
                count++;
            }
        }
        const mean = sum / count;

        let variance = 0;
        for (let i = 0; i < height; i++) {
            if (counts[i] > 0) {
                variance += Math.pow(projection[i] - mean, 2);
            }
        }
        variance /= count;

        return variance;
    }

    async applyRotation() {
        if (!this.isRotationMode || this.currentRotation === 0) {
            this.exitRotationMode();
            return;
        }

        const pageData = this.pageAnalysis[this.currentPage - 1];
        if (!pageData) return;

        // Show loading state
        this.applyRotationBtn.disabled = true;
        this.applyRotationBtn.innerHTML = `<span class="loading"></span>${i18n.t('rotation.applying')}`;

        try {
            // Rotate the stored canvas
            const rotatedCanvas = this.rotateCanvas(this.originalCanvas, this.currentRotation);

            // Replace the page canvas
            pageData.canvas = rotatedCanvas;

            // Re-analyze the page
            const ctx = rotatedCanvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, rotatedCanvas.width, rotatedCanvas.height);
            const analysis = this.analyzer.analyze(imageData);

            // Update page data with new analysis
            Object.assign(pageData, analysis);

            // Store the rotation for reference
            pageData.rotation = (pageData.rotation || 0) + this.currentRotation;

            // Exit rotation mode and refresh display
            this.isRotationMode = false;
            this.currentRotation = 0;
            this.originalCanvas = null;

            this.rotationPanel.classList.add('hidden');
            this.rotateBtn.classList.remove('hidden');

            // Refresh the preview
            this.showPageAnalysis(this.currentPage);

        } catch (error) {
            console.error('Error applying rotation:', error);
            alert(i18n.t('error.rotation') + ' ' + error.message);
        } finally {
            this.applyRotationBtn.disabled = false;
            this.applyRotationBtn.textContent = i18n.t('rotation.apply');
        }
    }

    // --- Crop Methods ---

    enterCropMode() {
        if (!this.isAnalyzed) return;

        const pageData = this.pageAnalysis[this.currentPage - 1];
        if (!pageData || pageData.skipped) return;

        // Exit rotation mode if active
        if (this.isRotationMode) {
            this.exitRotationMode();
        }

        this.isCropMode = true;

        // Store original canvas for preview
        this.originalCanvas = document.createElement('canvas');
        this.originalCanvas.width = pageData.canvas.width;
        this.originalCanvas.height = pageData.canvas.height;
        const ctx = this.originalCanvas.getContext('2d');
        ctx.drawImage(pageData.canvas, 0, 0);

        // Reset crop values
        this.resetCropValues();

        // Show crop panel, hide crop button
        this.cropBtn.classList.add('hidden');
        this.rotateBtn.classList.add('hidden');
        this.cropPanel.classList.remove('hidden');

        // Add crop mode class to preview
        const wrapper = this.previewContainer.querySelector('.preview-canvas-wrapper');
        if (wrapper) {
            wrapper.classList.add('crop-mode');
        }

        this.previewCrop();
    }

    exitCropMode() {
        this.isCropMode = false;
        this.originalCanvas = null;

        // Hide crop panel, show buttons
        this.cropPanel.classList.add('hidden');
        this.cropBtn.classList.remove('hidden');
        this.rotateBtn.classList.remove('hidden');

        // Remove crop mode class
        const wrapper = this.previewContainer.querySelector('.preview-canvas-wrapper');
        if (wrapper) {
            wrapper.classList.remove('crop-mode');
            // Remove crop overlay
            const overlay = wrapper.querySelector('.crop-overlay');
            if (overlay) overlay.remove();
        }

        // Restore original preview
        this.showPageAnalysis(this.currentPage);
    }

    resetCropValues() {
        this.cropTopInput.value = 0;
        this.cropBottomInput.value = 0;
        this.cropLeftInput.value = 0;
        this.cropRightInput.value = 0;
        this.cropValues = { top: 0, bottom: 0, left: 0, right: 0 };
        if (this.isCropMode) {
            this.previewCrop();
        }
    }

    previewCrop() {
        if (!this.isCropMode || !this.originalCanvas) return;

        this.cropValues = {
            top: parseInt(this.cropTopInput.value) || 0,
            bottom: parseInt(this.cropBottomInput.value) || 0,
            left: parseInt(this.cropLeftInput.value) || 0,
            right: parseInt(this.cropRightInput.value) || 0
        };

        const wrapper = this.previewContainer.querySelector('.preview-canvas-wrapper');
        if (!wrapper) return;

        // Remove existing crop overlay
        let overlay = wrapper.querySelector('.crop-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'crop-overlay';
            wrapper.appendChild(overlay);
        }

        // Calculate the visible area after crop
        const scale = this.previewScale;
        const { top, bottom, left, right } = this.cropValues;

        // Position overlay to show the crop area
        // Positive values = crop (show smaller area)
        // Negative values = expand (would add margin - show as extending beyond)
        overlay.style.top = `${Math.max(0, top * scale)}px`;
        overlay.style.left = `${Math.max(0, left * scale)}px`;
        overlay.style.right = `${Math.max(0, right * scale)}px`;
        overlay.style.bottom = `${Math.max(0, bottom * scale)}px`;

        // Add drag handles if not present
        if (!overlay.querySelector('.crop-handle-top')) {
            this.addCropHandles(overlay);
        }

        // Add info label
        let infoLabel = overlay.querySelector('.crop-overlay-info');
        if (!infoLabel) {
            infoLabel = document.createElement('div');
            infoLabel.className = 'crop-overlay-info';
            overlay.appendChild(infoLabel);
        }

        const newWidth = this.originalCanvas.width - left - right;
        const newHeight = this.originalCanvas.height - top - bottom;
        infoLabel.textContent = `${Math.round(newWidth)} × ${Math.round(newHeight)} px`;
    }

    addCropHandles(overlay) {
        // Edge handles
        const edges = ['top', 'bottom', 'left', 'right'];
        edges.forEach(edge => {
            const handle = document.createElement('div');
            handle.className = `crop-handle crop-handle-${edge}`;
            handle.addEventListener('mousedown', (e) => this.handleCropDragStart(e, edge));
            overlay.appendChild(handle);
        });

        // Corner handles
        const corners = ['tl', 'tr', 'bl', 'br'];
        corners.forEach(corner => {
            const handle = document.createElement('div');
            handle.className = `crop-handle crop-handle-corner crop-handle-${corner}`;
            handle.addEventListener('mousedown', (e) => this.handleCropDragStart(e, corner));
            overlay.appendChild(handle);
        });
    }

    handleCropDragStart(e, edge) {
        e.preventDefault();
        e.stopPropagation();

        this.isCropDragging = true;
        this.cropDragEdge = edge;
        this.cropDragStartPos = { x: e.clientX, y: e.clientY };

        document.body.style.cursor = this.getCropCursor(edge);
    }

    getCropCursor(edge) {
        const cursors = {
            top: 'ns-resize',
            bottom: 'ns-resize',
            left: 'ew-resize',
            right: 'ew-resize',
            tl: 'nwse-resize',
            tr: 'nesw-resize',
            bl: 'nesw-resize',
            br: 'nwse-resize'
        };
        return cursors[edge] || 'move';
    }

    handleCropDragMove(e) {
        if (!this.isCropDragging || !this.isCropMode) return;

        const deltaX = e.clientX - this.cropDragStartPos.x;
        const deltaY = e.clientY - this.cropDragStartPos.y;
        const scale = this.previewScale;

        // Convert screen delta to canvas pixels
        const deltaCanvasX = Math.round(deltaX / scale);
        const deltaCanvasY = Math.round(deltaY / scale);

        const edge = this.cropDragEdge;

        // Update crop values based on which edge/corner is being dragged
        if (edge === 'top' || edge === 'tl' || edge === 'tr') {
            this.cropTopInput.value = parseInt(this.cropTopInput.value || 0) + deltaCanvasY;
        }
        if (edge === 'bottom' || edge === 'bl' || edge === 'br') {
            this.cropBottomInput.value = parseInt(this.cropBottomInput.value || 0) - deltaCanvasY;
        }
        if (edge === 'left' || edge === 'tl' || edge === 'bl') {
            this.cropLeftInput.value = parseInt(this.cropLeftInput.value || 0) + deltaCanvasX;
        }
        if (edge === 'right' || edge === 'tr' || edge === 'br') {
            this.cropRightInput.value = parseInt(this.cropRightInput.value || 0) - deltaCanvasX;
        }

        this.cropDragStartPos = { x: e.clientX, y: e.clientY };
        this.previewCrop();
    }

    handleCropDragEnd(e) {
        if (!this.isCropDragging) return;

        this.isCropDragging = false;
        this.cropDragEdge = null;
        document.body.style.cursor = '';
    }

    cropCanvas(sourceCanvas, cropValues) {
        const { top, bottom, left, right } = cropValues;

        // Calculate new dimensions
        // Positive values reduce size, negative values increase size
        const newWidth = sourceCanvas.width - left - right;
        const newHeight = sourceCanvas.height - top - bottom;

        if (newWidth <= 0 || newHeight <= 0) {
            throw new Error(i18n.t('crop.invalidSize'));
        }

        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = newWidth;
        croppedCanvas.height = newHeight;

        const ctx = croppedCanvas.getContext('2d');

        // Fill with white background (for negative margins)
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, newWidth, newHeight);

        // Draw the source canvas offset by the crop values
        // If left is positive, we skip those pixels from source
        // If left is negative, we draw with an offset (adding margin)
        const srcX = Math.max(0, left);
        const srcY = Math.max(0, top);
        const srcW = sourceCanvas.width - srcX - Math.max(0, right);
        const srcH = sourceCanvas.height - srcY - Math.max(0, bottom);

        const destX = Math.max(0, -left);
        const destY = Math.max(0, -top);

        ctx.drawImage(
            sourceCanvas,
            srcX, srcY, srcW, srcH,
            destX, destY, srcW, srcH
        );

        return croppedCanvas;
    }

    async applyCrop() {
        if (!this.isCropMode) {
            this.exitCropMode();
            return;
        }

        const { top, bottom, left, right } = this.cropValues;

        // Check if any crop is applied
        if (top === 0 && bottom === 0 && left === 0 && right === 0) {
            this.exitCropMode();
            return;
        }

        const pageData = this.pageAnalysis[this.currentPage - 1];
        if (!pageData) return;

        // Show loading state
        this.applyCropBtn.disabled = true;
        this.applyCropBtn.innerHTML = `<span class="loading"></span>${i18n.t('crop.applying')}`;

        try {
            // Crop the stored canvas
            const croppedCanvas = this.cropCanvas(this.originalCanvas, this.cropValues);

            // Replace the page canvas
            pageData.canvas = croppedCanvas;

            // Re-analyze the page
            const ctx = croppedCanvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, croppedCanvas.width, croppedCanvas.height);
            const analysis = this.analyzer.analyze(imageData);

            // Update page data with new analysis
            Object.assign(pageData, analysis);

            // Store the crop for reference
            pageData.crop = { ...this.cropValues };

            // Exit crop mode and refresh display
            this.isCropMode = false;
            this.originalCanvas = null;

            this.cropPanel.classList.add('hidden');
            this.cropBtn.classList.remove('hidden');
            this.rotateBtn.classList.remove('hidden');

            // Refresh the preview
            this.showPageAnalysis(this.currentPage);

        } catch (error) {
            console.error('Error applying crop:', error);
            alert(i18n.t('error.crop') + ' ' + error.message);
        } finally {
            this.applyCropBtn.disabled = false;
            this.applyCropBtn.textContent = i18n.t('crop.apply');
        }
    }

    autoDetectMargins() {
        if (!this.isCropMode || !this.originalCanvas) return;

        const ctx = this.originalCanvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, this.originalCanvas.width, this.originalCanvas.height);
        const data = imageData.data;
        const width = this.originalCanvas.width;
        const height = this.originalCanvas.height;

        // Threshold for considering a pixel as "content" (not white)
        const threshold = 250;

        let minX = width, maxX = 0, minY = height, maxY = 0;

        // Scan for content bounds
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];

                // Check if pixel is not white
                if (r < threshold || g < threshold || b < threshold) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }

        // Add small padding
        const padding = 20;
        minX = Math.max(0, minX - padding);
        minY = Math.max(0, minY - padding);
        maxX = Math.min(width - 1, maxX + padding);
        maxY = Math.min(height - 1, maxY + padding);

        // Calculate crop values
        this.cropTopInput.value = minY;
        this.cropBottomInput.value = height - maxY - 1;
        this.cropLeftInput.value = minX;
        this.cropRightInput.value = width - maxX - 1;

        this.previewCrop();
    }

    async generatePdf() {
        if (!this.isAnalyzed || this.pageAnalysis.length === 0) return;

        this.syncParams();
        this.generateBtn.disabled = true;
        this.progressBar.classList.remove('hidden');

        const progressBarEl = this.progressBar.querySelector('.progress-bar');
        const progressText = this.progressBar.querySelector('.progress-text');

        try {
            // Filter pages based on export settings
            const pagesToExport = this.pageAnalysis.filter((page, index) => {
                return this.pageSettings[index].export;
            });

            if (pagesToExport.length === 0) {
                alert(i18n.t('generate.noPages'));
                return;
            }

            const pdfBytes = await this.generator.generateWithCanvasMethod(
                pagesToExport,
                (progress) => {
                    progressBarEl.style.setProperty('--progress', `${progress}%`);
                    progressText.textContent = `${i18n.t('generate.processing')} ${progress}%`;
                }
            );

            // Generate filename from user input
            const customName = this.outputFilename.value.trim() || 'output';
            const newFilename = `${customName}.pdf`;

            this.generator.downloadPdf(pdfBytes, newFilename);

            progressText.textContent = i18n.t('generate.success');

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert(i18n.t('error.generate') + ' ' + error.message);
        } finally {
            this.generateBtn.disabled = false;
            setTimeout(() => {
                this.progressBar.classList.add('hidden');
            }, 2000);
        }
    }

    reset() {
        this.pdfHandler.clearCache();
        this.pageAnalysis = [];
        this.pageSettings = [];
        this.isAnalyzed = false;
        this.currentPage = 1;

        // Reset rotation state
        this.isRotationMode = false;
        this.currentRotation = 0;
        this.originalCanvas = null;

        // Reset crop state
        this.isCropMode = false;
        this.cropValues = { top: 0, bottom: 0, left: 0, right: 0 };

        this.uploadSection.classList.remove('hidden');
        this.pageSelectionSection.classList.add('hidden');
        this.processingSection.classList.add('hidden');
        this.pageNav.classList.add('hidden');
        this.projectionContainer.classList.add('hidden');
        this.rotateBtn.classList.add('hidden');
        this.rotationPanel.classList.add('hidden');
        this.cropBtn.classList.add('hidden');
        this.cropPanel.classList.add('hidden');
        this.generateBtn.disabled = true;
        this.filenameGroup.classList.add('hidden');
        this.outputFilename.value = '';

        this.fileInput.value = '';
        this.pageThumbnails.innerHTML = '';
        this.previewContainer.innerHTML = `
            <div class="preview-placeholder">
                <p>${i18n.t('preview.placeholder')}</p>
            </div>
        `;
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Initialize i18n (update DOM with detected/saved language)
    i18n.updateDOM();

    // Initialize app
    window.scoreSpacer = new ScoreSpacer();
});
