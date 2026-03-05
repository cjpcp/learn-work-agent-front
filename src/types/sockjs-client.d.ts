declare module 'sockjs-client' {
  interface SockJSClass {
    new (url: string): WebSocket
  }
  const SockJS: SockJSClass
  export default SockJS
}

declare module 'sockjs-client/dist/sockjs.min.js' {
  interface SockJSClass {
    new (url: string): WebSocket
  }
  const SockJS: SockJSClass
  export default SockJS
}
