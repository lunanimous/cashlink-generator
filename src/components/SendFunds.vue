<template>
  <div class="flex justify-center">
    <div class="nq-card">
      <div class="nq-card-header">
        <h2 class="nq-h1">Send funds</h2>
      </div>
      <div class="nq-card-body">
        <p class="nq-text">Now please send the funds to the temporary wallet.</p>
        <div class="mt-16">
          <p class="nq-label">Address</p>
          <p class="mt-2">{{ address }}</p>
        </div>
        <div class="mt-12">
          <p class="nq-label">Total funds to send</p>
          <p class="mt-2">{{ total / 1e5 }} NIM</p>
        </div>
      </div>
      <div class="nq-card-footer">
        <button v-if="!isWaitingForPayment" class="nq-button light-blue" @click="handlePay">Pay</button>
        <p v-if="isWaitingForPayment" class="p-12 nq-notice warning">
          Waiting for payment to be mined, this can take up to a minute...
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onDeactivated, onMounted, onUnmounted, ref, toRefs } from 'vue';
import { connect, hubApi } from '../lib/NetworkClient';
import { Client, ClientTransactionDetails, Transaction, Wallet } from '@nimiq/core-web';
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
      const { numberOfCashlinks, amountPerCashlink, feePerCashlink } = config.value;

      return numberOfCashlinks * (amountPerCashlink + feePerCashlink);
    });

    let client: Client;
    let listenerHandle: number;

    const transactionListener = (transaction: ClientTransactionDetails) => {
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
        await hubApi().checkout(options);
        isWaitingForPayment.value = true;
      } catch {
        isWaitingForPayment.value = false;
      }
    }

    onMounted(async () => {
      client = await connect();
      listenerHandle = await client.addTransactionListener(transactionListener, [address.value]);
    });

    onUnmounted(() => {
      if (client && listenerHandle) {
        client.removeListener(listenerHandle);
      }
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
