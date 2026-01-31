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

        // For brightness/contrast
        this.isBrightnessContrastMode = false;
        this.currentBrightness = 100;
        this.currentContrast = 100;

        // For undo/redo (per-page history)
        this.undoStacks = {}; // { pageNum: [snapshot, ...] }
        this.redoStacks = {}; // { pageNum: [snapshot, ...] }
        this.maxHistorySize = 30;

        // Wizard state
        this.currentStep = 1;
        this.completedSteps = new Set();

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

        // Export section
        this.exportSection = document.getElementById('exportSection');
        this.exportPreviewContainer = document.getElementById('exportPreviewContainer');
        this.generateBtn = document.getElementById('generateBtn');
        this.progressBar = document.getElementById('progressBar');
        this.filenameGroup = document.getElementById('filenameGroup');
        this.outputFilename = document.getElementById('outputFilename');

        // Navigation between sections
        this.continueToExportBtn = document.getElementById('continueToExportBtn');
        this.backToProcessingBtn = document.getElementById('backToProcessingBtn');

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

        // Brightness/Contrast
        this.brightnessContrastBtn = document.getElementById('brightnessContrastBtn');
        this.brightnessContrastPanel = document.getElementById('brightnessContrastPanel');
        this.brightnessSlider = document.getElementById('brightnessSlider');
        this.brightnessInput = document.getElementById('brightnessInput');
        this.contrastSlider = document.getElementById('contrastSlider');
        this.contrastInput = document.getElementById('contrastInput');
        this.brightnessContrastResetBtn = document.getElementById('brightnessContrastReset');
        this.cancelBrightnessContrastBtn = document.getElementById('cancelBrightnessContrastBtn');
        this.applyBrightnessContrastBtn = document.getElementById('applyBrightnessContrastBtn');

        // Undo/Redo
        this.undoBtn = document.getElementById('undoBtn');
        this.redoBtn = document.getElementById('redoBtn');

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

        // Wizard
        this.wizardProgress = document.getElementById('wizardProgress');
        this.wizardSteps = document.querySelectorAll('.wizard-step');
        this.wizardConnectors = document.querySelectorAll('.wizard-step-connector');

        // Contextual toolbar
        this.contextualToolbar = document.getElementById('contextualToolbar');
        this.toolbarRotate = document.getElementById('toolbarRotate');
        this.toolbarCrop = document.getElementById('toolbarCrop');
        this.toolbarBrightness = document.getElementById('toolbarBrightness');
        this.toolbarAddSystem = document.getElementById('toolbarAddSystem');
        this.toolbarUndo = document.getElementById('toolbarUndo');
        this.toolbarRedo = document.getElementById('toolbarRedo');
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
        this.continueToExportBtn.addEventListener('click', () => this.showExportSection());
        this.backToProcessingBtn.addEventListener('click', () => this.backToProcessingFromExport());

        // Parameter sliders sync
        this.setupSliderSync(this.spacingSlider, this.spacingInput);
        this.setupSliderSync(this.thresholdSlider, this.thresholdInput);
        this.setupSliderSync(this.minGapSlider, this.minGapInput);

        // Parameter changes trigger re-analysis (debounced for sliders)
        let reanalysisTimeout = null;
        const triggerReanalysis = () => {
            if (this.isAnalyzed) {
                clearTimeout(reanalysisTimeout);
                reanalysisTimeout = setTimeout(() => {
                    this.analyzeCurrentPage();
                }, 150); // Small debounce for smooth slider experience
            }
        };

        // Sliders: live feedback while dragging
        [this.thresholdSlider, this.minGapSlider].forEach(slider => {
            slider.addEventListener('input', triggerReanalysis);
        });

        // Inputs: re-analyze on change
        [this.thresholdInput, this.minGapInput].forEach(input => {
            input.addEventListener('change', () => {
                if (this.isAnalyzed) {
                    this.analyzeCurrentPage();
                }
            });
        });

        // Spacing slider: update export preview in real-time
        this.spacingSlider.addEventListener('input', () => {
            this.spacingInput.value = this.spacingSlider.value;
            if (this.isAnalyzed) {
                this.renderExportPreview();
            }
        });
        this.spacingInput.addEventListener('change', () => {
            this.spacingSlider.value = this.spacingInput.value;
            if (this.isAnalyzed) {
                this.renderExportPreview();
            }
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

        // Brightness/Contrast controls
        this.brightnessContrastBtn.addEventListener('click', () => this.enterBrightnessContrastMode());
        this.cancelBrightnessContrastBtn.addEventListener('click', () => this.exitBrightnessContrastMode());
        this.applyBrightnessContrastBtn.addEventListener('click', () => this.applyBrightnessContrast());
        this.brightnessContrastResetBtn.addEventListener('click', () => this.resetBrightnessContrast());

        // Brightness/Contrast sliders sync
        this.brightnessSlider.addEventListener('input', () => {
            this.brightnessInput.value = this.brightnessSlider.value;
            this.previewBrightnessContrast();
        });
        this.brightnessInput.addEventListener('change', () => {
            const value = Math.min(Math.max(parseInt(this.brightnessInput.value) || 100, 50), 150);
            this.brightnessInput.value = value;
            this.brightnessSlider.value = value;
            this.previewBrightnessContrast();
        });
        this.contrastSlider.addEventListener('input', () => {
            this.contrastInput.value = this.contrastSlider.value;
            this.previewBrightnessContrast();
        });
        this.contrastInput.addEventListener('change', () => {
            const value = Math.min(Math.max(parseInt(this.contrastInput.value) || 100, 50), 150);
            this.contrastInput.value = value;
            this.contrastSlider.value = value;
            this.previewBrightnessContrast();
        });

        // Brightness/Contrast preset buttons
        document.querySelectorAll('.brightness-contrast-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const brightness = parseInt(btn.dataset.brightness);
                const contrast = parseInt(btn.dataset.contrast);
                this.brightnessSlider.value = brightness;
                this.brightnessInput.value = brightness;
                this.contrastSlider.value = contrast;
                this.contrastInput.value = contrast;
                this.previewBrightnessContrast();
            });
        });

        // Undo/Redo controls
        this.undoBtn.addEventListener('click', () => this.undo());
        this.redoBtn.addEventListener('click', () => this.redo());

        // Keyboard shortcuts for undo/redo
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                this.redo();
            }
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

        // Wizard step click navigation
        this.wizardSteps.forEach((stepEl, index) => {
            stepEl.addEventListener('click', () => {
                const stepNum = index + 1;
                // Only allow navigation to completed steps
                if (this.completedSteps.has(stepNum) && stepNum < this.currentStep) {
                    this.navigateToStep(stepNum);
                }
            });
        });

        // Contextual toolbar buttons
        this.toolbarRotate.addEventListener('click', () => this.enterRotationMode());
        this.toolbarCrop.addEventListener('click', () => this.enterCropMode());
        this.toolbarBrightness.addEventListener('click', () => this.enterBrightnessContrastMode());
        this.toolbarAddSystem.addEventListener('click', () => this.addNewSystem());
        this.toolbarUndo.addEventListener('click', () => this.undo());
        this.toolbarRedo.addEventListener('click', () => this.redo());
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
            this.exportSection.classList.add('hidden');

            // Show page selection
            this.uploadSection.classList.add('hidden');
            this.pageSelectionSection.classList.remove('hidden');
            this.processingSection.classList.add('hidden');

            // Generate thumbnails
            await this.generateThumbnails();

            // Update wizard
            this.completedSteps.add(1);
            this.updateWizardStep(2);

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

        // Transform badges container (for rotation, crop, brightness icons)
        const transforms = document.createElement('div');
        transforms.className = 'page-thumbnail-transforms hidden';

        const rotateBadge = document.createElement('span');
        rotateBadge.className = 'transform-badge transform-rotate hidden';
        rotateBadge.textContent = '🔄';
        rotateBadge.title = i18n.t('thumbnail.rotated');
        transforms.appendChild(rotateBadge);

        const cropBadge = document.createElement('span');
        cropBadge.className = 'transform-badge transform-crop hidden';
        cropBadge.textContent = '✂️';
        cropBadge.title = i18n.t('thumbnail.cropped');
        transforms.appendChild(cropBadge);

        const brightnessBadge = document.createElement('span');
        brightnessBadge.className = 'transform-badge transform-brightness hidden';
        brightnessBadge.textContent = '☀️';
        brightnessBadge.title = i18n.t('thumbnail.brightnessAdjusted');
        transforms.appendChild(brightnessBadge);

        div.appendChild(transforms);

        // System count badge
        const systemsContainer = document.createElement('div');
        systemsContainer.className = 'page-thumbnail-systems hidden';

        const systemsCount = document.createElement('span');
        systemsCount.className = 'systems-count';
        systemsContainer.appendChild(systemsCount);

        div.appendChild(systemsContainer);

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

        // Hide rotation, crop, brightness and export controls
        this.rotateBtn.classList.add('hidden');
        this.rotationPanel.classList.add('hidden');
        this.isRotationMode = false;
        this.cropBtn.classList.add('hidden');
        this.cropPanel.classList.add('hidden');
        this.isCropMode = false;
        this.brightnessContrastBtn.classList.add('hidden');
        this.brightnessContrastPanel.classList.add('hidden');
        this.isBrightnessContrastMode = false;
        this.continueToExportBtn.classList.add('hidden');

        // Clear undo/redo history
        this.undoStacks = {};
        this.redoStacks = {};
        this.updateUndoRedoButtons();

        // Update page navigation to show only pages with detect or export enabled
        this.updatePageNav();

        // Update wizard
        this.completedSteps.add(2);
        this.updateWizardStep(3);

        // Update toolbar state
        this.updateToolbarState();

        // Auto-analyze to give immediate feedback
        this.analyzeAllPages();
    }

    showPageSelectionSection() {
        this.processingSection.classList.add('hidden');
        this.exportSection.classList.add('hidden');
        this.pageSelectionSection.classList.remove('hidden');

        // Update wizard
        this.updateWizardStep(2);
    }

    showExportSection() {
        this.processingSection.classList.add('hidden');
        this.exportSection.classList.remove('hidden');

        // Render export preview
        this.renderExportPreview();

        // Update wizard
        this.completedSteps.add(3);
        this.updateWizardStep(4);
    }

    backToProcessingFromExport() {
        this.exportSection.classList.add('hidden');
        this.processingSection.classList.remove('hidden');

        // Update wizard (back to step 3)
        this.updateWizardStep(3);
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
            this.rotateBtn.classList.remove('hidden');
            this.cropBtn.classList.remove('hidden');
            this.showPageAnalysis(this.currentPage);
            this.pageNav.classList.remove('hidden');

            // Show "Continue to Export" button (step 4 is now separate)
            this.continueToExportBtn.classList.remove('hidden');

            // Prepare filename for export
            const originalName = this.fileName.textContent.replace('.pdf', '');
            this.outputFilename.value = `${originalName}_spaced`;

            // Update toolbar state
            this.updateToolbarState();

            // Update all thumbnail indicators
            this.updateAllThumbnailIndicators();

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

        // Show projection graph and rotation/crop/brightness buttons only for non-skipped pages
        if (!pageData.skipped) {
            this.projectionContainer.classList.remove('hidden');
            this.renderProjectionGraph(pageData);
            // Show rotation, crop and brightness buttons if analyzed
            if (this.isAnalyzed) {
                this.rotateBtn.classList.remove('hidden');
                this.cropBtn.classList.remove('hidden');
                this.brightnessContrastBtn.classList.remove('hidden');
            }
        } else {
            this.projectionContainer.classList.add('hidden');
            this.rotateBtn.classList.add('hidden');
            this.cropBtn.classList.add('hidden');
            this.brightnessContrastBtn.classList.add('hidden');
        }

        // Exit edit modes when changing pages
        if (this.isRotationMode) {
            this.exitRotationMode();
        }
        if (this.isCropMode) {
            this.exitCropMode();
        }
        if (this.isBrightnessContrastMode) {
            this.exitBrightnessContrastMode();
        }

        // Update undo/redo buttons
        this.updateUndoRedoButtons();

        // Update toolbar state
        this.updateToolbarState();
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

        // Save state before drag begins
        this.saveToHistory(this.currentPage);

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

        this.saveToHistory(this.currentPage);
        pageData.systems.splice(index, 1);
        this.showPageAnalysis(this.currentPage);
    }

    splitSystem(index) {
        const pageData = this.pageAnalysis[this.currentPage - 1];
        if (!pageData || index < 0 || index >= pageData.systems.length) return;

        this.saveToHistory(this.currentPage);
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

        this.saveToHistory(this.currentPage);
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

        // Update toolbar state
        this.updateToolbarState();
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

        // Save state before applying rotation
        this.saveToHistory(this.currentPage);

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

            // Update thumbnail indicators
            this.updateThumbnailIndicators(this.currentPage - 1);

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

        // Update toolbar state
        this.updateToolbarState();
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

        // Save state before applying crop
        this.saveToHistory(this.currentPage);

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

            // Update thumbnail indicators
            this.updateThumbnailIndicators(this.currentPage - 1);

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

        // Reset brightness/contrast state
        this.isBrightnessContrastMode = false;
        this.currentBrightness = 100;
        this.currentContrast = 100;

        // Clear undo/redo history
        this.undoStacks = {};
        this.redoStacks = {};

        // Reset wizard
        this.currentStep = 1;
        this.completedSteps.clear();
        this.updateWizardStep(1);

        this.uploadSection.classList.remove('hidden');
        this.pageSelectionSection.classList.add('hidden');
        this.processingSection.classList.add('hidden');
        this.pageNav.classList.add('hidden');
        this.projectionContainer.classList.add('hidden');
        this.rotateBtn.classList.add('hidden');
        this.rotationPanel.classList.add('hidden');
        this.cropBtn.classList.add('hidden');
        this.cropPanel.classList.add('hidden');
        this.brightnessContrastBtn.classList.add('hidden');
        this.brightnessContrastPanel.classList.add('hidden');
        this.exportSection.classList.add('hidden');
        this.continueToExportBtn.classList.add('hidden');
        this.outputFilename.value = '';

        this.fileInput.value = '';
        this.pageThumbnails.innerHTML = '';
        this.previewContainer.innerHTML = `
            <div class="preview-placeholder">
                <p>${i18n.t('preview.placeholder')}</p>
            </div>
        `;
    }

    // --- Undo/Redo Methods ---

    saveToHistory(pageNum) {
        const pageData = this.pageAnalysis[pageNum - 1];
        if (!pageData) return;

        // Initialize stacks for this page if needed
        if (!this.undoStacks[pageNum]) {
            this.undoStacks[pageNum] = [];
        }

        // Create a deep copy of the current state
        const snapshot = {
            systems: JSON.parse(JSON.stringify(pageData.systems)),
            // Store canvas as data URL for full restoration capability
            canvasDataUrl: pageData.canvas.toDataURL('image/png'),
            canvasWidth: pageData.canvas.width,
            canvasHeight: pageData.canvas.height
        };

        this.undoStacks[pageNum].push(snapshot);

        // Clear redo stack when new action is performed
        this.redoStacks[pageNum] = [];

        // Limit history size
        if (this.undoStacks[pageNum].length > this.maxHistorySize) {
            this.undoStacks[pageNum].shift();
        }

        this.updateUndoRedoButtons();
    }

    canUndo() {
        const stack = this.undoStacks[this.currentPage];
        return stack && stack.length > 0;
    }

    canRedo() {
        const stack = this.redoStacks[this.currentPage];
        return stack && stack.length > 0;
    }

    updateUndoRedoButtons() {
        if (this.undoBtn) {
            this.undoBtn.disabled = !this.canUndo();
        }
        if (this.redoBtn) {
            this.redoBtn.disabled = !this.canRedo();
        }
    }

    async undo() {
        if (!this.canUndo()) return;

        const pageData = this.pageAnalysis[this.currentPage - 1];
        if (!pageData) return;

        // Save current state to redo stack
        if (!this.redoStacks[this.currentPage]) {
            this.redoStacks[this.currentPage] = [];
        }
        this.redoStacks[this.currentPage].push({
            systems: JSON.parse(JSON.stringify(pageData.systems)),
            canvasDataUrl: pageData.canvas.toDataURL('image/png'),
            canvasWidth: pageData.canvas.width,
            canvasHeight: pageData.canvas.height
        });

        // Restore previous state
        const snapshot = this.undoStacks[this.currentPage].pop();
        await this.restoreSnapshot(pageData, snapshot);

        this.updateUndoRedoButtons();
        this.showPageAnalysis(this.currentPage);
    }

    async redo() {
        if (!this.canRedo()) return;

        const pageData = this.pageAnalysis[this.currentPage - 1];
        if (!pageData) return;

        // Save current state to undo stack
        if (!this.undoStacks[this.currentPage]) {
            this.undoStacks[this.currentPage] = [];
        }
        this.undoStacks[this.currentPage].push({
            systems: JSON.parse(JSON.stringify(pageData.systems)),
            canvasDataUrl: pageData.canvas.toDataURL('image/png'),
            canvasWidth: pageData.canvas.width,
            canvasHeight: pageData.canvas.height
        });

        // Restore redo state
        const snapshot = this.redoStacks[this.currentPage].pop();
        await this.restoreSnapshot(pageData, snapshot);

        this.updateUndoRedoButtons();
        this.showPageAnalysis(this.currentPage);
    }

    async restoreSnapshot(pageData, snapshot) {
        // Restore systems
        pageData.systems = JSON.parse(JSON.stringify(snapshot.systems));

        // Restore canvas from data URL
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = snapshot.canvasWidth;
                canvas.height = snapshot.canvasHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                pageData.canvas = canvas;

                // Re-calculate projection for the restored canvas
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const analysis = this.analyzer.analyze(imageData);
                pageData.normalizedProjection = analysis.normalizedProjection;
                pageData.normalizedMarginProjection = analysis.normalizedMarginProjection;

                resolve();
            };
            img.src = snapshot.canvasDataUrl;
        });
    }

    clearHistory(pageNum) {
        this.undoStacks[pageNum] = [];
        this.redoStacks[pageNum] = [];
        this.updateUndoRedoButtons();
    }

    // --- Brightness/Contrast Methods ---

    enterBrightnessContrastMode() {
        if (!this.isAnalyzed) return;

        const pageData = this.pageAnalysis[this.currentPage - 1];
        if (!pageData || pageData.skipped) return;

        // Exit other modes if active
        if (this.isRotationMode) {
            this.exitRotationMode();
        }
        if (this.isCropMode) {
            this.exitCropMode();
        }

        this.isBrightnessContrastMode = true;
        this.currentBrightness = 100;
        this.currentContrast = 100;

        // Store original canvas for preview
        this.originalCanvas = document.createElement('canvas');
        this.originalCanvas.width = pageData.canvas.width;
        this.originalCanvas.height = pageData.canvas.height;
        const ctx = this.originalCanvas.getContext('2d');
        ctx.drawImage(pageData.canvas, 0, 0);

        // Reset controls
        this.brightnessSlider.value = 100;
        this.brightnessInput.value = 100;
        this.contrastSlider.value = 100;
        this.contrastInput.value = 100;

        // Show panel, hide buttons
        this.brightnessContrastBtn.classList.add('hidden');
        this.rotateBtn.classList.add('hidden');
        this.cropBtn.classList.add('hidden');
        this.brightnessContrastPanel.classList.remove('hidden');

        // Add mode class to preview
        const wrapper = this.previewContainer.querySelector('.preview-canvas-wrapper');
        if (wrapper) {
            wrapper.classList.add('brightness-contrast-mode');
        }

        // Update toolbar state
        this.updateToolbarState();
    }

    exitBrightnessContrastMode() {
        this.isBrightnessContrastMode = false;
        this.currentBrightness = 100;
        this.currentContrast = 100;
        this.originalCanvas = null;

        // Hide panel, show buttons
        this.brightnessContrastPanel.classList.add('hidden');
        this.brightnessContrastBtn.classList.remove('hidden');
        this.rotateBtn.classList.remove('hidden');
        this.cropBtn.classList.remove('hidden');

        // Remove mode class
        const wrapper = this.previewContainer.querySelector('.preview-canvas-wrapper');
        if (wrapper) {
            wrapper.classList.remove('brightness-contrast-mode');
        }

        // Restore original preview
        this.showPageAnalysis(this.currentPage);
    }

    resetBrightnessContrast() {
        this.brightnessSlider.value = 100;
        this.brightnessInput.value = 100;
        this.contrastSlider.value = 100;
        this.contrastInput.value = 100;
        this.currentBrightness = 100;
        this.currentContrast = 100;
        if (this.isBrightnessContrastMode) {
            this.previewBrightnessContrast();
        }
    }

    previewBrightnessContrast() {
        if (!this.isBrightnessContrastMode || !this.originalCanvas) return;

        this.currentBrightness = parseInt(this.brightnessSlider.value) || 100;
        this.currentContrast = parseInt(this.contrastSlider.value) || 100;

        const previewCanvas = this.previewContainer.querySelector('.preview-canvas');
        if (!previewCanvas) return;

        const ctx = previewCanvas.getContext('2d');
        const maxWidth = this.previewContainer.clientWidth - 40;
        const scale = Math.min(1, maxWidth / this.originalCanvas.width);

        previewCanvas.width = this.originalCanvas.width * scale;
        previewCanvas.height = this.originalCanvas.height * scale;

        // Draw original image first
        ctx.drawImage(this.originalCanvas, 0, 0, previewCanvas.width, previewCanvas.height);

        // Apply brightness/contrast manually (more compatible than ctx.filter)
        if (this.currentBrightness !== 100 || this.currentContrast !== 100) {
            const imageData = ctx.getImageData(0, 0, previewCanvas.width, previewCanvas.height);
            const data = imageData.data;
            const brightness = (this.currentBrightness - 100) * 2.55; // Convert to -127.5 to +127.5
            const contrast = this.currentContrast / 100;
            const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));

            for (let i = 0; i < data.length; i += 4) {
                // Apply brightness
                let r = data[i] + brightness;
                let g = data[i + 1] + brightness;
                let b = data[i + 2] + brightness;

                // Apply contrast
                r = factor * (r - 128) + 128;
                g = factor * (g - 128) + 128;
                b = factor * (b - 128) + 128;

                // Clamp values
                data[i] = Math.max(0, Math.min(255, r));
                data[i + 1] = Math.max(0, Math.min(255, g));
                data[i + 2] = Math.max(0, Math.min(255, b));
            }
            ctx.putImageData(imageData, 0, 0);
        }

        // Dim system overlays during preview
        const wrapper = previewCanvas.parentElement;
        if (wrapper) {
            const overlays = wrapper.querySelectorAll('.system-overlay');
            overlays.forEach(o => o.style.opacity = '0.3');
        }
    }

    async applyBrightnessContrast() {
        if (!this.isBrightnessContrastMode) {
            this.exitBrightnessContrastMode();
            return;
        }

        // Check if any change is applied
        if (this.currentBrightness === 100 && this.currentContrast === 100) {
            this.exitBrightnessContrastMode();
            return;
        }

        const pageData = this.pageAnalysis[this.currentPage - 1];
        if (!pageData) return;

        // Save state before applying
        this.saveToHistory(this.currentPage);

        // Show loading state
        this.applyBrightnessContrastBtn.disabled = true;
        this.applyBrightnessContrastBtn.innerHTML = `<span class="loading"></span>${i18n.t('brightnessContrast.applying')}`;

        try {
            // Create new canvas with applied filter
            const newCanvas = document.createElement('canvas');
            newCanvas.width = this.originalCanvas.width;
            newCanvas.height = this.originalCanvas.height;
            const ctx = newCanvas.getContext('2d');

            // Draw original first
            ctx.drawImage(this.originalCanvas, 0, 0);

            // Apply brightness/contrast manually (more compatible than ctx.filter)
            const adjustmentData = ctx.getImageData(0, 0, newCanvas.width, newCanvas.height);
            const data = adjustmentData.data;
            const brightness = (this.currentBrightness - 100) * 2.55;
            const contrast = this.currentContrast / 100;
            const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));

            for (let i = 0; i < data.length; i += 4) {
                let r = data[i] + brightness;
                let g = data[i + 1] + brightness;
                let b = data[i + 2] + brightness;

                r = factor * (r - 128) + 128;
                g = factor * (g - 128) + 128;
                b = factor * (b - 128) + 128;

                data[i] = Math.max(0, Math.min(255, r));
                data[i + 1] = Math.max(0, Math.min(255, g));
                data[i + 2] = Math.max(0, Math.min(255, b));
            }
            ctx.putImageData(adjustmentData, 0, 0);

            // Replace the page canvas
            pageData.canvas = newCanvas;

            // Re-analyze the page
            const imageData = ctx.getImageData(0, 0, newCanvas.width, newCanvas.height);
            const analysis = this.analyzer.analyze(imageData);

            // Update page data with new analysis
            Object.assign(pageData, analysis);

            // Store the values for reference
            pageData.brightness = this.currentBrightness;
            pageData.contrast = this.currentContrast;

            // Exit mode and refresh display
            this.isBrightnessContrastMode = false;
            this.originalCanvas = null;

            this.brightnessContrastPanel.classList.add('hidden');
            this.brightnessContrastBtn.classList.remove('hidden');
            this.rotateBtn.classList.remove('hidden');
            this.cropBtn.classList.remove('hidden');

            // Refresh the preview
            this.showPageAnalysis(this.currentPage);
            this.updateThumbnailIndicators(this.currentPage - 1);
            this.updateToolbarState();

        } catch (error) {
            console.error('Error applying brightness/contrast:', error);
            alert(i18n.t('error.brightnessContrast') + ' ' + error.message);
        } finally {
            this.applyBrightnessContrastBtn.disabled = false;
            this.applyBrightnessContrastBtn.textContent = i18n.t('brightnessContrast.apply');
        }
    }

    // --- Wizard Methods ---

    updateWizardStep(step) {
        this.currentStep = step;

        this.wizardSteps.forEach((stepEl, index) => {
            const stepNum = index + 1;
            stepEl.classList.remove('active', 'completed');

            if (stepNum === step) {
                stepEl.classList.add('active');
            } else if (this.completedSteps.has(stepNum)) {
                stepEl.classList.add('completed');
            }
        });

        // Update connectors
        this.wizardConnectors.forEach((conn, index) => {
            conn.classList.toggle('completed', this.completedSteps.has(index + 1));
        });
    }

    navigateToStep(step) {
        switch (step) {
            case 1:
                this.reset();
                break;
            case 2:
                if (this.pdfHandler.getPageCount() > 0) {
                    this.showPageSelectionSection();
                }
                break;
            case 3:
                if (this.pageSettings.length > 0) {
                    this.showProcessingSection();
                }
                break;
            case 4:
                if (this.isAnalyzed) {
                    this.showExportSection();
                }
                break;
        }
    }

    // --- Contextual Toolbar Methods ---

    updateToolbarState() {
        const pageData = this.pageAnalysis[this.currentPage - 1];
        const isPageAnalyzed = this.isAnalyzed && pageData && !pageData.skipped;

        // Enable/disable toolbar buttons
        this.toolbarRotate.disabled = !isPageAnalyzed;
        this.toolbarCrop.disabled = !isPageAnalyzed;
        this.toolbarBrightness.disabled = !isPageAnalyzed;
        this.toolbarAddSystem.disabled = !isPageAnalyzed;

        // Update active states for modes
        this.toolbarRotate.classList.toggle('active', this.isRotationMode);
        this.toolbarCrop.classList.toggle('active', this.isCropMode);
        this.toolbarBrightness.classList.toggle('active', this.isBrightnessContrastMode);

        // Undo/Redo
        this.toolbarUndo.disabled = !this.canUndo();
        this.toolbarRedo.disabled = !this.canRedo();
    }

    // --- Thumbnail Indicator Methods ---

    updateThumbnailIndicators(pageIndex) {
        const pageData = this.pageAnalysis[pageIndex];
        if (!pageData) return;

        const thumbnail = this.pageThumbnails.querySelector(`[data-index="${pageIndex}"]`);
        if (!thumbnail) return;

        // Update transforms badges
        const transforms = thumbnail.querySelector('.page-thumbnail-transforms');
        if (transforms) {
            const rotateBadge = transforms.querySelector('.transform-rotate');
            const cropBadge = transforms.querySelector('.transform-crop');
            const brightnessBadge = transforms.querySelector('.transform-brightness');

            const hasRotation = pageData.rotation && pageData.rotation !== 0;
            const hasCrop = pageData.crop && (pageData.crop.top || pageData.crop.bottom || pageData.crop.left || pageData.crop.right);
            const hasBrightness = (pageData.brightness && pageData.brightness !== 100) ||
                (pageData.contrast && pageData.contrast !== 100);

            rotateBadge.classList.toggle('hidden', !hasRotation);
            cropBadge.classList.toggle('hidden', !hasCrop);
            brightnessBadge.classList.toggle('hidden', !hasBrightness);
            transforms.classList.toggle('hidden', !hasRotation && !hasCrop && !hasBrightness);
        }

        // Update system count
        const systemsContainer = thumbnail.querySelector('.page-thumbnail-systems');
        if (systemsContainer) {
            const systemsCount = systemsContainer.querySelector('.systems-count');

            if (pageData.systems && pageData.systems.length > 0 && !pageData.skipped) {
                const count = pageData.systems.length;
                const key = count === 1 ? 'thumbnail.systemsCountSingular' : 'thumbnail.systemsCount';
                systemsCount.textContent = i18n.t(key, { count });
                systemsContainer.classList.remove('hidden');
            } else {
                systemsContainer.classList.add('hidden');
            }
        }
    }

    updateAllThumbnailIndicators() {
        for (let i = 0; i < this.pageAnalysis.length; i++) {
            this.updateThumbnailIndicators(i);
        }
    }

    // --- Export Preview Methods ---

    renderExportPreview() {
        if (!this.isAnalyzed || !this.exportPreviewContainer) return;

        // Collect all systems from all pages
        const allSystems = [];
        for (const pageData of this.pageAnalysis) {
            if (pageData && pageData.systems && pageData.systems.length > 0 && !pageData.skipped) {
                for (const system of pageData.systems) {
                    allSystems.push({ system, canvas: pageData.canvas });
                }
            }
        }

        if (allSystems.length === 0) {
            this.exportPreviewContainer.innerHTML = `<p style="padding: 2rem; text-align: center; color: var(--text-secondary);">${i18n.t('export.noSystems')}</p>`;
            return;
        }

        const spacing = parseInt(this.spacingInput.value) || 150;

        // DIN A4 dimensions in points (595.28 x 841.89)
        const A4_WIDTH = 595.28;
        const A4_HEIGHT = 841.89;
        const MARGIN = 40; // Same as pdfGenerator
        const usableWidth = A4_WIDTH - (MARGIN * 2);
        const usableHeight = A4_HEIGHT - (MARGIN * 2);

        // Preview scale (fit A4 to ~300px width)
        const previewScale = 300 / A4_WIDTH;
        const previewHeight = A4_HEIGHT * previewScale;
        const previewMargin = MARGIN * previewScale;
        const previewUsableWidth = usableWidth * previewScale;

        // Create preview canvas
        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = 300;
        previewCanvas.height = previewHeight;
        previewCanvas.className = 'export-preview-canvas';
        const ctx = previewCanvas.getContext('2d');

        // White background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);

        // Draw systems
        let currentY = previewMargin;
        let systemsDrawn = 0;
        const maxSystemsToShow = 10; // Limit for performance

        for (let i = 0; i < Math.min(allSystems.length, maxSystemsToShow); i++) {
            const { system, canvas } = allSystems[i];
            const systemHeight = system.end - system.start;

            // Scale system to fit usable width
            const systemScale = usableWidth / canvas.width;
            const scaledHeight = systemHeight * systemScale * previewScale;
            const spacingScaled = spacing * systemScale * previewScale;

            // Check if system fits on current page
            if (currentY + scaledHeight > previewHeight - previewMargin) {
                break; // Stop if no more space
            }

            // Draw system
            ctx.drawImage(
                canvas,
                0, system.start, canvas.width, systemHeight,
                previewMargin, currentY, previewUsableWidth, scaledHeight
            );

            currentY += scaledHeight;
            systemsDrawn++;

            // Add spacing (visual indicator)
            if (i < Math.min(allSystems.length, maxSystemsToShow) - 1 && currentY + spacingScaled < previewHeight - previewMargin) {
                // Draw spacing indicator
                ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
                ctx.fillRect(previewMargin, currentY, previewUsableWidth, spacingScaled);

                // Center line
                ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
                ctx.setLineDash([2, 2]);
                ctx.beginPath();
                ctx.moveTo(previewMargin + previewUsableWidth / 2 - 15, currentY + spacingScaled / 2);
                ctx.lineTo(previewMargin + previewUsableWidth / 2 + 15, currentY + spacingScaled / 2);
                ctx.stroke();
                ctx.setLineDash([]);

                currentY += spacingScaled;
            }
        }

        // Clear container and add canvas
        this.exportPreviewContainer.innerHTML = '';
        this.exportPreviewContainer.appendChild(previewCanvas);

        // Add info about remaining systems
        if (allSystems.length > systemsDrawn) {
            const moreCount = allSystems.length - systemsDrawn;
            const moreDiv = document.createElement('div');
            moreDiv.className = 'export-preview-more';
            moreDiv.textContent = i18n.t('export.moreSystems', { count: moreCount });
            this.exportPreviewContainer.appendChild(moreDiv);
        }
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Initialize i18n (update DOM with detected/saved language)
    i18n.updateDOM();

    // Initialize app
    window.scoreSpacer = new ScoreSpacer();
});
