export abstract class Component {

  readonly type: Component.Type

  toJSON() {
    const { type } = this

    return { type }
  }

}

export module Component {

  export enum Type {
    Body = 'body',
    Model = 'model'
  }

}