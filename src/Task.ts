import * as T from 'fp-ts/lib/Task'
import * as A from 'fp-ts/lib/Array'
import { Task, task } from 'fp-ts/lib/Task'
import { some } from 'fp-ts/lib/Option'
import { Either } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import { observable } from 'fp-ts-rxjs/lib/Observable'
import { Cmd } from './Cmd'

export { Task }

const sequenceTasks = A.array.sequence(task)

export function perform<a, msg>(task: Task<a>, f: (a: a) => msg): Cmd<msg> {
  return observable.of(
    pipe(
      task,
      T.map(a => some(f(a)))
    )
  )
}

export function sequence<a>(tasks: Array<Task<a>>): Task<Array<a>> {
  return sequenceTasks(tasks)
}

export function attempt<e, a, msg>(task: Task<Either<e, a>>, f: (e: Either<e, a>) => msg): Cmd<msg> {
  return perform(task, f)
}

export type RetryOptions = {
  delay: number
  maxDelay: number
  retries: number
}
