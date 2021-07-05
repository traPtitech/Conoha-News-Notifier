export interface NotificationsResponse {
  notifications: Notification[]
}

export interface TokenResponse {
  access: {
    token: Token
  }
}

interface Notification {
  notificationCode: number
  title: string
  type: string | null
  contents: string
  readStatus: string
  startDate: string
}

interface Token {
  id: string
}
