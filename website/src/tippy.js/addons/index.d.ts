import { Instance, Targets, Props } from '..'

export type Delegate = (
  targets: Targets,
  props: Partial<Props> & { target: string },
) => Instance | Instance[]

export type CreateSingleton = (
  tippyInstances: Instance[],
  optionalProps?: { delay: number | [number, number] },
) => Instance

declare const delegate: Delegate
declare const createSingleton: CreateSingleton

export { delegate, createSingleton }
