import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { currentChainId } from 'src/logic/config/store/selectors'
import { fetchMSafe } from 'src/logic/safe/store/actions/fetchSafe'
import { SAFE_POLLING_INTERVAL } from 'src/utils/constants'

export const useSafeScheduledUpdates = (safeAddress?: string, safeId?: number): void => {
  const dispatch = useDispatch()
  const [pollCount, setPollCount] = useState<number>(0)
  const chainId = useSelector(currentChainId)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (safeAddress && safeId) {
        dispatch(fetchMSafe(safeAddress, safeId))
        // dispatch(fetchSafe(safeAddress))
        // dispatch(fetchSafeTokens(safeAddress))
      }
      setPollCount((prev) => prev + 1)
    }, SAFE_POLLING_INTERVAL)

    return () => {
      clearTimeout(timer)
    }
  }, [dispatch, safeAddress, chainId, pollCount, setPollCount, safeId])
}
