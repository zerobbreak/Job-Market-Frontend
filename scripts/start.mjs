// Cross-platform production server start — `vite preview --port ${PORT}` relies on
// shell parameter expansion, which cmd.exe (Windows' default npm shell) doesn't support.
import { preview } from "vite";

const port = Number(process.env.PORT) || 3000;

const server = await preview({ preview: { host: "0.0.0.0", port } });
server.printUrls();
