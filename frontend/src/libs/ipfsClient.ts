export interface IIpfsClient {
  put(files: Iterable<File>, name: string): Promise<string | undefined>;
}
