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
    <send-funds
      v-if="step == Steps.Send"
      :totalFundsRequired="totalFundsRequired"
    />
  </main>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { connect } from './lib/NetworkClient';

import ConfigureCashlinks from './components/ConfigureCashlinks.vue';
import SendFunds from './components/SendFunds.vue';

enum Steps {
  Configure = 0,
  Send = 1,
  Generate = 2,
  Finish = 3,
}

export default defineComponent({
  name: 'App',
  components: {
    ConfigureCashlinks,
    SendFunds,
  },
  setup() {
    const step = ref(Steps.Configure);
    const networkStatus = ref('loading');
    const totalFundsRequired = ref(0);

    async function start() {
      const client = await connect();

      client.addConsensusChangedListener((consensusState) => {
        networkStatus.value = consensusState.toString();
      });
    }

    const handleConfigure = (config: { total: number }) => {
      totalFundsRequired.value = config.total;
      step.value = Steps.Send;
    };

    start();

    return {
      networkStatus,
      step,
      Steps,
      totalFundsRequired,
      handleConfigure,
    };
  },
});
</script>
