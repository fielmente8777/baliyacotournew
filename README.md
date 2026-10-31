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

## AI Studio (admin → AI Studio)

Extract embroidery from garment photos, split it into named pieces (each with position, side, work type and description), approve them, and try them on a plain garment.

- **On the website** through *Show in the designer* (`studio/DesignerLinks.tsx`, `PUT /admin/ai/embroidery-options/:optionId/collection`, `services/designRender.ts`): a linked Embroidery option shows the extracted sheet as its picture, is paired with what the embroidery goes with, and the designer's AI preview (`POST /designs/recolour`, `services/colourRender.ts`) copies that sheet and its pieces.
- Frontend: `features/admin/studio/*`. Backend: `baliye-node/src/routes/ai.ts` (mounted at `/admin/ai`, admin-only), `services/embroidery*.ts`, `services/sheetSplitter.ts`, `services/motifTransfer.ts`.
- Pieces are saved automatically when an extraction finishes. "Extractions not saved yet" recovers unsaved ones, and "Add a missing piece" adds one image to a saved embroidery.
- **Details per embroidery** (`EmbroideryCollection` model, keyed by `collectionId`): what it goes with, `neckOptionIds`, `sleeveOptionIds`, `lengthOptionIds`, `lowerOptionIds` (neck and sleeve required, plus a length or a lower), `dupattaOptionIds` and `colourOptionIds` (optional, none = any), and the admin's notes. Notes go into extraction, piece naming, try-on blend and the designer preview. The option lists become the linked Embroidery option's `pairsWith` (`syncStudioPairing`, `PAIRING_FIELDS` in `services/embroideryAssets.ts`): set on link and on every edit, cleared on unlink or delete; pairings with other steps are untouched. While linked, AI Studio owns that option's pairing with those six steps.
- **Pairing rule** (`isPairable` in `services/customization.ts`, mirrored by `filterByPairing` in `create-design/CreateDesignShell.tsx`): two-way, in step order. A step offers only options that suit every choice made in an earlier step, each step checked on its own. With the current order, Colour and Neck (before Embroidery) narrow the embroidery list and the chosen embroidery narrows Sleeve, Length, Lower and Dupatta (after it); any order works, since the rule is symmetric. The server also drops an option whose pairs in a later step are all missing on that garment.
- **Learning from corrections** (`EmbroideryLesson` model): when the admin changes an AI-named piece's name, position, side, work type or description, the first AI answer and the correction are kept (one row per piece, kept after deletes). The 15 latest go into the labelling prompt as examples. Nothing is retrained.
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

- **Clean-up: unused code removed, API docs completed.** Checked with an import-graph scan from every entry point (backend `index.ts` and scripts, every Next.js route file), the TypeScript unused-code checks, and a list of every backend route against what the website and panel call. Removed only what nothing calls and that was replaced or switched off:
  - **Frontend:** 13 unreachable components (`components/Video`, `sectionComponants`, `typography`, `banners/VideoBanner`, `buttons/LinkButton`, `sliders/SwiperCarousel`), `findMissingImages`, `flagEmoji`, the Swiper and unused rules in `app/style.scss`, and the `swiper` and `react-icons` packages.
  - **Backend:** the first-version suit designer (`/design/*`: its routes, controller, service, types, repositories, `DesignOption` and `Suit` models), the old admin garment-type and product endpoints (`/admin/garment-types/*`, `/admin/products/*` with `generate-variants` and `image-jobs`; replaced by `/admin/catalog/*`, products live in Shopify), the switched-off website render (`/designs/render`, `/admin/ai/base-garments`, `/admin/ai/renders/clear`, the `BaseGarment` model, `garmentMask`, `recolour`), the scripts `migrate:neck-first` and `seed:embroidery-pairs` (step order is free now, and the pairs script would overwrite AI Studio's pairing), the `lint` script (ESLint isn't installed in the backend), and functions only those used. Database collections are untouched.
  - **Kept on purpose:** admin order and replacement endpoints, `/auth/register`, `/products/:slug/related`, `/shopify/status`, `/shopify/sync-me`, `/wishlist/:id/move-to-cart`, `/admin/ai/status` and `/usage` (unused by the panel today but not duplicates, useful from Postman), and `script/fixUploadUrls.ts`.
  - **API docs (`/api-docs`, `/api-docs.json`):** every route is documented now (134 operations; 38 were missing: Shopify order detail, cancel and returns, replacements, team, admin orders, Design Builder catalogue writes, Write with AI, AI Studio extractions, collection edit/delete and designer link, wishlist, content version, preview polling). Request bodies for them are generated from the validation schemas (`config/swaggerSchemas.ts`), so the embroidery `…OptionIds` fields appear automatically. The recolour docs describe the `options` body the designer sends. New description (Baliye Couture, not a suit platform), a Production server (`https://api.baliyecouture.com/api/v1`) and every tag declared. **Fixed:** on Windows the docs were empty, because the route glob used backslashes (`config/swagger.ts`); Render was unaffected.
- **Admin panel guide updated for the latest panel** (`docs/client-kit/admin-panel-guide.docx` and `.pdf`, 16 pages, version 31 October 2026). New *Which dashboard?* box: everything is done in this admin panel, not the Shopify admin; Shopify stays for pre-made products, orders and payments. AI Studio: *what it goes with* (colour, neck, sleeve, length or lower, dupatta) with a table of what each does on the website, the Lower (salwar / pajama) photo box, 5 extra close-ups, the lower position, *details missing* on older embroidery. Design Builder: pencil and bin on garment cards, a *Starting fresh with your own garments* box, *Step order and embroidery* replaces *Keep Neck before Embroidery*, *Only offer with* works both ways. Measurement fields written out in full. Team: removing another owner. Quick reference rows added. Two mid-chapter page breaks removed so AI Studio flows without a blank page. AI Studio's in-app *How AI Studio works* panel got the same updates (lower position, matching in the designer, two new questions).
- **Design Builder: edit and delete on the garment cards.** Hovering a garment card (always shown on phones) shows a pencil, which opens its editor below and scrolls to it, and a bin, which deletes it after a confirm. Same soft delete as before (`DELETE /admin/catalog/garments/:id`): gone from the designer and hidden in Shopify; saved designs and orders keep their copy. Deleting every garment leaves just the *New garment* tile.
- **Team: remove another owner.** The Team list now has *Remove* on owner rows too (e.g. a leftover seed account like `admin@yourdomain.com`), never on your own row. The backend (`removeMember(requesterId, id)` in `services/team.ts`) refuses removing yourself or the last active owner. Members are removed as before.
- **Designer: steps follow the Design Builder's order exactly.** Neck was forced before Embroidery (`MUST_PRECEDE`, in the stepper and the server); that's gone, since pairing now works both ways in any order. Embroidery after Neck: the neck narrows the embroidery list. Embroidery before Neck: the embroidery narrows the necks. Checked by simulating three orders (colour-neck-embroidery, embroidery second, embroidery first), including going back and changing an earlier step.
- **AI Studio: embroidery goes with a neck, sleeve, length or lower, and optionally a colour and dupatta.**
  - **Admin:** step 1 and *Edit embroidery* (`studio/CollectionDetails.tsx`) have a chip picker per designer step: Colour (optional), Neck type and Sleeve type (required), Length or Lower (at least one: kurti and anarkali have Length, patiala and sharara have Lower), Dupatta (optional). *Extract embroidery* and *Find & name the pieces* stop and point at the pickers until they're filled, like the name. Saved cards and step 2 show "Goes with: V-Neck · Full Sleeve · Salwar…"; older embroidery shows "details missing" until edited.
  - **Designer:** the pairing rule now works both ways in step order. Picking a colour and a neck shows only the embroidery made for them; picking an embroidery narrows Sleeve, Length, Lower and Dupatta to its choices, and changing an earlier step clears a later choice that no longer fits. Each step is checked on its own (the neck and the sleeve must both fit), where before any one paired option was enough.
  - **Fixed:** the designer filtered on `availableWith`, which the server never sent (it sends `pairsWith`), so embroidery was never narrowed by neck while clicking through; only saving refused a mismatch. The stepper now reads `pairsWith`.
  - **Lower-garment embroidery:** new region `lower_garment` (salwar, pajama, sharara: ankle border, motifs down the leg) and a *Lower (salwar / pajama)* photo slot (extra close-ups go from 6 to 5, still 12 photos in all). Extraction puts that work in its own bottom row of the sheet and the labeller names it as lower-garment work. Try-on places it only when the layout is copied from the source photo (the plain garment's landmarks stop at the kurta hem). The position map draws the lower under the kurta.
  - Backend: `POST /admin/ai/assets/build` (new embroidery) and `PATCH /admin/ai/assets/collections/:id` take the six `…OptionIds` arrays; a new embroidery without neck, sleeve and a length or lower is refused before any AI work. Collections list returns all six. `syncNeckPairing` is now `syncStudioPairing`.
- **Admin: `/admin` no longer crashes after sign-in.** `/admin` was a prerendered page whose only job was `redirect()`, and Vercel served it as a 200 with the redirect inside the page payload. Acting on that while `AdminShell` was still checking the session sometimes ended on Next's "This page couldn't load" screen, often after signing in from `/admin/login?redirect=/admin` or on reload. It is now a plain 307 in `next.config.ts` (`/admin` → `/admin/design-builder`), handled before any page code runs. `app/admin/page.tsx` stays only as a fallback.
- **Admin panel guide as a Word file:** `docs/client-kit/admin-panel-guide.docx` (editable), and `admin-panel-guide.pdf` is now Word's own *Save as PDF* of it (16 pages, clickable links). To change the guide without code: edit the .docx in Word, then *File › Save As › PDF*. Script route: `admin-panel-guide-word.py` builds the .docx from the same words as `admin-panel-guide.py` (needs `pip install python-docx`).
- **Admin panel guide: links and content pages.** The cover, contents and sign-in steps now give the test website (`https://test.baliyecouture.com/`) and admin panel (`https://test.baliyecouture.com/admin`) as clickable links (`SITE_URL`, `ADMIN_URL` at the top of the script; change them there for the live domain). The website content part now explains Save / Discard / Reset to original, every home page section top to bottom, the Pre-made Designs page, Footer and Terms. 16 pages.
- **Admin panel guide (PDF) for the client's team:** `docs/client-kit/admin-panel-guide.pdf`, 14 pages: signing in and the menu, AI Studio in depth (the three steps, extra close-ups, necklines, details for the AI, learning from corrections, try-on, showing embroidery in the designer, edit/delete, costs), best-results checklist, the Design Builder's four tabs, then content pages, measurements, newsletter, credits and Team, and a quick-reference table. Rebuild after panel changes with `python docs/client-kit/admin-panel-guide.py docs/client-kit/admin-panel-guide.pdf` (needs `pip install reportlab`).

- **Admin login: show / hide password**, and **Admin → Team** for more logins:
  - The login password box has an eye button (`PasswordField` in `features/admin/ui.tsx`, also used on the Team page).
  - **Team** (`features/admin/TeamView.tsx`, `/admin/team`, menu shows it to owners only): an owner adds a team member with name, email and password; they sign in at `/admin/login` and see the whole panel except Team. Per member: *Can sign in* switch, *New password*, *Remove*. Owner accounts are listed but can't be changed there.
  - **Roles:** `Admin.role` is `owner` or `member`; accounts made before this read as `owner` (the schema default), so the existing logins are owners. `npm run seed:admin` still makes owners.
  - **Access ends at once:** switching off, removing or giving a new password revokes the member's refresh tokens, and `authenticate` now checks that an admin token's account still exists and is on (cached 10 s, `services/team.ts → isAdminActive`); token refresh checks it too. Before, a token stayed valid for up to 15 minutes.
  - **Fix:** `PUT /admin/me` used to save any field sent, so an admin could have changed their own role or on/off state; it now ignores `role`, `isActive`, `addedBy` and `passwordHash`.
  - Backend: `GET/POST /admin/team`, `PATCH/DELETE /admin/team/:id` (owners only, `controllers/team.ts → requireOwner`), schemas in `types/team.ts`.

- **AI Studio: more photos, necklines, details, edit/delete, learning:**
  - **More close-ups:** after the six photo slots, *Add close-up* takes up to six more (12 in all), each with a box for what it shows; that text is sent to the AI as the photo's label (`PhotoSlots.tsx`). Extraction accepts 12 views (was 8).
  - **Necklines and details:** step 1 and the new *Edit embroidery* dialog (`CollectionDetails.tsx`) take the necklines it is made for (Neck Type chips; none = every neck) and *Details for the AI*. Shown on each saved card and at the top of step 2. In the designer, a linked embroidery then shows only after one of those necks is picked (through `pairsWith`, so each garment's steps must ask Neck before Embroidery).
  - **Saved embroidery cards:** pencil (edit) and bin (delete) on hover, always visible on phones. The step 2 rename prompt is replaced by the same dialog.
  - **Prompts use the details:** extraction, labelling, try-on blend and designer preview.
  - **Learning:** corrections to AI-named pieces are stored and shown to the labelling AI as examples (see *AI Studio* above).
  - Backend: `PATCH /admin/ai/assets/collections/:id` takes `collectionName`, `neckOptionIds`, `notes` (any of them); `POST /admin/ai/assets/build` takes `neckOptionIds`, `notes`; `POST /admin/ai/extract-motifs` takes `notes`. Collections list returns `neckOptionIds` and `notes`. New models `embroiderycollection.ts`, `embroiderylesson.ts`.

- **AI Studio → Show in the designer: choose the option's name.** The dropdown for each embroidery now has a *New option* section: *Show as "(the name it was saved with)"* and *Other name…*, which opens a box to type the name customers will see (Enter or *Show* saves, *Cancel* closes). Both are offered even when the embroidery is already shown, so it can be moved to a new name. Existing options are listed under *Existing Embroidery options* as before. A typed name that matches an existing option reuses that option (and switches it on if hidden), unless it already shows another embroidery, which is refused with a message. An embroidery saved without a name shows as *Untitled embroidery* and only offers *Other name…* (`studio/DesignerLinks.tsx`).

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
