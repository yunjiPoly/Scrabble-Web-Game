export interface Message {
    type: string;
    text: string;
}
export enum MessageType {
    System = 'system-message',
    User = 'user-message',
    Own = 'own-message',
}
