"""Builds ProGrain packaging artwork (flat SVG panels, mm units) and the presentation board.
Run:  python3 packaging/build.py     (from the project root)
Edit the TEXT / COLOUR constants below, re-run, and refresh packaging/index.html."""
import os
FONT_IMPORT = "<style>@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300..800&amp;family=Hanken+Grotesk:wght@400;500;600;700&amp;display=swap');</style>"
SAGE, SAGE_L, SAGE_D = '#8A9576', '#97A283', '#5E6B52'
CREAM, AMBER, GOLD, CRUST, INK = '#F4ECD8', '#F5A94A', '#FFC978', '#744A16', '#1B120A'
D = "font-family=\"'Bricolage Grotesque', 'Hanken Grotesk', sans-serif\""   # display
B = "font-family=\"'Hanken Grotesk', sans-serif\""                          # body
IMG = '../assets/'

def defs(uid):
    return f'''<defs>
<linearGradient id="sage{uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{SAGE_L}"/><stop offset="1" stop-color="{SAGE}"/></linearGradient>
<linearGradient id="cream{uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8F1E0"/><stop offset="1" stop-color="{CREAM}"/></linearGradient>
</defs>'''

def veg(x, y, s=5):
    """FSSAI vegetarian mark: green dot in a green square (size s mm)."""
    return f'<g transform="translate({x} {y})"><rect width="{s}" height="{s}" fill="#fff" stroke="#0A7A32" stroke-width="{s*0.09}"/><circle cx="{s/2}" cy="{s/2}" r="{s*0.27}" fill="#0A7A32"/></g>'

def guides(W, H, top, bot, side):
    return f'''<g id="guides" display="none" fill="none" stroke="#E5007E" stroke-width=".25" stroke-dasharray="1.2 1">
<rect x="0.1" y="0.1" width="{W-.2}" height="{H-.2}"/><rect x="{side}" y="{top}" width="{W-2*side}" height="{H-top-bot}"/></g>'''

def svg(W, H, body, title):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {W} {H}" width="{W}mm" height="{H}mm" role="img" aria-label="{title}">
<title>{title}</title>{FONT_IMPORT}
{body}
</svg>'''

# ---------------------------------------------------------------- 30 g sachet (90 x 130 mm, 3-side seal)
def sachet_front():
    W, H = 90, 130
    return svg(W, H, defs('s') + f'''
<rect width="{W}" height="{H}" fill="url(#sages)"/>
<circle cx="45" cy="51" r="31" fill="{CREAM}" opacity=".11"/>
<image href="{IMG}logo.png" x="16" y="12" width="58" height="12.7"/>
<text x="45" y="31.6" text-anchor="middle" {D} font-weight="600" font-size="3.7" letter-spacing=".5" fill="{CREAM}">PROTEIN ROTI MIX</text>
<image href="{IMG}wheat-soy.webp" x="15" y="34" width="60" height="32.3" preserveAspectRatio="xMidYMid meet"/>
<text x="45" y="76.4" text-anchor="middle" {D} font-size="8.6" fill="#fff"><tspan font-weight="800">24g</tspan><tspan font-weight="400" dx="1.2">Protein</tspan></text>
<path d="M0 81 Q45 75 90 81 V{H} H0Z" fill="url(#creams)"/>
<text x="45" y="93.2" text-anchor="middle" {D} font-size="8.6" fill="{SAGE_D}"><tspan font-weight="800">3x</tspan><tspan font-weight="400" dx="1.2">Protein</tspan></text>
<path d="M32 97.6h26" stroke="{AMBER}" stroke-width=".7" stroke-linecap="round"/>
<text x="45" y="103.4" text-anchor="middle" {B} font-weight="600" font-size="3.1" fill="{INK}">Just wheat &amp; soy. No whey, no sugar,</text>
<text x="45" y="107.4" text-anchor="middle" {B} font-weight="600" font-size="3.1" fill="{INK}">no preservative.</text>
<text x="45" y="113.2" text-anchor="middle" {D} font-weight="700" font-size="3.4" fill="{CRUST}">Add to your atta. Knead. That's it.</text>
{veg(9, 115.4, 4.4)}
<text x="81" y="118.8" text-anchor="end" {B} font-weight="600" font-size="3" fill="{INK}">Net wt. 30 g</text>
''' + guides(W, H, 7, 7, 5), 'ProGrain Protein Roti Mix 30 g sachet, front')

def back_text(x, y, lines, size, fill=INK, weight=500, lh=None, anchor='start', font=None):
    lh = lh or size * 1.35
    f = font or B
    return ''.join(f'<text x="{x}" y="{y + i*lh:.2f}" text-anchor="{anchor}" {f} font-weight="{weight}" font-size="{size}" fill="{fill}">{t}</text>' for i, t in enumerate(lines))

def nutrition(x, y, w, size, rowh, cols, rows):
    """Placeholder nutrition table. cols = header labels; rows = names (values left as dashes)."""
    out = [f'<rect x="{x}" y="{y}" width="{w}" height="{rowh*(len(rows)+2)}" fill="none" stroke="{INK}" stroke-width=".3"/>']
    out.append(f'<text x="{x+1.5}" y="{y+rowh*0.72:.2f}" {D} font-weight="700" font-size="{size*1.1}" fill="{INK}">Nutrition information (approx.)</text>')
    cx = [x + w*0.56, x + w*0.80]
    for i, c in enumerate(cols):
        out.append(f'<text x="{cx[i]+ (w*0.1)}" y="{y+rowh*1.72:.2f}" text-anchor="middle" {B} font-weight="700" font-size="{size*0.92}" fill="{INK}">{c}</text>')
    out.append(f'<path d="M{x} {y+rowh} H{x+w}" stroke="{INK}" stroke-width=".25"/>')
    for r, name in enumerate(rows):
        yy = y + rowh*(r+2)
        out.append(f'<path d="M{x} {yy} H{x+w}" stroke="{INK}" stroke-opacity=".35" stroke-width=".2"/>')
        out.append(f'<text x="{x+1.5}" y="{yy+rowh*0.72:.2f}" {B} font-weight="500" font-size="{size}" fill="{INK}">{name}</text>')
        for i in range(2):
            out.append(f'<text x="{cx[i]+w*0.1}" y="{yy+rowh*0.72:.2f}" text-anchor="middle" {B} font-size="{size}" fill="#8B7B63">__</text>')
    return ''.join(out)

def barcode_box(x, y, w, h, label='Barcode (EAN-13) placeholder'):
    bars = ''.join(f'<rect x="{x+3+i*(w-6)/40:.2f}" y="{y+2}" width="{((w-6)/40)*(0.35 if i%3 else 0.7):.2f}" height="{h-7}" fill="{INK}" opacity=".18"/>' for i in range(40))
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#fff" stroke="{INK}" stroke-width=".2"/>{bars}<text x="{x+w/2}" y="{y+h-1.2}" text-anchor="middle" {B} font-size="1.9" fill="#6B5B45">{label}</text>'

def sachet_back():
    W, H = 90, 130
    return svg(W, H, defs('b') + f'''
<rect width="{W}" height="{H}" fill="url(#creamb)"/>
<rect width="{W}" height="22" fill="url(#sageb)"/>
<image href="{IMG}logo.png" x="26" y="7" width="38" height="8.33"/>
<text x="45" y="19.2" text-anchor="middle" {D} font-weight="600" font-size="2.9" letter-spacing=".4" fill="{CREAM}">PROTEIN ROTI MIX</text>
<text x="8" y="31" {D} font-weight="800" font-size="5" fill="{SAGE_D}">How to use</text>
''' +
''.join(f'<circle cx="{10.2+i*26}" cy="38.6" r="2.7" fill="{AMBER}"/><text x="{10.2+i*26}" y="39.8" text-anchor="middle" {D} font-weight="800" font-size="3.4" fill="{INK}">{i+1}</text>'
        + back_text(14.2+i*26, 38.2, t, 2.9, INK, 600, 3.4) for i, t in enumerate([['Tear the','sachet.'], ['Add it to','your atta.'], ['Knead & roll','as usual.']])) +
nutrition(8, 47, 74, 2.5, 4.1, ['Per 100 g', 'Per 30 g'], ['Energy (kcal)', 'Protein (g)', 'Carbohydrate (g)', '  of which sugars (g)', 'Fat (g)', 'Dietary fibre (g)', 'Sodium (mg)']) +
back_text(8, 92.4, ['Values to be filled after NABL lab testing.'], 2.1, '#6B5B45', 500) +
back_text(8, 97.6, ['<tspan font-weight="700">Ingredients:</tspan> Wheat protein, soy protein [declare in', 'descending order of quantity, with %].'], 2.5, INK, 500, 3.1) +
back_text(8, 105.2, ['<tspan font-weight="700">Allergen advice:</tspan> Contains wheat (gluten) and soy.'], 2.5, INK, 500) +
back_text(8, 109.2, ['Store in a cool, dry place. Use the sachet in one go.'], 2.3, INK, 500) +
back_text(8, 112.9, ['Mfd. &amp; marketed by: [Name, address]'], 2.1, INK, 500) +
back_text(8, 115.9, ['FSSAI Lic. No. [14 digits]'], 2.1, INK, 500) +
veg(8, 117.2, 4) +
back_text(13.6, 120.2, ['MRP &#8377; [__] (incl. all taxes)'], 2.4, INK, 700) +
barcode_box(58, 112.4, 24, 10) +
guides(W, H, 7, 7, 5), 'ProGrain Protein Roti Mix 30 g sachet, back')

# ---------------------------------------------------------------- 500 g stand-up pouch (160 x 250 mm front panel)
def bag_front():
    W, H = 160, 250
    chips = [('Just wheat', '&amp; soy'), ('All 9 essential', 'amino acids'), ('No whey, no sugar,', 'no preservative')]
    chip_svg = ''
    cw, gap = 44, 4.5
    x0 = (W - (3*cw + 2*gap)) / 2
    for i, (a, b) in enumerate(chips):
        cx = x0 + i*(cw+gap)
        chip_svg += f'<rect x="{cx}" y="190" width="{cw}" height="17" rx="8.5" fill="#fff" stroke="{SAGE}" stroke-width=".5"/>' \
                    f'<text x="{cx+cw/2}" y="196.6" text-anchor="middle" {D} font-weight="700" font-size="3.9" fill="{SAGE_D}">{a}</text>' \
                    f'<text x="{cx+cw/2}" y="201.6" text-anchor="middle" {D} font-weight="700" font-size="3.9" fill="{SAGE_D}">{b}</text>'
    return svg(W, H, defs('f') + f'''
<rect width="{W}" height="{H}" fill="url(#sagef)"/>
<circle cx="80" cy="124" r="66" fill="{CREAM}" opacity=".10"/>
<image href="{IMG}logo.png" x="30" y="40" width="100" height="21.9"/>
<text x="80" y="76" text-anchor="middle" {D} font-weight="600" font-size="6.6" letter-spacing=".9" fill="{CREAM}">PROTEIN ROTI MIX</text>
<text x="80" y="104" text-anchor="middle" {D} font-weight="800" font-size="16.5" letter-spacing="-.4" fill="#fff">Same roti.</text>
<text x="80" y="122" text-anchor="middle" {D} font-weight="800" font-size="16.5" letter-spacing="-.4" fill="{GOLD}">3x protein.</text>
<path d="M0 172 Q80 160 160 172 V{H} H0Z" fill="url(#creamf)"/>
<image href="{IMG}wheat-soy.webp" x="26" y="127" width="108" height="58.1" preserveAspectRatio="xMidYMid meet"/>
<g transform="translate(126 152)"><circle r="15.5" fill="{AMBER}"/><circle r="14" fill="none" stroke="{INK}" stroke-opacity=".35" stroke-width=".4" stroke-dasharray="1 1"/>
<text y="1.6" text-anchor="middle" {D} font-weight="800" font-size="8.4" fill="{INK}">500 g</text><text y="6.4" text-anchor="middle" {B} font-weight="700" font-size="2.7" letter-spacing=".3" fill="{INK}">NET WT.</text></g>
{chip_svg}
<text x="80" y="219" text-anchor="middle" {D} font-weight="700" font-size="5.2" fill="{CRUST}">Add to your atta before kneading. That's it.</text>
{veg(18, 224.5, 6)}
<text x="142" y="229.4" text-anchor="end" {B} font-weight="600" font-size="3.6" fill="{INK}">Resealable pouch</text>
''' + guides(W, H, 14, 14, 8), 'ProGrain Protein Roti Mix 500 g pouch, front')

def bag_back():
    W, H = 160, 250
    steps = [['Tear the sachet','or take 1 scoop.'], ['Add it to your','atta in the bowl.'], ['Knead, roll and','cook as usual.']]
    return svg(W, H, defs('g') + f'''
<rect width="{W}" height="{H}" fill="url(#creamg)"/>
<rect width="{W}" height="46" fill="url(#sageg)"/>
<image href="{IMG}logo.png" x="46" y="17" width="68" height="14.9"/>
<text x="80" y="38.6" text-anchor="middle" {D} font-weight="600" font-size="4.4" letter-spacing=".6" fill="{CREAM}">PROTEIN ROTI MIX</text>
<text x="14" y="62" {D} font-weight="800" font-size="9" fill="{SAGE_D}">How to use</text>
''' +
''.join(f'<circle cx="{19+i*45}" cy="75" r="4.6" fill="{AMBER}"/><text x="{19+i*45}" y="77.2" text-anchor="middle" {D} font-weight="800" font-size="6" fill="{INK}">{i+1}</text>'
        + back_text(26.5+i*45, 74.4, t, 3.9, INK, 600, 4.7) for i, t in enumerate(steps)) +
back_text(14, 90, ['Dose: [__ g] of mix for every [__ g] of atta. (To be confirmed with the final recipe.)'], 3.3, '#6B5B45', 500) +
nutrition(14, 98, 132, 3.6, 6.2, ['Per 100 g', 'Per serving'], ['Energy (kcal)', 'Protein (g)', 'Carbohydrate (g)', '  of which total sugars (g)', 'Total fat (g)', 'Dietary fibre (g)', 'Sodium (mg)']) +
back_text(14, 160.4, ['Values to be filled after NABL lab testing.'], 3, '#6B5B45', 500) +
back_text(14, 170, ['<tspan font-weight="700">Ingredients:</tspan> Wheat protein, soy protein [declare in descending order of quantity,', 'with percentages].'], 3.5, INK, 500, 4.5) +
back_text(14, 181.4, ['<tspan font-weight="700">Allergen advice:</tspan> Contains wheat (gluten) and soy.'], 3.5, INK, 500) +
back_text(14, 188, ['<tspan font-weight="700">Storage:</tspan> Store in a cool, dry place. Close the zip after each use.'], 3.5, INK, 500) +
back_text(14, 194.6, ['<tspan font-weight="700">Best before:</tspan> [__] months from date of packing.'], 3.5, INK, 500) +
back_text(14, 201.2, ['Mfd. &amp; marketed by: [Name and full address of manufacturer / marketer]'], 3.2, INK, 500) +
back_text(14, 207, ['FSSAI Lic. No. [14 digits]  &#183;  Customer care: [phone / email]  &#183;  prograin.in'], 3.2, INK, 500) +
veg(14, 213.4, 6.4) +
back_text(23, 218.2, ['MRP &#8377; [__] (incl. all taxes)'], 4.2, INK, 700) +
back_text(23, 222.8, ['Batch no. / Mfg date: printed on pack'], 3, '#6B5B45', 500) +
f'<rect x="95" y="212" width="12" height="12" fill="#fff" stroke="{INK}" stroke-width=".25"/><text x="101" y="219" text-anchor="middle" {B} font-size="2.2" fill="#6B5B45">QR</text><text x="101" y="227" text-anchor="middle" {B} font-size="2.2" fill="#6B5B45">Recipes</text>' +
barcode_box(112, 208, 34, 20) +
guides(W, H, 14, 14, 8), 'ProGrain Protein Roti Mix 500 g pouch, back')

# ---------------------------------------------------------------- mockups
def mock_defs(uid):
    return f'''<defs>
<linearGradient id="edge{uid}" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".34"/><stop offset=".10" stop-color="#000" stop-opacity=".06"/><stop offset=".3" stop-color="#fff" stop-opacity=".12"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset=".86" stop-color="#000" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>
<radialGradient id="pillow{uid}" cx=".4" cy=".42" r=".72"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></radialGradient>
<linearGradient id="sheen{uid}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<pattern id="crimp{uid}" width="1.5" height="2" patternUnits="userSpaceOnUse"><rect width=".75" height="2" fill="#000" opacity=".13"/><rect x=".75" width=".4" height="2" fill="#fff" opacity=".18"/></pattern>
<pattern id="crimpH{uid}" width="2" height="1.5" patternUnits="userSpaceOnUse"><rect width="2" height=".75" fill="#000" opacity=".1"/><rect y=".75" width="2" height=".4" fill="#fff" opacity=".16"/></pattern>
<filter id="blur{uid}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="blurS{uid}"><feGaussianBlur stdDeviation=".7"/></filter>
<filter id="grain{uid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 .3  0 0 0 0 .25  0 0 0 0 .15  0 0 0 .5 -.12"/></filter>
</defs>'''

def mockup(art_svg, W, H, outline, seals, uid, pad=14, title=''):
    """Wrap flat artwork in a shaded pouch shape. outline = path d (in W x H mm). seals = dict(top, bottom, side)."""
    inner = art_svg.split('\n', 1)[1].rsplit('</svg>', 1)[0]  # drop outer <svg> tag
    inner = inner.replace('<title>', '<title>').replace('id="guides" display="none"', 'id="guides" display="none"')
    top, bot, side = seals['top'], seals['bottom'], seals['side']
    extra = seals.get('extra', '')
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-pad} {-pad} {W+2*pad} {H+2*pad+8}" role="img" aria-label="{title}">
{mock_defs(uid)}
<ellipse cx="{W/2+4}" cy="{H+3}" rx="{W*0.54}" ry="{W*0.055}" fill="#000" opacity=".3" filter="url(#blur{uid})"/>
<clipPath id="clip{uid}"><path d="{outline}"/></clipPath>
<g clip-path="url(#clip{uid})">
{inner}
<rect width="{W}" height="{H}" fill="url(#pillow{uid})"/>
<rect width="{W}" height="{H}" fill="url(#edge{uid})"/>
<rect width="{W}" height="{top}" fill="url(#crimpH{uid})"/><rect y="{H-bot}" width="{W}" height="{bot}" fill="url(#crimpH{uid})"/>
<rect width="{side}" height="{H}" fill="url(#crimp{uid})" opacity=".55"/><rect x="{W-side}" width="{side}" height="{H}" fill="url(#crimp{uid})" opacity=".55"/>
<rect y="{top}" width="{W}" height="1.6" fill="#000" opacity=".16" filter="url(#blurS{uid})"/><rect y="{H-bot-1.6}" width="{W}" height="1.6" fill="#000" opacity=".16" filter="url(#blurS{uid})"/>
{extra}
<g fill="none" stroke-linecap="round" filter="url(#blurS{uid})">
<path d="M{W*.06} {H*.3} q{W*.08} {H*.04} {W*.1} {H*.1}" stroke="#000" stroke-opacity=".05" stroke-width="1.4"/>
<path d="M{W*.94} {H*.34} q-{W*.08} {H*.04} -{W*.1} {H*.1}" stroke="#000" stroke-opacity=".05" stroke-width="1.4"/>
<path d="M{W*.07} {H*.7} q{W*.09} -{H*.03} {W*.12} -{H*.09}" stroke="#000" stroke-opacity=".05" stroke-width="1.4"/>
<path d="M{W*.93} {H*.72} q-{W*.09} -{H*.03} -{W*.12} -{H*.09}" stroke="#000" stroke-opacity=".05" stroke-width="1.4"/>
<path d="M{W*.14} {H*.34} q{W*.05} {H*.03} {W*.07} {H*.08}" stroke="#fff" stroke-opacity=".12" stroke-width=".8"/>
</g>
<path d="M{W*.26} {top+4} c-{W*.06} {H*.3} -{W*.06} {H*.5} 0 {H-top-bot-8}" stroke="url(#sheen{uid})" stroke-width="{W*.16}" fill="none" opacity=".42" filter="url(#blur{uid})"/>
<rect width="{W}" height="{H}" filter="url(#grain{uid})" opacity=".4"/>
</g>
<path d="{outline}" fill="none" stroke="#000" stroke-opacity=".28" stroke-width=".5"/>
</svg>'''

def sachet_outline(W=90, H=130):
    return f'M3 0 H{W-3} Q{W} 0 {W} 3 V{H-3} Q{W} {H} {W-3} {H} H3 Q0 {H} 0 {H-3} V3 Q0 0 3 0 Z'
def bag_outline(W=160, H=250):
    return f'M0 0 H{W} V{H-18} Q{W} {H} {W-18} {H} H18 Q0 {H} 0 {H-18} Z'

def main():
    here = os.path.dirname(os.path.abspath(__file__))
    art = {'sachet-30g-front': sachet_front(), 'sachet-30g-back': sachet_back(), 'bag-500g-front': bag_front(), 'bag-500g-back': bag_back()}
    for k, v in art.items():
        open(os.path.join(here, k + '.svg'), 'w').write(v)
    zip_extra = '<g><rect y="36" width="160" height="6" fill="#fff" opacity=".1"/><path d="M0 36H160M0 42H160" stroke="#000" stroke-opacity=".28" stroke-width=".5"/><path d="M0 36.6H160" stroke="#fff" stroke-opacity=".5" stroke-width=".4"/><path d="M0 232 Q80 222 160 232" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="1.2" filter="url(#blurS%s)"/></g>'
    m = {
      'm-sachet-front': mockup(art['sachet-30g-front'], 90, 130, sachet_outline(), dict(top=7, bottom=7, side=5, extra='<path d="M0 12 l3.4 1.6 -3.4 1.6z" fill="#000" opacity=".3"/>'), 'a', title='30 g sachet mockup, front'),
      'm-sachet-back': mockup(art['sachet-30g-back'], 90, 130, sachet_outline(), dict(top=7, bottom=7, side=5), 'b', title='30 g sachet mockup, back'),
      'm-bag-front': mockup(art['bag-500g-front'], 160, 250, bag_outline(), dict(top=14, bottom=14, side=0, extra=zip_extra % 'c'), 'c', title='500 g pouch mockup, front'),
      'm-bag-back': mockup(art['bag-500g-back'], 160, 250, bag_outline(), dict(top=14, bottom=14, side=0, extra=zip_extra % 'd'), 'd', title='500 g pouch mockup, back'),
    }
    for k, v in m.items():
        open(os.path.join(here, k + '.svg'), 'w').write(v)
    tpl = open(os.path.join(here, 'board.template.html')).read()
    for k, v in {**art, **m}.items():
        tpl = tpl.replace('{{' + k + '}}', v.split('\n', 1)[1] if False else v)
    open(os.path.join(here, 'index.html'), 'w').write(tpl)
    print('built', list(art) + list(m))

if __name__ == '__main__':
    main()
