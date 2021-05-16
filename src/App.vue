<template>
  <div class="flex px-12 items-center justify-between">
    <div @click="step = Steps.Configure" class="flex items-center cursor-pointer">
      <img src="./assets/logo.png" alt="Cashlink Generator" class="mr-4" />
      <h1 class="nq-h2">Cashlink Generator</h1>
    </div>
    <p class="nq-notice info text-right">Consensus: {{ networkStatus }}</p>
  </div>

  <div class="flex-1">
    <main class="flex mx-auto p-12 pt-24 md:pt-48 justify-center">
      <configure-cashlinks v-if="step == Steps.Configure" @configure="handleConfigure" />
      <backup-wallet v-if="step == Steps.Backup" @walletCreate="handleWalletCreate" />
      <send-funds
        v-if="step == Steps.Send"
        :config="cashlinkConfig"
        :wallet="temporaryWallet"
        @walletFunded="handleWalletFund"
      />
      <generate-cashlinks v-if="step == Steps.Generate" :config="cashlinkConfig" :wallet="temporaryWallet" />
    </main>
  </div>

  <footer class="p-4 text-center">
    <p class="nq-notice">
      If you find this project useful, please consider
      <a class="nq-link" href="https://wallet.nimiq.com/nimiq:NQ54EHLNL135RBFU305P0GJTGTU0S3G38MKJ" target="__blank"
        >donating</a
      >
      or join me on <a class="nq-link" href="https://r.upland.me/3kwq" target="__blank">Upland</a>
    </p>
  </footer>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue';
import { connect } from './lib/NetworkClient';
import { CashlinkConfig } from './types';

import ConfigureCashlinks from './components/ConfigureCashlinks.vue';
import SendFunds from './components/SendFunds.vue';
import BackupWallet from './components/BackupWallet.vue';
import GenerateCashlinks from './components/GenerateCashlinks.vue';

enum Steps {
  Configure,
  Backup,
  Send,
  Generate,
}

export default defineComponent({
  name: 'App',
  components: {
    ConfigureCashlinks,
    BackupWallet,
    SendFunds,
    GenerateCashlinks,
  },
  setup() {
    const step = ref(Steps.Configure);
    const networkStatus = ref('loading');
    const cashlinkConfig = ref({});
    const temporaryWallet = ref();

    async function start() {
      const client = await connect();

      client.addConsensusChangedListener((consensusState) => {
        networkStatus.value = consensusState.toString();
      });
    }

    const handleConfigure = (config: CashlinkConfig) => {
      cashlinkConfig.value = config;
      console.log(config);
      step.value = Steps.Backup;
    };

    const handleWalletCreate = ({ wallet }) => {
      temporaryWallet.value = wallet;
      step.value = Steps.Send;
    };

    const handleWalletFund = () => {
      console.log('wallet funded');
      step.value = Steps.Generate;
    };

    start();

    return {
      networkStatus,
      step,
      Steps,
      cashlinkConfig,
      temporaryWallet,
      handleConfigure,
      handleWalletCreate,
      handleWalletFund,
    };
  },
});
</script>
