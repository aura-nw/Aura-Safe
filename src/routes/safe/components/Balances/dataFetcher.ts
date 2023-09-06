import { List } from 'immutable'
import { TableColumn } from 'src/components/Table/types.d'
export const BALANCE_TABLE_ASSET_ID = 'asset'
export const BALANCE_TABLE_BALANCE_ID = 'balance'

export interface BalanceData {
  asset: { name: string; logoUri: string; address: string; symbol: string }
  assetOrder: string
  balance: string
  balanceOrder: number
  value: string
  valueOrder: number
}

export const generateColumns = (): List<TableColumn> => {
  const assetColumn: TableColumn = {
    id: BALANCE_TABLE_ASSET_ID,
    order: true,
    disablePadding: false,
    label: 'Name',
    custom: false,
    static: true,
    width: 300,
  }

  const balanceColumn: TableColumn = {
    id: BALANCE_TABLE_BALANCE_ID,
    align: 'right',
    order: true,
    disablePadding: false,
    label: 'Balance',
    custom: false,
    static: true,
  }

  const actions: TableColumn = {
    id: 'actions',
    order: false,
    disablePadding: false,
    label: '',
    custom: true,
    static: true,
  }

  /*   const value: TableColumn = {
    id: BALANCE_TABLE_VALUE_ID,
    align: 'right',
    order: true,
    label: 'Value',
    custom: false,
    static: true,
    disablePadding: false,
   }
*/
  return List([assetColumn, balanceColumn, /* value, */ actions])
}
