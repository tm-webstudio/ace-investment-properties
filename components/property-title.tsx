import { formatPropertyAddress, formatPropertyTitle } from '@/lib/format-address'

interface PropertyTitleProps {
  address: string
  city?: string
  postcode?: string
  variant?: 'full' | 'title'
  className?: string
}

/**
 * Reusable component for displaying property titles in the standard format:
 * "road name, area, outward postcode"
 *
 * @param variant - 'title' removes street number (default), 'full' includes it
 */
export function PropertyTitle({
  address,
  city,
  postcode,
  variant = 'title',
  className = ''
}: PropertyTitleProps) {
  const formattedTitle = variant === 'title'
    ? formatPropertyTitle(address, city, postcode)
    : formatPropertyAddress(address, city, postcode)

  return <span className={className}>{formattedTitle}</span>
}
