import * as React from 'react'
import { getChainById } from 'src/config'
import { ChainId } from 'src/config/chain.d'
import styled from 'styled-components'

type Props = {
  networkId: ChainId
  className?: string
}

const StyledDot = styled.span<{ backgroundColor: string; textColor: string }>`
  width: 15px;
  height: 15px;
  color: ${({ textColor }) => textColor};
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
`

export const CircleDot = (props: Props): React.ReactElement => {
  const { theme } = getChainById(props.networkId)

  return <StyledDot {...theme} />
}
