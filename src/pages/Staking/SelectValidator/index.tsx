import { MenuItem } from '@material-ui/core'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  formControl: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white !important',
    '&:after': {
      borderRadius: '10px important',
    },

    '&:before': {
      borderRadius: '10px important',
    },

    '& .MuiInput-underline': {
      '&:after': {
        borderBottomColor: 'transparent',
        padding: 20,
      },
    },

    '& .MuiInput-input': {
      color: 'white !important',
    },

    '& .MuiSelect-select': {
      textAlign: 'center',
      '&:focus': {
        backgroundColor: 'transparent !important',
      },
    },
  },
  boxSelect: {
    backgroundColor: 'transparent',
    height: 60,
    borderRadius: '10px !important',
  },

  selectMenu: {
    border: '2px solid transparent',
    color: 'white',
    marginTop: 10,
    backgroundColor: '#363843',
    borderRadius: 5,
  },

  optionSelect: {
    fontSize: '14px',
    '&:hover': {
      backgroundColor: '#363843',
    },
  },

  selectStyled: {
    outline: 'none',
    fontSize: 14,
  },
}))

export default function SelectValidator(props) {
  const { arrRedelegate, handleChangeRedelegate, valueDelegate } = props
  const classes = useStyles()

  return (
    <div className={classes.selectMenu}>
      <FormControl className={classes.formControl}>
        <Select
          displayEmpty
          value={valueDelegate}
          onChange={handleChangeRedelegate}
          variant="standard"
          className={classes.boxSelect}
          inputProps={{ 'aria-label': 'Without label' }}
        >
          <MenuItem className={classes.optionSelect} value="none" disabled>
            Select validator
          </MenuItem>
          {arrRedelegate &&
            arrRedelegate.map((item, key) => {
              return (
                <MenuItem className={classes.optionSelect} value={item.value} key={key}>
                  {item.name}
                </MenuItem>
              )
            })}
        </Select>
      </FormControl>
    </div>
  )
}
