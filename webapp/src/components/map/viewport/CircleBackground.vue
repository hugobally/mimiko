<template>
  <g>
    <circle
      v-for="(circle, index) in circles"
      :key="index"
      cx="0"
      cy="0"
      :r="circle.r"
      stroke="#eee"
      stroke-width="1"
      :stroke-opacity="circle.opacity"
      fill-opacity="0"
    ></circle>
  </g>
</template>

<script>
export default {
  computed: {
    circles() {
      let numCircles = 0
      for (const k of Object.values(this.$store.state.map.knots)) {
        if (k.level > numCircles) numCircles = k.level
      }
      numCircles = numCircles + 3
      const circles = []

      let opacity = 1
      for (let i = 0; i < numCircles; i++) {
        if (numCircles - i <= 3) {
          opacity = (numCircles - i) * 0.25
        }
        circles.push({ r: 300 + i * 300, opacity: opacity })
      }

      return circles
    },
  },
}
</script>
