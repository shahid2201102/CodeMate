// import { io } from "socket.io-client";

// let socketInstance = null;

// export const initializeSocket = () => {
//     // 1. Check if a socket is already connected. If so, don't create a new one.
//     if (socketInstance && socketInstance.connected) {
//         return socketInstance;
//     }

//     // 2. Fix the race condition: Do not connect if no token exists.
//     const token = localStorage.getItem('token');
//     if (!token) {
//         console.error("Socket Error: Cannot connect. No token found in localStorage.");
//         return null; // Return null to indicate failure.
//     }

//     console.log("Attempting to connect socket...");
    
//     // 3. Initialize the socket with the token.
//     socketInstance = io(import.meta.env.VITE_API_URL, {
//         auth: {
//             token: token
//         }
//     });

//     // 4. Add listeners for debugging. This is essential.
//     socketInstance.on('connect', () => {
//         console.log('Frontend: Socket connected successfully! ID:', socketInstance.id);
//     });

//     socketInstance.on('connect_error', (err) => {
//         console.error('Frontend: Socket connection failed:', err.message);
//     });

//     return socketInstance;
// };

// // Function to clean up the connection
// export const disconnectSocket = () => {
//     if (socketInstance) {
//         console.log("Frontend: Disconnecting socket.");
//         socketInstance.disconnect();
//         socketInstance = null; // Clear the instance for a clean state
//     }
// };




import { io } from "socket.io-client";

let socketInstance = null;

export const initializeSocket = (projectId) => {
    if (!socketInstance) {
        socketInstance = io(import.meta.env.VITE_API_URL, {
            auth: {
                token: localStorage.getItem('token')
            },
            query: {
                projectId
            }
        });
    }
    return socketInstance;
}; 

export const receiveMessage = (eventName, cb) => {
    socketInstance.on(eventName, cb);
}

export const sendMessage = (eventName, data) => {
    socketInstance.emit(eventName, data);
}