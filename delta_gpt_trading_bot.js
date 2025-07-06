// delta_gpt_trading_bot.js
// Node.js application to auto-trade on Delta Exchange India using GPT signals + WebSocket monitoring

const axios = require("axios");
const WebSocket = require("ws");
require("dotenv").config();

const DELTA_API_KEY = process.env.DELTA_API_KEY;
const DELTA_SECRET_KEY = process.env.DELTA_SECRET_KEY;
const GPT_API_KEY = process.env.GPT_API_KEY;
const SYMBOL = "BTCUSDT"; // ✅ Updated valid symbol for Delta India
const BASE_URL = "https://api.india.delta.exchange"; // ✅ Updated base URL

// === Fetch OHLC candles ===
async function fetchCandles(timeframe, limit = 40) {
 const url = `${BASE_URL}/v2/ohlcv/candles?market_name=${SYMBOL}&resolution=${timeframe}&limit=${limit}`;
  console.log("🧪 Fetching:", url);
  const res = await axios.get(url);
  return res.data.result.map(c => [
    parseFloat(c.o),
    parseFloat(c.h),
    parseFloat(c.l),
    parseFloat(c.c)
  ]);
}

// === Generate GPT prompt and get signal ===
async function getSignalFromGPT(candles15m, candles1h) {
  const prompt = {
    model: "gpt-4.1",
    temperature: 0.2,
    input: [
      {
        role: "system",
        content: "You are a crypto trading analyst. Analyze the 15m and 1h OHLC data and return a signal."
      },
      {
        role: "user",
        content: `15m Candles:\n${candles15m.map(c => `[${c.join(",")}]`).join("\n")}\n\n1h Candles:\n${candles1h.map(c => `[${c.join(",")}]`).join("\n")}\n\nRespond in this format:\nDirection: Buy/Sell/Wait\nEntry Price:\nStop Loss:\nTarget:\nConfirmed: Yes/No\nPattern Identified:\nReason:`
      }
    ]
  };

  const res = await axios.post("https://api.openai.com/v1/chat/completions", prompt, {
    headers: {
      Authorization: `Bearer ${GPT_API_KEY}`,
      "Content-Type": "application/json"
    }
  });

  return res.data.choices[0].message.content;
}

// === Placeholder for order placement ===
async function placeOrder(direction, price) {
  console.log(`Placing ${direction.toUpperCase()} order at ${price}`);
  // Implement order placement with Delta Exchange API here
}

// === Main trading workflow ===
async function runBot() {
  try {
    const candles15m = await fetchCandles("15", 40);
    const candles1h = await fetchCandles("60", 12);

    const signal = await getSignalFromGPT(candles15m, candles1h);
    console.log("\n📊 GPT Signal Response:\n", signal);

    // TODO: Parse response & call placeOrder() if signal is confirmed
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

// === WebSocket setup to monitor price real-time ===
function startWebSocket() {
  const ws = new WebSocket("wss://socket.india.delta.exchange");

  ws.on("open", () => {
    console.log("✅ Connected to Delta WebSocket");
    const subscribeMsg = {
      type: "subscribe",
      payload: {
        channels: ["v2/ticker", "v2/trades"],
        symbols: [SYMBOL]
      }
    };
    ws.send(JSON.stringify(subscribeMsg));
  });

  // Ping every 50s to keep connection alive
  setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 50000);

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());
      console.log("📩 Live Feed:", msg);
      // Optional: trigger runBot() if price condition met
    } catch (err) {
      console.error("❗ Error parsing message:", err.message);
    }
  });

  ws.on("close", () => console.log("❌ WebSocket disconnected"));
  ws.on("error", (err) => console.error("❗ WebSocket Error:", err.message));
}

// Start WebSocket + run initial analysis
startWebSocket();
runBot();
