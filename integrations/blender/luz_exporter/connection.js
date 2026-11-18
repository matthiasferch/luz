const studioOrigin = 'https://studio.luzjs.dev'
const studioWindow = window.opener

const startConnection = async (event) => {
  if (
    event.origin !== studioOrigin ||
    event.source !== studioWindow ||
    !event.ports[0] ||
    typeof event.data?.ticket !== 'string'
  ) {
    return
  }

  window.removeEventListener('message', startConnection)

  const port = event.ports[0]

  try {
    const pairing = await fetch('/pair', { method: 'POST', headers: { Authorization: 'Bearer ' + event.data.ticket } })

    if (!pairing.ok) {
      throw new Error('Pairing expired. Choose Open in luz in Blender again.')
    }

    const { credential, ticket } = await pairing.json()

    port.postMessage({ type: 'paired', ticket })

    const readFile = async (path) => {
      const response = await fetch('/' + path, {
        headers: { Authorization: 'Bearer ' + credential },
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error('The export changed during transfer')
      }

      return response
    }

    let revision
    let previousFiles = new Map()

    while (!studioWindow.closed) {
      const state = await (await readFile('state.json')).json()

      if (state.error) {
        port.postMessage({ type: 'message', message: state.error })
      } else if (state.revision !== revision) {
        const files = new Map()

        try {
          for (const file of state.files) {
            const contents = previousFiles.get(file.digest) ?? (await (await readFile(file.digest)).blob())

            files.set(file.digest, contents)
          }
        } catch (error) {
          const latestState = await (await readFile('state.json')).json()

          if (latestState.revision !== state.revision) {
            continue
          }

          throw error
        }

        port.postMessage({ type: 'snapshot', state, files })

        previousFiles = files
        revision = state.revision
      }

      await new Promise((resolve) => window.setTimeout(resolve, 1000))
    }
  } catch (error) {
    port.postMessage({ type: 'disconnected', message: error.message })
  }
}

if (studioWindow) {
  window.addEventListener('message', startConnection)
  studioWindow.postMessage({ type: 'luzConnection' }, studioOrigin)
}
