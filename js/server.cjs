var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, code, error, language, instruction } = req.body;
      const ai = new import_genai.GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const prompt = `\u3042\u306A\u305F\u306F\u30D7\u30ED\u30B0\u30E9\u30DF\u30F3\u30B0\u521D\u5B66\u8005\u5411\u3051\u306E\u512A\u3057\u3044AI\u30C1\u30E5\u30FC\u30BF\u30FC\u3067\u3059\u3002
\u30E6\u30FC\u30B6\u30FC\u306F\u73FE\u5728${language === "typescript" ? "TypeScript" : "JavaScript"}\u306E\u5B66\u7FD2\u4E2D\u3067\u3059\u3002

\u3010\u73FE\u5728\u306E\u30DF\u30C3\u30B7\u30E7\u30F3\u3011
${instruction}

\u3010\u30E6\u30FC\u30B6\u30FC\u306E\u73FE\u5728\u306E\u30B3\u30FC\u30C9\u3011
\`\`\`${language}
${code}
\`\`\`

\u3010\u30B3\u30F3\u30BD\u30FC\u30EB\u30A8\u30E9\u30FC\uFF08\u3042\u308C\u3070\uFF09\u3011
${error || "\u306A\u3057"}

\u3010\u30E6\u30FC\u30B6\u30FC\u306E\u8CEA\u554F\u30FB\u30B3\u30E1\u30F3\u30C8\u3011
${message}

\u4E0A\u8A18\u306E\u60C5\u5831\u3092\u5143\u306B\u3001\u30E6\u30FC\u30B6\u30FC\u306E\u8CEA\u554F\u306B\u7B54\u3048\u305F\u308A\u3001\u30A8\u30E9\u30FC\u306E\u539F\u56E0\u3092\u512A\u3057\u304F\u65E5\u672C\u8A9E\u3067\u89E3\u8AAC\u3057\u3066\u304F\u3060\u3055\u3044\u3002
\u7B54\u3048\u3092\u76F4\u63A5\u6559\u3048\u308B\u306E\u3067\u306F\u306A\u304F\u3001\u30D2\u30F3\u30C8\u3092\u51FA\u3057\u3066\u30E6\u30FC\u30B6\u30FC\u81EA\u8EAB\u304C\u6C17\u3065\u3051\u308B\u3088\u3046\u306B\u30B5\u30DD\u30FC\u30C8\u3057\u3066\u304F\u3060\u3055\u3044\u3002
\u5C02\u9580\u7528\u8A9E\u306F\u306A\u308B\u3079\u304F\u4F7F\u308F\u305A\u3001\u4F7F\u3046\u5834\u5408\u306F\u7C21\u5358\u306A\u89E3\u8AAC\u3092\u5165\u308C\u3066\u304F\u3060\u3055\u3044\u3002`;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt
      });
      res.json({ text: response.text });
    } catch (err) {
      console.error("AI Chat Error:", err);
      res.status(500).json({ error: "AI\u30A2\u30B7\u30B9\u30BF\u30F3\u30C8\u306B\u63A5\u7D9A\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002" });
    }
  });
  app.post("/api/explain-error", async (req, res) => {
    try {
      const { code, error, language, instruction } = req.body;
      const ai = new import_genai.GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });
      const prompt = `\u3042\u306A\u305F\u306F\u30D7\u30ED\u30B0\u30E9\u30DF\u30F3\u30B0\u521D\u5B66\u8005\u5411\u3051\u306EAI\u30C1\u30E5\u30FC\u30BF\u30FC\u3067\u3059\u3002
\u30E6\u30FC\u30B6\u30FC\u304C\u4EE5\u4E0B\u306E\u8AB2\u984C\u306B\u53D6\u308A\u7D44\u3093\u3067\u3044\u308B\u6700\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002
\u30A8\u30E9\u30FC\u306E\u539F\u56E0\u3068\u89E3\u6C7A\u306E\u30D2\u30F3\u30C8\u3092\u3001\u521D\u5B66\u8005\u5411\u3051\u306B\u300C\u6570\u884C\u7A0B\u5EA6\u3067\u8D85\u7C21\u6F54\u306B\u300D\u89E3\u8AAC\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u7B54\u3048\u306E\u30B3\u30FC\u30C9\u306F\u76F4\u63A5\u66F8\u304B\u306A\u3044\u3067\u304F\u3060\u3055\u3044\u3002

\u3010\u8AB2\u984C\u3011
${instruction}

\u3010\u8A00\u8A9E\u3011
${language}

\u3010\u30E6\u30FC\u30B6\u30FC\u306E\u30B3\u30FC\u30C9\u3011
\`\`\`${language}
${code}
\`\`\`

\u3010\u767A\u751F\u3057\u305F\u30A8\u30E9\u30FC\u3011
${error}
`;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt
      });
      res.json({ explanation: response.text });
    } catch (err) {
      console.error("Explain Error:", err);
      res.status(500).json({ error: "\u30A8\u30E9\u30FC\u306E\u5206\u6790\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002" });
    }
  });
  app.post("/api/generate-challenge", async (req, res) => {
    try {
      const { lesson, level } = req.body;
      const ai = new import_genai.GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });
      let promptModifier = "\u3053\u306E\u8AB2\u984C\u306B\u4F3C\u305F\u3001\u5C11\u3057\u3060\u3051\u5185\u5BB9\u3092\u5909\u66F4\u3057\u305F\u65B0\u3057\u3044\u30C1\u30E3\u30EC\u30F3\u30B8\u8AB2\u984C\u3092\u4F5C\u6210\u3057\u3066\u304F\u3060\u3055\u3044\u3002";
      if (level === "harder") {
        promptModifier = "\u3053\u306E\u8AB2\u984C\u306E\u77E5\u8B58\u3092\u5FDC\u7528\u3057\u3001\u5C11\u3057\u96E3\u6613\u5EA6\u3092\u4E0A\u3052\u305F\u65B0\u3057\u3044\u5FDC\u7528\u8AB2\u984C\u3092\u4F5C\u6210\u3057\u3066\u304F\u3060\u3055\u3044\u3002";
      }
      const prompt = `\u3042\u306A\u305F\u306F\u30D7\u30ED\u30B0\u30E9\u30DF\u30F3\u30B0\u521D\u5B66\u8005\u5411\u3051\u306EAI\u30C1\u30E5\u30FC\u30BF\u30FC\u3067\u3059\u3002
\u30E6\u30FC\u30B6\u30FC\u304C\u4EE5\u4E0B\u306E\u8AB2\u984C\u3092\u30AF\u30EA\u30A2\u3057\u307E\u3057\u305F\u3002${promptModifier}
\u30D5\u30A9\u30FC\u30DE\u30C3\u30C8\u306F\u5FC5\u305A\u4EE5\u4E0B\u306EJSON\u5F62\u5F0F\u3067\u8FD4\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u30DE\u30FC\u30AF\u30C0\u30A6\u30F3\u30D6\u30ED\u30C3\u30AF\u3084\u305D\u306E\u4ED6\u306E\u30C6\u30AD\u30B9\u30C8\u306F\u4E00\u5207\u542B\u3081\u306A\u3044\u3067\u304F\u3060\u3055\u3044\u3002

\u3010\u5143\u306E\u8AB2\u984C\u3011
\u30BF\u30A4\u30C8\u30EB: ${lesson.title}
\u5185\u5BB9: ${lesson.instruction}
\u8A00\u8A9E: ${lesson.language}

\u3010\u51FA\u529BJSON\u306E\u5F62\u5F0F\u3011
{
  "id": "challenge_${Date.now()}",
  "title": "${level === "harder" ? "\u5FDC\u7528\u554F\u984C: " : "\u985E\u984C: "}...",
  "description": "...",
  "instruction": "...",
  "example": "...",
  "initialCode": "...",
  "language": "${lesson.language}",
  "hint": "...",
  "answer": "...",
  "explanation": "...",
  "successMessage": "...",
  "testCode": "return logs.some(log => log.includes('...'))" // logs\u3068code\u3092\u53D7\u3051\u53D6\u308B\u95A2\u6570\u306E\u30DC\u30C7\u30A3\u6587\u5B57\u5217
}
`;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt
      });
      let jsonStr = response.text || "{}";
      jsonStr = jsonStr.replace(/```json/gi, "").replace(/```/g, "").trim();
      const challengeData = JSON.parse(jsonStr);
      res.json(challengeData);
    } catch (err) {
      console.error("Generate Challenge Error:", err);
      res.status(500).json({ error: "\u30C1\u30E3\u30EC\u30F3\u30B8\u8AB2\u984C\u306E\u751F\u6210\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002" });
    }
  });
  app.post("/api/autocomplete", async (req, res) => {
    try {
      const { codeBefore, codeAfter, language, instruction } = req.body;
      const ai = new import_genai.GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });
      const prompt = `\u3042\u306A\u305F\u306F\u30D7\u30ED\u30B0\u30E9\u30DF\u30F3\u30B0\u521D\u5B66\u8005\u306E\u5B66\u7FD2\u3092\u30B5\u30DD\u30FC\u30C8\u3059\u308BAI\u3067\u3059\u3002
\u30E6\u30FC\u30B6\u30FC\u304C\u30B3\u30FC\u30C9\u3092\u8A18\u8FF0\u4E2D\u3067\u3059\u304C\u3001\u5B66\u7FD2\u306E\u59A8\u3052\u306B\u306A\u3089\u306A\u3044\u3088\u3046\u3001\u6B21\u306B\u5165\u529B\u3059\u3079\u304D\u300C\u5358\u8A9E1\u3064\u300D\u307E\u305F\u306F\u300C\u6570\u6587\u5B57\u300D\u7A0B\u5EA6\u306E\u5165\u529B\u88DC\u52A9\u306E\u307F\u3092\u63D0\u6848\u3057\u3066\u304F\u3060\u3055\u3044\u3002
\u3010\u91CD\u8981\u3011
- \u7D76\u5BFE\u306B\u8AB2\u984C\u306E\u89E3\u7B54\u5168\u4F53\u3084\u3001\u9577\u3044\u884C\u3092\u66F8\u304B\u306A\u3044\u3067\u304F\u3060\u3055\u3044\u3002
- \u30E6\u30FC\u30B6\u30FC\u304C\u81EA\u529B\u3067\u8003\u3048\u308B\u4F59\u5730\u3092\u6B8B\u3059\u305F\u3081\u3001\u73FE\u5728\u306E\u30AB\u30FC\u30BD\u30EB\u4F4D\u7F6E\u304B\u3089\u7D9A\u304F\u300C1\u5358\u8A9E\u300D\u307E\u305F\u306F\u300C\u77ED\u3044\u8A18\u53F7\u3084\u5F0F\uFF08\u6700\u592710\u6587\u5B57\u7A0B\u5EA6\uFF09\u300D\u306E\u307F\u3092\u63D0\u6848\u3057\u3066\u304F\u3060\u3055\u3044\u3002
- \u30DE\u30FC\u30AF\u30C0\u30A6\u30F3\u306E\u30B3\u30FC\u30C9\u30D6\u30ED\u30C3\u30AF\uFF08\`\`\`javascript\u306A\u3069\uFF09\u3084\u8AAC\u660E\u6587\u306F\u4E00\u5207\u4E0D\u8981\u3067\u3059\u3002\u63D0\u6848\u3059\u308B\u30B3\u30FC\u30C9\u306E\u6587\u5B57\u5217\u306E\u307F\u3092\u51FA\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002

\u3010\u73FE\u5728\u306E\u8AB2\u984C\u3011
${instruction}

\u3010\u8A00\u8A9E\u3011
${language}

\u3010\u30AB\u30FC\u30BD\u30EB\u4F4D\u7F6E\u3088\u308A\u524D\u306E\u30B3\u30FC\u30C9\u3011
${codeBefore}

\u3010\u30AB\u30FC\u30BD\u30EB\u4F4D\u7F6E\u3088\u308A\u5F8C\u306E\u30B3\u30FC\u30C9\u3011
${codeAfter}
`;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt
      });
      let completion = response.text || "";
      completion = completion.replace(/^```[a-z]*\n/i, "").replace(/\n```$/i, "");
      res.json({ completion: completion.trimEnd() });
    } catch (err) {
      console.error("Autocomplete Error:", err);
      res.json({ completion: "" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
