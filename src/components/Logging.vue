<template>
    <div>
        <button class="generalButton" @click="saveDataToFile">Download Epochs</button>
    </div>
</template>
<script>

export default {
    name: 'LoggingButton',
    components: {},
    props: {
        appendedData: {
            required: true
        }
    },
    data() {
        return {}
    },
    mounted() {
    },
    methods: {
        saveDataToFile() {
            const dataStr = JSON.stringify(this.appendedData, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            let timestamp = new Date().toISOString()
            link.download = timestamp + '.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link)
        }
    },
    computed: {

    },
    watch: {


    }
}
</script>
<style>
.generalButton {
    background-color: #FFFFFF;
    border: 0 solid rgba(0, 0, 0, 0);
    border-radius: .25rem;
    box-shadow: rgba(0, 0, 0, 0.02) 0 0 0 0;
    box-sizing: border-box;
    color: rgba(0, 0, 0, 1);
    cursor: pointer;
    font-family: system-ui,-apple-system,system-ui,"Helvetica Neue",Helvetica,Arial,sans-serif;
    font-size: 16px;
    font-weight: 600;
    justify-content: center;
    line-height: 1.25;
    margin: 0;
    height: 3rem;
    padding: calc(.875rem - 1px);
    position: relative;
    vertical-align: baseline;
    width: auto;
}
</style>