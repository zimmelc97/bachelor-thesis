<template>
    <div>
        <button @click="saveDataToFile">Download File</button>
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

</style>