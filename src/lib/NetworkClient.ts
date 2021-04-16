import { Client } from '@nimiq/core-web';
import { loadNimiq } from './CoreLoader';

let networkClient: Promise<Client> | null = null;

export async function connect(): Promise<Client> {
  networkClient =
    networkClient ||
    (async () => {
      const Nimiq = await loadNimiq();

      const configBuilder = Nimiq.Client.Configuration.builder();
      const client = configBuilder.instantiateClient();

      return client;
    })();

  return networkClient;
}
