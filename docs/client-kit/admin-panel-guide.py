"""Builds the Baliye Couture admin panel user guide (PDF)."""
import sys

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, Frame, KeepTogether, NextPageTemplate, PageBreak, PageTemplate,
    Paragraph, Spacer, Table, TableStyle,
)

OUT = sys.argv[1]

SITE_URL = 'https://test.baliyecouture.com/'
ADMIN_URL = 'https://test.baliyecouture.com/admin'


def link(url, text=None):
    return f'<link href="{url}" color="#9B2C40"><u>{text or url}</u></link>'

BURGUNDY = colors.HexColor('#9B2C40')
MINT = colors.HexColor('#E0F1DC')
INK = colors.HexColor('#222222')
GREY = colors.HexColor('#666666')
LINE = colors.HexColor('#E6E0D6')
CREAM = colors.HexColor('#FAF6F0')
AMBER_BG = colors.HexColor('#FFF4E0')
AMBER = colors.HexColor('#8A5A00')

W, H = A4
MARGIN = 18 * mm

base = dict(fontName='Helvetica', fontSize=10, leading=14.5, textColor=INK)
S = {
    'body': ParagraphStyle('body', **base, spaceAfter=6),
    'small': ParagraphStyle('small', **{**base, 'fontSize': 8.5, 'leading': 12, 'textColor': GREY}),
    'h1': ParagraphStyle('h1', fontName='Helvetica-Bold', fontSize=20, leading=25, textColor=BURGUNDY, spaceBefore=4, spaceAfter=10),
    'h2': ParagraphStyle('h2', fontName='Helvetica-Bold', fontSize=13.5, leading=18, textColor=INK, spaceBefore=12, spaceAfter=6, keepWithNext=1),
    'h3': ParagraphStyle('h3', fontName='Helvetica-Bold', fontSize=11, leading=15, textColor=BURGUNDY, spaceBefore=8, spaceAfter=4, keepWithNext=1),
    'bullet': ParagraphStyle('bullet', **base, leftIndent=14, bulletIndent=3, spaceAfter=3),
    'num': ParagraphStyle('num', **base, leftIndent=18, bulletIndent=0, spaceAfter=4),
    'cell': ParagraphStyle('cell', **{**base, 'fontSize': 9, 'leading': 12.5}),
    'cellb': ParagraphStyle('cellb', **{**base, 'fontName': 'Helvetica-Bold', 'fontSize': 9, 'leading': 12.5}),
    'tip': ParagraphStyle('tip', **{**base, 'fontSize': 9.5, 'leading': 13.5}),
    'toc': ParagraphStyle('toc', **{**base, 'fontSize': 11, 'leading': 20}),
}

story = []


def p(text, style='body'):
    story.append(Paragraph(text, S[style]))


def h1(text):
    story.append(Paragraph(text, S['h1']))


def h2(text):
    story.append(Paragraph(text, S['h2']))


def h3(text):
    story.append(Paragraph(text, S['h3']))


def bullets(items):
    for it in items:
        story.append(Paragraph(it, S['bullet'], bulletText='•'))
    story.append(Spacer(1, 4))


def steps(items):
    for i, it in enumerate(items, 1):
        story.append(Paragraph(it, S['num'], bulletText=f'{i}.'))
    story.append(Spacer(1, 4))


def box(title, lines, tone='tip'):
    bg, fg = (MINT, colors.HexColor('#2F5A2A')) if tone == 'tip' else (AMBER_BG, AMBER)
    content = [Paragraph(f'<b>{title}</b>', ParagraphStyle('bt', parent=S['tip'], textColor=fg))]
    for line in lines:
        content.append(Paragraph(line, S['tip']))
    t = Table([[content]], colWidths=[W - 2 * MARGIN])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg),
        ('LEFTPADDING', (0, 0), (-1, -1), 10), ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8), ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(Spacer(1, 4))
    story.append(KeepTogether(t))
    story.append(Spacer(1, 8))


def table(rows, widths, header=True):
    data = [[Paragraph(c, S['cellb'] if (header and r == 0) else S['cell']) for c in row] for r, row in enumerate(rows)]
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
    style = [
        ('GRID', (0, 0), (-1, -1), 0.5, LINE),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6), ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]
    if header:
        style.append(('BACKGROUND', (0, 0), (-1, 0), CREAM))
    t.setStyle(TableStyle(style))
    story.append(t)
    story.append(Spacer(1, 8))


# ---------------------------------------------------------------- cover
def cover(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(BURGUNDY)
    canvas.rect(0, H - 120 * mm, W, 120 * mm, fill=1, stroke=0)
    canvas.setFillColor(MINT)
    canvas.rect(0, H - 124 * mm, W, 4 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont('Helvetica', 13)
    canvas.drawString(MARGIN, H - 45 * mm, 'BALIYE COUTURE')
    canvas.setFont('Helvetica-Bold', 32)
    canvas.drawString(MARGIN, H - 70 * mm, 'Admin Panel Guide')
    canvas.setFont('Helvetica', 14)
    canvas.drawString(MARGIN, H - 82 * mm, 'AI Studio, Design Builder and everything else')
    canvas.setFillColor(INK)
    canvas.setFont('Helvetica', 11)
    y = H - 150 * mm
    for line in [
        'For the Baliye Couture team.',
        'How to sign in, create AI embroidery, set up Create Your Own Design,',
        'and look after the website content.',
    ]:
        canvas.drawString(MARGIN, y, line)
        y -= 16

    # The two addresses, clickable.
    y -= 18
    for label, url in [('Website', SITE_URL), ('Admin panel', ADMIN_URL)]:
        canvas.setFillColor(GREY)
        canvas.setFont('Helvetica', 9)
        canvas.drawString(MARGIN, y, label.upper())
        canvas.setFillColor(BURGUNDY)
        canvas.setFont('Helvetica-Bold', 13)
        canvas.drawString(MARGIN, y - 16, url)
        width = canvas.stringWidth(url, 'Helvetica-Bold', 13)
        canvas.linkURL(url, (MARGIN, y - 20, MARGIN + width, y - 4), relative=0)
        y -= 44
    canvas.setFillColor(GREY)
    canvas.setFont('Helvetica', 9)
    canvas.drawString(MARGIN, 20 * mm, 'Version: 31 October 2026')
    canvas.restoreState()


def page(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(MARGIN, H - 12 * mm, W - MARGIN, H - 12 * mm)
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(GREY)
    canvas.drawString(MARGIN, H - 10 * mm, 'Baliye Couture  ·  Admin Panel Guide')
    canvas.drawRightString(W - MARGIN, 10 * mm, f'Page {doc.page}')
    canvas.restoreState()


# ---------------------------------------------------------------- contents
story.append(NextPageTemplate('body'))
story.append(PageBreak())
h1('Contents')
for line in [
    '1.  Getting started: signing in, the menu, your team',
    '2.  AI Studio: turning real embroidery into reusable pieces',
    '3.  Getting the best AI results',
    '4.  Design Builder: setting up Create Your Own Design',
    '5.  Other sections: content, measurements, newsletter, credits, team',
    '6.  Quick reference: where to find things',
]:
    p(line, 'toc')
story.append(Spacer(1, 10))
table([
    ['', 'Address', 'What it is'],
    ['<b>Website</b>', link(SITE_URL), 'The shop your customers see: pre-made designs, Create Your Own Design, cart and checkout.'],
    ['<b>Admin panel</b>', link(ADMIN_URL), 'Where you and your team manage everything in this guide. Sign in with your email and password.'],
], [28 * mm, 68 * mm, W - 2 * MARGIN - 96 * mm])
box('Which dashboard?', [
    'Everything in this guide is done in the <b>Baliye admin panel</b> above, not in the Shopify admin. AI Studio, the Design Builder, '
    'measurements, website words and pictures, the newsletter, design credits and your team all live here.',
    'Shopify is still where you manage the <b>pre-made products</b> (their names, prices, photos and tags), <b>orders</b> and <b>payments</b>. '
    'The website reads those from Shopify automatically.',
])
box('How to read this guide', [
    'Words in <b>bold</b> are buttons, tabs or fields exactly as they appear on screen. '
    'A path like <b>AI Studio › Saved embroidery</b> means: open AI Studio from the menu, then go to the Saved embroidery section.',
])

# ---------------------------------------------------------------- 1
story.append(PageBreak())
h1('1. Getting started')
h2('Signing in')
steps([
    f'Open the admin panel: {link(ADMIN_URL)}. Bookmark it for next time.',
    'Type your <b>Email</b> and <b>Password</b>. Click the eye icon in the password box to show or hide what you typed.',
    'Click <b>Sign in</b>. You land on the Design Builder.',
])
p('You stay signed in on that browser. Use <b>Sign out</b> at the bottom of the menu when you are on a shared computer.')
p(f'To see your changes as customers do, open the website in another tab: {link(SITE_URL)}. '
  'The <b>View website</b> link at the bottom of the admin menu opens it too.')

h2('The menu')
p('The menu is on the left on a computer. On a phone, tap the menu icon at the top left; it slides in from the side.')
table([
    ['Menu item', 'What it is for'],
    ['<b>Design Builder</b>', 'Garments, steps and options for Create Your Own Design, their prices and pictures.'],
    ['<b>AI Studio</b>', 'Turn embroidery from real garment photos into pieces the AI can place on any garment.'],
    ['<b>Measurement fields</b>', 'The measurements customers fill in.'],
    ['<b>Home page</b>, <b>Pre-made Designs page</b>, <b>Footer</b>, <b>Terms &amp; Conditions</b>', 'Words and pictures on those website pages.'],
    ['<b>Newsletter</b>', 'People who signed up for the newsletter.'],
    ['<b>Design credits</b>', 'Credits customers use for AI designs, and your remaining AI balance.'],
    ['<b>Team</b> (owners only)', 'Add or remove people who can sign in to this panel, including other owner accounts.'],
], [55 * mm, W - 2 * MARGIN - 55 * mm])

h2('Owners and team members')
bullets([
    '<b>Owners</b> are the main Baliye accounts. They see everything, including <b>Team</b>.',
    '<b>Team members</b> are added by an owner. They see and can change everything except the Team page.',
    'How to add someone is in section 5, <i>Team</i>.',
])

# ---------------------------------------------------------------- 2
story.append(PageBreak())
h1('2. AI Studio')
p('AI Studio takes a photo of a real embroidered garment and lifts the embroidery off it. It cuts the result into '
  'separate <b>pieces</b> (neckline border, shoulder motif, cuff border, hem border and so on) and remembers where '
  'each piece belongs. Those pieces can then be stitched onto any plain garment, in any colour, and offered to '
  'customers in Create Your Own Design.')
p('Each embroidery you make is saved under a name, for example <i>Gota Rose</i>, and appears under <b>Saved embroidery</b> at the top of the page.')

h2('The three steps at a glance')
table([
    ['Step', 'What you do', 'Cost'],
    ['<b>1. Add the embroidery</b>', 'Name it, tick what it goes with (neck, sleeve, length or lower, and optionally colour and dupatta), write details, add photos, press <b>Extract embroidery</b>.', 'One AI image'],
    ['<b>2. Check the pieces</b>', 'Correct each piece’s name, position and side. Approve the good ones.', 'Free'],
    ['<b>3. Try it on</b>', 'Upload a plain garment photo, preview where pieces land, then generate.', 'Preview free, one AI image per variation'],
], [42 * mm, 95 * mm, W - 2 * MARGIN - 137 * mm])

h2('Step 1: Add the embroidery')
h3('Name, what it goes with, and details')
steps([
    '<b>Name of this embroidery</b>: a short name customers will understand, for example <i>Zari Work</i> or <i>Mirror Work Anarkali</i>. '
    'This is required before anything is saved; if it is missing the box turns red.',
    '<b>What does this embroidery go with?</b> Tick the choices from Create Your Own Design this embroidery is made for (see the table below). '
    'Neck type and sleeve type are required, plus a length or a lower. Colour and dupatta are optional. '
    'If something required is missing, <b>Extract embroidery</b> stops and the box shows what to tick. Your photos are kept.',
    '<b>Details for the AI</b>: write what someone who knows the work would say. Technique, colours, widths, and where each part sits. '
    'For example: <i>Hand gota patti in light gold with small pearls. Neckline border about 3 cm wide. Paisley butis only on the sleeves. '
    'Hem border sits just above the kurta hem.</i> These words are used every time the AI extracts, names or stitches this embroidery.',
])
table([
    ['Choice', 'Needed?', 'What it does on the website'],
    ['<b>Colour</b>', 'Optional', 'The embroidery shows only for these colours. Tick none and it shows for every colour.'],
    ['<b>Neck type</b>', 'Required', 'The embroidery shows only after the customer picks one of these necks. A V-neck embroidery only shows for a V-neck.'],
    ['<b>Sleeve type</b>', 'Required', 'Once the customer picks this embroidery, the Sleeve step offers only these sleeves.'],
    ['<b>Length</b>', 'Length or Lower', 'For kurti and anarkali. Once picked, the Length step offers only these.'],
    ['<b>Lower</b>', 'Length or Lower', 'For patiala and sharara: the salwar, pajama or sharara that goes with it, for example the one with the embroidered ankle border.'],
    ['<b>Dupatta</b>', 'Optional', 'Once picked, the Dupatta step offers only these. Tick none for any dupatta.'],
], [26 * mm, 28 * mm, W - 2 * MARGIN - 54 * mm])
p('Tick both a length and a lower if the embroidery suits every garment. A step can have several choices ticked, '
  'for example V-Neck and Sweetheart Neck.')
box('Why the details matter', [
    'The AI does not know embroidery the way you do. One or two sentences about the real technique and colours are the single '
    'biggest help to accuracy. Silver work, pastel threads and thin borders especially benefit from being described.',
])

h3('Where the embroidery comes from')
p('Choose one of two options:')
bullets([
    '<b>From garment photos</b>: the AI lifts the embroidery off your photos. Uses one AI image.',
    '<b>I have a clean embroidery image</b>: you already have the embroidery on a plain white background (for example from a designer). Free.',
])

h3('Adding photos')
p('There are seven photo boxes. Each one shows a small drawing of the part of the garment it should cover.')
table([
    ['Photo box', 'What to show'],
    ['<b>Front, full garment</b> (recommended)', 'Neck to hem, straight on. The most important photo.'],
    ['<b>Neckline close-up</b> (recommended)', 'Neck, yoke and upper chest, sharp and close.'],
    ['<b>Left sleeve</b>', 'Shoulder to cuff on the left of the photo.'],
    ['<b>Right sleeve</b>', 'Only if it differs from the left one.'],
    ['<b>Hem / daaman close-up</b> (recommended)', 'The bottom border, laid flat if you can.'],
    ['<b>Lower (salwar / pajama)</b>', 'Only if the lower has embroidery, for example an ankle border. That work is extracted too, as its own pieces.'],
    ['<b>Back</b>', 'Only if the back has embroidery.'],
], [62 * mm, W - 2 * MARGIN - 62 * mm])
p('<b>More close-ups.</b> After the seven boxes there is an <b>Add close-up</b> tile with a + sign. Use it for any detail the seven boxes miss: '
  'a cuff from closer, a motif, a second border. You can add up to five more (12 photos in all). Under each one, write what it shows, for example '
  '<i>left cuff, gota border, light gold</i>. The AI reads that line together with the photo.')
p('To replace or remove a photo, hover over it (on a phone the buttons are always shown) and use the arrows or the cross.')

h3('Extract')
steps([
    'Press <b>Extract embroidery</b>. It usually takes under two minutes. You can leave the page open and wait.',
    'When it finishes, the embroidery appears on a white sheet. AI Studio then cuts it into pieces, names them and saves them '
    'automatically under your name. You move straight to step 2.',
    'If the automatic saving did not start, press <b>Find &amp; name the pieces</b>. No new AI image is used.',
])
box('Page reloaded before it finished?', [
    'Finished extractions that were never saved appear under <b>Extractions not saved yet</b> (for 7 days). Type a name in step 1, '
    'then press <b>Open &amp; save</b> on the one you want. Nothing is charged again.',
], tone='warn')

h2('Step 2: Check the pieces')
p('Every piece has a picture and these fields. The small garment drawing on the left lights up where the piece you point at will go.')
table([
    ['Field', 'What it means'],
    ['<b>Piece name</b>', 'A clear name, for example <i>Zari Paisley Shoulder Motif</i>.'],
    ['<b>Position</b>', 'Where it belongs: neckline, yoke, placket, shoulder, chest, sleeve, sleeve cuff, waist, buti (small repeated motif), hem border, lower border, '
     '<b>lower (salwar, pajama)</b> for work on the bottom wear, or back.'],
    ['<b>Side (as in the photo)</b>', '<b>Pair</b> = on both sides, mirrored (most shoulders and cuffs). <b>Left</b> or <b>Right</b> = one side only. <b>Center</b> = on the centre line.'],
    ['<b>Work type</b>', 'The technique: Zari, Resham, Mirror, Sequin, Gota Patti, Zardozi, Beads, Cutdana, Aari…'],
    ['<b>Description</b>', 'One sentence on what it looks like and where it sits. The AI uses this when stitching it.'],
], [45 * mm, W - 2 * MARGIN - 45 * mm])
steps([
    'Go through each piece. Correct the position and side first: <b>that decides where it lands on every garment</b>.',
    'Correct the name, work type and description in your own words. Changes save when you click out of the box.',
    'Delete anything that is not embroidery (fabric, shadows, noise) with the bin icon on that piece.',
    'Approve each good piece, or press <b>Approve all</b> when every piece is right. Only approved pieces are ever used.',
    'If a piece is missing, use <b>Add a missing piece</b> and upload a clean picture of just that piece on white. The AI names it and finds its position.',
])
box('The AI learns from your corrections', [
    'Every time you correct a name, position, side, work type or description on a piece the AI named, AI Studio remembers what the AI said '
    'and what you changed it to. The next time it names pieces, it is shown your latest corrections as examples and follows your way of naming things. '
    'The more carefully the first few embroideries are corrected, the better the next ones come out.',
])
p('At the top of step 2 you can see what the embroidery <b>Goes with</b> (for example <i>Red · V-Neck · Full Sleeve · Salwar</i>) '
  'and its <b>Details for the AI</b>, with an <b>Edit details</b> button.')

h2('Step 3: Try it on a plain garment')
p('This is a test for you only. Customers do not see it.')
steps([
    'Upload a <b>Plain garment (no embroidery)</b> photo: front view, whole garment in frame. Its colour, cut and pose are kept exactly.',
    'Keep <b>Copy the layout from the source photo</b> ticked. AI Studio reads where each piece sits on the finished design and puts it '
    'in the same place on the plain garment. It uses the front photo from step 1, or you can add a <b>Source design photo</b> of the embroidered garment. '
    'Pieces on the lower (salwar, pajama) are only placed when this is ticked.',
    'If the garment is too close in colour to its background, AI Studio asks you to tap six points once (neckline, both shoulders, both cuffs, hem). '
    'They are reused for every try-on on that garment.',
    'Press <b>Preview placement</b>. This is free and shows exactly where every piece will land.',
    'Choose how many <b>Variations</b> you want (1 to 4; each is one AI image) and press <b>Generate try-on</b>.',
    'Results are saved. Use <b>Download</b> to keep a copy.',
])
box('Plain garment photos', [
    'For the closest match, the plain garment should look like the embroidered photo: same mannequin, same grey background, front view, '
    'arms slightly away from the body, the whole outfit in frame, and no embroidery or contrast trim at all.',
    'You can make plain versions of the Patiala Suit, Kurti, Anarkali Suit and Sharara Set in an AI image tool. Example prompt: '
    '<i>Full-length front view of a plain light blue Patiala suit on a white headless mannequin with white hands, arms down. '
    'No embroidery, no print, no border, no lace. Plain light grey studio background, soft even lighting. Photorealistic, whole outfit in frame, portrait 3:4.</i>',
    'Best of all: attach the embroidered photo and ask the tool to <i>remove all embroidery and keep everything else the same</i>.',
])

h2('Showing embroidery to customers')
p('Section <b>Show in the designer</b> decides which saved embroidery customers can pick in the <b>Embroidery</b> step of Create Your Own Design.')
p('Each saved embroidery has a dropdown:')
table([
    ['Choice', 'What happens'],
    ['<b>Not shown</b>', 'Customers do not see it.'],
    ['<b>Show as "(its name)" (name it was saved with)</b>', 'A new Embroidery option is created with that name and linked to it.'],
    ['<b>Other name…</b>', 'A box opens. Type the name customers should see and press <b>Show</b>.'],
    ['<b>Show as "(an existing option)"</b>', 'Uses an Embroidery option that already exists in the Design Builder. Options already used by another embroidery are greyed out.'],
], [65 * mm, W - 2 * MARGIN - 65 * mm])
bullets([
    'An embroidery can only be shown once at least one of its pieces is approved.',
    '<b>Once any embroidery is shown</b>, the Embroidery step lists only the shown embroidery (plus <i>No Embroidery</i>), each with its picture from AI Studio. '
    'The older Embroidery options come back if you set every embroidery to Not shown.',
    'Customers see each embroidery only for the colours and necks it goes with (see step 1). After they pick it, the Sleeve, Length, Lower '
    'and Dupatta steps offer only the choices you ticked, so nothing clashes. If they go back and change the neck, an embroidery that no '
    'longer fits is cleared and they choose again.',
    'When a customer picks it, the AI preview stitches that exact embroidery onto their design.',
])

h2('Editing and deleting saved embroidery')
bullets([
    'Under <b>Saved embroidery</b>, hover over a card. A <b>pencil</b> (edit) and a <b>bin</b> (delete) appear. On a phone they are always shown.',
    'The pencil opens <b>Edit embroidery</b>: change the name, what it goes with and the details for the AI, then press <b>Save</b>. '
    'Changes take effect in Create Your Own Design straight away.',
    'Embroidery saved before sleeve, length and lower existed shows <i>details missing</i> on its card. Open the pencil, tick its sleeve and '
    'length or lower, and save; until then it shows with every sleeve and lower.',
    'Delete removes the embroidery and all its pieces. If it was shown in the designer it is taken off there too. This cannot be undone.',
    'Click a card to open it and continue checking its pieces. The <b>New embroidery</b> tile starts a fresh one.',
])

h2('What the AI costs')
table([
    ['Action', 'Cost'],
    ['Extract embroidery', 'One AI image'],
    ['Find &amp; name pieces, Add a missing piece', 'A tiny amount (text only)'],
    ['Preview placement', 'Free'],
    ['Generate try-on', 'One AI image per variation'],
    ['Customer AI previews in Create Your Own Design', 'One AI image each (repeat choices are reused, not charged again)'],
], [95 * mm, W - 2 * MARGIN - 95 * mm])
p('Your remaining AI balance is shown under <b>Design credits › Your AI credit (OpenAI)</b> (see section 5).')

# ---------------------------------------------------------------- 3
story.append(PageBreak())
h1('3. Getting the best AI results')
p('These habits give the AI the best chance of a close match. Each one helps on its own; together they make the biggest difference.')
h2('Photos')
bullets([
    'Plain background, daylight or soft light. No flash glare on zari.',
    'Garment flat or on a mannequin, straight on, nothing cropped.',
    'Close-ups sharp enough to see individual stitches.',
    'All photos of the same garment. One garment per photo.',
    'Use <b>Add close-up</b> for every detail that matters, and always write what each close-up shows.',
])
h2('Words')
bullets([
    'Always fill in <b>Details for the AI</b>: technique, true colours (say <i>silver</i> or <i>pastel pink</i> if it is not gold), border widths, where butis sit.',
    'In step 2, give every piece a correct position and side, a clear name and a one-line description.',
    'Correct the AI rather than deleting and redoing: corrections teach it for next time.',
])
h2('Plain garments for try-on')
bullets([
    'Same mannequin, background and framing as the embroidered photo.',
    'Truly plain: no print, border, lace or contrast piping.',
    'A mid-tone colour (pastel blue, rose, sage). Pure white or black hides the embroidery edges.',
    'Portrait shape (3:4), whole outfit in frame, both cuffs and the bottom hem visible.',
])
h2('Checking a result')
bullets([
    'Always press <b>Preview placement</b> first. If a piece is in the wrong place, fix its position or side in step 2 before generating.',
    'If one piece keeps coming out wrong, improve its description or replace it using <b>Add a missing piece</b>.',
    'If the whole extraction is poor, start a <b>New embroidery</b> with clearer, closer photos.',
])

h2('Common questions')
table([
    ['Question', 'Answer'],
    ['Is my embroidery saved?', 'Yes. Once the pieces are found it appears under Saved embroidery. The green badge on images means they are saved in Shopify Files.'],
    ['A piece is missing.', 'Open the embroidery and use <b>Add a missing piece</b> with a clean image of that piece on white.'],
    ['A piece is wrong or empty.', 'Change its position or side, or delete it with the bin icon.'],
    ['The plain garment photo: is it saved?', 'No, it is only used for that try-on. The try-on results are saved and can be downloaded.'],
    ['A customer can’t see an embroidery.', 'Check it is shown under Show in the designer, has approved pieces, and that the customer picked one of its colours (if you ticked any) and one of its necks.'],
    ['A sleeve or lower is missing in the designer.', 'The customer picked an embroidery that only goes with other sleeves or lowers. Tick more of them on that embroidery, or the customer picks another embroidery.'],
], [55 * mm, W - 2 * MARGIN - 55 * mm])

# ---------------------------------------------------------------- 4
story.append(PageBreak())
h1('4. Design Builder')
p('The Design Builder controls <b>Create Your Own Design</b> on the website: which garments customers can design, the steps they go through '
  '(Fabric, Neck, Sleeve, Embroidery, Length…), the options in each step, prices and pictures. It has four tabs.')
box('Saved to Shopify too', [
    'Names, prices, descriptions and visibility are saved to Shopify as well as the website. You will see '
    '<i>Saved. Name, price, description and visibility were also updated in Shopify.</i> after saving.',
])

h2('Tab 1: Garments')
p('Each card is a garment customers can design, for example Patiala Suit, Kurti, Anarkali Suit or Sharara Set. Click one to edit it below the cards.')
bullets([
    'Hover over a card (on a phone the buttons are always shown) for a <b>pencil</b> and a <b>bin</b>.',
    'The <b>pencil</b> opens that garment’s editor and scrolls to it.',
    'The <b>bin</b> deletes the garment after you confirm. It disappears from the Design Builder and the website. Saved designs and orders keep their copy.',
    '<b>New garment</b>, the last tile, adds one: type its name and starting price, then set it up below.',
])
box('Starting fresh with your own garments', [
    'The four garments there now (Patiala Suit, Kurti, Anarkali Suit, Sharara Set) were set up for testing. To replace them, delete each with the bin, '
    'then add your own with <b>New garment</b>: details, pictures, the steps in the builder and the measurements asked for. '
    'Steps and options under <b>Steps &amp; options</b> are shared by all garments and are not deleted with a garment.',
], tone='warn')
h3('Details')
bullets([
    '<b>Garment name</b>, <b>Description</b> and <b>Collection</b> (Indian, Western or Indo-western).',
    '<b>Starting price</b>: the base price. Options add to this.',
    '<b>Display order</b>: lower numbers show first.',
    '<b>Visible on the website</b>: hidden garments stay saved but customers can’t pick them.',
])
h3('Pictures')
bullets([
    '<b>Card</b>: the picture on the garment card.',
    '<b>Builder preview</b>: the photo shown while the customer designs. The AI preview edits this photo.',
    'Click a picture tile to upload, or drag a picture onto it.',
])
h3('Steps in the builder')
p('The steps a customer goes through for this garment, in order.')
bullets([
    '<b>Move up</b> / <b>Move down</b> to reorder, <b>Remove step</b> to take one away.',
    '<b>Options offered</b>: tick which options this garment offers. Nothing ticked means every active option of the step is offered, including ones added later.',
    '<b>Pre-selected option</b>: the choice already selected when the customer arrives.',
    '<b>Only show this step when</b>: for example show Cuff only when Sleeve is Full Sleeve.',
])
box('Step order and embroidery', [
    'Customers see the steps in exactly the order you set here, and embroidery matching works in any order. '
    'With Embroidery after Neck (the usual order: Fabric, Colour, Neck, Embroidery, Sleeve, Lower, Dupatta, Size), the neck the customer picked '
    'decides which embroidery is offered. With Embroidery before Neck, the embroidery they picked decides which necks are offered. '
    'Steps after the embroidery always offer only what it goes with.',
])
h3('Measurements asked for')
p('Tick which measurement fields this garment needs. The fields themselves are set up under <b>Measurement fields</b> (section 5).')

h2('Tab 2: Steps & options')
p('On the left is every step (Neck Type, Embroidery, Sleeve Type, Lower, Dupatta, Length, Size…) with its number of options. '
  'Click a step to edit it. <b>New step</b> adds one; then add it to a garment under Garments › Steps in the builder.')
bullets([
    '<b>Title shown to customers</b> and <b>Help text</b> for the step, then <b>Save step</b>.',
    'Each option shows its picture, price and buttons. Click the picture to upload or replace it.',
    'Options linked to AI Studio embroidery show the AI Studio picture and an <b>AI Studio</b> badge instead of an upload box.',
    '<b>Delete</b> removes an option from every garment (you are asked to confirm). Saved designs keep their copy.',
    '<b>Edit</b> opens: Name, Adds to price, Description, Display order, <b>Visible to customers</b>, and <b>Only offer with</b>.',
    '<b>Only offer with</b>: tick options from other steps this one goes with. Nothing ticked means it goes with everything. It works both ways: '
    'whichever of the two is picked first limits the other. For AI Studio embroidery, set this in AI Studio instead (its <i>what it goes with</i> choices); '
    'AI Studio keeps those ticks up to date.',
    '<b>Add an option</b> at the bottom of the list: name, price (and colour for colour steps), then <b>Add</b>.',
])

h2('Tab 3: Missing pictures')
p('Lists every garment and option that still has no picture, grouped by part, with jump buttons at the top.')
bullets([
    'Click any tile to upload its picture, or drag a picture onto it.',
    'Or drop many pictures at once on the drop zone: each file goes to the picture its name matches, for example '
    '<i>neck-round-neck.jpg</i> or <i>Round Neck.jpg</i>. Files that don’t match get a list to choose from.',
])

h2('Tab 4: Bulk import')
p('Add or update many garments and options at once from one Excel sheet.')
steps([
    'Download the sheet: <b>Blank template</b> to start fresh, or <b>Current catalogue</b> to correct what is on the site now. '
    'The sheet has a <i>How to fill</i> tab and help notes on every column.',
    'Fill it in and upload it. You first see a preview of every row: new, update, no change or error.',
    'Press <b>Import</b>. It is only enabled when no row has an error.',
])
bullets([
    'Nothing is ever deleted by an import. Uploading the same sheet twice changes nothing the second time.',
    'Pictures are not in the sheet. Add them afterwards under <b>Missing pictures</b>.',
])

# ---------------------------------------------------------------- 5
story.append(PageBreak())
h1('5. Other sections')

h2('Website content: Home page, Pre-made Designs page, Footer, Terms & Conditions')
p(f'These four menu items edit the words, pictures and links on the website ({link(SITE_URL)}). They all work the same way:')
steps([
    'Open the page from the menu. It is split into sections, each in its own box.',
    'Change the words, pictures or links you need. <b>Unsaved changes</b> appears at the top.',
    'Press <b>Save</b>. <b>Discard</b> throws away changes you have not saved yet.',
    'Open the website in another tab to check. Changes reach open browsers within a few seconds, but never while a customer is typing, checking out or designing.',
])
bullets([
    '<b>Pictures:</b> click a picture tile or drag a picture onto it. Picture lists can be added to, removed and reordered.',
    '<b>Write with AI</b> sits on text fields: write, improve, shorter, longer, fix spelling, or your own instruction. It only suggests: click <b>Use this</b>, then <b>Save</b>.',
    '<b>Reset to original</b> on a section puts back its original words and pictures. Nothing changes on the website until you press Save.',
    'Product names, prices and photos come from Shopify automatically, and fabric prices from the Design Builder, so they never go out of date. You only edit the words around them.',
])

h3('Home page sections, top to bottom')
p('Every section except the top banner has a <b>Show</b> switch: turn it off to hide that section from the home page without losing its content.')
table([
    ['Section', 'What you can change'],
    ['<b>Top banner</b>', 'The main photo, heading, text and buttons. The product card on the photo shows the product whose Shopify handle you enter; it hides itself if that product is removed.'],
    ['<b>Four promises under the banner</b>', 'Four short promises with their icons and text.'],
    ['<b>Shop by silhouette</b>', 'One card per garment type (Shopify product type). Its "From" price is worked out automatically. You can set your own picture for each.'],
    ['<b>Statement</b>', 'A short brand statement.'],
    ['<b>Designed online (laptop picture)</b>', 'Words, the <i>Try the designer</i> button, and the picture shown on the laptop screen (a 16:10 screenshot of the designer).'],
    ['<b>Ready to order (product tabs)</b>', 'The tabs of products. Each tab is a Shopify tag, for example <i>bestseller</i> or <i>editors-pick</i>. Tag products in Shopify to add them to a tab.'],
    ['<b>Collections</b>', 'Collection cards with pictures and links.'],
    ['<b>Fabric library</b>', 'Heading and text. The fabrics and prices come from the Design Builder’s Fabric step.'],
    ['<b>Behind the scenes</b>', 'Pictures and words about how the clothes are made.'],
    ['<b>Customer photos and reviews</b>', 'Off until real reviews exist. Turn it on once you have them.'],
    ['<b>Note from the founders</b>', 'The founders’ message and photo.'],
    ['<b>Newsletter sign-up</b>', 'The heading and text of the sign-up form. Sign-ups appear under <b>Newsletter</b> in the menu.'],
], [55 * mm, W - 2 * MARGIN - 55 * mm])

h3('Pre-made Designs page')
p('The banner, words and pictures at the top of the pre-made designs listing, the silhouette tiles, and the <b>Design-your-own block</b> '
  'that invites customers to Create Your Own Design. The products themselves come from Shopify.')

h3('Footer')
bullets([
    'The logo line, the link columns (for example Shop, Company and Contact) and the bottom bar.',
    '<b>Social media links</b>: paste the brand’s Instagram, Facebook and other page addresses. The right icon is picked from the address; empty ones are hidden.',
    '<b>Copyright line</b> and <b>Credit line</b> at the very bottom.',
])

h3('Terms & Conditions')
p('A word-processor style editor: headings, bold, lists and links, with undo. No code needed. Use <b>Write with AI</b> to tidy wording, '
  'but always read legal text yourself before saving.')

h2('Measurement fields')
p('The fields customers fill in when they save their measurements for a made-to-measure garment.')
bullets([
    'Each row is one field: <b>Name</b> (for example <i>Bust</i>, <i>Waist</i>, <i>Hip</i>), <b>Unit</b> (inches or cm), <b>Default</b> value, '
    '<b>Help text</b> that tells the customer how to measure, <b>Order</b> (lower shows first) and <b>Shown</b>. Press <b>Save</b> on the row after changing it.',
    '<b>Add field</b> at the bottom: type a name, for example <i>Hip</i>, then fill in its row.',
    'The bin deletes a field after you confirm. Measurements customers already saved keep their values.',
    '<b>“How to measure” video</b> at the top: paste a YouTube link and press <b>Save</b>. Customers see it beside the fields.',
    'Which fields a garment asks for is ticked per garment in <b>Design Builder › Garments › Measurements asked for</b>.',
])

h2('Newsletter')
bullets([
    'Everyone who signed up on the website. Search by email.',
    '<b>Export CSV</b> downloads a CSV for Shopify Email or Mailchimp. Nothing is emailed from the website itself.',
    'Remove someone with the bin icon.',
])

h2('Design credits')
bullets([
    '<b>Show design credits on the website</b>: on means customers see their credits and each new AI design uses one; off means AI designs are free. Balances are kept either way.',
    '<b>Find a customer</b> to add the credits they paid for. Corrections take a negative amount.',
    '<b>Your AI credit (OpenAI)</b>: open OpenAI billing, copy the dollar amount at the top of that page, and paste it here. '
    'The panel then shows roughly how many AI designs it can still make.',
])

h2('Team (owners only)')
steps([
    'Open <b>Team</b> from the menu.',
    'Under <b>Add a team member</b>, type their <b>Name</b>, <b>Email</b> and a <b>Password</b> (at least 8 characters), then press <b>Add member</b>.',
    'Share the email and password with them privately. They sign in at the normal admin login.',
])
bullets([
    '<b>Can sign in</b> switch: turn someone off without deleting them.',
    '<b>New password</b>: set a new password for them. They are signed out and must use the new one.',
    '<b>Remove</b>: deletes their login after you confirm. Owners can also remove another <b>owner</b> account, for example an old test login. '
    'You can never remove your own account, and the last owner always stays, so someone can always sign in.',
    'Switching off, removing or changing a password signs the person out on every device within seconds.',
])

# ---------------------------------------------------------------- 6
story.append(PageBreak())
h1('6. Quick reference')
table([
    ['I want to…', 'Go to'],
    ['Create a new AI embroidery', 'AI Studio › New embroidery'],
    ['Add more detail photos', 'AI Studio › step 1 › Add close-up'],
    ['Say what an embroidery goes with (neck, sleeve, length, lower, colour, dupatta)', 'AI Studio › step 1, or the pencil on its Saved embroidery card'],
    ['Extract embroidery on a salwar or pajama', 'AI Studio › step 1 › Lower (salwar / pajama) photo'],
    ['Correct a piece’s position or name', 'AI Studio › open the embroidery › step 2'],
    ['Test embroidery on a plain garment', 'AI Studio › step 3 › Preview placement, then Generate try-on'],
    ['Let customers pick an embroidery', 'AI Studio › Show in the designer'],
    ['Edit or delete a saved embroidery', 'AI Studio › Saved embroidery › hover the card'],
    ['Change a garment’s price or photo', 'Design Builder › Garments › pencil on the card'],
    ['Delete a garment', 'Design Builder › Garments › bin on the card'],
    ['Change the order of steps for a garment', 'Design Builder › Garments › Steps in the builder'],
    ['Add, price or delete an option', 'Design Builder › Steps &amp; options'],
    ['Upload missing pictures', 'Design Builder › Missing pictures'],
    ['Update many options at once', 'Design Builder › Bulk import'],
    ['Change home page words or pictures', 'Home page'],
    ['Export newsletter emails', 'Newsletter › Export CSV'],
    ['Give a customer credits', 'Design credits › Find a customer'],
    ['Check the AI balance', 'Design credits › Your AI credit (OpenAI)'],
    ['Add a colleague', 'Team › Add a team member'],
    ['Remove an old login', 'Team › Remove on that row'],
    ['Change measurement fields', 'Measurement fields'],
], [80 * mm, W - 2 * MARGIN - 80 * mm])

# ---------------------------------------------------------------- build
doc = BaseDocTemplate(
    OUT, pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN, topMargin=20 * mm, bottomMargin=18 * mm,
    title='Baliye Couture Admin Panel Guide', author='Baliye Couture', subject='How to use the admin panel',
)
frame = Frame(MARGIN, 18 * mm, W - 2 * MARGIN, H - 38 * mm, id='f')
doc.addPageTemplates([
    PageTemplate(id='cover', frames=[frame], onPage=cover),
    PageTemplate(id='body', frames=[frame], onPage=page),
])
doc.build(story)
print('written', OUT)
