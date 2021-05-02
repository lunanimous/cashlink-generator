<template>
  <div class="lg:flex">
    <div class="flex items-center text-center mb-24 lg:text-left lg:ml-24 lg:order-last">
      <div>
        <h1 class="font-bold text-8xl mb-6">Generate cashlinks</h1>
        <p class="text-6xl leading-tight mb-2">Easily generate multiple cashlinks for contests, giveaways or events</p>
        <p class="text-5xl leading-tight text-gray-500">
          Get started by choosing the number of cashlinks and an amount
        </p>
      </div>
    </div>
    <div class="configure-card nq-card flex-shrink-0">
      <form @submit.prevent="handleSubmit">
        <div class="nq-card-header">
          <h2 class="nq-h1">Configure Cashlinks</h2>
        </div>
        <div class="nq-card-body">
          <label class="block mb-4">
            <span class="nq-label">Number of cashlinks</span>
            <input v-model="numberOfCashlinks" class="nq-input block w-full mt-2" type="number" />
          </label>
          <label class="block mb-4">
            <span class="nq-label">Amount in NIM per cashlink</span>
            <input v-model="amountPerCashlink" class="nq-input block w-full mt-2" type="number" />
          </label>
          <label class="block mb-6">
            <span class="nq-label">Fee in LUNA per cashlink</span>
            <input v-model="feePerCashlink" class="nq-input block w-full mt-2" type="number" />
          </label>

          <p class="nq-notice info">
            <span class="nq-text">Total: </span>
            <span class="text-4xl">{{ total / 1e5 }} NIM</span>
          </p>
        </div>
        <div class="nq-card-footer">
          <button class="nq-button light-blue" type="submit" :disabled="!isValid">Continue</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

export default defineComponent({
  emits: ['configure'],
  setup(_, { emit }) {
    const numberOfCashlinks = ref(1);
    const amountPerCashlink = ref(10);
    const feePerCashlink = ref(1);

    const total = computed(() => {
      return numberOfCashlinks.value * (amountPerCashlink.value * 1e5 + feePerCashlink.value);
    });

    const isValid = computed(() => {
      const number = Number(numberOfCashlinks.value);
      const amount = Number(amountPerCashlink.value);
      const fee = Number(feePerCashlink.value);

      return number > 0 && number < 100 && amount >= 10 && fee >= 1;
    });

    function handleSubmit() {
      const payload = {
        numberOfCashlinks: Number(numberOfCashlinks.value),
        amountPerCashlink: Number(amountPerCashlink.value * 1e5),
        feePerCashlink: Number(feePerCashlink.value),
      };

      console.log(payload);
      emit('configure', payload);
    }

    return {
      numberOfCashlinks,
      amountPerCashlink,
      feePerCashlink,
      total,
      isValid,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
.configure-card {
  width: 48rem;
  margin-left: auto;
  margin-right: auto;
}
</style>
