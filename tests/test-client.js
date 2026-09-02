import { EventEmitter } from 'events';
import { Readable } from 'stream';

export function createTestClient(app) {
  function makeRequest(method, url, { body, headers = {} } = {}) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url, 'http://localhost');
      
      const req = new Readable();
      req._read = () => {};

      req.method = method.toUpperCase();
      req.url = parsedUrl.pathname + parsedUrl.search;
      req.originalUrl = req.url;
      req.path = parsedUrl.pathname;
      req.query = Object.fromEntries(parsedUrl.searchParams.entries());
      
      const rawBody = body !== undefined ? (typeof body === 'object' ? JSON.stringify(body) : String(body)) : null;
      const bodyBuffer = rawBody !== null ? Buffer.from(rawBody, 'utf-8') : null;

      req.headers = {
        'content-type': 'application/json',
        'accept': 'application/json',
        ...(bodyBuffer ? { 'content-length': String(bodyBuffer.length) } : {}),
        ...Object.fromEntries(
          Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
        )
      };

      const resEvents = new EventEmitter();
      const res = {
        statusCode: 200,
        headers: {},
        _bodyChunks: [],
        setHeader(name, value) {
          this.headers[name.toLowerCase()] = value;
          return this;
        },
        getHeader(name) {
          return this.headers[name.toLowerCase()];
        },
        status(code) {
          this.statusCode = code;
          return this;
        },
        write(chunk) {
          if (chunk) this._bodyChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          return true;
        },
        end(chunk) {
          if (chunk) this.write(chunk);
          const rawResponse = Buffer.concat(this._bodyChunks).toString('utf-8');
          let parsedResponse = rawResponse;
          try {
            parsedResponse = JSON.parse(rawResponse);
          } catch {}

          resolve({
            status: this.statusCode,
            body: parsedResponse,
            headers: this.headers
          });
        },
        json(data) {
          this.setHeader('content-type', 'application/json');
          return this.end(JSON.stringify(data));
        },
        send(data) {
          if (typeof data === 'object' && !Buffer.isBuffer(data)) {
            return this.json(data);
          }
          return this.end(data);
        },
        sendFile(filePath) {
          this.statusCode = 200;
          this.end(`file:${filePath}`);
        },
        on(evt, listener) {
          resEvents.on(evt, listener);
          return this;
        },
        emit(evt, ...args) {
          return resEvents.emit(evt, ...args);
        }
      };

      try {
        app.handle(req, res, (err) => {
          if (err) {
            reject(err);
          } else {
            res.status(404).json({ error: 'Endpoint not found' });
          }
        });

        // Push data after handler attaches listeners
        process.nextTick(() => {
          if (bodyBuffer) {
            req.push(bodyBuffer);
          }
          req.push(null);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  return {
    get(url, options = {}) {
      return makeRequest('GET', url, options);
    },
    post(url, options = {}) {
      return makeRequest('POST', url, options);
    },
    patch(url, options = {}) {
      return makeRequest('PATCH', url, options);
    },
    delete(url, options = {}) {
      return makeRequest('DELETE', url, options);
    }
  };
}
