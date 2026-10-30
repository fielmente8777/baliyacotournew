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
| Home page sections | `app/(website)/Home/Components/*`, default text in `Home/pagedata.tsx` (see *Home page* below) |
| Newsletter | Form `Home/Components/Newsletter.tsx` → `POST /newsletter`; admin list `features/admin/NewsletterView.tsx` (Admin → Newsletter). Backend `baliye-node/src/{models,services,controllers,routes}/newsletter.ts` |
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

## Home page

Sections, top to bottom: banner (photo in an arch + a live product card), four promises, shop by silhouette, statement, *A perfect fit, designed online* (a laptop showing a picture of the designer), *Ready to order* (product tabs), collections, fabric library, behind the scenes, customer photos and reviews (off until real ones exist), founders' note, newsletter. Every section except the banner has a **Show** switch in Admin → Home page.

- **Live data, admin words.** The admin edits words, pictures and links. Product names, prices and photos come from Shopify; the fabric library's fabrics and prices from the Design Builder, so they never go stale.
- **Banner card:** the product whose Shopify handle is set under *Product card on the photo*; hidden if that product is gone.
- **Silhouettes:** each card names a Shopify product type. Its "From" price is the lowest of that type; its picture is the admin's, else the Design Builder garment photo (`garment/<slug>`), else a product photo.
- **Designed online:** the laptop frame is drawn in code; its screen is the admin's picture (16:10 screenshot; default `public/home/designer-screen.jpg`, the designer on Anarkali Suit).
- **Ready to order:** each tab is a Shopify tag (`bestseller`, `editors-pick`, `custom`, or any other). A tab with fewer than four designs is filled by the *design it from scratch* card.
- **Newsletter:** sign-ups are stored in MongoDB (`NewsletterSubscriber`, one per email; signing up twice changes nothing; 10 sign-ups per 10 min per IP). Admin → Newsletter lists, searches, removes and exports a CSV for Shopify Email or Mailchimp. Nothing is emailed from our side.
- **Photo prompts:** `docs/client-kit/home-and-product-image-prompts.md` (home photos and all 12 products) and `option-image-prompts.md` (the 33 neck, sleeve, length, lower and dupatta option pictures; embroidery to follow), and `blank-shoot-prompts.md` (plain, no-embroidery shoots of the four garments for AI Studio try-on).

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

- **Embroidery accuracy, Design Builder options, blank shoots:**
  - **Designer AI preview copies AI Studio embroidery** instead of re-inventing it. The old prompt told the AI to use every option picture "only as a reference for the look", the embroidery sheet included, so motifs came out different. Now the sheet has its own rule (`sheetEmbroideryRule` in `baliye-node/src/config/prompts.ts`): what each area of the sheet means, clear the old embroidery first, copy every piece in its listed place, borders follow their edge, add nothing. The sheet is always image 2 and never dropped for the reference limit (`colourRender.ts`), and each piece is listed numbered, with its work type, description and full region wording (`collectionLooks`). `RESTYLE_VERSION` is `r2`, so old previews are remade.
  - **AI Studio try-on blend** (`blendCompositePrompt`): stricter about not redrawing, simplifying or re-colouring motifs and about bending borders over folds.
  - **Design Builder → step options:** each row has **Delete** (with a confirm) instead of *Hide*; visibility is still in *Edit* → *Visible to customers*. Options linked in AI Studio show the embroidery's picture and an *AI Studio* badge instead of an empty upload tile (`GET /admin/catalog` now returns `studioImages`, option id → picture). The *No image* text fades under the *Upload* label on hover instead of overlapping it.
  - **New `docs/client-kit/blank-shoot-prompts.md`:** prompts for plain shoots of Patiala Suit, Kurti, Anarkali Suit and Sharara Set, by editing the current photo (best: same framing) or from scratch, plus the rules that make a try-on match.

- **Admin menu on phones slides in from the left** (`AdminShell.tsx`), like the storefront's, instead of dropping down under the top bar. It sits over a dimmed page and closes with ✕, a tap outside, Escape, or picking a page. The page behind doesn't scroll while it's open. Desktop keeps its fixed sidebar.

- **AI Studio: missing name is pointed out.** Pressing *Extract embroidery*, *Find & name the pieces* or *Open & save* without a name scrolls to the name field, focuses it and turns it red with "Type a name for this embroidery first… Your photos are kept." The red goes as soon as a name is typed. The admin `TextField` gained `error` and `inputRef`.

- **AI Studio: easy to start another embroidery.** A *New embroidery* tile leads the *Saved embroidery* list, and a *Create new embroidery* bar sits under the open one (approved or not), next to the existing button in the page title. Starting new clears the form and scrolls to step 1; the saved one stays as it is.

- **AI Studio clean-up:** deleting a saved embroidery now works even when it's shown in the designer: its Embroidery option is unlinked first (it used to refuse with "unlink it first"). *Extractions not saved yet* only lists the last 7 days, and hides any whose picture no longer loads (older sheets were kept on the server disk, which a redeploy wipes).

- **AI Studio embroidery in the designer:**
  - **Admin:** AI Studio has a new *Show in the designer* card (`studio/DesignerLinks.tsx`). Each saved embroidery is shown through an Embroidery option: a new one named after it, or an existing one. This uses the existing `PUT /admin/ai/embroidery-options/:optionId/collection`.
  - **Designer:** once any embroidery is linked, the designer's Embroidery step lists only the linked ones plus *No Embroidery*. Each shows its extracted sheet as the card picture (or its first approved piece if there's no sheet), marked `fromStudio`.
  - **AI preview:** the preview uses that sheet as the reference, together with every approved piece and where it goes (`collectionLooks` in `embroideryAssets.ts`, used by `design.v2.ts` and `colourRender.ts`; the embroidery rule in `prompts.ts`).
  - **Missing pictures:** linked options no longer show up there.
  - **Undo:** unlinking every embroidery brings the old options back.

- **Backend text and vision AI on GPT-6 Astra:** *Write with AI*, embroidery piece labelling and "copy layout from source" now default to `gpt-6-astra` (was gpt-4.1 / 4.1-mini). Tested on the account's key. Override with `OPENAI_TEXT_MODEL`, `OPENAI_VISION_MODEL`, `OPENAI_LAYOUT_MODEL`. Pictures (designer previews, AI Studio) stay on the image model `gpt-image-2.5-sunburst`: Astra doesn't make images.

- **Designer preview: no colour wash while designing.** The browser tint over the whole photo (and the dimming) is gone: the photo stays as it is, the *Designing your outfit…* pill shows at the bottom, and the AI result replaces the photo when ready.
- **Backend: "Too many requests" in the admin fixed.** The general limit (`RATE_LIMIT_MAX` per 15 min per address) no longer counts requests from a signed-in admin, or the designer's free "is my preview ready?" checks (`GET /designs/render/:key`, `GET /designs/recolour/:key`, every 3 s while generating). Paid starts still have `renderRateLimiter`. In `baliye-node/src/middlewares/ratelimit.ts`.

- **Drag and drop pictures in the admin:** every picture tile (`ImageSlot`) takes a dropped image as well as a click. Design Builder → *Missing pictures* has a drop zone for many at once (`BulkPictureDrop.tsx`): each file goes to the picture its name matches (`neck-round-neck.jpg`, `option-neck-round-neck.jpg`, `Round Neck.jpg`…; names that fit two pictures, like `kurti` for card and preview, are never guessed). Unmatched files get a list to choose from; uploads run one at a time with a status per file.

- **Option image prompts redone** (`option-image-prompts.md`): one prompt, file name and Shopify key for every Neck Type (9), Sleeve Type (8), Length (5), Lower (6) and Dupatta (5) option in the live designer: 33 in all, same mannequin and background so the cards match. Embroidery is left for later; the Indo-Western Gown preview prompt is kept at the end. Back-neck pictures aren't needed (one picture per option card).

- **Ready to order tabs slide:** the white pill slides to the chosen tab and the designs slide in from that side, one after another (`animate-slide-from-right/left` in `globals.css`). The other tabs are prefetched (`usePrefetchProducts`), so a switch shows designs straight away.
- **Footer social icons:** Instagram and Facebook show by default, linking to instagram.com and facebook.com as placeholders; set the brand's pages in Admin → Footer → *Social media links*.

- **Home page: "Compose your piece" replaced** by *A perfect fit, designed online* (the client's design: words, *Try the designer* button, and a laptop showing a picture of the designer, editable in Admin → Home page). The quick designer's colour tint coloured the whole photo, so it's gone, along with the designer's `?select=` link it needed.
- **Footer, new layout** (same mint and dark colours): logo, line and social icons, then the link columns side by side, then the bottom bar. New admin fields: *Social media links* (icon picked from the address; empty ones hidden), *Copyright line* and *Credit line*. New defaults have Shop, Company and Contact columns; the saved footer keeps its own columns until changed (or *Reset to original*).
- **Write with AI off for links:** no AI button on links, Shopify handles, tags and product types, on anything in footer link columns or social links, or on any value that is an address, email or phone number.

- **Home page redesign** (from the *Baliye Home v5* mockup, keeping the site's own text colours, Fira Sans and the mint footer): new sections as described under *Home page*, each editable and switchable in Admin → Home page. Old sections (video banner, categories, design steps, pre-made carousel, bestsellers grid) are replaced; home content had never been saved in the admin, so nothing live was lost. The products-page promo now keeps its three design steps itself (`DesignYourOwnPromo.tsx`). The designer accepts `?select=` to start with options already chosen.
- **Newsletter:** sign-up form on the home page, `POST /newsletter` (public, rate-limited), and Admin → Newsletter (`GET /admin/newsletter`, `GET /admin/newsletter/export`, `DELETE /admin/newsletter/:id`).
- **Image prompts:** `option-image-prompts.md` rewritten from the live catalogue: one complete prompt and Shopify key for each of the 40 options still showing a drawing, plus the Indo-Western Gown preview. New `home-and-product-image-prompts.md`: home page photos (with sizes and Freepik searches) and a main prompt plus three follow-ups for each of the 12 products.

- **Option image prompts:** added `docs/client-kit/option-image-prompts.md`, ready-to-paste Gemini / Canva AI prompts for professional option card photos (neck, sleeve, cuff, length, lower, dupatta, embroidery, fabric) to replace the SVG drawings, with the Shopify key to upload each under.

- **Builder AI preview shows every choice:** the preview photo now changes for fabric, embroidery, neck, sleeve, length and every other step (size excepted), not only colour. The builder sends each choice that differs from the photo, with the picture from its option card, to `POST /designs/recolour` (`options: [{ optionId, imageUrl? }]`; `colourOptionId` still works). The backend (`colourRender.ts`, `restyleGarmentPrompt`) asks the AI to edit the real photo using those pictures as references. Results are cached per photo + choices, and colour-only previews keep their old cache. A new preview now waits 1 s after the last click whether credits are on or off, so clicking through swatches makes one generation, not many. The preview photo fills its frame (`object-cover`, 2:3) instead of showing cream side bands.

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
