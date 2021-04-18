<template>
  <div>
    <h2 class="text-lg font-bold mb-4">Send funds</h2>
    <div>
      <p>Temporary address to fund: {{ address }}</p>
      <p>Total funding required: {{ total / 1e5 }} NIM</p>

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
import { connect, hubApi } from '../lib/NetworkClient';
import { ClientTransactionDetails, Transaction, Wallet } from '@nimiq/core-web';
import { CashlinkConfig } from '../types';

export default defineComponent({
  props: {
    config: {
      type: Object as () => CashlinkConfig,
      required: true,
    },
    wallet: {
      type: Object as () => Wallet,
      required: true,
    },
  },
  emits: ['walletFunded'],
  setup(props, { emit }) {
    const { config, wallet } = toRefs(props);

    const isWaitingForPayment = ref(false);

    const address = computed(() => {
      return wallet.value.address.toUserFriendlyAddress();
    });

    const total = computed(() => {
      console.log(config.value);
      const {
        numberOfCashlinks,
        amountPerCashlink,
        feePerCashlink,
      } = config.value;

      return numberOfCashlinks * (amountPerCashlink * 1e5 + feePerCashlink);
    });

    const transactionListener = (transaction: ClientTransactionDetails) => {
      const temporaryWallet: Wallet = wallet.value;
      console.log(transaction);
      if (transaction.state !== 'mined') {
        return;
      }

      if (transaction.recipient.toUserFriendlyAddress() !== address.value) {
        return;
      }

      // TODO: allow handling multiple transactions
      if (transaction.value < total.value) {
        return;
      }

      console.log('payment received, ready to generate');
      emit('walletFunded');
    };

    async function handlePay() {
      const options = {
        appName: 'Cashlink Generator',
        recipient: address.value,
        value: total.value,
      };

      try {
        const transaction = await hubApi().checkout(options);
        isWaitingForPayment.value = true;
      } catch {
        isWaitingForPayment.value = false;
      }
    }

    onMounted(async () => {
      const client = await connect();
      client.addTransactionListener(transactionListener, [address.value]);
    });

    return {
      address,
      total,
      isWaitingForPayment,
      handlePay,
    };
  },
});
</script>
