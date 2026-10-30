# Blank garment shoots for AI Studio try-on: prompts

Plain versions (no embroidery) of the four Design Builder garments: **Patiala Suit, Kurti, Anarkali Suit, Sharara Set**. They are the *plain garment* in **Admin → AI Studio → step 3, Try it on a plain garment**: AI Studio places a saved embroidery on them, so the client can see one embroidery on every garment.

Make them in Gemini (Nano Banana), ChatGPT or any image tool that accepts a photo.

## What makes a try-on accurate

AI Studio finds the shoulders, cuffs and hems on both photos and copies the embroidery across by those points. The closer the blank photo is to the source photo, the closer the result. So:

1. **Same framing as the embroidered photo.** Same mannequin, same grey background, same camera height, the whole outfit in frame from the top of the mannequin to the bottom hem, nothing cropped.
2. **Front view, straight on.** Arms hanging down, slightly away from the body, so both cuffs are clearly visible.
3. **Portrait 3:4** (for example 1536 × 2048). AI Studio works in 3:4; other shapes get padded.
4. **Truly plain fabric.** No print, no border, no lace, no piping in a contrast colour. Any trim left on the photo gets mixed up with the new embroidery.
5. **A mid-tone colour** (pastel blue, rose, sage, mustard). Pure white or black hides the embroidery's edges.
6. **Even, soft light, no strong shadows** across the chest or hem.

## Method 1 (best): remove the embroidery from the existing photo

Attach the current garment photo (the one on the Design Builder card) and paste the prompt for that garment. Because it is the same photo, the shape, folds and framing match exactly, which gives the best try-on.

If the tool changes the framing, add: *"Do not crop, zoom, reframe or move the camera."*

### Patiala Suit

File name: `blank-patiala-suit.jpg`

```text
Edit the attached photo. Remove ALL embroidery, zari, sequins, beads, mirror work, lace and printed borders from the whole outfit: the kurta's front panels and vertical placket stripes, the neckline, the sleeves and cuffs, the kurta hem, and the Patiala salwar's pleats and ankle cuffs. Where embroidery was, show the same plain fabric as the rest of the garment, continuing its weave, sheen, folds and shading naturally, with no smudge, ghost outline or colour patch left behind.
Keep everything else exactly the same: the same light blue fabric colour, the same cut, neckline, sleeve length, kurta length, the Patiala salwar's gathered pleats, the same white mannequin and hands, pose, grey studio background, lighting, camera angle and framing. Do not crop, zoom or reframe. Photorealistic, sharp, true-to-life colour. No text, no logo, no watermark. Portrait 3:4.
```

### Kurti

File name: `blank-kurti.jpg`

```text
Edit the attached photo. Remove ALL embroidery, zari, sequins, beads, mirror work, lace and printed borders from the whole outfit: the kurti's neckline, front, sleeve cuffs and side slits, the kurti hem, and the trouser hems. Where embroidery was, show the same plain fabric as the rest of the garment, continuing its weave, sheen, folds and shading naturally, with no smudge, ghost outline or colour patch left behind.
Keep everything else exactly the same: the same blue fabric colour, the same cut, neckline, three-quarter flared sleeves, kurti length, straight trousers, the same white mannequin and hands, pose, grey studio background, lighting, camera angle and framing. Do not crop, zoom or reframe. Photorealistic, sharp, true-to-life colour. No text, no logo, no watermark. Portrait 3:4.
```

### Anarkali Suit

File name: `blank-anarkali-suit.jpg`

```text
Edit the attached photo. Remove ALL embroidery, zari, gota, sequins, beads, mirror work, lace, brocade pattern and printed borders from the whole outfit: the bodice and yoke, the neckline, the sleeves and cuffs, the waistline, the flared skirt panels and the wide hem border. Where embroidery was, show the same plain fabric as the rest of the garment, continuing its weave, sheen, folds and the flare of the skirt naturally, with no smudge, ghost outline or colour patch left behind.
Keep everything else exactly the same: the same ivory fabric colour, the same fitted bodice, neckline, full sleeves, floor-length flared Anarkali silhouette and its folds, the same white mannequin and hands, pose, grey studio background, lighting, camera angle and framing. Do not crop, zoom or reframe. Photorealistic, sharp, true-to-life colour. No text, no logo, no watermark. Portrait 3:4.
```

### Sharara Set

File name: `blank-sharara-set.jpg`

```text
Edit the attached photo. Remove ALL embroidery, zari, sequins, beads, mirror work, lace and printed borders from the whole outfit: the short kurta's neckline, front, sleeves and cuffs and hem, and the sharara's flared legs and hem borders. Where embroidery was, show the same plain fabric as the rest of the garment, continuing its weave, sheen, folds and the flare of the sharara naturally, with no smudge, ghost outline or colour patch left behind.
Keep everything else exactly the same: the same dusty pink fabric colour, the same short kurta cut, neckline, sleeves, the wide flared sharara with its knee-level flare, the same white mannequin and hands, pose, grey studio background, lighting, camera angle and framing. Do not crop, zoom or reframe. Photorealistic, sharp, true-to-life colour. No text, no logo, no watermark. Portrait 3:4.
```

## Method 2: a new shoot from scratch

Use when there is no photo to edit, or to show another colour. Make the first one, then attach it to each next prompt with *"Same mannequin, background, lighting and camera as the attached image. Only change the garment to:"* so all four match.

### Patiala Suit

```text
Full-length front view studio product photo of a Patiala suit on a matte white headless dress-form mannequin with white mannequin hands, arms hanging straight down slightly away from the body. Plain solid light blue silk-cotton kurta with a round neckline, full sleeves with plain cuffs, straight cut to mid-thigh with side slits. Matching plain Patiala salwar with deep gathered pleats falling to narrow ankle cuffs. Absolutely no embroidery, no print, no lace, no border, no contrast trim. The whole outfit in frame from the top of the mannequin to the salwar hem, centred, with a little space around it. Plain light grey seamless studio background, soft even lighting, no harsh shadows. Photorealistic, true fabric texture and drape, sharp focus, true-to-life colour. No text, no logo, no watermark, no model, no jewellery, no dupatta. Portrait 3:4.
```

### Kurti

```text
Full-length front view studio product photo of a kurti set on a matte white headless dress-form mannequin with white mannequin hands, arms hanging straight down slightly away from the body. Plain solid sky blue silk kurti with a round neckline, three-quarter flared sleeves with plain cuffs, straight cut to just above the knee with side slits. Matching plain straight-leg trousers to the ankle. Absolutely no embroidery, no print, no lace, no border, no contrast trim. The whole outfit in frame from the top of the mannequin to the trouser hem, centred, with a little space around it. Plain light grey seamless studio background, soft even lighting, no harsh shadows. Photorealistic, true fabric texture and drape, sharp focus, true-to-life colour. No text, no logo, no watermark, no model, no jewellery, no dupatta. Portrait 3:4.
```

### Anarkali Suit

```text
Full-length front view studio product photo of an Anarkali suit on a matte white headless dress-form mannequin with white mannequin hands, arms hanging straight down slightly away from the body. Plain solid ivory georgette Anarkali with a fitted bodice, round neckline, full sleeves with plain cuffs, and a floor-length skirt flaring out from the waist in soft even folds. Absolutely no embroidery, no print, no brocade, no gota, no lace, no border, no contrast trim. The whole garment in frame from the top of the mannequin to the hem, centred, with a little space around it. Plain light grey seamless studio background, soft even lighting, no harsh shadows. Photorealistic, true fabric texture and drape, sharp focus, true-to-life colour. No text, no logo, no watermark, no model, no jewellery, no dupatta. Portrait 3:4.
```

### Sharara Set

```text
Full-length front view studio product photo of a sharara set on a matte white headless dress-form mannequin with white mannequin hands, arms hanging straight down slightly away from the body. Plain solid dusty pink silk short kurta with a round neckline, full sleeves with plain cuffs, cut to mid-thigh. Matching plain sharara: wide-legged palazzo trousers fitted to the knee and flaring out in full folds to the floor. Absolutely no embroidery, no print, no lace, no border, no contrast trim. The whole outfit in frame from the top of the mannequin to the sharara hem, centred, with a little space around it. Plain light grey seamless studio background, soft even lighting, no harsh shadows. Photorealistic, true fabric texture and drape, sharp focus, true-to-life colour. No text, no logo, no watermark, no model, no jewellery, no dupatta. Portrait 3:4.
```

### Another colour

Attach a finished blank and paste:

```text
Change only the fabric colour of the whole outfit to [colour, e.g. sage green], as if the same cloth had been dyed: keep every fold, crease, shade and the sheen exactly. Keep the cut, mannequin, pose, background, lighting and framing exactly the same. Still no embroidery, print or trim. Portrait 3:4.
```

## Check before using a blank

- No embroidery, border or trim left anywhere, including the cuffs and the salwar, trouser or sharara hem.
- Both shoulders, both cuffs and the bottom hem are clearly visible and not cut off by the frame.
- The garment shape matches the embroidered photo (same sleeve length, same kurta length).

Then in AI Studio: open the saved embroidery, upload the blank under step 3 *Try it on a plain garment*, keep **Copy the layout from the source photo** ticked, check *Preview placement (free)*, then press *Generate try-on*.
