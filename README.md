# Posture

Posture is a simple configurable mock SMTP server to test your emails built with Bun. It is not meant to actually deliver anything. This server was designed only for receiving and saving SMTP commands for development or testing purposes.

The SMTP server of this project implements the relevant parts of [RFC 2821](https://tools.ietf.org/html/rfc2821) to the best of my capacity/desire to for this project. To see what is implemented, you can peep [the implementation list](#implementation-details). If there are certain parts of the standard that you need that aren't supported or don't work as they should, feel free to make a PR or file an issue!

## How to use

```sh
$ bun install path/to/repo/app.ts
```

## Dependencies

- Client: TBD
- API: TBD
- SMTP: None.
- Database: TBD

## Supported Databases

- TBD

## Development

This is bun, so everything is ready to rock and roll with a single command.

```bash
bun run --watch path/to/repo/app.ts
```

### Testing

TODO

## Contributing

TODO

## Roadmap

Here's a list of the tasks that are planned for each release to do:

---

### MVP

The MVP for the Posture SMTP server allows basic testing of SMTP clients and validate sent emails during local development

#### SMTP

- 4.5.3.1 - Size limits and minimums
- Tests
- Documentation

#### Server

- Tests
- Documentation

#### Client

- Data fetching mechanisms
- List view of sent emails
- Detail view of emails
- Tests
- Documentation

#### Global

- Default config when nothing is provided.

---

### V2

The V2 of the Posture SMTP server allows authentication for securing online servers and includes SMTP over SSL.

#### SMTP

- Handle commands that seem to require lookups
  - EHLO
  - VRFY
  - EXPN
- Auth
- SSL

#### Server

- Secure API (Optional)

#### Client

- Add login (Optional)

---

### V3

Handle the remaining items to complete the initial ideas behind Posture

#### SMTP

- Implement some kind of communication system when new messages are added to the Database that the server could listen to.
- CI/CD?

#### Server

- Websocket or long polling connections to clients, SMTP Server or DB needs to implement some form of communication first
- CI/CD?

#### Client

- Server-side rendering if the chosen framework can handle it
- CI/CD?

#### Site

- Make a site branch with a nice little documentation (Could be docusaurus)
- CI/CD?

## Implementation details

- [Section 4.1](https://tools.ietf.org/html/rfc2821#section-4.1)
- [Section 4.5.3.1](https://tools.ietf.org/html/rfc2821#section-4.5.3.1)

## Notes

This is my foray into actual FOSS I want to put out into the world. I'm super open to PRs and/or suggestions on how to properly maintain and collaborate on these kinds of things. If you see something in this README that doesn't make sense, feel free to create an issue with your recommendations!

## Fun Facts

I chose the name Posture because this is a tool written with Deno to test part of a communication system and dinosaurs used their posture to communicate certain things.<sup>[citation needed]</sup> The word Posture also includes "Post" as in mail, so there's that. Yeah.

<small>Copyright © 2020 William Théroux</small>
