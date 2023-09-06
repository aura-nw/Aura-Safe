import { ReactElement, useState } from 'react'
import { useDispatch } from 'react-redux'
import Icon from 'src/assets/icons/FileText.svg'
import Breadcrumb from 'src/components/Breadcrumb'
import { FilledButton } from 'src/components/Button'
import Loader from 'src/components/Loader'
import { enhanceSnackbarForAction } from 'src/logic/notifications'
import enqueueSnackbar from 'src/logic/notifications/store/actions/enqueueSnackbar'
import styled from 'styled-components'
import MessageGenerator from './MessageGenerator'
import ReviewPopup from './ReviewPopup'

const Wrap = styled.div`
  background: #24262e;
  border-radius: 8px;
  padding: 24px;
  > .title {
    font-weight: 600;
    font-size: 20px;
    line-height: 24px;
    margin-bottom: 16px;
  }
  .description {
    color: #ccd0d5;
  }
  .btn {
    display: flex;
    justify-content: end;
  }
`

function CustomTransaction(props): ReactElement {
  const dispatch = useDispatch()
  const [message, setMessage] = useState([])
  const [gasUsed, setGasUsed] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setIsError] = useState(true)
  const [open, setOpen] = useState(false)
  const createTransaction = async () => {
    try {
      setLoading(true)
      // const res = await simulate({
      //   encodedMsgs: Buffer.from(JSON.stringify(message), 'binary').toString('base64'),
      //   safeId: safeId?.toString(),
      // })
      // if (res?.Data?.gasUsed) {
      //   setGasUsed(res?.Data?.gasUsed)
      // }
      setGasUsed(0)

      setLoading(false)
      setOpen(true)
    } catch (error) {
      setLoading(false)
      dispatch(
        enqueueSnackbar(
          enhanceSnackbarForAction({
            message: error.message || 'Failed to execute message',
            options: { variant: 'error', persist: true, preventDuplicate: true },
          }),
        ),
      )
      console.log('eevv', error)
    }
  }
  return (
    <>
      <Breadcrumb title="Custom Transaction" subtitleIcon={Icon} subtitle="Advanced / Custom Transaction" />
      <Wrap>
        <div className="title">Custom Transaction</div>
        <p className="description">
          Sign and create any multi-sig transaction based on input message using JSON format. Pyxis Safe cannot validate
          and message types which is unsupported by the network. Make sure you know what you are doing.
        </p>
        <MessageGenerator setMessage={setMessage} setIsError={setIsError} />
        <div className="btn">
          <FilledButton disabled={loading || error} onClick={createTransaction}>
            {loading ? <Loader content="Create Transaction" /> : 'Create Transaction'}
          </FilledButton>
        </div>
      </Wrap>
      <ReviewPopup open={open} setOpen={setOpen} gasUsed={Math.round(gasUsed * 2)} msg={message} />
    </>
  )
}

export default CustomTransaction
