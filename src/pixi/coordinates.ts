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

// Universal conversion function with automatic type inference
export function convertCoordinates(coord: Coordinates, targetType: 'cartesian'): CartesianCoordinates
export function convertCoordinates(coord: Coordinates, targetType: 'polar-angle'): PolarAngleCoordinates
export function convertCoordinates(coord: Coordinates, targetType: 'polar-radian'): PolarRadianCoordinates
export function convertCoordinates(
  coord: Coordinates,
  targetType: 'cartesian' | 'polar-angle' | 'polar-radian',
): Coordinates {
  if (targetType === 'cartesian') {
    if (isCartesian(coord)) {
      return coord
    }
    if (isPolarAngle(coord)) {
      return polarAngleToCartesian(coord)
    }
    if (isPolarRadian(coord)) {
      return polarRadianToCartesian(coord)
    }
  }

  if (targetType === 'polar-angle') {
    if (isPolarAngle(coord)) {
      return coord
    }
    if (isCartesian(coord)) {
      return cartesianToPolarAngle(coord)
    }
    if (isPolarRadian(coord)) {
      return polarRadianToAngle(coord)
    }
  }

  if (targetType === 'polar-radian') {
    if (isPolarRadian(coord)) {
      return coord
    }
    if (isCartesian(coord)) {
      return cartesianToPolarRadian(coord)
    }
    if (isPolarAngle(coord)) {
      return polarAngleToRadian(coord)
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
  radian: number,
): CartesianCoordinates {
  const validated = CartesianCoordinatesSchema.parse(point)

  return CartesianCoordinatesSchema.parse({
    x: validated.x + distance * Math.cos(radian),
    y: validated.y + distance * Math.sin(radian),
  })
}

export function rotatePoint(
  point: CartesianCoordinates,
  center: CartesianCoordinates,
  radian: number,
): CartesianCoordinates {
  const validatedPoint = CartesianCoordinatesSchema.parse(point)
  const validatedCenter = CartesianCoordinatesSchema.parse(center)

  const cos = Math.cos(radian)
  const sin = Math.sin(radian)
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

// Scale coordinates by a factor
export function scaleCoordinates(coord: Coordinates, factor: number): CartesianCoordinates
export function scaleCoordinates(coord: Coordinates, factor: number): PolarAngleCoordinates
export function scaleCoordinates(coord: Coordinates, factor: number): PolarRadianCoordinates
export function scaleCoordinates(coord: Coordinates, factor: number): Coordinates {
  if (isCartesian(coord)) {
    const validated = CartesianCoordinatesSchema.parse(coord)
    return CartesianCoordinatesSchema.parse({
      x: validated.x * factor,
      y: validated.y * factor,
    })
  }

  if (isPolarAngle(coord)) {
    const validated = PolarAngleCoordinatesSchema.parse(coord)
    return PolarAngleCoordinatesSchema.parse({
      r: validated.r * factor,
      deg: validated.deg, // 角度保持不变
    })
  }

  if (isPolarRadian(coord)) {
    const validated = PolarRadianCoordinatesSchema.parse(coord)
    return PolarRadianCoordinatesSchema.parse({
      r: validated.r * factor,
      rad: validated.rad, // 弧度保持不变
    })
  }

  throw new Error('不支持的坐标类型')
}

// 两圆交点计算结果类型
export type CircleIntersectionResult =
  | { type: 'no_intersection'; points: [] }
  | { type: 'one_intersection'; points: [CartesianCoordinates] }
  | { type: 'two_intersections'; points: [CartesianCoordinates, CartesianCoordinates] }
  | { type: 'infinite_intersections'; points: [] } // 两圆重合

// 计算两圆交点坐标
export function findCircleIntersections(
  center1: Coordinates,
  radius1: number,
  center2: Coordinates,
  radius2: number,
): CartesianCoordinates[] | undefined {
  // 验证半径必须为正数
  if (radius1 <= 0 || radius2 <= 0) {
    throw new Error('半径必须为正数')
  }

  // 将坐标统一转换为笛卡尔坐标
  const cart1 = convertCoordinates(center1, 'cartesian')
  const cart2 = convertCoordinates(center2, 'cartesian')

  // 计算两圆心之间的距离
  const d = distance(cart1, cart2)

  // 特殊情况：两圆心重合
  if (d === 0) {
    if (radius1 === radius2) {
      // 两圆重合，有无穷多个交点
      return []
    } else {
      // 同心圆，无交点
      return undefined
    }
  }

  // 判断两圆位置关系
  const radiusSum = radius1 + radius2
  const radiusDiff = Math.abs(radius1 - radius2)

  if (d > radiusSum) {
    // 两圆分离，无交点
    return undefined
  }

  if (d < radiusDiff) {
    // 一圆在另一圆内部，无交点
    return undefined
  }

  if (d === radiusSum || d === radiusDiff) {
    // 两圆外切或内切，有一个交点
    const a = radius1
    const ratio = a / d
    const intersectionPoint: CartesianCoordinates = {
      x: cart1.x + ratio * (cart2.x - cart1.x),
      y: cart1.y + ratio * (cart2.y - cart1.y),
    }
    return [CartesianCoordinatesSchema.parse(intersectionPoint)]
  }

  // 两圆相交，有两个交点
  // 使用几何算法计算交点
  const a = (radius1 * radius1 - radius2 * radius2 + d * d) / (2 * d)
  const h = Math.sqrt(radius1 * radius1 - a * a)

  // 计算两圆心连线上的基准点
  const px = cart1.x + (a * (cart2.x - cart1.x)) / d
  const py = cart1.y + (a * (cart2.y - cart1.y)) / d

  // 计算两个交点
  const intersection1: CartesianCoordinates = {
    x: px + (h * (cart2.y - cart1.y)) / d,
    y: py - (h * (cart2.x - cart1.x)) / d,
  }

  const intersection2: CartesianCoordinates = {
    x: px - (h * (cart2.y - cart1.y)) / d,
    y: py + (h * (cart2.x - cart1.x)) / d,
  }

  return [
    CartesianCoordinatesSchema.parse(intersection1),
    CartesianCoordinatesSchema.parse(intersection2),
  ]
}

// 计算相对坐标
export function getRelativeCoordinates(
  point: Coordinates,
  newOrigin: Coordinates,
): CartesianCoordinates {
  // 将两个坐标都转换为笛卡尔坐标
  const cartPoint = convertCoordinates(point, 'cartesian')
  const cartOrigin = convertCoordinates(newOrigin, 'cartesian')

  // 计算相对坐标：点坐标 - 新原点坐标
  const relativeCoord: CartesianCoordinates = {
    x: cartPoint.x - cartOrigin.x,
    y: cartPoint.y - cartOrigin.y,
  }

  return CartesianCoordinatesSchema.parse(relativeCoord)
}

// 将相对坐标转换为绝对坐标
export function getAbsoluteCoordinates(
  relativePoint: Coordinates,
  origin: Coordinates,
): CartesianCoordinates {
  // 将两个坐标都转换为笛卡尔坐标
  const cartRelative = convertCoordinates(relativePoint, 'cartesian')
  const cartOrigin = convertCoordinates(origin, 'cartesian')

  // 计算绝对坐标：相对坐标 + 原点坐标
  const absoluteCoord: CartesianCoordinates = {
    x: cartRelative.x + cartOrigin.x,
    y: cartRelative.y + cartOrigin.y,
  }

  return CartesianCoordinatesSchema.parse(absoluteCoord)
}

// 延伸坐标：沿着从原点到给定坐标的方向延伸指定长度
export function extendCoordinates(coord: Coordinates, extensionLength: number): CartesianCoordinates {
  // 如果是笛卡尔坐标
  if (isCartesian(coord)) {
    const validated = CartesianCoordinatesSchema.parse(coord)

    // 如果是原点，无法确定延伸方向
    if (validated.x === 0 && validated.y === 0) {
      if (extensionLength === 0) {
        return validated
      }
      throw new Error('无法从原点(0,0)延伸，因为没有明确的方向')
    }

    // 计算当前距离和方向
    const currentDistance = Math.sqrt(validated.x ** 2 + validated.y ** 2)
    const newDistance = currentDistance + extensionLength

    // 如果新距离为负数或零，返回原点
    if (newDistance <= 0) {
      return CartesianCoordinatesSchema.parse({ x: 0, y: 0 })
    }

    // 计算缩放比例
    const scaleFactor = newDistance / currentDistance

    return CartesianCoordinatesSchema.parse({
      x: validated.x * scaleFactor,
      y: validated.y * scaleFactor,
    })
  }

  // 如果是极坐标，处理更简单
  if (isPolarAngle(coord)) {
    const validated = PolarAngleCoordinatesSchema.parse(coord)
    const newRadius = validated.r + extensionLength

    // 如果新半径为负数或零，返回原点
    if (newRadius <= 0) {
      return CartesianCoordinatesSchema.parse({ x: 0, y: 0 })
    }

    // 保持角度不变，只改变半径
    const newPolar = PolarAngleCoordinatesSchema.parse({
      r: newRadius,
      deg: validated.deg,
    })

    return polarAngleToCartesian(newPolar)
  }

  if (isPolarRadian(coord)) {
    const validated = PolarRadianCoordinatesSchema.parse(coord)
    const newRadius = validated.r + extensionLength

    // 如果新半径为负数或零，返回原点
    if (newRadius <= 0) {
      return CartesianCoordinatesSchema.parse({ x: 0, y: 0 })
    }

    // 保持角度不变，只改变半径
    const newPolar = PolarRadianCoordinatesSchema.parse({
      r: newRadius,
      rad: validated.rad,
    })

    return polarRadianToCartesian(newPolar)
  }

  throw new Error('不支持的坐标类型')
}
