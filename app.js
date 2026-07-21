/**
 * Product Poster Generator - Core Application Script
 * Developer: Antigravity
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 1. Core State & Variable Declarations
    // -------------------------------------------------------------------------
    
    // Application state
    let state = {
        originalImage: null,        // Original JS Image object
        canvasWidth: 0,
        canvasHeight: 0,
        currentTool: 'view',        // 'view', 'magic', 'chroma', 'erase', 'restore'
        brush: {
            size: 30,
            hardness: 50,
            isDrawing: false
        },
        chroma: {
            color: [255, 255, 255], // RGB background color selected
            tolerance: 20
        },
        adjustments: {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            sharpness: 0
        },
        cutoutApplied: false
    };

    // DOM Element References
    const elements = {
        // Tab Navigation
        tabButtons: document.querySelectorAll('.tab-btn'),
        tabContents: document.querySelectorAll('.tab-content'),
        
        // Upload & Canvas Editor
        uploadZone: document.getElementById('upload-zone'),
        imageUpload: document.getElementById('image-upload'),
        loadDemoBtn: document.getElementById('load-demo-btn'),
        editorContainer: document.getElementById('editor-container'),
        canvas: document.getElementById('editor-canvas'),
        brushCursor: document.getElementById('brush-cursor'),
        
        // Tools & Buttons
        toolView: document.getElementById('tool-view'),
        toolMagic: document.getElementById('tool-magic'),
        toolChroma: document.getElementById('tool-chroma'),
        toolErase: document.getElementById('tool-erase'),
        toolRestore: document.getElementById('tool-restore'),
        
        // Settings Panels
        chromaSettings: document.getElementById('chroma-settings'),
        chromaTolerance: document.getElementById('chroma-tolerance'),
        toleranceVal: document.getElementById('tolerance-val'),
        chromaColorPreview: document.getElementById('chroma-color-preview'),
        
        brushSettings: document.getElementById('brush-settings'),
        brushSize: document.getElementById('brush-size'),
        brushSizeVal: document.getElementById('brush-size-val'),
        brushHardness: document.getElementById('brush-hardness'),
        brushHardnessVal: document.getElementById('brush-hardness-val'),
        
        // Adjustments
        brightnessRange: document.getElementById('adjust-brightness'),
        contrastRange: document.getElementById('adjust-contrast'),
        saturationRange: document.getElementById('adjust-saturation'),
        sharpnessRange: document.getElementById('adjust-sharpness'),
        resetImageBtn: document.getElementById('reset-image-btn'),
        applyCutoutBtn: document.getElementById('apply-cutout-btn'),
        
        // Form details
        prodTitle: document.getElementById('prod-title'),
        prodSubtitle: document.getElementById('prod-subtitle'),
        prodPrice: document.getElementById('prod-price'),
        prodFeatures: document.getElementById('prod-features'),
        brandSelect: document.getElementById('brand-select'),
        customBrandUploadGroup: document.getElementById('custom-brand-upload-group'),
        customBrandUpload: document.getElementById('custom-brand-upload'),
        companySelect: document.getElementById('company-select'),
        customCompanyUploadGroup: document.getElementById('custom-company-upload-group'),
        customCompanyUpload: document.getElementById('custom-company-upload'),
        
        // Poster Design Panel
        templateOptions: document.querySelectorAll('.template-option'),
        aspectButtons: document.querySelectorAll('.aspect-btn'),
        toggleBadge: document.getElementById('toggle-badge'),
        togglePrice: document.getElementById('toggle-price'),
        productShadowDepth: document.getElementById('product-shadow-depth'),
        exportPngBtn: document.getElementById('export-png-btn'),
        
        // Poster Elements (Live Preview)
        posterElement: document.getElementById('poster-element'),
        posterCompanyLogo: document.getElementById('poster-company-logo'),
        posterAuthorizedBadge: document.getElementById('poster-authorized-badge'),
        posterBrandLogo: document.getElementById('poster-brand-logo'),
        posterProductImage: document.getElementById('poster-product-image'),
        posterPlaceholder: document.getElementById('poster-placeholder'),
        pTitle: document.getElementById('p-title'),
        pSubtitle: document.getElementById('p-subtitle'),
        pPrice: document.getElementById('p-price'),
        pPriceContainer: document.getElementById('p-price-container'),
        pFeatures: document.getElementById('p-features'),
        productGlow: document.getElementById('product-glow')
    };

    // Canvas Contexts
    const ctx = elements.canvas.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // In-memory canvas layers
    let sourceCanvas = document.createElement('canvas'); // Holds original uploaded image
    let cutoutCanvas = document.createElement('canvas'); // Holds transparency cutout mask
    let sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
    let cutoutCtx = cutoutCanvas.getContext('2d', { willReadFrequently: true });
    sourceCtx.imageSmoothingEnabled = true;
    sourceCtx.imageSmoothingQuality = 'high';
    cutoutCtx.imageSmoothingEnabled = true;
    cutoutCtx.imageSmoothingQuality = 'high';

    // Built-in Base64 SVG Logos for Brand fallbacks (Vector formats for high quality)
    const brandLogos = {
        ugreen: 'assets/brand_logo.png', // Main default logo
        anker: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" fill="%230f172a"><text x="20" y="70" font-family="sans-serif" font-weight="900" font-size="64" letter-spacing="2">ANKER</text></svg>',
        samsung: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" fill="%230a46a6"><path d="M200 10C89.5 10 0 30.1 0 55s89.5 45 200 45 200-20.1 200-45-89.5-45-200-45zm-115 57c-2.3 0-4-1.2-5.1-3.6-1-2.4-.8-5.3.7-8.7 1.5-3.4 4.5-5.1 9-5.1 2.4 0 4.2 1.2 5.3 3.6s.9 5.3-.6 8.7c-1.5 3.4-4.6 5.1-9.3 5.1zm50.3-17.4h11.2l-6 17.4h-10.7l5.5-17.4zm100.2 11.2c-1 2.3-2.6 3.5-4.8 3.5-1.9 0-3-.8-3.4-2.4-.4-1.6-.2-3.7.6-6.3l3.2-10.4h10.9l-3.3 10.4c-.9 2.7-1.4 4.1-1.6 4.6l-1.6.6z" fill-opacity="0.1"/><text x="45" y="70" font-family="sans-serif" font-weight="900" font-size="52" fill="%230a46a6" letter-spacing="-2">SAMSUNG</text></svg>',
        apple: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23000000"><path d="M78.6 52.4c-.2-10.8 8.8-15.9 9.2-16.2-5-7.4-12.9-8.4-15.6-8.5-6.6-.7-12.9 3.9-16.3 3.9-3.4 0-8.5-3.9-14-3.8-7.2.1-13.9 4.2-17.6 10.6-7.5 13-1.9 32.3 5.3 42.7 3.5 5.1 7.7 10.8 13.2 10.6 5.3-.2 7.3-3.4 13.7-3.4 6.4 0 8.2 3.4 13.8 3.3 5.6-.1 9.3-5.1 12.8-10.2 4-5.9 5.7-11.6 5.8-11.9-.1-.1-11.2-4.3-11.3-17.1zm-8.4-32.9c3-3.6 5-8.6 4.4-13.6-4.3.2-9.5 2.9-12.6 6.5-2.7 3.1-5 8.2-4.4 13.1 4.8.4 9.6-2.4 12.6-6z"/></svg>'
    };

    // -------------------------------------------------------------------------
    // 2. Tab Navigation Logic
    // -------------------------------------------------------------------------
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Toggle active buttons
            elements.tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Toggle active content
            elements.tabContents.forEach(content => {
                if (content.id === targetTab) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });

    // -------------------------------------------------------------------------
    // 3. Image Upload Handling & Canvas Setup
    // -------------------------------------------------------------------------
    elements.imageUpload.addEventListener('change', handleImageUpload);

    elements.loadDemoBtn.addEventListener('click', () => {
        const img = new Image();
        img.onload = () => {
            state.originalImage = img;
            state.canvasWidth = img.width;
            state.canvasHeight = img.height;
            elements.canvas.width = img.width;
            elements.canvas.height = img.height;
            
            sourceCanvas.width = img.width;
            sourceCanvas.height = img.height;
            sourceCtx.imageSmoothingEnabled = true;
            sourceCtx.imageSmoothingQuality = 'high';
            sourceCtx.drawImage(img, 0, 0);
            
            cutoutCanvas.width = img.width;
            cutoutCanvas.height = img.height;
            cutoutCtx.imageSmoothingEnabled = true;
            cutoutCtx.imageSmoothingQuality = 'high';
            cutoutCtx.clearRect(0, 0, img.width, img.height);
            cutoutCtx.drawImage(img, 0, 0);
            
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            elements.uploadZone.style.display = 'none';
            elements.editorContainer.style.display = 'flex';
            
            // Set image directly to the poster preview
            elements.posterProductImage.src = 'assets/processed_product.png';
            elements.posterProductImage.style.display = 'block';
            elements.posterPlaceholder.style.display = 'none';
            
            resetAdjustments();
            applyCurrentFiltersAndDraw();
            setTool('view');
            
            showStatusMessage('تم تحميل منتج ديمو مفرغ وجاهز بالذكاء الاصطناعي!', 'success');
        };
        img.src = 'assets/processed_product.png';
    });
    elements.uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadZone.style.borderColor = 'var(--secondary)';
    });
    elements.uploadZone.addEventListener('dragleave', () => {
        elements.uploadZone.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    });
    elements.uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadZone.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        if (e.dataTransfer.files.length > 0) {
            elements.imageUpload.files = e.dataTransfer.files;
            handleImageUpload();
        }
    });

    function handleImageUpload() {
        const file = elements.imageUpload.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                state.originalImage = img;
                
                // Initialize canvas sizes
                // Restrict very large images to reasonable sizes for performance (max 2000px)
                let w = img.width;
                let h = img.height;
                const maxDim = 2000;
                if (w > maxDim || h > maxDim) {
                    if (w > h) {
                        h = Math.round((h * maxDim) / w);
                        w = maxDim;
                    } else {
                        w = Math.round((w * maxDim) / h);
                        h = maxDim;
                    }
                }
                
                state.canvasWidth = w;
                state.canvasHeight = h;
                
                // Set sizes for editing canvas and layer canvases
                elements.canvas.width = w;
                elements.canvas.height = h;
                
                sourceCanvas.width = w;
                sourceCanvas.height = h;
                
                sourceCtx.imageSmoothingEnabled = true;
                sourceCtx.imageSmoothingQuality = 'high';
                sourceCtx.drawImage(img, 0, 0, w, h);
                
                cutoutCanvas.width = w;
                cutoutCanvas.height = h;
                
                cutoutCtx.imageSmoothingEnabled = true;
                cutoutCtx.imageSmoothingQuality = 'high';
                // Cutout layer initially matches source (fully opaque)
                cutoutCtx.clearRect(0, 0, w, h);
                cutoutCtx.drawImage(sourceCanvas, 0, 0);
                
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                // Switch visibility from upload zone to editor
                elements.uploadZone.style.display = 'none';
                elements.editorContainer.style.display = 'flex';
                
                // Reset edit state
                resetAdjustments();
                applyCurrentFiltersAndDraw();
                
                // Show view tool as active
                setTool('view');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // -------------------------------------------------------------------------
    // 4. Editing Tools Setup & Navigation
    // -------------------------------------------------------------------------
    const tools = [
        { btn: elements.toolView, name: 'view' },
        { btn: elements.toolMagic, name: 'magic' },
        { btn: elements.toolChroma, name: 'chroma' },
        { btn: elements.toolErase, name: 'erase' },
        { btn: elements.toolRestore, name: 'restore' }
    ];

    tools.forEach(t => {
        t.btn.addEventListener('click', () => setTool(t.name));
    });

    function setTool(toolName) {
        state.currentTool = toolName;
        
        // Manage active button state
        tools.forEach(t => {
            if (t.name === toolName) {
                t.btn.classList.add('active');
            } else {
                t.btn.classList.remove('active');
            }
        });
        
        // Hide/Show tool settings panels
        elements.chromaSettings.style.display = (toolName === 'chroma') ? 'flex' : 'none';
        elements.brushSettings.style.display = (toolName === 'erase' || toolName === 'restore') ? 'flex' : 'none';
        
        // Configure brush cursor display
        if (toolName === 'erase' || toolName === 'restore') {
            elements.brushCursor.style.display = 'block';
            updateBrushCursorSize();
        } else {
            elements.brushCursor.style.display = 'none';
        }
        
        // Automatic Background Removal invocation directly on click
        if (toolName === 'magic') {
            runAutoBackgroundRemoval();
        }
    }

    // Adjusting Brush Size and Hardness sliders
    elements.brushSize.addEventListener('input', () => {
        state.brush.size = parseInt(elements.brushSize.value);
        elements.brushSizeVal.textContent = `${state.brush.size}px`;
        updateBrushCursorSize();
    });

    elements.brushHardness.addEventListener('input', () => {
        state.brush.hardness = parseInt(elements.brushHardness.value);
        elements.brushHardnessVal.textContent = `${state.brush.hardness}%`;
    });

    function updateBrushCursorSize() {
        const rect = elements.canvas.getBoundingClientRect();
        // Scale brush cursor size to match actual displayed canvas size
        const displayRatio = rect.width / elements.canvas.width;
        const displaySize = state.brush.size * displayRatio;
        elements.brushCursor.style.width = `${displaySize}px`;
        elements.brushCursor.style.height = `${displaySize}px`;
    }

    // -------------------------------------------------------------------------
    // 5. Automatic Background Removal (Using dynamically loaded WASM API)
    // -------------------------------------------------------------------------
    let imglyLoaded = false;
    
    async function runAutoBackgroundRemoval() {
        if (!state.originalImage) return;
        
        // Show loading state
        showCanvasLoader('جاري معالجة الصورة وإزالة الخلفية تلقائياً...');
        
        try {
            // Load script dynamically from jsdelivr if not loaded already
            if (!imglyLoaded) {
                await loadScript('https://cdn.jsdelivr.net/npm/@imgly/background-removal@latest/dist/bundle.js');
                imglyLoaded = true;
            }
            
            // Create a blob from source canvas
            const blob = await new Promise(resolve => sourceCanvas.toBlob(resolve, 'image/png'));
            
            // Run background removal
            const resultBlob = await imglyRemoveBackground(blob, {
                progress: (step, current, total) => {
                    // Update progress on loader
                    const percent = Math.round((current / total) * 100);
                    updateCanvasLoaderText(`جاري المعالجة: ${step} (${percent}%)`);
                }
            });
            
            // Load result blob back to cutoutCanvas
            const resultImg = new Image();
            await new Promise((resolve, reject) => {
                resultImg.onload = () => {
                    cutoutCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
                    cutoutCtx.drawImage(resultImg, 0, 0, state.canvasWidth, state.canvasHeight);
                    resolve();
                };
                resultImg.onerror = reject;
                resultImg.src = URL.createObjectURL(resultBlob);
            });
            
            hideCanvasLoader();
            applyCurrentFiltersAndDraw();
            showStatusMessage('تمت إزالة الخلفية تلقائياً بنجاح!', 'success');
            
            // Switch tool back to view
            setTool('view');
            
        } catch (error) {
            console.error('Failed to run automatic background removal:', error);
            hideCanvasLoader();
            showStatusMessage('تعذر إزالة الخلفية تلقائياً. يرجى استخدام قطارة الألوان أو أداة المسح اليدوية.', 'error');
            setTool('chroma'); // fallback to color keying
        }
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // -------------------------------------------------------------------------
    // 6. Chroma Key (Color Dropper Background Removal)
    // -------------------------------------------------------------------------
    elements.chromaTolerance.addEventListener('input', () => {
        state.chroma.tolerance = parseInt(elements.chromaTolerance.value);
        elements.toleranceVal.textContent = state.chroma.tolerance;
        if (state.cutoutApplied) {
            applyChromaKeyRemoval();
        }
    });

    function applyChromaKeyRemoval() {
        showCanvasLoader('جاري تصفية اللون...');
        setTimeout(() => {
            const tr = state.chroma.color[0];
            const tg = state.chroma.color[1];
            const tb = state.chroma.color[2];
            const tol = state.chroma.tolerance;

            // Start from source image
            const imgData = sourceCtx.getImageData(0, 0, state.canvasWidth, state.canvasHeight);
            const data = imgData.data;

            // Remove pixels with RGB matching selected color within tolerance
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i+1];
                const b = data[i+2];

                // Calculate Euclidean distance in RGB color space
                const dist = Math.sqrt(
                    Math.pow(r - tr, 2) + 
                    Math.pow(g - tg, 2) + 
                    Math.pow(b - tb, 2)
                );

                // If color matches within tolerance threshold, set pixel alpha to 0
                if (dist <= tol * 2.55) { // 2.55 to scale 1-100 to 0-255
                    data[i+3] = 0;
                }
            }

            // Put modified pixel data into cutout layer
            cutoutCtx.putImageData(imgData, 0, 0);
            
            state.cutoutApplied = true;
            hideCanvasLoader();
            applyCurrentFiltersAndDraw();
        }, 50);
    }

    // -------------------------------------------------------------------------
    // 7. Manual Brush Eraser / Restore
    // -------------------------------------------------------------------------
    
    // Tracks mouse position relative to canvas coordinate space
    function getCanvasCoords(e) {
        const rect = elements.canvas.getBoundingClientRect();
        const scaleX = elements.canvas.width / rect.width;
        const scaleY = elements.canvas.height / rect.height;
        
        let clientX = e.clientX;
        let clientY = e.clientY;
        
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    // Event listener for brush cursor overlay movement
    elements.canvas.addEventListener('mousemove', (e) => {
        if (state.currentTool === 'erase' || state.currentTool === 'restore') {
            const rect = elements.canvas.getBoundingClientRect();
            elements.brushCursor.style.left = `${e.clientX - rect.left}px`;
            elements.brushCursor.style.top = `${e.clientY - rect.top}px`;
        }
    });

    elements.canvas.addEventListener('mousedown', startDrawing);
    elements.canvas.addEventListener('mousemove', drawBrushStroke);
    window.addEventListener('mouseup', stopDrawing);

    // Mobile touch events
    elements.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrawing(e);
    });
    elements.canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        drawBrushStroke(e);
    });
    elements.canvas.addEventListener('touchend', stopDrawing);

    function startDrawing(e) {
        if (state.currentTool === 'view') return;
        
        const coords = getCanvasCoords(e);

        if (state.currentTool === 'chroma') {
            // Click-to-pick background color
            const pixel = sourceCtx.getImageData(coords.x, coords.y, 1, 1).data;
            state.chroma.color = [pixel[0], pixel[1], pixel[2]];
            
            // Update UI preview element
            elements.chromaColorPreview.style.backgroundColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
            elements.chromaColorPreview.style.borderColor = (pixel[0]+pixel[1]+pixel[2] > 600) ? '#aaa' : '#fff';
            document.getElementById('chroma-color-text').textContent = `RGB(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
            
            applyChromaKeyRemoval();
        } else if (state.currentTool === 'erase' || state.currentTool === 'restore') {
            state.brush.isDrawing = true;
            applyBrushStroke(coords.x, coords.y);
        }
    }

    function drawBrushStroke(e) {
        if (!state.brush.isDrawing) return;
        const coords = getCanvasCoords(e);
        applyBrushStroke(coords.x, coords.y);
    }

    function stopDrawing() {
        if (state.brush.isDrawing) {
            state.brush.isDrawing = false;
            applyCurrentFiltersAndDraw(); // Refresh output
        }
    }

    function applyBrushStroke(cx, cy) {
        const radius = state.brush.size / 2;
        const hardness = state.brush.hardness / 100;
        
        // Grab pixel data around the brush impact point to modify
        const startX = Math.max(0, Math.floor(cx - radius));
        const startY = Math.max(0, Math.floor(cy - radius));
        const width = Math.min(state.canvasWidth - startX, Math.ceil(radius * 2));
        const height = Math.min(state.canvasHeight - startY, Math.ceil(radius * 2));
        
        if (width <= 0 || height <= 0) return;
        
        const cutoutData = cutoutCtx.getImageData(startX, startY, width, height);
        const sourceData = sourceCtx.getImageData(startX, startY, width, height);
        
        const cPixels = cutoutData.data;
        const sPixels = sourceData.data;
        
        for (let y = 0; y < height; y++) {
            const py = startY + y;
            const dy = py - cy;
            
            for (let x = 0; x < width; x++) {
                const px = startX + x;
                const dx = px - cx;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist <= radius) {
                    const idx = (y * width + x) * 4;
                    
                    // Determine brush intensity (soft edges interpolation)
                    let intensity = 1.0;
                    if (dist > radius * hardness) {
                        intensity = 1.0 - (dist - radius * hardness) / (radius * (1 - hardness));
                    }
                    
                    if (state.currentTool === 'erase') {
                        // Blend current alpha to transparent
                        cPixels[idx + 3] = Math.round(cPixels[idx + 3] * (1 - intensity));
                    } else if (state.currentTool === 'restore') {
                        // Blend back towards the original source opacity
                        const targetAlpha = sPixels[idx + 3];
                        const delta = targetAlpha - cPixels[idx + 3];
                        cPixels[idx + 3] = Math.round(cPixels[idx + 3] + delta * intensity);
                    }
                }
            }
        }
        
        cutoutCtx.putImageData(cutoutData, startX, startY);
        
        // Real-time canvas render while drawing
        // We draw directly on screen canvas without heavy enhancements to maintain 60FPS
        ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
        ctx.drawImage(cutoutCanvas, 0, 0);
    }

    // -------------------------------------------------------------------------
    // 8. Image Enhancements (Brightness, Contrast, Saturation, Sharpness)
    // -------------------------------------------------------------------------
    elements.brightnessRange.addEventListener('input', updateEnhancements);
    elements.contrastRange.addEventListener('input', updateEnhancements);
    elements.saturationRange.addEventListener('input', updateEnhancements);
    elements.sharpnessRange.addEventListener('input', updateEnhancements);
    
    function updateEnhancements() {
        state.adjustments.brightness = parseInt(elements.brightnessRange.value);
        state.adjustments.contrast = parseInt(elements.contrastRange.value);
        state.adjustments.saturation = parseInt(elements.saturationRange.value);
        state.adjustments.sharpness = parseInt(elements.sharpnessRange.value);
        
        applyCurrentFiltersAndDraw();
    }

    function applyCurrentFiltersAndDraw() {
        if (!state.originalImage) return;

        // Perform canvas operations
        const imgData = cutoutCtx.getImageData(0, 0, state.canvasWidth, state.canvasHeight);
        const data = imgData.data;

        const b = state.adjustments.brightness / 100;
        const c = state.adjustments.contrast / 100;
        const s = state.adjustments.saturation / 100;
        const sh = state.adjustments.sharpness / 100;

        // 1. Adjust brightness, contrast, and saturation pixel-by-pixel
        // Avoid calculating if values are default for speed
        if (b !== 1 || c !== 1 || s !== 1) {
            for (let i = 0; i < data.length; i += 4) {
                if (data[i+3] === 0) continue; // Skip transparent pixels

                let r = data[i];
                let g = data[i+1];
                let b_pixel = data[i+2];

                // Brightness
                r *= b;
                g *= b;
                b_pixel *= b;

                // Contrast
                r = (r - 128) * c + 128;
                g = (g - 128) * c + 128;
                b_pixel = (b_pixel - 128) * c + 128;

                // Saturation (Using luminance weights)
                const lum = 0.299 * r + 0.587 * g + 0.114 * b_pixel;
                r = lum + (r - lum) * s;
                g = lum + (g - lum) * s;
                b_pixel = lum + (b_pixel - lum) * s;

                // Clamp to 0-255 bounds
                data[i] = Math.min(255, Math.max(0, r));
                data[i+1] = Math.min(255, Math.max(0, g));
                data[i+2] = Math.min(255, Math.max(0, b_pixel));
            }
        }

        // Put primary filtered data onto the screen canvas
        ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
        
        // Draw the modified pixels
        let filteredCanvas = document.createElement('canvas');
        filteredCanvas.width = state.canvasWidth;
        filteredCanvas.height = state.canvasHeight;
        filteredCanvas.getContext('2d').putImageData(imgData, 0, 0);

        // Apply drop shadow directly onto the canvas (so it's baked into exported image)
        const shadowVal = parseInt(elements.productShadowDepth.value);
        if (shadowVal > 0) {
            const scaleFactor = state.canvasWidth / 300; // Scale shadow size relative to display ratio
            ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
            ctx.shadowBlur = shadowVal * scaleFactor;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = (shadowVal / 2) * scaleFactor;
        } else {
            ctx.shadowColor = 'transparent';
        }

        // 2. Convolution Sharpness filter (Applied on top if active)
        if (sh > 0) {
            const finalImgData = applySharpnessFilter(filteredCanvas, sh);
            let sharpCanvas = document.createElement('canvas');
            sharpCanvas.width = state.canvasWidth;
            sharpCanvas.height = state.canvasHeight;
            sharpCanvas.getContext('2d').putImageData(finalImgData, 0, 0);
            ctx.drawImage(sharpCanvas, 0, 0);
        } else {
            ctx.drawImage(filteredCanvas, 0, 0);
        }

        // Reset shadow properties so it doesn't taint other drawings (like brush cursors)
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    function applySharpnessFilter(tempCanvas, amount) {
        const tempCtx = tempCanvas.getContext('2d');
        const w = tempCanvas.width;
        const h = tempCanvas.height;
        const srcData = tempCtx.getImageData(0, 0, w, h);
        const src = srcData.data;
        
        const output = ctx.createImageData(w, h);
        const out = output.data;

        // Laplacian kernel matrix for edge-detection based sharpening:
        // [  0, -1,  0 ]
        // [ -1,  5, -1 ]
        // [  0, -1,  0 ]
        // Blended with original image according to weight 'amount'
        const k0 = -amount;
        const k1 = 1 + 4 * amount;

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const idx = (y * w + x) * 4;
                if (src[idx+3] === 0) continue; // Skip transparent pixel

                // RGB channel filters
                for (let c = 0; c < 3; c++) {
                    const center = src[idx + c];
                    const top = src[((y - 1) * w + x) * 4 + c];
                    const bottom = src[((y + 1) * w + x) * 4 + c];
                    const left = src[(y * w + (x - 1)) * 4 + c];
                    const right = src[(y * w + (x + 1)) * 4 + c];

                    const val = k1 * center + k0 * (top + bottom + left + right);
                    out[idx + c] = Math.min(255, Math.max(0, val));
                }
                
                // Retain alpha channel
                out[idx + 3] = src[idx + 3];
            }
        }
        
        // Edge boundaries padding fallback (keep original values)
        for (let i = 0; i < out.length; i += 4) {
            if (out[i+3] === 0 && src[i+3] > 0) {
                out[i] = src[i];
                out[i+1] = src[i+1];
                out[i+2] = src[i+2];
                out[i+3] = src[i+3];
            }
        }
        
        return output;
    }

    elements.resetImageBtn.addEventListener('click', () => {
        if (!state.originalImage) return;
        showCanvasLoader('جاري إعادة تعيين الصورة...');
        setTimeout(() => {
            cutoutCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
            cutoutCtx.drawImage(sourceCanvas, 0, 0);
            resetAdjustments();
            applyCurrentFiltersAndDraw();
            hideCanvasLoader();
            showStatusMessage('تمت إعادة ضبط الصورة للأصل!', 'info');
        }, 50);
    });

    function resetAdjustments() {
        elements.brightnessRange.value = 100;
        elements.contrastRange.value = 100;
        elements.saturationRange.value = 100;
        elements.sharpnessRange.value = 0;
        
        state.adjustments = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            sharpness: 0
        };
        state.cutoutApplied = false;
    }

    // -------------------------------------------------------------------------
    // Aspect Ratio & Layout Adjustments for Product Image
    // -------------------------------------------------------------------------
    function adjustPosterImageAspect() {
        const img = elements.posterProductImage;
        const container = img.parentElement; // .poster-image-side
        
        if (!state.originalImage || !img.src || img.style.display === 'none') return;
        
        // Get container dimensions
        const containerWidth = container.clientWidth || 280;
        const containerHeight = container.clientHeight || 500;
        
        // Use canvas dimensions as the natural image dimensions
        const imgWidth = state.canvasWidth;
        const imgHeight = state.canvasHeight;
        
        if (!imgWidth || !imgHeight) return;
        
        const containerRatio = containerWidth / containerHeight;
        const imgRatio = imgWidth / imgHeight;
        
        let targetWidth, targetHeight;
        
        // Max dimensions (85% height limit from CSS)
        const maxH = containerHeight * 0.85;
        const maxW = containerWidth;
        
        if (imgRatio > containerRatio) {
            // Image is wider than container ratio
            targetWidth = maxW;
            targetHeight = maxW / imgRatio;
            
            // If height exceeds maxH, scale down further
            if (targetHeight > maxH) {
                targetHeight = maxH;
                targetWidth = maxH * imgRatio;
            }
        } else {
            // Image is taller than container ratio
            targetHeight = maxH;
            targetWidth = maxH * imgRatio;
            
            // If width exceeds maxW, scale down further
            if (targetWidth > maxW) {
                targetWidth = maxW;
                targetHeight = maxW / imgRatio;
            }
        }
        
        // Set layout width and height in pixels explicitly
        img.style.width = `${Math.round(targetWidth)}px`;
        img.style.height = `${Math.round(targetHeight)}px`;
        img.style.objectFit = 'fill'; 
    }

    elements.posterProductImage.onload = () => {
        adjustPosterImageAspect();
    };

    window.addEventListener('resize', adjustPosterImageAspect);

    // -------------------------------------------------------------------------
    // 9. Update Live Poster Preview
    // -------------------------------------------------------------------------
    elements.applyCutoutBtn.addEventListener('click', () => {
        if (!state.originalImage) return;
        
        // Update the live preview image src with the current canvas contents
        const dataURL = elements.canvas.toDataURL('image/png');
        elements.posterProductImage.src = dataURL;
        
        // Show product image, hide placeholder
        elements.posterProductImage.style.display = 'block';
        elements.posterPlaceholder.style.display = 'none';
        
        // Trigger visual effect indicating update complete
        elements.posterProductImage.style.animation = 'none';
        setTimeout(() => {
            elements.posterProductImage.style.animation = 'floatProduct 4s ease-in-out infinite';
        }, 10);
        
        // Trigger aspect resizing
        adjustPosterImageAspect();

        showStatusMessage('تم تحديث صورة البوستر بالقص الجديد!', 'success');
        
        // Scroll preview into view on mobile
        if (window.innerWidth <= 1024) {
            elements.posterElement.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Form inputs real-time binding
    elements.prodTitle.addEventListener('input', updatePosterTexts);
    elements.prodSubtitle.addEventListener('input', updatePosterTexts);
    elements.prodPrice.addEventListener('input', updatePosterTexts);
    elements.prodFeatures.addEventListener('input', updatePosterFeatures);

    function updatePosterTexts() {
        elements.pTitle.textContent = elements.prodTitle.value || 'اسم المنتج';
        elements.pSubtitle.textContent = elements.prodSubtitle.value || '';
        elements.pPrice.textContent = elements.prodPrice.value || '';
    }

    function updatePosterFeatures() {
        const text = elements.prodFeatures.value;
        const features = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        elements.pFeatures.innerHTML = '';
        if (features.length === 0) {
            // Re-render empty placeholder
            elements.pFeatures.innerHTML = '<li>يرجى إدخال ميزة في القائمة الجانبية</li>';
            return;
        }

        features.forEach(feat => {
            const li = document.createElement('li');
            li.textContent = feat;
            elements.pFeatures.appendChild(li);
        });
    }

    // Initialize Default Features text inside textarea on startup
    elements.prodFeatures.value = [
        "تقنية GaN المتقدمة لشحن فائق السرعة والأمان",
        "يدعم شحن 4 أجهزة في نفس الوقت بأعلى كفاءة",
        "حماية ذكية متكاملة ضد التماس الكهربائي والجهد الزائد",
        "تصميم مدمج وخفيف الوزن مناسب جداً للسفر والعمل"
    ].join('\n');
    updatePosterFeatures();

    // -------------------------------------------------------------------------
    // 10. Brand and Company Logo Handlers
    // -------------------------------------------------------------------------
    elements.brandSelect.addEventListener('change', () => {
        const val = elements.brandSelect.value;
        if (val === 'custom') {
            elements.customBrandUploadGroup.style.display = 'block';
        } else {
            elements.customBrandUploadGroup.style.display = 'none';
            elements.posterBrandLogo.src = brandLogos[val];
        }
    });

    elements.customBrandUpload.addEventListener('change', () => {
        const file = elements.customBrandUpload.files[0];
        if (file) {
            const r = new FileReader();
            r.onload = (e) => {
                elements.posterBrandLogo.src = e.target.result;
            };
            r.readAsDataURL(file);
        }
    });

    elements.companySelect.addEventListener('change', () => {
        const val = elements.companySelect.value;
        if (val === 'custom') {
            elements.customCompanyUploadGroup.style.display = 'block';
        } else {
            elements.customCompanyUploadGroup.style.display = 'none';
            elements.posterCompanyLogo.src = 'assets/company_logo.png';
        }
    });

    elements.customCompanyUpload.addEventListener('change', () => {
        const file = elements.customCompanyUpload.files[0];
        if (file) {
            const r = new FileReader();
            r.onload = (e) => {
                elements.posterCompanyLogo.src = e.target.result;
            };
            r.readAsDataURL(file);
        }
    });

    // -------------------------------------------------------------------------
    // 11. Poster Template & Styling Settings
    // -------------------------------------------------------------------------
    elements.templateOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            elements.templateOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            
            const templateName = opt.getAttribute('data-template');
            
            // Remove previous template classes
            elements.posterElement.className = elements.posterElement.className
                .split(' ')
                .filter(c => !c.startsWith('template-'))
                .join(' ');
                
            elements.posterElement.classList.add(`template-${templateName}`);
        });
    });

    elements.aspectButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.aspectButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const aspect = btn.getAttribute('data-aspect');
            
            elements.posterElement.classList.remove('aspect-vertical', 'aspect-square');
            elements.posterElement.classList.add(`aspect-${aspect}`);
            
            // Recalculate dimensions after aspect change
            setTimeout(adjustPosterImageAspect, 50);
        });
    });

    elements.toggleBadge.addEventListener('change', () => {
        elements.posterAuthorizedBadge.style.display = elements.toggleBadge.checked ? 'block' : 'none';
    });

    elements.togglePrice.addEventListener('change', () => {
        elements.pPriceContainer.style.display = elements.togglePrice.checked ? 'inline-flex' : 'none';
    });

    elements.productShadowDepth.addEventListener('input', () => {
        const val = elements.productShadowDepth.value;
        // Redraw canvas with new shadow, and update poster image
        if (state.originalImage) {
            applyCurrentFiltersAndDraw();
            const dataURL = elements.canvas.toDataURL('image/png');
            elements.posterProductImage.src = dataURL;
        }
    });

    // -------------------------------------------------------------------------
    // 12. Poster Exporting (PNG download via html2canvas)
    // -------------------------------------------------------------------------
    elements.exportPngBtn.addEventListener('click', async () => {
        if (!state.originalImage || elements.posterProductImage.src === '') {
            showStatusMessage('يرجى تحميل صورة منتج وقصها أولاً ليظهر في التصميم!', 'error');
            return;
        }

        // Show exporting state / loading spinner
        const exportBtnText = elements.exportPngBtn.innerHTML;
        elements.exportPngBtn.disabled = true;
        elements.exportPngBtn.innerHTML = 'جاري توليد البوستر بدقة عالية...';

        try {
            // Set up a custom high-quality canvas for the export
            const poster = elements.posterElement;
            const w = poster.offsetWidth;
            const h = poster.offsetHeight;
            const scale = 4; // High-resolution printing scale
            
            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = w * scale;
            exportCanvas.height = h * scale;
            
            const exportCtx = exportCanvas.getContext('2d');
            exportCtx.imageSmoothingEnabled = true;
            exportCtx.imageSmoothingQuality = 'high';

            // Render DOM into canvas
            const canvas = await html2canvas(poster, {
                canvas: exportCanvas,
                useCORS: true,
                allowTaint: true,
                scale: scale, 
                backgroundColor: null,
                logging: false,
                imageTimeout: 0,
                onclone: (documentClone) => {
                    // Force display elements that might be animated/changing
                    const imgClone = documentClone.getElementById('poster-product-image');
                    if (imgClone) {
                        imgClone.style.animation = 'none';
                        imgClone.style.transform = 'none';
                    }
                }
            });

            // Trigger file download
            const link = document.createElement('a');
            const fileName = (elements.prodTitle.value || 'product').trim().replace(/\s+/g, '_');
            link.download = `${fileName}_poster.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            showStatusMessage('تم تحميل البوستر بنجاح!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            showStatusMessage('حدث خطأ أثناء تصدير البوستر. يرجى المحاولة مجدداً.', 'error');
        } finally {
            elements.exportPngBtn.disabled = false;
            elements.exportPngBtn.innerHTML = exportBtnText;
        }
    });

    // -------------------------------------------------------------------------
    // 13. UI Notification & Feedback Helpers
    // -------------------------------------------------------------------------
    
    function showCanvasLoader(text) {
        let loader = document.getElementById('canvas-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'canvas-loader';
            loader.className = 'canvas-loader-overlay';
            loader.innerHTML = `
                <div class="loader-spinner"></div>
                <div class="loader-text" id="canvas-loader-text"></div>
            `;
            elements.canvas.parentElement.appendChild(loader);
        }
        document.getElementById('canvas-loader-text').textContent = text;
        loader.style.display = 'flex';
    }

    function updateCanvasLoaderText(text) {
        const textEl = document.getElementById('canvas-loader-text');
        if (textEl) textEl.textContent = text;
    }

    function hideCanvasLoader() {
        const loader = document.getElementById('canvas-loader');
        if (loader) loader.style.display = 'none';
    }

    function showStatusMessage(text, type = 'info') {
        const alertBox = document.createElement('div');
        alertBox.className = `status-alert alert-${type}`;
        alertBox.textContent = text;
        
        document.body.appendChild(alertBox);
        
        // Slide in, then slide out and delete
        setTimeout(() => alertBox.classList.add('visible'), 50);
        setTimeout(() => {
            alertBox.classList.remove('visible');
            setTimeout(() => alertBox.remove(), 400);
        }, 3500);
    }
});
