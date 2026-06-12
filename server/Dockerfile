FROM node:20-bookworm-slim

WORKDIR /app

# python3 + build tools for native deps; ffmpeg for mp3 extraction / format
# merging; aria2 for parallel-connection downloads (YouTube throttling).
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python-is-python3 make g++ ffmpeg aria2 ca-certificates wget curl unzip \
  && rm -rf /var/lib/apt/lists/*

# JS runtime (deno) — newer yt-dlp needs it for complete YouTube extraction.
RUN curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh \
  && /usr/local/bin/deno --version || true

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# X breaks the extractor often — pull the latest yt-dlp binary at build time.
RUN ./node_modules/yt-dlp-exec/bin/yt-dlp -U || true

COPY . ./

# Let the unprivileged runtime user self-update yt-dlp on boot (writes the binary in place).
RUN chown -R node:node ./node_modules/yt-dlp-exec/bin

ENV NODE_ENV=production
EXPOSE 4000

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/health || exit 1

CMD ["node", "index.js"]
