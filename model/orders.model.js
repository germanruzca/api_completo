const mongoose = require('mongoose');
const User = require('./users.model');
const Product = require('./products.model');

const OrderSchema = new mongoose.Schema({
  iduser :{
    type: String,
    required: true
  },
  products: [
    {
      idproduct: String,
      title: String,
      price: Number,
      qty: Number
    }
  ],
  total: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  }
})

OrderSchema.pre('save', async function(next){
  if(this.isModified('products') || this.isNew) {
    const document = this;
    const idUser = document.iduser;
    const products = document.products;

    document.total = 0;
    let user;
    let promises = [];

    try {
      user = await User.findById(idUser);
    } catch (error) {
      next(new Error(`Error al buscar el usuario con id ${idUser}`));
    }

    try {
      if(products.length === 0) {
        next(new Error('No se han agregado productos'));
      }else {
        for(const product of products) {
          promises.push(await Product.findById(product.idproduct));
        }

        const resultPromises = await Promise.all(promises);
        resultPromises.forEach((product, index) => {
          document.total += product.price * document.products[index].qty;
          document.products[index].title = product.title;
          document.products[index].price = product.price;
        });
      }
    } catch (error) {
      next(new Error(`Informacion incompleta`));
    }
  } else next()
})

module.exports = mongoose.model('Order', OrderSchema);