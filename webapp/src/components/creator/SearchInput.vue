<template>
  <div>
    <div class="input-label" v-if="label">
      <span>{{ label }}</span>
    </div>
    <div class="search-input-container">
      <div class="input-group">
        <input
          class="text-input"
          :class="{ invalid: !valid && !refreshed }"
          type="search"
          v-model="value"
          :placeholder="placeholder"
          @keyup.enter="emitSubmit"
        />
      </div>
      <button
        class="side-button"
        :class="{ busy: busy, success: success && !refreshed }"
        @click="emitSubmit"
      >
        {{ submitWord }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: [
    'placeholder',
    'submitWord',
    'valueProp',
    'valid',
    'label',
    'busy',
    'success',
  ],
  data() {
    return {
      value: '',
      refreshed: false,
    }
  },
  mounted() {
    if (this.valueProp) this.value = this.valueProp
  },
  methods: {
    emitSubmit() {
      this.refreshed = false
      this.$emit('submit', this.value)
    },
  },
  watch: {
    value: function() {
      this.refreshed = true
    },
  },
}
</script>

<style lang="scss" scoped>
.search-input-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-label {
  font-size: 20px;
  text-align: left;
  margin-bottom: 5px;
  width: 100%;
}

.side-button {
  border-radius: 0px 3px 3px 0px;
  cursor: pointer;
  text-decoration: none;
  border: 0px;
  font-size: 15px;
}

.text-input {
  background-color: rgba(255, 255, 255, 0.2);
  color: #eee;
  padding: 10px;
  border-radius: 3px;
  border: 0px;
  font-size: 20px;
}

.side-button:hover {
  background-color: rgba(255, 255, 255, 0.7);
}

.busy {
  opacity: 0.5;
  pointer-events: none;
}

.invalid {
  border: 3px solid #ff4444;
}

.success {
  background-color: lightgreen;
}

@media (max-width: 600px) {
  .side-button {
    height: 30px;
    width: 50px;
  }
}

@media (min-width: 601px) {
  .text-input {
    width: 250px;
    height: 60px;
  }

  .side-button {
    height: 45px;
    width: 70px;
  }
}

@media (min-width: 800px) {
  .text-input {
    width: 400px;
    height: 70px;
  }

  .side-button {
    height: 60px;
    width: 100px;
  }
}
</style>
