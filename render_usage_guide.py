from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(r"C:\Users\林典瑋 Kelly Lin\Documents\Codex\2026-08-14\new-chat")
OUT = ROOT / "output"
OUT.mkdir(exist_ok=True)
FONT = Path(r"C:\Windows\Fonts\NotoSansTC-VF.ttf")

SOURCES = {
    "極簡版": Path(r"C:\Users\林典瑋 Kelly Lin\.codex\generated_images\01a012e3-4c1d-7093-a042-da636d4e4d96\exec-3f0dee9d-4d37-48c9-bdbc-b0ed49a844fd.png"),
    "裝飾版": Path(r"C:\Users\林典瑋 Kelly Lin\.codex\generated_images\01a012e3-4c1d-7093-a042-da636d4e4d96\exec-db14c458-7e50-4b11-a06f-1017c6d8a91c.png"),
}

W, H, HEADER = 1122, 1402, 185
INK, OLIVE, GOLD, CREAM, MUTED = "#292d24", "#4e5b3b", "#c7a65f", "#f6f0df", "#555b4d"


def fnt(size, weight=500):
    face = ImageFont.truetype(str(FONT), size=size, layout_engine=ImageFont.Layout.RAQM)
    face.set_variation_by_axes([weight])
    return face


def centered(draw, text, cx, cy, font, fill):
    box = draw.textbbox((0, 0), text, font=font)
    draw.text((cx - (box[2] - box[0]) / 2, cy - (box[3] - box[1]) / 2 - box[1]), text, font=font, fill=fill)


def build(label, source):
    raw = Image.open(source).convert("RGBA")
    # Remove the generated top ornament; retain only the goal and five website-flow cards.
    content = raw.crop((0, 170, raw.width, raw.height)).resize((W, H - HEADER), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (W, H), CREAM)
    canvas.alpha_composite(content, (0, HEADER))
    draw = ImageDraw.Draw(canvas)

    # Clean title area. Two lines keep the requested 20% enlargement legible on phones.
    centered(draw, "CGM合唱團 10月榮耀神", W // 2, 66, fnt(43, 750), INK)
    centered(draw, "閱讀計畫說明", W // 2, 126, fnt(40, 750), OLIVE)
    draw.line((94, 166, W - 94, 166), fill=GOLD, width=2)

    # Shared-goal panel: no progress bar, only the requested explanation.
    draw.text((72, 214), "我們的共同目標", font=fnt(31, 750), fill=INK)
    goal_lines = [
        "榮耀 神的十月份即將到來！",
        "明年我們將演出以「老師越戰故事」為基礎編寫的曲目，",
        "為了能更貼近並深刻詮釋其中的精神，",
        "邀請大家在本月一同投入《越戰的故事》閱讀，",
        "為明年的獻上做最充分的預備！",
    ]
    for i, line in enumerate(goal_lines):
        draw.text((72, 261 + i * 33), line, font=fnt(21, 520), fill=INK)

    steps = [
        ("01", "輸入姓名", "選擇目前讀到的章節"),
        ("02", "每天登錄", "按「今天讀了一點」，留下閱讀足跡"),
        ("03", "解鎖圖卡", "達 25%・50%・75%・100% 即可下載"),
        ("04", "完成本輪", "登錄第 10 章後，按「我已讀完整本」"),
        ("05", "開始下一輪", "重新從第 1 章出發，累積完讀輪次"),
    ]
    rows = [(465, 612), (638, 787), (812, 961), (985, 1134), (1156, 1307)]
    for (num, title, desc), (top, bottom) in zip(steps, rows):
        cy = (top + bottom) // 2
        centered(draw, num, 108, cy, fnt(21, 650), CREAM)
        text_x = 195 if label == "裝飾版" else 171
        draw.text((text_x, top + 21), title, font=fnt(32, 750), fill=INK)
        draw.text((text_x, top + 72), desc, font=fnt(22, 520), fill=MUTED)

    if label == "裝飾版":
        # Restrained website-derived route dots; never intrude into text areas.
        for x, color in [(42, GOLD), (62, OLIVE), (82, "#9a5d45")]:
            draw.ellipse((x - 4, 148, x + 4, 156), fill=color)
            draw.ellipse((W - x - 4, 148, W - x + 4, 156), fill=color)

    result = canvas.convert("RGB")
    path = OUT / f"CGM閱讀計畫說明-{label}.png"
    result.save(path, quality=96)
    return path


for key, value in SOURCES.items():
    print(build(key, value))
