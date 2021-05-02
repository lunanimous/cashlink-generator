<template>
  <div class="flex justify-center">
    <div class="nq-card">
      <div class="nq-card-header">
        <h2 class="nq-h1">Cashlinks</h2>
      </div>
      <div class="nq-card-body">
        <p class="nq-text">Please find below the generated cashlinks, make sure to copy or download them.</p>

        <p v-if="!cashlinksWithStatus" class="nq-notice warning">Generating cashlinks..</p>
        <button @click="handleSave" class="nq-button-pill light-blue mb-8" type="button">Download all cashlinks</button>

        <div
          v-for="(cashlink, index) in cashlinksWithStatus"
          :key="index"
          class="mt-4 flex items-center justify-between border-t-2 pt-4"
        >
          <div class="flex-1">
            <p></p>
            <a class="nq-link" :href="cashlink.url" target="__blank">Cashlink {{ index + 1 }}</a>
          </div>
          <div class="">
            <p
              v-if="cashlink.status == 0"
              class="inline-block rounded-lg text-3xl bg-gray-100 p-4 text-gray-400 font-bold"
            >
              Pending
            </p>
            <p
              v-if="cashlink.status == 1"
              class="inline-block rounded-lg text-3xl bg-green-100 p-4 text-green-500 font-bold"
            >
              Funded
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Wallet } from '@nimiq/core-web';
import { computed, defineComponent, onMounted, Ref, ref, toRefs } from 'vue';
import { saveAs } from 'file-saver';
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
        const status = statuses[index] ? statuses[index] : 0;
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

        const transaction = wallet.value.createTransaction(address, amount, fee, await client.getHeadHeight());
        await client.sendTransaction(transaction);
        cashlinkStatuses.value.splice(i, 1, 1);
      }
    }

    function handleSave() {
      console.log('save');
      const lines = cashlinksWithStatus.value.map((cashlink) => cashlink.url);
      const data = lines.join('\r\n');
      const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, 'cashlinks.txt');
    }

    onMounted(async () => {
      await generateCashlinks();
      await fundCashlinks();
    });

    return { cashlinksWithStatus, handleSave };
  },
});
</script>
