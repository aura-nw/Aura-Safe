import { ReactElement, useEffect, useState } from 'react'
import { Redirect, Route, Switch, useHistory } from 'react-router-dom'
import Icon from 'src/assets/icons/ChartBar.svg'
import Breadcrumb from 'src/components/Breadcrumb'
import Tabs from 'src/components/Tabs/NormalTab'
import Tab from 'src/components/Tabs/NormalTab/Tab'
import { SAFE_ROUTES, extractPrefixedSafeAddress, generateSafeRoute } from 'src/routes/routes'
import HistoryTransactions from './History'
import QueueTransactions from './Queue'
import { ContentWrapper, Wrapper } from './styled'

const Transactions = (): ReactElement => {
  const history = useHistory()
  const [tab, setTab] = useState(0)

  useEffect(() => {
    if (history.location.pathname.includes('queue')) {
      setTab(0)
    } else {
      setTab(1)
    }
  }, [history.location.pathname])

  const onTabChange = (path: string) => {
    history.replace(generateSafeRoute(path, extractPrefixedSafeAddress()))
  }

  return (
    <Wrapper>
      <Breadcrumb title="Transactions" subtitleIcon={Icon} subtitle="Transactions" />
      <Tabs
        value={tab}
        onChange={(e, v) => {
          setTab(v)
          switch (v) {
            case 0:
              onTabChange(SAFE_ROUTES.TRANSACTIONS_QUEUE)
              break
            case 1:
              onTabChange(SAFE_ROUTES.TRANSACTIONS_HISTORY)
              break
          }
        }}
      >
        <Tab label="Queue" />
        <Tab label="History" />
      </Tabs>
      <ContentWrapper>
        <Switch>
          <Route exact path={SAFE_ROUTES.TRANSACTIONS_QUEUE} render={() => <QueueTransactions />} />
          <Route exact path={SAFE_ROUTES.TRANSACTIONS_HISTORY} render={() => <HistoryTransactions />} />
          <Redirect to={SAFE_ROUTES.TRANSACTIONS_HISTORY} />
        </Switch>
      </ContentWrapper>
    </Wrapper>
  )
}

export default Transactions
