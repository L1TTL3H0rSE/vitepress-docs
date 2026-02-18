# UI Components

Ниже представлен интерактивный пример компонента `Slider`, использующего composable `useDraggable`.

<script setup lang="ts">
import { ref } from 'vue'
const sliderVal = ref(50)
</script>

<ClientOnly>
  <div class="vp-raw demo-container">
    <p>Значение: {{ sliderVal }}</p>
    <Slider
      v-model="sliderVal"
      :min="0"
      :max="100"
      :step="1"
    />
  </div>
</ClientOnly>

<style>
.demo-container {
  margin: 1rem 0;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}
</style>

::: details Посмотреть код компонента
<<< @/components/Slider.vue
:::
