type Dated = { createdAt?: Date | string | null }

const createdTime = (x: Dated) => (x.createdAt ? new Date(x.createdAt).getTime() : -Infinity)

/** Sort comparator: most recently created first; items without `createdAt` last. */
export const byNewest = (a: Dated, b: Dated): number => createdTime(b) - createdTime(a)
