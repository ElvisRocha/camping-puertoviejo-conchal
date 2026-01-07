import { GalleryImage } from './GalleryImage';
import type { GalleryImage as GalleryImageType } from '@/data/galleryImages';

interface GalleryGridProps {
  images: GalleryImageType[];
  onImageClick: (index: number) => void;
}

export function GalleryGrid({ images, onImageClick }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <GalleryImage
          key={image.id}
          image={image}
          index={index}
          onClick={() => onImageClick(index)}
        />
      ))}
    </div>
  );
}
