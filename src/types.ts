export interface NotificationsResponse {
  notifications: Notification[]
}

export interface TokenResponse {
  access: {
    token: Token
  }
}

interface Notification {
  notification_code: number
  title: string
  type: string | null
  contents: string
  read_status: string
  start_date: string
}

interface Token {
  id: string
}
