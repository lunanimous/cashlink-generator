<template>
  <div class="flex justify-center">
    <div class="nq-card">
      <div class="nq-card-header">
        <h2 class="nq-h1">Cashlinks</h2>
      </div>
      <div class="nq-card-body">
        <p class="nq-notice info">Please find below the generated cashlinks, make sure to copy or download them.</p>
        <p class="nq-text">It can take a couple minutes until all cashlinks are generated and funded.</p>

        <p v-if="!displayCashlinks" class="nq-notice warning">Generating cashlinks..</p>
        <button @click="handleSave" class="nq-button-pill light-blue mb-8" type="button">Download all cashlinks</button>

        <div
          v-for="(cashlink, index) in displayCashlinks"
          :key="index"
          class="mt-4 flex items-center justify-between border-t-2 pt-4"
        >
          <div class="flex-1">
            <p></p>
            <a class="nq-link" :href="cashlink.url" target="__blank">Cashlink {{ index + 1 }}</a>
          </div>
          <div class="">
            <p
              v-if="cashlink.status == CashlinkStatus.New"
              class="inline-block rounded-lg text-3xl bg-gray-100 p-4 text-gray-400 font-bold"
            >
              New
            </p>
            <p
              v-if="cashlink.status == CashlinkStatus.Pending"
              class="inline-block rounded-lg text-3xl bg-yellow-100 p-4 text-yellow-700 font-bold"
            >
              Pending
            </p>
            <p
              v-if="cashlink.status == CashlinkStatus.Funded"
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
import { Client, ClientTransactionDetails, Hash, Wallet } from '@nimiq/core-web';
import { computed, defineComponent, onMounted, onUnmounted, Ref, ref, toRefs } from 'vue';
import { saveAs } from 'file-saver';
import { Cashlink } from '../lib/Cashlink';
import { connect } from '../lib/NetworkClient';
import { CashlinkConfig } from '../types';

const NIMIQ_HUB_URL = String(import.meta.env.VITE_NIMIQ_HUB_URL);

enum CashlinkStatus {
  New,
  Pending,
  Funded,
}

interface CashlinkInfo {
  cashlink: Cashlink;
  status: CashlinkStatus;
  transactionHash?: Hash;
}

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
    const cashlinkInfos: Ref<CashlinkInfo[]> = ref([]);

    const displayCashlinks = computed(() => {
      if (!cashlinkInfos) {
        return [];
      }

      return cashlinkInfos.value.map(({ cashlink, status }) => {
        return {
          url: `${NIMIQ_HUB_URL}/cashlink/#${cashlink.render()}`,
          status: status,
        };
      });
    });

    let client: Client;
    let listenerHandle: number;

    const transactionListener = (transaction: ClientTransactionDetails) => {
      if (transaction.state !== 'mined') {
        return;
      }

      const index = cashlinkInfos.value.findIndex((needle) => {
        return needle.transactionHash?.equals(transaction.transactionHash);
      });

      if (index === -1) {
        return;
      }

      const oldCashlinkInfo = cashlinkInfos.value[index];
      cashlinkInfos.value.splice(index, 1, {
        ...oldCashlinkInfo,
        status: CashlinkStatus.Funded,
      });
    };

    async function generateCashlinks() {
      const generatedCashlinks = [];

      for (let i = 0; i < config.value.numberOfCashlinks; i++) {
        const cashlink = await Cashlink.create(config.value.amountPerCashlink, config.value.feePerCashlink);
        const cashlinkInfo: CashlinkInfo = {
          cashlink,
          status: CashlinkStatus.New,
        };

        generatedCashlinks.push(cashlinkInfo);
      }

      cashlinkInfos.value = generatedCashlinks;

      // watch cashlink addresses for transactions to update status
      const addresses = generatedCashlinks.map(({ cashlink }) => cashlink.address);
      listenerHandle = await client.addTransactionListener(transactionListener, addresses);
    }

    async function fundCashlinks() {
      for (let i = 0; i < cashlinkInfos.value.length; i++) {
        const cashlinkInfo = cashlinkInfos.value[i];

        const sender = wallet.value.address;

        const recipient = cashlinkInfo.cashlink.address;
        const amount = cashlinkInfo.cashlink.value;
        const fee = cashlinkInfo.cashlink.fee;
        const data = Cashlink.FUNDING_DATA;

        const transaction = new Nimiq.ExtendedTransaction(
          sender,
          Nimiq.Account.Type.BASIC,
          recipient,
          Nimiq.Account.Type.BASIC,
          amount,
          fee,
          await client.getHeadHeight(),
          Nimiq.Transaction.Flag.NONE,
          data
        );

        const proof = wallet.value.signTransaction(transaction);
        transaction.proof = proof.serialize();

        const transactionDetails = await client.sendTransaction(transaction);

        const updatedCashlinkInfo: CashlinkInfo = {
          cashlink: cashlinkInfo.cashlink,
          status: CashlinkStatus.Pending,
          transactionHash: transactionDetails.transactionHash,
        };

        cashlinkInfos.value.splice(i, 1, updatedCashlinkInfo);
      }
    }

    function handleSave() {
      const lines = displayCashlinks.value.map((cashlink) => cashlink.url);
      const data = lines.join('\r\n');
      const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, 'cashlinks.txt');
    }

    onMounted(async () => {
      client = await connect();
      await generateCashlinks();
      await fundCashlinks();
    });

    onUnmounted(() => {
      if (client && listenerHandle) {
        client.removeListener(listenerHandle);
      }
    });

    return { CashlinkStatus, displayCashlinks, handleSave };
  },
});
</script>
