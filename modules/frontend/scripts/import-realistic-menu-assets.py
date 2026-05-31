from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageOps


SHEETS: list[tuple[str, list[str]]] = [
    (
        "milkTea",
        [
            "厚芋泥波波",
            "杨枝甘露",
            "茉莉奶绿",
            "黑糖珍珠鲜奶",
            "桂花酒酿奶茶",
            "鸭屎香柠檬茶",
            "草莓啵啵酸奶",
            "海盐芝士乌龙",
            "生椰拿铁奶茶",
            "桃桃乌龙",
            "红豆双皮奶饮",
            "抹茶麻薯奶茶",
            "烤香乌龙奶茶",
            "多肉葡萄芝士",
            "西瓜椰乳冰",
        ],
    ),
    (
        "coffee",
        [
            "冰美式续命杯",
            "燕麦拿铁",
            "生椰拿铁",
            "焦糖玛奇朵",
            "橙香冷萃",
            "热拿铁抱抱杯",
            "抹茶咖啡云顶",
            "低因轻醒拿铁",
            "香草拿铁",
            "榛果拿铁",
            "摩卡咖啡",
            "Dirty 咖啡",
            "冷萃气泡咖啡",
            "海盐芝士咖啡",
            "浓缩气泡水",
        ],
    ),
    (
        "dessert",
        [
            "芋泥盒子蛋糕",
            "提拉米苏小方",
            "草莓奶油可颂",
            "低糖酸奶碗",
            "爆浆麻薯球",
            "榴莲千层",
            "焦糖布丁",
            "黑巧能量 brownie",
            "芒果甘露慕斯",
            "抹茶红豆卷",
            "巴斯克芝士切片",
            "蓝莓酸奶芝士",
            "椰奶冻",
            "红糖冰粉",
            "水果杏仁豆腐",
        ],
    ),
    (
        "snack",
        [
            "盐酥鸡",
            "章鱼小丸子",
            "芝士薯条",
            "烤冷面",
            "炸鸡翅",
            "蒜香鸡胸条",
            "凉拌毛豆",
            "牛肉芝士卷",
            "脆皮春卷",
            "麻辣鸭脖",
            "生煎小馒头",
            "葱油手抓饼",
            "炭烤脆皮肠",
            "咖喱鱼蛋",
            "炸藕盒",
        ],
    ),
    (
        "nightFood",
        [
            "番茄牛腩粉",
            "菌菇鸡汤面",
            "麻辣拌",
            "砂锅粥",
            "小龙虾拌面",
            "烤鱼饭团",
            "酸辣汤饺",
            "深夜关东煮",
            "牛肉汤粉",
            "鲜肉云吞汤",
            "麻辣串串碗",
            "卤肉饭夜宵版",
            "孜然羊肉拌面",
            "海鲜砂锅粥",
            "麻酱凉面",
        ],
    ),
    (
        "lightFood",
        [
            "鸡胸藜麦碗",
            "牛油果全麦卷",
            "鲜虾沙拉杯",
            "低糖水果盒",
            "紫菜豆腐汤",
            "蛋白酸奶杯",
            "玉米鸡蛋轻食盒",
            "无糖气泡水",
            "三文鱼谷物碗",
            "金枪鱼鸡蛋沙拉",
            "鸡胸荞麦面",
            "牛肉蔬菜能量碗",
            "豆腐牛油果沙拉",
            "红薯鸡蛋盒",
            "希腊酸奶莓果杯",
        ],
    ),
    (
        "staple",
        [
            "台式卤肉饭",
            "咖喱鸡肉饭",
            "番茄炒蛋盖饭",
            "牛肉炒饭",
            "腊味煲仔饭",
            "照烧鸡腿饭",
            "黑椒牛柳意面",
            "干炒牛河",
            "葱油拌面",
            "担担面",
            "鲜肉云吞面",
            "海鲜炒乌冬",
            "日式蛋包饭",
            "泡菜五花肉饭",
            "香酥鸡排饭",
        ],
    ),
    (
        "stirFry",
        [
            "宫保鸡丁",
            "麻婆豆腐",
            "回锅肉",
            "鱼香肉丝",
            "青椒牛柳",
            "番茄炒蛋",
            "干锅花菜",
            "蒜蓉西兰花",
            "醋溜土豆丝",
            "孜然羊肉",
            "糖醋小排",
            "黑椒鸡丁",
            "鱼香茄子",
            "腰果虾仁",
            "辣子鸡",
        ],
    ),
    (
        "soupPot",
        [
            "麻辣烫小锅",
            "番茄牛肉小火锅",
            "酸菜鱼汤锅",
            "椰子鸡汤锅",
            "莲藕排骨汤",
            "酸汤肥牛",
            "菌菇汤锅",
            "金汤花胶鸡",
            "海鲜豆腐汤",
            "鸭血粉丝汤",
            "砂锅豆腐煲",
            "羊肉汤",
            "关东煮拼锅",
            "牛杂煲",
            "香辣干锅虾",
        ],
    ),
    (
        "other",
        [
            "泰式柠檬凤爪",
            "卤味溏心蛋",
            "凉拌黄瓜",
            "海带丝小菜",
            "酸甜萝卜",
            "韩式泡菜盒",
            "招牌辣椒油",
            "蒜香蘸料",
            "额外米饭",
            "鲜切水果杯",
            "蜂蜜柚子茶瓶",
            "鲜榨橙汁",
            "豆浆",
            "嫩滑蒸蛋",
            "安心餐具包",
        ],
    ),
]


def crop_sheet(sheet: Path, names: list[str], output_dir: Path, size: int, quality: int) -> None:
    image = Image.open(sheet).convert("RGB")
    width, height = image.size
    cell_width = width / 5
    cell_height = height / 3

    for index, name in enumerate(names):
        col = index % 5
        row = index // 5
        left = round(col * cell_width)
        top = round(row * cell_height)
        right = round((col + 1) * cell_width)
        bottom = round((row + 1) * cell_height)
        tile = image.crop((left, top, right, bottom))
        tile = ImageOps.fit(tile, (size, size), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
        tile.save(output_dir / f"{name}.webp", quality=quality, method=6)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--size", default=640, type=int)
    parser.add_argument("--quality", default=84, type=int)
    args = parser.parse_args()

    sheets = sorted(args.source_dir.glob("*.png"), key=lambda path: path.stat().st_mtime)
    if len(sheets) < len(SHEETS):
        raise SystemExit(f"Expected at least {len(SHEETS)} generated sheets, found {len(sheets)}")

    args.output_dir.mkdir(parents=True, exist_ok=True)
    for sheet, (_, names) in zip(sheets, SHEETS):
        crop_sheet(sheet, names, args.output_dir, args.size, args.quality)

    print(f"Imported {sum(len(names) for _, names in SHEETS)} realistic menu assets into {args.output_dir}")


if __name__ == "__main__":
    main()
