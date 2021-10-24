import dynamo from 'dynamojs-engine'

// Generate a random permutation of 256 numbers
let perms = []
for(let i = 0; i < 256; i++) {
  perms.push(i)
}
for(let i = perms.length - 1; i >= 1; i--) {
  const j = Math.floor(Math.random() * (i + 1))
  const temp = perms[i]
  perms[i] = perms[j]
  perms[j] = temp
}

// Double the length to minimize modulo operations
perms.push(...perms)

// Unit-length gradient vectors
const root2 = Math.sqrt(2) / 2
const grads = [
  new dynamo.Vec2D(-1, 0),
  new dynamo.Vec2D(1, 0),
  new dynamo.Vec2D(0, 1),
  new dynamo.Vec2D(0, -1),

  new dynamo.Vec2D(-root2, -root2),
  new dynamo.Vec2D(-root2, root2),
  new dynamo.Vec2D(root2, -root2),
  new dynamo.Vec2D(root2, root2)
]

// Smooth the value distribution
function ease (t) {
  return ((6 * t - 15) * t + 10) * t * t * t
}

// 2D perlin noise implementation scaled from [0, 1]
export default function perlin (x, y) {
  const xf = Math.floor(x)
  const yf = Math.floor(y)
  
  // Grid cell coordinates
  const x0 = xf & 255
  const x1 = x0 + 1
  const y0 = yf & 255
  const y1 = y0 + 1

  // Offset coordinates
  const ox0 = x - xf
  const ox1 = ox0 - 1
  const oy0 = y - yf
  const oy1 = oy0 - 1

  // Gradients
  const g0 = grads[perms[perms[x0] + y0] & 7]
  const g1 = grads[perms[perms[x1] + y0] & 7]
  const g2 = grads[perms[perms[x0] + y1] & 7]
  const g3 = grads[perms[perms[x1] + y1] & 7]

  // Dot products
  const d0 = g0.dot(new dynamo.Vec2D(ox0, oy0))
  const d1 = g1.dot(new dynamo.Vec2D(ox1, oy0))
  const d2 = g2.dot(new dynamo.Vec2D(ox0, oy1))
  const d3 = g3.dot(new dynamo.Vec2D(ox1, oy1))

  const t0 = ease(ox0)
  const t1 = ease(oy0)

  const noise = dynamo.lerp(
    dynamo.lerp(d0, d1, t0), 
    dynamo.lerp(d2, d3, t0), 
    t1
  )

  return 0.5 * (noise + root2)
}
