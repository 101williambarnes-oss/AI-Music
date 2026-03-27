import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTrackThumbnail(track: { coverUrl?: string | null; fileUrl?: string | null }): string | null {
  if (track.coverUrl) return track.coverUrl;
  if (track.fileUrl && /\.(mp4|m4v|webm|mov)$/i.test(track.fileUrl) && track.fileUrl.includes("cloudinary.com")) {
    return track.fileUrl
      .replace("/video/upload/", "/video/upload/so_2,w_480,h_480,c_fill,f_jpg,q_80/")
      .replace(/\.(mp4|m4v|webm|mov)$/i, ".jpg");
  }
  return null;
}
