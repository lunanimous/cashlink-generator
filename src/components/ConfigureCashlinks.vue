<template>
  <div class="lg:flex">
    <div class="flex items-center text-center mb-24 lg:mb-0 lg:text-left lg:ml-24 lg:order-last">
      <div>
        <h1 class="font-bold text-8xl mb-6">Generate cashlinks</h1>
        <p class="text-6xl leading-tight mb-16">Easily generate multiple cashlinks for contests, giveaways or events</p>
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
          <label class="block">
            <span class="nq-label">Number of cashlinks</span>
            <input v-model="numberOfCashlinks" class="nq-input block w-full mt-2" type="number" />
          </label>
          <p class="nq-notice warning">{{ numberErrorMessage }}</p>
          <label class="block mt-4">
            <span class="nq-label">Amount in NIM per cashlink</span>
            <input v-model="amountPerCashlink" class="nq-input block w-full mt-2" type="number" />
          </label>
          <p class="nq-notice warning">{{ amountErrorMessage }}</p>
          <label class="block mt-4">
            <span class="nq-label">Fee in LUNA per byte</span>
            <input v-model="feePerByte" class="nq-input block w-full mt-2" type="number" />
          </label>
          <p class="nq-notice warning">{{ feeErrorMessage }}</p>

          <p class="nq-notice info mt-6">
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
import { Cashlink } from '../lib/Cashlink';

const DEFAULT_CASHLINKS = 5;
const MAX_CASHLINKS = 100;
const DEFAULT_AMOUNT = 10;
const MIN_AMOUNT = 5;
const DEFAULT_FEE = 1;
const MIN_FEE = 1;

function isNumberValid(number: number): boolean {
  const value = Number(number);

  return value >= 1 && value <= MAX_CASHLINKS;
}

function isAmountValid(amount: number): boolean {
  const value = Number(amount);

  return value >= MIN_AMOUNT;
}

function isFeeValid(fee: number): boolean {
  const value = Number(fee);

  return value >= MIN_FEE;
}

export default defineComponent({
  emits: ['configure'],
  setup(_, { emit }) {
    const numberOfCashlinks = ref(DEFAULT_CASHLINKS);
    const amountPerCashlink = ref(DEFAULT_AMOUNT);
    const feePerByte = ref(DEFAULT_FEE);

    const total = computed(() => {
      return numberOfCashlinks.value * (amountPerCashlink.value * 1e5 + feePerByte.value * Cashlink.SIZE);
    });

    const isValid = computed(() => {
      return (
        isNumberValid(numberOfCashlinks.value) && isAmountValid(amountPerCashlink.value) && isFeeValid(feePerByte.value)
      );
    });

    const numberErrorMessage = computed(() => {
      if (isNumberValid(numberOfCashlinks.value)) {
        return null;
      }

      return `The number must be at least 1 and less than ${MAX_CASHLINKS}`;
    });

    const amountErrorMessage = computed(() => {
      if (isAmountValid(amountPerCashlink.value)) {
        return null;
      }

      return `The amount must be at least ${MIN_AMOUNT} NIM`;
    });

    const feeErrorMessage = computed(() => {
      if (isFeeValid(feePerByte.value)) {
        return null;
      }

      return `The fee must be at least ${MIN_FEE} LUNA (${MIN_FEE / 1e5} NIM)`;
    });

    function handleSubmit() {
      const payload = {
        numberOfCashlinks: Number(numberOfCashlinks.value),
        amountPerCashlink: Number(amountPerCashlink.value * 1e5),
        feePerCashlink: Number(feePerByte.value * Cashlink.SIZE),
      };

      emit('configure', payload);
    }

    return {
      numberOfCashlinks,
      numberErrorMessage,
      amountPerCashlink,
      amountErrorMessage,
      feePerByte,
      feeErrorMessage,
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
