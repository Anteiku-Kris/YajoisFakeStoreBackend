import app from './app';
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('¡Hola! Bienvenido a la API. Endpoints disponibles: /api/products, /api/categories');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});