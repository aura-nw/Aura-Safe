import { Icon, Loader } from '@aura/safe-react-components'
import cn from 'classnames'
import { ReactElement } from 'react'

import {
  ModalStyled,
  HeaderSection,
  TitleStyled,
  BodySection,
  FooterSection,
  LoaderText,
  StyledButtonClose,
  StyledButtonConfirm,
  StyledBorderButton,
  BoxStyled,
} from './styles'
import {
  GnoModalProps,
  TitleProps,
  HeaderProps,
  BodyProps,
  ButtonsProps,
  FooterProps,
  ModalProps,
  ButtonStatus,
} from './type'

const GnoModal = ({ children, description, handleClose, open, paperClassName, title }: GnoModalProps): ReactElement => {
  return (
    <ModalStyled
      BackdropProps={{ className: 'overlay' }}
      aria-describedby={description}
      aria-labelledby={title}
      onClose={handleClose}
      open={open}
    >
      <div className={cn('paper', paperClassName)}>{children}</div>
    </ModalStyled>
  )
}

export default GnoModal

/*****************/
/* Generic Modal */
/*****************/

/*** Header ***/

const Title = ({ children, ...props }: TitleProps): ReactElement => (
  <TitleStyled size="xs" withoutMargin {...props}>
    {children}
  </TitleStyled>
)

const Box = ({ children, ...props }: any): ReactElement => <BoxStyled {...props}>{children}</BoxStyled>

const Header = ({ children, onClose }: HeaderProps): ReactElement => {
  return (
    <HeaderSection className="modal-header">
      {children}

      {onClose && (
        <button className="close-button" onClick={onClose}>
          <Icon size="sm" type="cross" />
        </button>
      )}
    </HeaderSection>
  )
}

Header.Title = Title

Header.Box = Box
/*** Body ***/

const Body = ({ children, withoutPadding = false }: BodyProps): ReactElement => (
  <BodySection className="modal-body" withoutPadding={withoutPadding} fitContent={true}>
    {children}
  </BodySection>
)

/*** Footer ***/

const Buttons = ({ cancelButtonProps = {}, confirmButtonProps = {} }: ButtonsProps): ReactElement => {
  const {
    disabled: cancelDisabled,
    status: cancelStatus = ButtonStatus.READY,
    text: cancelText = ButtonStatus.LOADING === cancelStatus ? 'Cancelling' : 'Cancel',
    testId: cancelTestId = '',
    ...cancelProps
  } = cancelButtonProps
  const {
    disabled: confirmDisabled,
    status: confirmStatus = ButtonStatus.READY,
    text: confirmText = ButtonStatus.LOADING === confirmStatus ? 'Submitting' : 'Submit',
    testId: confirmTestId = '',
    ...confirmProps
  } = confirmButtonProps

  return (
    <>
      <StyledButtonClose
        size="md"
        color="primary"
        variant="outlined"
        type={cancelProps?.onClick ? 'button' : 'submit'}
        disabled={cancelDisabled || [ButtonStatus.DISABLED, ButtonStatus.LOADING].includes(cancelStatus)}
        data-testid={cancelTestId}
        {...cancelProps}
      >
        {ButtonStatus.LOADING === cancelStatus ? (
          <>
            <Loader size="xs" color="secondaryLight" />
            <LoaderText>{cancelText}</LoaderText>
          </>
        ) : (
          cancelText
        )}
      </StyledButtonClose>

      {/* <GradientButton
        size="md"
        text={'Review'}
        testId="review-tx-btn"
        type={confirmProps?.onClick ? 'button' : 'submit'}
      ></GradientButton> */}
      <StyledBorderButton
        disabled={confirmDisabled || [ButtonStatus.DISABLED, ButtonStatus.LOADING].includes(confirmStatus)}
      >
        <StyledButtonConfirm
          size="md"
          type={confirmProps?.onClick ? 'button' : 'submit'}
          disabled={confirmDisabled || [ButtonStatus.DISABLED, ButtonStatus.LOADING].includes(confirmStatus)}
          data-testid={confirmTestId}
          {...confirmProps}
        >
          {ButtonStatus.LOADING === confirmStatus ? (
            <>
              <Loader size="xs" color="secondaryLight" />
              <LoaderText>{confirmText}</LoaderText>
            </>
          ) : (
            confirmText
          )}
        </StyledButtonConfirm>
      </StyledBorderButton>
    </>
  )
}
const Footer = ({ children, withoutBorder = false, justifyContent = 'center' }: FooterProps): ReactElement => (
  <FooterSection className="modal-footer" withoutBorder={withoutBorder} justifyContent={justifyContent}>
    {children}
  </FooterSection>
)

Footer.Buttons = Buttons

export const Modal = ({ children, description = '', open = true, title = '', ...props }: ModalProps): ReactElement => {
  return (
    <GnoModal {...props} description={description} open={open} title={title} paperClassName="modal">
      {children}
    </GnoModal>
  )
}

Modal.Header = Header
Modal.Body = Body
Modal.Footer = Footer
