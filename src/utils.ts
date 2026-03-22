export const isEmpty = (value: string | undefined): boolean => {
  return value === undefined || value === ""
}

export const truncateValue = (value: string): string => {
  if (value.length <= 8) return value
  return value.slice(0, 4) + "***"
}

export const isProduction = (): boolean => {
  return (
    typeof process !== "undefined" && process.env?.["NODE_ENV"] === "production"
  )
}
