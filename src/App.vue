<template>
  <div class="p-12 flex justify-between">
    <h1 class="text-xl" @click="step = Steps.Configure">Cashlink Generator</h1>
    <p>Consensus: {{ networkStatus }}</p>
  </div>

  <main class="container mx-auto p-12 shadow-2xl bg-white rounded-lg">
    <configure-cashlinks
      v-if="step == Steps.Configure"
      @configure="handleConfigure"
    />
    <backup-wallet
      v-if="step == Steps.Backup"
      @walletCreate="handleWalletCreate"
    />
    <send-funds
      v-if="step == Steps.Send"
      :config="cashlinkConfig"
      :wallet="temporaryWallet"
      @walletFunded="handleWalletFund"
    />
    <generate-cashlinks
      v-if="step == Steps.Generate"
      :wallet="temporaryWallet"
    />
  </main>
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
