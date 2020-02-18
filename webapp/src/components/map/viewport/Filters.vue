<template>
  <defs>
    <clipPath id="circle-template">
      <circle :cx="0" :cy="0" :r="radius / 2" />
    </clipPath>
    <!-- TODO Unused : remove ? -->
    <filter id="fade-svg-filter">
      <feColorMatrix
        type="matrix"
        values=".6   0   0   0   0
             0  .6   0   0   0
             0   0  .6   0   0
             0   0   0   1   0 "
      />
    </filter>
  </defs>
</template>

<script>
export default {
  props: ['radius'],
}
</script>
