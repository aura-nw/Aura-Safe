import { ReactElement } from 'react'
import styled from 'styled-components'

import { withStyles, makeStyles } from '@material-ui/core/styles'

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Pagination from '@material-ui/lab/Pagination'

export const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: '#363843',
    color: '#9DA1AC',
    fontSize: 12,
    fontWeight: 590,
    padding: 5,
    letterSpacing: 0,
    lineHeight: 1,
  },
  body: {
    fontSize: 14,
    padding: 5,
    color: '#E5E7EA',
    borderTop: '1px solid #363843',
  },
}))(TableCell)

export const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      //   borderTop: '1px solid #363843',
    },
  },
}))(TableRow)

const useStyles = makeStyles({
  table: {
    minWidth: 700,
    marginTop: 20,
    borderBottom: '1px solid #363843',
  },
  pagi: {
    display: 'flex',
    marginTop: 20,
    justifyContent: 'flex-end',
    color: 'white',
  },
})

function TableVoting(props): ReactElement {
  const { RowHead, children } = props
  const classes = useStyles()

  return (
    <>
      <TableContainer>
        <Table className={classes.table} aria-label="customized table">
          <TableHead>
            <TableRow>
              {RowHead.map((item, index) => {
                return (
                  <StyledTableCell key={index} align="left">
                    {item.name}
                  </StyledTableCell>
                )
              })}
            </TableRow>
          </TableHead>
          <TableBody>{children}</TableBody>
        </Table>
        <Pagination className={classes.pagi} count={5} shape="rounded" showFirstButton showLastButton />
      </TableContainer>
    </>
  )
}

export default TableVoting