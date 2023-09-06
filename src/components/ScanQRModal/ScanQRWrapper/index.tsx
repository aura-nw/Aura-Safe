import { makeStyles } from '@material-ui/core/styles'
import { ReactElement, useState } from 'react'

import { ScanQRModal } from 'src/components/ScanQRModal'
import Img from 'src/components/layout/Img'
import QrCodeIcon from 'src/routes/CreateSafePage/assets/uil_qrcode-scan.svg'

const useStyles = makeStyles({
  qrCodeBtn: {
    cursor: 'pointer',
  },
})

type Props = {
  handleScan: (dataResult: string, closeQrModal: () => void) => void
  testId?: string
  icon?: string
}

export const ScanQRWrapper = ({ handleScan, testId, icon }: Props): ReactElement => {
  const classes = useStyles()
  const [qrModalOpen, setQrModalOpen] = useState(false)

  const openQrModal = () => {
    setQrModalOpen(true)
  }

  const closeQrModal = () => {
    setQrModalOpen(false)
  }

  const onScanFinished = (value: string) => {
    handleScan(value, closeQrModal)
  }

  return (
    <>
      <Img
        alt="Scan QR"
        className={classes.qrCodeBtn}
        height={20}
        onClick={() => openQrModal()}
        role="button"
        src={QrCodeIcon}
        testId={testId || 'qr-icon'}
      />
      {qrModalOpen && <ScanQRModal isOpen={qrModalOpen} onClose={closeQrModal} onScan={onScanFinished} />}
    </>
  )
}
