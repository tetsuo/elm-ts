import * as O from 'fp-ts/lib/Option'
import * as T from 'fp-ts/lib/Task'
import * as IO from 'fp-ts/lib/IO'
import { Subject, of } from 'rxjs'
import * as Rx from 'fp-ts-rxjs/lib/Observable'
import { Cmd } from './cmd'
import { Sub, none, batch } from './sub'
import * as html from './html'
import { Location as HistoryLocation, createBrowserHistory } from 'history'

export type Location = HistoryLocation

export function pushHistory<msg>(url: string): Cmd<msg> {
  return of(
    T.fromIO(
      IO.io.map(
        () => history.push(url),
        () => O.none
      )
    )
  )
}

export function program<model, msg, dom>(
  locationToMessage: (location: Location) => msg,
  init: (location: Location) => [model, Cmd<msg>],
  update: (msg: msg, model: model) => [model, Cmd<msg>],
  view: (model: model) => html.Html<dom, msg>,
  subscriptions: (model: model) => Sub<msg> = () => none
): html.Program<model, msg, dom> {
  const onChangeLocation$ = Rx.map((location: Location) => locationToMessage(location))(location$)
  const subs = (model: model): Sub<msg> => batch([subscriptions(model), onChangeLocation$])
  return html.program(init(history.location), update, view, subs)
}

/**
 * @instance
 */
const location$ = new Subject<Location>()

/**
 * @instance
 */
const history = createBrowserHistory()

history.listen(location => {
  location$.next(location)
})
