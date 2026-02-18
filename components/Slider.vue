<script lang="ts" setup>
import { computed, nextTick, ref, StyleValue, watch } from "vue";
import { useDraggable } from "../composables/useDraggable";

export type SliderProps = {
  modelValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};

const props = withDefaults(defineProps<SliderProps>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: number): void;
}>();

const trackRef = ref<HTMLElement>();
const thumbRef = ref<HTMLElement>();

const { position, onMouseDown, isDragging } = useDraggable({
  target: thumbRef,
  useOffset: true,
});

const valueAsPercentage = computed(() => {
  const range = props.max - props.min;
  const normalizedValue = props.modelValue - props.min;
  return (normalizedValue / range) * 100;
});

watch(
  () => position.value.x,
  (newPercentageX) => {
    if (props.disabled) return;
    const range = props.max - props.min;
    let newValue = (newPercentageX / 100) * range + props.min;
    if (props.step > 0) {
      newValue = Math.round(newValue / props.step) * props.step;
    }
    newValue = Math.max(props.min, Math.min(props.max, newValue));
    if (newValue !== props.modelValue) {
      emit("update:modelValue", newValue);
    }
  },
);

const thumbStyle = computed<StyleValue>(() => ({
  left: `${valueAsPercentage.value}%`,
}));

const fillStyle = computed<StyleValue>(() => ({
  width: `${valueAsPercentage.value}%`,
}));

async function handleTrackClick(_event: MouseEvent | TouchEvent) {
  if (props.disabled || !trackRef.value || !thumbRef.value) return;
  const event = "touches" in _event ? _event.touches[0] : _event;
  if (!event) return;
  const trackRect = trackRef.value.getBoundingClientRect();
  const thumbRect = thumbRef.value.getBoundingClientRect();
  const clickX = event.clientX - trackRect.left;
  const effectiveWidth = trackRect.width - thumbRect.width;
  const targetX = clickX - thumbRect.width / 2;
  const clampedX = Math.max(0, Math.min(targetX, effectiveWidth));
  const percentage = effectiveWidth > 0 ? (clampedX / effectiveWidth) * 100 : 0;
  position.value = { x: percentage, y: 0 };
  const range = props.max - props.min;
  let newValue = (percentage / 100) * range + props.min;
  if (props.step && props.step > 0) {
    newValue = Math.round(newValue / props.step) * props.step;
  }
  newValue = Math.max(props.min, Math.min(props.max, newValue));
  if (newValue != props.modelValue) {
    emit("update:modelValue", newValue);
  }
  await nextTick();
  onMouseDown(_event, thumbRef.value);
}
</script>

<template>
  <div
    ref="trackRef"
    class="slider"
    :class="{ disabled: disabled, dragging: isDragging }"
    @mousedown="handleTrackClick"
    @touchstart="handleTrackClick"
  >
    <div class="slider__track">
      <div
        class="slider__fill"
        :style="fillStyle"
      />
    </div>
    <div
      ref="thumbRef"
      class="slider__thumb"
      :style="thumbStyle"
      @mousedown.stop
    />
  </div>
</template>

<style lang="scss">
.slider {
  position: relative;
  width: 100%;
  height: 1.5rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  box-sizing: content-box;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  &.disabled {
    cursor: default;
    .slider__fill {
      background-color: var(--disabled-background-color);
    }
    .slider__thumb {
      background-color: var(--disabled-color);
      outline: 2px solid var(--disabled-color);
    }
  }

  &__track {
    position: absolute;
    width: 100%;
    height: 0.25rem;
    background-color: var(--disabled-background-color);
    border-radius: 0.125rem;
    pointer-events: none;
  }

  &__fill {
    position: absolute;
    height: 100%;
    background-color: var(--primary-main-color);
    border-radius: 0.125rem;
    pointer-events: none;
  }

  &__thumb {
    position: absolute;
    width: 0.625rem;
    height: 0.625rem;
    background-color: var(--primary-main-color);
    background-clip: content-box;
    padding: 2px;
    outline: 2px solid var(--primary-main-color);
    border-radius: 50%;
    box-shadow: var(--effects-shadow-s);
    pointer-events: auto;
    transition: transform 0.1s ease-in-out;
    transform: translateX(-50%);

    .slider:not(.disabled):hover &,
    .slider.dragging & {
      transform: translateX(-50%) scale(1.1);
    }
  }
}
</style>
