import { execFile, spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join, resolve } from "node:path";

const root = resolve(".");
const outDir = join(root, "tmp", "presentation-video");
const framesDir = join(outDir, "frames");
const frameList = join(outDir, "frames.txt");
const audioList = join(outDir, "audio.txt");
const audioOut = join(outDir, "voiceover.m4a");
const videoOut = join(outDir, "visuals.mp4");
const finalOut = join(root, "assets", "lead-acquisition-presentation.mp4");
const slideCount = 16;
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ffmpegPath = process.env.FFMPEG_PATH || "ffmpeg";
const ffprobePath = process.env.FFPROBE_PATH || "ffprobe";
const port = 5189;
const debugPort = 9223;

function run(command, args, options = {}) {
  return new Promise((resolveRun, reject) => {
    execFile(command, args, { cwd: root, windowsHide: true, ...options }, (error, stdout, stderr) => {
      if (error) {
        error.message += `\n${stderr || stdout}`;
        reject(error);
        return;
      }
      resolveRun(stdout);
    });
  });
}

function serveStatic() {
  const mime = {
    ".css": "text/css",
    ".js": "text/javascript",
    ".html": "text/html",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".mp3": "audio/mpeg"
  };

  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url || "/", `http://127.0.0.1:${port}`);
      const pathname = url.pathname === "/" ? "/presentation.html" : url.pathname;
      const safePath = resolve(root, pathname.slice(1));
      if (!safePath.startsWith(root)) {
        response.writeHead(403);
        response.end();
        return;
      }
      const body = await readFile(safePath);
      const ext = pathname.slice(pathname.lastIndexOf("."));
      response.writeHead(200, { "content-type": mime[ext] || "application/octet-stream" });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end();
    }
  });

  return new Promise((resolveServer) => {
    server.listen(port, "127.0.0.1", () => resolveServer(server));
  });
}

async function cdpRequest(method, path = "/json/version") {
  const response = await fetch(`http://127.0.0.1:${debugPort}${path}`);
  if (!response.ok) throw new Error(`${method} failed: ${response.status}`);
  return response.json();
}

function createCdpClient(webSocketDebuggerUrl) {
  const socket = new WebSocket(webSocketDebuggerUrl);
  let nextId = 1;
  const pending = new Map();

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolveMessage, rejectMessage } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) rejectMessage(new Error(message.error.message));
    else resolveMessage(message.result || {});
  });

  return new Promise((resolveClient, reject) => {
    socket.addEventListener("open", () => {
      resolveClient({
        send(method, params = {}) {
          const id = nextId++;
          socket.send(JSON.stringify({ id, method, params }));
          return new Promise((resolveMessage, rejectMessage) => {
            pending.set(id, { resolveMessage, rejectMessage });
          });
        },
        close() {
          socket.close();
        }
      });
    });
    socket.addEventListener("error", reject);
  });
}

async function waitForChrome() {
  const started = Date.now();
  while (Date.now() - started < 10000) {
    try {
      await cdpRequest("version");
      const targets = await cdpRequest("list", "/json/list");
      const page = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
      if (page) return page;
    } catch {
      await new Promise((resolveWait) => setTimeout(resolveWait, 250));
    }
  }
  throw new Error("Chrome debugging port did not become ready.");
}

async function getAudioDuration(file) {
  const output = await run(ffprobePath, [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    file
  ]);
  return Math.max(3.2, Number.parseFloat(output.trim()) + 0.35);
}

async function main() {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(framesDir, { recursive: true });

  const server = await serveStatic();
  const chrome = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${debugPort}`,
    "--disable-gpu",
    "--hide-scrollbars",
    "--mute-audio",
    "--window-size=1280,720",
    `http://127.0.0.1:${port}/presentation.html`
  ], { stdio: "ignore", windowsHide: true });

  try {
    const version = await waitForChrome();
    const client = await createCdpClient(version.webSocketDebuggerUrl);
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 720,
      deviceScaleFactor: 1,
      mobile: false
    });
    await client.send("Page.navigate", { url: `http://127.0.0.1:${port}/presentation.html` });
    await new Promise((resolveWait) => setTimeout(resolveWait, 1200));

    const durations = [];
    const frameLines = [];
    const audioLines = [];

    for (let index = 0; index < slideCount; index += 1) {
      const slideNumber = String(index + 1).padStart(2, "0");
      const audioPath = `assets/voiceover/slide-${slideNumber}.mp3`;
      const duration = await getAudioDuration(audioPath);
      durations.push(duration);
      audioLines.push(`file '${resolve(root, audioPath).replaceAll("\\", "/")}'`);

      await client.send("Runtime.evaluate", {
        expression: `
          window.stopVoiceover?.();
          window.updateSlide?.(${index});
          document.querySelector(".deck-footer")?.style.setProperty("display", "none");
          document.querySelector(".deck-header")?.style.setProperty("display", "none");
          document.body.style.overflow = "hidden";
        `,
        awaitPromise: true
      });
      await new Promise((resolveWait) => setTimeout(resolveWait, 900));
      const screenshot = await client.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
        captureBeyondViewport: false
      });
      const framePath = join(framesDir, `slide-${slideNumber}.png`);
      await writeFile(framePath, Buffer.from(screenshot.data, "base64"));
      frameLines.push(`file '${framePath.replaceAll("\\", "/")}'`);
      frameLines.push(`duration ${duration.toFixed(3)}`);
    }

    const lastFrame = join(framesDir, `slide-${String(slideCount).padStart(2, "0")}.png`);
    frameLines.push(`file '${lastFrame.replaceAll("\\", "/")}'`);
    await writeFile(frameList, `${frameLines.join("\n")}\n`);
    await writeFile(audioList, `${audioLines.join("\n")}\n`);
    client.close();
  } finally {
    chrome.kill();
    server.close();
  }

  await run(ffmpegPath, [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", audioList,
    "-c:a", "aac",
    "-b:a", "96k",
    audioOut
  ]);

  await run(ffmpegPath, [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", frameList,
    "-vf", "fps=24,scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,format=yuv420p",
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "29",
    "-movflags", "+faststart",
    videoOut
  ]);

  await run(ffmpegPath, [
    "-y",
    "-i", videoOut,
    "-i", audioOut,
    "-map", "0:v:0",
    "-map", "1:a:0",
    "-c:v", "copy",
    "-c:a", "aac",
    "-b:a", "96k",
    "-shortest",
    "-movflags", "+faststart",
    finalOut
  ]);

  console.log(`Created ${finalOut}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
