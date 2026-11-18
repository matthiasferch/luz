import { flushPromises, mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import UserScenes from '../src/studio/UserScenes.vue'

it('offers sign-in and refreshes the picker when the publisher returns', async () => {
  const request = vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(new Response(null, { status: 401 }))
    .mockResolvedValueOnce(
      Response.json([
        { id: 'active', title: 'Courtyard', isPublished: 1 },
        { id: 'withdrawn', title: 'Garden', isPublished: 0 }
      ])
    )
  const picker = mount(UserScenes, { props: { activeSceneId: 'active' } })

  try {
    await flushPromises()
    expect(picker.get('a').attributes()).toMatchObject({ href: '/scenes', target: '_blank' })
    window.dispatchEvent(new Event('focus'))

    await flushPromises()
    expect(request).toHaveBeenCalledTimes(2)

    const [courtyard, garden] = picker.findAll('[role="option"]')

    expect(courtyard.attributes('aria-selected')).toBe('true')
    expect(garden.attributes('disabled')).toBeDefined()
    expect(garden.text()).toContain('Unpublished')

    await courtyard.trigger('click')
    expect(picker.emitted('select')).toEqual([['active']])
  } finally {
    picker.unmount()
  }
})
it('allows retrying a failed listing independently of the demo catalog', async () => {
  vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce(Response.json([]))

  const picker = mount(UserScenes, { props: { activeSceneId: null } })

  try {
    await flushPromises()
    expect(picker.text()).toContain('Couldn’t load your scenes')

    await picker.get('button').trigger('click')

    await flushPromises()
    expect(picker.text()).toContain('haven’t published any scenes')
  } finally {
    picker.unmount()
  }
})
