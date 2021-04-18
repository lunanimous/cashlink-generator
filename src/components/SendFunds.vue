<template>
  <div>
    <h2 class="text-lg font-bold mb-4">Send funds</h2>
    <div>
      <p>Temporary address to fund: {{ address }}</p>
      <p>Total funding required: {{ totalFundsRequired / 1e5 }} NIM</p>

      <div class="mt-6">
        <button
          v-if="!isWaitingForPayment"
          class="justify-center py-2 px-4 text-white bg-indigo-800 hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          type="button"
          @click="handlePay"
        >
          Pay
        </button>
        <p v-if="isWaitingForPayment">
          Waiting for payment, this can take up to a minute...
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, toRefs } from 'vue';
import { loadNimiq } from '../lib/CoreLoader';
import { connect, hubApi } from '../lib/NetworkClient';
import { ClientTransactionDetails, Transaction } from '@nimiq/core-web';

export default defineComponent({
  props: {
    totalFundsRequired: {
      type: Number,
      required: true,
      default: () => {
        return 0;
      },
    },
  },
  emits: ['payment'],
  setup(props, { emit }) {
    const { totalFundsRequired } = toRefs(props);

    const address = ref('');
    const isWaitingForPayment = ref(false);
    let wallet;

    const transactionListener = (transaction: ClientTransactionDetails) => {
      console.log(transaction);
      if (transaction.state !== 'mined') {
        return;
      }

      if (transaction.recipient.toUserFriendlyAddress() !== address.value) {
        return;
      }

      // TODO: allow handling multiple transactions
      if (transaction.value < totalFundsRequired.value) {
        return;
      }

      console.log('payment received, ready to generate');
    };

    async function getFundingAddress() {
      const Nimiq = await loadNimiq();
      wallet = Nimiq.Wallet.generate();

      address.value = wallet.address.toUserFriendlyAddress();
      console.log('new wallet', address.value);

      const client = await connect();
      await client.waitForConsensusEstablished();

      client.addTransactionListener(transactionListener, [address.value]);
    }

    async function handlePay() {
      const options = {
        appName: 'Cashlink Generator',
        recipient: address.value,
        value: totalFundsRequired.value,
      };

      try {
        const transaction = await hubApi().checkout(options);
        isWaitingForPayment.value = true;
      } catch {
        isWaitingForPayment.value = false;
      }
    }

    onMounted(() => {
      getFundingAddress();
    });

    return {
      address,
      totalFundsRequired,
      isWaitingForPayment,
      handlePay,
    };
  },
});
</script>