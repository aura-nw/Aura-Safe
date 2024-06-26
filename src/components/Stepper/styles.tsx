import { mediumFont, lg, sm, bgBox, borderLinear, smallsizeFont } from 'src/theme/variables'
import { createStyles } from '@material-ui/core'
const styles = (theme) =>
  createStyles({
    root: {
      margin: '10px 0 10px 10px',
      maxWidth: '770px',
      boxShadow: '0 0 10px 0 rgba(33,48,77,0.10)',
    },
    controlStyle: {
      backgroundColor: `${bgBox}`,
      padding: lg,
      // borderRadius: sm,
    },
    backButton: {
      marginRight: sm,
      fontSize: smallsizeFont,
      fontWeight: mediumFont,
      color: 'white',
    },
    nextButton: {
      fontSize: smallsizeFont,
      fontWeight: mediumFont,
      boxShadow: 'none',
      backgroundColor: 'transparent',

      '&:hover': {
        backgroundColor: 'transparent',
      },
    },

    borderNextButton: {
      borderRadius: '50px',
      border: ' 2px solid transparent',
      backgroundImage: `${borderLinear}`,
      backgroundOrigin: 'border-box',
      backgroundClip: 'content-box, border-box',
    },

    borderNextButtonDisable: {
      borderRadius: '50px',
      border: ' 2px solid transparent',
      backgroundImage: `${borderLinear}`,
      backgroundOrigin: 'border-box',
      backgroundClip: 'content-box, border-box',
      opacity: 0.5,
    },

    stepLabel: {
      cursor: ({ isStepLabelClickable }: any) => (isStepLabelClickable ? 'pointer' : 'inherit'),
    },
    FotterForm: {
      justifyContent: 'flex-end !important',
    },
  })

export { styles }
