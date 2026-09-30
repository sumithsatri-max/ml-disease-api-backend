FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y python3 python3-venv && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY ml-disease-ml/ml-disease-ml/requirements.txt /tmp/requirements.txt

RUN python3 -m venv /opt/venv
RUN /opt/venv/bin/pip install --no-cache-dir -r /tmp/requirements.txt

COPY . .

ENV PATH="/opt/venv/bin:$PATH"
ENV NODE_ENV=production
ENV PYTHON_CMD=python3

EXPOSE 5000

CMD ["npm", "start"]
