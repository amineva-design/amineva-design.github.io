# Обложка для ссылок (og:image) 1200×630: тёмный фон, «дождь» из символов,
# ASCII-портрет с главной, имя и роль. Запуск: python3 scripts/og-cover.py
from PIL import Image, ImageDraw, ImageFont
import random, bisect

random.seed(7)
W, H, SC = 1200, 630, 2  # рисуем в 2x и уменьшаем — так символы чётче
BG, INK, ACC = (20, 20, 18), (242, 242, 243), (63, 181, 106)
img = Image.new('RGB', (W * SC, H * SC), BG)
d = ImageDraw.Draw(img, 'RGBA')

# ASCII-портрет справа — та же логика, что на сайте (выравнивание яркости по фигуре)
RAMP = ' .`:-=+*cuoeaxkdbhq0OZ8%$&#@'
src = Image.open('src/assets/site/portrait-ascii.png').convert('RGBA')
cw, ch = 6, 9.3
areaW, areaH = 600, 600
cols, rows = int(areaW / cw), int(areaH / ch)
k = min(cols / src.width, rows * (ch / cw) / src.height)
dw, dh = int(src.width * k), int(src.height * k / (ch / cw))
px = src.resize((dw, dh), Image.LANCZOS).load()
lum, fg = [], []
for y in range(dh):
    row = []
    for x in range(dw):
        r, g, b, a = px[x, y]
        if a > 110:
            l = (0.299 * r + 0.587 * g + 0.114 * b) / 255
            row.append(l); fg.append(l)
        else:
            row.append(-1)
    lum.append(row)
fg.sort()
ox, oy = W - areaW - 36 + (cols - dw) * cw, H - dh * ch
f = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', 9 * SC)
for y in range(dh):
    for x in range(dw):
        l = lum[y][x]
        if l < 0:
            continue
        v = 0.08 + 0.92 * (bisect.bisect_left(fg, l) / len(fg)) ** 1.15
        c = RAMP[round(v * (len(RAMP) - 1))]
        if c != ' ':
            d.text(((ox + x * cw) * SC, (oy + y * ch) * SC), c, font=f, fill=ACC + (int(255 * (0.12 + 0.88 * v * v)),))

# «дождь»: редкие вертикальные столбцы, затухающие кверху; обходит имя и фигуру
TEXT_BOX = (56, 120, 600, 470)
def blocked(x, y):
    if TEXT_BOX[0] <= x <= TEXT_BOX[2] and TEXT_BOX[1] <= y <= TEXT_BOX[3]:
        return True
    gx, gy = int((x - ox) / cw), int((y - oy) / ch)
    for dy in (-1, 0, 1):
        for dx in (-3, -2, -1, 0, 1, 2, 3):
            yy, xx = gy + dy, gx + dx
            if 0 <= yy < dh and 0 <= xx < dw and lum[yy][xx] >= 0:
                return True
    return False

kana = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン0123456789'
kf = ImageFont.truetype('/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc', 13 * SC)
for col in random.sample(range(10, W, 24), 16):
    top, length = random.randint(-200, H - 150), random.randint(8, 20)
    for i in range(length):
        y = top + i * 18
        if 0 <= y <= H and not blocked(col, y):
            d.text((col * SC, y * SC), random.choice(kana), font=kf, fill=ACC + (int(14 + 60 * i / length),))

# имя и роль
bold = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
name, role = ImageFont.truetype(bold, 104 * SC), ImageFont.truetype(bold, 26 * SC)
L = 72
d.text((L * SC, 150 * SC), 'Регина', font=name, fill=INK)
d.text((L * SC, 255 * SC), 'Аминева', font=name, fill=INK)
d.text((L * SC, 392 * SC), 'ПРОДУКТОВЫЙ', font=role, fill=INK)
d.text((L * SC, 426 * SC), 'UX/UI ДИЗАЙНЕР', font=role, fill=INK)

img.resize((W, H), Image.LANCZOS).save('src/assets/site/og-cover.png', optimize=True)
print('src/assets/site/og-cover.png')
