import { Client } from '@nimiq/core-web';
import HubApi from '@nimiq/hub-api';
import { loadNimiq } from './CoreLoader';

const NIMIQ_HUB_URL = String(import.meta.env.VITE_NIMIQ_HUB_URL);

let _networkClient: Promise<Client> | null = null;
let _hubApi: HubApi | null = null;

export async function connect(): Promise<Client> {
  _networkClient =
    _networkClient ||
    (async () => {
      const Nimiq = await loadNimiq();

      const configBuilder = Nimiq.Client.Configuration.builder();
      const client = configBuilder.instantiateClient();

      return client;
    })();

  return _networkClient;
}

export function hubApi(): HubApi {
  return _hubApi || new HubApi(NIMIQ_HUB_URL);
}
