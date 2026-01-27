# ScoreSpacer

Aplicación web para separar sistemas musicales en partituras PDF y añadir espacio entre ellos para anotaciones.

## Stack Técnico

- **Frontend**: HTML/CSS/JavaScript vanilla (ES6 modules)
- **PDF Rendering**: PDF.js (CDN)
- **PDF Generation**: pdf-lib (CDN)
- **Backend**: Ninguno - 100% cliente

## Estructura del Proyecto

```
ScoreSpacer/
├── index.html          # Página principal con UI
├── style.css           # Estilos (tema claro minimalista)
├── CLAUDE.md           # Este archivo
├── .nojekyll           # Para GitHub Pages
└── js/
    ├── main.js         # Lógica principal, UI y edición interactiva
    ├── pdfHandler.js   # Carga y renderizado de PDF con PDF.js
    ├── projection.js   # Algoritmo de perfil de proyección horizontal
    ├── pdfGenerator.js # Generación de PDF A4 con pdf-lib
    └── i18n.js         # Sistema de internacionalización (ES/CA/EN)
```

## Algoritmo de Detección de Sistemas (Híbrido)

El algoritmo usa un enfoque **híbrido** que combina detección por margen izquierdo con refinamiento completo:

### Paso 1: Detección por margen izquierdo (12% del ancho)
- Analiza solo el margen izquierdo donde están las **llaves y corchetes** del sistema
- Más fiable que analizar toda la línea (evita falsos positivos por acordes densos)
- Umbral más alto (1.5x) porque las llaves son muy densas en píxeles

### Paso 2: Proyección completa para refinamiento
- Calcula la proyección horizontal de toda la página
- Usa esta información para expandir los límites exactos del sistema

### Paso 3: Fallback
- Si la detección por margen falla, usa el método tradicional de proyección completa

### Visualización
En el gráfico de proyección:
- **Línea cyan**: proyección del margen izquierdo (usada para detectar)
- **Línea verde**: proyección completa (usada para refinar)
- **Zonas rojas**: sistemas detectados

## Generación de PDF

- Salida en formato **DIN A4** (595.28 x 841.89 puntos)
- Márgenes de 40 puntos (~14mm)
- **Paginación inteligente**: nunca corta sistemas entre páginas
- Escala automática al ancho útil del A4

## Ejecución Local

```bash
# Servidor simple con Python
python3 -m http.server 8080

# Abrir en navegador
open http://localhost:8080
```

## Despliegue en GitHub Pages

El proyecto está listo para GitHub Pages. Solo hacer push a `main` y activar Pages en Settings.

## Flujo de la Aplicación

```
1. CARGA
   PDF → PDF.js → Miniaturas de páginas

2. SELECCIÓN DE PÁGINAS
   Usuario configura cada página:
   - Detectar sistemas: sí/no
   - Incluir en exportación: sí/no

3. ANÁLISIS
   Páginas marcadas → ImageData → Projection Analysis → Systems[]
                                                              ↓
                                    [Rotación/Recorte manual opcional]
                                                              ↓
                                          [Edición manual por usuario]

4. GENERACIÓN
   Páginas a exportar + Systems[] → pdf-lib → PDF A4 → Download
```

## Selección de Páginas

Tras cargar un PDF, se muestra una vista de miniaturas donde el usuario puede configurar cada página:

| Estado | Detectar | Exportar | Descripción |
|--------|----------|----------|-------------|
| **Detectar** (verde) | ✓ | ✓ | Se detectan sistemas y se exporta con espaciado |
| **Solo exportar** (rojo) | ✗ | ✓ | Se exporta tal cual (portada, texto) |
| **Omitir** (gris) | ✗ | ✗ | No se incluye en el PDF final |

**Controles:**
- **Clic en miniatura**: cicla entre los tres estados
- **Hover**: muestra botones individuales para Detectar/Exportar
- **Botones globales**: "Detectar todas", "No detectar ninguna", "Exportar todas"

## Parámetros Configurables

| Parámetro | Rango | Descripción |
|-----------|-------|-------------|
| Espacio entre sistemas | 50-500px | Espacio añadido entre cada sistema |
| Umbral de detección | 1-20% | % mínimo de píxeles oscuros para considerar contenido |
| Separación mínima | 10-100px | Gap mínimo para considerar fin de sistema |

## Edición Interactiva de Sistemas

Las franjas rojas que marcan sistemas detectados son editables:
- **Arrastrar bordes**: ajustar límites superior/inferior
- **Botón ✂**: dividir sistema en dos
- **Botón ×**: eliminar sistema
- **Botón +**: añadir nuevo sistema manualmente

## Rotación Manual

Después del análisis, aparece un botón "Rotar" que permite corregir páginas escaneadas torcidas:

**Controles:**
- **Slider/input**: rotación de -5° a +5° en pasos de 0.1°
- **Botones preset**: -2°, -1°, -0.5°, +0.5°, +1°, +2° (se acumulan)
- **Línea de referencia**: línea verde horizontal que ayuda a alinear

**Flujo:**
1. Clic en "Rotar" abre el panel de rotación
2. Las franjas rojas de sistemas sirven de guía visual
3. Ajustar ángulo hasta que los pentagramas estén horizontales
4. "Aplicar y re-analizar" rota la imagen y vuelve a detectar sistemas
5. "Cancelar" descarta los cambios

**Nota:** La rotación aumenta ligeramente el tamaño del canvas para evitar recorte.

## Recorte/Ajuste de Márgenes

Después del análisis, aparece un botón "Recortar" que permite ajustar los márgenes de la página:

**Controles:**
- **Inputs numéricos**: valores en píxeles para cada lado (arriba, abajo, izquierda, derecha)
- **Botones preset**: -50 y +50 píxeles (se acumulan al valor actual)
- **Auto-detectar márgenes**: detecta automáticamente el contenido y ajusta los valores
- **Reiniciar**: vuelve todos los valores a 0

**Comportamiento de valores:**
- **Valores positivos**: recortan/eliminan ese número de píxeles del borde
- **Valores negativos**: añaden margen blanco en ese borde

**Flujo:**
1. Clic en "Recortar" abre el panel de recorte
2. Ajustar valores manualmente o usar "Auto-detectar márgenes"
3. La vista previa muestra el área resultante con borde azul punteado
4. "Aplicar y re-analizar" recorta la imagen y vuelve a detectar sistemas
5. "Cancelar" descarta los cambios

**Casos de uso:**
- Eliminar márgenes excesivos de páginas escaneadas
- Recortar encabezados o pies de página no deseados
- Añadir margen extra si el contenido está demasiado cerca del borde

## Internacionalización (i18n)

La aplicación soporta **tres idiomas**: Español (es), Català (ca), English (en).

### Idiomas Soportados

| Código | Idioma | Descripción |
|--------|--------|-------------|
| `es` | Español | Idioma por defecto si no se detecta otro |
| `ca` | Català | Catalán |
| `en` | English | Inglés |

### Detección Automática

El idioma se detecta automáticamente en este orden:
1. **localStorage**: si el usuario ya eligió un idioma, se recuerda
2. **navigator.language**: idioma del navegador/SO
3. **Fallback**: español si el idioma detectado no está soportado

### Selector de Idioma

En el footer hay un selector discreto (ES/CA/EN) que permite cambiar el idioma manualmente. La preferencia se guarda en localStorage.

### Sistema de Traducciones

Las traducciones están en `js/i18n.js`:

```javascript
// Usar una traducción
import { i18n } from './i18n.js';

// Texto simple
i18n.t('preview.analyze') // "Analizar PDF"

// Con interpolación
i18n.t('preview.pageIndicator', { current: 1, total: 5 }) // "Página 1 de 5"

// Cambiar idioma
i18n.setLanguage('en');

// Escuchar cambios
i18n.onLanguageChange((lang) => { /* actualizar UI */ });
```

### Añadir Traducciones en HTML

Usar atributos `data-i18n`:

```html
<!-- Texto contenido -->
<p data-i18n="preview.title">Vista previa</p>

<!-- Atributo title -->
<button data-i18n-title="system.delete" title="Eliminar">×</button>

<!-- Atributo placeholder -->
<input data-i18n-placeholder="search.placeholder">
```

### IMPORTANTE para Desarrollo

**Al añadir nuevos textos visibles al usuario:**
1. Añadir la clave en los tres idiomas en `js/i18n.js`
2. Usar `data-i18n` en HTML para textos estáticos
3. Usar `i18n.t('clave')` en JavaScript para textos dinámicos
4. Mantener consistencia en las claves (ej: `section.element.action`)
