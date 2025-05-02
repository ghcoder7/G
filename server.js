const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './backend/database.sqlite',
});

// Modelo de Usuário
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Modelo de Produto
const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
});

// Sincronizar modelos com o banco de dados
sequelize.sync().then(() => {
    console.log('Banco de dados sincronizado.');
    seedProducts(); // Adicionar produtos iniciais
});

// Adicionar produtos iniciais ao banco de dados
async function seedProducts() {
    const existingProducts = await Product.findAll();
    if (existingProducts.length === 0) {
        await Product.bulkCreate([
            {
                name: "Vivo Controle",
                description: "47 GB (20 GB + 5 GB na Portabilidade + 8 GB de Bônus + 14 GB adicionais por R$ 5).( DURAÇÃO 3 MESES.) ",
                price: 100.00,
            },
            {
                name: "Vivo Controle Entretenimento",
                description: "47 GB Assinatura Vivo Play App Inicial inclusa. ( DURAÇÃO 3 MESES.)",
                price: 105.00,
            },
        ]);
        console.log("Produtos iniciais adicionados ao banco de dados.");
    }
}

// Rotas

// Rota para listar produtos
app.get('/products', async (req, res) => {
    const products = await Product.findAll();
    res.status(200).json(products);
});

// Rota para adicionar um produto (opcional, para administração futura)
app.post('/products', async (req, res) => {
    const { name, description, price } = req.body;
    const newProduct = await Product.create({ name, description, price });
    res.status(201).json({ message: 'Produto criado com sucesso!', product: newProduct });
});

// Rota de cadastro
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
        return res.status(400).json({ error: 'Usuário já existe!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ username, password: hashedPassword });
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!', user: newUser });
});

// Rota de login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado!' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Senha incorreta!' });
    }

    res.status(200).json({ message: 'Login realizado com sucesso!' });
});

// Iniciar o servidor
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));