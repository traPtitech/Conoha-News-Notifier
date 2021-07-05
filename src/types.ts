export interface NotificationsResponse {
  notifications: Notification[]
}

interface Notification {
  notificationCode: number
  title: string
  type: string
  contents: string
  readStatus: string
  startDate: Date
}
