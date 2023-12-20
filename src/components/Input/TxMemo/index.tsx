import TextField from '../TextField'

type Props = {
  txMemo: string
  setTxMemo: React.Dispatch<React.SetStateAction<string>>
  disabled?: boolean
}
const TxMemo = ({ txMemo, setTxMemo, disabled }: Props) => {
  return (
    <TextField
      disabled={disabled}
      placeholder="Transaction memo (optional)"
      label="Transaction memo"
      value={txMemo}
      onChange={setTxMemo}
    />
  )
}

export default TxMemo
