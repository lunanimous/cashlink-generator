<template>
  <div>
    <h2 class="text-lg font-bold mb-4">Generate Cashlinks</h2>

    <p v-if="!cashlinksWithStatus">Generating cashlinks...</p>
    <p v-for="(cashlink, index) in cashlinksWithStatus" :key="index">
      <b>{{ cashlink.url }}</b>
      <span>{{ cashlink.status }}</span>
    </p>
  </div>
</template>

<script lang="ts">
import { Wallet } from '@nimiq/core-web';
import { computed, defineComponent, onMounted, Ref, ref, toRefs } from 'vue';
import { Cashlink } from '../lib/Cashlink';
import { connect } from '../lib/NetworkClient';
import { CashlinkConfig } from '../types';

const NIMIQ_HUB_URL = String(import.meta.env.VITE_NIMIQ_HUB_URL);

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
  setup(props) {
    const { wallet, config } = toRefs(props);
    const cashlinks: Ref<Cashlink[]> = ref([]);
    const cashlinkStatuses: Ref<any[]> = ref([]);

    const cashlinksWithStatus = computed(() => {
      if (!cashlinks) {
        return [];
      }

      return cashlinks.value.map((cashlink: Cashlink, index: number) => {
        const statuses = cashlinkStatuses.value;
        const status = statuses[index] ? 'funded' : 'waiting...';
        return {
          url: `${NIMIQ_HUB_URL}/cashlink/#${cashlink.render()}`,
          status: status,
        };
      });
    });

    async function generateCashlinks() {
      const generatedCashlinks = [];
      for (let i = 0; i < config.value.numberOfCashlinks; i++) {
        const cashlink = await Cashlink.create(config.value.amountPerCashlink);
        generatedCashlinks.push(cashlink);
      }
      cashlinks.value = generatedCashlinks;
      cashlinkStatuses.value = Array(generatedCashlinks.length);
    }

    async function fundCashlinks() {
      const client = await connect();
      for (let i = 0; i < cashlinks.value.length; i++) {
        const cashlink = cashlinks.value[i];

        const address = cashlink.address;
        const amount = config.value.amountPerCashlink;
        const fee = config.value.feePerCashlink;

        const transaction = wallet.value.createTransaction(
          address,
          amount,
          fee,
          await client.getHeadHeight()
        );
        await client.sendTransaction(transaction);
        cashlinkStatuses.value.splice(i, 1, 1);
      }
    }

    onMounted(async () => {
      await generateCashlinks();
      await fundCashlinks();
    });

    return { cashlinksWithStatus };
  },
});
</script>
