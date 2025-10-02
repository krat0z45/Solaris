import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
    try {
        return format(new Date(dateString), "PPP");
    } catch (error) {
        return "Invalid Date";
    }
}
