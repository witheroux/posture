import type { Socket, SocketHandler } from "bun";

import { getValue } from "@utils/helpers.ts";

import { ConnectionManager } from "./connection.ts";

/**
 * SMTPOptions lists all options for the SMTPServer.
 * 
 * None are required as SMTPServer has default alternatives set in place.
 */
export interface SMTPOptions {
  port?: number;
  host?: string;
  useTLS?: boolean;
  cert?: string;
  key?: string;
}

/**
 * SMTPServer is the server that will take in SMTP commands and save the results to a database for the server
 */
export class SMTPServer {
  readonly manager: ConnectionManager;
  readonly hostname: string;
  readonly port: number;
  readonly cert: string;
  readonly key: string;


  constructor(opts?: SMTPOptions) {
    this.hostname = opts?.host || "0.0.0.0";
    this.port = opts?.port || this.#getDefaultPort(opts?.useTLS);
    this.cert = getValue(opts ?? {}, "cert", !!opts?.useTLS) as string;
    this.key = getValue(opts ?? {}, "key", !!opts?.useTLS) as string;
    this.manager = new ConnectionManager<string>(this.hostname);

    Bun.listen({
      hostname: this.hostname,
      port: this.port,
      tls: this.#getCertOptions(opts?.useTLS),
      socket: this.#getSocket(),
    });

    console.log(`🌎 SMTP Server listening at ${this.hostname}:${this.port}.`);
  }

  #getCertOptions(useTLS?: boolean) {
    return useTLS ? {
      cert: Bun.file(this.cert),
      key: Bun.file(this.key),
    } : undefined
  }

  #getDefaultPort(useTLS: boolean | undefined): number {
    if (useTLS) return 465;
    return 2525;
  }

  #getSocket(): SocketHandler<string> {
    const data = (socket: Socket<string>, data: Buffer) => {
      const message = this.manager.handleConnectionData(socket, data);
      if (message) {
        console.log(message);
        // this.db.saveMessage(message);
      }
    };
    
    const open = (socket: Socket<string>) => {
      this.manager.addConnection(socket);
    };

    const close = (socket: Socket<string>) => {
      this.manager.removeConnection(socket, 'Closed by client.');
    };

    const error = (socket: Socket<string>, error: Error) => {
      this.manager.removeConnection(socket, error.message);
    };

    const timeout = (socket: Socket<string>) => {
      this.manager.removeConnection(socket, 'Socket timed out');
    };

    return {
      data,
      open,
      close,
      error,
      timeout
    }
  }
}
