export interface NotificationsResponse {
  notifications: Notification[]
}

export interface TokenResponse {
  access: Token
}

interface Notification {
  notificationCode: number
  title: string
  type: string
  contents: string
  readStatus: string
  startDate: Date
}

interface Token {
  ID: string
}
