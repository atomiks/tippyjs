import { Instance, Targets, Options } from '..'

export interface Delegate {
  (targets: Targets, options: Options & { target: string }):
    | Instance
    | Instance[]
    | null
}

export interface CreateSingleton {
  (
    tippyInstances: Instance[],
    options?: { delay: number | [number, number] },
  ): Instance
}

declare const delegate: Delegate
declare const createSingleton: CreateSingleton

export { delegate, createSingleton }
