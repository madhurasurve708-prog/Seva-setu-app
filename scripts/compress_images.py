import os
from PIL import Image

ASSETS_DIR = r"c:\updated_xampp\htdocs\Seva-setu-app\assets\images"

def compress_image(filename, target_width=None, quality=80):
    filepath = os.path.join(ASSETS_DIR, filename)
    if not os.path.exists(filepath):
        print(f"Skipping {filename}: Not found")
        return

    basename, ext = os.path.splitext(filename)
    
    img = Image.open(filepath)
    original_size = os.path.getsize(filepath)
    
    # Preserve orientation / mode conversions
    if img.mode in ('RGBA', 'LA'):
        img = img.convert('RGBA')
    elif img.mode != 'RGB':
        img = img.convert('RGB')
        
    if target_width and img.width > target_width:
        aspect_ratio = img.height / img.width
        target_height = int(target_width * aspect_ratio)
        img = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
        print(f"Resized {filename} to {target_width}x{target_height}")

    # Output WebP
    webp_filename = f"{basename}.webp"
    webp_filepath = os.path.join(ASSETS_DIR, webp_filename)
    img.save(webp_filepath, "WEBP", quality=quality)
    webp_size = os.path.getsize(webp_filepath)
    
    print(f"Compressed {filename} ({original_size/1024:.1f} KB) -> {webp_filename} ({webp_size/1024:.1f} KB). Reduction: {(1 - webp_size/original_size)*100:.1f}%")

def main():
    # 1. Shivaji background
    compress_image("shivaji.png", target_width=1080, quality=80)
    
    # 2. Hero Banner
    compress_image("hero_banner.png", target_width=1080, quality=80)
    
    # 3. Logo (WebP version & highly compressed JPEG version)
    compress_image("logo.jpeg", target_width=256, quality=80)
    # Overwrite the original logo.jpeg with a tiny version so app.json (expo build/splash) gets a small file
    logo_path = os.path.join(ASSETS_DIR, "logo.jpeg")
    img = Image.open(logo_path)
    img = img.resize((256, 256), Image.Resampling.LANCZOS)
    img.save(logo_path, "JPEG", quality=80)
    print(f"Optimized original logo.jpeg to {os.path.getsize(logo_path)/1024:.1f} KB")
    
    # 4. Profile pics
    compress_image("madhura.jpeg", target_width=256, quality=85)
    compress_image("apurva.png", target_width=256, quality=85)

if __name__ == "__main__":
    main()
