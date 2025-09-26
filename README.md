# Menhera Bot

<!-- PROJECT LOGO -->
<br />
<p align="center">
    <img src="https://cdn.discordapp.com/avatars/1130920705026949203/e15da66350213acfef1ac77532719a4b.webp" alt="Logo" width="80" height="80">
    <h3 align="center">Menhera Bot</h3>
</p>

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#starting-the-bot">Startup</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#notes--things-to-remember">Notes</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

Menhera Bot is a private [Discord](https://discord.com) bot built for personal use

### Built With

- [NodeJS](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [DiscordJS](https://discord.js.org)
- [MongoDB](https://www.mongodb.com/)
- & Other libs you can find in the package file
<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

- npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/norowachi/menhera-bot.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Enter your credentials in `.env` according to `.env-example`

### Starting The Bot

1. Install [Git](https://git-scm.com/downloads) and configure it to be able to use bash scripts and commands (OPTIONAL)
2. Register the commands
   ```sh
   npm run register
   ```
   (Note: don't forget to mark `register.sh` as executable)
   - if the method above doesn't work, no worries just run the file
     ```sh
     tsc && node dist/registerCommands.js
     ```
3. Now you can run the bot
   ```sh
   npm start
   ```

- if you have any issues do not hesitate to contact us or create an issue in this repo, but do note that this is not intended for public use and may have many hardcoded constants
<!-- CONTRIBUTING -->

## Contributing

1. Fork the Project
2. Create your Feature Branch
3. Commit your Changes
4. Push to the Branch
5. Open a Pull Request

Contributions are greatly appreciated.

<!-- LICENSE -->

## LICENSE

Important!
by downloading the following program you agree to the following LICENSE in the LICENSE file.

## Notes & things To Remember

For installing packages/canvas [install required dependencies first](https://github.com/Automattic/node-canvas?tab=readme-ov-file#compiling)

```js
// Level to Exp, where "LEVEL" is an integer
Math.floor(LEVEL ** 2 / 0.01);

// Exp to Level, where "EXP" is a positive integer
Math.floor(Math.sqrt(EXP) * 0.1);
```
