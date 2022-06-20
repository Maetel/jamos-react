import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'

import procReducer from '../features/procmgr/procSlice';
import logReducer from '../features/log/logSlice';
import fileReducer from '../features/file/fileSlice';
import settingsReducer from '../features/settings/settingsSlice';

export function makeStore() {
  return configureStore({
    reducer: { 
      proc: procReducer,
      log: logReducer,
      file: fileReducer,
      settings: settingsReducer,
    },
  })
}

const store = makeStore()

export type AppState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>

export default store