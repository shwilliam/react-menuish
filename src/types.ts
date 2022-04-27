export type SelectivePartial<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>

export type Require<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
