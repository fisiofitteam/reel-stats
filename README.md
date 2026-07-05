# Reels Stats

Panel personal para analizar el rendimiento de tus Reels de Instagram: qué vídeos funcionan mejor, cómo evolucionan sus métricas en el tiempo, de qué hablan (temática, formato, gancho) según su transcript, y comparación entre reels para entender qué le gusta a tu audiencia.

Los datos se descargan a archivos locales en tu ordenador vía Apify (scraping público) y Claude (análisis del transcript). La app los lee desde ahí; no hay servidor en la nube ni base de datos.

---

## Qué necesitas antes de empezar

| Programa | Para qué sirve | Cómo comprobarlo |
| --- | --- | --- |
| **Node.js** (v18 o superior) | Ejecutar la app web | `node --version` |
| **Python** (v3.10 o superior) | Descargar y analizar los reels | `python3 --version` |

También necesitas:

- Una cuenta de **Apify** ([apify.com](https://apify.com)) con un token de API. Se usa el actor oficial `apify/instagram-reel-scraper`: las métricas son baratas y el transcript es un add-on cobrado por minuto de audio (~$0.05 por reel de 20-30s en nuestras pruebas). Sin límite artificial de usos.
- Una **API key de Anthropic** ([console.anthropic.com](https://console.anthropic.com)) para el análisis de temáticas con Claude.
- Que tu cuenta de Instagram sea **pública** — el scraping de Apify no funciona sobre cuentas privadas.

---

## Guía paso a paso

### 1. Configurar tus credenciales

**Nunca subas este archivo a internet.**

```bash
cp .env.example .env
```

Abre `.env` y rellena:

```
APIFY_TOKEN=tu_token_de_apify
ANTHROPIC_API_KEY=tu_api_key_de_anthropic
IG_USERNAME=tu_usuario_de_instagram
```

- `APIFY_TOKEN`: Apify → Settings → Integrations → Personal API tokens.
- `ANTHROPIC_API_KEY`: Anthropic Console → API Keys.
- `IG_USERNAME`: tu usuario público de Instagram, sin `@`.

### 2. Instalar dependencias de Python

```bash
cd fetch
python3 -m pip install -r requirements.txt
cd ..
```

### 3. Sincronizar tus reels

Desde la carpeta raíz del proyecto:

```bash
python3 fetch/sync.py --limit 10
```

**Qué hace este comando** (encadena 4 pasos):

1. `fetch_reels.py` — descarga tus reels y sus métricas públicas (vistas, likes, comentarios) vía Apify.
2. `fetch_transcripts.py` — transcribe el audio de cada reel vía Apify.
3. `analyze_themes.py` — analiza cada transcript con Claude para extraer temática, formato, tipo de gancho y tono.
4. `build_dataset.py` — combina todo en `public/data/reels.json` y `public/data/insights.json`.

**Opciones útiles:**

```bash
# Solo los 10 reels más recientes (para probar sin gastar mucho crédito)
python3 fetch/sync.py --limit 10

# Solo refrescar métricas (vistas/likes/comentarios), sin re-transcribir ni re-analizar
python3 fetch/sync.py --skip-transcripts
```

> **Importante:** vuelve a ejecutar `python3 fetch/sync.py` periódicamente para ver cómo evolucionan las métricas de cada reel en el tiempo (se guarda un histórico). Los reels ya transcritos/analizados no se vuelven a pagar — solo se refrescan sus contadores.

### 4. Instalar dependencias de la app web

```bash
npm install
```

Solo hace falta una vez.

### 5. Abrir la app

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en el navegador. Para cerrar, `Ctrl + C` en la terminal.

---

## Resumen rápido (cuando ya lo hayas hecho una vez)

```bash
# 1. Sincronizar datos nuevos
python3 fetch/sync.py

# 2. Arrancar la app
npm run dev
```

---

## Qué verás en la app

- **Dashboard**: KPIs globales, tendencia de engagement en el tiempo, top 5 reels.
- **Reels**: todos tus reels, ordenables y filtrables por temática.
- **Detalle de un reel**: métricas completas, curva de evolución (vistas/likes/comentarios en el tiempo), transcript y tags de temática.
- **Temáticas**: qué temas, formatos y tipos de gancho generan más engagement de media.
- **Comparar**: selecciona hasta 3 reels y compáralos lado a lado.

---

## Problemas frecuentes

### "ERROR: Set APIFY_TOKEN in .env"

No existe `.env` o está vacío. Repite el paso 1.

### El actor de Apify no encuentra reels / falla

Comprueba que `IG_USERNAME` es correcto y que la cuenta es pública. El actor (`apify/instagram-reel-scraper`) puede cambiar su esquema de entrada/salida con el tiempo — revisa la pestaña "Input"/"Output" del actor en la consola de Apify si algo falla, y ajusta `fetch/fetch_reels.py` o `fetch/fetch_transcripts.py` si hace falta.

### "No se encontró /data/reels.json" en la app

Aún no has sincronizado datos. Ejecuta `python3 fetch/sync.py --limit 5` primero.

### El análisis de temáticas falla o tarda

Comprueba que `ANTHROPIC_API_KEY` es válida y tiene crédito. Puedes limitar cuántos reels se procesan por ejecución con `--limit`.

### Puerto 5173 ya en uso

Vite te propondrá otro puerto (por ejemplo 5174).

---

## Comandos extra (opcional)

| Comando | Descripción |
| --- | --- |
| `npm run build` | Genera una versión optimizada en `dist/` |
| `npm run preview` | Previsualiza la versión de producción |
| `npm run lint` | Revisa el código con el linter |

---

## Estructura del proyecto (referencia)

```
reels-stats/
├── .env                  ← Tus credenciales (no compartir)
├── fetch/
│   ├── sync.py           ← Orquesta la sincronización completa
│   ├── fetch_reels.py    ← Métricas de reels vía Apify
│   ├── fetch_transcripts.py ← Transcripts vía Apify
│   ├── analyze_themes.py ← Temáticas vía Claude
│   ├── build_dataset.py  ← Combina todo en public/data/
│   └── requirements.txt
├── data/                 ← Caché local (raw, transcripts, temas, histórico)
├── public/data/          ← reels.json + insights.json (lo que lee la app)
└── src/                  ← Código de la app web (React)
```

---

## Privacidad y qué NO subir a GitHub

| Archivo / carpeta | Qué contiene | Riesgo |
| --- | --- | --- |
| `.env` | Tokens de Apify y Anthropic | Acceso a tus cuentas / gasto de crédito |
| `data/` | Caché de reels, transcripts y temas | Contenido y métricas de tu cuenta |
| `public/data/` | Datos consumidos por la app | Igual que arriba |

**Seguro para publicar:** `.env.example` y todo el código en `src/` y `fetch/`.

**Antes de hacer `git push`**, comprueba con `git status` que no aparecen `.env` ni archivos dentro de `data/` o `public/data/`.
