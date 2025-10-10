<template>
  <div class="api-table">
    <h3>{{ title }}</h3>
    <table>
      <thead>
        <tr>
          <th v-for="header in headers" :key="header">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in data" :key="index">
          <td v-for="header in headers" :key="header + index">
            <code v-if="header.toLowerCase() === '属性' || header.toLowerCase() === '事件名'">{{ row[header.toLowerCase()] }}</code>
            <span v-else>{{ row[header.toLowerCase()] }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  title: String,
  headers: Array,
  data: Array,
});
</script>

<style scoped>
.api-table {
  margin-top: 40px;
}

.api-table h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  font-size: 14px;
  border: 1px solid #f0f0f0;
}

th, td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

thead tr {
  background-color: #fafafa;
}

th {
  font-weight: 500;
  color: #000;
}

td {
  color: #333;
}

code {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  background-color: #f7f7f7;
  padding: .2em .4em;
  border-radius: 3px;
  font-size: .9em;
}
</style>
