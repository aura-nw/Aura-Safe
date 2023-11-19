import { createStyles } from '@material-ui/core'

import { border, fontColor, md, screenSm, sm, xs } from 'src/theme/variables'

export const styles = createStyles({
  root: {
    backgroundColor: '#0E0E0F',
    borderRadius: sm,
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '54px',
    minHeight: 'min-content',
    border: `1px solid ${border}`,
    padding: `${md} 0`,

    [`@media (min-width: ${screenSm}px)`]: {
      flexDirection: 'row',
    },
  },
  contents: {
    width: '100%',
  },
  container: {
    flexGrow: 1,
    height: '100%',
    position: 'relative',
    backgroundColor: '#0E0E0F',
    borderRadius: sm,
  },
  links: {
    textDecoration: 'underline',
    marginRight: '6px',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  removeSafeBtn: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '-1px', // to make it the same as row in Balances component
  },
  counter: {
    background: border,
    borderRadius: '3px',
    color: fontColor,
    lineHeight: 'normal',
    margin: `-2px 0 -2px ${sm}`,
    padding: xs,
    fontSize: '11px',
  },
  checkbox: {
    '& input[type="checkbox"]': {
      backgroundColor: '#fff !important',
      color: '#dddfff',
    },
  },
})
