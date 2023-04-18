import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../redux-store'
import { useCallback, useEffect, useState } from "react"

//Typescript Redux Setup: https://react-redux.js.org/tutorials/typescript-quick-start

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function useStateFromProp(initialValue: unknown) {
    const [value, setValue] = useState(initialValue);
  
    useEffect(() => setValue(initialValue), [initialValue]);
  
    return [value, setValue];
  }

