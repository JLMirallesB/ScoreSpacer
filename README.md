# ScoreSpacer

**Separador de Sistemas Musicales**

ScoreSpacer es una herramienta web gratuita que permite añadir espacio entre los sistemas musicales de una partitura en formato PDF. Este espacio adicional resulta ideal para escribir anotaciones, digitaciones, arcos, dinámicas u otras indicaciones durante el estudio o la enseñanza musical.

## Características principales

- **Procesamiento 100% en navegador:** Tus archivos nunca salen de tu dispositivo. No se suben a ningún servidor, garantizando total privacidad.
- **Detección automática de sistemas:** Un algoritmo de proyección horizontal identifica automáticamente los sistemas musicales de cada página.
- **Edición manual completa:** Puedes ajustar los límites, dividir, eliminar o añadir sistemas manualmente.
- **Rotación de páginas:** Corrige páginas escaneadas que estén ligeramente torcidas (de -5° a +5°).
- **Recorte de márgenes:** Elimina márgenes excesivos o añade espacio extra donde sea necesario.
- **Selección flexible de páginas:** Decide qué páginas analizar y cuáles incluir directamente en la exportación.
- **Exportación a PDF A4:** Genera un nuevo PDF optimizado para impresión con paginación inteligente.

## Cómo usar ScoreSpacer

### 1. Sube tu PDF
Arrastra el archivo PDF sobre la zona de carga o haz clic para seleccionarlo desde tu dispositivo.

### 2. Selecciona las páginas
Se mostrará una vista de miniaturas donde puedes configurar cada página:
- **Verde (Detectar):** Se detectarán los sistemas y se añadirá espacio entre ellos.
- **Naranja (Solo exportar):** La página se incluirá tal cual (útil para portadas o páginas de texto).
- **Gris (Omitir):** La página no se incluirá en el PDF final.

Haz clic en cada miniatura para cambiar su estado.

### 3. Ajusta los parámetros
- **Espacio entre sistemas:** Cantidad de espacio (en píxeles) que se añadirá entre cada sistema.
- **Umbral de detección:** Sensibilidad del algoritmo para detectar contenido musical.
- **Separación mínima:** Distancia mínima para considerar que termina un sistema y empieza otro.

### 4. Analiza el PDF
Haz clic en "Analizar PDF" para que el algoritmo detecte los sistemas musicales. Verás las franjas azules que marcan cada sistema detectado.

### 5. Revisa y edita (opcional)
- **Arrastra los bordes** de las franjas para ajustar los límites de cada sistema.
- Usa el botón **✂** para dividir un sistema en dos.
- Usa el botón **×** para eliminar un sistema.
- Usa el botón **+ Añadir sistema** para crear uno nuevo manualmente.
- Si la página está torcida, usa **Rotar** para corregirla.
- Si tiene márgenes excesivos, usa **Recortar** para ajustarlos.

### 6. Genera el PDF
Haz clic en "Generar PDF con espaciado" para crear y descargar tu nueva partitura con el espacio añadido entre sistemas.

## Consejos de uso

- **Partituras escaneadas:** Si los pentagramas no están perfectamente horizontales, usa la función de rotación. Las franjas de los sistemas detectados te servirán como guía visual.
- **Detección imprecisa:** Si el algoritmo no detecta bien los sistemas, prueba a ajustar el umbral de detección. Un valor más bajo detecta más contenido, uno más alto es más selectivo.
- **Páginas con mucho margen:** Usa el recorte para eliminar márgenes innecesarios antes de analizar. También puedes usar "Auto-detectar márgenes".
- **Portadas y texto:** Marca estas páginas como "Solo exportar" para incluirlas sin procesamiento.

## Tecnología

ScoreSpacer está construido con tecnologías web estándar:
- **HTML/CSS/JavaScript** vanilla (ES6 modules)
- **PDF.js** para renderizar y leer PDFs
- **pdf-lib** para generar el PDF de salida

Todo el procesamiento ocurre en tu navegador. No hay servidor backend.

## Aviso legal

Al utilizar esta aplicación, el usuario declara y garantiza que:
- Posee los derechos de autor sobre los documentos que procesa, o
- Cuenta con la autorización expresa del titular de los derechos, o
- Los documentos se encuentran en dominio público, o
- Los documentos están publicados bajo licencias que permiten su reproducción y modificación (como Creative Commons).

**ScoreSpacer y su creador no asumen responsabilidad alguna por el uso indebido, no autorizado o fraudulento de esta herramienta.** El usuario es el único responsable de verificar que dispone de los permisos necesarios para procesar los documentos y de cumplir con la legislación vigente en materia de propiedad intelectual.

## Autor

Creado por [José Luis Miralles Bono](https://www.jlmirall.es) con ayuda de [Claude](https://claude.ai).

## Apoyo

Si esta herramienta te resulta útil, considera [invitarme a una horchata](https://ko-fi.com/miralles).

---

**Versión 1.1**
