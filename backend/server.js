require("dotenv").config();
const { createApp } = require("./src/app");

const app = createApp();
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`GST Reconciler backend chal raha hai: http://localhost:${PORT}`);
});
