import * as yargs from "yargs";
import { ConfigType } from "../fileReader/fileReader";
export interface CliCommandOptions {
    file: string;
    allowVoidParameterTypes: boolean;
}
export declare type CommandOptions = CliCommandOptions & yargs.Arguments<ConfigType>;
