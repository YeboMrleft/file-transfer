// HTTP request/response parser for React Native TCP socket
export interface HttpRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body: Buffer;
}

export interface MultipartFormData {
  fields: Record<string, string>;
  files: Record<string, { filename: string; data: Buffer }>;
}

export class HttpParser {
  static parseRequest(data: string): { headers: Record<string, string>; body: string } | null {
    const parts = data.split('\r\n\r\n');
    if (parts.length < 2) return null;

    const headerLines = parts[0].split('\r\n');
    const headers: Record<string, string> = {};

    for (let i = 1; i < headerLines.length; i++) {
      const [key, value] = headerLines[i].split(': ');
      if (key && value) {
        headers[key.toLowerCase()] = value;
      }
    }

    return {
      headers,
      body: parts.slice(1).join('\r\n\r\n'),
    };
  }

  static parseMultipart(body: string, boundary: string): MultipartFormData {
    const fields: Record<string, string> = {};
    const files: Record<string, { filename: string; data: Buffer }> = {};

    // Split by boundary
    const parts = body.split(`--${boundary}`);

    for (const part of parts) {
      if (!part.trim() || part === '--') continue;

      // Find the double CRLF that separates headers from content
      const [headerSection, ...contentParts] = part.split('\r\n\r\n');
      if (!headerSection) continue;

      const content = contentParts.join('\r\n\r\n').replace(/\r\n$/, '');

      // Parse Content-Disposition header
      const dispositionMatch = headerSection.match(/Content-Disposition: form-data;[^\r\n]*/);
      if (!dispositionMatch) continue;

      const nameMatch = dispositionMatch[0].match(/name="([^"]+)"/);
      const filenameMatch = dispositionMatch[0].match(/filename="([^"]+)"/);

      if (nameMatch) {
        const fieldName = nameMatch[1];
        if (filenameMatch) {
          // It's a file
          files[fieldName] = {
            filename: filenameMatch[1],
            data: Buffer.from(content, 'binary'),
          };
        } else {
          // It's a regular field
          fields[fieldName] = content;
        }
      }
    }

    return { fields, files };
  }

  static buildHttpResponse(statusCode: number, body: string): string {
    const contentLength = Buffer.byteLength(body);
    return (
      `HTTP/1.1 ${statusCode} ${this.getStatusMessage(statusCode)}\r\n` +
      `Content-Type: application/json\r\n` +
      `Content-Length: ${contentLength}\r\n` +
      `Access-Control-Allow-Origin: *\r\n` +
      `Connection: close\r\n` +
      `\r\n` +
      body
    );
  }

  private static getStatusMessage(code: number): string {
    const messages: Record<number, string> = {
      200: 'OK',
      400: 'Bad Request',
      404: 'Not Found',
      500: 'Internal Server Error',
    };
    return messages[code] || 'Unknown';
  }

  static buildCorsResponse(): string {
    return (
      `HTTP/1.1 200 OK\r\n` +
      `Access-Control-Allow-Origin: *\r\n` +
      `Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n` +
      `Access-Control-Allow-Headers: Content-Type\r\n` +
      `Content-Length: 0\r\n` +
      `\r\n`
    );
  }
}
