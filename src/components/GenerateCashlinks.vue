<template>
  <div>
    <h2 class="text-lg font-bold mb-4">Generate Cashlinks</h2>

    <p>Generating cashlinks...</p>
  </div>
</template>

<script lang="ts">
import { Wallet } from '@nimiq/core-web';
import { defineComponent, onMounted, toRefs } from 'vue';

export default defineComponent({
  props: {
    wallet: {
      type: Object as () => Wallet,
      required: true,
    },
  },
  setup(props) {
    const { wallet } = toRefs(props);

    async function generate() {
      console.log(
        'generating...',
        wallet.value.address.toUserFriendlyAddress()
      );
    }

    onMounted(() => generate());
  },
});
</script>
