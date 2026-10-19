import { expect } from 'chai'
import { Vector3 } from '@luz/math'
import { Polygon } from '@luz/physics'
import { findClosestSegmentPoints } from '@luz/physics/collisions/algorithms/closest-segment-points'
import {
  findClosestPointOnPolygon,
  findClosestPointOnTriangle
} from '@luz/physics/collisions/algorithms/polygon-geometry'

describe('Closest-point destinations', () => {
  it('preserves segment results for crossing, parallel, clamped and degenerate segments', () => {
    const cases = [
      {
        endpoints: [
          [-1, 0, 0],
          [1, 0, 0],
          [0, -1, 1],
          [0, 1, 1]
        ],
        expected: [
          [0, 0, 0],
          [0, 0, 1]
        ]
      },
      {
        endpoints: [
          [0, 0, 0],
          [1, 0, 0],
          [0, 1, 0],
          [1, 1, 0]
        ],
        expected: [
          [0, 0, 0],
          [0, 1, 0]
        ]
      },
      {
        endpoints: [
          [0, 0, 0],
          [1, 0, 0],
          [2, 1, 0],
          [3, -1, 0]
        ],
        expected: [
          [1, 0, 0],
          [2.2, 0.6, 0]
        ]
      },
      {
        endpoints: [
          [1, 2, 3],
          [1, 2, 3],
          [4, 5, 6],
          [4, 5, 6]
        ],
        expected: [
          [1, 2, 3],
          [4, 5, 6]
        ]
      },
      {
        endpoints: [
          [0, 0, 0],
          [0, 0, 0],
          [1, 1, 0],
          [1, -1, 0]
        ],
        expected: [
          [0, 0, 0],
          [1, 0, 0]
        ]
      },
      {
        endpoints: [
          [-1, 0, 0],
          [1, 0, 0],
          [0, 2, 0],
          [0, 2, 0]
        ],
        expected: [
          [0, 0, 0],
          [0, 2, 0]
        ]
      }
    ]

    for (const { endpoints, expected } of cases) {
      const points = endpoints.map((point) => new Vector3(point)) as [Vector3, Vector3, Vector3, Vector3]
      const result = findClosestSegmentPoints(...points)

      expect(points.map((point) => point.xyz)).to.deep.equal(endpoints)

      for (let index = 0; index < 2; index++) {
        expect(Vector3.subtract(result[index], new Vector3(expected[index])).magnitude).to.be.lessThan(1e-6)
        expect(points.includes(result[index])).to.equal(false)
      }

      const aliasedResult = findClosestSegmentPoints(...points, points[2], points[0])

      expect(aliasedResult[0]).to.equal(points[2])
      expect(aliasedResult[1]).to.equal(points[0])
      expect(aliasedResult).to.deep.equal(result)
    }
  })
  it('writes every triangle region into an independent result or the supplied query vector', () => {
    const vertices: [Vector3, Vector3, Vector3] = [new Vector3(), new Vector3([2, 0, 0]), new Vector3([0, 2, 0])]
    const snapshot = vertices.map((vertex) => vertex.clone())
    const cases = [
      { point: [-1, -1, 1], expected: [0, 0, 0] },
      { point: [3, -1, 1], expected: [2, 0, 0] },
      { point: [-1, 3, 1], expected: [0, 2, 0] },
      { point: [1, -1, 1], expected: [1, 0, 0] },
      { point: [-1, 1, 1], expected: [0, 1, 0] },
      { point: [2, 2, 1], expected: [1, 1, 0] },
      { point: [0.5, 0.5, 1], expected: [0.5, 0.5, 0] }
    ]

    for (const { point, expected } of cases) {
      const queryPoint = new Vector3(point)
      const result = findClosestPointOnTriangle(queryPoint, ...vertices)

      expect(result.xyz).to.deep.equal(expected)
      expect(queryPoint.xyz).to.deep.equal(point)
      expect(vertices.includes(result)).to.equal(false)
      expect(findClosestPointOnTriangle(queryPoint, ...vertices, queryPoint)).to.equal(queryPoint)
      expect(queryPoint).to.deep.equal(result)
      expect(vertices).to.deep.equal(snapshot)
    }
  })
  it('keeps the query intact until all triangles of a concave polygon have been checked', () => {
    const polygon = new Polygon({
      vertices: [
        [0, 0, 0],
        [3, 0, 0],
        [3, 1, 0],
        [1, 1, 0],
        [1, 3, 0],
        [0, 3, 0]
      ].map((point) => new Vector3(point))
    })
    const snapshot = polygon.vertices.map((vertex) => vertex.clone())

    for (const { point, expected } of [
      { point: [0.5, 2, 1], expected: [0.5, 2, 0] },
      { point: [2.5, 2, 1], expected: [2.5, 1, 0] },
      { point: [4, -1, 2], expected: [3, 0, 0] }
    ]) {
      const queryPoint = new Vector3(point)
      const result = findClosestPointOnPolygon(queryPoint, polygon)

      expect(result.xyz).to.deep.equal(expected)
      expect(polygon.vertices.includes(result)).to.equal(false)
      expect(findClosestPointOnPolygon(queryPoint, polygon, queryPoint)).to.equal(queryPoint)
      expect(queryPoint).to.deep.equal(result)
      expect(polygon.vertices).to.deep.equal(snapshot)
    }
  })
})
