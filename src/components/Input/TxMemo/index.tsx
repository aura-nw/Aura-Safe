import TextField from '../TextField'

type Props = {
  txMemo: string
  setTxMemo: React.Dispatch<React.SetStateAction<string>>
}
const TxMemo = ({ txMemo, setTxMemo }: Props) => {
  return (
    <TextField placeholder="Transaction memo (optional)" label="Transaction memo" value={txMemo} onChange={setTxMemo} />
  )
}

export default TxMemo
