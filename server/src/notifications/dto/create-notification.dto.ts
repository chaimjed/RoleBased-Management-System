export interface CreateNotification {
  userId: string;
  type: string;
  message: string;
  data?:Record<string,any>
  isRead?:boolean
}