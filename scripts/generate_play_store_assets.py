from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path('play-store/assets')
root.mkdir(parents=True, exist_ok=True)
logo_path = Path('assets/images/logo.jpeg')
logo = Image.open(logo_path).convert('RGBA')

font_paths = [
    r'C:\Windows\Fonts\SegoeUI.ttf',
    r'C:\Windows\Fonts\Arial.ttf',
    r'C:\Windows\Fonts\Verdana.ttf',
]
font_path = next((p for p in font_paths if Path(p).exists()), None)

if font_path:
    font_h = ImageFont.truetype(font_path, 72)
    font_s = ImageFont.truetype(font_path, 36)
    font_b = ImageFont.truetype(font_path, 24)
    font_sub = ImageFont.truetype(font_path, 34)
    font_small = ImageFont.truetype(font_path, 28)
else:
    font_h = ImageFont.load_default()
    font_s = ImageFont.load_default()
    font_b = ImageFont.load_default()
    font_sub = ImageFont.load_default()
    font_small = ImageFont.load_default()

# App icon
icon_size = (512, 512)
icon = Image.new('RGBA', icon_size, '#0A4B8C')
mask = Image.new('L', icon_size, 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.ellipse((32, 32, 480, 480), fill=255)
logo_thumb = logo.copy()
logo_thumb.thumbnail((320, 320), Image.LANCZOS)
logo_x = (icon_size[0] - logo_thumb.width) // 2
logo_y = (icon_size[1] - logo_thumb.height) // 2
icon.paste(logo_thumb, (logo_x, logo_y), logo_thumb)
accent = Image.new('RGBA', icon_size, (255, 255, 255, 0))
acc_draw = ImageDraw.Draw(accent)
acc_draw.ellipse((350, 30, 490, 170), fill=(255, 255, 255, 90))
icon = Image.alpha_composite(icon, accent)
icon.save(root / 'app-icon-512x512.png')

# Feature graphic
fg = Image.new('RGBA', (1024, 500), '#0A4B8C')
d = ImageDraw.Draw(fg)
for i in range(500):
    alpha = int(120 * (1 - i / 500))
    d.line([(0, i), (1024, i)], fill=(14, 95, 163, alpha))
for i in range(40):
    d.arc([-200 + i * 15, 180 - i * 3, 620 + i * 15, 520 - i * 3], 0, 180, fill=(255, 255, 255, 180), width=16)
castle = [(720, 260), (780, 260), (780, 200), (820, 200), (820, 260), (860, 260), (860, 180), (720, 180)]
d.polygon(castle, fill=(255, 255, 255, 200))
d.rectangle((740, 120, 840, 260), fill=(255, 255, 255, 200))
d.rectangle((780, 80, 820, 120), fill=(255, 255, 255, 200))
d.line((780, 80, 820, 80), fill=(10, 75, 140), width=8)
heading = 'Seva Setu'
subheading = 'Malvan Municipal Council'
body = 'Official citizen service app for local civic requests, complaints, and ward updates.'
d.text((60, 80), heading, font=font_h, fill='white')
d.text((60, 170), subheading, font=font_s, fill='#BBDEFB')
text_y = 240
for line in [body[i:i+52].rstrip() for i in range(0, len(body), 52)]:
    d.text((60, text_y), line, font=font_b, fill='#E3F2FD')
    text_y += 34
fg.save(root / 'feature-graphic-1024x500.png')

# screenshots
screenshot_size = (1080, 1920)
captions = [
    ('Splash screen', 'Welcome to Seva Setu • Malvan Municipal Council'),
    ('Role selection', 'Choose Citizen, Department, or Nagarsevak access'),
    ('Citizen dashboard', 'Track ward services, announcements, and complaints'),
    ('Complaint submission', 'Submit issues with photos and location details'),
    ('Complaint tracking', 'Monitor status and responses in real time'),
    ('Ward information', 'Inspect ward alerts, services, and local updates'),
    ('Notifications', 'Receive official civic alerts and status updates'),
    ('Profile', 'Manage your account, contact, and service preferences'),
    ('Nagarsevak dashboard', 'Official ward management and complaint action center'),
]
for idx, (title, subtitle) in enumerate(captions, start=1):
    img = Image.new('RGB', screenshot_size, '#F8FAFC')
    draw = ImageDraw.Draw(img)
    draw.rectangle((0, 0, 1080, 260), fill='#0A4B8C')
    draw.text((60, 60), 'Seva Setu', font=font_h, fill='white')
    draw.text((60, 150), title, font=font_s, fill='#BBDEFB')
    card_margin = 80
    card_top = 320
    card_bottom = 1740
    draw.rounded_rectangle((card_margin, card_top, 1080-card_margin, card_bottom), radius=40, fill='white', outline='#CBD5E1', width=2)
    for b in range(4):
        x0 = card_margin + 40 if b % 2 == 0 else card_margin + 560
        y0 = card_top + 40 + (b // 2) * 240
        draw.rounded_rectangle((x0, y0, x0 + 400, y0 + 180), radius=28, fill='#EFF6FF')
    draw.text((card_margin+40, card_bottom-220), subtitle, font=font_sub, fill='#0F172A')
    draw.text((card_margin+40, card_bottom-150), 'Government service, transparency, and local civic support.', font=font_small, fill='#475569')
    imname = f'screenshot-{idx:02d}-{title.lower().replace(" ", "-")}.png'
    img.save(root / imname)

print('Generated icon, feature graphic, and screenshots in', root)
