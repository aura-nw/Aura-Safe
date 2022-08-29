import React, { ReactElement } from 'react'

import Col from 'src/components/layout/Col'
import styled from 'styled-components'
import { StyledTableCell, StyledTableRow } from 'src/components/TableVoting'
import TableVoting from 'src/components/TableVoting'
import { Text, Button } from '@aura/safe-react-components'
import AppBar from '@material-ui/core/AppBar'
import TabPanel, { a11yProps } from 'src/components/TabPanel'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { makeStyles } from '@material-ui/core/styles'
import { borderLinear } from 'src/theme/variables'

const TitleStyled = styled.div`
  font-weight: 510;
  font-size: 20px;
  line-height: 26px;
  color: rgba(255, 255, 255, 1);
`

const useStyles = makeStyles({
  root: {
    backgroundColor: 'transparent',
    marginTop: 10,
    boxShadow: 'none',
  },
})

const RowHead = [
  { name: 'RANK' },
  { name: 'VALIDATOR' },
  { name: 'VOTING POWER' },
  { name: 'COMMISION' },
  { name: 'PARTICIPATION' },
  { name: 'UPTIME' },
  { name: ' ' },
]

const RowData = [
  {
    id: 'aura81...818hsbcasc',
    title: '1782GSAW...DHF1HG13',
    status: 'Yes',
    voting: '2022-01-09 | 07:55:02',
  },
  {
    id: 'aura81...818hsbcasc',
    title: '1782GSAW...DHF1HG13',
    status: 'Yes',
    voting: '2022-01-09 | 07:55:02',
  },
]

const StyledButton = styled(Button)`
  border: 2px solid transparent;
  background-image: ${borderLinear};
  background-origin: border-box;
  background-clip: content-box, border-box;
  border-radius: 50px !important;
  padding: 0 !important;
  background-color: transparent !important;
  min-width: 130px !important;
`

const TableVotingDetailInside = () => {
  return (
    <TableVoting RowHead={RowHead}>
      {RowData.map((row) => (
        <StyledTableRow key={row.id}>
          <StyledTableCell component="th" scope="row">
            {row.id}
          </StyledTableCell>
          <StyledTableCell align="left">
            <Text size="lg" color="linkAura">
              {row.title}
            </Text>
          </StyledTableCell>
          <StyledTableCell align="left">{row.status}</StyledTableCell>
          <StyledTableCell align="left">{row.status}</StyledTableCell>
          <StyledTableCell align="left">{row.status}</StyledTableCell>
          <StyledTableCell align="left">{row.status}</StyledTableCell>
          <StyledTableCell align="right">
            <StyledButton size="md" onClick={() => {}}>
              <Text size="lg" color="white">
                Manage
              </Text>
            </StyledButton>
          </StyledTableCell>
        </StyledTableRow>
      ))}
    </TableVoting>
  )
}

function Validators(props): ReactElement {
  const [value, setValue] = React.useState(0)
  const classes = useStyles()
  const handleChange = (event, newValue) => {
    setValue(newValue)
  }
  return (
    <>
      <Col start="sm" sm={12} xs={12}>
        <TitleStyled>Depositors</TitleStyled>
      </Col>

      <AppBar position="static" className={classes.root}>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="scrollable auto tabs example"
          centered
        >
          <Tab label="ACTIVE" {...a11yProps(0)} />
          <Tab label="INACTIVE" {...a11yProps(1)} />
        </Tabs>
      </AppBar>

      <TabPanel value={value} index={0}>
        <TableVotingDetailInside />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <TableVotingDetailInside />
      </TabPanel>
    </>
  )
}

export default Validators