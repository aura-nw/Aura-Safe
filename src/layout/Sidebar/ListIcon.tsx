import { useMemo } from 'react'
import styled from 'styled-components'

const StyledIcon = styled.div`
  margin-right: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
`

type Props = {
  type: any
}

const ListItemIcon = ({ type }: Props): React.ReactElement => {
  return (
    <StyledIcon>
      {useMemo(() => {
        switch (type) {
          case 'assestAura':
            return (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M7.5 9.375C10.9518 9.375 13.75 8.1158 13.75 6.5625C13.75 5.0092 10.9518 3.75 7.5 3.75C4.04822 3.75 1.25 5.0092 1.25 6.5625C1.25 8.1158 4.04822 9.375 7.5 9.375Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M1.25 6.5625V9.6875C1.25 11.2422 4.04687 12.5 7.5 12.5C10.9531 12.5 13.75 11.2422 13.75 9.6875V6.5625"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 9.14062V12.2656"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.75 7.55469C16.6016 7.82031 18.75 8.95313 18.75 10.3125C18.75 11.8672 15.9531 13.125 12.5 13.125C10.9687 13.125 9.5625 12.875 8.47656 12.4688"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.25 12.4453V13.4375C6.25 14.9922 9.04687 16.25 12.5 16.25C15.9531 16.25 18.75 14.9922 18.75 13.4375V10.3125"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 12.8906V16.0156"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 9.14062V16.0156"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )
          case 'transactionsAura':
            return (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M17.8125 16.25H2.1875"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7.8125 16.25V6.875H12.1875"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.5625 3.125H12.1875V16.25H16.5625V3.125Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.4375 16.25V10.625H7.8125"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )
          case 'stakingAura':
            return (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M17.219 13.265L17.2191 13.2652L17.223 13.2625C17.2869 13.2184 17.3591 13.1881 17.4353 13.1733C17.5115 13.1586 17.5898 13.1598 17.6655 13.1768C17.7412 13.1938 17.8126 13.2262 17.8751 13.2721C17.9376 13.318 17.99 13.3764 18.0289 13.4435C18.0678 13.5106 18.0924 13.585 18.1011 13.6621C18.1099 13.7392 18.1026 13.8172 18.0798 13.8913C18.0569 13.9655 18.019 14.0341 17.9683 14.0928C17.9177 14.1516 17.8554 14.1992 17.7855 14.2328L17.7854 14.2326L17.781 14.2351L10.281 18.6101L10.2805 18.6105C10.1957 18.6611 10.0988 18.6878 10 18.6878C9.90127 18.6878 9.80436 18.6611 9.71958 18.6105L9.71902 18.6101L2.22111 14.2364C2.10554 14.156 2.02428 14.0352 1.99341 13.8978C1.96238 13.7597 1.98459 13.6149 2.0556 13.4924C2.1266 13.3699 2.24119 13.2787 2.37649 13.237C2.51101 13.1955 2.65616 13.206 2.78329 13.2663L9.96857 17.4525L10 17.4708L10.0315 17.4525L17.219 13.265Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="0.125"
                />
                <path
                  d="M17.219 9.515L17.2191 9.51515L17.223 9.51245C17.2869 9.46843 17.3591 9.43809 17.4353 9.42334C17.5115 9.4086 17.5898 9.40976 17.6655 9.42676C17.7412 9.44376 17.8126 9.47623 17.8751 9.52213C17.9376 9.56803 17.99 9.62637 18.0289 9.69348C18.0678 9.76058 18.0924 9.83501 18.1011 9.91208C18.1099 9.98916 18.1026 10.0672 18.0798 10.1413C18.0569 10.2155 18.019 10.2841 17.9683 10.3428C17.9177 10.4016 17.8554 10.4492 17.7855 10.4828L17.7854 10.4826L17.781 10.4851L10.281 14.8601L10.2805 14.8605C10.1957 14.9111 10.0988 14.9378 10 14.9378C9.90127 14.9378 9.80436 14.9111 9.71958 14.8605L9.71902 14.8601L2.22111 10.4864C2.10554 10.406 2.02428 10.2852 1.99341 10.1478C1.96238 10.0097 1.98459 9.8649 2.0556 9.74241C2.1266 9.61992 2.24119 9.52872 2.37649 9.487C2.51101 9.44552 2.65616 9.45599 2.78329 9.51629L9.96857 13.7025L10 13.7208L10.0315 13.7025L17.219 9.515Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="0.125"
                />
                <path
                  d="M9.71955 11.1101L9.71899 11.1097L2.21913 6.7348C2.13454 6.68517 2.0644 6.61429 2.01566 6.52919C1.96692 6.44409 1.94128 6.34772 1.94128 6.24965C1.94128 6.15158 1.96692 6.05521 2.01566 5.97011C2.0644 5.885 2.13454 5.81412 2.21913 5.76449L9.71899 1.38957L9.719 1.38958L9.71997 1.38899C9.80436 1.33768 9.90123 1.31055 10 1.31055C10.0988 1.31055 10.1956 1.33768 10.28 1.38899L10.28 1.389L10.281 1.38957L17.7809 5.76449C17.7809 5.7645 17.7809 5.7645 17.7809 5.7645C17.8655 5.81413 17.9356 5.88501 17.9843 5.97011C18.0331 6.05521 18.0587 6.15158 18.0587 6.24965C18.0587 6.34772 18.0331 6.44409 17.9843 6.52919C17.9356 6.61428 17.8655 6.68516 17.7809 6.73479C17.7809 6.73479 17.7809 6.7348 17.7809 6.7348L10.281 11.1097L10.2804 11.1101C10.1957 11.1607 10.0988 11.1874 10 11.1874C9.90124 11.1874 9.80433 11.1607 9.71955 11.1101Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="0.125"
                />
              </svg>
            )
          case 'votingAura':
            return (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3.125 17.5H16.875"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.75 10.625L7.35938 4.14063C7.30114 3.8672 7.30477 3.58421 7.37002 3.31237C7.43527 3.04054 7.56048 2.78673 7.73649 2.56953C7.91249 2.35233 8.13484 2.17724 8.38725 2.05707C8.63967 1.9369 8.91576 1.87469 9.19532 1.875H10.8047C11.0843 1.87469 11.3603 1.9369 11.6128 2.05707C11.8652 2.17724 12.0875 2.35233 12.2635 2.56953C12.4395 2.78673 12.5647 3.04054 12.63 3.31237C12.6952 3.58421 12.6989 3.8672 12.6406 4.14063L11.25 10.625"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.25 10.625H3.75C3.40482 10.625 3.125 10.9048 3.125 11.25V14.375C3.125 14.7202 3.40482 15 3.75 15H16.25C16.5952 15 16.875 14.7202 16.875 14.375V11.25C16.875 10.9048 16.5952 10.625 16.25 10.625Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )
          case 'smartContractAura':
            return (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M15.625 17.5H4.375C4.20924 17.5 4.05027 17.4342 3.93306 17.3169C3.81585 17.1997 3.75 17.0408 3.75 16.875V3.125C3.75 2.95924 3.81585 2.80027 3.93306 2.68306C4.05027 2.56585 4.20924 2.5 4.375 2.5H11.875L16.25 6.875V16.875C16.25 17.0408 16.1842 17.1997 16.0669 17.3169C15.9497 17.4342 15.7908 17.5 15.625 17.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.875 2.5V6.875H16.25"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7.5 10.625H12.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7.5 13.125H12.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )
          case 'addressbookAura':
            return (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M13.75 2.5V10L11.25 8.125L8.75 10V2.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.75002 16.875C3.74898 16.6285 3.79678 16.3842 3.89064 16.1563C3.9845 15.9283 4.12257 15.7212 4.29689 15.5469C4.4712 15.3726 4.67831 15.2345 4.90626 15.1406C5.13422 15.0468 5.3785 14.999 5.62502 15H16.25V2.50002H5.62502C5.3785 2.49898 5.13422 2.54678 4.90626 2.64064C4.67831 2.7345 4.4712 2.87257 4.29689 3.04689C4.12257 3.2212 3.9845 3.42831 3.89064 3.65626C3.79678 3.88422 3.74898 4.1285 3.75002 4.37502V16.875Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.75 16.875V17.5H15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )
          case 'settingsAura':
            return (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10 9.375V16.875"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 3.125V6.875"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.625 15.625V16.875"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.625 3.125V13.125"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17.5 13.125H13.75"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.375 13.125V16.875"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.375 3.125V10.625"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2.5 10.625H6.25"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.875 6.875H8.125"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )

          default:
            return (
              <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="3" cy="3" r="3" fill="currentColor" stroke="none" />
              </svg>
            )
        }
      }, [type])}
    </StyledIcon>
  )
}

export default ListItemIcon
