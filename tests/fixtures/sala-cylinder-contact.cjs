const { Cylinder } = require('@luz/physics')
const { collideConvexShapes } = require('@luz/physics/collisions/algorithms/convex-queries')
const shapes = require('./sala-cylinder-contact.json')

const results = []

// The exact capture and nearby contacts exercise the almost coplanar EPA seed.
for (const offset of [0, -1e-6, 1e-6, -1e-5, 1e-5]) {
  const pair = shapes.map((shape) => {
    const cylinder = new Cylinder({ radius: shape.radius, height: shape.height })

    cylinder.center.set(shape.center)
    shape.axes.forEach((axis, index) => cylinder.axes[index].set(axis))

    return cylinder
  })

  pair[0].center.y += offset

  for (const order of [pair, [...pair].reverse()]) {
    const collisions = collideConvexShapes(...order)

    results.push(
      collisions?.map((collision) => ({
        penetrationDepth: collision.penetrationDepth,
        normal: collision.normal.xyz,
        point: collision.point.xyz
      }))
    )
  }
}

process.stdout.write(JSON.stringify(results))
