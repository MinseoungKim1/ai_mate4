const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http"); // 💡 추가: HTTP 서버 모듈
const { Server } = require("socket.io"); // 💡 추가: Socket.io 모듈

dotenv.config();

const app = express();
const server = http.createServer(app); // 💡 Express를 http 서버로 감싸기

// Socket.io 초기화 (CORS 설정 포함)
const io = new Server(server, {
  cors: {
    origin: "*", // 프론트엔드 배포 주소에 맞춰 설정 (예: "http://localhost:5173")
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// 기존 라우트들
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const historyRoutes = require("./src/routes/historyRouters");

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/history", historyRoutes);

// 💡 실시간 소켓 컨트롤러 연결
const socketController = require("./src/controllers/socketcontroller");
io.on("connection", (socket) => {
  socketController(io, socket);
});

const PORT = process.env.PORT || 3000;

// 💡 app.listen 대신 server.listen을 사용해야 소켓과 익스프레스가 동시에 돌아갑니다.
server.listen(PORT, () => {
  console.log(`🚀 AI Mate 서버 가동: http://localhost:${PORT}`);
});
