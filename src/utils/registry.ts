import * as path from 'path';
import { promises as fs } from 'fs';
import DiscordClient from '../client/client';
import BaseEvent from './structures/BaseEvent';

export async function registerCommands(
  client: DiscordClient,
  dir: string = '',
) {
  const filePath = path.join(__dirname, dir);
  const files = await fs.readdir(filePath);
  for (const file of files) {
    const stat = await fs.lstat(path.join(filePath, file));
    if (stat.isDirectory())
      await registerCommands(client, path.join(dir, file));
    if (file.endsWith('.js') || file.endsWith('.ts')) {
      const { default: Command } = await import(path.join(dir, file));
      const command = new Command();
      if (command) client.commands.set(command.getName(), command);
    }
  }
}

export async function registerEvents(client: DiscordClient, dir: string = '') {
  const filePath = path.join(__dirname, dir);
  const files = await fs.readdir(filePath);
  for (const file of files) {
    const stat = await fs.lstat(path.join(filePath, file));
    //making it ignore the commands folder
    if (stat.isDirectory() && file !== 'commands') {
      await registerEvents(client, path.join(dir, file));
    }
    //SET-UP-TEMP: ignore raw event for now
    if (file.endsWith('.js') || file.endsWith('.ts')) {
      const { default: Event } = await import(path.join(dir, file));
      const event = new Event() as BaseEvent;
      client.events.set(event.getName(), event);
      client.on(event.getName(), event.run.bind(event, client));
    }
  }
}
