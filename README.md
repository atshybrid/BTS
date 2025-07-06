
# Delta GPT Trading Bot

This is an automated trading bot that:
- Fetches 15-minute and 1-hour OHLC data from Delta Exchange.
- Sends data to ChatGPT to get Buy/Sell signal.
- Places orders automatically via Delta API.

## Setup

1. Clone the project
2. Install dependencies:

```bash
npm install
```

3. Fill your credentials in `.env`:

```env
DELTA_API_KEY=your_delta_key
DELTA_SECRET_KEY=your_delta_secret
GPT_API_KEY=your_openai_key
```

4. Start the bot:

```bash
npm start
```

## To-Do
- Add signature generation for Delta order API.
- Add logic to parse GPT response and extract trade values.
- Implement re-checking and exit signal handling.
