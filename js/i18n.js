/**
 * i18n - Internationalization system for ScoreSpacer
 * Supports: Spanish (es), Catalan (ca), English (en)
 */

const translations = {
    es: {
        // Meta
        'meta.description': 'Aplicación web para separar sistemas musicales en partituras PDF y añadir espacio entre ellos para anotaciones.',
        'meta.title': 'ScoreSpacer - Separador de Sistemas Musicales',
        'meta.ogTitle': 'ScoreSpacer - Separador de Sistemas Musicales',
        'meta.ogDescription': 'Añade espacio entre sistemas musicales para anotaciones. Procesamiento 100% en navegador.',

        // Header
        'header.subtitle': 'Añade espacio entre sistemas musicales para anotaciones',

        // Upload
        'upload.dropzone': 'Arrastra un PDF aquí o',
        'upload.selectFile': 'selecciona un archivo',
        'upload.disclaimer.title': 'Aviso legal:',
        'upload.disclaimer.p1': 'Al utilizar esta aplicación, el usuario declara y garantiza que posee los derechos de autor o cuenta con la autorización expresa del titular de los derechos sobre los documentos que sube, o bien que dichos documentos se encuentran en dominio público o están publicados bajo licencias que permiten su reproducción y modificación (como Creative Commons).',
        'upload.disclaimer.p2': 'ScoreSpacer y su creador no asumen responsabilidad alguna por el uso indebido, no autorizado o fraudulento de esta herramienta. El usuario es el único responsable de verificar que dispone de los permisos necesarios para procesar los documentos y de cumplir con la legislación vigente en materia de propiedad intelectual.',

        // Page selection
        'pageSelection.title': 'Selección de páginas',
        'pageSelection.help': 'Haz clic en las páginas para configurar detección y exportación',
        'pageSelection.detectAll': 'Detectar todas',
        'pageSelection.detectNone': 'No detectar ninguna',
        'pageSelection.exportAll': 'Exportar todas',
        'pageSelection.legend.detect': 'Detectar sistemas',
        'pageSelection.legend.export': 'Incluir en exportación',
        'pageSelection.legend.skip': 'Omitir',
        'pageSelection.continue': 'Continuar con el procesamiento',
        'pageSelection.removeFile': 'Quitar archivo',

        // Processing
        'processing.backToSelection': '← Volver a selección',
        'processing.parameters.title': 'Parámetros de detección',
        'processing.parameters.spacing': 'Espacio entre sistemas (px)',
        'processing.parameters.threshold': 'Umbral de detección (%)',
        'processing.parameters.thresholdHelp': 'Porcentaje mínimo de píxeles oscuros para considerar una línea como parte de un sistema',
        'processing.parameters.minGap': 'Separación mínima entre sistemas (px)',
        'processing.parameters.watermark': 'Ocultar marca de agua',
        'processing.parameters.watermarkHelp': 'Por defecto se añade "ScoreSpacer (www.jlmirall.es)" en cada página',
        'processing.continueToExport': 'Continuar a exportar →',

        // Preview
        'preview.title': 'Vista previa de detección',
        'preview.analyze': 'Analizar PDF',
        'preview.analyzing': 'Analizando...',
        'preview.pageIndicator': 'Página {current} de {total}',
        'preview.rotate': 'Rotar',
        'preview.crop': 'Recortar',
        'preview.placeholder': 'Haz clic en "Analizar PDF" para ver la detección de sistemas',
        'preview.projectionTitle': 'Perfil de proyección horizontal',
        'preview.systemsDetected': '{count} sistema{plural} detectado{plural}',
        'preview.dragToAdjust': 'Arrastra los bordes para ajustar',
        'preview.pageSkipped': 'Página omitida (no se detecta ni exporta)',
        'preview.pageExportOnly': 'Página sin detección (se exportará tal cual)',
        'preview.statusDetect': '(detectar)',
        'preview.statusExportOnly': '(solo exportar)',
        'preview.statusSkip': '(omitir)',
        'preview.brightnessContrast': 'Brillo/Contraste',

        // Rotation panel
        'rotation.title': 'Rotación manual',
        'rotation.help': 'Usa las líneas rojas como guía para alinear los pentagramas',
        'rotation.autoDetect': 'Auto-detectar rotación',
        'rotation.detecting': 'Detectando...',
        'rotation.reset': 'Reiniciar',
        'rotation.cancel': 'Cancelar',
        'rotation.apply': 'Aplicar y re-analizar',
        'rotation.applying': 'Aplicando...',

        // Crop panel
        'crop.title': 'Recortar/Ajustar márgenes',
        'crop.help': 'Valores positivos recortan, negativos añaden margen',
        'crop.top': 'Arriba',
        'crop.bottom': 'Abajo',
        'crop.left': 'Izquierda',
        'crop.right': 'Derecha',
        'crop.autoDetect': 'Auto-detectar márgenes',
        'crop.reset': 'Reiniciar',
        'crop.cancel': 'Cancelar',
        'crop.apply': 'Aplicar y re-analizar',
        'crop.applying': 'Aplicando...',
        'crop.invalidSize': 'Los valores de recorte resultan en un tamaño inválido',

        // Brightness/Contrast panel
        'brightnessContrast.title': 'Brillo y Contraste',
        'brightnessContrast.help': 'Ajusta el brillo y contraste para mejorar la detección en escaneos de baja calidad',
        'brightnessContrast.brightness': 'Brillo',
        'brightnessContrast.contrast': 'Contraste',
        'brightnessContrast.presetLight': 'Escaneo claro',
        'brightnessContrast.presetDark': 'Escaneo oscuro',
        'brightnessContrast.presetHighContrast': 'Alto contraste',
        'brightnessContrast.reset': 'Reiniciar',
        'brightnessContrast.cancel': 'Cancelar',
        'brightnessContrast.apply': 'Aplicar y re-analizar',
        'brightnessContrast.applying': 'Aplicando...',

        // Undo/Redo
        'undo.title': 'Deshacer (Ctrl+Z)',
        'redo.title': 'Rehacer (Ctrl+Shift+Z)',

        // Generate
        'generate.filename': 'Nombre del archivo:',
        'generate.button': 'Generar PDF con espaciado',
        'generate.processing': 'Procesando...',
        'generate.success': 'PDF generado correctamente',
        'generate.noPages': 'No hay páginas seleccionadas para exportar',

        // Export section
        'export.title': 'Configuración de exportación',
        'export.preview': 'Vista previa',
        'export.noSystems': 'No hay sistemas detectados',
        'export.moreSystems': '... y {count} sistemas más',
        'export.backToProcessing': '← Volver a ajustes',

        // Systems
        'system.split': 'Dividir sistema en dos',
        'system.delete': 'Eliminar sistema',
        'system.add': '+ Añadir sistema',
        'system.addTitle': 'Añadir un nuevo sistema manualmente',

        // Thumbnails
        'thumbnail.detect': 'Detectar',
        'thumbnail.detectActive': '✓ Detectar',
        'thumbnail.export': 'Exportar',
        'thumbnail.exportActive': '✓ Exportar',
        'thumbnail.page': 'Página {num}',
        'thumbnail.badgeDetect': 'Detectar sistemas',
        'thumbnail.badgeExport': 'Incluir en exportación',
        'thumbnail.generating': 'Generando miniaturas...',
        'thumbnail.rotated': 'Rotado',
        'thumbnail.cropped': 'Recortado',
        'thumbnail.brightnessAdjusted': 'Brillo ajustado',
        'thumbnail.systemsCount': '{count} sistemas',
        'thumbnail.systemsCountSingular': '{count} sistema',

        // Wizard
        'wizard.step1': 'Cargar',
        'wizard.step2': 'Seleccionar',
        'wizard.step3': 'Ajustar',
        'wizard.step4': 'Exportar',

        // Config sidebar
        'config.toggle': 'Configuración',
        'config.title': 'Parámetros de detección',

        // Toolbar
        'toolbar.rotate': 'Rotar página',
        'toolbar.crop': 'Recortar página',
        'toolbar.brightness': 'Brillo y contraste',
        'toolbar.addSystem': 'Añadir sistema',
        'toolbar.undo': 'Deshacer',
        'toolbar.redo': 'Rehacer',

        // Footer
        'footer.main': 'ScoreSpacer - Procesamiento 100% en navegador',
        'footer.createdBy': 'Creado por',
        'footer.withHelpOf': 'con ayuda de',
        'footer.support': 'Invítame a una horchata',

        // Donation modal
        'donation.title': '¡Gracias por usar ScoreSpacer!',
        'donation.message': 'Si esta herramienta te resulta útil, considera apoyar su desarrollo con una pequeña donación.',
        'donation.note': 'Tu apoyo ayuda a mantener y mejorar esta herramienta gratuita.',
        'donation.support': 'Invítame a una horchata',
        'donation.skip': 'Continuar sin donar',

        // Help modal
        'help.title': 'ScoreSpacer',
        'help.tagline': 'Separador de Sistemas Musicales',
        'help.whatIs.title': '¿Qué es ScoreSpacer?',
        'help.whatIs.content': 'ScoreSpacer es una herramienta web gratuita que permite añadir espacio entre los sistemas musicales de una partitura en formato PDF. Este espacio adicional resulta ideal para escribir anotaciones, digitaciones, arcos, dinámicas u otras indicaciones durante el estudio o la enseñanza musical.',
        'help.features.title': 'Características principales',
        'help.features.browser': 'Procesamiento 100% en navegador:',
        'help.features.browserDesc': 'Tus archivos nunca salen de tu dispositivo. No se suben a ningún servidor.',
        'help.features.detection': 'Detección automática de sistemas:',
        'help.features.detectionDesc': 'El algoritmo identifica automáticamente los sistemas musicales de cada página.',
        'help.features.manual': 'Edición manual:',
        'help.features.manualDesc': 'Puedes ajustar, dividir, eliminar o añadir sistemas manualmente.',
        'help.features.rotation': 'Rotación y recorte:',
        'help.features.rotationDesc': 'Corrige páginas escaneadas torcidas o con márgenes excesivos.',
        'help.features.export': 'Exportación a PDF A4:',
        'help.features.exportDesc': 'Genera un nuevo PDF optimizado para impresión.',
        'help.howTo.title': 'Cómo usar ScoreSpacer',
        'help.howTo.step1': 'Sube tu PDF:',
        'help.howTo.step1Desc': 'Arrastra el archivo o haz clic para seleccionarlo.',
        'help.howTo.step2': 'Selecciona las páginas:',
        'help.howTo.step2Desc': 'Elige qué páginas quieres procesar y cuáles incluir en la exportación.',
        'help.howTo.step3': 'Ajusta los parámetros:',
        'help.howTo.step3Desc': 'Configura el espacio entre sistemas y los umbrales de detección.',
        'help.howTo.step4': 'Analiza:',
        'help.howTo.step4Desc': 'Haz clic en "Analizar PDF" para detectar los sistemas.',
        'help.howTo.step5': 'Revisa y edita:',
        'help.howTo.step5Desc': 'Ajusta manualmente los sistemas si es necesario.',
        'help.howTo.step6': 'Genera el PDF:',
        'help.howTo.step6Desc': 'Descarga tu partitura con el espaciado añadido.',
        'help.tips.title': 'Consejos',
        'help.tips.tip1': 'Para partituras escaneadas, usa la función de rotación si los pentagramas no están perfectamente horizontales.',
        'help.tips.tip2': 'Ajusta el umbral de detección si el algoritmo no detecta correctamente los sistemas.',
        'help.tips.tip3': 'Usa el recorte para eliminar márgenes innecesarios o encabezados.',
        'help.footer.createdBy': 'Creado por',
        'help.footer.version': 'Versión 1.2',

        // Errors
        'error.loadPdf': 'Error al cargar el PDF:',
        'error.analyze': 'Error al analizar:',
        'error.rotation': 'Error al aplicar rotación:',
        'error.crop': 'Error al aplicar recorte:',
        'error.brightnessContrast': 'Error al aplicar brillo/contraste:',
        'error.generate': 'Error al generar PDF:',

        // Language selector
        'language.label': 'Idioma',
        'language.es': 'Español',
        'language.ca': 'Català',
        'language.en': 'English'
    },

    ca: {
        // Meta
        'meta.description': 'Aplicació web per separar sistemes musicals en partitures PDF i afegir espai entre ells per a anotacions.',
        'meta.title': 'ScoreSpacer - Separador de Sistemes Musicals',
        'meta.ogTitle': 'ScoreSpacer - Separador de Sistemes Musicals',
        'meta.ogDescription': 'Afegeix espai entre sistemes musicals per a anotacions. Processament 100% en navegador.',

        // Header
        'header.subtitle': 'Afegeix espai entre sistemes musicals per a anotacions',

        // Upload
        'upload.dropzone': 'Arrossega un PDF aquí o',
        'upload.selectFile': 'selecciona un arxiu',
        'upload.disclaimer.title': 'Avís legal:',
        'upload.disclaimer.p1': "En utilitzar aquesta aplicació, l'usuari declara i garanteix que posseeix els drets d'autor o compta amb l'autorització expressa del titular dels drets sobre els documents que puja, o bé que aquests documents es troben en domini públic o estan publicats sota llicències que permeten la seva reproducció i modificació (com Creative Commons).",
        'upload.disclaimer.p2': "ScoreSpacer i el seu creador no assumeixen cap responsabilitat per l'ús indegut, no autoritzat o fraudulent d'aquesta eina. L'usuari és l'únic responsable de verificar que disposa dels permisos necessaris per processar els documents i de complir amb la legislació vigent en matèria de propietat intel·lectual.",

        // Page selection
        'pageSelection.title': 'Selecció de pàgines',
        'pageSelection.help': 'Fes clic a les pàgines per configurar detecció i exportació',
        'pageSelection.detectAll': 'Detectar totes',
        'pageSelection.detectNone': 'No detectar cap',
        'pageSelection.exportAll': 'Exportar totes',
        'pageSelection.legend.detect': 'Detectar sistemes',
        'pageSelection.legend.export': "Incloure en l'exportació",
        'pageSelection.legend.skip': 'Ometre',
        'pageSelection.continue': 'Continuar amb el processament',
        'pageSelection.removeFile': 'Treure arxiu',

        // Processing
        'processing.backToSelection': '← Tornar a selecció',
        'processing.parameters.title': 'Paràmetres de detecció',
        'processing.parameters.spacing': 'Espai entre sistemes (px)',
        'processing.parameters.threshold': 'Llindar de detecció (%)',
        'processing.parameters.thresholdHelp': "Percentatge mínim de píxels foscos per considerar una línia com a part d'un sistema",
        'processing.parameters.minGap': 'Separació mínima entre sistemes (px)',
        'processing.parameters.watermark': "Amagar marca d'aigua",
        'processing.parameters.watermarkHelp': 'Per defecte s\'afegeix "ScoreSpacer (www.jlmirall.es)" a cada pàgina',
        'processing.continueToExport': 'Continuar a exportar →',

        // Preview
        'preview.title': 'Vista prèvia de detecció',
        'preview.analyze': 'Analitzar PDF',
        'preview.analyzing': 'Analitzant...',
        'preview.pageIndicator': 'Pàgina {current} de {total}',
        'preview.rotate': 'Rotar',
        'preview.crop': 'Retallar',
        'preview.placeholder': 'Fes clic a "Analitzar PDF" per veure la detecció de sistemes',
        'preview.projectionTitle': 'Perfil de projecció horitzontal',
        'preview.systemsDetected': '{count} sistema{plural} detectat{plural}',
        'preview.dragToAdjust': 'Arrossega les vores per ajustar',
        'preview.pageSkipped': 'Pàgina omesa (no es detecta ni exporta)',
        'preview.pageExportOnly': 'Pàgina sense detecció (s\'exportarà tal qual)',
        'preview.statusDetect': '(detectar)',
        'preview.statusExportOnly': '(només exportar)',
        'preview.statusSkip': '(ometre)',
        'preview.brightnessContrast': 'Brillantor/Contrast',

        // Rotation panel
        'rotation.title': 'Rotació manual',
        'rotation.help': 'Utilitza les línies vermelles com a guia per alinear els pentagrames',
        'rotation.autoDetect': 'Auto-detectar rotació',
        'rotation.detecting': 'Detectant...',
        'rotation.reset': 'Reiniciar',
        'rotation.cancel': 'Cancel·lar',
        'rotation.apply': 'Aplicar i re-analitzar',
        'rotation.applying': 'Aplicant...',

        // Crop panel
        'crop.title': 'Retallar/Ajustar marges',
        'crop.help': 'Valors positius retallen, negatius afegeixen marge',
        'crop.top': 'Dalt',
        'crop.bottom': 'Baix',
        'crop.left': 'Esquerra',
        'crop.right': 'Dreta',
        'crop.autoDetect': 'Auto-detectar marges',
        'crop.reset': 'Reiniciar',
        'crop.cancel': 'Cancel·lar',
        'crop.apply': 'Aplicar i re-analitzar',
        'crop.applying': 'Aplicant...',
        'crop.invalidSize': 'Els valors de retall resulten en una mida invàlida',

        // Brightness/Contrast panel
        'brightnessContrast.title': 'Brillantor i Contrast',
        'brightnessContrast.help': 'Ajusta la brillantor i el contrast per millorar la detecció en escanejats de baixa qualitat',
        'brightnessContrast.brightness': 'Brillantor',
        'brightnessContrast.contrast': 'Contrast',
        'brightnessContrast.presetLight': 'Escaneig clar',
        'brightnessContrast.presetDark': 'Escaneig fosc',
        'brightnessContrast.presetHighContrast': 'Alt contrast',
        'brightnessContrast.reset': 'Reiniciar',
        'brightnessContrast.cancel': 'Cancel·lar',
        'brightnessContrast.apply': 'Aplicar i re-analitzar',
        'brightnessContrast.applying': 'Aplicant...',

        // Undo/Redo
        'undo.title': 'Desfer (Ctrl+Z)',
        'redo.title': 'Refer (Ctrl+Shift+Z)',

        // Generate
        'generate.filename': "Nom de l'arxiu:",
        'generate.button': 'Generar PDF amb espaiat',
        'generate.processing': 'Processant...',
        'generate.success': 'PDF generat correctament',
        'generate.noPages': "No hi ha pàgines seleccionades per exportar",

        // Export section
        'export.title': "Configuració d'exportació",
        'export.preview': 'Vista prèvia',
        'export.noSystems': 'No hi ha sistemes detectats',
        'export.moreSystems': '... i {count} sistemes més',
        'export.backToProcessing': '← Tornar a ajustos',

        // Systems
        'system.split': 'Dividir sistema en dos',
        'system.delete': 'Eliminar sistema',
        'system.add': '+ Afegir sistema',
        'system.addTitle': 'Afegir un nou sistema manualment',

        // Thumbnails
        'thumbnail.detect': 'Detectar',
        'thumbnail.detectActive': '✓ Detectar',
        'thumbnail.export': 'Exportar',
        'thumbnail.exportActive': '✓ Exportar',
        'thumbnail.page': 'Pàgina {num}',
        'thumbnail.badgeDetect': 'Detectar sistemes',
        'thumbnail.badgeExport': "Incloure en l'exportació",
        'thumbnail.generating': 'Generant miniatures...',
        'thumbnail.rotated': 'Rotat',
        'thumbnail.cropped': 'Retallat',
        'thumbnail.brightnessAdjusted': 'Brillantor ajustada',
        'thumbnail.systemsCount': '{count} sistemes',
        'thumbnail.systemsCountSingular': '{count} sistema',

        // Wizard
        'wizard.step1': 'Carregar',
        'wizard.step2': 'Seleccionar',
        'wizard.step3': 'Ajustar',
        'wizard.step4': 'Exportar',

        // Config sidebar
        'config.toggle': 'Configuració',
        'config.title': 'Paràmetres de detecció',

        // Toolbar
        'toolbar.rotate': 'Rotar pàgina',
        'toolbar.crop': 'Retallar pàgina',
        'toolbar.brightness': 'Brillantor i contrast',
        'toolbar.addSystem': 'Afegir sistema',
        'toolbar.undo': 'Desfer',
        'toolbar.redo': 'Refer',

        // Footer
        'footer.main': 'ScoreSpacer - Processament 100% en navegador',
        'footer.createdBy': 'Creat per',
        'footer.withHelpOf': "amb l'ajuda de",
        'footer.support': "Convida'm a una orxata",

        // Donation modal
        'donation.title': 'Gràcies per utilitzar ScoreSpacer!',
        'donation.message': 'Si aquesta eina et resulta útil, considera donar suport al seu desenvolupament amb una petita donació.',
        'donation.note': 'El teu suport ajuda a mantenir i millorar aquesta eina gratuïta.',
        'donation.support': "Convida'm a una orxata",
        'donation.skip': 'Continuar sense donar',

        // Help modal
        'help.title': 'ScoreSpacer',
        'help.tagline': 'Separador de Sistemes Musicals',
        'help.whatIs.title': 'Què és ScoreSpacer?',
        'help.whatIs.content': "ScoreSpacer és una eina web gratuïta que permet afegir espai entre els sistemes musicals d'una partitura en format PDF. Aquest espai addicional resulta ideal per escriure anotacions, digitacions, arcs, dinàmiques o altres indicacions durant l'estudi o l'ensenyament musical.",
        'help.features.title': 'Característiques principals',
        'help.features.browser': 'Processament 100% en navegador:',
        'help.features.browserDesc': 'Els teus arxius mai surten del teu dispositiu. No es pugen a cap servidor.',
        'help.features.detection': 'Detecció automàtica de sistemes:',
        'help.features.detectionDesc': "L'algoritme identifica automàticament els sistemes musicals de cada pàgina.",
        'help.features.manual': 'Edició manual:',
        'help.features.manualDesc': 'Pots ajustar, dividir, eliminar o afegir sistemes manualment.',
        'help.features.rotation': 'Rotació i retall:',
        'help.features.rotationDesc': 'Corregeix pàgines escanejades tortes o amb marges excessius.',
        'help.features.export': 'Exportació a PDF A4:',
        'help.features.exportDesc': "Genera un nou PDF optimitzat per a impressió.",
        'help.howTo.title': 'Com utilitzar ScoreSpacer',
        'help.howTo.step1': 'Puja el teu PDF:',
        'help.howTo.step1Desc': 'Arrossega l\'arxiu o fes clic per seleccionar-lo.',
        'help.howTo.step2': 'Selecciona les pàgines:',
        'help.howTo.step2Desc': "Tria quines pàgines vols processar i quines incloure a l'exportació.",
        'help.howTo.step3': 'Ajusta els paràmetres:',
        'help.howTo.step3Desc': "Configura l'espai entre sistemes i els llindars de detecció.",
        'help.howTo.step4': 'Analitza:',
        'help.howTo.step4Desc': 'Fes clic a "Analitzar PDF" per detectar els sistemes.',
        'help.howTo.step5': 'Revisa i edita:',
        'help.howTo.step5Desc': 'Ajusta manualment els sistemes si cal.',
        'help.howTo.step6': 'Genera el PDF:',
        'help.howTo.step6Desc': "Descarrega la teva partitura amb l'espaiat afegit.",
        'help.tips.title': 'Consells',
        'help.tips.tip1': 'Per a partitures escanejades, utilitza la funció de rotació si els pentagrames no estan perfectament horitzontals.',
        'help.tips.tip2': "Ajusta el llindar de detecció si l'algoritme no detecta correctament els sistemes.",
        'help.tips.tip3': 'Utilitza el retall per eliminar marges innecessaris o capçaleres.',
        'help.footer.createdBy': 'Creat per',
        'help.footer.version': 'Versió 1.2',

        // Errors
        'error.loadPdf': 'Error en carregar el PDF:',
        'error.analyze': 'Error en analitzar:',
        'error.rotation': 'Error en aplicar rotació:',
        'error.crop': 'Error en aplicar retall:',
        'error.brightnessContrast': 'Error en aplicar brillantor/contrast:',
        'error.generate': 'Error en generar PDF:',

        // Language selector
        'language.label': 'Idioma',
        'language.es': 'Español',
        'language.ca': 'Català',
        'language.en': 'English'
    },

    en: {
        // Meta
        'meta.description': 'Web application to separate musical systems in PDF scores and add space between them for annotations.',
        'meta.title': 'ScoreSpacer - Musical System Spacer',
        'meta.ogTitle': 'ScoreSpacer - Musical System Spacer',
        'meta.ogDescription': 'Add space between musical systems for annotations. 100% browser-based processing.',

        // Header
        'header.subtitle': 'Add space between musical systems for annotations',

        // Upload
        'upload.dropzone': 'Drag a PDF here or',
        'upload.selectFile': 'select a file',
        'upload.disclaimer.title': 'Legal notice:',
        'upload.disclaimer.p1': 'By using this application, you declare and guarantee that you own the copyright or have the express authorization of the rights holder for the documents you upload, or that said documents are in the public domain or are published under licenses that allow their reproduction and modification (such as Creative Commons).',
        'upload.disclaimer.p2': 'ScoreSpacer and its creator assume no responsibility for the improper, unauthorized or fraudulent use of this tool. The user is solely responsible for verifying that they have the necessary permissions to process documents and for complying with current intellectual property legislation.',

        // Page selection
        'pageSelection.title': 'Page selection',
        'pageSelection.help': 'Click on pages to configure detection and export',
        'pageSelection.detectAll': 'Detect all',
        'pageSelection.detectNone': 'Detect none',
        'pageSelection.exportAll': 'Export all',
        'pageSelection.legend.detect': 'Detect systems',
        'pageSelection.legend.export': 'Include in export',
        'pageSelection.legend.skip': 'Skip',
        'pageSelection.continue': 'Continue to processing',
        'pageSelection.removeFile': 'Remove file',

        // Processing
        'processing.backToSelection': '← Back to selection',
        'processing.parameters.title': 'Detection parameters',
        'processing.parameters.spacing': 'Space between systems (px)',
        'processing.parameters.threshold': 'Detection threshold (%)',
        'processing.parameters.thresholdHelp': 'Minimum percentage of dark pixels to consider a line as part of a system',
        'processing.parameters.minGap': 'Minimum gap between systems (px)',
        'processing.parameters.watermark': 'Hide watermark',
        'processing.parameters.watermarkHelp': 'By default "ScoreSpacer (www.jlmirall.es)" is added to each page',
        'processing.continueToExport': 'Continue to export →',

        // Preview
        'preview.title': 'Detection preview',
        'preview.analyze': 'Analyze PDF',
        'preview.analyzing': 'Analyzing...',
        'preview.pageIndicator': 'Page {current} of {total}',
        'preview.rotate': 'Rotate',
        'preview.crop': 'Crop',
        'preview.placeholder': 'Click "Analyze PDF" to see system detection',
        'preview.projectionTitle': 'Horizontal projection profile',
        'preview.systemsDetected': '{count} system{plural} detected',
        'preview.dragToAdjust': 'Drag edges to adjust',
        'preview.pageSkipped': 'Page skipped (not detected or exported)',
        'preview.pageExportOnly': 'Page without detection (will be exported as is)',
        'preview.statusDetect': '(detect)',
        'preview.statusExportOnly': '(export only)',
        'preview.statusSkip': '(skip)',
        'preview.brightnessContrast': 'Brightness/Contrast',

        // Rotation panel
        'rotation.title': 'Manual rotation',
        'rotation.help': 'Use the red lines as a guide to align the staves',
        'rotation.autoDetect': 'Auto-detect rotation',
        'rotation.detecting': 'Detecting...',
        'rotation.reset': 'Reset',
        'rotation.cancel': 'Cancel',
        'rotation.apply': 'Apply and re-analyze',
        'rotation.applying': 'Applying...',

        // Crop panel
        'crop.title': 'Crop/Adjust margins',
        'crop.help': 'Positive values crop, negative values add margin',
        'crop.top': 'Top',
        'crop.bottom': 'Bottom',
        'crop.left': 'Left',
        'crop.right': 'Right',
        'crop.autoDetect': 'Auto-detect margins',
        'crop.reset': 'Reset',
        'crop.cancel': 'Cancel',
        'crop.apply': 'Apply and re-analyze',
        'crop.applying': 'Applying...',
        'crop.invalidSize': 'Crop values result in an invalid size',

        // Brightness/Contrast panel
        'brightnessContrast.title': 'Brightness and Contrast',
        'brightnessContrast.help': 'Adjust brightness and contrast to improve detection in low-quality scans',
        'brightnessContrast.brightness': 'Brightness',
        'brightnessContrast.contrast': 'Contrast',
        'brightnessContrast.presetLight': 'Light scan',
        'brightnessContrast.presetDark': 'Dark scan',
        'brightnessContrast.presetHighContrast': 'High contrast',
        'brightnessContrast.reset': 'Reset',
        'brightnessContrast.cancel': 'Cancel',
        'brightnessContrast.apply': 'Apply and re-analyze',
        'brightnessContrast.applying': 'Applying...',

        // Undo/Redo
        'undo.title': 'Undo (Ctrl+Z)',
        'redo.title': 'Redo (Ctrl+Shift+Z)',

        // Generate
        'generate.filename': 'Filename:',
        'generate.button': 'Generate PDF with spacing',
        'generate.processing': 'Processing...',
        'generate.success': 'PDF generated successfully',
        'generate.noPages': 'No pages selected for export',

        // Export section
        'export.title': 'Export settings',
        'export.preview': 'Preview',
        'export.noSystems': 'No systems detected',
        'export.moreSystems': '... and {count} more systems',
        'export.backToProcessing': '← Back to adjustments',

        // Systems
        'system.split': 'Split system in two',
        'system.delete': 'Delete system',
        'system.add': '+ Add system',
        'system.addTitle': 'Add a new system manually',

        // Thumbnails
        'thumbnail.detect': 'Detect',
        'thumbnail.detectActive': '✓ Detect',
        'thumbnail.export': 'Export',
        'thumbnail.exportActive': '✓ Export',
        'thumbnail.page': 'Page {num}',
        'thumbnail.badgeDetect': 'Detect systems',
        'thumbnail.badgeExport': 'Include in export',
        'thumbnail.generating': 'Generating thumbnails...',
        'thumbnail.rotated': 'Rotated',
        'thumbnail.cropped': 'Cropped',
        'thumbnail.brightnessAdjusted': 'Brightness adjusted',
        'thumbnail.systemsCount': '{count} systems',
        'thumbnail.systemsCountSingular': '{count} system',

        // Wizard
        'wizard.step1': 'Upload',
        'wizard.step2': 'Select',
        'wizard.step3': 'Adjust',
        'wizard.step4': 'Export',

        // Config sidebar
        'config.toggle': 'Settings',
        'config.title': 'Detection parameters',

        // Toolbar
        'toolbar.rotate': 'Rotate page',
        'toolbar.crop': 'Crop page',
        'toolbar.brightness': 'Brightness and contrast',
        'toolbar.addSystem': 'Add system',
        'toolbar.undo': 'Undo',
        'toolbar.redo': 'Redo',

        // Footer
        'footer.main': 'ScoreSpacer - 100% browser-based processing',
        'footer.createdBy': 'Created by',
        'footer.withHelpOf': 'with help from',
        'footer.support': 'Buy me a horchata',

        // Donation modal
        'donation.title': 'Thank you for using ScoreSpacer!',
        'donation.message': 'If you find this tool useful, consider supporting its development with a small donation.',
        'donation.note': 'Your support helps maintain and improve this free tool.',
        'donation.support': 'Buy me a horchata',
        'donation.skip': 'Continue without donating',

        // Help modal
        'help.title': 'ScoreSpacer',
        'help.tagline': 'Musical System Spacer',
        'help.whatIs.title': 'What is ScoreSpacer?',
        'help.whatIs.content': 'ScoreSpacer is a free web tool that allows you to add space between musical systems in a PDF score. This additional space is ideal for writing annotations, fingerings, bowings, dynamics or other indications during study or music teaching.',
        'help.features.title': 'Main features',
        'help.features.browser': '100% browser-based processing:',
        'help.features.browserDesc': 'Your files never leave your device. They are not uploaded to any server.',
        'help.features.detection': 'Automatic system detection:',
        'help.features.detectionDesc': 'The algorithm automatically identifies the musical systems on each page.',
        'help.features.manual': 'Manual editing:',
        'help.features.manualDesc': 'You can adjust, split, delete or add systems manually.',
        'help.features.rotation': 'Rotation and cropping:',
        'help.features.rotationDesc': 'Correct skewed scanned pages or excessive margins.',
        'help.features.export': 'Export to A4 PDF:',
        'help.features.exportDesc': 'Generate a new PDF optimized for printing.',
        'help.howTo.title': 'How to use ScoreSpacer',
        'help.howTo.step1': 'Upload your PDF:',
        'help.howTo.step1Desc': 'Drag the file or click to select it.',
        'help.howTo.step2': 'Select pages:',
        'help.howTo.step2Desc': 'Choose which pages you want to process and which to include in the export.',
        'help.howTo.step3': 'Adjust parameters:',
        'help.howTo.step3Desc': 'Configure the space between systems and detection thresholds.',
        'help.howTo.step4': 'Analyze:',
        'help.howTo.step4Desc': 'Click "Analyze PDF" to detect systems.',
        'help.howTo.step5': 'Review and edit:',
        'help.howTo.step5Desc': 'Manually adjust systems if necessary.',
        'help.howTo.step6': 'Generate PDF:',
        'help.howTo.step6Desc': 'Download your score with added spacing.',
        'help.tips.title': 'Tips',
        'help.tips.tip1': 'For scanned scores, use the rotation function if the staves are not perfectly horizontal.',
        'help.tips.tip2': 'Adjust the detection threshold if the algorithm does not correctly detect systems.',
        'help.tips.tip3': 'Use cropping to remove unnecessary margins or headers.',
        'help.footer.createdBy': 'Created by',
        'help.footer.version': 'Version 1.2',

        // Errors
        'error.loadPdf': 'Error loading PDF:',
        'error.analyze': 'Error analyzing:',
        'error.rotation': 'Error applying rotation:',
        'error.crop': 'Error applying crop:',
        'error.brightnessContrast': 'Error applying brightness/contrast:',
        'error.generate': 'Error generating PDF:',

        // Language selector
        'language.label': 'Language',
        'language.es': 'Español',
        'language.ca': 'Català',
        'language.en': 'English'
    }
};

class I18n {
    constructor() {
        this.currentLang = this.detectLanguage();
        this.listeners = [];
    }

    /**
     * Detect the user's preferred language from browser/OS
     * Falls back to Spanish if not supported
     */
    detectLanguage() {
        // Check localStorage first (user preference)
        const saved = localStorage.getItem('scoreSpacer_language');
        if (saved && translations[saved]) {
            return saved;
        }

        // Get browser language
        const browserLang = navigator.language || navigator.userLanguage || 'es';
        const langCode = browserLang.split('-')[0].toLowerCase();

        // Check if supported
        if (translations[langCode]) {
            return langCode;
        }

        // Default to Spanish
        return 'es';
    }

    /**
     * Get current language code
     */
    getLanguage() {
        return this.currentLang;
    }

    /**
     * Set the current language
     */
    setLanguage(lang) {
        if (!translations[lang]) {
            console.warn(`Language '${lang}' not supported, falling back to Spanish`);
            lang = 'es';
        }

        this.currentLang = lang;
        localStorage.setItem('scoreSpacer_language', lang);

        // Update HTML lang attribute
        document.documentElement.lang = lang;

        // Notify listeners
        this.listeners.forEach(callback => callback(lang));

        // Update all elements with data-i18n attribute
        this.updateDOM();
    }

    /**
     * Get a translated string
     * @param {string} key - The translation key
     * @param {object} params - Optional parameters for interpolation
     */
    t(key, params = {}) {
        const langData = translations[this.currentLang] || translations.es;
        let text = langData[key] || translations.es[key] || key;

        // Handle interpolation: {param} -> value
        Object.keys(params).forEach(param => {
            text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
        });

        return text;
    }

    /**
     * Add a listener for language changes
     */
    onLanguageChange(callback) {
        this.listeners.push(callback);
    }

    /**
     * Update all DOM elements with data-i18n attribute
     */
    updateDOM() {
        // Update elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = this.t(key);

            // Check if it's an attribute or content
            const attr = el.getAttribute('data-i18n-attr');
            if (attr) {
                el.setAttribute(attr, text);
            } else {
                el.textContent = text;
            }
        });

        // Update elements with data-i18n-html (for elements needing HTML)
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            el.innerHTML = this.t(key);
        });

        // Update elements with data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });

        // Update elements with data-i18n-title
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = this.t(key);
        });
    }

    /**
     * Get available languages
     */
    getAvailableLanguages() {
        return Object.keys(translations);
    }
}

// Create singleton instance
const i18n = new I18n();

export { i18n, translations };
