import os
import sys
from PIL import Image, ImageEnhance, ImageFilter
from rembg import remove

def process_product_image(input_path, output_path):
    print(f"Loading image from: {input_path}")
    if not os.path.exists(input_path):
        print(f"Error: File {input_path} does not exist.")
        return False
        
    try:
        # Load the original image
        img = Image.open(input_path)
        
        # 1. Remove background using rembg
        print("Removing background using AI (rembg)...")
        img_nobg = remove(img)
        
        # 2. Crop to content (bounding box of non-transparent pixels)
        print("Cropping image to product boundaries...")
        bbox = img_nobg.getbbox()
        if bbox:
            img_cropped = img_nobg.crop(bbox)
        else:
            img_cropped = img_nobg
            print("Warning: Could not find bounding box, skipping crop.")

        # 3. Image enhancements
        print("Applying enhancements (Contrast, Brightness, Sharpness)...")
        # Enhance Contrast
        contrast = ImageEnhance.Contrast(img_cropped)
        img_enhanced = contrast.enhance(1.15)  # Boost contrast by 15%
        
        # Enhance Brightness
        brightness = ImageEnhance.Brightness(img_enhanced)
        img_enhanced = brightness.enhance(1.05)  # Boost brightness by 5%
        
        # Enhance Sharpness
        sharpness = ImageEnhance.Sharpness(img_enhanced)
        img_enhanced = sharpness.enhance(1.5)  # Sharpen the product details
        
        # Save output
        img_enhanced.save(output_path, "PNG")
        print(f"Successfully processed image and saved to: {output_path}")
        return True
        
    except Exception as e:
        print(f"Error during image processing: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python process_image.py <input_path> <output_path>")
        sys.exit(1)
        
    input_img = sys.argv[1]
    output_img = sys.argv[2]
    
    success = process_product_image(input_img, output_img)
    sys.exit(0 if success else 1)
