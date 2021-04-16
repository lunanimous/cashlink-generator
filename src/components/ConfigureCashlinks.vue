<template>
  <div>
    <h2 class="text-lg font-bold mb-4">Configure your cashlinks</h2>
    <form class="grid grid-cols-1 gap-6" @submit.prevent="handleSubmit">
      <label class="block">
        <span>Number of cashlinks</span>
        <input
          v-model="numberOfCashlinks"
          class="mt-1 block w-full"
          type="number"
        />
      </label>
      <label class="block">
        <span>Amount for each cashlink (in NIM)</span>
        <input
          v-model="amountPerCashlink"
          class="mt-1 block w-full"
          type="text"
        />
      </label>
      <label class="block">
        <span>Fee for each cashlink (in LUNA)</span>
        <input v-model="feePerCashlink" class="mt-1 block w-full" type="text" />
      </label>

      <div>
        <button
          class="justify-center py-2 px-4 text-white bg-indigo-800 hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          type="submit"
        >
          Next
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  emits: ['configure'],
  setup(_, { emit }) {
    const numberOfCashlinks = ref(1);
    const amountPerCashlink = ref(1);
    const feePerCashlink = ref(1);

    function handleSubmit() {
      const _numberOfCashlinks = Number(numberOfCashlinks.value);
      const _amountPerCashlink = Number(amountPerCashlink.value);
      const _feePerCashlink = Number(feePerCashlink.value);

      const payload = {
        numberOfCashlinks: _numberOfCashlinks,
        amountPerCashlink: _amountPerCashlink,
        feePerCashlink: _feePerCashlink,
      };
      console.log(payload);
      emit('configure', payload);
    }

    return {
      numberOfCashlinks,
      amountPerCashlink,
      feePerCashlink,
      handleSubmit,
    };
  },
});
</script>
