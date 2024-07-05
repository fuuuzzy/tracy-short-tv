<template>
  <div class="custom-footer">
    <p><a href="/privacy">PRIVACY</a> | <a href="/user"> AGREEMENT</a> | <a
        href="/copyright">COPYRIGHT</a>
    </p>
  </div>
</template>

<script lang="ts" setup>


</script>

<style scoped>
.custom-footer {
  text-align: center;
  background: #1e1e1e;
  width: 100%;
  height: 80px;
  text-align: center;
  line-height: 10px;
  font-size: 15px;
  color: #888888;

  p {
    margin-top: 40px;

    a:hover {
      color: orange;
    }
  }
}
</style>