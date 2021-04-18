<template>
  <div>
    <h2 class="text-lg font-bold mb-4">Backup temporary wallet</h2>
    <div>
      <p>Address: {{ address }}</p>
      <p>Backup words: {{ backupWords }}</p>

      <div class="mt-6">
        <button
          class="justify-center py-2 px-4 text-white bg-indigo-800 hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          type="button"
          @click="handleNext"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Wallet } from '@nimiq/core-web';
import { defineComponent, onMounted, ref } from 'vue';
import { loadNimiq } from '../lib/CoreLoader';
import { connect } from '../lib/NetworkClient';

export default defineComponent({
  emits: ['walletCreate'],
  setup(_, { emit }) {
    const address = ref('');
    const backupWords = ref('');

    let wallet: Wallet;

    async function getFundingAddress() {
      const Nimiq = await loadNimiq();
      wallet = Nimiq.Wallet.generate();

      address.value = wallet.address.toUserFriendlyAddress();
      backupWords.value = Nimiq.MnemonicUtils.entropyToMnemonic(
        wallet.keyPair.privateKey.serialize()
      ).join(' ');

      console.log('new wallet', address.value, backupWords.value);

      const client = await connect();
      await client.waitForConsensusEstablished();
    }

    function handleNext() {
      const payload = {
        wallet,
      };

      emit('walletCreate', payload);
    }

    onMounted(() => {
      getFundingAddress();
    });

    return {
      address,
      backupWords,
      handleNext,
    };
  },
});
</script>
