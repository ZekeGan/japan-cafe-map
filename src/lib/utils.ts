import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 計算兩個經緯度之間的距離 (單位：公尺)
export const getDistance = (
  pos1: google.maps.LatLngLiteral,
  pos2: google.maps.LatLngLiteral
): number => {
  const R = 6371e3 // 地球半徑 (公尺)
  const dLat = ((pos2.lat - pos1.lat) * Math.PI) / 180
  const dLon = ((pos2.lng - pos1.lng) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pos1.lat * Math.PI) / 180) *
      Math.cos((pos2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // 回傳公尺
}
