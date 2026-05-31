import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiKey = process.env.MIMO_API_KEY;
const baseUrl = (process.env.MIMO_BASE_URL || "https://token-plan-cn.xiaomimimo.com/v1").replace(/\/$/, "");
const model = process.env.MIMO_TTS_MODEL || "mimo-v2.5-tts";
const format = process.env.MIMO_TTS_FORMAT || "mp3";
const force = process.argv.includes("--force");
const dryRun = process.argv.includes("--dry-run");
const limitIndex = process.argv.indexOf("--limit");
const limit = limitIndex >= 0 ? Number(process.argv[limitIndex + 1]) : Number.POSITIVE_INFINITY;
const idsIndex = process.argv.indexOf("--ids");
const ids = idsIndex >= 0 ? new Set(process.argv[idsIndex + 1]?.split(",").map((id) => id.trim()).filter(Boolean)) : null;

if (!apiKey && !dryRun) {
  console.error("Missing MIMO_API_KEY. Set it in the shell, then run this script again.");
  process.exit(1);
}

const transpileToTempModule = (sourcePath, outFile) => {
  const source = fs.readFileSync(sourcePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove
    },
    fileName: sourcePath
  }).outputText;

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, output);
};

const tmpDir = path.join(os.tmpdir(), `happy-order-voices-${Date.now()}`);
const eventModulePath = path.join(tmpDir, "orderProgressEngine.mjs");
const cueModulePath = path.join(tmpDir, "orderVoiceCues.mjs");

transpileToTempModule(path.join(rootDir, "src", "lib", "orderProgressEngine.ts"), eventModulePath);
transpileToTempModule(path.join(rootDir, "src", "data", "orderVoiceCues.ts"), cueModulePath);

const [{ orderProgressEventBank }, { getOrderVoiceCue }] = await Promise.all([
  import(pathToFileURL(eventModulePath).href),
  import(pathToFileURL(cueModulePath).href)
]);

const selectedEvents = ids ? orderProgressEventBank.filter((event) => ids.has(event.id)) : orderProgressEventBank;
const events = selectedEvents.slice(0, Number.isFinite(limit) ? limit : undefined);
const endpoint = `${baseUrl}/chat/completions`;

const writeVoice = async (event) => {
  const cue = getOrderVoiceCue(event);
  const outputPath = path.join(rootDir, "public", "audio", "voice", "order-progress", event.id, "message.mp3");

  if (!force && fs.existsSync(outputPath)) {
    console.log(`skip ${event.id}`);
    return;
  }

  console.log(`${dryRun ? "plan" : "voice"} ${event.id}: ${cue.voice} / ${cue.text}`);
  if (dryRun) return;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "user", content: cue.style },
        { role: "assistant", content: cue.text }
      ],
      audio: {
        format,
        voice: cue.voice
      }
    })
  });

  const payloadText = await response.text();
  if (!response.ok) {
    throw new Error(`MiMo TTS failed for ${event.id}: ${response.status} ${payloadText.slice(0, 240)}`);
  }

  const payload = JSON.parse(payloadText);
  const audioData = payload.choices?.[0]?.message?.audio?.data;
  if (!audioData) {
    throw new Error(`MiMo TTS response did not include audio data for ${event.id}: ${payloadText.slice(0, 240)}`);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(audioData, "base64"));
};

try {
  for (const event of events) {
    await writeVoice(event);
  }
  console.log(`done ${events.length} order voice cue(s)`);
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
