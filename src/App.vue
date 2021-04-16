<template>
  <div class="p-12 flex justify-between">
    <h1 class="text-xl" @click="step = 0">Cashlink Generator</h1>
    <p>Consensus: {{ networkStatus }}</p>
  </div>

  <main class="container mx-auto p-12 shadow-2xl bg-white rounded-lg">
    <configure-cashlinks v-if="step == 0" @configure="handleConfigure" />
    <send-funds v-if="step == 1" :config="cashlinkConfig" />
  </main>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { connect } from './lib/NetworkClient';

import HelloWorld from './components/HelloWorld.vue';
import ConfigureCashlinks from './components/ConfigureCashlinks.vue';
import SendFunds from './components/SendFunds.vue';

enum Step {
  Configure = 0,
  Send = 1,
  Generate = 2,
  Finish = 3,
}

export default defineComponent({
  name: 'App',
  components: {
    HelloWorld,
    ConfigureCashlinks,
    SendFunds,
  },
  setup() {
    const step = ref(Step.Configure);
    const currentBlockHeight = ref('Height: ...');
    const networkStatus = ref('loading');
    const cashlinkConfig = ref({});

    async function start() {
      const client = await connect();

      client.addHeadChangedListener(async () => {
        const headHeight = await client.getHeadHeight();
        console.log('headHeight', headHeight);
        currentBlockHeight.value = 'Height: ' + headHeight;
      });

      client.addConsensusChangedListener((consensusState) => {
        networkStatus.value = consensusState.toString();
      });
    }

    const handleConfigure = (config) => {
      cashlinkConfig.value = config;
      step.value = Step.Send;
    };

    start();

    return {
      currentBlockHeight,
      networkStatus,
      step,
      cashlinkConfig,
      handleConfigure,
    };
  },
});
</script>
