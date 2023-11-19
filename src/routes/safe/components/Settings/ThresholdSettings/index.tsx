import { makeStyles } from '@material-ui/core/styles'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import Block from 'src/components/layout/Block'
import Bold from 'src/components/layout/Bold'
import Heading from 'src/components/layout/Heading'
import Paragraph from 'src/components/layout/Paragraph'
import { currentSafe } from 'src/logic/safe/store/selectors'
import { SETTINGS_EVENTS, useAnalytics } from 'src/utils/googleAnalytics'

import { styles } from './style'

const useStyles = makeStyles(styles)

const ThresholdSettings = (): React.ReactElement => {
  const classes = useStyles()
  const { owners, threshold = 1 } = useSelector(currentSafe) ?? {}

  const { trackEvent } = useAnalytics()

  useEffect(() => {
    trackEvent(SETTINGS_EVENTS.OWNERS)
  }, [trackEvent])

  return (
    <>
      <Block className={classes.container}>
        <Heading tag="h2">Required Confirmations</Heading>
        <Paragraph>Any transaction requires the confirmation of:</Paragraph>
        <Paragraph className={classes.ownersText} size="lg">
          <Bold>{threshold}</Bold> out of <Bold>{owners?.length || 0}</Bold> owners
        </Paragraph>
      </Block>
    </>
  )
}

export default ThresholdSettings
