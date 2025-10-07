import { BoundingBox } from './aabb'

// Input entry for sweep algorithms: the item and its AABB
export type AABBEntry<T> = { item: T; aabb: BoundingBox }

// Sweep-and-prune along X axis within a single set.
// Returns candidate pairs that potentially overlap in 3D (exact check via AABB.overlap).
export function sweepAndPrunePairs<T>(unsortedEntries: Array<AABBEntry<T>>): Array<[T, T]> {
  if (unsortedEntries.length <= 1) return []

  // Sort by min.x for 1D sweeping
  const sortedEntries = unsortedEntries.slice().sort((lhs, rhs) => lhs.aabb.minimum.x - rhs.aabb.minimum.x)

  // Active set contains entries whose X-interval overlaps the current entry's min.x
  const activeSet: Array<AABBEntry<T>> = []

  // Collected candidate pairs
  const candidatePairs: Array<[T, T]> = []

  for (const current of sortedEntries) {
    // Prune from the back while entries no longer overlap on X
    for (let i = activeSet.length - 1; i >= 0; i--) {
      if (activeSet[i].aabb.maximum.x < current.aabb.minimum.x) activeSet.splice(i, 1)
    }

    // Exact 3D AABB overlap test for remaining active entries
    for (const candidate of activeSet) {
      if (BoundingBox.intersect(current.aabb, candidate.aabb)) {
        candidatePairs.push([current.item, candidate.item])
      }
    }

    // Add current to the active set
    activeSet.push(current)
  }

  return candidatePairs
}

// Sweep-and-prune along X axis across two sets (A against B).
// Returns candidate cross-set pairs that potentially overlap in 3D.
export function sweepAndPrunePairsAB<A, B>(setAEntries: Array<AABBEntry<A>>, setBEntries: Array<AABBEntry<B>>): Array<[A, B]> {
  if (setAEntries.length === 0 || setBEntries.length === 0) return []

  const sortedAEntries = setAEntries.slice().sort((lhs, rhs) => lhs.aabb.minimum.x - rhs.aabb.minimum.x)
  const sortedBEntries = setBEntries.slice().sort((lhs, rhs) => lhs.aabb.minimum.x - rhs.aabb.minimum.x)

  const candidatePairs: Array<[A, B]> = []

  // Window start into B for the current A entry
  let bWindowStart = 0

  // Active window of B entries overlapping current A's min.x on X
  const activeBSet: Array<AABBEntry<B>> = []

  for (const aEntry of sortedAEntries) {
    // Expand the B window to include any B whose min.x is <= A's max.x
    while (bWindowStart < sortedBEntries.length && sortedBEntries[bWindowStart].aabb.minimum.x <= aEntry.aabb.maximum.x) {
      activeBSet.push(sortedBEntries[bWindowStart++])
    }

    // Prune Bs whose max.x is before A's min.x
    for (let i = activeBSet.length - 1; i >= 0; i--) {
      if (activeBSet[i].aabb.maximum.x < aEntry.aabb.minimum.x) activeBSet.splice(i, 1)
    }

    // Exact 3D AABB overlap for remaining active Bs
    for (const bEntry of activeBSet) {
      if (BoundingBox.intersect(aEntry.aabb, bEntry.aabb)) {
        candidatePairs.push([aEntry.item, bEntry.item])
      }
    }
  }

  return candidatePairs
}
