import { useHistory } from 'react-router-dom'

import { useSafeAppUrl } from 'src/logic/hooks/useSafeAppUrl'

const Apps = (): React.ReactElement => {
  const history = useHistory()
  const { getAppUrl } = useSafeAppUrl()
  const url = getAppUrl()

  const goBack = () => history.goBack()

  if (url) {
    return <></>
  } else {
    return <></>
  }
}

export default Apps
