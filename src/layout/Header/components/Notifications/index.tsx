import styled from 'styled-components'
import Bell from 'src/assets/icons/Bell.svg'
import Checks from 'src/assets/icons/Checks.svg'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Notification from './Notification'

import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Grow from '@material-ui/core/Grow'
import List from '@material-ui/core/List'
import Popper from '@material-ui/core/Popper'
import { useStateHandler } from 'src/logic/hooks/useStateHandler'
import { getAllNotifications, markNotificationAsRead } from 'src/services'
import { useSelector } from 'react-redux'
import { userAccountSelector } from 'src/logic/wallets/store/selectors'
import { OutlinedNeutralButton } from 'src/components/Button'

const Wrap = styled.div`
  height: 100%;
  padding: 0px 25px;
  display: flex;
  border-left: 1px solid #3e3f40;
  position: relative;
  justify-content: center;
  align-items: center;

  > img {
    cursor: pointer;
  }
  .noti-badge {
    position: absolute;
    background-color: red;
    top: calc(50% - 10px);
    right: calc(50% - 10px);
    transform: translate(50%, -50%);
    font-size: 12px;
    padding: 2px 4px;
    border-radius: 50px;
    min-width: 12px;
    height: 16px;
    text-align: center;
  }
`
const NotiWrap = styled.div`
  width: 320px;
  position: absolute;
  background: #24262e;
  box-shadow: 0px 4px 40px rgba(0, 0, 0, 0.9);
  border-radius: 4px;
  overflow-x: hidden;
  overflow-y: auto;
  &.show-all > .noti-wrapper {
    max-height: 650px;
  }
  > .noti-wrapper {
    overflow: auto;
  }
  .no-noti {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    > svg {
      margin-bottom: 16px;
    }
  }
`
const Header = styled.div`
  padding: 18px 16px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .title {
    font-weight: 600;
    font-size: 22px;
    line-height: 28px;
    margin: 0;
  }
  .mark-all {
    display: flex;
    cursor: pointer;
    > img {
      margin-left: 6px;
    }
  }
`
const SeeAll = styled.div`
  padding: 18px 16px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`
export default function Notifications() {
  const { clickAway, open, toggle } = useStateHandler()
  const userWalletAddress = useSelector(userAccountSelector)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const [allNotification, setAllNotification] = useState([])
  const [markedNoti, setMarkedNoti] = useState([])

  const [seeAll, setSeeAll] = useState(false)
  const [lasttimeOpen, setLasttimeOpen] = useState(new Date().getTime())
  const [unreadNoti, setUnreadNoti] = useState(0)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setLasttimeOpen(new Date().getTime())
    setAnchorEl(event.currentTarget)
    toggle()
  }
  const loadNotification = async () => {
    if (!userWalletAddress) {
      setAllNotification([])
      setUnreadNoti(0)
      return
    }
    const res = await getAllNotifications()
    if (res.Data) {
      setAllNotification(res.Data)
    }
  }

  const markNotiAsRead = async () => {
    try {
      if (markedNoti.length == 0) return
      const res = await markNotificationAsRead(markedNoti)
      if (res.Data) {
        await loadNotification()
        setMarkedNoti([])
      }
    } catch (error) {
      console.log(error)
    }
  }

  const markAllAsRead = async () => {
    const allNoti = allNotification.filter((n: any) => n.status == 'UNREAD').map((n: any) => n.id)
    try {
      if (allNoti.length == 0) return
      const res = await markNotificationAsRead(allNoti)
      if (res.Data) {
        await loadNotification()
        setUnreadNoti(0)
        setMarkedNoti([])
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    loadNotification()
    const win: any = window
    if (win?.notificationIntervalId) {
      clearInterval(win?.notificationIntervalId)
    }
    win.notificationIntervalId = setInterval(loadNotification, 30000)
    return () => clearInterval(win?.notificationIntervalId)
  }, [userWalletAddress])

  useEffect(() => {
    if (!open) {
      markNotiAsRead()
    }
  }, [open])

  useEffect(() => {
    const unread = allNotification.filter(
      (n: any) => n.status == 'UNREAD' && !markedNoti.includes(n.id as never),
    ).length
    setUnreadNoti(unread)
  }, [allNotification.length, markedNoti.length])

  return (
    <>
      <Wrap onClick={handleClick}>
        <img src={Bell} alt="" />
        {unreadNoti == 0 ? null : <div className={`noti-badge`}>{unreadNoti}</div>}
      </Wrap>
      {open && (
        <Popper
          anchorEl={anchorEl}
          open={open}
          placement="bottom"
          popperOptions={{ positionFixed: true }}
          style={{ zIndex: 1999 }}
        >
          {({ TransitionProps }) => (
            <Grow {...TransitionProps}>
              <ClickAwayListener mouseEvent="onClick" onClickAway={clickAway} touchEvent={false}>
                <NotiWrap className={seeAll ? 'show-all' : ''}>
                  <Header>
                    <p className="title">Notification</p>
                    <div className="mark-all" onClick={markAllAsRead}>
                      <p>Mark all read</p>
                      <img src={Checks} alt="" />
                    </div>
                  </Header>
                  <div className="noti-wrapper">
                    {allNotification.length == 0 ? (
                      <div className="no-noti">
                        <svg width="52" height="49" viewBox="0 0 52 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="24.51" cy="31.846" r="17" fill="#BEBEBE" fillOpacity="0.1"></circle>
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M27.429 14.094c2.143-2.08 5.05-3.248 8.081-3.248 3.031 0 5.938 1.168 8.081 3.248s3.347 4.9 3.347 7.84c0 4.849 1.068 7.803 2.007 9.473.473.84.925 1.38 1.224 1.685.15.154.263.25.322.298.02.017.035.027.042.033.81.548 1.166 1.54.879 2.46-.292.936-1.18 1.576-2.188 1.576H21.796c-1.007 0-1.896-.64-2.188-1.575-.287-.92.07-1.913.88-2.461l.041-.033c.06-.048.172-.144.322-.298.299-.306.751-.844 1.224-1.685.939-1.67 2.007-4.624 2.007-9.472 0-2.941 1.204-5.762 3.347-7.841Zm17.23 18.93c-1.234-2.4-2.292-5.962-2.292-11.09a6.554 6.554 0 0 0-2.008-4.704 6.965 6.965 0 0 0-4.849-1.949c-1.819 0-3.563.701-4.849 1.95a6.554 6.554 0 0 0-2.008 4.704c0 5.127-1.058 8.688-2.292 11.088H44.66Zm-12.932 6.213c1.092-.615 2.49-.254 3.124.805a.75.75 0 0 0 .279.27.78.78 0 0 0 .76 0 .75.75 0 0 0 .279-.27c.634-1.06 2.032-1.42 3.124-.805 1.092.614 1.464 1.971.83 3.03a5.257 5.257 0 0 1-1.951 1.888 5.46 5.46 0 0 1-2.662.691 5.46 5.46 0 0 1-2.662-.69 5.259 5.259 0 0 1-1.951-1.888c-.634-1.06-.262-2.417.83-3.031Z"
                            fill="#DBDBDB"
                          ></path>
                          <path
                            d="M0 17.846h5.684v-1.512H2.45l-.014-.028 3.332-4.06V11H.252v1.512h3.024l.014.042L0 16.586v1.26ZM10 13.846h5.684v-1.512H12.45l-.014-.028 3.332-4.06V7h-5.516v1.512h3.024l.014.042L10 12.586v1.26ZM2 6.846h5.684V5.334H4.45l-.014-.028 3.332-4.06V0H2.252v1.512h3.024l.014.042L2 5.586v1.26Z"
                            fill="#DBDBDB"
                          ></path>
                        </svg>
                        No notifications
                      </div>
                    ) : seeAll ? (
                      allNotification.map((notification: any, index) => {
                        return (
                          <Notification
                            isUnread={
                              markedNoti.includes(notification.id as never) ? false : notification.status == 'UNREAD'
                            }
                            key={index}
                            toggle={toggle}
                            data={notification}
                            setMarkedNoti={setMarkedNoti}
                          />
                        )
                      })
                    ) : (
                      allNotification.slice(0, 5).map((notification: any, index) => {
                        return (
                          <Notification
                            isUnread={
                              markedNoti.includes(notification.id as never) ? false : notification.status == 'UNREAD'
                            }
                            key={index}
                            toggle={toggle}
                            data={notification}
                            setMarkedNoti={setMarkedNoti}
                          />
                        )
                      })
                    )}
                  </div>
                  {!seeAll && allNotification.length > 5 && (
                    <SeeAll>
                      <OutlinedNeutralButton onClick={() => setSeeAll(true)} className="small">
                        See all
                      </OutlinedNeutralButton>
                    </SeeAll>
                  )}
                </NotiWrap>
              </ClickAwayListener>
            </Grow>
          )}
        </Popper>
      )}
    </>
  )
}
