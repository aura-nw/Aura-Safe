import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableRow from '@material-ui/core/TableRow'
import cn from 'classnames'
import { ReactElement, useEffect } from 'react'

import { OWNERS_TABLE_ADDRESS_ID, generateColumns, getOwnerData } from './dataFetcher'
import { useStyles } from './style'

import PrefixedEthHashInfo from 'src/components/PrefixedEthHashInfo'
import Table from 'src/components/Table'
import { cellWidth } from 'src/components/Table/TableHead'
import Block from 'src/components/layout/Block'
import Heading from 'src/components/layout/Heading'
import Paragraph from 'src/components/layout/Paragraph/index'
import { getExplorerInfo } from 'src/config'
import { AddressBookState } from 'src/logic/addressBook/model/addressBook'
import { SETTINGS_EVENTS, useAnalytics } from 'src/utils/googleAnalytics'

export const RENAME_OWNER_BTN_TEST_ID = 'rename-owner-btn'
export const REMOVE_OWNER_BTN_TEST_ID = 'remove-owner-btn'
export const ADD_OWNER_BTN_TEST_ID = 'add-owner-btn'
export const REPLACE_OWNER_BTN_TEST_ID = 'replace-owner-btn'
export const OWNERS_ROW_TEST_ID = 'owners-row'

type Props = {
  granted: boolean
  owners: AddressBookState
}

const ManageOwners = ({ granted, owners }: Props): ReactElement => {
  const { trackEvent } = useAnalytics()
  const classes = useStyles()

  useEffect(() => {
    trackEvent(SETTINGS_EVENTS.OWNERS)
  }, [trackEvent])

  const columns = generateColumns()
  const autoColumns = columns.filter((c) => !c.custom)
  const ownerData = getOwnerData(owners)

  return (
    <>
      <Block className={classes.formContainer}>
        <Heading className={classes.title} tag="h2">
          Manage Safe Owners
        </Heading>
        <Paragraph className={classes.annotation}>
          Add, remove and replace owners or rename existing owners. Owner names are only stored locally and never shared
          with Pyxis Safe or any third parties.
        </Paragraph>
        <TableContainer>
          <Table
            columns={columns}
            data={ownerData}
            defaultFixed
            defaultOrderBy={OWNERS_TABLE_ADDRESS_ID}
            disablePagination
            label="Owners"
            noBorder
            size={ownerData.length}
          >
            {(sortedData) =>
              sortedData.map((row, index) => (
                <TableRow
                  className={cn(
                    classes.hide,
                    index >= 3 && index === sortedData.size - 1 && classes.noBorderBottom,
                    classes.tr,
                  )}
                  data-testid={OWNERS_ROW_TEST_ID}
                  key={index}
                >
                  {autoColumns.map((column: any) => (
                    <TableCell align={column.align} component="td" key={column.id} style={cellWidth(column.width)}>
                      {column.id === OWNERS_TABLE_ADDRESS_ID ? (
                        <Block justify="left">
                          <PrefixedEthHashInfo
                            hash={row[column.id]}
                            showCopyBtn
                            showAvatar
                            explorerUrl={getExplorerInfo(row[column.id])}
                          />
                        </Block>
                      ) : (
                        row[column.id]
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            }
          </Table>
        </TableContainer>
      </Block>
    </>
  )
}

export default ManageOwners
