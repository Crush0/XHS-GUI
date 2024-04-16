// import net from 'node:net'

// 动态设置端口（未实现）
export const getAvailablePort = (startPort: number) => {
    return startPort
//   let port = startPort
//   while (port < 65535) {
//     try {
//       const server = net.createServer()
//       await new Promise<void>((resolve) => {
//         server.listen(port, () => {
//           server.close(() => {
//             resolve()
//           })
//         })
//       })
//       return port
//     } catch (e) {
//       port++
//     }
//   }
//   throw new Error('No available port found')
}
