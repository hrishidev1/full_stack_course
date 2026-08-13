import styled from 'styled-components'

const NotificationContainer = styled.div`
  margin: 16px 0;
  padding: 12px 16px;
  border: 1px solid;
  border-radius: 6px;
  font-weight: 600;
  background: #f5f5f5;
`

const Notification = ({ message, type }) => {
  if (!message) {
    return null
  }

  return (
    <NotificationContainer className={type}>
      {message}
    </NotificationContainer>
  )
}

export default Notification