import * as O from 'fp-ts/lib/Option'
import * as T from 'fp-ts/lib/Task'
import * as R from 'fp-ts-rxjs/lib/Observable'
import { pipe } from 'fp-ts/lib/pipeable'
import { Observable, merge, empty } from 'rxjs'

export type Cmd<msg> = Observable<T.Task<O.Option<msg>>>

export function map<a, msg>(cmd: Cmd<a>, f: (a: a) => msg): Cmd<msg> {
  return pipe(cmd, R.map(T.map(O.map(f))))
}

export function batch<msg>(arr: Array<Cmd<msg>>): Cmd<msg> {
  return merge(...arr)
}

export const none: Cmd<never> = empty()
