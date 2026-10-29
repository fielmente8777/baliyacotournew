# Shopify Sidekick prompts: products from the client's sheet

**How it works**
1. The client fills `client-product-sheet.csv`, one row per product, and sends the photos in one folder, named exactly as in the sheet.
2. You upload all the photos to Shopify, then paste Prompt 1 plus the sheet into Sidekick. It returns the import CSV with the photos linked.
3. Import the CSV in Shopify.

---

## Step 1: Upload the photos to Shopify (once per batch)

1. Shopify admin › **Content › Files** › **Upload files**, and select all the client's photos at once.
2. When they finish, open any one file and click **Copy link**. It looks like:
   `https://cdn.shopify.com/s/files/1/0000/0000/0000/files/sky-blue-patiala-front.jpg?v=1730000000`
3. Keep the part **before the file name**; that's the photo address prefix, e.g.
   `https://cdn.shopify.com/s/files/1/0000/0000/0000/files/`

> If Shopify renamed a file on upload (because of a duplicate name), use that file's own link instead.

---

## Prompt 1: Turn the client's sheet into a Shopify import CSV

Paste into Sidekick (Shopify admin › Sidekick), fill in the prefix, and paste the client's sheet at the end.

```
Convert the product sheet below into a Shopify product import CSV.

Photo address prefix: [PASTE THE PREFIX, ending in /files/]
Each photo's address = the prefix + the file name from "Photo file names".

Use exactly these columns, in this order:
Handle, Title, Body (HTML), Vendor, Type, Tags, Published, Option1 Name,
Option1 Value, Variant SKU, Variant Grams, Variant Inventory Tracker,
Variant Inventory Qty, Variant Inventory Policy, Variant Fulfillment Service,
Variant Price, Variant Compare At Price, Variant Requires Shipping,
Variant Taxable, Image Src, Image Position, Image Alt Text, SEO Title,
SEO Description,
Color (product.metafields.custom.color),
Material (product.metafields.custom.material),
Neckline (product.metafields.custom.neckline),
Sleeve length (product.metafields.custom.sleeve_length),
Embroidery style (product.metafields.custom.embroidery_style),
Care instructions (product.metafields.custom.care_instructions),
Status

Rules:
- One row per size. The first row of a product carries all product fields;
  later rows only Handle and the variant columns.
- Every photo after the first goes on its own row with only Handle, Image Src,
  Image Position (2, 3, 4…) and Image Alt Text. Photo 1 goes on the first row.
- Handle: product name and colour in lowercase joined by hyphens,
  e.g. cotton-patiala-suit-sky-blue.
- Title: "<Product name> - <Colour>".
- Body (HTML): the description in <p> tags. If there is a note, add it as a second <p>.
- Vendor: Baliye Couture. Published: TRUE. Status: active.
- Type: the "Garment type" exactly as written (it groups products on the website).
- Tags (comma separated):
    add "custom" if Customer can customise = Yes
    add "made-to-order" if Made to order = Yes
    add "bestseller" if Bestseller = Yes
    add "editors-pick" if Editor's Pick = Yes
- Option1 Name: Size. Option1 Value: each size from "Sizes available".
- Stock: from "Stock per size" (e.g. S=5). Use Variant Inventory Tracker "shopify"
  and Variant Inventory Policy "deny".
  If the size is "Made to measure" or Made to order = Yes: leave the tracker and
  quantity empty and use policy "continue".
- Variant SKU: BAL-<first 3 letters of garment type>-<first 3 letters of colour>-<size>,
  upper case, e.g. BAL-PAT-SKY-M.
- Variant Price: "Price (INR)". Variant Compare At Price: "Original price" if given, else empty.
- Variant Grams: 700, or 1500 for velvet, bridal or heavily embroidered pieces.
- Variant Requires Shipping: TRUE. Variant Taxable: TRUE. Variant Fulfillment Service: manual.
- Image Alt Text: "<Colour> <Product name> - <front/back/detail…>" from the file name.
- SEO Title: "<Title> | Baliye Couture" (max 70 characters).
  SEO Description: one sentence from the description, max 160 characters.
- Metafields: Colour, Fabric / material, Neckline, Sleeve length, Embroidery style
  and Care instructions from the sheet. Leave blank if empty.
- British English. Don't invent anything: if a value is missing, leave the cell empty.

Return only the CSV, nothing else.

Product sheet:
[PASTE THE CLIENT'S FILLED SHEET HERE]
```

---

## Prompt 2 (optional): Ask Sidekick for a blank client sheet

Use this instead of `client-product-sheet.csv` if you want Sidekick to make the template.

```
Create a CSV template my client can fill in, one row per product, to add products
to my Shopify store. Use exactly these column headings:

Product name, Colour, Garment type, Description, Fabric / material, Neckline,
Sleeve length, Embroidery style, Care instructions, Price (INR),
Original price if on sale (INR), Sizes available, Stock per size,
Made to order? (Yes/No), Days to make and deliver, Customer can customise? (Yes/No),
Bestseller? (Yes/No), Editor's Pick? (Yes/No),
Photo file names (first = main photo), Notes

Add two example rows for Indian ethnic wear: a cotton Patiala suit in sky blue
(sizes S, M, L, XL with stock per size, on sale) and a made-to-measure bridal
Anarkali in emerald green velvet with zardozi. Garment type must be one of:
Kurti, Anarkali, Sharara Set, Patiala Suit, Lehenga.
Photo file names: comma separated, e.g. sky-blue-patiala-front.jpg.
Return only the CSV.
```

---

## Step 3: Import

1. **Metafields must exist.** Check the six product metafield definitions exist (Settings › Custom data › Products): `custom.color`, `custom.material`, `custom.neckline`, `custom.sleeve_length`, `custom.embroidery_style`, `custom.care_instructions`. Without them, those columns are skipped.
2. **Import:** Products › **Import** › upload the CSV › **Preview** to check a product or two › **Import products**. Tick "Overwrite products with matching handles" only when updating products that already exist.
3. **Make them visible on the website:** each product must be available on the website's sales channel (the Headless / Storefront channel). If a product doesn't appear on the site, check this first.
4. **Spot-check on the website:** the product page, photos, sizes, price, and the badges (Customisable, Bestseller, Editor's Pick).
