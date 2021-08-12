<template>
  <div class="my-data">
    <md-field>
      <label>upload</label>
      <md-file v-model="single" @change="onFileSelected($event)" />
      <md-icon @click.native="fileAttach()">add</md-icon>
    </md-field>
    <md-table>
      <md-table-row>
        <md-table-head md-numeric>name</md-table-head>
        <md-table-head>type</md-table-head>
        <md-table-head>size</md-table-head>
      </md-table-row>
    </md-table>
  </div>
</template>
<script lang="ts">
  import { Component, Vue } from "vue-property-decorator";
  @Component({
    components: {},
  })
  export default class MyData extends Vue {
    initial = "";
    single = null;
    placeholder = null;
    disabled = null;
    multiple = null;
    file: File | null = null;
    fileAttach(): void {
      console.log("file첨부");
      let formData = new FormData();
      formData.append("data", this.file as File);
      this.$axios
        .post("/data", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((result: { [key: string]: any }) => {
          console.log(result);
        })
        .catch((err: any) => {
          console.log(err.response);
        });
    }
    onFileSelected(event: Event) {
      console.log(event);
      if (!event.target) return;
      if (!("files" in event.target)) return;
      const files = event.target["files"];
      if (!files) this.file = null;
      else this.file = files[0];
      console.log(this.file);
    }
  }
</script>
<style scoped lang="scss">
  .md-table::v-deep {
    .md-table-head-container {
      text-align: left;
    }
  }
</style>
