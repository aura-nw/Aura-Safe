import { screenSm, sm, borderLinear } from 'src/theme/variables'
import { createStyles } from '@material-ui/core/styles'
import styled from 'styled-components'

export const styles = createStyles({
  root: {
    alignItems: 'center',
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    borderRadius: 4,

    [`@media (min-width: ${screenSm}px)`]: {
      flexBasis: '180px',
      marginRight: '20px',
      marginLeft: '20px',
    },
  },
  networkList: {
    alignItems: 'center',
    cursor: 'pointer',
    display: 'flex',
    backgroundColor: '#222223',
    borderRadius: '4px',
    height: '70%',
    flex: '1 1 auto',
    [`@media (min-width: ${screenSm}px)`]: {
      paddingRight: sm,
    },
  },
  expand: {
    height: '30px',
    width: '30px',
    color: '#98989B',
  },
  popper: {
    zIndex: 1301,
  },
  network: {
    borderRadius: sm,
    // boxShadow: '0 0 10px 0 rgba(33, 48, 77, 0.1)',
    marginTop: '11px',
    minWidth: '180px',
    padding: '0',
  },
  link: {
    padding: '14px 16px 14px 0',
    display: 'flex',
  },
})

export const StyledLink = styled.a`
  margin-top: 10px;
  text-decoration: none;
  display: flex;
  background: #3e3f40;
  border-radius: 4px;
  justify-content: space-between;
  border: 2px solid transparent;

  :hover {
    border: 2px solid transparent;
    background-image: ${borderLinear};
    transition: 0.3s;
    background-origin: border-box;
    background-clip: content-box, border-box;
  }
`