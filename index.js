const app = require ('./src/app');

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}...`);
});

