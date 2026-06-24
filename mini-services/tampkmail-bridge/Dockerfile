FROM mcr.microsoft.com/playwright:v1.61.1-jammy

WORKDIR /app

# Copy dependency files first for layer caching
COPY mini-services/tampkmail-bridge/package.json mini-services/tampkmail-bridge/package-lock.json* ./
RUN npm install

COPY mini-services/tampkmail-bridge/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Download Chrome for Testing and ChromeDriver
RUN mkdir -p /opt/chrome /opt/chromedriver && \
    curl -sSfL "https://storage.googleapis.com/chrome-for-testing-public/150.0.4494.0/linux64/chrome-linux64.zip" -o /tmp/chrome.zip && \
    unzip -q /tmp/chrome.zip -d /opt && \
    mv /opt/chrome-linux64/* /opt/chrome/ && \
    rm -rf /opt/chrome-linux64 /tmp/chrome.zip && \
    curl -sSfL "https://storage.googleapis.com/chrome-for-testing-public/150.0.4494.0/linux64/chromedriver-linux64.zip" -o /tmp/chromedriver.zip && \
    unzip -q /tmp/chromedriver.zip -d /opt && \
    mv /opt/chromedriver-linux64/* /opt/chromedriver/ && \
    rm -rf /opt/chromedriver-linux64 /tmp/chromedriver.zip && \
    chmod +x /opt/chromedriver/chromedriver

# Copy the rest of the bridge files
COPY mini-services/tampkmail-bridge/ ./

ENV CHROME_BIN=/opt/chrome/chrome
ENV CHROMEDRIVER=/opt/chromedriver/chromedriver

EXPOSE 3000

CMD ["node", "server.js"]
