import CircularProgress from '@material-ui/core/CircularProgress'
import InputAdornment from '@material-ui/core/InputAdornment'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Field } from 'react-final-form'
import { OnChange } from 'react-final-form-listeners'

import TextField from 'src/components/forms/TextField'
import { Validator, composeValidators, mustBeValidAddress, required } from 'src/components/forms/validator'
import { Errors, logError } from 'src/logic/exceptions/CodedException'
import { isValidCryptoDomainName, isValidEnsName } from 'src/logic/wallets/ethAddresses'
import { getAddressFromDomain } from 'src/logic/wallets/getWeb3'
import { checksumAddress } from 'src/utils/checksumAddress'
import { parsePrefixedAddress } from 'src/utils/prefixedAddress'
import { trimSpaces } from 'src/utils/strings'

interface AddressInputProps {
  fieldMutator: (address: string) => void
  name?: string
  text?: string
  placeholder?: string
  inputAdornment?: { endAdornment: React.ReactElement } | undefined | false
  testId: string
  validators?: Validator[]
  defaultValue?: string
  disabled?: boolean
  spellCheck?: boolean
  className?: string
}

const AddressInput = ({
  className = '',
  name = 'recipientAddress',
  text = 'Recipient*',
  placeholder = 'Recipient*',
  fieldMutator,
  testId,
  inputAdornment,
  validators = [],
  defaultValue,
  disabled,
}: AddressInputProps): React.ReactElement => {
  const [currentInput, setCurrentInput] = useState<string>('')
  const [resolutions, setResolutions] = useState<Record<string, string | undefined>>({})
  const resolvedAddress = resolutions[currentInput]
  const isResolving = resolvedAddress === ''

  // External validators must receive an unprefixed address
  const sanitizedValidators = useCallback(
    (val: string) => {
      const parsed = parsePrefixedAddress(val)
      return composeValidators(...validators)(parsed.address)
    },
    [validators],
  )

  // Internal validators + externally passed validators
  const allValidators = useMemo(
    () => composeValidators(required, mustBeValidAddress, sanitizedValidators),
    [sanitizedValidators],
  )

  const onValueChange = useCallback(
    (rawVal: string) => {
      const address = trimSpaces(rawVal)

      setCurrentInput(rawVal)

      // A crypto domain name
      if (isValidEnsName(address) || isValidCryptoDomainName(address)) {
        setResolutions((prev) => ({ ...prev, [rawVal]: '' }))

        getAddressFromDomain(address)
          .then((resolverAddr) => {
            const formattedAddress = checksumAddress(resolverAddr)
            setResolutions((prev) => ({ ...prev, [rawVal]: formattedAddress }))
          })
          .catch((err) => {
            setResolutions((prev) => ({ ...prev, [rawVal]: undefined }))
            logError(Errors._101, err.message)
          })
      } else {
        // A regular address hash
        if (!mustBeValidAddress(address) /* || !mustBeEthereumAddress(address) */) {
          const parsed = parsePrefixedAddress(address)
          const checkedAddress = checksumAddress(parsed.address) || parsed.address

          // Field mutator (parent component) always gets an unprefixed address
          fieldMutator(checkedAddress)
        }
      }
    },
    [setCurrentInput, setResolutions, fieldMutator],
  )

  useEffect(() => {
    if (resolvedAddress) {
      onValueChange(resolvedAddress)
    }
  }, [resolvedAddress, onValueChange])

  const adornment = isResolving
    ? {
        endAdornment: (
          <InputAdornment position="end">
            <CircularProgress size="16px" />
          </InputAdornment>
        ),
      }
    : inputAdornment

  return (
    <>
      <Field
        className={className}
        component={TextField as any}
        defaultValue={defaultValue}
        disabled={disabled}
        inputAdornment={adornment}
        name={name}
        placeholder={placeholder}
        text={text}
        spellCheck={false}
        validate={allValidators}
        inputProps={{
          'data-testid': testId,
        }}
      />

      <OnChange name={name}>{onValueChange}</OnChange>
    </>
  )
}

export default AddressInput
