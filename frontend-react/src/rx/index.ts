import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';

// export const useObservable = <T>(maker: () => Observable<T>, initValue: T) => {
//   let value: T, setValue: Dispatch<SetStateAction<T>>;
//   const [initialState, subscription] = useMemo(() => {
//     let initialState = initValue;
//     const source = maker();
//     let setter = (v: T) => {
//       if (!setValue) {
//         initialState = v;
//       } else {
//         setValue(v);
//         setter = setValue;
//       }
//     };
//     const subscription = source.subscribe((v) => setter(v));

//     return [initialState, subscription] as [T, Subscription];
//   }, [initValue, maker, setValue]);

//   [value, setValue] = useState(initialState);

//   useEffect(() => () => subscription.unsubscribe(), [subscription]);

//   return value;
// };

export const useEventHandler = <Event>(
  defaultHandler?: (source: Observable<Event>) => Subscription | void
) => {
  const subject = useMemo(() => new Subject<Event>(), []);
  const callback = useCallback((e: Event) => subject.next(e), [subject]);
  useEffect(() => {
    if (defaultHandler instanceof Array) {
      defaultHandler(subject);
    }
    return () => subject.complete();
  }, [defaultHandler, subject]);
  return [callback, subject] as [typeof callback, Subject<Event>];
};

export const useBehaviorSubject = <T>(initValue: T) => {
  const subject = useMemo(() => new BehaviorSubject(initValue), [initValue]);

  useEffect(() => () => subject.complete(), [subject]);
  return subject;
};

export const useSubject = <T>() => {
  const subject = useMemo(() => new Subject<T>(), []);

  useEffect(() => () => subject.complete(), [subject]);
  return subject;
};

export const useObservableFrom = <T>(inputs: T) => {
  const subject$ = useBehaviorSubject(inputs);
  useMemo(() => subject$.next(inputs), [inputs, subject$]);
  return useMemo(() => subject$.asObservable(), [subject$]);
};

export const useWhenLayout = <T>(builder: () => T) => {
  const subject = useMemo(() => new Subject<T>(), []);
  useLayoutEffect(() => subject.next(builder()));
  useEffect(() => () => subject.complete(), [subject]);
  return subject;
};

export const useListener = (subscriptionMaker: () => Subscription) => {
  const subscription = useMemo(subscriptionMaker, []);
  useEffect(() => () => subscription.unsubscribe(), [subscription]);
};
