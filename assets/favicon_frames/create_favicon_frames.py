import math
from PIL import Image, ImageDraw

def main():
    size = 48
    frames_count = 20
    center = size / 2
    scale = 16
    
    bg_color = (10, 10, 15)       # #0a0a0f
    amber_color = (255, 157, 0)   # #ff9d00

    vertices = [
        (0, -1, 0), (0, 1, 0),
        (1, 0, 0), (-1, 0, 0),
        (0, 0, 1), (0, 0, -1)
    ]

    edges = [
        (0, 2), (0, 3), (0, 4), (0, 5),
        (1, 2), (1, 3), (1, 4), (1, 5),
        (2, 4), (4, 3), (3, 5), (5, 2)
    ]

    frames = []

    # Create each frame
    for i in range(frames_count):
        progress = i / frames_count

        angle_y = 2 * math.pi * progress
        angle_x = math.radians(20) #math.pi * progress + math.radians(20)

        projected = []
        for x, y, z in vertices:
            x1 = x * math.cos(angle_y) + z * math.sin(angle_y)
            y1 = y
            z1 = -x * math.sin(angle_y) + z * math.cos(angle_y)

            y2 = y1 * math.cos(angle_x) - z1 * math.sin(angle_x)
            z2 = y1 * math.sin(angle_x) + z1 * math.cos(angle_x)

            px = int(center + x1 * scale)
            py = int(center + y2 * scale)
            projected.append((px, py))

        img = Image.new("RGB", (size, size), bg_color)
        draw = ImageDraw.Draw(img)

        for p1_idx, p2_idx in edges:
            p1 = projected[p1_idx]
            p2 = projected[p2_idx]
            draw.line([p1, p2], fill=amber_color, width=1)

        img.save(f"frame_{i}.png")
        frames.append(img)

    print("Favicon frames generated !")

if __name__ == "__main__":
    main()