"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface EventImageProps {
  imageUrl?: string | null
  alt: string
  className?: string
  priority?: boolean
  variant?: 'video' | 'square'
}

export function EventImage({ imageUrl, alt, className, priority = false, variant = 'video' }: EventImageProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg",
        variant === 'video' ? 'aspect-video' : 'aspect-square',
        className
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover"
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <Image
          src="/images/default-event.jpg"
          alt={alt}
          fill
          className="object-cover"
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      )}
    </div>
  )
}
