<template>
  <div class="container">
    <Creator/>
  </div>
</template>

<script>
import Creator from "@/components/Creator";
export default {
  components: {
    Creator,
  },
}
</script>

<style lang="scss" scoped>
.container {
  margin-top: 30px;
}
//.welcome-inherited-container {
//  position: relative;
//  padding-top: 64px;
//
//  display: flex;
//  justify-content: center;
//  align-items: center;
//  background-color: $bg-primary;
//}
//
//.welcome-container {
//  position: absolute;
//
//  display: flex;
//  justify-content: center;
//  align-items: center;
//  flex-direction: column;
//}
//
//.logo-big {
//  width: 100px;
//  height: 100px;
//  opacity: 0.9;
//}
//
//@media (min-width: 601px) {
//  .welcome-container {
//    width: 600px;
//    padding: 50px 100px;
//  }
//}
//
//@media (max-width: 600px) {
//  .welcome-container {
//    margin: 0px 50px;
//    padding: 20px;
//  }
//}
//
//.hero-logo {
//}
//
//.welcome-header {
//  margin: 30px 0px;
//  background-color: $bg-primary;
//  border: solid 1px #121212;
//  padding: 20px;
//}
//
//.info-message {
//  color: $bg-primary;
//}
//
//.login-button {
//  margin-bottom: 40px;
//}
//
//.login-button:hover {
//  background-color: $bg-primary;
//}
//
//.background-fill {
//  position: fixed;
//  left: 0px;
//  width: 50%;
//  height: 100%;
//  background-color: $black;
//}
</style>
