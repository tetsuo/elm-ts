import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as R from 'fp-ts-rxjs/lib/Observable'
import { Observable, BehaviorSubject } from 'rxjs'
import { distinctUntilChanged, mergeAll, share, startWith, switchMap } from 'rxjs/operators'
import { Cmd } from './cmd'
import { Sub, none } from './sub'

export interface Dispatch<msg> {
  (msg: msg): void
}

export interface Program<model, msg> {
  dispatch: Dispatch<msg>
  cmd$: Cmd<msg>
  sub$: Sub<msg>
  model$: Observable<model>
}

function modelCompare<A, B>(x: [A, B], y: [A, B]): boolean {
  return x === y || x[0] === y[0]
}

function cmdCompare<A, B>(x: [A, B], y: [A, B]): boolean {
  return x === y || x[1] === y[1]
}

export function program<model, msg>(
  init: [model, Cmd<msg>],
  update: (msg: msg, model: model) => [model, Cmd<msg>],
  subscriptions: (model: model) => Sub<msg> = () => none
): Program<model, msg> {
  const state$ = new BehaviorSubject(init)
  const dispatch: Dispatch<msg> = msg => state$.next(update(msg, state$.value[0]))
  const cmd$ = pipe(
    state$,
    distinctUntilChanged(cmdCompare),
    R.map(state => state[1]),
    mergeAll()
  )
  const model$ = pipe(
    state$,
    distinctUntilChanged(modelCompare),
    R.map(state => state[0]),
    share()
  )
  const sub$ = pipe(model$, startWith(init[0]), switchMap(subscriptions))
  return { dispatch, cmd$, sub$, model$ }
}

export function programWithFlags<flags, model, msg>(
  init: (flags: flags) => [model, Cmd<msg>],
  update: (msg: msg, model: model) => [model, Cmd<msg>],
  subscriptions: (model: model) => Sub<msg> = () => none
): (flags: flags) => Program<model, msg> {
  return flags => program(init(flags), update, subscriptions)
}

export function run<model, msg>(program: Program<model, msg>): Observable<model> {
  const { dispatch, cmd$, sub$, model$ } = program
  cmd$.subscribe(task => task().then(O.map(dispatch)))
  sub$.subscribe(dispatch)
  return model$
}
