import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import styled from 'styled-components'
import ListItem, { ListItemProps } from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Badge from '@material-ui/core/Badge'

import ListMui, { ListProps } from '@material-ui/core/List'
import { FixedIcon } from '@aura/safe-react-components'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      maxWidth: 320,
      backgroundColor: 'transparent',
      overflowX: 'auto',
      padding: '24px 16px',
      '&::-webkit-scrollbar': {
        width: '0.5em',
      },
      '&::-webkit-scrollbar-track': {
        boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)',
        webkitBoxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)',
        borderRadius: '20px',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'darkgrey',
        outline: '1px solid #dadada',
        borderRadius: '20px',
      },
    },
    nested: {
      paddingLeft: theme.spacing(3),
    },
  }),
)

const StyledListItem = styled(ListItem)<ListItemProps>`
  &.MuiButtonBase-root.MuiListItem-root {
    color: #b4b8c0;
    margin-bottom: 16px;
    /* background-color: #3e3f40 !important; */
    border-radius: 8px;
    span {
      font-family: 'Inter' !important;
      font-style: normal;
      font-weight: 600;
      font-size: 14px;
      line-height: 18px;
      letter-spacing: 0.01em;
      color: #b4b8c0;
    }
    svg {
      color: inherit !important;
    }

    &.Mui-selected {
      background-color: #363843 !important;
    }
    .icon-color {
      fill: white;
    }
  }

  &.MuiListItem-button:hover {
    background: #1b1c21;
  }

  &.MuiListItem-root.Mui-selected {
    border-radius: 8px;
    color: #fff;
    span {
      color: #fff;
    }
  }
`

const StyledListSubItem = styled(ListItem)<ListItemProps>`
  &.MuiButtonBase-root.MuiListItem-root {
    margin-top: -8px;
    margin-left: auto;
    width: 85%;
    color: #b4b8c0;
    span {
      font-family: 'Inter' !important;
      font-style: normal;
      font-weight: 600;
      font-size: 14px;
      line-height: 18px;
      letter-spacing: 0.01em;
      color: #b4b8c0;
    }
    .icon-color {
      fill: white !important;
    }
  }

  &.MuiListItem-button:hover {
    border-radius: 8px;
  }

  &.MuiButtonBase-root.MuiListItem-root.Mui-selected {
    background-color: #363843;
    border-radius: 8px;
    color: #fff;
    span {
      color: #fff !important;
    }
  }
`

const StyledListItemText = styled(ListItemText)`
  margin-top: 6px;
`

const StyledListSubItemText = styled(ListItemText)``

const TextAndBadgeWrapper = styled.div`
  flex: 1 1 auto;
`

const StyledBadge = styled(Badge)`
  .MuiBadge-badge {
    top: 50%;
    right: -1rem;
  }
`

const StyledSubListMui = styled(ListMui)<ListProps<any>>`
  position: relative;

  a {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -25px;

      height: 50%;
      width: 16px;
      background-color: transparent;

      border-left: 2px solid #404047;
      border-bottom: 2px solid #404047;
      border-bottom-left-radius: 8px;
    }
  }
`

const StyledFixedIcon = styled(FixedIcon)`
  color: 'blue';
`

export {
  useStyles,
  StyledListItem,
  StyledListSubItem,
  StyledListItemText,
  StyledListSubItemText,
  TextAndBadgeWrapper,
  StyledBadge,
  StyledSubListMui,
  StyledFixedIcon,
}
