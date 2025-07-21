import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  const maxSigDigits = 5;
  const threshold = 1 / Math.pow(10, maxSigDigits);

  if (Math.abs(n) < threshold) {
    return '0';
  }

  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumSignificantDigits: maxSigDigits,
  }).format(n);
}