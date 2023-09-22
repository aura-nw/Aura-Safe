import { makeStyles } from '@material-ui/core/styles'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import { borderLinear } from 'src/theme/variables'
import CaretDown from './CaretDown.svg'
import { MenuItem } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  formControl: {
    '& .MuiInput-input': {
      color: 'white',
    },

    '& .MuiInput-underline': {
      '&::after': {
        borderBottomColor: 'transparent',
        padding: 20,
      },
    },
    '& .MuiSelect-select': {
      border: 'none',
      textAlign: 'center',
      padding: '0px 42px 0px 16px',
      '& option': {},
    },
    '& .MuiSelect-select:not([multiple]) option, .MuiSelect-select:not([multiple]) optgroup': {
      backgroundColor: '#131419',
      borderRadius: 10,
      fontSize: 16,
      border: 'none',
      outline: 'none',
    },
  },
  boxSelect: {
    backgroundColor: 'transparent',
    color: 'white !important',
    height: '100%',
    padding: 0,
    '&. Mui-focused': {
      border: 'none',
    },
    '& img': {
      right: 16,
      position: 'absolute',
      pointerEvents: 'none',
    },
  },
  selectMenu: {
    marginLeft: 10,
    border: '1px solid transparent',
    borderRadius: '8px',
    backgroundImage: borderLinear,
    transition: '0.3s',
    backgroundOrigin: 'border-box',
    backgroundClip: 'content-box, border-box',
  },
  optionSelect: {
    fontSize: '14px',
    '&:hover': {
      backgroundColor: '#363843',
    },
  },
}))

const CaretDownIcon = (props) => <img src={CaretDown} />

export default function CustomizedSelects(props) {
  const { selectedAction, handleChangeAction } = props
  const classes = useStyles()

  return (
    <div className={classes.selectMenu}>
      <FormControl className={classes.formControl}>
        <Select
          displayEmpty
          IconComponent={CaretDownIcon}
          value={selectedAction}
          onChange={handleChangeAction}
          className={classes.boxSelect}
          inputProps={{ 'aria-label': 'without label' }}
          autoWidth
        >
          <MenuItem className={classes.optionSelect} value="manage" disabled>
            Select Acions
          </MenuItem>
          <MenuItem className={classes.optionSelect} value="delegate">
            Delegate
          </MenuItem>
          <MenuItem className={classes.optionSelect} value="undelegate">
            Undelegate
          </MenuItem>
          <MenuItem className={classes.optionSelect} value="redelegate">
            Redelegate
          </MenuItem>
        </Select>
      </FormControl>
    </div>
  )
}
