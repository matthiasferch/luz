export class SceneSession<State> {
  private reloadRequest?: Promise<State>

  constructor(readonly url: string) {}

  reload(performReload: () => Promise<State>): Promise<State> {
    if (this.reloadRequest === undefined) {
      this.reloadRequest = performReload().finally(() => {
        this.reloadRequest = undefined
      })
    }

    return this.reloadRequest
  }
}
