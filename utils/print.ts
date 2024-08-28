export const black = (m: string) => `\u001b\[30m${m}\u001b\[39m`;

export const red = (m: string) => `\u001b\[31m${m}\u001b\[39m`;

export const green = (m: string) => `\u001b\[32m${m}\u001b\[39m`;

export const yellow = (m: string) => `\u001b\[33m${m}\u001b\[39m`;

export const blue = (m: string) => `\u001b\[34m${m}\u001b\[39m`;

export const magenta = (m: string) => `\u001b\[35m${m}\u001b\[39m`;

export const cyan = (m: string) => `\u001b\[36m${m}\u001b\[39m`;

export const white = (m: string) => `\u001b\[37m${m}\u001b\[39m`;

export const brightBlack = (m: string) => `\u001b\[90m${m}\u001b\[39m`;

export const brightRed = (m: string) => `\u001b\[91m${m}\u001b\[39m`;

export const brightGreen = (m: string) => `\u001b\[92m${m}\u001b\[39m`;

export const brightYellow = (m: string) => `\u001b\[93m${m}\u001b\[39m`;

export const brightBlue = (m: string) => `\u001b\[94m${m}\u001b\[39m`;

export const brightMagenta = (m: string) => `\u001b\[95m${m}\u001b\[39m`;

export const brightCyan = (m: string) => `\u001b\[96m${m}\u001b\[39m`;

export const brightWhite = (m: string) => `\u001b\[97m${m}\u001b\[39m`;

export const gray = brightBlack;

export const bold = (m: string) => `\u001b\[1m${m}\u001b\[22m`;