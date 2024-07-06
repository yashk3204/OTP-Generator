import express from 'express';
import config from 'config';
import "./utils/dbConnect.js";
import router from './controllers/Users/index.js';

const app = express();
app.use(express.json());
const PORT = config.get("PORT") || 5007;

app.use('/users', router);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});