import { computed, effect, Injectable, Signal, signal, untracked, WritableSignal } from '@angular/core';
import { Observable, startWith, switchMap } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

type Triggers<T> = Partial<{ [P in keyof T]: WritableSignal<number> }>;
type Signals<T> = { [P in keyof T]: WritableSignal<T[P]> };
type SpecificKeysOfObj<T> = { [P in keyof T]: T[P] };
type SpecificKeysOfObjAsSignals<T> = { [P in keyof T]: Signal<T[P]> };

/**
 * Opinionated simple state
 * @DeveloperPreview: This feature is experimental and subject to change.
 */
@Injectable()
export class SignalState<T extends Record<string, unknown>> {
  private readonly notInitializedError =
    'Signal state is not initialized yet, call the initialize() method before using any other methods';
  private signals: Signals<T> | undefined;
  private triggers: Triggers<T> = {};

  /**
   * Initializes the state with initial values
   */
  public initialize<P extends keyof T>(state: T): void {
    const signals: Partial<Signals<T>> = {};
    (Object.keys(state) as P[]).forEach((key) => (signals[key] = signal<T[P]>(state[key])));
    this.signals = signals as Signals<T>;
  }

  /**
   * Throws an error when the state is not initialized.
   * Selects one piece of the state
   * @param key: the key that is related to the piece of state we want to consume
   * @param cb: (Optional) The callback function that will calculate the computed signal
   */
  public select<K extends keyof T>(key: K): Signal<T[K]>;
  public select<K extends keyof T, P>(key: K, cb: (state: T[K]) => P): Signal<P>;
  public select<K extends keyof T, P>(key: K, cb?: (state: T[K]) => P): Signal<T[K] | P> {
    return computed(() => {
      const state = this.throwOrReturnSignals()[key]() as T[K];
      return cb ? (cb(state) as P) : (state as T[K]);
    });
  }

  /**
   * Throws an error when the state is not initialized.
   * Creates a computed signal based on pieces of state (signals)
   * @param keys: The keys that are related to the pieces of state we want to consume
   * @param cb: (Optional) The callback function that will calculate the computed signal
   */
  public selectMany(keys: (keyof T)[]): Signal<SpecificKeysOfObj<T>>;
  public selectMany<P>(keys: (keyof T)[], cb: (obj: SpecificKeysOfObj<T>) => P): Signal<P>;
  public selectMany<P>(keys: (keyof T)[], cb?: (obj: SpecificKeysOfObj<T>) => P): Signal<P | SpecificKeysOfObj<T>> {
    return computed(() => {
      const state = keys.reduce((obj, key) => {
        obj[key] = this.throwOrReturnSignals()[key]();
        return obj;
      }, {} as Partial<SpecificKeysOfObj<T>>) as SpecificKeysOfObj<T>;
      return cb ? (cb(state) as P) : (state as SpecificKeysOfObj<T>);
    });
  }

  /**
   * Throws an error when the state is not initialized.
   * Returns an object where every property is a signal.
   * This method is ideal to pick pieces of state from somewhere else
   * @param keys: The keys that are related to the pieces of state we want to pick
   */
  public pick<P extends keyof T>(keys: (keyof T)[]): SpecificKeysOfObjAsSignals<T> {
    return keys.reduce((obj, key) => {
      obj[key] = this.throwOrReturnSignals()[key];
      return obj;
    }, {} as Partial<SpecificKeysOfObjAsSignals<T>>) as SpecificKeysOfObjAsSignals<T>;
  }

  /**
   * Throws an error when the state is not initialized.
   * Connects a partial state object where every property is a signal to the state
   * This will automatically feed the state whenever one of the signals changes
   * @param object: The object holding the signals where we want to listen to
   */
  public connect(object: Partial<{ [P in keyof T]: Signal<T[P]> }>): void {
    this.throwOrReturnSignals();
    Object.keys(object).forEach((key: keyof T) => {
      effect(() => this.patch({ [key]: (object[key] as Signal<keyof T>)() } as Partial<T>), {
        allowSignalWrites: true,
      });
    });
  }

  /**
   * Throws an error when the state is not initialized.
   * Connects a partial state object where every property is a signal to the state
   * This will automatically feed the state whenever one of the observables changes
   * When the trigger() method is called, the producer function of the observables will get triggered again.
   * This is ideal for refreshing xhr calls (reloading data)
   * @param object
   */
  public connectObservables(object: Partial<{ [P in keyof T]: Observable<T[P]> }>): void {
    this.throwOrReturnSignals();
    Object.keys(object).forEach((key: keyof T) => {
      this.triggers[key] ||= signal(0);
      const obs$ = object[key] as Observable<T[keyof T]>;
      toObservable(this.triggers[key] as WritableSignal<number>)
        .pipe(
          startWith(),
          switchMap(() => obs$),
          takeUntilDestroyed(),
        )
        .subscribe((v: Partial<T>[keyof Partial<T>]) => {
          this.patch({ [key]: v } as Partial<T>);
        });
    });
  }

  /**
   * Patches the state with a partial object. This will loop through all the state signals and update
   * them one by one
   */
  public patch<P extends keyof T>(object: Partial<T>): void {
    (Object.keys(object) as P[]).forEach((key: P) => this.throwOrReturnSignals()[key].set(object[key] as T[P]));
  }

  /**
   * Returns the state as a signal
   */
  public state = computed(() => {
    const signals = this.throwOrReturnSignals();
    return Object.keys(signals).reduce((obj, key: keyof T) => {
      obj[key] = signals[key]();
      return obj;
    }, {} as Partial<T>) as T;
  });

  /**
   * Triggers a trigger if the observable of the producer function we want to retrigger
   * is registered through the connectObservables method
   * @param key
   */
  public trigger(key: keyof T): void {
    if (!this.triggers[key]) {
      throw new Error(
        'There is no trigger registered for this key. Please use connectObservables to register the triggers',
      );
    }
    (this.triggers[key] as WritableSignal<number>).update((v) => v + 1);
  }

  /**
   * Returns the state as a snapshot
   */
  public get snapshot(): T {
    return untracked(() => this.state());
  }

  private throwOrReturnSignals(): Signals<T> {
    if (!this.signals) {
      throw new Error(this.notInitializedError);
    }
    return this.signals as Signals<T>;
  }
}
