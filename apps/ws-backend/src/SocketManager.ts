export class SocketManager {
  private static instance: SocketManager;
  private users: Map<string, any>; //userId-->socket
  private rooms: Map<string, Set<string>>; //roomId-->Set of userIds
  private userRooms: Map<string, Set<string>>; //userId-->Set of roomIds

  private constructor() {
    this.users = new Map();
    this.rooms = new Map();
    this.userRooms = new Map();
  }

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  addUser(userId: string, socket: any) {
    if (!this.users.has(userId)) {
      this.users.set(userId, socket);
    }
  }

  removeUser(userId: string) {
    this.users.delete(userId);

    const rooms = this.userRooms.get(userId); //Find how many rooms user is in
    if (rooms) {
      rooms.forEach((roomId) => {
        const room = this.rooms.get(roomId); //Find the room
        if (room) {
          room.delete(userId); //Remove user from each room
          if (room.size === 0) {
            //If room is empty, delete it
            this.rooms.delete(roomId);
          }
        }
      });
      this.userRooms.delete(userId); //Remove user from userRooms
    }
  }

  getUserSocket(userId: string) {
    return this.users.get(userId);
  }

  getAllUsers() {
    return Array.from(this.users.keys());
  }

  joinRoom(userId: string, roomId: string) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(userId);
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    this.userRooms.get(userId)!.add(roomId);
  }

  leaveRoom(userId: string, roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(userId);
      if (room.size === 0) {
        this.rooms.delete(roomId);
      }
    }
    const userRoomSet = this.userRooms.get(userId);
    if (userRoomSet) {
      userRoomSet.delete(roomId);
      if (userRoomSet.size === 0) {
        this.userRooms.delete(userId);
      }
    }
  }

  broadcastToRoom(roomId: string, message: string) {
    const room = this.rooms.get(roomId);
    //@ts-ignore
    console.log("Current users in room:", Array.from(room));
    if (room) {
      room.forEach((userId) => {
        const socket = this.users.get(userId);
        if (socket && socket.readyState === socket.OPEN) {
          socket.send(message);
        }
      });
    }
  }

  getRoomsOfUser(userId: string) {
    return Array.from(this.userRooms.get(userId) || []);
  }

  getUsersInRoom(roomId: string) {
    return Array.from(this.rooms.get(roomId) || []);
  }
}
