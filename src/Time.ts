import { Task } from 'fp-ts/lib/Task'
import { pipe } from 'fp-ts/lib/pipeable'
import * as O from 'fp-ts-rxjs/lib/Observable'
import { interval } from 'rxjs'
import { Sub } from './Sub'

export type Time = number

export function now(): Task<Time> {
  return () => Promise.resolve(new Date().getTime())
}

export function every<msg>(time: Time, f: (time: Time) => msg): Sub<msg> {
  return pipe(
    interval(time),
    O.map(() => f(new Date().getTime()))
  )
}
