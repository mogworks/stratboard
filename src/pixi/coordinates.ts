import { z } from 'zod'

// Zod Schemas
export const CartesianCoordinatesSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
})

export const PolarAngleCoordinatesSchema = z.object({
  r: z.number().min(0, '半径必须为非负数'),
  deg: z.number().finite(), // 角度可以是任意有限数值
})

export const PolarRadianCoordinatesSchema = z.object({
  r: z.number().min(0, '半径必须为非负数'),
  rad: z.number().finite(), // 弧度可以是任意有限数值
})

export const PolarCoordinatesSchema = z.union([
  PolarAngleCoordinatesSchema,
  PolarRadianCoordinatesSchema,
])

export const CoordinatesSchema = z.union([
  CartesianCoordinatesSchema,
  PolarCoordinatesSchema,
])

// Type definitions inferred from schemas
export type CartesianCoordinates = z.infer<typeof CartesianCoordinatesSchema>
export type PolarAngleCoordinates = z.infer<typeof PolarAngleCoordinatesSchema>
export type PolarRadianCoordinates = z.infer<typeof PolarRadianCoordinatesSchema>
export type PolarCoordinates = z.infer<typeof PolarCoordinatesSchema>
export type Coordinates = z.infer<typeof CoordinatesSchema>

// Type guards
export function isCartesian(coord: Coordinates): coord is CartesianCoordinates {
  return 'x' in coord && 'y' in coord
}

export function isPolarAngle(coord: Coordinates): coord is PolarAngleCoordinates {
  return 'r' in coord && 'deg' in coord
}

export function isPolarRadian(coord: Coordinates): coord is PolarRadianCoordinates {
  return 'r' in coord && 'rad' in coord
}

export function isPolar(coord: Coordinates): coord is PolarCoordinates {
  return isPolarAngle(coord) || isPolarRadian(coord)
}

// Utility functions
export const degToRad = (degrees: number): number => (degrees * Math.PI) / 180
export const radToDeg = (radians: number): number => (radians * 180) / Math.PI

// Angle normalization functions (optional utilities)
export const normalizeAngleDeg = (degrees: number): number => {
  const normalized = degrees % 360
  return normalized < 0 ? normalized + 360 : normalized
}

export const normalizeAngleRad = (radians: number): number => {
  const normalized = radians % (2 * Math.PI)
  return normalized < 0 ? normalized + 2 * Math.PI : normalized
}

// Get equivalent angle in [-180, 180] degree range
export const normalizeAngleSignedDeg = (degrees: number): number => {
  let normalized = degrees % 360
  if (normalized > 180) {
    normalized -= 360
  }
  if (normalized < -180) {
    normalized += 360
  }
  return normalized
}

// Get equivalent angle in [-π, π] radian range
export const normalizeAngleSignedRad = (radians: number): number => {
  let normalized = radians % (2 * Math.PI)
  if (normalized > Math.PI) {
    normalized -= 2 * Math.PI
  }
  if (normalized < -Math.PI) {
    normalized += 2 * Math.PI
  }
  return normalized
}

// Conversion functions
export function cartesianToPolarRadian(cartesian: CartesianCoordinates): PolarRadianCoordinates {
  const validated = CartesianCoordinatesSchema.parse(cartesian)
  const r = Math.sqrt(validated.x ** 2 + validated.y ** 2)
  const rad = Math.atan2(validated.y, validated.x)

  return PolarRadianCoordinatesSchema.parse({ r, rad })
}

export function cartesianToPolarAngle(cartesian: CartesianCoordinates): PolarAngleCoordinates {
  const polarRadian = cartesianToPolarRadian(cartesian)
  const deg = radToDeg(polarRadian.rad)

  return PolarAngleCoordinatesSchema.parse({ r: polarRadian.r, deg })
}

export function polarRadianToCartesian(polar: PolarRadianCoordinates): CartesianCoordinates {
  const validated = PolarRadianCoordinatesSchema.parse(polar)
  const x = validated.r * Math.cos(validated.rad)
  const y = validated.r * Math.sin(validated.rad)

  return CartesianCoordinatesSchema.parse({ x, y })
}

export function polarAngleToCartesian(polar: PolarAngleCoordinates): CartesianCoordinates {
  const validated = PolarAngleCoordinatesSchema.parse(polar)
  const rad = degToRad(validated.deg)
  const x = validated.r * Math.cos(rad)
  const y = validated.r * Math.sin(rad)

  return CartesianCoordinatesSchema.parse({ x, y })
}

export function polarAngleToRadian(polar: PolarAngleCoordinates): PolarRadianCoordinates {
  const validated = PolarAngleCoordinatesSchema.parse(polar)
  const rad = degToRad(validated.deg)

  return PolarRadianCoordinatesSchema.parse({ r: validated.r, rad })
}

export function polarRadianToAngle(polar: PolarRadianCoordinates): PolarAngleCoordinates {
  const validated = PolarRadianCoordinatesSchema.parse(polar)
  const deg = radToDeg(validated.rad)

  return PolarAngleCoordinatesSchema.parse({ r: validated.r, deg })
}

// Universal conversion function
export function convertCoordinates<T extends Coordinates>(
  coord: Coordinates,
  targetType: 'cartesian' | 'polar-angle' | 'polar-radian',
): T {
  if (targetType === 'cartesian') {
    if (isCartesian(coord)) {
      return coord as T
    }
    if (isPolarAngle(coord)) {
      return polarAngleToCartesian(coord) as T
    }
    if (isPolarRadian(coord)) {
      return polarRadianToCartesian(coord) as T
    }
  }

  if (targetType === 'polar-angle') {
    if (isPolarAngle(coord)) {
      return coord as T
    }
    if (isCartesian(coord)) {
      return cartesianToPolarAngle(coord) as T
    }
    if (isPolarRadian(coord)) {
      return polarRadianToAngle(coord) as T
    }
  }

  if (targetType === 'polar-radian') {
    if (isPolarRadian(coord)) {
      return coord as T
    }
    if (isCartesian(coord)) {
      return cartesianToPolarRadian(coord) as T
    }
    if (isPolarAngle(coord)) {
      return polarAngleToRadian(coord) as T
    }
  }

  throw new Error(`无法转换到目标类型: ${targetType}`)
}

// Distance and angle calculations
export function distance(coord1: CartesianCoordinates, coord2: CartesianCoordinates): number {
  const validated1 = CartesianCoordinatesSchema.parse(coord1)
  const validated2 = CartesianCoordinatesSchema.parse(coord2)

  return Math.sqrt((validated2.x - validated1.x) ** 2 + (validated2.y - validated1.y) ** 2)
}

export function angleBetweenPoints(from: CartesianCoordinates, to: CartesianCoordinates): number {
  const validated1 = CartesianCoordinatesSchema.parse(from)
  const validated2 = CartesianCoordinatesSchema.parse(to)

  return Math.atan2(validated2.y - validated1.y, validated2.x - validated1.x)
}

// Coordinate manipulation
export function movePoint(
  point: CartesianCoordinates,
  distance: number,
  angle: number,
): CartesianCoordinates {
  const validated = CartesianCoordinatesSchema.parse(point)

  return CartesianCoordinatesSchema.parse({
    x: validated.x + distance * Math.cos(angle),
    y: validated.y + distance * Math.sin(angle),
  })
}

export function rotatePoint(
  point: CartesianCoordinates,
  center: CartesianCoordinates,
  angle: number,
): CartesianCoordinates {
  const validatedPoint = CartesianCoordinatesSchema.parse(point)
  const validatedCenter = CartesianCoordinatesSchema.parse(center)

  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const dx = validatedPoint.x - validatedCenter.x
  const dy = validatedPoint.y - validatedCenter.y

  return CartesianCoordinatesSchema.parse({
    x: validatedCenter.x + dx * cos - dy * sin,
    y: validatedCenter.y + dx * sin + dy * cos,
  })
}

// Validation helpers
export function validateCoordinates(coord: unknown): Coordinates {
  return CoordinatesSchema.parse(coord)
}

export function isValidCoordinates(coord: unknown): coord is Coordinates {
  return CoordinatesSchema.safeParse(coord).success
}
