/**
 * Helper to process local image files into optimized Base64 data URLs
 * Resizes large photos to a clean 256x256 square avatar to keep local storage super fast.
 */
export async function processImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 256; // Max 256x256 for avatars
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        // Center crop to square
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);
        
        // Export optimized base64
        try {
          const optimizedDataUrl = canvas.toDataURL('image/webp', 0.85);
          resolve(optimizedDataUrl);
        } catch {
          resolve(canvas.toDataURL('image/png'));
        }
      };

      img.onerror = () => {
        reject(new Error('Error al cargar la imagen seleccionada.'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo.'));
    };

    reader.readAsDataURL(file);
  });
}
