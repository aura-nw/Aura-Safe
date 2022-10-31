import React, { ReactElement, useState, useEffect } from 'react'
import { Breadcrumb, BreadcrumbElement, Menu, Text } from '@aura/safe-react-components'
import Col from 'src/components/layout/Col'
import Block from 'src/components/layout/Block'
import CardStaking from 'src/components/CardStaking'
import Undelegating from './Undelegating'
import Validators from './Validators'
import BoxCard from 'src/components/BoxCard'
import ModalStaking from './ModalStaking/index'

import { getInternalChainId } from 'src/config'
import {
  getAllValidator,
  getAllDelegateOfUser,
  getAllUnDelegateOfUser,
  clamRewards,
  getDelegateOfUser,
} from 'src/services/index'
import { getExplorerInfo, getNativeCurrency } from 'src/config'

import { extractSafeAddress } from 'src/routes/routes'
import queryString from 'query-string'

import ReviewSendFundsTx from './ReviewSendFundsTx'
import Modal from 'src/components/Modal'
import { formatNumber, validateFloatNumber } from 'src/utils'
import enqueueSnackbar from 'src/logic/notifications/store/actions/enqueueSnackbar'
import { enhanceSnackbarForAction, NOTIFICATIONS } from 'src/logic/notifications'
import { useDispatch } from 'react-redux'

export const TypeStaking = {
  delegate: '/cosmos.staking.v1beta1.MsgDelegate',
  undelegate: '/cosmos.staking.v1beta1.MsgUndelegate',
  redelegate: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
  reward: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
}

function Staking(props): ReactElement {
  const dispatch = useDispatch()

  const [isOpenDelagate, setIsOpenDelagate] = useState(false)
  const [isOpenReview, setIsOpenReview] = useState(false)
  const [typeStaking, setTypeStaking] = useState('')
  const [title, setTitle] = useState('')

  const nativeCurrency = getNativeCurrency()
  const [amount, setAmount] = useState<any>('')

  const [availableBalance, setAvailableBalance] = useState({ _id: '', amount: '', denom: '' })
  const [totalStake, setTotalStake] = useState(0)
  const [rewardAmount, setRewardAmount] = useState(0)

  const internalChainId = getInternalChainId()

  const SafeAddress = extractSafeAddress()

  const [allValidator, setAllValidator] = useState([])
  const [validatorOfUser, setValidatorOfUser] = useState([])
  const [unValidatorOfUser, setUnValidatorOfUser] = useState([])
  const [listReward, setListReward] = useState([])

  const [valueDelegate, setValueDelegate] = React.useState('none')
  const [itemValidator, setItemValidator] = useState<any>()
  const [selectedAction, setSelectedAction] = useState('')
  const [itemDelegate, setItemDelegate] = useState<any>()
  const [dataDelegateOfUser, setDataDelegateOfUser] = useState<any>()
  const [validateMsg, setValidateMsg] = useState<string | undefined>()

  const handleChangeAction = (event) => {
    setSelectedAction(event.target.value)
    setAmount('')
    setValidateMsg('')
  }

  const handleChangeRedelegate = (event) => {
    console.log(event.target.value)
    setValueDelegate(event.target.value)
  }

  const handleDelegatedAmount = (event) => {
    setValidateMsg(undefined)
    const value = formatNumber(event.target.value)
    setAmount(value)
    if (+value > dataDelegateOfUser?.delegation?.delegationBalance?.amount / 10 ** nativeCurrency.decimals) {
      setValidateMsg('Given amount is greater than available balance!')
    }
  }

  const handleListValidator = async (internalChainId) => {
    const listValidator: any = (await getAllValidator(internalChainId)) || []
    setAllValidator(listValidator?.Data?.validators)
  }

  useEffect(() => {
    const dataTemp: any = []
    handleListValidator(internalChainId)
    //
    getAllDelegateOfUser(internalChainId, SafeAddress).then((res) => {
      setValidatorOfUser(res.Data?.delegations)
      res.Data?.availableBalance && setAvailableBalance(res.Data?.availableBalance)
      setTotalStake(res.Data.total?.staked)
      setRewardAmount(res.Data.total?.reward || 0)
      res.Data?.delegations?.map((item) => {
        dataTemp.push({
          delegatorAddress: SafeAddress,
          validatorAddress: item?.operatorAddress,
        })
      })
      setListReward(dataTemp)
    })
    getAllUnDelegateOfUser(internalChainId, SafeAddress).then((res) => {
      setUnValidatorOfUser(res.Data?.undelegations)
    })
  }, [internalChainId, SafeAddress])

  const handleAmout = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValidateMsg(undefined)
    const value = formatNumber(event.target.value)
    setAmount(value)
    if (+value > +availableBalance.amount / 10 ** nativeCurrency.decimals) {
      setValidateMsg('Given amount is greater than available balance!')
    }
  }

  const handleCallDataValidator = async (address) => {
    setDataDelegateOfUser(null)
    const dataSend: any = {
      internalChainId: internalChainId,
      operatorAddress: address,
      delegatorAddress: SafeAddress,
    }
    const res = await getDelegateOfUser(queryString.stringify(dataSend))
    setDataDelegateOfUser(res.Data)
  }

  const handleManage = async (item) => {
    setSelectedAction('manage')
    setIsOpenDelagate(true)
    const dataTemp = {
      safeStaking: item.operatorAddress,
      name: item.validator,
      avatar: item.description.picture,
    }

    await handleCallDataValidator(item.operatorAddress)
    setItemValidator(dataTemp)
    setItemDelegate(item)
  }

  const handleManageDelegate = async (item) => {
    setIsOpenDelagate(true)
    setSelectedAction('delegate')
    const dataTemp = {
      safeStaking: item.operatorAddress,
      name: item.validator,
      avatar: item.description.picture,
    }
    await handleCallDataValidator(item.operatorAddress)
    setItemValidator(dataTemp)
  }

  const handleSubmit = (action) => {
    if (action === 'delegate') {
      if (amount > +availableBalance.amount / 10 ** nativeCurrency.decimals || amount == 0) {
        setValidateMsg('Invalid amount! Please check and try again.')
        return
      }
      setTypeStaking(TypeStaking.delegate)
      setTitle('Delegate')
    }

    if (action === 'redelegate') {
      if (
        amount > dataDelegateOfUser?.delegation?.delegationBalance?.amount / 10 ** nativeCurrency.decimals ||
        amount == 0
      ) {
        setValidateMsg('Invalid amount! Please check and try again.')
        return
      }
      setTypeStaking(TypeStaking.redelegate)
      setTitle('Redelegate')
    }

    if (action === 'undelegate') {
      if (
        amount > dataDelegateOfUser?.delegation?.delegationBalance?.amount / 10 ** nativeCurrency.decimals ||
        amount == 0
      ) {
        setValidateMsg('Invalid amount! Please check and try again.')
        return
      }
      setTypeStaking(TypeStaking.undelegate)
      setTitle('Undelegate')
    }
    setIsOpenReview(true)
    setIsOpenDelagate(false)
  }

  const ClaimReward = () => {
    setIsOpenReview(true)
    setIsOpenDelagate(false)
    setTypeStaking(TypeStaking.reward)
    setTitle('Claim reward')
  }

  const handleCloseSendFund = () => {
    setIsOpenReview(false)
  }

  const handlePrevSendFund = () => {
    setIsOpenReview(false)
  }

  ///
  const temp = {
    token: '0000000000000000000000000000000000000000',
    tokenSpendingLimit: 0,
  }

  const handleMax = (item) => {
    setAmount(item)
  }

  const HandleClose = () => {
    setIsOpenDelagate(false)
    setItemValidator(null)
    setAmount('')
  }

  return (
    <>
      <Menu>
        <Col start="sm" sm={12} xs={12}>
          <Breadcrumb>
            <BreadcrumbElement
              color="white"
              iconType="stakingAura"
              text="Staking"
              // counter={addressBook?.length.toString()}
            />
          </Breadcrumb>
        </Col>
      </Menu>
      <Block>
        {' '}
        <Col start="sm" sm={12} xs={12}>
          <CardStaking
            handleModal={handleManage}
            availableBalance={availableBalance}
            totalStake={totalStake}
            rewardAmount={rewardAmount}
            validatorOfUser={validatorOfUser}
            ClaimReward={ClaimReward}
            nativeCurrency={nativeCurrency}
            allValidator={allValidator}
          />
        </Col>
      </Block>

      {unValidatorOfUser && unValidatorOfUser.length > 0 && (
        <Block margin="mdTop">
          {' '}
          <Col start="sm" sm={12} xs={12}>
            <Undelegating unValidatorOfUser={unValidatorOfUser} allValidator={allValidator} />
          </Col>
        </Block>
      )}

      <Block margin="mdTop" style={{ marginBottom: 10 }}>
        {' '}
        <BoxCard>
          <Col layout="column" sm={12} xs={12}>
            <Validators allValidator={allValidator} dandleManageDelegate={handleManageDelegate} />
          </Col>
        </BoxCard>
      </Block>

      <ModalStaking
        modalIsOpen={isOpenDelagate}
        handleClose={HandleClose}
        selectedAction={selectedAction}
        handleChangeAction={handleChangeAction}
        handleSubmit={handleSubmit}
        handleAmout={handleAmout}
        amount={amount}
        allValidator={allValidator}
        itemValidator={itemValidator}
        handleChangeRedelegate={handleChangeRedelegate}
        valueDelegate={valueDelegate}
        handleDelegatedAmount={handleDelegatedAmount}
        nativeCurrency={nativeCurrency}
        itemDelegate={itemDelegate}
        availableBalance={availableBalance}
        handleMax={handleMax}
        dataDelegateOfUser={dataDelegateOfUser}
        validateMsg={validateMsg}
      />

      <Modal
        description="Send Tokens Form"
        handleClose={handleCloseSendFund}
        open={isOpenReview}
        paperClassName="smaller-modal-window"
        title={title}
      >
        <ReviewSendFundsTx
          onClose={handleCloseSendFund}
          onPrev={handlePrevSendFund}
          tx={temp as any}
          typeStaking={typeStaking}
          amount={amount}
          itemValidator={itemValidator}
          title={title}
          valueDelegate={valueDelegate}
          validatorOfUser={validatorOfUser}
          listReward={listReward}
        />
      </Modal>
    </>
  )
}

export default Staking
