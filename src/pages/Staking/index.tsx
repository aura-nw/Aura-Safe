import React, { ReactElement, useEffect, useState } from 'react'
import ActionModal from './ActionModal/index'
import Undelegating from './Undelegating'
import Validators from './Validators'

import { getChainInfo, getCoinMinimalDenom, getInternalChainId, getNativeCurrency } from 'src/config'
import {
  getAccountInfo,
  getAllDelegations,
  getAllReward,
  getAllUnDelegateOfUser,
  getAllValidators,
  getNumberOfDelegator,
  simulate,
} from 'src/services/index'

import { extractPrefixedSafeAddress, extractSafeAddress } from 'src/routes/routes'

import { coin } from '@cosmjs/stargate'
import { useSelector } from 'react-redux'
import Icon from 'src/assets/icons/Stack.svg'
import Breadcrumb from 'src/components/Breadcrumb'
import { ConnectWalletModal } from 'src/components/ConnectWalletModal'
import useConnectWallet from 'src/logic/hooks/useConnectWallet'
import { MsgTypeUrl } from 'src/logic/providers/constants/constant'
import { currentSafeWithNames } from 'src/logic/safe/store/selectors'
import { loadedSelector } from 'src/logic/wallets/store/selectors'
import { convertAmount, formatNumber } from 'src/utils'
import { grantedSelector } from 'src/utils/safeUtils/selector'
import MyDelegation from './MyDelegation'
import TxActionModal from './TxActionModal'

export const defValidatorImage = 'https://validator-logos.s3.ap-southeast-1.amazonaws.com/validator-default.svg'
function Staking(props): ReactElement {
  const currentChainInfo = getChainInfo() as any
  const granted = useSelector(grantedSelector)
  const { balances } = useSelector(currentSafeWithNames)
  const { safeId } = extractPrefixedSafeAddress()

  const denom = getCoinMinimalDenom()
  const { connectWalletState, onConnectWalletShow, onConnectWalletHide } = useConnectWallet()
  const loaded = useSelector(loadedSelector)

  const [isOpenDelagate, setIsOpenDelagate] = useState(false)
  const [isOpenReview, setIsOpenReview] = useState(false)
  const [typeStaking, setTypeStaking] = useState('')

  const nativeCurrency = getNativeCurrency()
  const [amount, setAmount] = useState<any>('')

  const [availableBalance, setAvailableBalance] = useState({ _id: '', amount: '', denom: '' })
  const [totalStake, setTotalStake] = useState<any>()
  const [rewardAmount, setRewardAmount] = useState(0)
  const [allDelegations, setAllDelegations] = useState<any[]>([])
  const [allRewards, setAllRewards] = useState<any[]>([])

  const internalChainId = getInternalChainId()

  const SafeAddress = extractSafeAddress()

  const [allValidator, setAllValidator] = useState([])
  const [validatorOfUser, setValidatorOfUser] = useState<any>([])
  const [unValidatorOfUser, setUnValidatorOfUser] = useState([])
  const [listReward, setListReward] = useState<any>([])

  const [valueDelegate, setValueDelegate] = React.useState('none')
  const [itemValidator, setItemValidator] = useState<any>()
  const [selectedAction, setSelectedAction] = useState('')
  const [itemDelegate, setItemDelegate] = useState<any>()
  const [dataDelegateOfUser, setDataDelegateOfUser] = useState<any>()
  const [validateMsg, setValidateMsg] = useState<string | undefined>()
  const [gasUsed, setGasUsed] = useState(0)

  const [simulateLoading, setSimulateLoading] = useState(false)

  const handleChangeAction = (action) => {
    setSelectedAction(action)
    setAmount('')
    setValidateMsg('')
    setValueDelegate('none')
  }

  const handleChangeRedelegate = (event) => {
    setValueDelegate(event.target.value)
  }

  const handleDelegatedAmount = (v) => {
    setValidateMsg(undefined)
    const value = formatNumber(v)
    setAmount(value)
    if (+value > +convertAmount(dataDelegateOfUser?.delegation?.delegationBalance?.amount, false)) {
      setValidateMsg('Given amount is greater than available balance!')
    }
  }

  const calculateTotalStaked = (delegations: any[]) => {
    let total = 0
    for (const delegation of delegations) {
      total += +delegation.balance.amount
    }
    return {
      amount: total.toString(),
      denom: delegations[0].balance.denom,
    }
  }

  const handleListValidator = async () => {
    const listValidators: any = (await getAllValidators()) || []

    const validators = listValidators.validator.map((val) => {
      return {
        commission: val.commission,
        description: {
          moniker: val.description.moniker,
          picture: val.image_url.includes('http') ? val.image_url : defValidatorImage,
        },
        operatorAddress: val.operator_address,
        status: val.status,
        uptime: val.uptime,
        validator: val.description.moniker,
        votingPower: {
          number: val.tokens,
          percentage: val.percent_voting_power,
        },
      }
    })

    setAllValidator(validators)
  }

  useEffect(() => {
    handleListValidator()
    getAllUnDelegateOfUser(currentChainInfo.lcd, SafeAddress).then((res) => {
      const formatData = res.unbonding_responses.map((item) => {
        return {
          operatorAddress: item.validator_address,
          completionTime: item.entries[0].completion_time,
          balance: item.entries[0].balance,
        }
      })
      setUnValidatorOfUser(formatData)
    })

    getAllDelegations(currentChainInfo.lcd, SafeAddress).then((res) => {
      setAllDelegations(res.delegation_responses)
    })

    getAllReward(currentChainInfo.lcd, SafeAddress).then((res) => {
      setRewardAmount(res.total || 0)
      setAllRewards(res.rewards)
    })

    getAccountInfo(SafeAddress).then((res) => {
      const availableBalance = res.account[0]?.balances?.find((e) => e.denom === currentChainInfo.denom)
      setAvailableBalance(availableBalance)
    })
  }, [internalChainId, SafeAddress, currentChainInfo])

  useEffect(() => {
    const dataTemp: any = []
    const formatDataDelegations = allDelegations.map((delegation: any) => {
      const reward = allRewards?.find(
        (rw: any) => rw.validator_address === delegation.delegation.validator_address,
      ) as any
      return {
        balance: delegation.balance,
        operatorAddress: delegation.delegation.validator_address,
        reward: reward?.reward ?? [],
      }
    })
    setValidatorOfUser(formatDataDelegations)

    formatDataDelegations?.map((item) => {
      if (item.reward?.[0]?.amount) {
        dataTemp.push({
          delegatorAddress: SafeAddress,
          validatorAddress: item?.operatorAddress,
        })
      }
    })
    setListReward(dataTemp)

    const staked = formatDataDelegations.length > 0 ? calculateTotalStaked(formatDataDelegations) : undefined
    setTotalStake(staked)
  }, [allRewards, allDelegations])

  const handleAmout = (v) => {
    setValidateMsg(undefined)
    const value = formatNumber(v)
    setAmount(value)
    if (+value > +convertAmount(availableBalance?.amount, false)) {
      setValidateMsg('Given amount is greater than available balance!')
    }
  }

  const handleCallDataValidator = async (address) => {
    const nativeCurrency = getNativeCurrency()
    setDataDelegateOfUser(null)

    const validatorsRes: any = await getAllValidators()
    const validatorItem = validatorsRes.validator.find((item) => item.operator_address === address)
    const validator = {
      commission: validatorItem.commission.commission_rates.rate * 100,
      delegators: validatorItem.delegators_count,
      operatorAddress: validatorItem.operator_address,
      votingPower: {
        percent_voting_power: validatorItem.percent_voting_power,
        tokens: {
          amount: validatorItem.tokens,
          denom: nativeCurrency.symbol,
        },
      },
    }

    const delegation = {
      claimedReward: {
        amount: rewardAmount[0]?.amount,
        denom: rewardAmount[0]?.denom,
      },
      delegatableBalance: {
        amount: balances?.find((balance) => balance.type === 'native')?.tokenBalance,
        denom: balances?.find((balance) => balance.type === 'native')?.denom,
      },
      delegationBalance: {
        amount: allDelegations?.find((item) => item.delegation.validator_address === address)?.balance.amount,
        denom: allDelegations?.find((item) => item.delegation.validator_address === address)?.balance.denom,
      },
      pendingReward: {
        amount: allRewards?.find((rw) => rw.validator_address === address)?.reward.amount,
        denom: allRewards?.find((rw) => rw.validator_address === address)?.reward.denom,
      },
    }
    let numberOfDelegator
    try {
      numberOfDelegator = await getNumberOfDelegator(address)
    } catch (error) {}
    setDataDelegateOfUser({
      delegation,
      validator: { ...validator, delegators: numberOfDelegator?.pagination?.total || '??' },
    })
  }

  const handleManage = async (item) => {
    if (!loaded) {
      onConnectWalletShow()
      return
    }
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
    if (!loaded) {
      onConnectWalletShow()
      return
    }
    setIsOpenDelagate(true)
    setValidateMsg('')
    setSelectedAction('delegate')
    const dataTemp = {
      safeStaking: item.operatorAddress,
      name: item.validator,
      avatar: item.description.picture,
    }
    await handleCallDataValidator(item.operatorAddress)
    setItemValidator(dataTemp)
  }

  const handleSubmit = async (action) => {
    if (action === 'delegate') {
      if (+amount > +convertAmount(availableBalance?.amount, false) || amount == 0) {
        setValidateMsg('Invalid amount! Please check and try again.')
        return
      }
      try {
        const res = await simulate({
          encodedMsgs: Buffer.from(
            JSON.stringify([
              {
                typeUrl: MsgTypeUrl.Delegate,
                value: {
                  amount: coin(convertAmount(amount, true), denom),
                  delegatorAddress: SafeAddress,
                  validatorAddress: itemValidator.safeStaking,
                },
              },
            ]),
            'binary',
          ).toString('base64'),
          safeId: safeId?.toString(),
        })
        if (res?.Data?.gasUsed) {
          setGasUsed(res?.Data?.gasUsed)
        }
      } catch (error) {
        setGasUsed(0)
      }
      setTypeStaking(MsgTypeUrl.Delegate)
    }

    if (action === 'redelegate') {
      if (+amount > +convertAmount(dataDelegateOfUser?.delegation?.delegationBalance?.amount, false) || amount == 0) {
        setValidateMsg('Invalid amount! Please check and try again.')
        return
      }
      try {
        const res = await simulate({
          encodedMsgs: Buffer.from(
            JSON.stringify([
              {
                typeUrl: MsgTypeUrl.Redelegate,
                value: {
                  amount: coin(convertAmount(amount, true), denom),
                  delegatorAddress: SafeAddress,
                  validatorSrcAddress: itemValidator.safeStaking,
                  validatorDstAddress: valueDelegate,
                },
              },
            ]),
            'binary',
          ).toString('base64'),
          safeId: safeId?.toString(),
        })
        if (res?.Data?.gasUsed) {
          setGasUsed(res?.Data?.gasUsed)
        }
      } catch (error) {
        setGasUsed(0)
      }

      setTypeStaking(MsgTypeUrl.Redelegate)
    }

    if (action === 'undelegate') {
      if (+amount > +convertAmount(dataDelegateOfUser?.delegation?.delegationBalance?.amount, false) || amount == 0) {
        setValidateMsg('Invalid amount! Please check and try again.')
        return
      }
      try {
        const res = await simulate({
          encodedMsgs: Buffer.from(
            JSON.stringify([
              {
                typeUrl: MsgTypeUrl.Undelegate,
                value: {
                  amount: coin(convertAmount(amount, true), denom),
                  delegatorAddress: SafeAddress,
                  validatorAddress: itemValidator.safeStaking,
                },
              },
            ]),
            'binary',
          ).toString('base64'),
          safeId: safeId?.toString(),
        })
        if (res?.Data?.gasUsed) {
          setGasUsed(res?.Data?.gasUsed)
        }
      } catch (error) {
        setGasUsed(0)
      }

      setTypeStaking(MsgTypeUrl.Undelegate)
    }
    setIsOpenReview(true)
    setIsOpenDelagate(false)
  }

  const claimReward = async () => {
    if (!loaded) {
      onConnectWalletShow()
      return
    }
    try {
      setSimulateLoading(true)
      const res = await simulate({
        encodedMsgs: Buffer.from(
          JSON.stringify(
            listReward.map((item) => ({
              typeUrl: MsgTypeUrl.GetReward,
              value: {
                delegatorAddress: item.delegatorAddress,
                validatorAddress: item.validatorAddress,
              },
            })),
          ),
          'binary',
        ).toString('base64'),
        safeId: safeId?.toString(),
      })
      if (res?.Data?.gasUsed) {
        setGasUsed(res?.Data?.gasUsed)
      }
      setSimulateLoading(false)
    } catch (error) {
      setSimulateLoading(false)
      setGasUsed(0)
    }

    setIsOpenReview(true)
    setIsOpenDelagate(false)
    setTypeStaking(MsgTypeUrl.GetReward)
  }

  const handleCloseSendFund = () => {
    setIsOpenReview(false)
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
      <Breadcrumb title="Staking" subtitleIcon={Icon} subtitle="Staking" />

      <MyDelegation
        handleModal={handleManage}
        availableBalance={availableBalance}
        totalStake={totalStake}
        rewardAmount={rewardAmount}
        validatorOfUser={validatorOfUser}
        claimReward={claimReward}
        nativeCurrency={nativeCurrency}
        allValidator={allValidator}
        disabledButton={loaded && !granted}
        simulateLoading={simulateLoading}
      />

      {unValidatorOfUser && unValidatorOfUser.length > 0 && (
        <Undelegating unValidatorOfUser={unValidatorOfUser} allValidator={allValidator} />
      )}

      <Validators
        allValidator={allValidator}
        handleManageDelegate={handleManageDelegate}
        disabledButton={loaded && !granted}
      />

      <ActionModal
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
      <TxActionModal
        open={isOpenReview}
        onClose={handleCloseSendFund}
        action={typeStaking}
        validator={itemValidator}
        dstValidator={valueDelegate}
        amount={amount}
        listReward={listReward}
        gasUsed={Math.round(gasUsed * 2)}
      />

      <ConnectWalletModal isOpen={connectWalletState.showConnect} onClose={onConnectWalletHide}></ConnectWalletModal>
    </>
  )
}

export default Staking
