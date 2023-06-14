export const socket = new WebSocket("ws://localhost:8080/ws");
console.log("Attempting Connection...");

socket.onopen = () => {
    console.log("Successfully Connected");
};

socket.onmessage = (m) => {
    document.getElementById("congrats").innerHTML = m.data
};

socket.onclose = event => {
    console.log("Socket Closed Connection: ", event);
};

socket.onerror = error => {
    console.log("Socket Error: ", error);
};