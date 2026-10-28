/** The command line was used wrongly: a missing argument, an unknown option, a CSV without coordinates. */
export class CliUsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
