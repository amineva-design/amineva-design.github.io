# Статичные картинки «портрета из символов» — лежат под анимацией на canvas.
# Видны, пока анимация не запустилась, и в записях Вебвизора (он не записывает canvas).
# Запуск: python3 scripts/ascii-fallback.py
from PIL import Image, ImageDraw, ImageFont
import bisect

RAMP = ' .`:-=+*cuoeaxkdbhq0OZ8%$&#@'
ACC = (63, 181, 106)
CW, CH = 7, 7 * 1.55  # клетка как на сайте (ширина 7px, высота ×1.55)
SC = 2  # рисуем в 2x для чёткости

def render(src_path, out_path, cols):
    src = Image.open(src_path).convert('RGBA')
    sw, sh = src.size
    rows = round(cols * CW * sh / sw / CH)
    W, H = round(cols * CW), round(rows * CH)
    small = src.resize((cols, rows), Image.LANCZOS)
    px = small.load()
    lum, fg = {}, []
    for y in range(rows):
        for x in range(cols):
            r, g, b, a = px[x, y]
            if a > 110:
                l = (0.299 * r + 0.587 * g + 0.114 * b) / 255
                lum[x, y] = l
                fg.append(l)
    fg.sort()
    img = Image.new('RGBA', (W * SC, H * SC), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    font = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', round(CH * 0.92 * SC))
    for (x, y), l in lum.items():
        v = 0.08 + 0.92 * (bisect.bisect_left(fg, l) / len(fg)) ** 1.15
        c = RAMP[round(v * (len(RAMP) - 1))]
        if c != ' ':
            d.text((x * CW * SC, y * CH * SC), c, font=font, fill=ACC + (round(255 * (0.12 + 0.88 * v * v)),))
    img.save(out_path, optimize=True)
    print(out_path, img.size)

render('src/assets/site/portrait-ascii.png', 'src/assets/site/portrait-ascii-fallback.png', 130)
render('src/assets/site/hand-left.png', 'src/assets/site/hand-left-fallback.png', 110)
render('src/assets/site/hand-right.png', 'src/assets/site/hand-right-fallback.png', 110)
