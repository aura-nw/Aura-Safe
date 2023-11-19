import { lg, md, sm } from 'src/theme/variables'
import { createStyles } from '@material-ui/core'
import styled from 'styled-components'

import { Button, ButtonLink } from '@aura/safe-react-components'

export const styles = createStyles({
  formContainer: {
    minHeight: '250px',
  },
  title: {
    padding: lg,
    paddingBottom: 0,
  },
  annotation: {
    paddingLeft: lg,
  },
  hide: {
    // '&:hover': {
    //   backgroundColor: '#f7f5f5',
    // },
    '& $actions': {
      visibility: 'initial',
    },
  },
  actions: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    visibility: 'hidden',
    minWidth: '100px',
    gap: md,
  },
  noBorderBottom: {
    '& > td': {
      borderBottom: 'none',
    },
  },
  controlsRow: {
    backgroundColor: 'white',
    padding: lg,
    borderRadius: sm,
  },
  editEntryButton: {
    cursor: 'pointer',
  },
  editEntryButtonNonOwner: {
    cursor: 'pointer',
  },
  removeEntryButton: {
    cursor: 'pointer',
  },
  removeEntryButtonDisabled: {
    cursor: 'default',
  },
  removeEntryButtonNonOwner: {
    cursor: 'pointer',
  },
  leftIcon: {
    marginRight: sm,
  },
  iconSmall: {
    fontSize: 16,
  },
  tableCell: {
    // padding: '6px 0px',
    height: '56px',
  },
})

const StyledButtonLink = styled(ButtonLink)`
  text-decoration: none !important;
  p {
    color: #5ee6d0;
  }
  span {
    fill: #5ee6d0 !important;
  }
`
export { StyledButtonLink }
