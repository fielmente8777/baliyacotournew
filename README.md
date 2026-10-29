# Baliye Couture: project guide

Read this before changing anything. It says where each part lives, how the parts connect, and what changed recently, so a change doesn't need a full read of both projects. **When you change something, add it to the change log at the bottom.**

## The two projects

| | Storefront + admin | Backend |
|---|---|---|
| Folder | `baliyacotournew/` (this one) | `../baliye-node/` |
| Stack | Next.js 16 (App Router), React 19, RTK Query, Tailwind v4 | Express, Mongoose (MongoDB), zod |
| Hosting | Vercel | Render (free tier: sleeps after 15 min; keep it awake with an UptimeRobot ping to `/health`) |

> **The local `.env` of `baliye-node` points at the production database and the real Shopify store.** Anything run locally writes live data. Don't run seed scripts or test writes against it.

**Shopify owns** products, variants, prices, product photos, the cart and checkout (payment happens on Shopify's checkout page), plus all uploaded images (Shopify Files).
**Our backend owns** the design builder catalogue, website text, measurements, saved addresses, wishlist, design credits, notifications and AI Studio data.

## Where things are (frontend, `src/`)

| Area | Files |
|---|---|
| Pages | `app/(website)/…` storefront · `app/admin/…` admin panel |
| Home page sections | `app/(website)/Home/Components/*`, default text in `Home/pagedata.tsx` |
| Pre-made Designs listing | `features/catalog/ProductsView.tsx` (hero, silhouettes, sticky filters, grid, promo); default text in `app/(website)/products/pageData.ts` |
| Product detail | `features/catalog/ProductDetailView.tsx`; gallery, zoom and viewer in `app/(website)/products/[slug]/Components/` |
| Reviews | `…/[slug]/Components/CustomerReviews.tsx` (+ `ReviewCard`, `StarRating`). Demo reviews show until a product has real ones; turn them off with `NEXT_PUBLIC_DEMO_REVIEWS=false` |
| Product data | `store/api/productApi.ts`, read straight from the Shopify Storefront API. Filters: `?badge=`, `?tag=`, `?type=` (Shopify product type = silhouette), `?sort=` |
| Design builder (customer) | `features/create-design/*` |
| Admin panel | `features/admin/*`; nav in `features/admin/AdminShell.tsx`; API in `store/api/adminApi.ts` (+ `adminStudioApi.ts`) |
| Navbar / footer | `components/navbar/*`, `components/footer/*` |
| Live updates | `lib/liveUpdates.ts` + `store/provider.tsx` (see below) |

## Editable website content (admin → Content)

Pages: **Home page**, **Pre-made Designs page**, **Footer**, **Terms & Conditions**. Each page's built-in defaults live in code; whatever is saved in the admin overrides them section by section (`lib/siteContent.ts → mergeContent`).

- **Admin editor:** `features/admin/content/ContentEditorView.tsx`. It builds its form from the defaults' shape: text, long text, single images, image lists (add / remove / reorder), and lists of items.
- **Long formatted text** (the Terms page) uses a word-processor style editor, `RichTextEditor.tsx` (TipTap v2): headings, bold, lists, links, undo; it stores HTML, so nobody types HTML.
- **"Write with AI"** (`AiWriter.tsx`) sits on every text field and on the Terms editor: write, improve, shorter, longer, fix spelling, or a custom instruction. It calls the admin-only `POST /admin/content/write` (`baliye-node/src/services/contentWriter.ts`, model `OPENAI_TEXT_MODEL`, default `gpt-4.1-mini`), which keeps the brand voice, uses UK spelling, avoids dashes and never invents prices, policies or contact details. It only suggests; the admin clicks "Use this", then Save.
- **Images are uploaded to Shopify Files** (`baliye-node/src/services/siteContent.ts → uploadContentImage`) and stored as `cdn.shopify.com` URLs. Removing an image in the editor removes it from the page; the file stays in Shopify Files (delete it there if needed).
- **Adding a new editable page:**
  1. Add the name to `CONTENT_PAGES` in `baliye-node/src/models/sitecontent.ts`.
  2. Add it to `ContentPage` in `src/@types/admin.ts` and `src/lib/siteContent.ts`, the `PAGES` list in `app/api/revalidate/route.ts` and `app/admin/content/[page]/page.tsx`, and the `PAGES` map in `ContentEditorView.tsx`.
  3. Add a nav link in `AdminShell.tsx`.
  4. In the page, use `await getSiteContent('<page>', defaults)`.

## Live updates: admin saves reach open browsers in seconds

1. The admin saves. The backend stores it, and the admin calls `/api/revalidate` so the server cache is cleared.
2. Same browser: a BroadcastChannel tells storefront tabs immediately.
3. Every other visitor: `watchContentVersion` asks `GET /content/version` every 4 s (only while the tab is visible) and refreshes about 1.5 s after a change.
4. The refresh is `router.refresh()`: content swaps in place, keeping scroll and anything typed.
5. **It never refreshes while the customer is busy** (`isCustomerBusy`): on cart, shipping/address, login, account detail pages or the design builder; while typing in any field; or while a dialog is open. It waits and refreshes once they're done.

Products and prices come from Shopify, so they refresh whenever a page mounts or the tab regains focus.

## Images

All images worth keeping go to **Shopify Files** (`baliye-node/src/config/imageStore.ts → saveGeneratedImage`): content images, catalogue images, AI results. If Shopify isn't configured or an upload fails, the image falls back to the server disk, which **Render wipes on every deploy**. Short-lived working files (blend masks) stay on disk on purpose. `IMAGE_STORE=disk` forces disk.

`next.config.ts` keeps `images.unoptimized: true`. Turning optimisation on needs `remotePatterns` for every image host; it was tried and rolled back.

## Design Builder bulk import (admin → Design Builder → Bulk import)

Add or update many garments and options from one Excel sheet the client fills in.

- **Get the sheet:** *Blank template*, or *Current catalogue* (the site as it stands, for the client to correct). The sheet has a *How to fill* tab, a Garments tab and an Options tab, with help notes on every column heading. A blank copy for the client is `docs/client-kit/design-builder-sheet.xlsx`. The older `design-builder-*.csv` files still import; their picture columns are ignored.
- **Upload:** first a preview of every row (new / update / no change / error), new steps, new measurement fields, and each garment's step and rule changes. *Import* is enabled only when no row has an error.
- **Matching:** garments by name, options by step + name. Blank price, description, colour or visibility on an existing row means "leave as is". Nothing is ever deleted. Uploading the same sheet twice changes nothing the second time, so if an import stops part-way (e.g. Shopify down), upload it again.
- **Rules from the sheet:** `only_with` → the option's pairing (`pairsWith`). `only_for_garments` → each garment's allowed options for that step. If every option in a step is `only_with` options of one earlier step, the step waits for them (`dependsOn`, e.g. Sleeve Cuff after Full Sleeve). Unknown measurement names are added as new measurement fields.
- **Pictures** are not in the sheet; upload them under *Missing pictures*.
- Backend: `GET /admin/catalog/sheet[?filled=true]`, `POST /admin/catalog/import[?apply=true]` (`services/catalogSheet.ts` reads and writes the workbook with `exceljs`; `services/catalogImport.ts` plans and applies). Writes go through `services/adminCatalog.ts`, so Shopify gets names, prices and visibility exactly as with a manual edit. Frontend: `features/admin/design-builder/BulkImportPanel.tsx`.

## AI Studio (admin → AI Studio): testing only

Extract embroidery from garment photos, split it into named pieces (each with position, side, work type and description), approve them, and try them on a plain garment.

- **Not connected to the website** until the client decides how it should appear:
  - The Design Builder has no "AI embroidery" picker.
  - Customer previews ignore studio embroidery: `STUDIO_EMBROIDERY_ON_WEBSITE = false` in `baliye-node/src/services/designRender.ts`.
- Frontend: `features/admin/studio/*`. Backend: `baliye-node/src/routes/ai.ts` (mounted at `/admin/ai`, admin-only), `services/embroidery*.ts`, `services/sheetSplitter.ts`, `services/motifTransfer.ts`.
- Pieces are saved automatically when an extraction finishes. "Extractions not saved yet" recovers unsaved ones, and "Add a missing piece" adds one image to a saved embroidery.
- The vision model that names pieces is `OPENAI_VISION_MODEL` (default `gpt-4.1-mini`). If it fails, a shape-based guess is used.
- Try-on placement: "Copy the layout from the source photo" (on by default when a source photo exists) has `OPENAI_LAYOUT_MODEL` (default `gpt-4.1`) read where every piece sits on the finished design, then maps it onto the plain garment by shoulders, cuffs and both hems (`services/referenceLayout.ts`). The preview returns that layout and Generate reuses it, so the paid image matches the preview. Unticked, each piece uses its region default (`compositeEmbroidery`).

## Style rules in use

- Fonts: Fira Sans everywhere (a serif heading font was tried and rolled back).
- Colours: as originally designed (mint `--color-primary`, burgundy `--color-secondary`), except black text is `#222`.
- No decorative dash lines before small headings, and no "—" in customer-facing copy.
- Tap targets 44px; phone layouts tested at 390px.

## Environment variables (optional unless noted)

**Backend (Render):** existing Mongo, Shopify, OpenAI and Twilio keys. `TOKENS_ENABLED`, `TOKEN_COST_RECOLOUR`, `OPENAI_VISION_MODEL`, `OPENAI_LAYOUT_MODEL`, `OPENAI_TEXT_MODEL` and `IMAGE_STORE` all have defaults.
**Frontend (Vercel):** `NEXT_PUBLIC_API_URL`, and `BACKEND_ORIGIN` when the API URL is relative. Optional: `NEXT_PUBLIC_DEMO_REVIEWS=false` (hide demo reviews), `NEXT_PUBLIC_ADDRESS_LOOKUP_URL`.

## Change log (newest first)

- **Client kit:** added `create-your-design-requirements.md`, the client message listing everything needed for Create Your Own Design (garments, choices per step, measurements, videos, custom-order policies).
- **Design Builder bulk import:** a *Bulk import* tab downloads the client sheet (blank or filled with the current catalogue) and imports it after a preview. It creates or updates garments, steps, options, measurement fields and rules, and never deletes. Checked read-only against the live catalogue: re-importing the current catalogue reports no changes (5 garments, 77 options), and the client-kit CSVs preview correctly. The client message now points to `design-builder-sheet.xlsx`. Backend adds the `exceljs` dependency, and `writeEntry` reads Shopify once per import instead of once per row (`withEntryCache`).

- **Backend cleanup:** removed the empty, misspelled `baliye-node/src/respositories/` folder (the real one is `src/repositories/`). Checked that `src/repositories/` matches git after an accidental delete and undo, and that every backend file is still imported by the server or a script.

- **AI Studio try-on copies the source layout:** pieces were placed by fixed region defaults (14 random butis over the body, "chest" motifs under the shoulders, the hem border on the salwar hem on a suit), so a try-on did not match the design it was extracted from. Now one vision call reads the source photo and the plain garment (labelled 10% grid on both) and every piece's position on the source; code maps them across (`services/referenceLayout.ts`, `compositeFromPlan` in `embroideryCompositor.ts`). `/admin/ai/assets/preview` and `/apply` accept `referenceImage` and `plan`; the panel sends step 1's front photo or its own upload.

- **Client kit** (`docs/client-kit/`): requirements message for the client, Shopify product CSV template (tags + metafield columns the site reads), Design Builder CSV templates (garments, options), a simple one-row-per-product client sheet (`client-product-sheet.csv`), and Sidekick prompts that turn it into the Shopify import CSV with photos linked from Shopify Files. The Design Builder CSV importer itself is not built yet.
- **Content editor:** a rich text editor (TipTap) replaces typing HTML on the Terms page, and "Write with AI" is on every text field (`POST /admin/content/write`).
- **Content and live updates:**
  - The Pre-made Designs page's banner, text and pictures are editable in the admin, with images in Shopify.
  - Open browsers refresh within about 3–6 s of an admin save, but never mid-task (`GET /content/version`, `lib/liveUpdates.ts`).
  - AI Studio is unhooked from the Design Builder and customer previews.
- **AI Studio:**
  - Pieces auto-save after extraction.
  - A "Saved in Shopify Files" badge shows where each image is stored.
  - "Extractions not saved yet" recovers unsaved extractions; "Add a missing piece" adds to a saved embroidery.
  - A "How AI Studio works" guide is on the page.
- **Design Builder admin:** missing pictures are grouped by part (garment cards, previews, each step), with jump chips.
- **Product detail page:**
  - Rebuilt in the listing's style: breadcrumb trail, sticky gallery, swipe on phones, a lens + side pop-up hover zoom on desktop, and a full-screen viewer.
  - Info column with price and savings, variants, CTAs, assurances, and fold-out description and specifications.
  - Shared promo block, redesigned reviews (summary card with breakdown, review cards, photo viewer), and a sticky price bar on phones.
- **Pre-made Designs listing:** rebuilt from the design mockup, with a hero, silhouette tiles, a sticky toolbar (icon chips, sort, 3/4 per row), new product cards and the promo.
- **Navbar:** wishlist heart with a count (desktop); wishlist in the phone menu; desktop links from 1024 px; 44px icons.
- **Website audit fixes:** copy and typos, footer contact links (a mailto/tel safeguard), Terms content, builder price updates live, instant colour tint in the builder, step counter, related products, and real reviews only (demos as described above).
- **Account and builder:**
  - Personal details, addresses and measurements panels redesigned.
  - Phone formatting with flags.
  - Date picker.
  - Measurement step with a "How to measure" video.
  - Design credits switch, statistics and OpenAI balance tracking.
