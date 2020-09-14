import { Command } from "./command";
import { CommandOptions } from "./options";
interface DefaultCommandOptions extends CommandOptions {
    name: string;
}
export declare const defaultCommand: Command<DefaultCommandOptions>;
export {};
