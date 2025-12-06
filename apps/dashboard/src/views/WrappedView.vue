<template>
  <div
    class="fixed inset-0 z-50 w-screen h-screen flex items-start justify-center sm:static sm:inset-auto sm:w-auto sm:h-auto sm:items-center sm:justify-center"
  >
    <div
      class="w-full rounded-none sm:rounded-4xl sm:shadow-2xl h-full p-4 flex flex-col sm:h-160 sm:w-96 overflow-hidden relative"
    >
      <div class="bg-container absolute inset-0 pointer-events-none">
        <div
          v-if="prevBackground"
          class="bg-layer absolute inset-0 bg-cover bg-center prev"
          :class="{ fading: prevFading }"
          :style="{ background: prevBackground }"
        />

        <div class="bg-layer absolute inset-0 bg-cover bg-center current" :style="{ background: currentBackground }" />
      </div>

      <div class="card-content relative z-10 flex flex-col h-full">
        <div class="relative overflow-hidden flex-1">
          <div
            class="carousel-track h-full flex"
            :style="trackStyle"
            @lostpointercapture="onPointerUp"
            @pointercancel="onPointerUp"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
          >
            <div
              v-for="(card, index) in cardComponents"
              :key="index"
              class="card min-h-0 min-w-full p-4 flex flex-col justify-center items-start h-full rounded-none sm:rounded-4xl overflow-hidden"
            >
              <component :is="card" v-bind="testCardProps[index]" :active="currentIndex === index" />
            </div>
          </div>
        </div>

        <WrappedControls
          :current-index="currentIndex"
          :show-arrows="showArrows"
          :total-cards="totalCards"
          @go="goTo"
          @next="next"
          @prev="prev"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import WelcomeCard from '@/components/wrapped/0_WelcomeCard.vue';
import TransactionsCard from '@/components/wrapped/1_TransactionsCard.vue';
import CalendarHeatmapCard from '@/components/wrapped/2_CalendarHeatmapCard.vue';
import TopProductCard from '@/components/wrapped/3_TopProductCard.vue';
import ProductsCard from '@/components/wrapped/4_ProductsCard.vue';
import TotalSpentCard from '@/components/wrapped/5_TotalSpentCard.vue';
import SpendingDistributionCard from '@/components/wrapped/6_SpendingDistributionCard.vue';
import WrappedControls from '@/components/wrapped/Controls/WrappedControls.vue';
import { useWrappedEnabled } from '@/composables/wrappedEnabled';
import router from '@/router';

const { wrappedEnabled, canOverride } = useWrappedEnabled();

if (!wrappedEnabled.value && !canOverride.value) {
  void router.push({ name: 'home' });
}

const authStore = useAuthStore();

const width = ref<number>(window.innerWidth);
const showArrows = computed(() => width.value >= 640);

const updateWindowWidth = () => {
  width.value = window.innerWidth;
};

const userFirstName = computed(() => {
  return authStore.getUser?.firstName;
});

type CardProps = Record<string, unknown>;

// TODO: replace with real data
const testCardProps: CardProps[] = [
  { firstName: userFirstName, showArrows: showArrows },
  { transactionCount: 321, previousTransactionCount: 275, percentile: 5 },
  {
    heatmap: Array.from({ length: 365 }, () => Math.floor(Math.random() * 10)),
    maxDate: new Date(2025, 8, 11),
    maxValue: 67,
  },
  {
    product: {
      name: 'Test Product',
      priceInclVat: { amount: 250, currency: 'EUR' },
      boughtTimes: 21,
    },
  },
  {
    topFiveProducts: [
      {
        name: 'Test Product',
        priceInclVat: { amount: 250, currency: 'EUR' },
        boughtTimes: 21,
      },
      {
        name: 'Test Product 2',
        priceInclVat: { amount: 250, currency: 'EUR' },
        boughtTimes: 20,
      },
      {
        name: 'Test Product 3',
        priceInclVat: { amount: 250, currency: 'EUR' },
        boughtTimes: 19,
      },
      {
        name: 'Test Product 4',
        priceInclVat: { amount: 250, currency: 'EUR' },
        boughtTimes: 6,
      },
      {
        name: 'Test Product 5',
        priceInclVat: { amount: 250, currency: 'EUR' },
        boughtTimes: 7,
      },
    ],
  },
  {
    totalSpent: 234567,
    previousTotalSpent: 123456,
    totalSpentPercentile: 2,
  },
  {
    totalSpent: 234567,
    totalSpentBorrel: 180000,
    totalSpentAlcohol: 150000,
    totalSpentSoda: 50000,
    totalSpentSnacks: 34567,
  },
];

const cardComponents = [
  WelcomeCard,
  TransactionsCard,
  CalendarHeatmapCard,
  TopProductCard,
  ProductsCard,
  TotalSpentCard,
  SpendingDistributionCard,
];
const currentIndex = ref(0);

const cardBackgrounds = [
  '#b40000',
  '#ffffff',
  'linear-gradient(90deg, #0d1117 0%, #1f2937 100%)',
  'linear-gradient(135deg, #004ff9 0%, #000000 100%)',
  'linear-gradient(135deg, #662d8c 0%, #ed1e79 100%)',
  'linear-gradient(45deg, #233329 0%, #63d471 100%)',
  'linear-gradient(135deg, #ff8800 0%, #ff3300 100%)',
];

const currentBackground = computed(() => cardBackgrounds[currentIndex.value]);

const totalCards = computed(() => cardComponents.length);

const prevBackground = ref<string | null>(null);
const prevFading = ref(false);
const bgFadeDuration = 420;

watch(currentIndex, async (newIndex, oldIndex) => {
  if (oldIndex === undefined || oldIndex === newIndex) return;
  prevBackground.value = cardBackgrounds[oldIndex];
  prevFading.value = false;

  await nextTick();
  prevFading.value = true;

  setTimeout(() => {
    prevBackground.value = null;
    prevFading.value = false;
  }, bgFadeDuration);
});

function clampIndex(i: number) {
  return Math.max(0, Math.min(i, totalCards.value - 1));
}

function next() {
  currentIndex.value = clampIndex(currentIndex.value + 1);
}
function prev() {
  currentIndex.value = clampIndex(currentIndex.value - 1);
}
function goTo(i: number) {
  currentIndex.value = clampIndex(i);
}

let pointerDown = false;
let dragging = false;
let startX = 0;
let currentX = 0;
let deltaX = 0;
let startY = 0;

const threshold = 25; // px to trigger a swipe

const trackStyle = computed(() => {
  const baseTranslate = -currentIndex.value * 100;
  if (dragging && deltaX !== 0) {
    // while dragging, don't animate so movement follows pointer
    return {
      transform: `translateX(calc(${baseTranslate}% + ${deltaX}px))`,
      transition: 'none',
    } as Record<string, string>;
  }

  // smooth transition when snapping to wrapped
  return {
    transform: `translateX(${baseTranslate}%)`,
    transition: 'transform 400ms cubic-bezier(.2,.8,.2,1)',
  } as Record<string, string>;
});

function onPointerDown(e: PointerEvent) {
  pointerDown = true;
  dragging = false;
  startX = e.clientX;
  startY = e.clientY;
  currentX = startX;
  deltaX = 0;
  (e.target as Element).setPointerCapture(e.pointerId);
}

function onPointerMove(e: PointerEvent) {
  if (!pointerDown) return;
  currentX = e.clientX;
  const dx = currentX - startX;
  const dy = e.clientY - startY;
  // if vertical scrolling is dominant, don't treat as horizontal swipe
  if (!dragging && Math.abs(dy) > Math.abs(dx)) {
    return;
  }
  dragging = true;
  deltaX = dx;
}

function onPointerUp(e: PointerEvent) {
  if (!pointerDown) return;
  pointerDown = false;
  (e.target as Element).releasePointerCapture(e.pointerId);

  if (!dragging) {
    deltaX = 0;
    return;
  }

  if (deltaX > threshold) {
    // swipe right -> previous
    prev();
  } else if (deltaX < -threshold) {
    // swipe left -> next
    next();
  }

  // reset drag state
  deltaX = 0;
  dragging = false;
}

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateWindowWidth);
});
</script>

<style>
.carousel-track {
  will-change: transform;
  touch-action: pan-y;
  transition: transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.bg-layer {
  opacity: 1;
  background-repeat: no-repeat;
  background-position: center right;
  background-size: cover;
  pointer-events: none;
}

.bg-layer.current {
  z-index: 0; /* underneath while prev fades out on top */
}

.bg-layer.prev {
  z-index: 1;
  opacity: 1;
  transition: opacity 420ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.bg-layer.prev.fading {
  opacity: 0;
}

/* Used in child cards */
.card-root {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 1rem;
  box-sizing: border-box;
  transition:
    transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 340ms ease;
  transform: translateY(10px) scale(0.99);
}

.card-root.active {
  transform: translateY(0) scale(1);
  opacity: 1;
}

.bg {
  position: absolute;
  inset: 0;
  background-repeat: no-repeat;
  background-position: center right;
  pointer-events: none;
  z-index: 1;
}

.content {
  position: relative;
  z-index: 2;
  margin-left: auto;
  margin-right: auto;
}

.fade-slide {
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 240ms ease,
    transform 240ms ease;
  pointer-events: none;
}
.fade-slide[aria-hidden='false'] {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
</style>
