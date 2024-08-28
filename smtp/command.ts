import { isValidAddress } from "@utils/helpers.ts";

type CommandResponse = {
  code?: number;
  message?: string;
  isReadyToSend?: boolean;
};

/**
 * List of available commands
 */
export enum Command {
  HELO = "HELO",
  EHLO = "EHLO",
  MAIL = "MAIL",
  RCPT = "RCPT",
  DATA = "DATA",
  RSET = "RSET",
  VRFY = "VRFY",
  NOOP = "NOOP",
  QUIT = "QUIT",
  EXPN = "EXPN",
  HELP = "HELP",
}

/**
 * Response from the CommandHandler to the Connection.
 */
export interface CommandHandlerResponse {
  code: number | undefined;
  command: Command | undefined;
  isReadyToSend: boolean;
  message: string | undefined;
}

/**
 * Message information parsed by the CommandHandler.
 */
export interface CommandMessage {
  mail?: string;
  rcpt?: string[];
  data?: string;
}

const NOT_STARTED = () => ({
  code: 503,
  message: "Bad command sequence",
});

/**
 * CommandHandler is responsible for parsing a message from the Connection to a 
 * valid Command, storing the result of multiple commands and specifying when 
 * it's ready to send the email.
 */
export class CommandHandler {
  private _started = false;

  private _isData = false;
  get isData() {
    return this._isData;
  }

  private _message: CommandMessage = {};
  get message() {
    return { ...this._message };
  }

  clear() {
    this._isData = false;
    this._message = {};
  }

  parseCommand(data: string): CommandHandlerResponse {
    const command = this._getCommandFromString(data.substring(0, 4));
    const commandData = data.substring(4).trim();
    let response: CommandResponse = {};

    switch (command) {
      case Command.HELO:
      case Command.EHLO:
      case Command.RSET:
        response = this._start(command, commandData);
        break;
      case Command.MAIL:
        response = this._mail(commandData);
        break;
      case Command.RCPT:
        response = this._rcpt(commandData);
        break;
      case Command.DATA:
        response = this._data();
        break;
      case Command.VRFY:
        response = this._verify();
        break;
      case Command.EXPN:
        response = this._expand();
        break;
      case Command.NOOP:
        response = this._noop();
        break;
      case Command.HELP:
        response = this._help();
        break;
      case Command.QUIT:
        response = this._quit();
        break;
      default:
        if (this.isData) {
          response = this._handleData(data);
        } else {
          response = {
            code: 500,
            message: "Command not recognized",
          };
        }
        break;
    }

    return {
      code: response.code,
      command,
      isReadyToSend: response.isReadyToSend || false,
      message: response.message,
    };
  }

  private _data(): CommandResponse {
    if (
      !this._started || !this.message.mail || !this.message.rcpt
    ) {
      return NOT_STARTED();
    }

    this._isData = true;

    return {
      code: 354,
      message: "Start mail input; end with <CRLF>.<CRLF>",
    };
  }

  private _expand(): CommandResponse {
    // TODO (William);
    return {
      code: 502,
      message: "Command not implemented.",
    };
  }

  private _getCommandFromString(word: string): Command | undefined {
    const command = word.toUpperCase();
    return command in Command
      ? Command[<keyof typeof Command> command]
      : undefined;
  }

  private _handleData(data: string): CommandResponse {
    if (data.trim() === ".") {
      this._isData = false;
      return {
        code: 250,
        isReadyToSend: true,
        message: "Message saved to database",
      };
    }

    if (this._message.data) {
      this._message.data += data;
    } else {
      this._message.data = data;
    }

    return {
      isReadyToSend: false,
    };
  }

  private _help(): CommandResponse {
    return {
      code: 214,
      message:
        "Read RFC 2821 for more information on how an SMTP server works or go to https://github.com/undeadredpanda/posture for information on this specific server implementation.",
    };
  }

  private _mail(data: string): CommandResponse {
    if (!this._started) return NOT_STARTED();

    const startsWithFrom = data.trim().toUpperCase().startsWith("FROM:");
    const email = data.substring(5).trim(); // Skips "FROM:";
    const isValidEmail = isValidAddress(email);

    if (!startsWithFrom) {
      return {
        code: 501,
        message: 'MAIL command should start with "FROM:"',
      };
    }

    if (!isValidEmail) {
      return {
        code: 501,
        message: "Please specify a valid email address",
      };
    }

    if (this._message.mail) {
      return {
        code: 503,
        message: "MAIL command was already issued. RSET to set a new email",
      };
    }

    this._message.mail = email;
    return {
      code: 250,
      message: "OK",
    };
  }

  private _noop(): CommandResponse {
    return {
      code: 250,
      message: "OK",
    };
  }

  private _quit(): CommandResponse {
    return {
      code: 221,
      message: "Bye bye!",
    };
  }

  private _rcpt(data: string): CommandResponse {
    if (!this._started) return NOT_STARTED();

    const startsWithTo = data.trim().toUpperCase().startsWith("TO:");
    const email = data.substring(3).trim(); // Skips "TO:";
    const isValidEmail = isValidAddress(email);

    if (!startsWithTo) {
      return {
        code: 501,
        message: 'RCPT command should start with "TO:".',
      };
    }

    if (!isValidEmail) {
      return {
        code: 501,
        message: "Please specify a valid email address",
      };
    }

    if (this._message.rcpt) {
      this._message.rcpt.push(email);
    } else {
      this._message.rcpt = [email];
    }

    return {
      code: 250,
      message: "OK",
    };
  }

  private _start(command: Command, _data: string): CommandResponse {
    const isReset = command === Command.RSET;
    const isExtendedHello = command === Command.EHLO;
    let isNew = false;

    if (!isReset && !this._started) {
      this._started = true;
      isNew = true;

      if (isExtendedHello) {
        // TODO (William): Implement the response format
      }
    }

    this.clear();
    return {
      code: 250,
      message: isNew ? "Hey, you!" : "OK",
    };
  }

  private _verify(): CommandResponse {
    // TODO (William);
    return {
      code: 502,
      message: "Command not implemented.",
    };
  }
}
