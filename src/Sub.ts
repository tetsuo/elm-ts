import * as O from 'fp-ts-rxjs/lib/Observable'
import { pipe } from 'fp-ts/lib/pipeable'
import { merge, Observable, empty } from 'rxjs'

export type Sub<msg> = Observable<msg>

export function map<a, msg>(sub: Sub<a>, f: (a: a) => msg): Sub<msg> {
  return pipe(sub, O.map(f))
}

export function batch<msg>(arr: Array<Sub<msg>>): Sub<msg> {
  return merge(...arr)
}

export const none: Sub<never> = empty()
