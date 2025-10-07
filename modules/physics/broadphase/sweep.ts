import { AABB } from './aabb'

export type AABBEntry<T> = { item: T; aabb: AABB }

// Sweep-and-prune along X axis, generating candidate pairs within the same set.
export function sweepAndPrunePairs<T>(entries: Array<AABBEntry<T>>): Array<[T, T]> {
  if (entries.length <= 1) return []
  const sorted = entries.slice().sort((a, b) => a.aabb.min.x - b.aabb.min.x)
  const active: Array<AABBEntry<T>> = []
  const pairs: Array<[T, T]> = []

  for (const e of sorted) {
    for (let i = active.length - 1; i >= 0; i--) {
      if (active[i].aabb.max.x < e.aabb.min.x) active.splice(i, 1)
    }
    for (const cand of active) {
      if (AABB.overlap(e.aabb, cand.aabb)) pairs.push([e.item, cand.item])
    }
    active.push(e)
  }
  return pairs
}

// Sweep-and-prune along X axis for pairs across two sets.
export function sweepAndPrunePairsAB<A, B>(aEntries: Array<AABBEntry<A>>, bEntries: Array<AABBEntry<B>>): Array<[A, B]> {
  if (aEntries.length === 0 || bEntries.length === 0) return []
  const aSorted = aEntries.slice().sort((a, b) => a.aabb.min.x - b.aabb.min.x)
  const bSorted = bEntries.slice().sort((a, b) => a.aabb.min.x - b.aabb.min.x)

  const pairs: Array<[A, B]> = []
  let bStart = 0
  const active: Array<AABBEntry<B>> = []

  for (const ae of aSorted) {
    while (bStart < bSorted.length && bSorted[bStart].aabb.min.x <= ae.aabb.max.x) {
      active.push(bSorted[bStart++])
    }
    for (let i = active.length - 1; i >= 0; i--) {
      if (active[i].aabb.max.x < ae.aabb.min.x) active.splice(i, 1)
    }
    for (const be of active) {
      if (AABB.overlap(ae.aabb, be.aabb)) pairs.push([ae.item, be.item])
    }
  }

  return pairs
}
