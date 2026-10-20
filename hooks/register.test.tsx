// Mod tests, run against the engine itself: `claude plugin test .`
import { expect, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On } from 'claude-code'

const ME = { kind: 'composer' } as const

/** What sits beneath the mod: the box, Haiku's answer, the toasts and the engine's own band. */
function world (on: On, reply = 'Fix the failing test in src/app.ts.') {
  const box = { text: '' }
  const asked: string[] = []
  const toasts: string[] = []
  on('prompt.read', () => ({ value: { text: box.text, cursor: box.text.length } }))
  on('prompt.fill', ($, e) => {
    box.text = e.mode === 'replace' ? e.text : box.text + e.text
    return { isFilled: true, text: box.text, cursor: box.text.length }
  })
  on('model.complete', ($, e) => {
    asked.push(e.prompt)
    return { value: { isAnswered: true, text: reply, usage: { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 } } } as never
  })
  on('ui.toast', ($, e) => {
    toasts.push(e.text)
    return { value: undefined }
  })
  on('state.get', ($, e, next) =>
    e.key === 'hasDraft' ? { value: { value: box.text.trim() !== '', version: 1 } } as never : next(e))
  on('ui.render', ($, e) => {
    const { Box } = $.ui.resolve(e)
    return <Box key="engine" />
  })
  return { box, asked, toasts }
}

/** The person types `text` into the box: the kit raises no `prompt.edit`, so the mod's mark is read from the box. */
const type = (w: { box: { text: string } }, text: string) => {
  w.box.text = text
}

const band = ($: Engine, surface: 'terminal' | 'desktop') =>
  $.ui.mount({
    plugin: 'better-prompt',
    surface,
    component: 'AbovePrompt',
    props: { hasSurvey: false, isWorking: false, maxRows: 20, bodyColumns: 80, scroll: { offset: 0, bodyRows: 20 }, view: {} },
  })

for (const surface of ['terminal', 'desktop'] as const) {
  test(`${surface}: Haiku's version replaces the draft only when Use is pressed`, async ($, on) => {
    const w = world(on)
    type(w, 'arregla el test que falla en src/app.ts porfa')
    const ui = await band($, surface)

    await ui.press({ key: 'rewrite' })
    expect(w.asked[0]).toContain('arregla el test que falla en src/app.ts porfa')
    expect(await ui.find({ type: 'Text', text: /Fix the failing test/ })).toBeDefined()
    expect((await ui.find({ type: 'Text', text: / in \/ / }))?.text).toBe('· rewrite cost: 10 in / 5 out  ')
    expect(w.box.text).toBe('arregla el test que falla en src/app.ts porfa')

    await ui.press({ key: 'use' })
    expect(w.box.text).toBe('Fix the failing test in src/app.ts.')
    expect(await ui.find({ type: 'Text', text: /Fix the failing test/ })).toBeUndefined()
    await ui.unmount()
  })

  test(`${surface}: Discard keeps the draft as typed`, async ($, on) => {
    const w = world(on)
    type(w, 'explica qué hace el script de propagate')
    const ui = await band($, surface)

    await ui.press({ key: 'rewrite' })
    await ui.press({ key: 'discard' })
    expect(w.box.text).toBe('explica qué hace el script de propagate')
    expect(await ui.find({ type: 'Text', text: /Haiku's version/ })).toBeUndefined()
    await ui.unmount()
  })
}

test('a draft too short is not sent to Haiku', async ($, on) => {
  const w = world(on)
  type(w, 'hola')
  const ui = await band($, 'terminal')

  await ui.press({ key: 'rewrite' })
  expect(w.asked).toEqual([])
  expect(w.toasts).toEqual(['✨ Write a little more first'])
  await ui.unmount()
})

test('with an empty box the band is the engine\'s', async ($, on) => {
  world(on)
  const ui = await band($, 'terminal')

  expect(await ui.find({ key: 'rewrite' })).toBeUndefined()
  expect(await ui.find({ key: 'engine' })).toBeDefined()
  await ui.unmount()
})
