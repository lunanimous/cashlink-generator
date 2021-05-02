<template>
  <div class="flex justify-center">
    <div class="nq-card">
      <div class="nq-card-header">
        <h2 class="nq-h1">Backup temporary wallet</h2>
      </div>
      <div class="nq-card-body">
        <p class="nq-text">
          You will need to transfer funds to a temporary wallet, in case something goes wrong, please backup the
          recovery words.
        </p>
        <div class="mt-16">
          <p class="nq-label">Address</p>
          <p class="mt-2">{{ address }}</p>
        </div>
        <div class="mt-12">
          <p class="nq-label">Recovery Words</p>
          <p class="mt-2">{{ backupWords }}</p>
        </div>
      </div>
      <div class="nq-card-footer">
        <button class="nq-button light-blue" @click="handleNext">Continue</button>
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
      backupWords.value = Nimiq.MnemonicUtils.entropyToMnemonic(wallet.keyPair.privateKey.serialize()).join(' ');

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
