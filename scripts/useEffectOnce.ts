import { useEffect, useRef, useState } from "react"

//https://dev.to/ag-grid/react-18-avoiding-use-effect-getting-called-twice-4i9e
export default function useEffectOnce(effect) {
  const effectFn = useRef(effect)
  const destroyFn = useRef(null)
  const effectCalled = useRef(false)
  const rendered = useRef(false)
  const [, refresh] = useState(0)

  if (effectCalled.current) {
    rendered.current = true
  }

  useEffect(() => {
    if (!effectCalled.current) {
      destroyFn.current = effectFn.current()
      effectCalled.current = true
    }

    refresh(1)

    return () => {
      if (rendered.current === false) {return;}
      if (destroyFn.current) {
        destroyFn.current();
      }
    }
  }, [])
}