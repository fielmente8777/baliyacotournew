# Prompt for Shopify Sidekick (or any AI): build the product import CSV

Paste this into Sidekick (Shopify admin › Sidekick), then paste or attach the client's product details under it.

```
Create a Shopify product import CSV for my store from the product details below.
Use Shopify's standard product CSV format, one row per variant, with these columns:

Handle, Title, Body (HTML), Vendor, Type, Tags, Published, Option1 Name,
Option1 Value, Option2 Name, Option2 Value, Variant SKU, Variant Grams,
Variant Inventory Tracker, Variant Inventory Qty, Variant Inventory Policy,
Variant Fulfillment Service, Variant Price, Variant Compare At Price,
Variant Requires Shipping, Variant Taxable, Image Src, Image Position,
Image Alt Text, SEO Title, SEO Description,
Color (product.metafields.custom.color),
Material (product.metafields.custom.material),
Neckline (product.metafields.custom.neckline),
Sleeve length (product.metafields.custom.sleeve_length),
Embroidery style (product.metafields.custom.embroidery_style),
Care instructions (product.metafields.custom.care_instructions),
Status

Rules:
- Vendor is always "Baliye Couture". Status is "active". Published is TRUE.
- Type is the garment type exactly as one of: Kurti, Anarkali, Sharara Set,
  Patiala Suit, Lehenga (the website groups products by it).
- Handle: lowercase name and colour joined with hyphens, e.g. cotton-patiala-suit-sky-blue.
- Title: "<Name> - <Colour>".
- Body (HTML): the description wrapped in <p> tags.
- Tags, comma-separated, only from this list plus 1-3 descriptive words:
    custom         = customer can customise it
    made-to-order  = stitched after ordering
    bestseller     = show in Bestsellers
    editors-pick   = show as Editor's Pick
- Option1 Name is "Size"; one row per size with its stock in Variant Inventory Qty,
  Variant Inventory Tracker "shopify" and Variant Inventory Policy "deny".
  For made-to-measure pieces use one variant "Made to measure", leave the
  tracker and quantity empty and set the policy to "continue".
- Prices in INR without the ₹ sign. Compare At Price only if it is on sale.
- Variant Grams: 700 for everyday wear, 1500 for heavy or bridal pieces.
- Images: first row of each product holds image 1; each further image goes on its
  own row with only Handle, Image Src, Image Position and Image Alt Text filled
  (variant rows can also carry an image). Alt text: "<colour> <name> - <view>".
- SEO Title: "<Title> | Baliye Couture" (max 70 characters);
  SEO Description: one sentence, max 160 characters.
- Fill the six metafield columns from the product details; leave blank if unknown.
- Use British English (colour) and no em dashes. Do not invent prices, stock or details.

Return only the CSV.

Product details:
[paste the client's product details here]
```

## Before importing
1. **Metafields must exist.** Make sure the six product metafield definitions exist (Settings › Custom data › Products) with these keys: `custom.color`, `custom.material`, `custom.neckline`, `custom.sleeve_length`, `custom.embroidery_style`, `custom.care_instructions`. Otherwise those columns are ignored.
2. **Photos need public links.** `Image Src` must be a public link. Upload the photos first (Content › Files), copy each file's link into the sheet, or leave `Image Src` empty and add the photos on each product afterwards.
3. **Import:** Products › Import › choose the CSV. Tick "Overwrite products with matching handles" only when updating products that already exist.
4. **Make them visible on the website:** each product must be available on the website's sales channel (the Headless / Storefront channel used by the site).
