import { lg, secondaryText, sm, bgDisabledColorStep, colorLinear, borderLinear } from 'src/theme/variables'
import { createStyles } from '@material-ui/core'

export const styles = createStyles({
  heading: {
    padding: lg,
    justifyContent: 'space-between',
    maxHeight: '75px',
    boxSizing: 'border-box',
  },
  loaderContainer: {
    width: '100%',
    height: '100%',
  },
  close: {
    height: '25px',
    width: '25px',
    color: secondaryText,
  },
  detailsContainer: {
    backgroundColor: bgDisabledColorStep,
    maxHeight: '450px',
  },
  buttonRow: {
    height: '84px',
    justifyContent: 'center',
  },
  button: {
    background: colorLinear,
    color: 'black',
    '&:last-child': {
      marginLeft: sm,
    },
  },
  buttonBorder: {
    border: ' 2px solid transparent',
    backgroundImage: borderLinear,
    backgroundOrigin: 'border-box',
    backgroundClip: 'content-box, border-box',
    borderRadius: 50,
    marginLeft: sm,
  },
  buttonBorderInside: {
    background: 'transparent',
    boxShadow: 'none',
  },
})
