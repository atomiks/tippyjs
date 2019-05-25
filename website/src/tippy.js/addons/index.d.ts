import { Instance, Targets, Props } from '..'

export type Delegate = (
  targets: Targets,
  partialProps: Partial<Props> & { target: string },
) => Instance | Instance[] | null

export type CreateSingleton = (
  tippyInstances: Instance[],
  props?: { delay: number | [number, number] },
) => Instance

declare const delegate: Delegate
declare const createSingleton: CreateSingleton

export { delegate, createSingleton }
