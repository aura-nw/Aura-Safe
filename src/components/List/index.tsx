import { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import ListMui from '@material-ui/core/List'
import Collapse from '@material-ui/core/Collapse'
import IconButton from '@material-ui/core/IconButton'

import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import {
  useStyles,
  StyledListItem,
  StyledListSubItem,
  StyledListItemText,
  StyledListSubItemText,
  TextAndBadgeWrapper,
  StyledBadge,
  StyledSubListMui,
} from './styles'
export type ListItemType = {
  badge?: boolean
  disabled?: boolean
  label: string
  href: string
  icon?: React.ReactNode
  selected?: boolean
  subItems?: ListItemType[]
}

const isSubItemSelected = (item: ListItemType): boolean => item.subItems?.some(({ selected }) => selected) || false

type Props = {
  items: ListItemType[]
}

const List = ({ items }: Props): React.ReactElement => {
  const classes = useStyles()
  const history = useHistory()
  const [groupCollapseStatus, setGroupCollapseStatus] = useState({})

  const onItemClick = (item: ListItemType, event: MouseEvent) => {
    if (item.subItems) {
      // When we are viewing a subItem of this element we just toggle the expand status
      // preventing navigation
      isSubItemSelected(item) && event.preventDefault()
      // When clicking we toogle item status
      setGroupCollapseStatus((prevStatus) => {
        return { ...prevStatus, ...{ [item.href]: prevStatus[item.href] ? false : true } }
      })
    }
  }

  const getListItem = (item: ListItemType, isSubItem = true) => {
    const onClick = (e) => onItemClick(item, e)

    const ListItemAux = isSubItem ? StyledListSubItem : StyledListItem
    const ListItemTextAux = isSubItem ? StyledListSubItemText : StyledListItemText

    return (
      <ListItemAux
        button
        // For some reason when wrapping a MUI component with styled() component prop gets lost in types
        // But this prop is totally valid
        // eslint-disable-next-line
        // @ts-ignore
        component={Link}
        to={item.href}
        key={item.label}
        onClick={onClick}
        selected={item.selected || isSubItemSelected(item)}
      >
        {item.icon && item.icon}

        <TextAndBadgeWrapper>
          <StyledBadge badgeContent=" " color="error" invisible={!item.badge} variant="dot">
            <ListItemTextAux primary={item.label} />
          </StyledBadge>
        </TextAndBadgeWrapper>

        {
          item.subItems && (
            <IconButton disableRipple>{groupCollapseStatus[item.href] ? <ExpandLess /> : <ExpandMore />}</IconButton>
          )
          // (groupCollapseStatus[item.href] ? <StyledFixedIcon type="chevronUp"/> : <StyledFixedIcon type="chevronDown" />)
        }
      </ListItemAux>
    )
  }

  useEffect(() => {
    // In the current implementation we only want to allow one expanded item at a time
    // When we click any entry that is not a subItem we want to collapse all current expanded items
    setGroupCollapseStatus({})

    items.forEach((item) => {
      if (isSubItemSelected(item)) {
        setGroupCollapseStatus((prevStatus) => ({ ...prevStatus, ...{ [item.href]: true } }))
      }
    })
  }, [items, history.action, history.location.pathname])

  return (
    <ListMui component="nav" aria-labelledby="nested-list-subheader" className={classes.root}>
      {items
        .filter(({ disabled }) => !disabled)
        .map((item) => (
          <div key={item.label}>
            {getListItem(item, false)}
            {item.subItems && (
              <Collapse in={groupCollapseStatus[item.href]} timeout="auto" unmountOnExit>
                <StyledSubListMui component="div" disablePadding>
                  {item.subItems.filter(({ disabled }) => !disabled).map((subItem) => getListItem(subItem))}
                </StyledSubListMui>
              </Collapse>
            )}
          </div>
        ))}
    </ListMui>
  )
}

export default List
