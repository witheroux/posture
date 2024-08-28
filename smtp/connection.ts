
import type { Socket } from "bun";

import { Configuration } from "@configuration/config.ts";
import { log, UTF8Transcoder } from "@utils/helpers.ts";
import { bold, gray, yellow } from "@utils/print.ts";

import { Command, CommandHandler, type CommandMessage } from "./command.ts";
import * as CONST from "./constants.ts";

export class ConnectionManager<T = unknown> {
  #connectionMap: Map<Socket<T>, Connection> = new Map();
  private _connections: Connection[] = [];

  constructor(private _ip: string) {}

  addConnection(socket: Socket<T>): Connection | undefined {
    const connection = new Connection<T>(
      socket,
      this._ip,
    );

    if (this.#connectionMap.size >= Configuration.maxConnections()) {
      const reason = "Connection limit exceeded.";
      connection.writeLine(reason);
      socket.end();
      return;
    }

    this.#connectionMap.set(socket, connection);

    this.startConnection(connection);

    return connection;
  }

  async startConnection(connection: Connection) {
    this._connections.push(connection);

    connection.startConnection();
  }

  handleConnectionData(socket: Socket<T>, data: Buffer) {
    const connection = this.#connectionMap.get(socket);

    if (!connection) {
      return;
    }

    try {
      return connection.handleData(data);
    } catch (e) {
      // Do nothing we didn't get data.
    }
  }

  async removeConnection(socket: Socket<T>, reason?: string) {
    const connection = this.#connectionMap.get(socket);

    if (!connection) {
      return;
    }

    try {
      this.#connectionMap.delete(socket);
      connection.close(reason);
    } catch (err) {
      // Do nothing somehow we couldn't close
    }
  }
}

export class Connection<T = unknown> {
  readonly commandHandler: CommandHandler = new CommandHandler();

  readonly connectedAt: Date = new Date();

  get closing() {
    return this.socket.readyState === 'closing';
  }

  get closed() {
    return this.socket.readyState === 'closed';
  }

  get open(): boolean {
    return this.socket.readyState === 'open';
  }

  constructor(
    readonly socket: Socket<T>,
    private _ip: string,
  ) {
    if (Configuration.isDebug()) {
      this.#log("New connection opened.");
    }
  }

  getIp(): string {
    return this.socket.remoteAddress;
  }

  startConnection() {
    this.#welcome();
  }

  writeLine(str: string): this {
    str = `${str.trim()}\r\n`;
    this.write(UTF8Transcoder.encode(str));

    return this;
  }

  write(buffer: Uint8Array): this {
    try {
      this.socket.write(buffer);
      this.socket.flush();
    } catch (err) {
      // this._removeDroppedConnection();
    }

    return this;
  }

  close(reason = "Closed by client") {
    if (!this.closed && !this.closing) {
      this.socket.end();

      if (Configuration.isDebug()) {
        this.#log(`Connection was closed. ${gray(`(${reason})`)}`);
      }
    }
  }

  handleData(data: Buffer): CommandMessage | undefined { 
    let msgToSave;
    const str = data.toString('utf-8');
    const { isReadyToSend, command, code, message } = this.commandHandler
      .parseCommand(str);

    // NOTE (William): In an actual SMTP server implementation, this
    // wouldn't be acceptable. However, since we don't really have the
    // same delivery requirements as an actual SMTP server, we can just
    // await the saving of the email to the database
    if (isReadyToSend) {
      msgToSave = {...this.commandHandler.message};
      this.commandHandler.clear();
    }

    if (code && message) {
      this.writeLine(`${code} ${message}`);
    }

    if (command === Command.QUIT) {
      this.#quit();
    }

    return msgToSave;
  }

  #log(message: string) {
    const ip = bold(yellow(`[IP: ${this.getIp()}]`));
    const date = bold(new Date().toISOString());

    log.info(`${ip} ${date} - ${message}`);
  }

  #quit() {
    this.socket.end();
  }

  #welcome() {
    this.writeLine(
      `220 [${this._ip}] Welcome to ${CONST.NAME} v${CONST.VERSION}`,
    );
  }
}
