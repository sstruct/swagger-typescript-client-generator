import { Command } from "./command";
import { CommandOptions } from "./options";
interface BundleCommandOptions extends CommandOptions {
    name: string;
}
export declare const defaultCommand: Command<BundleCommandOptions>;
export {};
