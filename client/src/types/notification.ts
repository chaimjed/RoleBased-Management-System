export interface Notification {
  id: string
  userId: string
  type: string
  message: string
  isRead: boolean
  data: { jobId?: string ;status?:"preparing"|"ready";fileUrl?:string} | null
  createdAt: string
}
