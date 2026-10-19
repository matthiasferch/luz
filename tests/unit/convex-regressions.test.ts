import { expect } from 'chai'
import { execFileSync } from 'child_process'
import { join } from 'path'

describe('Physics: convex penetration regressions', () => {
  it('resolves the Sala cup/table contact without runaway EPA expansion', function () {
    this.timeout(15000)

    // Mocha cannot interrupt a blocked synchronous query. A child process gives this
    // captured freeze a hard deadline without leaving the entire suite hung.
    const output = execFileSync(
      process.execPath,
      ['-r', 'ts-node/register', join(process.cwd(), 'fixtures/sala-cylinder-contact.cjs')],
      {
        env: { ...process.env, TS_NODE_TRANSPILE_ONLY: 'true' },
        timeout: 10000,
        encoding: 'utf8'
      }
    )
    const results = JSON.parse(output)

    expect(results).to.have.length(10)
    results.forEach(
      (collisions: Array<{ penetrationDepth: number; normal: number[]; point: number[] }>, index: number) => {
        expect(collisions).to.have.length(1)

        const { penetrationDepth: distance, normal, point: contact } = collisions[0]

        expect(distance).to.be.closeTo(0.0055, 0.0001)
        expect(normal[1]).to.be.closeTo(index % 2 === 0 ? -1 : 1, 0.0001)
        expect(Math.hypot(...normal)).to.be.closeTo(1, 1e-6)
        expect([...normal, ...contact, distance].every(Number.isFinite)).to.equal(true)
        expect(contact[1]).to.be.closeTo(0.402, 0.001)
      }
    )
  })
})
