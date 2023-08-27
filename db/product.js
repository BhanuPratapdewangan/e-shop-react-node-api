
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:String,
    price:Number,
    userId:String,
    category:String,
    company:String
});

const productModel = mongoose.model('tblproducts', productSchema);

export default productModel;