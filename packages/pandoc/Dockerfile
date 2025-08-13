# Stage 1: Install Node.js on Pandoc base image
FROM pandoc/core:latest AS pandoc

# Stage 2: Use a lightweight Alpine Node.js image
FROM node:18-bookworm-slim

RUN apt-get update && apt-get install -y \
  pandoc \
  curl \
  texlive-latex-base \
  texlive-fonts-recommended \
  texlive-fonts-extra \
  texlive-latex-extra \
  texlive-latex-recommended \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /pandoc

# Copy your worker script
COPY index.js .
COPY worker.js .
COPY helpers.js .

COPY --chown=node:node package.json .
COPY --chown=node:node yarn.lock .

RUN yarn install --frozen-lockfile
RUN yarn cache clean

# Command to run your worker
CMD ["node", "index.js"]