<template>
  <div class="p-12 flex justify-between">
    <h1 class="text-xl">Cashlink Generator</h1>
    <p>Consensus: {{ networkStatus }}</p>
  </div>

  <main class="container mx-auto p-12 shadow-2xl bg-white rounded-lg">
    <HelloWorld :msg="currentBlockHeight" />
  </main>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import HelloWorld from './components/HelloWorld.vue';
import { loadNimiq } from './lib/CoreLoader';

export default defineComponent({
  name: 'App',
  components: {
    HelloWorld,
  },
  setup() {
    const currentBlockHeight = ref('Height: ...');
    const networkStatus = ref('loading');

    async function start() {
      const Nimiq = await loadNimiq();
      const configBuilder = Nimiq.Client.Configuration.builder();
      const client = configBuilder.instantiateClient();

      client.addHeadChangedListener(async () => {
        const headHeight = await client.getHeadHeight();
        console.log('headHeight', headHeight);
        currentBlockHeight.value = 'Height: ' + headHeight;
      });

      client.addConsensusChangedListener((consensusState) => {
        networkStatus.value = consensusState.toString();
      });
    }

    start();

    return {
      currentBlockHeight,
      networkStatus,
    };
  },
});
</script>
