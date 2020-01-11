import 'rxjs/add/observable/of'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/skip'
import 'rxjs/add/operator/take'
import * as O from 'fp-ts/lib/Option'
import { Subject } from 'rxjs'
import * as Rx from 'fp-ts-rxjs/lib/Observable'
import { Cmd } from './Cmd'
import { Sub, none, batch } from './Sub'
import * as html from './Html'
import { Location as HistoryLocation, createBrowserHistory } from 'history'

const history = createBrowserHistory()

const location$ = new Subject<Location>()

export type Location = HistoryLocation

function getLocation(): Location {
  return history.location
}

history.listen(location => {
  location$.next(location)
})

export function pushHistory<msg>(url: string): Cmd<msg> {
  return Rx.observable.of(() => {
    history.push(url)
    return Promise.resolve(O.none)
  })
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
  return html.program(init(getLocation()), update, view, subs)
}
